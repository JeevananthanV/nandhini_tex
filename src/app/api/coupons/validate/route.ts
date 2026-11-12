import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { code, cartValue } = await req.json();
  if (!code) return NextResponse.json({ valid: false, message: "Enter a coupon code" });

  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });
  if (!coupon) return NextResponse.json({ valid: false, message: "Invalid coupon code" });
  if (!coupon.active) return NextResponse.json({ valid: false, message: "This coupon is no longer active" });

  const now = new Date();
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return NextResponse.json({ valid: false, message: "This coupon has expired" });
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ valid: false, message: "This coupon has reached its usage limit" });
  }
  if (cartValue < coupon.minCartValue) {
    return NextResponse.json({ valid: false, message: `Minimum cart value ₹${coupon.minCartValue} required` });
  }

  return NextResponse.json({
    valid: true,
    coupon: { code: coupon.code, type: coupon.type, value: coupon.value, description: coupon.description },
  });
}
