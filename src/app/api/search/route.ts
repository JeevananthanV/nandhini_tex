import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toProductCard } from "@/lib/format";

export const dynamic = "force-dynamic";

// GET /api/search?q=<query>&limit=<n>
// Full-text search across product title, description, fabric, weave origin
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  if (!q.trim()) {
    return NextResponse.json({
      query: q,
      results: [],
      count: 0,
      suggestions: await getSuggestions(),
    });
  }

  const products = await db.product.findMany({
    where: {
      status: "published",
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { fabricType: { contains: q } },
        { weaveOrigin: { contains: q } },
        { zariType: { contains: q } },
      ],
    },
    include: { category: true, variants: true },
    take: limit,
    orderBy: [{ isBestseller: "desc" }, { rating: "desc" }],
  });

  // Also search categories
  const categories = await db.category.findMany({
    where: {
      OR: [{ name: { contains: q } }, { description: { contains: q } }],
    },
    take: 5,
  });

  return NextResponse.json({
    query: q,
    count: products.length,
    results: products.map(toProductCard),
    categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, productCount: c.productCount })),
    suggestions: products.length === 0 ? await getSuggestions() : [],
  });
}

async function getSuggestions() {
  const top = await db.product.findMany({
    where: { status: "published", isBestseller: true },
    select: { title: true, slug: true },
    take: 6,
    orderBy: { rating: "desc" },
  });
  return top.map((p) => ({ title: p.title, slug: p.slug }));
}
