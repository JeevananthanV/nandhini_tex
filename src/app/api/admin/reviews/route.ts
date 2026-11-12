import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") || "";

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;

  const reviews = await db.review.findMany({
    where,
    include: { product: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ reviews });
}
