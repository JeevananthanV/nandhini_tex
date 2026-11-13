import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type TimelineEntry = { status: string; timestamp: string; note: string };

// Public-facing order lookup: by order number (NTX2025xxxx) or 10-digit phone.
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const isPhone = /^\d{10}$/.test(q);
  let orders: Awaited<ReturnType<typeof db.order.findMany>> = [];

  try {
    if (isPhone) {
      orders = await db.order.findMany({
        where: { customerPhone: q },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    } else {
      const normalized = q.toUpperCase();
      // exact order number first (NTX2025xxxx), then partial match fallback
      orders = await db.order.findMany({
        where: {
          OR: [{ orderNumber: normalized }, { orderNumber: { contains: normalized } }],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
    }

    return NextResponse.json({
      orders: orders.map((o) => {
        let items: { title: string; variant?: string; qty: number; price: number; image?: string }[] = [];
        let timeline: TimelineEntry[] = [];
        let courier: { name?: string; awb?: string; trackingUrl?: string } = {};
        let address: Record<string, string> = {};
        try { items = JSON.parse(o.items || "[]"); } catch { /* ignore */ }
        try { timeline = JSON.parse(o.timeline || "[]"); } catch { /* ignore */ }
        try { courier = JSON.parse(o.courier || "{}"); } catch { /* ignore */ }
        try { address = JSON.parse(o.shippingAddress || "{}"); } catch { /* ignore */ }
        return {
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          subtotal: o.subtotal,
          discount: o.discount,
          shippingFee: o.shippingFee,
          codSurcharge: o.codSurcharge,
          grandTotal: o.grandTotal,
          couponCode: o.couponCode,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          items,
          timeline,
          courier,
          address,
        };
      }),
    });
  } catch (err) {
    console.error("order track error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
