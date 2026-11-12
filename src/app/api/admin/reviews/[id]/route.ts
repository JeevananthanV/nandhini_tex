import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (body.status) update.status = body.status;
  if (body.featured !== undefined) update.featured = body.featured;
  if (body.helpfulCount !== undefined) update.helpfulCount = body.helpfulCount;

  const review = await db.review.update({ where: { id }, data: update });

  // if approving, recompute product rating
  if (body.status === "approved" || body.status === "rejected") {
    const approved = await db.review.findMany({ where: { productId: review.productId, status: "approved" } });
    if (approved.length > 0) {
      const avg = approved.reduce((s, r) => s + r.rating, 0) / approved.length;
      await db.product.update({ where: { id: review.productId }, data: { rating: Math.round(avg * 10) / 10, reviewCount: approved.length } });
    }
  }

  return NextResponse.json({ review });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
