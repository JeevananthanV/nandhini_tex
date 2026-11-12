import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const faqs = await db.faq.findMany({ orderBy: [{ sortOrder: "asc" }] });
  return NextResponse.json({ faqs });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const f = await db.faq.create({
    data: { question: body.question, answer: body.answer, category: body.category || "General", sortOrder: parseInt(body.sortOrder || 0) },
  });
  return NextResponse.json({ faq: f });
}
