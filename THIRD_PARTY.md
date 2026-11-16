# Third-Party Integrations — Nandhini Tex

This document covers every third-party service the Nandhini Tex platform can integrate with. Each integration is **optional** — the app runs with zero integrations configured (COD-only, no email/SMS/analytics).

## Quick Reference

| # | Service | Category | Status | Required Env Vars | Free Tier |
|---|---|---|---|---|---|
| 1 | [Razorpay](#1-razorpay--payments) | Payment | Implemented | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Test mode free |
| 2 | [Shiprocket](#2-shiprocket--shipping) | Shipping | Implemented | `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD` | 100 shipments/mo |
| 3 | [Resend](#3-resend--email) | Email | Implemented | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | 3k emails/mo |
| 4 | [MSG91](#4-msg91--sms) | SMS | Implemented | `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, `MSG91_TEMPLATE_ID` | 130 SMS credits |
| 5 | [Plausible](#5-plausible--analytics) | Analytics | Implemented | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | 10k pageviews/mo |
| 6 | [Sentry](#6-sentry--error-monitoring) | Monitoring | Stubbed | `SENTRY_DSN` | 5k errors/mo |
| 7 | [Turnstile](#7-cloudflare-turnstile--captcha) | Security | Implemented | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Unlimited |
| 8 | [Z.AI SDK](#8-zai-sdk--ai-chatbot) | AI | Available | `ZAI_API_KEY` | Varies |

**Check status at runtime:** `GET /api/integrations/status` (admin-only) returns which integrations are configured.

---

## Architecture

```
                           ┌─────────────────────┐
                           │   Next.js App       │
                           │   (port 3000)       │
                           └──────────┬──────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 │                    │                    │
          ┌──────▼──────┐    ┌────────▼────────┐   ┌───────▼───────┐
          │  Payments   │    │  Communication  │   │  Monitoring   │
          │             │    │                 │   │               │
          │  Razorpay   │    │  Resend (email) │   │  Plausible    │
          │  (UPI/card) │    │  MSG91 (SMS)    │   │  Sentry       │
          └──────┬──────┘    └────────┬────────┘   └───────────────┘
                 │                    │
          ┌──────▼──────┐    ┌────────▼────────┐
          │  Shipping   │    │  Security       │
          │             │    │                 │
          │  Shiprocket │    │  Turnstile      │
          │  (Delhivery │    │  (CAPTCHA)      │
          │   /DTDC/    │    └─────────────────┘
          │   India Post│
          └─────────────┘
```

All integrations follow this pattern:
- **Config check:** `isXConfigured()` returns `true` if env vars are present
- **Graceful degradation:** If not configured, the feature is skipped (not crashed)
- **Non-blocking:** Email/SMS/analytics calls are fire-and-forget (`.catch(() => {})`)
- **No secrets in client:** All API keys stay server-side; only `NEXT_PUBLIC_*` vars reach the browser

---

## 1. Razorpay — Payments

India's leading payment gateway. Accepts UPI, cards, netbanking, wallets, EMI.

### Setup

1. **Create account:** [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. **Get API keys:** Settings → API Keys → Generate Test Keys
   - Key ID: starts with `rzr_test_`
   - Key Secret: shown once (save it!)
3. **Set env vars:**
   ```env
   RAZORPAY_KEY_ID="rzr_test_XXXXXXXXXXXX"
   RAZORPAY_KEY_SECRET="your-secret-here"
   RAZORPAY_WEBHOOK_SECRET="optional-for-webhooks"
   ```
4. **Test with:** card `4111 1111 1111 1111`, any expiry, any CVV

### Flow

```
Customer → Cart → Checkout
  ↓
POST /api/payments/razorpay/create-order
  → Creates Razorpay Order (server-to-server)
  → Returns { razorpayOrderId, amount, keyId }
  ↓
Razorpay Checkout modal opens (client-side)
  → Customer pays via UPI/card/netbanking
  → Returns { razorpay_payment_id, razorpay_signature }
  ↓
POST /api/payments/razorpay/verify
  → Verifies HMAC-SHA256 signature
  → Fetches payment status from Razorpay API
  → Marks order as "paid" + "confirmed"
  → Sends confirmation email + SMS
  ↓
Order confirmed → Customer sees success page
```

### Webhooks (optional but recommended)

For production, set up a webhook to catch async events (refunds, failed captures):

1. Go to Razorpay Dashboard → Webhooks → Add Webhook
2. URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Events: `payment.captured`, `payment.failed`, `refund.processed`
4. Copy the Webhook Secret → `RAZORPAY_WEBHOOK_SECRET`

### Going live

1. Complete KYC in Razorpay dashboard
2. Switch to Live Keys (starts with `rzr_live_`)
3. Test a ₹1 transaction end-to-end

---

## 2. Shiprocket — Shipping

India's leading shipping aggregator. One API for Delhivery, DTDC, India Post, BlueDart, Xpressbees.

### Setup

1. **Create account:** [app.shiprocket.in](https://app.shiprocket.in)
2. **Add pickup address:** Settings → Pickup Locations → Add (your Elampillai warehouse)
3. **Set env vars:**
   ```env
   SHIPROCKET_EMAIL="your-api-user@email.com"
   SHIPROCKET_PASSWORD="your-password"
   SHIPROCKET_PICKUP_LOCATION="Elampillai"
   ```
4. **Pro tip:** Create a dedicated "API User" in Shiprocket rather than using your main account

### Flow

```
Admin → Orders → View order → "Create Shipment"
  ↓
POST /api/admin/orders/[id]/ship
  → Calls createShiprocketShipment()
  → Shiprocket auto-assigns AWB + courier partner
  → Returns { awb_code, courier_name, label_url }
  ↓
Order status → "shipped"
  → Sends shipping SMS to customer
  → Updates timeline
  ↓
Customer tracks via /api/orders/track
  → trackShiprocketShipment(awb) fetches live status
```

### Courier assignment

Shiprocket's "smart courier assignment" picks the best courier based on:
- Serviceability at destination pincode
- Cost (lowest among available)
- TAT (turnaround time)
- COD availability

---

## 3. Resend — Email

Modern email API for transactional emails. Built by ex-React team members.

### Setup

1. **Create account:** [resend.com](https://resend.com)
2. **Get API key:** API Keys → Create → starts with `re_`
3. **Verify domain (optional but recommended):**
   - Free tier: can only send FROM `onboarding@resend.dev`
   - Verified domain: send FROM `noreply@yourdomain.com`
4. **Set env vars:**
   ```env
   RESEND_API_KEY="re_XXXXXXXXXXXX"
   RESEND_FROM_EMAIL="onboarding@resend.dev"
   RESEND_REPLY_TO="support@nandhinitex.com"
   ```

### Email types

The app sends these emails automatically:

| Trigger | Email | Template |
|---|---|---|
| Order placed (COD) | Order Confirmation | `renderOrderConfirmationEmail()` |
| Payment captured (Razorpay) | Order Confirmation + Payment Receipt | `renderOrderConfirmationEmail()` |
| Order shipped | Shipping Notification | (use `sendEmail()` directly) |
| Order delivered | Delivery Confirmation | (use `sendEmail()` directly) |

All emails use the **Royal Heritage theme** (Navy `#081B3A` + Gold `#D4AF37` + Ivory `#FAF7F0`) with Cinzel/Playfair Display fonts.

---

## 4. MSG91 — SMS

India-focused SMS provider for transactional alerts.

### Setup

1. **Create account:** [msg91.com](https://msg91.com)
2. **Get auth key:** Dashboard → API → Auth Key
3. **Register sender ID:** 6 characters (e.g. `NDHTXT`) — requires DLT approval
4. **Register DLT template:** TRAI requires all transactional SMS to use an approved template
5. **Set env vars:**
   ```env
   MSG91_AUTH_KEY="your-auth-key"
   MSG91_SENDER_ID="NDHTXT"
   MSG91_TEMPLATE_ID="your-dlt-template-id"
   ```

### DLT template registration

Register these templates at [msg91.com/dlt](https://msg91.com/dlt):

**Order Confirmation:**
```
Dear {var1}, your order {var2} for Rs.{var3} is confirmed. Track at {var4}. - Nandhini Tex
```

**Shipping Notification:**
```
Dear {var1}, your order {var2} has been shipped via {var3}. AWB: {var4}. Track at {var5}. - Nandhini Tex
```

**Delivery Confirmation:**
```
Dear {var1}, your order {var2} has been delivered. Thank you for shopping with Nandhini Tex!
```

### SMS sending

The app sends SMS automatically:
- Order placed → `sendOrderConfirmationSMS()`
- Order shipped → `sendShippingSMS()`
- Order delivered → `sendDeliverySMS()`

All calls are non-blocking — if MSG91 fails, the order still succeeds.

---

## 5. Plausible — Analytics

Privacy-friendly, cookie-free analytics. No cookie banner needed (GDPR-compliant out of the box).

### Setup

1. **Create account:** [plausible.io](https://plausible.io) (or self-host)
2. **Add your site:** Sites → Add Site → enter your domain
3. **Set env vars:**
   ```env
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN="nandhinitex.com"
   NEXT_PUBLIC_PLAUSIBLE_SRC="https://plausible.io/js/script.js"
   # For self-hosted:
   # NEXT_PUBLIC_PLAUSIBLE_SRC="https://stats.yourdomain.com/js/script.js"
   ```

### What it tracks

- **Automatic:** Page views, bounce rate, visit duration, referrers, top pages
- **Custom events** (server-side via `trackPlausibleEvent()`):
  - `Order Placed` — with `revenue`, `paymentMethod`, `itemCount`
  - `Review Submitted` — with `rating`, `productId`

### Self-hosting

For zero-cost unlimited analytics:
```bash
docker run -d -p 8000:8000 plausible/analytics:latest
# Set NEXT_PUBLIC_PLAUSIBLE_SRC to http://your-server:8000/js/script.js
```

---

## 6. Sentry — Error Monitoring

Automatic capture of unhandled exceptions + performance tracing.

### Setup (requires installing the package)

```bash
bun add @sentry/nextjs
```

Then:

1. **Create account:** [sentry.io](https://sentry.io)
2. **Create a Next.js project** → get the DSN
3. **Set env vars:**
   ```env
   SENTRY_DSN="https://xxx@sentry.io/123"
   SENTRY_ORG="your-org"
   SENTRY_PROJECT="nandhini-tex"
   SENTRY_AUTH_TOKEN="sntrys_..."  # for source map upload at build time
   ```
4. **Create config files:**
   - `sentry.client.config.ts`
   - `sentry.server.config.ts`
   - Wrap `next.config.ts` with `withSentryConfig()`
5. **Uncomment the implementation** in `src/lib/integrations/sentry.ts`

### Current state

The Sentry integration is **stubbed** — `captureException()` and `captureMessage()` are available but fall back to `console.error` until `@sentry/nextjs` is installed. This means the app code already calls `captureException(err)` in catch blocks, so when Sentry is installed, it "just works" with no code changes.

---

## 7. Cloudflare Turnstile — CAPTCHA

Privacy-friendly CAPTCHA. Free, unlimited. Replaces Google reCAPTCHA.

### Why Turnstile over reCAPTCHA

- No cookie banner needed (GDPR-friendly)
- No "I'm not a robot" checkbox (invisible by default)
- No image challenges ("select all traffic lights")
- Free, unlimited

### Setup

1. **Create account:** [dash.cloudflare.com](https://dash.cloudflare.com/?to=/:account/turnstile)
2. **Add a site:** Turnstile → Add Site → enter your domain
3. **Copy keys:**
   - Site Key (public) → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - Secret Key (server) → `TURNSTILE_SECRET_KEY`
4. **Set env vars:**
   ```env
   NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAA..."
   TURNSTILE_SECRET_KEY="0x4AAAA..."
   ```

### Usage

The `verifyTurnstileToken()` function is available in:
- Review submission form
- Newsletter signup
- Admin login (recommended)

If not configured, verification fails **open** (forms work without CAPTCHA).

---

## 8. Z.AI SDK — AI Chatbot

The `z-ai-web-dev-sdk` is already installed. Enables:
- **LLM chatbot** for customer support
- **Image generation** for product mockups
- **Vision understanding** for image analysis
- **TTS/ASR** for voice features

### Setup

1. **Get API key:** from the Z.AI platform
2. **Set env var:**
   ```env
   ZAI_API_KEY="your-api-key"
   ```
3. **Use the Skill system:** invoke `Skill(command="LLM")`, `Skill(command="image-generation")`, etc.

### Important constraint

The Z.AI SDK **MUST be used backend-only** — never in client-side code. The API key must never reach the browser bundle.

---

## Integration Status API

### `GET /api/integrations/status`

Returns which integrations are configured (admin-only):

```json
{
  "integrations": [
    {
      "id": "razorpay",
      "name": "Razorpay (UPI, Cards, NetBanking)",
      "category": "payment",
      "isConfigured": true,
      "isRequired": false,
      "requiredEnvVars": ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
      "docsUrl": "https://dashboard.razorpay.com",
      "description": "India's leading payment gateway..."
    }
  ],
  "summary": {
    "payment": { "configured": 1, "total": 1, "missing": [] },
    "shipping": { "configured": 0, "total": 1, "missing": ["shiprocket"] },
    ...
  }
}
```

Used by the admin Settings page to show a checklist.

---

## Environment Variable Reference

See [`.env.third-party.example`](./.env.third-party.example) for the complete template with all integration env vars.

### Required for production

| Var | Description |
|---|---|
| `DATABASE_URL` | SQLite path or Postgres connection string |
| `ADMIN_PASSWORD` | Admin panel password (min 12 chars) |
| `ADMIN_SESSION_SECRET` | HMAC signing secret for session tokens |

### Payment

| Var | Description |
|---|---|
| `RAZORPAY_KEY_ID` | Public key (starts with `rzr_`) |
| `RAZORPAY_KEY_SECRET` | Secret key (server-only!) |
| `RAZORPAY_WEBHOOK_SECRET` | For verifying webhook signatures |

### Shipping

| Var | Description |
|---|---|
| `SHIPROCKET_EMAIL` | Shiprocket account email |
| `SHIPROCKET_PASSWORD` | Shiprocket account password |
| `SHIPROCKET_PICKUP_LOCATION` | Pickup location name (configured in Shiprocket dashboard) |

### Email

| Var | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key (starts with `re_`) |
| `RESEND_FROM_EMAIL` | Sender address (must be verified) |
| `RESEND_REPLY_TO` | Reply-to address (optional) |

### SMS

| Var | Description |
|---|---|
| `MSG91_AUTH_KEY` | MSG91 auth key |
| `MSG91_SENDER_ID` | 6-char sender ID (DLT-approved) |
| `MSG91_TEMPLATE_ID` | DLT template ID |

### Analytics

| Var | Description |
|---|---|
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Tracked domain (public) |
| `NEXT_PUBLIC_PLAUSIBLE_SRC` | Script URL (public) |
| `PLAUSIBLE_API_KEY` | Server-side API key for custom events |

### Monitoring

| Var | Description |
|---|---|
| `SENTRY_DSN` | Public DSN (ok in browser) |
| `SENTRY_AUTH_TOKEN` | Server token for source map upload (build only) |
| `SENTRY_ORG` | Sentry org slug |
| `SENTRY_PROJECT` | Sentry project slug |

### Security

| Var | Description |
|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key (server-only!) |

### AI

| Var | Description |
|---|---|
| `ZAI_API_KEY` | Z.AI API key (server-only!) |

---

## Adding a New Integration

1. **Create the module:** `src/lib/integrations/<service>.ts`
   - Export `isXConfigured()` function
   - Export the main API functions (e.g. `sendX()`, `verifyX()`)
   - Use `getEnv()` pattern — return `null` if not configured
   - Never throw if not configured — log a warning and return `null`/`false`

2. **Register in the index:** `src/lib/integrations/index.ts`
   ```ts
   import { isNewServiceConfigured } from "./new-service";
   // Add to INTEGRATIONS array
   ```

3. **Wire into the app:** Call the integration from the relevant route handler
   - Use `import()` (dynamic) to avoid loading if not configured
   - Use `.catch(() => {})` for non-critical calls (email/SMS/analytics)
   - Use `await` for critical calls (payment verification)

4. **Document the env vars:** Add to `.env.third-party.example` and this file

5. **Test:** Verify the app works with the integration both configured and not configured
