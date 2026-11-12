import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ ok: true, message: "Already subscribed" });
  await db.newsletterSubscriber.create({ data: { email } });
  return NextResponse.json({ ok: true, message: "Subscribed successfully" });
}
