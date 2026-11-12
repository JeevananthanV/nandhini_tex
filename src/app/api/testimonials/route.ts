import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const testimonials = await db.testimonial.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ testimonials });
}
