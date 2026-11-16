# Architecture.md — Nandhini Tex E-Commerce Platform

## 1. High-Level Architecture
```
                      ┌──────────────────────────┐
                      │        CDN / Edge         │  (images, static assets, ISR cache)
                      └────────────┬──────────────┘
                                   │
        ┌──────────────────────────┴───────────────────────────┐
        │                                                       │
┌───────▼────────┐                                     ┌────────▼────────┐
│  Storefront Web │  Next.js (App Router), SSR/SSG/ISR  │   Admin Panel    │  Next.js (SPA-like, CSR-heavy)
│  + Framer Motion│                                     │  (separate app)  │
└───────┬────────┘                                     └────────┬────────┘
        │                REST/GraphQL over HTTPS                │
        └───────────────────────────┬───────────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   API Gateway / BFF   │  (auth, rate limit, request shaping)
                          └──────────┬──────────┘
                                     │
      ┌──────────────┬──────────────┼──────────────┬──────────────┐
┌─────▼─────┐  ┌──────▼─────┐ ┌─────▼─────┐  ┌──────▼─────┐ ┌──────▼──────┐
│  Catalog   │  │   Orders    │ │  Users/    │  │  Reviews   │ │  Marketing/  │
│  Service   │  │  & Cart svc │ │  Auth svc  │  │  service   │ │  Coupons svc │
└─────┬─────┘  └──────┬─────┘ └─────┬─────┘  └──────┬─────┘ └──────┬──────┘
      │               │             │               │              │
      └───────┬───────┴──────┬──────┴───────┬───────┴──────┬───────┘
              │               │              │              │
        ┌─────▼─────┐  ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼──────┐
        │  Postgres  │  │   Redis     │ │  Object     │ │  Search      │
        │  (primary) │  │  (cache/    │ │  Storage    │ │  (Meilisearch│
        │            │  │   sessions) │ │  (S3/R2)    │ │  /Algolia)   │
        └────────────┘  └────────────┘ └────────────┘ └──────────────┘

External integrations: Payment Gateway (Razorpay/Cashfree), Courier/Shipping
Aggregator (Shiprocket/Delhivery API), SMS/WhatsApp (MSG91/Gupshup), Email (Resend/SES)
```

For Phase 1, this can be a **modular monolith** (single deployable backend with clearly separated modules mirroring the services above) rather than true microservices — split into services later only if scale demands it. This is documented as a formal decision in `decisions.md`.

## 2. Suggested Stack
| Layer | Choice | Rationale |
|---|---|---|
| Storefront framework | **Next.js 14+ (App Router)** | SSR/SSG/ISR for SEO + performance, React Server Components reduce client JS |
| Admin panel framework | **Next.js (CSR-heavy) or Vite + React** | Data-dense, less SEO concern, faster iteration |
| Styling | **Tailwind CSS + CSS variables (design tokens)** | Matches design.md token system, fast to theme |
| Animation | **Framer Motion** | Declarative, matches design.md motion system, good RSC compatibility with `"use client"` boundaries |
| 3D | **three.js + @react-three/fiber + @react-three/drei** | Best React-ecosystem fit for 3D/360 viewer |
| Backend | **Node.js (NestJS or Express/Fastify) or Next.js Route Handlers as BFF over a service layer** | TypeScript end-to-end shares types with frontend |
| Database | **PostgreSQL** (primary), **Redis** (cache, cart session, rate limiting) | Relational integrity for orders/inventory; Redis for speed |
| ORM | **Prisma** | Type-safe schema, good DX, migrations |
| Search | **Meilisearch** (self-hosted) or **Algolia** (managed) | Fast typo-tolerant product search/autosuggest |
| Object storage | **AWS S3 / Cloudflare R2** | Product images, 3D assets (glTF/KTX2), review photos |
| CDN/Image optimization | **Cloudflare / Next.js Image + Cloudinary or imgix** | Responsive images, on-the-fly resize for 3:4 cards |
| Auth | **NextAuth/Auth.js (storefront: OTP + email) / custom JWT + RBAC (admin)** | Mobile OTP is critical for India; admin needs strict RBAC |
| Payments | **Razorpay or Cashfree** (UPI, cards, netbanking, COD flag) | Best India-market coverage, good webhook support |
| Shipping/courier | **Shiprocket API** (aggregates Delhivery/DTDC/India Post) | Matches stated couriers, single integration point |
| Notifications | **MSG91/Gupshup (SMS+WhatsApp), Resend/SES (email)** | Order confirmations, OTP, shipping updates |
| Search analytics / product analytics | **PostHog or GA4 + server-side events** | Funnel tracking, 3D-viewer engagement metric from PRD |
| Hosting | **Vercel (storefront) + Railway/Render/AWS ECS (backend, admin)** or a single AWS/GCP deployment | Vercel ISR pairs well with Next.js; backend can be containerized |
| CI/CD | **GitHub Actions** → preview deployments, lint/type-check/test gates | Standard, matches GitHub-based repo |

