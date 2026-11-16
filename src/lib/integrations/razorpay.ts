/**
 * Razorpay integration — India's leading payment gateway.
 *
 * Supports UPI, cards, netbanking, wallets, EMI. Set up at
 * https://dashboard.razorpay.com.
 *
 * Flow:
 * 1. Frontend calls POST /api/payments/razorpay/create-order to get an order_id
 * 2. Razorpay Checkout modal opens (script: https://checkout.razorpay.com/v1/checkout.js)
 * 3. Customer pays; Razorpay returns a `razorpay_payment_id`
 * 4. Frontend posts the payment_id + order_id + signature to our webhook
 * 5. We verify the signature with our key_secret and mark the order paid
 *
 * Environment variables:
 * - RAZORPAY_KEY_ID     — public key (starts with `rzr_`)
 * - RAZORPAY_KEY_SECRET — secret key (keep server-side only!)
 * - RAZORPAY_WEBHOOK_SECRET — for verifying webhook signatures (optional if
 *   you only do client-side verification)
 *
 * Test mode: use cards like 4111 1111 1111 1111, any expiry, any CVV.
 */

import crypto from "node:crypto";

export type RazorpayOrder = {
  id: string;
  entity: "order";
  amount: number; // in paise (₹1 = 100 paise)
  amount_paid: number;
  amount_due: number;
  currency: "INR";
  receipt: string;
  status: "created" | "attempted" | "paid";
  created_at: number;
};

export type RazorpayConfig = {
  keyId: string;
  keySecret: string;
};

/** Get the Razorpay config from env. Returns null if not configured. */
export function getRazorpayConfig(): RazorpayConfig | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

/** Whether Razorpay is configured (used to show/hide the "Pay Online" option). */
export function isRazorpayConfigured(): boolean {
  return getRazorpayConfig() !== null;
}

const RAZORPAY_API = "https://api.razorpay.com/v1";

/** Convert rupees to paise (Razorpay's smallest unit). */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Convert paise back to rupees. */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Create a Razorpay Order (server-to-server).
 *
 * The customer pays against this order_id in the Razorpay Checkout modal.
 * After payment, verify the signature in the webhook.
 *
 * @param amountInRupees - order total in INR
 * @param receipt - your internal order number (e.g. "NTX2025123401")
 */
export async function createRazorpayOrder(
  amountInRupees: number,
  receipt: string,
): Promise<RazorpayOrder> {
  const cfg = getRazorpayConfig();
  if (!cfg) throw new Error("Razorpay not configured — set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET");

  const auth = Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString("base64");
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: rupeesToPaise(amountInRupees),
      currency: "INR",
      receipt,
      payment_capture: 1, // auto-capture (no 2-step manual capture needed)
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay order creation failed: ${err}`);
  }

  return (await res.json()) as RazorpayOrder;
}

/**
 * Verify the payment signature returned by Razorpay Checkout.
 *
 * @param orderId - the Razorpay order_id (rzr_...)
 * @param paymentId - the razorpay_payment_id returned after payment
 * @param signature - the razorpay_signature returned after payment
 * @returns true if the signature is valid (payment is authentic)
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const cfg = getRazorpayConfig();
  if (!cfg) return false;

  // Razorpay signs HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", cfg.keySecret).update(payload).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

/**
 * Fetch a payment by ID (to verify status server-side after webhook).
 */
export async function fetchRazorpayPayment(paymentId: string): Promise<{
  id: string;
  status: "captured" | "failed" | "refunded";
  amount: number; // paise
  method: "upi" | "card" | "netbanking" | "wallet" | "emi";
}> {
  const cfg = getRazorpayConfig();
  if (!cfg) throw new Error("Razorpay not configured");
  const auth = Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString("base64");
  const res = await fetch(`${RAZORPAY_API}/payments/${paymentId}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error(`Razorpay payment fetch failed: ${await res.text()}`);
  return await res.json();
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}
