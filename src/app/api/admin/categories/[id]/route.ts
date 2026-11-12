import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const c = await db.category.update({
    where: { id },
    data: {
      ...(body.name ? { name: body.name } : {}),
      ...(body.slug ? { slug: body.slug } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.bannerImage !== undefined ? { bannerImage: body.bannerImage } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: parseInt(body.sortOrder) } : {}),
    },
  });
  return NextResponse.json({ category: c });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
