import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...order,
    items: JSON.parse(order.items),
    shippingAddress: JSON.parse(order.shippingAddress),
    courier: JSON.parse(order.courier),
    timeline: JSON.parse(order.timeline),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, paymentStatus, note } = await req.json();

  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const timeline = JSON.parse(existing.timeline);
  timeline.push({ status: status || existing.status, timestamp: new Date().toISOString(), note: note || `Status updated to ${status}` });

  const order = await db.order.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      timeline: JSON.stringify(timeline),
    },
  });

  return NextResponse.json({ order });
}
