import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const testimonials = await db.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const t = await db.testimonial.create({
    data: { name: body.name, city: body.city || null, quote: body.quote, rating: parseInt(body.rating || 5), featured: !!body.featured },
  });
  return NextResponse.json({ testimonial: t });
}
