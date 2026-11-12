import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toProductDetail } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (category) where.categoryId = category;
  if (search) {
    where.OR = [{ title: { contains: search } }, { slug: { contains: search } }];
  }

  const products = await db.product.findMany({
    where,
    include: { category: true, variants: true, _count: { select: { reviews: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      ...toProductDetail(p),
      reviewCountActual: p._count.reviews,
      totalStock: p.variants.reduce((s, v) => s + v.stockQty, 0),
      status: p.status,
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, categoryId, basePrice, mrp, fabricType, weaveOrigin, zariType, blouseIncluded, images, status, isBestseller, isNew, isFeatured, variants } = body;

  const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const discountPct = mrp > basePrice ? Math.round(((mrp - basePrice) / mrp) * 100) : 0;

  const product = await db.product.create({
    data: {
      slug,
      title,
      description: description || "",
      shortDescription: description?.split(". ")[0] + ".",
      categoryId,
      status: status || "draft",
      basePrice: parseFloat(basePrice),
      mrp: parseFloat(mrp),
      discountPct,
      fabricType: fabricType || null,
      weaveOrigin: weaveOrigin || null,
      zariType: zariType || null,
      blouseIncluded: blouseIncluded !== false,
      images: JSON.stringify(images || []),
      tags: JSON.stringify([]),
      isBestseller: !!isBestseller,
      isNew: !!isNew,
      isFeatured: !!isFeatured,
      careInstructions: "Dry clean only. Store wrapped in muslin cloth.",
      variants: {
        create: (variants || []).map((v: { color: string; colorHex?: string; size?: string; sku: string; stockQty: number }) => ({
          color: v.color,
          colorHex: v.colorHex || null,
          size: v.size || null,
          sku: v.sku,
          stockQty: parseInt(v.stockQty) || 0,
        })),
      },
    },
    include: { variants: true },
  });

  await db.category.update({ where: { id: categoryId }, data: { productCount: { increment: 1 } } });
  return NextResponse.json({ product });
}
