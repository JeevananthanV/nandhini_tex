import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toProductCard } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "popularity";
  const search = searchParams.get("q") || "";
  const minPrice = parseFloat(searchParams.get("minPrice") || "0");
  const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
  const fabric = searchParams.get("fabric") || "";
  const isNew = searchParams.get("isNew") === "true";
  const isBestseller = searchParams.get("isBestseller") === "true";
  const isFeatured = searchParams.get("isFeatured") === "true";
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 200);

  const where: Record<string, unknown> = { status: "published" };
  if (category) {
    if (category === "offer-sarees" || category === "offers") {
      where.discountPct = { gt: 0 };
    } else if (category === "dhotis" || category === "menswear") {
      where.OR = [
        { title: { contains: "Vesti" } },
        { title: { contains: "Shirt" } },
        { title: { contains: "Dhoti" } },
      ];
    } else {
      where.category = { slug: category };
    }
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { fabricType: { contains: search } },
      { weaveOrigin: { contains: search } },
    ];
  }
  if (minPrice > 0 || maxPrice > 0) {
    where.basePrice = {};
    if (minPrice > 0) (where.basePrice as Record<string, unknown>).gte = minPrice;
    if (maxPrice > 0) (where.basePrice as Record<string, unknown>).lte = maxPrice;
  }
  if (fabric) where.fabricType = { contains: fabric };
  if (isNew) where.isNew = true;
  if (isBestseller) where.isBestseller = true;
  if (isFeatured) where.isFeatured = true;

  let orderBy: Record<string, "asc" | "desc">[] | Record<string, "asc" | "desc"> = { createdAt: "desc" };
  if (sort === "price-low") orderBy = { basePrice: "asc" };
  else if (sort === "price-high") orderBy = { basePrice: "desc" };
  else if (sort === "newest") orderBy = { createdAt: "desc" };
  else if (sort === "rating") orderBy = { rating: "desc" };
  else orderBy = [{ isBestseller: "desc" }, { createdAt: "desc" }];

  const products = await db.product.findMany({
    where,
    include: { category: true, variants: true },
    orderBy,
    take: limit,
  });

  return NextResponse.json({ products: products.map(toProductCard) });
}