## 3. Domain Model (Core Entities)
```
Product
 ├─ id, slug, title, description, category_id, tags[]
 ├─ status (draft|published|archived)
 ├─ base_price, mrp, discount_pct (derived)
 ├─ fabric_type, weave_origin, weave_days, zari_type, care_instructions
 ├─ blouse_included (bool), blouse_length_m
 ├─ media[] (images, video, 3d_model_ref, 360_sprite_ref)
 ├─ seo { meta_title, meta_description }
 └─ variants[] → Variant { color, size?, sku, stock_qty, price_override? }

Category
 ├─ id, name, slug, parent_id?, banner_image, sort_order

Cart
 ├─ id, user_id?, session_id (guest), items[] { variant_id, qty }, coupon_code?

Order
 ├─ id, order_number, user_id?, status, payment_status, payment_method
 ├─ items[] { variant_id, qty, price_at_purchase }
 ├─ shipping_address, billing_address
 ├─ courier { name, awb, tracking_url }
 ├─ totals { subtotal, discount, shipping_fee, cod_surcharge, tax, grand_total }
 └─ timeline[] { status, timestamp, note }

User
 ├─ id, name, phone, email, password_hash?, role (customer|admin|catalog_mgr|order_mgr|support)
 ├─ addresses[], wishlist[], default_payment_tokens[]

Review
 ├─ id, product_id, user_id, order_id (verified purchase link), rating, title, body
 ├─ media[] (photo/video), status (pending|approved|rejected), helpful_count

Coupon
 ├─ code, type (percent|flat), value, min_cart_value, category_scope?, product_scope?
 ├─ usage_limit, per_user_limit, starts_at, expires_at

Content
 ├─ FAQ { question, answer, category }
 ├─ Page { slug, title, body_richtext } (About, Policies)
 └─ Testimonial { name, city, quote, rating, featured }
```

## 4. API Surface (representative)
```
# Storefront (public/BFF)
GET  /api/products?category=&price=&sort=&page=
GET  /api/products/:slug
GET  /api/categories
GET  /api/search?q=
POST /api/cart, GET /api/cart, PATCH /api/cart/items/:id, DELETE /api/cart/items/:id
POST /api/cart/apply-coupon
POST /api/checkout/serviceability?pincode=
POST /api/orders                     # create order, returns payment intent
POST /api/payments/webhook           # gateway webhook (server-to-server)
GET  /api/orders/:id, GET /api/users/me/orders
POST /api/reviews                    # gated to delivered orders
GET  /api/reviews?product_id=
POST /api/wishlist, DELETE /api/wishlist/:id
POST /api/auth/otp/request, POST /api/auth/otp/verify

# Admin (RBAC-protected)
CRUD /admin/api/products
CRUD /admin/api/categories
CRUD /admin/api/coupons
GET/PATCH /admin/api/orders, /admin/api/orders/:id/status
CRUD /admin/api/reviews (moderate)
CRUD /admin/api/content (faq, pages, testimonials)
GET  /admin/api/dashboard/summary
CRUD /admin/api/users (roles)
GET  /admin/api/audit-log
```

## 5. Non-Functional Architecture Concerns
- **Caching:** ISR (revalidate on product/category publish webhook) for storefront pages; Redis cache for hot product lists and cart sessions; CDN edge cache for images/3D assets.
- **Inventory consistency:** stock decrement happens transactionally at order-placement (reserve on checkout start, release on payment failure/timeout via TTL reservation in Redis) to avoid overselling on flash offers.
- **Idempotency:** order creation and payment webhook handlers use idempotency keys to survive retries.
- **Search indexing:** product create/update triggers async job to sync Meilisearch/Algolia index.
- **Media pipeline:** upload → virus/type scan → resize variants (thumbnail/card/zoom) → optional 3D asset compression (Draco/KTX2) → store in object storage + CDN.
- **Observability:** structured logging, error tracking (Sentry), uptime monitoring, funnel/product analytics (PostHog/GA4) including a custom `3d_viewer_engaged` event to track the PRD success metric.
- **Security:** RBAC middleware on all `/admin/api/*`, OTP rate-limiting, payment webhook signature verification, input validation (zod), CSRF protection on admin forms, audit log of admin mutations.
- **Environments:** local → staging (preview per PR) → production; seed data scripts to load the current catalog (categories, sample products, testimonials, FAQs from existing site) into staging.

## 6. Repository Structure (proposed monorepo)
```
/apps
  /storefront        # Next.js customer-facing app
  /admin              # Next.js/Vite admin panel
  /api                # Backend service (NestJS/Fastify) — modules: catalog, orders, users, reviews, marketing, content
/packages
  /ui                 # Shared design-system components (buttons, cards, badges)
  /motion             # Shared Framer Motion tokens/variants (design.md §6)
  /three               # Shared 3D/360 viewer component
  /types               # Shared TS types/DTOs (Prisma-generated + zod schemas)
  /config              # ESLint, tsconfig, tailwind config presets
/infra
  /prisma              # schema.prisma, migrations, seed.ts
  /docker              # Dockerfiles, docker-compose for local dev
docs/
  prd.md, design.md, architecture.md, agents.md, decisions.md, tasks.md
```

## 7. Deployment Topology
- **Storefront:** Vercel (or self-hosted Next.js on Node), edge caching + ISR revalidation webhooks from admin publish actions.
- **Admin:** separate subdomain (e.g., `admin.nandhinitex.com`), IP-agnostic but behind auth + optional IP allowlist for extra safety.
- **API:** containerized service, autoscaled behind the API gateway/load balancer; separate worker process for async jobs (search indexing, media processing, notification sending) via a queue (BullMQ on Redis).
- **Database:** managed Postgres (e.g., Supabase/RDS) with daily backups + PITR.
