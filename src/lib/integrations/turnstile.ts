/**
 * Cloudflare Turnstile integration — privacy-friendly CAPTCHA.
 *
 * Free, unlimited. Replaces Google reCAPTCHA.
 * Set up at https://dash.cloudflare.com/?to=/:account/turnstile.
 *
 * Why Turnstile over reCAPTCHA:
 * - No cookie banner needed (GDPR-friendly)
 * - No "I'm not a robot" checkbox (invisible by default)
 * - No image challenges ("select all traffic lights")
 * - Free, unlimited
 *
 * Environment variables:
 * - NEXT_PUBLIC_TURNSTILE_SITE_KEY   — public key (safe to expose)
 * - TURNSTILE_SECRET_KEY             — secret key (server-side only!)
 *
 * Usage:
 * 1. Add the Turnstile widget to a form (client-side):
 *    <div class="cf-turnstile" data-sitekey="..." data-callback="onTurnstileSuccess"></div>
 *    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
 * 2. The widget sets a hidden input `cf-turnstile-response` with a token
 * 3. On the server, verify the token with verifyTurnstileToken()
 */

export type TurnstileConfig = {
  siteKey: string;
  secretKey: string;
};

export function getTurnstileConfig(): TurnstileConfig | null {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!siteKey || !secretKey) return null;
  return { siteKey, secretKey };
}

export function isTurnstileConfigured(): boolean {
  return getTurnstileConfig() !== null;
}

/**
 * Verify a Turnstile token server-side.
 *
 * @param token - the `cf-turnstile-response` value from the form submission
 * @param remoteIp - the user's IP (optional, for abuse detection)
 * @returns { success: boolean, errorCodes?: string[] }
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<{ success: boolean; errorCodes?: string[] }> {
  const cfg = getTurnstileConfig();
  if (!cfg) {
    // Not configured — fail open (don't block forms without Turnstile)
    return { success: true };
  }

  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  try {
    const body = new URLSearchParams({
      secret: cfg.secretKey,
      response: token,
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    });

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      return { success: false, errorCodes: ["http-error"] };
    }

    const data = await res.json() as {
      success: boolean;
      "error-codes"?: string[];
      challenge_ts?: string;
      hostname?: string;
      action?: string;
    };

    return {
      success: data.success,
      errorCodes: data["error-codes"],
    };
  } catch (err) {
    console.error("[turnstile] Verification failed:", err);
    return { success: false, errorCodes: ["verification-error"] };
  }
}
