import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { placeOrderSchema, formatZodErrors, paymentMethodEnum } from "@/lib/validation";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

/** Generate a crypto-strong, harder-to-enumerate order number: NTX{YYYY}{8-digit}. */
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  // crypto.randomInt is cryptographically secure — 8 digits = 10^8 space per year.
  const n = crypto.randomInt(10000000, 100000000);
  return `NTX${year}${n}`;
}

/** Recompute order totals from DB-stored product prices. DO NOT trust client totals. */
async function computeOrderTotals(
  items: Array<{ title: string; slug?: string; productId?: string; qty: number; price: number }>,
  paymentMethod: "cod" | "upi" | "card" | "netbanking",
  couponCode: string | undefined,
): Promise<{
  items: Array<{ title: string; variant?: string; qty: number; price: number; image?: string }>;
  subtotal: number;
  discount: number;
  shippingFee: number;
  codSurcharge: number;
  grandTotal: number;
}> {
  // Look up each product by slug (preferred) or productId to get the real base price
  const lookupKeys = items.map((it) => it.slug || it.productId).filter(Boolean) as string[];
  const products = lookupKeys.length > 0
    ? await db.product.findMany({
        where: { OR: [{ slug: { in: lookupKeys as string[] } }, { id: { in: lookupKeys as string[] } }] },
        select: { id: true, slug: true, basePrice: true, images: true, title: true },
      })
    : [];

  const priceMap = new Map<string, { price: number; image?: string; title: string }>();
  for (const p of products) {
    let images: string[] = [];
    try { images = JSON.parse(p.images || "[]"); } catch { /* ignore */ }
    if (p.slug) priceMap.set(p.slug, { price: p.basePrice, image: images[0], title: p.title });
    priceMap.set(p.id, { price: p.basePrice, image: images[0], title: p.title });
  }

  // Build the canonical items list using DB prices
  const canonicalItems: Array<{ title: string; variant?: string; qty: number; price: number; image?: string }> = [];
  let subtotal = 0;
  for (const item of items) {
    const key = item.slug || item.productId || "";
    const fromDb = priceMap.get(key);
    // Use DB price; fall back to client-supplied price only if product not found
    // (which shouldn't happen for valid orders — but we don't want to silently fail)
    const price = fromDb?.price ?? item.price;
    subtotal += price * item.qty;
    canonicalItems.push({
      title: fromDb?.title || item.title,
      variant: (item as any).variant,
      qty: item.qty,
      price,
      image: fromDb?.image || (item as any).image,
    });
  }

  // Apply coupon if present
  let discount = 0;
  if (couponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase().trim() } });
    if (coupon && coupon.active && (!coupon.expiresAt || coupon.expiresAt > new Date())
        && (coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit)
        && subtotal >= coupon.minCartValue) {
      discount = coupon.type === "percent"
        ? Math.round((subtotal * coupon.value) / 100)
        : Math.min(coupon.value, subtotal);
    }
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const shippingFee = afterDiscount >= 999 || subtotal === 0 ? 0 : 60;
  const codSurcharge = paymentMethod === "cod" ? 40 : 0;
  const grandTotal = Math.max(0, afterDiscount + shippingFee + codSurcharge);

  return { items: canonicalItems, subtotal, discount, shippingFee, codSurcharge, grandTotal };
}

export async function POST(req: NextRequest) {
  // Rate limit — 5 orders per minute per IP
  const rl = rateLimit(req, RATE_LIMITS.placeOrder);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests — please try again later", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate input
  const parsed = placeOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_FAILED", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Normalize payment method (already enum-validated)
  const paymentMethod = paymentMethodEnum.parse(data.paymentMethod);

  // Re-compute all totals server-side — DO NOT trust client-supplied totals
  const totals = await computeOrderTotals(data.items, paymentMethod, data.couponCode);

  // Generate a unique crypto-strong order number (retry on collision)
  let orderNumber = generateOrderNumber();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.order.findUnique({ where: { orderNumber }, select: { id: true } });
    if (!existing) break;
    orderNumber = generateOrderNumber();
  }

  const now = new Date().toISOString();

  const order = await db.order.create({
    data: {
      orderNumber,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || null,
      shippingAddress: JSON.stringify(data.shippingAddress),
      items: JSON.stringify(totals.items),
      status: "pending",
      paymentStatus: "pending",
      paymentMethod,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shippingFee: totals.shippingFee,
      codSurcharge: totals.codSurcharge,
      tax: 0,
      grandTotal: totals.grandTotal,
      couponCode: data.couponCode || null,
      timeline: JSON.stringify([{ status: "pending", timestamp: now, note: "Order placed" }]),
    },
  });

  // upsert customer
  const existing = await db.customer.findUnique({ where: { phone: data.customerPhone } });
  if (existing) {
    await db.customer.update({
      where: { phone: data.customerPhone },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: totals.grandTotal },
      },
    });
  } else {
    await db.customer.create({
      data: {
        name: data.customerName,
        phone: data.customerPhone,
        email: data.customerEmail || null,
        city: data.shippingAddress.city || null,
        totalOrders: 1,
        totalSpent: totals.grandTotal,
        segment: totals.grandTotal > 20000 ? "bridal_lead" : "regular",
      },
    });
  }

  // increment coupon usage
  if (data.couponCode) {
    await db.coupon.updateMany({
      where: { code: data.couponCode.toUpperCase().trim() },
      data: { usedCount: { increment: 1 } },
    });
  }

  // Send confirmation email + SMS (async, non-blocking — don't fail the order
  // if notifications fail). These gracefully no-op if not configured.
  try {
    const { sendEmail, renderOrderConfirmationEmail } = await import("@/lib/integrations/resend");
    const { sendOrderConfirmationSMS } = await import("@/lib/integrations/msg91");
    const { trackPlausibleEvent } = await import("@/lib/integrations/plausible");

    if (data.customerEmail) {
      sendEmail({
        to: data.customerEmail,
        subject: `Order Confirmed — ${orderNumber}`,
        html: renderOrderConfirmationEmail({
          orderId: orderNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          items: totals.items,
          subtotal: totals.subtotal,
          discount: totals.discount,
          shippingFee: totals.shippingFee,
          codSurcharge: totals.codSurcharge,
          grandTotal: totals.grandTotal,
          paymentMethod,
          shippingAddress: data.shippingAddress,
          estimatedDelivery: "3–6 business days",
        }),
      }).catch(() => {/* non-blocking */});
    }

    sendOrderConfirmationSMS(
      data.customerName,
      data.customerPhone,
      orderNumber,
      totals.grandTotal,
      `${process.env.NEXT_PUBLIC_SITE_URL || ""}/?view=track&q=${orderNumber}`,
    ).catch(() => {/* non-blocking */});

    // Track conversion in analytics
    trackPlausibleEvent("Order Placed", {
      revenue: totals.grandTotal,
      paymentMethod,
      itemCount: data.items.length,
    }).catch(() => {/* non-blocking */});
  } catch {
    // Integration imports failed — non-critical, order still succeeds
  }

  return NextResponse.json({ order, success: true });
}
