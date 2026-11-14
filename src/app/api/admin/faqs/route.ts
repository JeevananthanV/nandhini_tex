import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createFaqSchema, formatZodErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const faqs = await db.faq.findMany({ orderBy: [{ sortOrder: "asc" }] });
  return NextResponse.json({ faqs });
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createFaqSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_FAILED", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const f = await db.faq.create({
    data: {
      question: data.question,
      answer: data.answer,
      category: data.category,
      sortOrder: data.sortOrder,
    },
  });
  return NextResponse.json({ faq: f });
}
