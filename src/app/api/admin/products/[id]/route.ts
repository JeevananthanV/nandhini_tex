import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { title, description, categoryId, basePrice, mrp, fabricType, weaveOrigin, zariType, blouseIncluded, images, status, isBestseller, isNew, isFeatured, variants } = body;

  const discountPct = mrp && basePrice && mrp > basePrice ? Math.round(((mrp - basePrice) / mrp) * 100) : 0;

  // delete old variants and recreate
  await db.variant.deleteMany({ where: { productId: id } });

  const product = await db.product.update({
    where: { id },
    data: {
      title,
      description: description || "",
      shortDescription: description?.split(". ")[0] + ".",
      categoryId,
      basePrice: parseFloat(basePrice),
      mrp: parseFloat(mrp),
      discountPct,
      fabricType: fabricType || null,
      weaveOrigin: weaveOrigin || null,
      zariType: zariType || null,
      blouseIncluded: blouseIncluded !== false,
      images: JSON.stringify(images || []),
      status: status || "published",
      isBestseller: !!isBestseller,
      isNew: !!isNew,
      isFeatured: !!isFeatured,
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

  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
