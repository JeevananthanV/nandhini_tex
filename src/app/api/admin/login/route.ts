import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { signToken, setSessionCookie } from "@/lib/auth";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login
 *
 * Accepts { password: string } and sets an httpOnly session cookie if correct.
 * Rate-limited to 10 attempts per minute per IP to throttle brute force.
 */
export async function POST(req: NextRequest) {
  // Rate limit — 10 attempts per minute per IP
  const rl = rateLimit(req, RATE_LIMITS.adminLogin);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many login attempts — please try again later", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD;
  // In dev, allow a default password so the app is usable out-of-the-box
  const devDefault = "admin123";

  const isMatch =
    (!!expected && safeEqual(password, expected)) ||
    (!expected && process.env.NODE_ENV !== "production" && safeEqual(password, devDefault));

  if (!isMatch) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  if (!expected && process.env.NODE_ENV !== "production") {
    console.warn("[auth] WARNING: using default admin password 'admin123'. Set ADMIN_PASSWORD env var.");
  }

  const token = await signToken({ sub: "admin", role: "admin" });
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, token);
  return res;
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

