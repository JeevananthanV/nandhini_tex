/**
 * Sentry integration — error monitoring + performance tracing.
 *
 * Free tier: 5,000 errors/month, 50 performance transactions.
 * Set up at https://sentry.io.
 *
 * Features:
 * - Automatic capture of unhandled exceptions
 * - Source map upload for readable stack traces
 * - Performance monitoring (page load, API response times)
 * - Release tracking
 *
 * Environment variables:
 * - SENTRY_DSN              — public DSN (ok to expose in browser bundle)
 * - SENTRY_AUTH_TOKEN        — server-side token for source map upload (build time only)
 * - SENTRY_ORG               — your Sentry org slug
 * - SENTRY_PROJECT           — your Sentry project slug
 * - NEXT_PUBLIC_SENTRY_DSN   — if different from server (rare; usually same)
 *
 * To enable:
 *   1. Install: bun add @sentry/nextjs
 *   2. Set SENTRY_DSN in .env
 *   3. Uncomment the implementation below
 *   4. Add a sentry.client.config.ts and sentry.server.config.ts
 *   5. Wrap next.config.ts with the Sentry wrapper (see Sentry docs)
 */

let isInitialized = false;

export function getSentryConfig() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return null;
  return {
    dsn,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
  };
}

export function isSentryConfigured(): boolean {
  return getSentryConfig() !== null;
}

/**
 * Initialize Sentry for server-side error capture.
 * Call this once at app startup (e.g. in instrumentation.ts).
 */
export async function initSentryServer(): Promise<void> {
  if (isInitialized) return;
  const cfg = getSentryConfig();
  if (!cfg) return;

  // To enable Sentry, install the package first:
  //   bun add @sentry/nextjs
  // Then uncomment this block:
  //
  // const Sentry = await import("@sentry/nextjs");
  // Sentry.init({
  //   dsn: cfg.dsn,
  //   tracesSampleRate: 0.1,
  //   environment: process.env.NODE_ENV,
  //   release: process.env.npm_package_version,
  // });
  //
  // isInitialized = true;

  console.warn("[sentry] @sentry/nextjs not installed — run `bun add @sentry/nextjs` to enable");
  isInitialized = true;
}

/**
 * Capture an exception server-side.
 * Use this in API route catch blocks to forward errors to Sentry.
 */
export async function captureException(
  err: Error,
  context?: Record<string, unknown>,
): Promise<void> {
  const cfg = getSentryConfig();
  if (!cfg) {
    console.error("[sentry-fallback] Exception:", err, context);
    return;
  }

  try {
    // const Sentry = await import("@sentry/nextjs");
    // Sentry.captureException(err, { extra: context });
    console.error("[sentry-pending] Exception (install @sentry/nextjs to forward):", err, context);
  } catch (e) {
    console.error("[sentry] Failed to capture exception:", e);
  }
}

/**
 * Capture a message (info/warning) server-side.
 */
export async function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>,
): Promise<void> {
  const cfg = getSentryConfig();
  if (!cfg) return;

  try {
    // const Sentry = await import("@sentry/nextjs");
    // Sentry.captureMessage(message, { level, extra: context });
    if (level !== "info") console.warn(`[sentry:${level}]`, message, context);
  } catch (e) {
    console.error("[sentry] Failed to capture message:", e);
  }
}
