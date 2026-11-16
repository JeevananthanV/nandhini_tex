import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRazorpaySignature, fetchRazorpayPayment } from "@/lib/integrations/razorpay";
import { sendEmail, renderOrderConfirmationEmail } from "@/lib/integrations/resend";
import { sendOrderConfirmationSMS } from "@/lib/integrations/msg91";
import { captureException } from "@/lib/integrations/sentry";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/razorpay/verify
 *
 * Verifies the Razorpay payment signature returned by the Checkout modal.
 * If valid, marks the order as paid and sends confirmation email + SMS.
 *
 * Body: {
 *   razorpayOrderId, razorpayPaymentId, razorpaySignature, orderNumber
 * }
 */
export async function POST(req: NextRequest) {
  let body: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    orderNumber?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderNumber } = body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderNumber) {
    return NextResponse.json(
      { error: "Missing required fields", code: "VALIDATION_FAILED" },
      { status: 400 }
    );
  }

  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    console.error("[payments] Invalid Razorpay signature for order:", orderNumber);
    return NextResponse.json(
      { error: "Payment verification failed — signature mismatch", code: "INVALID_SIGNATURE" },
      { status: 400 }
    );
  }

  try {
    const payment = await fetchRazorpayPayment(razorpayPaymentId);
    if (payment.status !== "captured") {
      return NextResponse.json(
        { error: `Payment not captured (status: ${payment.status})`, code: "PAYMENT_NOT_CAPTURED" },
        { status: 402 }
      );
    }

    // Fetch existing timeline first
    const existing = await db.order.findUnique({
      where: { orderNumber },
      select: { timeline: true },
    });
    let timeline: Array<{ status: string; timestamp: string; note: string }> = [];
    try { timeline = JSON.parse(existing?.timeline || "[]"); } catch { /* ignore */ }
    timeline.push({
      status: "confirmed",
      timestamp: new Date().toISOString(),
      note: `Payment captured via Razorpay (${payment.method})`,
    });

    const order = await db.order.update({
      where: { orderNumber },
      data: {
        paymentStatus: "paid",
        status: "confirmed",
        timeline: JSON.stringify(timeline),
      },
      select: {
        id: true, orderNumber: true, customerName: true, customerPhone: true, customerEmail: true,
        subtotal: true, discount: true, shippingFee: true, codSurcharge: true, grandTotal: true,
        paymentMethod: true, items: true, shippingAddress: true,
      },
    });

    // Send confirmation email (async, non-blocking — don't fail the response if email fails)
    if (order.customerEmail) {
      const items = JSON.parse(order.items) as Array<{ title: string; qty: number; price: number; image?: string }>;
      const addr = JSON.parse(order.shippingAddress) as { name: string; line1: string; city: string; state: string; pincode: string };
      sendEmail({
        to: order.customerEmail,
        subject: `Order Confirmed — ${order.orderNumber}`,
        html: renderOrderConfirmationEmail({
          orderId: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          items,
          subtotal: order.subtotal,
          discount: order.discount,
          shippingFee: order.shippingFee,
          codSurcharge: order.codSurcharge,
          grandTotal: order.grandTotal,
          paymentMethod: order.paymentMethod,
          shippingAddress: addr,
          estimatedDelivery: "3–6 business days",
        }),
      }).catch((e) => captureException(e, { orderNumber }));
    }

    // Send confirmation SMS (async, non-blocking)
    sendOrderConfirmationSMS(
      order.customerName,
      order.customerPhone,
      order.orderNumber,
      order.grandTotal,
      `${process.env.NEXT_PUBLIC_SITE_URL || ""}/?view=track&q=${order.orderNumber}`,
    ).catch((e) => captureException(e, { orderNumber }));

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      paymentMethod: payment.method,
      paymentId: razorpayPaymentId,
    });
  } catch (err) {
    console.error("[payments] Razorpay verification error:", err);
    await captureException(err as Error, { orderNumber, razorpayPaymentId });
    return NextResponse.json(
      { error: "Payment verification failed — please contact support", code: "VERIFICATION_ERROR" },
      { status: 500 }
    );
  }
}
