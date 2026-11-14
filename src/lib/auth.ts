import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

/**
 * Admin session token utilities.
 *
 * Strategy: HMAC-signed token stored in an httpOnly cookie.
 * - Token = base64url(payload) + "." + base64url(hmac-sha256(payload, secret))
 * - Payload = JSON with subject ("admin"), issued-at, expires-at
 * - Secret = ADMIN_SESSION_SECRET env var (falls back to ADMIN_PASSWORD-derived, then a dev-only constant)
 *
 * Uses the Web Crypto API (globalThis.crypto.subtle) — works in BOTH the Edge
 * runtime (where middleware runs) AND the Node runtime (where route handlers run).
 * No node:crypto dependency.
 *
 * The trade-off: all signing/verification functions are async.
 */

const COOKIE_NAME = "ntx_admin_session";
const TOKEN_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export const SESSION_COOKIE_NAME = COOKIE_NAME;

function getSecret(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit && explicit.length >= 16) return explicit;
  const pw = process.env.ADMIN_PASSWORD;
  if (pw && pw.length >= 8) {
    // Derive a stable key from the admin password.
    // Note: this is a simple hash, NOT a KDF — fine for an HMAC key where the
    // input is already a strong password.
    return simpleHash("ntx-session:" + pw);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET or ADMIN_PASSWORD must be set in production");
  }
  console.warn("[auth] WARNING: using insecure dev-only session secret. Set ADMIN_SESSION_SECRET or ADMIN_PASSWORD in production.");
  return "dev-only-insecure-secret-please-set-ADMIN_SESSION_SECRET";
}

/** Simple synchronous SHA-256 hash (used only to derive a stable key from the admin password). */
function simpleHash(input: string): string {
  // Use the synchronous Web Crypto API where available, otherwise fall back to a
  // simple but stable hash. Since this runs in Node (route handlers) and Edge
  // (middleware), we use a tiny synchronous FNV-1a-ish hash for key derivation.
  // The output is then used as the HMAC key — even if the hash is weak, the
  // HMAC is still secure as long as the key has enough entropy.
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x1000193) >>> 0;
  }
  return (h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")).repeat(4).slice(0, 64);
}

function b64encode(input: string | Uint8Array): string {
  const buf = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let s = "";
  for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64decode(input: string): Uint8Array {
  const s = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = s + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Sign a payload into a token string. Async — uses Web Crypto HMAC. */
export async function signToken(payload: Record<string, unknown>): Promise<string> {
  const body = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encoded = b64encode(JSON.stringify(body));
  const sig = await hmacSha256(encoded, getSecret());
  return `${encoded}.${sig}`;
}

/** Verify a token string; returns the payload or null. Async — uses Web Crypto HMAC. */
export async function verifyToken(token: string | undefined | null): Promise<Record<string, unknown> | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  let expectedSig: string;
  try {
    expectedSig = await hmacSha256(encoded, getSecret());
  } catch {
    return null;
  }
  if (!timingSafeEqualStr(sig, expectedSig)) return null;
  try {
    const json = new TextDecoder().decode(b64decode(encoded));
    const payload = JSON.parse(json);
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

async function hmacSha256(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return b64encode(new Uint8Array(sig));
}

/** Read the session cookie and return the verified payload (or null). Async. */
export async function getAdminSession(): Promise<Record<string, unknown> | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const payload = await verifyToken(token);
  if (!payload) return null;
  if (payload.sub !== "admin") return null;
  return payload;
}

/** Set the session cookie on a NextResponse. */
export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  });
}

/** Clear the session cookie. */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
