import type { NextRequest } from "next/server";

/**
 * In-memory token-bucket rate limiter.
 *
 * Not suitable for multi-instance serverless deploys (each instance has its
 * own bucket) but fine for a single-node self-hosted setup. For multi-instance,
 * swap in @upstash/ratelimit with Redis.
 *
 * Buckets are keyed by `${identifier}:${action}` where identifier is normally
 * the client IP and action is the route being protected.
 */

type Bucket = { tokens: number; lastRefill: number };

const store = new Map<string, Bucket>();

// Periodically clean up stale buckets to avoid unbounded memory growth
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 min
const BUCKET_TTL_MS = 15 * 60 * 1000; // 15 min
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, b] of store) {
    if (now - b.lastRefill > BUCKET_TTL_MS) store.delete(key);
  }
}

export type RateLimitConfig = {
  /** Maximum tokens the bucket can hold (= burst size). */
  capacity: number;
  /** Tokens added per second. */
  refillPerSec: number;
};

export const RATE_LIMITS = {
  adminLogin: { capacity: 10, refillPerSec: 1 / 6 }, // 10 burst, +1 every 6s = 10/min sustained
  orderTrack: { capacity: 20, refillPerSec: 1 / 3 }, // 20 burst, 20/min sustained
  placeOrder: { capacity: 5, refillPerSec: 1 / 12 }, // 5 burst, 5/min sustained
  submitReview: { capacity: 5, refillPerSec: 1 / 12 },
  newsletter: { capacity: 5, refillPerSec: 1 / 12 },
  couponValidate: { capacity: 20, refillPerSec: 1 / 3 },
  default: { capacity: 60, refillPerSec: 1 }, // 60 burst, 60/min sustained
} satisfies Record<string, RateLimitConfig>;

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfter: number; remaining: 0 };

/** Get the client IP from the request, honoring X-Forwarded-For (set by Caddy/Nginx). */
export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp;
  return "unknown";
}

/** Consume one token from the bucket. Returns ok=false if no tokens available. */
export function rateLimit(req: NextRequest, config: RateLimitConfig, action = "default"): RateLimitResult {
  cleanup();
  const ip = getClientIp(req);
  const key = `${ip}:${action}`;
  const now = Date.now();
  const bucket = store.get(key) ?? { tokens: config.capacity, lastRefill: now };

  // Refill
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(config.capacity, bucket.tokens + elapsed * config.refillPerSec);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    store.set(key, bucket);
    return { ok: true, remaining: Math.floor(bucket.tokens) };
  }

  store.set(key, bucket);
  // Time until next token is available
  const retryAfter = Math.ceil((1 - bucket.tokens) / config.refillPerSec);
  return { ok: false, retryAfter, remaining: 0 };
}
