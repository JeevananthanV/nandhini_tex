import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const c = await db.category.create({
    data: { name: body.name, slug, description: body.description || null, bannerImage: body.bannerImage || null, sortOrder: parseInt(body.sortOrder || 0) },
  });
  return NextResponse.json({ category: c });
}
