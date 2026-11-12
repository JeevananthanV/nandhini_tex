import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const coupon = await db.coupon.update({
    where: { id },
    data: {
      ...(body.code ? { code: body.code.toUpperCase().trim() } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.type ? { type: body.type } : {}),
      ...(body.value !== undefined ? { value: parseFloat(body.value) } : {}),
      ...(body.minCartValue !== undefined ? { minCartValue: parseFloat(body.minCartValue) } : {}),
      ...(body.usageLimit !== undefined ? { usageLimit: parseInt(body.usageLimit) } : {}),
      ...(body.perUserLimit !== undefined ? { perUserLimit: parseInt(body.perUserLimit) } : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
      ...(body.expiresAt ? { expiresAt: new Date(body.expiresAt) } : {}),
    },
  });
  return NextResponse.json({ coupon });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
