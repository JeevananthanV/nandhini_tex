import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSchema, formatZodErrors } from "@/lib/validation";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Rate limit — 5 subscriptions per minute per IP
  const rl = rateLimit(req, RATE_LIMITS.newsletter);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests — please try again later", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Valid email required", code: "VALIDATION_FAILED", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase().trim();

  const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ ok: true, message: "Already subscribed" });
  await db.newsletterSubscriber.create({ data: { email } });
  return NextResponse.json({ ok: true, message: "Subscribed successfully" });
}
