import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/integrations/razorpay";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/razorpay/create-order
 *
 * Creates a Razorpay Order (server-to-server) that the customer pays against
 * in the Razorpay Checkout modal.
 *
 * Body: { orderId: string }
 * Response: { razorpayOrderId, amount (paise), currency, keyId, receipt }
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(req, RATE_LIMITS.couponValidate);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests — please try again later", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Online payments are not configured. Please use Cash on Delivery.", code: "PAYMENTS_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  let body: { orderId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  if (!orderId || !/^[A-Z0-9]{5,30}$/i.test(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { orderNumber: orderId },
    select: { id: true, orderNumber: true, grandTotal: true, status: true, paymentStatus: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus === "paid") {
    return NextResponse.json({ error: "Order is already paid" }, { status: 409 });
  }

  if (order.status === "cancelled") {
    return NextResponse.json({ error: "Order was cancelled" }, { status: 409 });
  }

  try {
    const razorpayOrder = await createRazorpayOrder(order.grandTotal, order.orderNumber);

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      receipt: razorpayOrder.receipt,
    });
  } catch (err) {
    console.error("[payments] Razorpay order creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create payment order. Please try again or use COD.", code: "PAYMENT_FAILED" },
      { status: 502 }
    );
  }
}
