import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toReviewOut } from "@/lib/format";
import { submitReviewSchema, formatZodErrors } from "@/lib/validation";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/integrations/turnstile";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ reviews: [] });
  // Validate productId format — alphanumeric + cuid-like
  if (!/^[a-z0-9]{1,50}$/i.test(productId)) {
    return NextResponse.json({ reviews: [] });
  }
  const reviews = await db.review.findMany({
    where: { productId, status: "approved" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ reviews: reviews.map(toReviewOut) });
}

export async function POST(req: NextRequest) {
  // Rate limit — 5 reviews per minute per IP
  const rl = rateLimit(req, RATE_LIMITS.submitReview);
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

  const parsed = submitReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_FAILED", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Verify Turnstile CAPTCHA (if configured — fails open if not)
  const turnstileToken = (raw as { turnstileToken?: string }).turnstileToken;
  if (turnstileToken !== undefined) {
    const turnstileResult = await verifyTurnstileToken(turnstileToken, getClientIp(req));
    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed", code: "CAPTCHA_FAILED", details: turnstileResult.errorCodes },
        { status: 403 }
      );
    }
  }

  // Verify the product exists before creating a review (prevents foreign-key errors
  // and stops attackers from spamming reviews against non-existent products)
  const product = await db.product.findUnique({
    where: { id: data.productId },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const review = await db.review.create({
    data: {
      productId: data.productId,
      authorName: data.authorName,
      authorCity: data.authorCity || null,
      authorEmail: data.authorEmail || null,
      rating: data.rating, // already validated to be 1-5
      title: data.title,
      body: data.body,
      status: "pending",
      verified: false,
    },
  });
  return NextResponse.json({ review: toReviewOut(review) });
}
