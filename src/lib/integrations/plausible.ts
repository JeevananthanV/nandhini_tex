/**
 * Plausible Analytics integration — privacy-friendly, cookie-free analytics.
 *
 * Free tier: self-host unlimited. Cloud: 10k pageviews/mo free.
 * Set up at https://plausible.io.
 *
 * Privacy advantages:
 * - No cookies → no cookie banner needed (GDPR-friendly)
 * - No personal data collected → no DPA needed
 * - Lightweight script (1KB vs GA's 50KB)
 *
 * Environment variables:
 * - NEXT_PUBLIC_PLAUSIBLE_DOMAIN  — your tracked domain (e.g. "nandhinitex.com")
 * - NEXT_PUBLIC_PLAUSIBLE_SRC    — script URL (default: "https://plausible.io/js/script.js")
 *                                  For self-hosted: "https://stats.yourdomain.com/js/script.js"
 *
 * Custom events (optional):
 * - Set NEXT_PUBLIC_PLAUSIBLE_SRC to ".../script.tagged-events.js"
 * - Call plausible('event', { props: { ... } }) for custom events
 */

export type PlausibleConfig = {
  domain: string;
  src: string;
};

export function getPlausibleConfig(): PlausibleConfig | null {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return {
    domain,
    src: process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js",
  };
}

export function isPlausibleConfigured(): boolean {
  return getPlausibleConfig() !== null;
}

/**
 * Track a custom event server-side via the Plausible Events API.
 *
 * Useful for tracking conversions (orders, signups) that happen in API routes
 * rather than in the browser.
 *
 * Requires PLAUSIBLE_API_KEY env var (server-side only, never public).
 */
export async function trackPlausibleEvent(
  eventName: string,
  props?: Record<string, string | number>,
): Promise<void> {
  const cfg = getPlausibleConfig();
  const apiKey = process.env.PLAUSIBLE_API_KEY;
  if (!cfg || !apiKey) return;

  try {
    await fetch("https://plausible.io/api/event", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "NandhiniTex/1.0",
      },
      body: JSON.stringify({
        domain: cfg.domain,
        name: eventName,
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://nandhinitex.com",
        props: props || {},
      }),
    });
  } catch (err) {
    console.error("[analytics] Plausible event failed:", err);
  }
}
