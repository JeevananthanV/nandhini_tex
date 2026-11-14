import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateOrderSchema, formatZodErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Validate id format
  if (!/^[a-z0-9]{1,50}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }
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
  // Validate id format
  if (!/^[a-z0-9]{1,50}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_FAILED", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }
  const { status, paymentStatus, note } = parsed.data;

  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let timeline: Array<{ status: string; timestamp: string; note: string }> = [];
  try { timeline = JSON.parse(existing.timeline); } catch { /* ignore */ }
  timeline.push({
    status: status || existing.status,
    timestamp: new Date().toISOString(),
    note: note || `Status updated to ${status || existing.status}`,
  });

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
