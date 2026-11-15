/**
 * Integration status registry — single source of truth for which third-party
 * services are configured.
 *
 * Used by:
 * - /api/integrations/status (admin endpoint to show config status)
 * - The admin Settings page (to show which services are wired up)
 * - The storefront (to show/hide payment options based on config)
 *
 * Each integration has:
 * - id          — stable identifier
 * - name        — human-readable
 * - category    — payment | shipping | email | sms | analytics | monitoring | security | ai
 * - isConfigured — whether env vars are present (does NOT test connectivity)
 * - requiredEnvVars — env var names needed to enable
 * - docsUrl     — where to sign up / find keys
 * - description — what it does
 */

import { isRazorpayConfigured } from "./razorpay";
import { isShiprocketConfigured } from "./shiprocket";
import { isResendConfigured } from "./resend";
import { isMSG91Configured } from "./msg91";
import { isPlausibleConfigured } from "./plausible";
import { isSentryConfigured } from "./sentry";
import { isTurnstileConfigured } from "./turnstile";

export type IntegrationCategory =
  | "payment"
  | "shipping"
  | "email"
  | "sms"
  | "analytics"
  | "monitoring"
  | "security"
  | "ai"
  | "auth";

export type IntegrationStatus = {
  id: string;
  name: string;
  category: IntegrationCategory;
  isConfigured: boolean;
  requiredEnvVars: string[];
  docsUrl: string;
  description: string;
  /** Optional — required for the app to function (DB, admin auth) */
  isRequired?: boolean;
};

export const INTEGRATIONS: IntegrationStatus[] = [
  // ---- Required ----
  {
    id: "database",
    name: "Database (SQLite/Postgres)",
    category: "analytics", // closest match — stores all data
    isConfigured: !!process.env.DATABASE_URL,
    requiredEnvVars: ["DATABASE_URL"],
    docsUrl: "https://www.prisma.io/docs",
    description: "Primary data store — SQLite for dev, Postgres for production multi-instance",
    isRequired: true,
  },
  {
    id: "admin-auth",
    name: "Admin Authentication",
    category: "auth",
    isConfigured: !!process.env.ADMIN_PASSWORD,
    requiredEnvVars: ["ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"],
    docsUrl: "https://github.com/z-ai/nandhini-tex/blob/main/DOCKER.md#security",
    description: "HMAC-signed cookie session for the admin panel",
    isRequired: true,
  },

  // ---- Payments ----
  {
    id: "razorpay",
    name: "Razorpay (UPI, Cards, NetBanking)",
    category: "payment",
    isConfigured: isRazorpayConfigured(),
    requiredEnvVars: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
    docsUrl: "https://dashboard.razorpay.com",
    description: "India's leading payment gateway. Accept UPI, cards, netbanking, wallets. Auto-captures payments.",
  },

  // ---- Shipping ----
  {
    id: "shiprocket",
    name: "Shiprocket (Delhivery/DTDC/India Post)",
    category: "shipping",
    isConfigured: isShiprocketConfigured(),
    requiredEnvVars: ["SHIPROCKET_EMAIL", "SHIPROCKET_PASSWORD"],
    docsUrl: "https://app.shiprocket.in",
    description: "Aggregates all Indian couriers into one API. Auto-assigns AWB, schedules pickup, tracks shipments.",
  },

  // ---- Email ----
  {
    id: "resend",
    name: "Resend (Transactional Email)",
    category: "email",
    isConfigured: isResendConfigured(),
    requiredEnvVars: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"],
    docsUrl: "https://resend.com",
    description: "Send order confirmations, shipping notifications, newsletter emails. Free: 3k/month.",
  },

  // ---- SMS ----
  {
    id: "msg91",
    name: "MSG91 (SMS)",
    category: "sms",
    isConfigured: isMSG91Configured(),
    requiredEnvVars: ["MSG91_AUTH_KEY", "MSG91_SENDER_ID", "MSG91_TEMPLATE_ID"],
    docsUrl: "https://msg91.com",
    description: "India-focused SMS. Order confirmations, shipping alerts, OTP. Requires DLT-approved template.",
  },

  // ---- Analytics ----
  {
    id: "plausible",
    name: "Plausible Analytics",
    category: "analytics",
    isConfigured: isPlausibleConfigured(),
    requiredEnvVars: ["NEXT_PUBLIC_PLAUSIBLE_DOMAIN"],
    docsUrl: "https://plausible.io",
    description: "Privacy-friendly, cookie-free analytics. No cookie banner needed (GDPR-compliant).",
  },

  // ---- Error monitoring ----
  {
    id: "sentry",
    name: "Sentry (Error Monitoring)",
    category: "monitoring",
    isConfigured: isSentryConfigured(),
    requiredEnvVars: ["SENTRY_DSN"],
    docsUrl: "https://sentry.io",
    description: "Automatic capture of unhandled exceptions + performance tracing. Free: 5k errors/month.",
  },

  // ---- Security ----
  {
    id: "turnstile",
    name: "Cloudflare Turnstile (CAPTCHA)",
    category: "security",
    isConfigured: isTurnstileConfigured(),
    requiredEnvVars: ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"],
    docsUrl: "https://dash.cloudflare.com/?to=/:account/turnstile",
    description: "Privacy-friendly CAPTCHA. Free, unlimited. Replaces Google reCAPTCHA. No cookie banner.",
  },

  // ---- AI (installed but not wired up) ----
  {
    id: "zai-sdk",
    name: "Z.AI Web Dev SDK (AI Chatbot)",
    category: "ai",
    isConfigured: !!process.env.ZAI_API_KEY,
    requiredEnvVars: ["ZAI_API_KEY"],
    docsUrl: "https://chatglm.cn",
    description: "LLM chatbot, image generation, vision understanding. Backend-only — never client-side.",
  },
];

/** Get a summary of configured vs total integrations by category. */
export function getIntegrationSummary(): Record<
  IntegrationCategory,
  { configured: number; total: number; missing: string[] }
> {
  const summary = {} as Record<IntegrationCategory, { configured: number; total: number; missing: string[] }>;
  for (const cat of ["payment", "shipping", "email", "sms", "analytics", "monitoring", "security", "ai", "auth"] as IntegrationCategory[]) {
    const items = INTEGRATIONS.filter((i) => i.category === cat);
    summary[cat] = {
      configured: items.filter((i) => i.isConfigured).length,
      total: items.length,
      missing: items.filter((i) => !i.isConfigured && !i.isRequired).map((i) => i.id),
    };
  }
  return summary;
}
