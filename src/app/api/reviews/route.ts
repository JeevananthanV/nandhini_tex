import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toReviewOut } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ reviews: [] });
  const reviews = await db.review.findMany({
    where: { productId, status: "approved" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ reviews: reviews.map(toReviewOut) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, authorName, authorCity, authorEmail, rating, title, body: reviewBody } = body;
  if (!productId || !authorName || !rating || !title || !reviewBody) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const review = await db.review.create({
    data: {
      productId,
      authorName,
      authorCity: authorCity || null,
      authorEmail: authorEmail || null,
      rating: parseInt(rating),
      title,
      body: reviewBody,
      status: "pending",
      verified: false,
    },
  });
  return NextResponse.json({ review: toReviewOut(review) });
}
