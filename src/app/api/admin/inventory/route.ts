import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/inventory — returns all variants with product info for inventory management
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const filter = searchParams.get("filter") || "all"; // all | low | out | instock
  const search = searchParams.get("q") || "";
  const categoryId = searchParams.get("category") || "";

  const products = await db.product.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(search ? { OR: [{ title: { contains: search } }, { slug: { contains: search } }] } : {}),
    },
    include: {
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // flatten into variant rows
  let rows = products.flatMap((p) =>
    p.variants.map((v) => ({
      id: v.id,
      productId: p.id,
      productTitle: p.title,
      slug: p.slug,
      images: JSON.parse(p.images || "[]"),
      category: p.category.name,
      categoryName: p.category.name,
      color: v.color,
      colorHex: v.colorHex,
      size: v.size,
      sku: v.sku,
      stockQty: v.stockQty,
      priceOverride: v.priceOverride,
      basePrice: p.basePrice,
      mrp: p.mrp,
      status: p.status,
      updatedAt: v.id, // no updatedAt on variant, use id as key
    }))
  );

  // apply stock filter
  if (filter === "low") rows = rows.filter((r) => r.stockQty > 0 && r.stockQty < 5);
  else if (filter === "out") rows = rows.filter((r) => r.stockQty === 0);
  else if (filter === "instock") rows = rows.filter((r) => r.stockQty > 0);

  // summary stats
  const totalVariants = rows.length;
  const totalUnits = rows.reduce((s, r) => s + r.stockQty, 0);
  const lowStockCount = rows.filter((r) => r.stockQty > 0 && r.stockQty < 5).length;
  const outOfStockCount = rows.filter((r) => r.stockQty === 0).length;
  const totalStockValue = rows.reduce((s, r) => s + r.stockQty * (r.priceOverride || r.basePrice), 0);

  return NextResponse.json({
    summary: {
      totalVariants,
      totalUnits,
      lowStockCount,
      outOfStockCount,
      totalStockValue,
    },
    rows,
  });
}
