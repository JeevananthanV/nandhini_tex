import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createTestimonialSchema, formatZodErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const testimonials = await db.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createTestimonialSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_FAILED", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const t = await db.testimonial.create({
    data: {
      name: data.name,
      city: data.city || null,
      quote: data.quote,
      rating: data.rating,
      featured: data.featured,
    },
  });
  return NextResponse.json({ testimonial: t });
}
