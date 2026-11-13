import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeVariants, safeMrp, teaserFrom } from "@/lib/product-utils";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const title = String(body.title ?? "").trim();
    const categoryId = String(body.categoryId ?? "").trim();
    const description = String(body.description ?? "").trim();
    const basePriceNum = parseFloat(body.basePrice);

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: "Please choose a category." }, { status: 400 });
    }
    if (!Number.isFinite(basePriceNum) || basePriceNum <= 0) {
      return NextResponse.json(
        { error: "Base price must be a positive number." },
        { status: 400 }
      );
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Selected category does not exist." }, { status: 400 });
    }

    const mrpNum = safeMrp(body.mrp, basePriceNum);
    const discountPct = mrpNum > basePriceNum ? Math.round(((mrpNum - basePriceNum) / mrpNum) * 100) : 0;
    const images = Array.isArray(body.images)
      ? body.images.map((s: unknown) => String(s).trim()).filter(Boolean)
      : [];
    const variants = normalizeVariants(body.variants, existing.slug);

    // delete old variants and recreate
    await db.variant.deleteMany({ where: { productId: id } });

    const product = await db.product.update({
      where: { id },
      data: {
        title,
        description,
        shortDescription: teaserFrom(description, title),
        categoryId,
        basePrice: basePriceNum,
        mrp: mrpNum,
        discountPct,
        fabricType: body.fabricType ? String(body.fabricType).trim() || null : null,
        weaveOrigin: body.weaveOrigin ? String(body.weaveOrigin).trim() || null : null,
        zariType: body.zariType ? String(body.zariType).trim() || null : null,
        blouseIncluded: body.blouseIncluded !== false,
        images: JSON.stringify(images),
        status: ["draft", "published", "archived"].includes(body.status) ? body.status : "published",
        isBestseller: !!body.isBestseller,
        isNew: !!body.isNew,
        isFeatured: !!body.isFeatured,
        variants: { create: variants },
      },
      include: { variants: true },
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error("PUT /api/admin/products/[id] failed:", err);
    return NextResponse.json(
      { error: "Could not update the product. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    await db.product.delete({ where: { id } });

    // Keep the cached category product count accurate (never below zero).
    if (existing.categoryId) {
      const cat = await db.category.findUnique({ where: { id: existing.categoryId } });
      if (cat) {
        await db.category.update({
          where: { id: existing.categoryId },
          data: { productCount: Math.max(0, cat.productCount - 1) },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/products/[id] failed:", err);
    return NextResponse.json(
      { error: "Could not delete the product. Please try again." },
      { status: 500 }
    );
  }
}
