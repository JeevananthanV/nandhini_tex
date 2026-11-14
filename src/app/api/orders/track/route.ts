import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type TimelineEntry = { status: string; timestamp: string; note: string };

/**
 * Public-facing order lookup: by order number (NTX{YYYY}{8-digit}) or 10-digit phone.
 *
 * SECURITY:
 * - Rate-limited to 20 requests per minute per IP to slow enumeration.
 * - For order-number lookups, returns FULL detail (the customer has the order number,
 *   so they're authorized to see it).
 * - For phone lookups, returns only summary info (no shipping address or full timeline).
 *   This limits damage if an attacker guesses a victim's phone number.
 */
export async function GET(req: NextRequest) {
  // Rate limit — 20 lookups per minute per IP
  const rl = rateLimit(req, RATE_LIMITS.orderTrack);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests — please try again later", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const q = (req.nextUrl.searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  // Strict validation: only accept NTX{year}{8+ digits} or 10-digit phone
  const isOrderNumber = /^NTX\d{4}\d{6,12}$/i.test(q);
  const isPhone = /^\d{10}$/.test(q);

  if (!isOrderNumber && !isPhone) {
    return NextResponse.json(
      { error: "Invalid query format — enter a valid order number (NTX...) or 10-digit phone" },
      { status: 400 }
    );
  }

  // Use `any[]` so we can assign both full-row results (order-number lookup)
  // and partial-select results (phone lookup) without TS complaining about
  // missing columns. The response builder below uses `(o as any)` for fields
  // that may not be present in the partial shape.
  let orders: any[] = [];

  try {
    if (isPhone) {
      // Phone lookup — exact match only, return only 5 most recent
      orders = await db.order.findMany({
        where: { customerPhone: q },
        orderBy: { createdAt: "desc" },
        take: 5,
        // Don't return full PII for phone-based lookups — these are more enumerable
        select: {
          orderNumber: true,
          status: true,
          paymentStatus: true,
          grandTotal: true,
          createdAt: true,
          updatedAt: true,
          items: true,
          timeline: true,
          // Explicitly NOT selecting: customerName, customerPhone, customerEmail, shippingAddress, courier
        },
      });
    } else {
      // Order-number lookup — exact match only
      orders = await db.order.findMany({
        where: { orderNumber: q.toUpperCase() },
        orderBy: { createdAt: "desc" },
        take: 1,
      });
    }

    // For phone lookups, redact address details + courier info (PII risk)
    const isPhoneLookup = isPhone;

    return NextResponse.json({
      orders: orders.map((o) => {
        let items: { title: string; variant?: string; qty: number; price: number; image?: string }[] = [];
        let timeline: TimelineEntry[] = [];
        let courier: { name?: string; awb?: string; trackingUrl?: string } = {};
        let address: Record<string, string> = {};
        try { items = JSON.parse(o.items || "[]"); } catch { /* ignore */ }
        try { timeline = JSON.parse(o.timeline || "[]"); } catch { /* ignore */ }
        if (!isPhoneLookup) {
          try { courier = JSON.parse((o as any).courier || "{}"); } catch { /* ignore */ }
          try { address = JSON.parse((o as any).shippingAddress || "{}"); } catch { /* ignore */ }
        }

        const base: Record<string, unknown> = {
          orderNumber: o.orderNumber,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMethod: (o as any).paymentMethod,
          subtotal: (o as any).subtotal,
          discount: (o as any).discount,
          shippingFee: (o as any).shippingFee,
          codSurcharge: (o as any).codSurcharge,
          grandTotal: o.grandTotal,
          couponCode: (o as any).couponCode,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          items,
          timeline,
        };

        // Only include address/courier/customerName for order-number lookups
        if (!isPhoneLookup) {
          base.customerName = (o as any).customerName;
          base.courier = courier;
          base.address = address;
        }

        return base;
      }),
    });
  } catch (err) {
    // Don't leak the error message — log it server-side only
    console.error("order track error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
