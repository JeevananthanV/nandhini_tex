import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toProductDetail, toReviewOut } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true, variants: true },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const reviews = await db.review.findMany({
    where: { productId: product.id, status: "approved" },
    orderBy: { featured: "desc", createdAt: "desc" },
  });

  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, status: "published" },
    include: { category: true, variants: true },
    take: 4,
  });

  return NextResponse.json({
    product: toProductDetail(product),
    reviews: reviews.map(toReviewOut),
    related: related.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      basePrice: p.basePrice,
      mrp: p.mrp,
      discountPct: p.discountPct,
      images: JSON.parse(p.images || "[]"),
      rating: p.rating,
      isBestseller: p.isBestseller,
      isNew: p.isNew,
      inStock: p.variants.some((v) => v.stockQty > 0),
    })),
  });
}
