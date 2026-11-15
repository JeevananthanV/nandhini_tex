# Third-Party Integrations — Nandhini Tex

This document covers every third-party service the project can integrate with. Each integration is **optional** — the app works without any of them (falls back to COD-only, no email/SMS).

## At a glance

| Service | Category | Status | Env vars | Setup time |
|---|---|---|---|---|
| **Razorpay** | Payment | Configurable | 2 | 15 min |
| **Shiprocket** | Shipping | Configurable | 2 | 20 min |
| **Resend** | Email | Configurable | 2 | 10 min |
| **MSG91** | SMS | Configurable | 3 | 30 min (DLT) |
| **Plausible** | Analytics | Configurable | 1 | 5 min |
| **Sentry** | Monitoring | Configurable | 4 | 15 min |
| **Cloudflare Turnstile** | Security | Configurable | 2 | 10 min |
| **Z.AI SDK** | AI | Configurable | 1 | 5 min |
| **WhatsApp** | Commerce | ✅ Built-in | 1 | 0 (defaults to Nandhini Tex number) |
| **Image CDN** | Media | ✅ Built-in | 0 | 0 (uses z-cdn.chatglm.cn) |

**To check which are configured in your environment:**
```bash
# Via API (admin-only)
curl -b "ntx_admin_session=..." http://localhost:3000/api/integrations/status

# Or via the admin panel → Settings → Integrations
```

---

## 1. Razorpay — Payments

**What:** India's leading payment gateway. Accept UPI, cards, netbanking, wallets, EMI.

**Free tier:** None (transaction fees only — 2% domestic cards, 0% UPI)

**Setup (15 min):**
1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Complete KYC (PAN + bank account) — takes 24-48h
3. Generate API keys: Settings → API Keys → Generate Key
4. Copy the `Key ID` (starts with `rzr_test_` or `rzr_live_`) and `Key Secret`
5. Set env vars:

```env
RAZORPAY_KEY_ID="rzr_test_xxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET=""  # only if using webhooks
```

6. Restart the server. The storefront will now show "Pay Online" as a payment option.

**Test cards:**
- Card: `4111 1111 1111 1111`
- Expiry: any future date
- CVV: any 3 digits

**Flow:**
1. Customer places order → `/api/orders` creates an order with `paymentStatus: "pending"`
2. Customer clicks "Pay Online" → frontend calls `/api/payments/razorpay/create-order`
3. Razorpay Checkout modal opens (loads `https://checkout.razorpay.com/v1/checkout.js`)
4. Customer pays → Razorpay returns `razorpay_payment_id` + `razorpay_signature`
5. Frontend posts to `/api/payments/razorpay/verify` → we verify the HMAC signature
6. Order marked `paid` + `confirmed` → confirmation email + SMS sent

**Files:**
- `src/lib/integrations/razorpay.ts` — SDK wrapper (create order, verify signature, fetch payment)
- `src/app/api/payments/razorpay/create-order/route.ts` — POST endpoint
- `src/app/api/payments/razorpay/verify/route.ts` — POST endpoint

---

## 2. Shiprocket — Shipping

**What:** India's shipping aggregator. One API for Delhivery, DTDC, India Post, BlueDart, Xpressbees, etc.

**Free tier:** ₹0 setup. Per-shipment pricing (₹25-50 for <500g, prepaid; ₹40-70 COD)

