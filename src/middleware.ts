import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * Edge-compatible middleware.
 *
 * Gates all /api/admin/* and /api/dashboard routes behind a valid session cookie.
 * Unauthenticated requests are rejected with 401 before the route handler runs —
 * meaning a database failure can't leak through an admin route's error path.
 *
 * Why not just check inside each handler? Because there are 18+ admin route files.
 * Centralizing the check here eliminates the "forgot to add auth" class of bug.
 */

// Paths that require an admin session. Matched as prefixes.
const PROTECTED_PREFIXES = [
  "/api/admin",
  "/api/dashboard",
];

// Public admin paths (login + logout themselves must be reachable without a session).
const PUBLIC_ADMIN_PATHS = new Set([
  "/api/admin/login",
  "/api/admin/logout",
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only run for protected prefixes
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Login + logout are reachable without a session
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();

  // Verify the session cookie
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = await verifyToken(token);

  if (!payload || payload.sub !== "admin") {
    return NextResponse.json(
      {
        error: "Unauthorized — admin session required",
        code: "UNAUTHORIZED",
        // Tell the admin SPA to show the login screen
        loginUrl: "/api/admin/login",
      },
      { status: 401 }
    );
  }

  // Optional CSRF check on mutating methods — Origin header must match our host
  const method = req.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    // Allow same-origin requests (origin === host or origin ends with host)
    if (origin && host) {
      const originHost = origin.replace(/^https?:\/\//, "").split("/")[0];
      if (originHost !== host && !originHost.endsWith("." + host)) {
        return NextResponse.json(
          { error: "Cross-origin requests are not permitted on this endpoint", code: "CSRF_ORIGIN_MISMATCH" },
          { status: 403 }
        );
      }
    } else if (process.env.NODE_ENV === "production") {
      // In production we require Origin on mutations; if it's missing we reject
      return NextResponse.json(
        { error: "Missing Origin header", code: "CSRF_MISSING_ORIGIN" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all admin + dashboard API routes
  matcher: ["/api/admin/:path*", "/api/dashboard/:path*"],
};
