import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateCouponSchema, formatZodErrors } from "@/lib/validation";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Rate limit — 20 attempts per minute per IP (brute-force coupon codes)
  const rl = rateLimit(req, RATE_LIMITS.couponValidate);
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

  const parsed = validateCouponSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { valid: false, message: "Enter a coupon code", code: "VALIDATION_FAILED", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }
  const { code, cartValue } = parsed.data;

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
