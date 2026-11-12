import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const f = await db.faq.update({
    where: { id },
    data: {
      ...(body.question ? { question: body.question } : {}),
      ...(body.answer ? { answer: body.answer } : {}),
      ...(body.category ? { category: body.category } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: parseInt(body.sortOrder) } : {}),
    },
  });
  return NextResponse.json({ faq: f });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.faq.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
