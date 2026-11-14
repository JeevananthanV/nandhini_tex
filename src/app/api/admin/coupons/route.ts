import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCouponSchema, updateCouponSchema, formatZodErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createCouponSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_FAILED", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }
  const data = parsed.data;

  try {
    const coupon = await db.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        description: data.description || null,
        type: data.type,
        value: data.value,
        minCartValue: data.minCartValue,
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit,
        active: data.active,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    return NextResponse.json({ coupon });
  } catch (err) {
    // Prisma unique constraint violation on `code` → 409 instead of 500
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "A coupon with this code already exists", code: "DUPLICATE_CODE" },
        { status: 409 }
      );
    }
    throw err;
  }
}
