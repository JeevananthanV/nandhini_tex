import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toProductDetail } from "@/lib/format";
import { normalizeVariants, safeMrp, teaserFrom, uniqueSlug } from "@/lib/product-utils";

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
  try {
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

    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Selected category does not exist." }, { status: 400 });
    }

    const mrpNum = safeMrp(body.mrp, basePriceNum);
    const discountPct = mrpNum > basePriceNum ? Math.round(((mrpNum - basePriceNum) / mrpNum) * 100) : 0;
    const slug = await uniqueSlug(String(body.slug ?? "") || title);
    const images = Array.isArray(body.images)
      ? body.images.map((s: unknown) => String(s).trim()).filter(Boolean)
      : [];
    const variants = normalizeVariants(body.variants, slug);

    const product = await db.product.create({
      data: {
        slug,
        title,
        description,
        shortDescription: teaserFrom(description, title),
        categoryId,
        status: ["draft", "published", "archived"].includes(body.status) ? body.status : "published",
        basePrice: basePriceNum,
        mrp: mrpNum,
        discountPct,
        fabricType: body.fabricType ? String(body.fabricType).trim() || null : null,
        weaveOrigin: body.weaveOrigin ? String(body.weaveOrigin).trim() || null : null,
        zariType: body.zariType ? String(body.zariType).trim() || null : null,
        blouseIncluded: body.blouseIncluded !== false,
        images: JSON.stringify(images),
        tags: JSON.stringify([]),
        isBestseller: !!body.isBestseller,
        isNew: !!body.isNew,
        isFeatured: !!body.isFeatured,
        careInstructions: "Dry clean only. Store wrapped in muslin cloth.",
        variants: { create: variants },
      },
      include: { variants: true },
    });

    await db.category.update({
      where: { id: categoryId },
      data: { productCount: { increment: 1 } },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/products failed:", err);
    return NextResponse.json(
      { error: "Could not create the product. Please try again." },
      { status: 500 }
    );
  }
}