**Setup (20 min):**
1. Sign up at [app.shiprocket.in](https://app.shiprocket.in)
2. Add a pickup location (your warehouse address) — note the name (e.g. "Elampillai-Office")
3. Add your bank account for COD remittance
4. Set env vars:

```env
SHIPROCKET_EMAIL="your-email@nandhinitex.com"
SHIPROCKET_PASSWORD="your-shiprocket-password"
SHIPROCKET_SANDBOX="false"  # set "true" for staging
```

5. When an admin moves an order to "confirmed" status, Shiprocket auto-creates a shipment, assigns an AWB, and schedules pickup.

**Courier auto-assignment:** Shiprocket picks the cheapest serviceable courier for the destination pincode based on your rate card.

**Tracking:** The `/api/orders/track` endpoint fetches live status from Shiprocket by AWB (if configured). Falls back to showing the manually-entered courier info otherwise.

**Files:**
- `src/lib/integrations/shiprocket.ts` — auth token caching, create shipment, track by AWB

---

## 3. Resend — Transactional Email

**What:** Modern email API. Send order confirmations, shipping alerts, newsletters.

**Free tier:** 3,000 emails/month, 100/day. No credit card required.

**Setup (10 min):**
1. Sign up at [resend.com](https://resend.com)
2. (Optional but recommended) Verify your domain at [resend.com/domains](https://resend.com/domains) — takes 5 min (add 3 DNS records)
3. Generate API key: API Keys → Create API Key → copy (starts with `re_`)
4. Set env vars:

```env
RESEND_API_KEY="re_xxxxxxxxxxxxx"
# Until domain is verified, you can ONLY send FROM onboarding@resend.dev:
RESEND_FROM_EMAIL="onboarding@resend.dev"
# After domain verification:
RESEND_FROM_EMAIL="noreply@nandhinitex.com"
RESEND_REPLY_TO="support@nandhinitex.com"
```

5. Restart the server. Order confirmations will now send email automatically.

**When emails are sent:**
- Order placed (COD or prepaid) → confirmation email
- Order paid via Razorpay → confirmation email + "Payment captured" note
- (Future) Order shipped → shipping notification email

**Template:** The order confirmation email uses the Royal Heritage theme (Navy/Gold/Ivory) — see `renderOrderConfirmationEmail()` in `src/lib/integrations/resend.ts`.

**Files:**
- `src/lib/integrations/resend.ts` — sendEmail(), order confirmation template

---

## 4. MSG91 — SMS

**What:** India-focused SMS provider. Order confirmations, shipping alerts, OTP.

**Free trial:** 130 SMS credits on signup. Per-SMS cost ~₹0.20 (transactional).

**Setup (30 min — DLT registration takes time):**
1. Sign up at [msg91.com](https://msg91.com)
2. Complete DLT registration (required by TRAI for all Indian SMS):
   - Register at [msg91.com/dlt](https://msg91.com/dlt) — takes 24-48h
   - Approve a 6-char sender ID (e.g. "NDHTXT" for Nandhini Tex)
   - Create a DLT-approved template for each message type
3. Get your auth key: Dashboard → API → Auth Key
4. Set env vars:

```env
MSG91_AUTH_KEY="xxxxxxxxxxxx"
MSG91_SENDER_ID="NDHTXT"
MSG91_TEMPLATE_ID="xxxxxxxxxxxx"  # DLT template ID for order confirmation
```

**DLT template example (order confirmation):**
```
Dear {var1}, your order {var2} for Rs.{var3} is confirmed.
Track at {var4}. - Nandhini Tex
```
- `{var1}` = customer first name
- `{var2}` = order number
- `{var3}` = total amount
- `{var4}` = tracking URL

5. Restart the server. SMS will be sent on order placement + shipping.

**When SMS are sent:**
- Order placed → confirmation SMS (with tracking URL)
- Order paid via Razorpay → confirmation SMS
- (Future) Order shipped → shipping SMS with AWB
- (Future) Order delivered → delivery confirmation SMS

**Files:**
- `src/lib/integrations/msg91.ts` — sendSMS(), order confirmation + shipping + delivery templates

---

## 5. Plausible Analytics — Privacy-Friendly Analytics

**What:** Cookie-free, GDPR-compliant web analytics. No cookie banner needed.

**Free tier:** Cloud: 10k pageviews/month. Self-hosted: unlimited.

**Setup (5 min):**
1. Sign up at [plausible.io](https://plausible.io) (or self-host via Docker)
2. Add your site — you'll get a domain to track (e.g. "nandhinitex.com")
3. Set env vars:

```env
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="nandhinitex.com"
# Optional — for self-hosted:
NEXT_PUBLIC_PLAUSIBLE_SRC="https://stats.yourdomain.com/js/script.js"
# Optional — for server-side event tracking (conversions):
PLAUSIBLE_API_KEY="xxxxxxxxxxxx"
```

4. Restart the server. The Plausible script is auto-injected into `<head>` only when the domain is set.

**Why Plausible over Google Analytics:**
- No cookies → no cookie banner needed
- No personal data → no DPA needed
- 1KB script (vs GA's 50KB) → faster page loads
- Simple, focused on what matters (pageviews, sources, goals)

**Custom events:** The order-placement API route fires a `trackPlausibleEvent("Order Placed", { revenue, paymentMethod, itemCount })` event automatically.

**Files:**
- `src/lib/integrations/plausible.ts` — config + trackPlausibleEvent()
- `src/app/layout.tsx` — script injection (conditional on env var)

---

## 6. Sentry — Error Monitoring

**What:** Capture unhandled exceptions, track performance, get alerts on regressions.

**Free tier:** 5,000 errors/month, 50 performance transactions.

**Setup (15 min):**
1. Sign up at [sentry.io](https://sentry.io)
2. Create a project → platform: Next.js
3. Copy the DSN (looks like `https://xxxxx@o123456.ingest.sentry.io/123456`)
4. Install the SDK:

```bash
bun add @sentry/nextjs
```

5. Set env vars:

```env
SENTRY_DSN="https://xxxxx@o123456.ingest.sentry.io/123456"
SENTRY_AUTH_TOKEN="sntrys_xxxxxxxxxxxx"  # for source map upload
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="nandhini-tex"
```

6. Initialize Sentry by uncommenting the code in `src/lib/integrations/sentry.ts` (the file has the implementation commented out so the app works without the package installed)

7. (Optional) Add `sentry.client.config.ts` + `sentry.server.config.ts` + wrap `next.config.ts` per [the Sentry Next.js docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

**When errors are captured:**
- API route throws → `captureException(err, { context })` in catch blocks
- Razorpay payment verification fails → captured with order context
- Email/SMS send failures → captured (but don't block the order)

**Files:**
- `src/lib/integrations/sentry.ts` — initSentryServer(), captureException(), captureMessage()

---

## 7. Cloudflare Turnstile — CAPTCHA

**What:** Privacy-friendly CAPTCHA. Replaces Google reCAPTCHA. Invisible by default.

**Free tier:** Unlimited. No caps.

**Setup (10 min):**
1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) (free account works)
2. Go to Turnstile → Add site
3. Copy the Site Key + Secret Key
4. Set env vars:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAA..."  # public, safe for browser
TURNSTILE_SECRET_KEY="0x4AAAAAAA..."            # server-only, NEVER expose
```

5. Add the Turnstile widget to any form:

```tsx
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
<div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
```

6. On the server, verify the token:

```ts
import { verifyTurnstileToken } from "@/lib/integrations/turnstile";

const result = await verifyTurnstileToken(token, requestIp);
if (!result.success) return 400;
```

**Why Turnstile over reCAPTCHA:**
- No "I'm not a robot" checkbox (invisible)
- No image challenges ("select all traffic lights")
- No cookies → no cookie banner needed
- Free, unlimited (reCAPTCHA has quotas)

**Files:**
- `src/lib/integrations/turnstile.ts` — verifyTurnstileToken()

---

## 8. Z.AI Web Dev SDK — AI Features

**What:** LLM chatbot, image generation, vision understanding, TTS, ASR.

**Status:** Package is installed (`z-ai-web-dev-sdk@^0.0.18`) but **never imported** in the current codebase. Set the API key to enable future AI features.

**Setup (5 min):**
1. Get an API key from [chatglm.cn](https://chatglm.cn) (or your Z.AI provider)
2. Set env var:

```env
ZAI_API_KEY="xxxxxxxxxxxx"
```

3. Use the SDK in any server-side route:

```ts
import ZAI from "z-ai-web-dev-sdk";

const zai = await ZAI.create();
const completion = await zai.chat.completions.create({
  messages: [{ role: "user", content: "Hello" }],
});
```

**IMPORTANT:** The SDK MUST be used **server-side only**. Never import it in a client component — it would leak your API key to the browser.

**Files:**
- (No integration file yet — the SDK is available for ad-hoc use)

---

## 9. WhatsApp — Built-in

**Status:** ✅ Already integrated via deep-links.

**How it works:** Customers tap a "Order on WhatsApp" button → opens `wa.me/917604811838?text=...` with a pre-filled message containing the product/cart details.

**Configuration:**
```env
NEXT_PUBLIC_WHATSAPP_NUMBER="917604811838"  # international format, no +
```

The default number (+91 76048 11838) is Nandhini Tex's support line. Change it via env var without code edits.

**Where it's used:**
- Product page → "Order on WhatsApp" button
- Cart page → "Order on WhatsApp" button
- Bulk inquiry module → tiered pricing WhatsApp links
- Track order page → "WhatsApp Support" fallback

**Files:**
- `src/lib/whatsapp.ts` — message builders + URL helpers

---

## 10. Image CDN — Built-in

**Status:** ✅ Already integrated via `next/image`.

**Host:** `z-cdn.chatglm.cn` (configured in `next.config.ts` `images.remotePatterns`)

**How it works:** Next.js optimizes images on-the-fly (resize, WebP/AVIF conversion, lazy-loading) using `sharp`. The remote host serves the original; Next serves the optimized version from `/__next/image?url=...&w=...&q=75`.

**Adding more hosts:** Edit `next.config.ts`:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "z-cdn.chatglm.cn" },
    { protocol: "https", hostname: "images.unsplash.com" },
    // Add your own CDN:
    // { protocol: "https", hostname: "cdn.yourdomain.com" },
  ],
},
```

---

## Configuration status endpoint

**GET `/api/integrations/status`** (admin-only)

Returns which integrations are configured (without exposing secrets):

```json
{
  "integrations": [
    {
      "id": "razorpay",
      "name": "Razorpay (UPI, Cards, NetBanking)",
      "category": "payment",
      "isConfigured": true,
      "requiredEnvVars": ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
      "docsUrl": "https://dashboard.razorpay.com",
      "description": "..."
    },
    // ... 8 more integrations
  ],
  "summary": {
    "payment": { "configured": 1, "total": 1, "missing": [] },
    "shipping": { "configured": 0, "total": 1, "missing": ["shiprocket"] },
    // ... etc
  }
}
```

---

## Troubleshooting

### "Payments not configured" error
- Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
- Verify the keys are valid in the Razorpay dashboard
- Test keys start with `rzr_test_`, live with `rzr_live_`

### Email not sending
- Check `RESEND_API_KEY` is set (starts with `re_`)
- On free tier, you can only send FROM `onboarding@resend.dev` until you verify your domain
- Check logs for `[email]` prefixed messages

### SMS not sending
- Check `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, `MSG91_TEMPLATE_ID` are all set
- Verify your DLT template is approved
- The phone number must be 10 digits (or `91` + 10 digits)

### Analytics not appearing in Plausible
- Check `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` matches exactly what's in your Plausible dashboard
- The script is only injected when the env var is set — clear cache and reload
- Check browser DevTools → Network → look for `plausible.io/js/script.js`

### Razorpay signature mismatch
- Ensure `RAZORPAY_KEY_SECRET` matches the secret in the dashboard (not the test one if using live mode)
- The signature is HMAC-SHA256 of `order_id|payment_id` — verify you're using the Razorpay order_id (starts with `rzr_`), not your internal order number

---

## Removing integrations

To completely remove an integration:
1. Delete the env vars from `.env`
2. (Optional) Delete the lib file at `src/lib/integrations/<service>.ts`
3. (Optional) Delete the API routes at `src/app/api/<service>/`
4. Remove imports from `src/lib/integrations/index.ts`

The app will gracefully degrade — no crashes, just missing features.
