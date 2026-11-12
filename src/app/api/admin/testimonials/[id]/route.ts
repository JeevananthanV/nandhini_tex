import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const t = await db.testimonial.update({
    where: { id },
    data: {
      ...(body.name ? { name: body.name } : {}),
      ...(body.city !== undefined ? { city: body.city } : {}),
      ...(body.quote ? { quote: body.quote } : {}),
      ...(body.rating !== undefined ? { rating: parseInt(body.rating) } : {}),
      ...(body.featured !== undefined ? { featured: body.featured } : {}),
    },
  });
  return NextResponse.json({ testimonial: t });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
