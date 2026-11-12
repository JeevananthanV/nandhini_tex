import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const coupon = await db.coupon.create({
    data: {
      code: body.code.toUpperCase().trim(),
      description: body.description || null,
      type: body.type,
      value: parseFloat(body.value),
      minCartValue: parseFloat(body.minCartValue || 0),
      usageLimit: parseInt(body.usageLimit || 0),
      perUserLimit: parseInt(body.perUserLimit || 1),
      active: body.active !== false,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });
  return NextResponse.json({ coupon });
}
