import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, customerPhone, customerEmail, shippingAddress, items, paymentMethod, subtotal, discount, shippingFee, codSurcharge, grandTotal, couponCode } = body;

  if (!customerName || !customerPhone || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const orderNum = `NTX${new Date().getFullYear()}${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const now = new Date().toISOString();

  const order = await db.order.create({
    data: {
      orderNumber: orderNum,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      shippingAddress: JSON.stringify(shippingAddress || {}),
      items: JSON.stringify(items),
      status: "pending",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      paymentMethod: paymentMethod || "cod",
      subtotal: subtotal || 0,
      discount: discount || 0,
      shippingFee: shippingFee || 0,
      codSurcharge: codSurcharge || 0,
      tax: 0,
      grandTotal: grandTotal || 0,
      couponCode: couponCode || null,
      timeline: JSON.stringify([{ status: "pending", timestamp: now, note: "Order placed" }]),
    },
  });

  // upsert customer
  if (customerPhone) {
    const existing = await db.customer.findUnique({ where: { phone: customerPhone } });
    if (existing) {
      await db.customer.update({
        where: { phone: customerPhone },
        data: { totalOrders: { increment: 1 }, totalSpent: { increment: grandTotal || 0 } },
      });
    } else {
      await db.customer.create({
        data: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail || null,
          city: shippingAddress?.city || null,
          totalOrders: 1,
          totalSpent: grandTotal || 0,
          segment: grandTotal > 20000 ? "bridal_lead" : "regular",
        },
      });
    }
  }

  // increment coupon usage
  if (couponCode) {
    await db.coupon.updateMany({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } });
  }

  return NextResponse.json({ order, success: true });
}
