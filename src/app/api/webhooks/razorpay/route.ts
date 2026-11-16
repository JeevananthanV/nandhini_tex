import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay webhook receiver — handles async payment events.
 *
 * Razorpay sends webhooks for:
 * - payment.captured (most common — payment succeeded)
 * - payment.failed
 * - refund.processed
 * - order.paid
 *
 * Setup:
 * 1. Go to Razorpay Dashboard → Webhooks → Add Webhook
 * 2. URL: https://yourdomain.com/api/webhooks/razorpay
 * 3. Select events: payment.captured, payment.failed, refund.processed
 * 4. Copy the Webhook Secret → set RAZORPAY_WEBHOOK_SECRET env var
 *
 * This endpoint verifies the webhook signature to prevent spoofing.
 */

type RazorpayWebhookEvent = {
  entity: "event";
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        status: "captured" | "failed" | "refunded";
        amount: number; // paise
        method: string;
        email?: string;
        contact?: string;
      };
    };
    order?: {
      entity: {
        id: string;
        status: string;
        receipt: string; // our internal order number
        amount_paid: number;
        amount_due: number;
      };
    };
    refund?: {
      entity: {
        id: string;
        payment_id: string;
        amount: number;
        status: string;
      };
    };
  };
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // Read the raw body for signature verification
  const rawBody = await req.text();

  // Verify the webhook signature
  // Razorpay signs HMAC-SHA256(rawBody, webhook_secret)
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature || !webhookSecret) {
    // If webhook secret isn't configured, we can't verify — reject
    console.error("[webhook] Razorpay webhook secret not configured or signature missing");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const expectedSig = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expectedSig, "hex");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    console.error("[webhook] Invalid Razorpay webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Parse the verified body
  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log(`[webhook] Razorpay event: ${event.event}`);

  try {
    switch (event.event) {
      case "payment.captured":
      case "order.paid": {
        // Get the order receipt (our internal order number)
        const orderEntity = event.payload.order?.entity;
        const paymentEntity = event.payload.payment?.entity;

        if (!orderEntity?.receipt) {
          console.error("[webhook] No receipt in webhook payload");
          break;
        }

        const orderNumber = orderEntity.receipt;

        // Fetch existing timeline
        const existing = await db.order.findUnique({
          where: { orderNumber },
          select: { id: true, paymentStatus: true, status: true, timeline: true },
        });

        if (!existing) {
          console.error(`[webhook] Order ${orderNumber} not found`);
          break;
        }

        // Skip if already paid (idempotency — Razorpay may retry webhooks)
        if (existing.paymentStatus === "paid") {
          console.log(`[webhook] Order ${orderNumber} already marked paid — skipping`);
          break;
        }

        // Build timeline entry
        let timeline: Array<{ status: string; timestamp: string; note: string }> = [];
        try { timeline = JSON.parse(existing.timeline); } catch { /* ignore */ }
        timeline.push({
          status: "confirmed",
          timestamp: new Date().toISOString(),
          note: `Payment captured via Razorpay webhook (${paymentEntity?.method || "unknown"})`,
        });

        await db.order.update({
          where: { orderNumber },
          data: {
            paymentStatus: "paid",
            status: existing.status === "cancelled" ? "cancelled" : "confirmed",
            timeline: JSON.stringify(timeline),
          },
        });

        console.log(`[webhook] Order ${orderNumber} marked as paid`);
        break;
      }

      case "payment.failed": {
        const orderEntity = event.payload.order?.entity;
        if (orderEntity?.receipt) {
          const existing = await db.order.findUnique({
            where: { orderNumber: orderEntity.receipt },
            select: { timeline: true, status: true },
          });
          if (existing && existing.status !== "cancelled") {
            let timeline: Array<{ status: string; timestamp: string; note: string }> = [];
            try { timeline = JSON.parse(existing.timeline); } catch { /* ignore */ }
            timeline.push({
              status: "payment_failed",
              timestamp: new Date().toISOString(),
              note: "Payment failed via Razorpay",
            });
            await db.order.update({
              where: { orderNumber: orderEntity.receipt },
              data: { paymentStatus: "failed", timeline: JSON.stringify(timeline) },
            });
            console.log(`[webhook] Order ${orderEntity.receipt} payment failed`);
          }
        }
        break;
      }

      case "refund.processed": {
        const refund = event.payload.refund?.entity;
        if (refund?.payment_id) {
          // Find the order by the payment ID — we'd need to store razorpay_payment_id
          // For now, just log it
          console.log(`[webhook] Refund processed: ${refund.id} for payment ${refund.payment_id}`);
        }
        break;
      }

      default:
        console.log(`[webhook] Unhandled Razorpay event: ${event.event}`);
    }

    // Always return 200 to Razorpay so they don't retry
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] Razorpay webhook handler error:", err);
    // Return 500 so Razorpay retries
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
