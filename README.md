# Nandhini Tex — Handwoven Sarees E-Commerce Platform

> Elegance woven through generations — a production-ready Next.js 16 storefront + admin panel for a handloom saree business based in Elampillai, Tamil Nadu.

![Tech Stack](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4) ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748) ![License](https://img.shields.io/badge/License-MIT-green)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Reference](#api-reference)
- [Admin Panel](#admin-panel)
- [Deployment](#deployment)
- [Mobile & Accessibility](#mobile--accessibility)
- [License](#license)

---

## Overview

**Nandhini Tex** is a single-vendor e-commerce platform for handwoven silk and cotton sarees from Tamil Nadu. It ships a customer-facing storefront (home, category, product, cart, checkout, search, order tracking) and a complete admin panel (dashboard, products, inventory, orders, customers, reviews, coupons, content, settings) — all running on a single Next.js route (`/`).

The catalog is seeded with **105 products, 9 categories, 79 variants, 4 coupons**, plus testimonials, FAQs, and customer records.

### Business context

- Located in Elampillai, Salem, Tamil Nadu, India
- Handloom-first brand story; master weavers from Elampillai, Kanchipuram, Arani
- COD + prepaid (UPI, cards, net banking) across India
- Ships via Delhivery, DTDC, India Post
- 4.8★ average rating from 2,450+ reviews
- Price range: ₹249 (offer sarees) to ₹35,000 (grand bridal Kanchipuram silk)

---

## Features

### Storefront
- **Hero & trust strip** with handwoven / pan-India shipping / 7-day returns messaging
- **Category rail** with 8 collections (Silk Varieties, Bridal & Pattu, Cotton Collections, Fancy & Printed, Ethnic Sets & Combos, Celebrity Collections, etc.)
- **Product rails**: New Arrivals, Bestsellers, Bridal Collection, Festival Collection, Menswear
- **All Products page** with sticky category pills, sort, price/fabric filters, density toggle, infinite scroll pagination
- **Category page** with description banner and product grid
- **PDP (Product Detail Page)** with:
  - Gallery / 360° view / Deep Zoom modes
  - Color + size + variant selection
  - Stock urgency, blouse matching guide, fabric/weave/zari details
  - Pincode delivery check
  - Bulk & uniform inquiry module
  - WhatsApp order integration (auto-fills product details)
  - Customer reviews with rating distribution + review form
  - Related products
  - **Sticky mobile add-to-cart bar** (safe-area aware)
- **Cart drawer + three-step checkout** (cart → address → payment → confirmation)
- **Search** with live query
- **Track Order** page (by order number or phone)
- **Wishlist drawer** + **Quick View modal**
- **Live Chat widget** with WhatsApp deep link
- **Mobile bottom nav** (Home, Shop, Wishlist, Account, Bag)
- **Festive banner** marquee, scroll progress bar, back-to-top, page loader
- **Skeleton loaders** for home, product rails, product grids, PDP

### Admin Panel (`mode: "admin"`)
- **Dashboard** with revenue chart, order status, payment breakdown, recent orders, top products, low-stock alerts, system health widget
- **Products** — searchable, filterable table; add/edit/delete with variant management
- **Inventory** — bulk stock update; per-variant editing
- **Orders** — list, filter, view detail, update status/courier
- **Customers** — segment, total spent, notes
- **Reviews** — moderate pending/approved/rejected
- **Coupons** — CRUD with usage limits and validity windows
- **Content** — testimonials + FAQs management
- **Settings** — store info, shipping, payment config

### SEO / GEO / AEO
- Server-rendered JSON-LD structured data (Organization, WebSite, Product, BreadcrumbList, FAQPage)
- `sitemap.ts` with dynamic product URLs
- `robots.txt` and `manifest.json`
- Keyword-rich, location-targeted sr-only content for crawlers
- Open Graph + canonical URLs

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, `output: "standalone"`) |
| Language | **TypeScript 5** (strict) |
| Styling | **Tailwind CSS 4** with **shadcn/ui** (New York) + Lucide icons |
| Database | **Prisma 6** ORM with **SQLite** (file-based, zero-config) |
| State | **Zustand** (client) + **TanStack Query** (server, available) |
| Forms | **React Hook Form** + **Zod** |
| Animation | **Framer Motion** |
| Toasts | **Sonner** |
| Charts | **Recharts** |
| Auth | **NextAuth.js v4** (available, not required for single-admin) |
| Runtime | **Bun** (dev) / **Node.js 20+** (production) |
| AI SDK | **z-ai-web-dev-sdk** (backend only — never client-side) |

### Theme — "Royal Heritage"
- Navy `#081B3A` · Gold `#D4AF37` · Ivory `#FAF7F0`
- Display: **Cinzel** · Serif: **Playfair Display** · Body: **Inter** · Accents: **Cormorant Garamond**

---

## Project Structure

```
.
├── prisma/
│   ├── schema.prisma            # 10 models — Category, Product, Variant, Review, Order, Coupon, Testimonial, Faq, NewsletterSubscriber, Customer
│   ├── seed.ts                  # Base seed (categories, coupons, FAQs, testimonials)
│   └── seed-full-catalog.ts     # 105-product catalog seed
├── src/
│   ├── app/
│   │   ├── page.tsx             # Single route — renders Storefront + AdminApp based on Zustand mode
│   │   ├── layout.tsx           # Root layout, fonts, metadata
│   │   ├── globals.css          # Tailwind v4 theme tokens
│   │   ├── sitemap.ts            # Dynamic sitemap
│   │   └── api/
│   │       ├── products/         # Public product list + detail
│   │       ├── categories/
│   │       ├── orders/           # Create + track orders
│   │       ├── reviews/          # Public submit + list
│   │       ├── coupons/validate/
│   │       ├── testimonials/
│   │       ├── faqs/
│   │       ├── newsletter/
│   │       ├── search/
│   │       ├── dashboard/        # Admin aggregated metrics
│   │       ├── health/           # System health probe
│   │       ├── status/          # Version + uptime
│   │       ├── docs/            # OpenAPI-style HTML docs at /api/docs
│   │       ├── metrics/         # Prometheus-style metrics
│   │       └── admin/           # Admin CRUD: products, orders, inventory, customers, coupons, faqs, reviews, testimonials, categories
│   ├── components/
│   │   ├── ui/                  # 50+ shadcn/ui primitives (button, dialog, table, sheet, etc.)
│   │   ├── storefront/          # Header, Footer, Home, Category, AllProducts, PDP, Cart, Search, Track, skeletons
│   │   └── admin/               # admin-app.tsx (3700+ lines — full admin in one file)
│   ├── lib/
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── store.ts             # Zustand store (mode, view, cart, wishlist — persisted)
│   │   ├── format.ts            # formatINR, formatDate, types
│   │   ├── whatsapp.ts          # WhatsApp deep-link builders
│   │   ├── seo.ts               # JSON-LD schema generators
│   │   ├── product-utils.ts     # slug uniqueness, MRP fallback, variant SKU normalization
│   │   ├── motion.ts            # Framer Motion easing presets
│   │   └── utils.ts             # cn(), misc helpers
│   └── hooks/                   # use-toast, use-mobile, use-is-client
├── public/                      # logo.svg, manifest.json, robots.txt, llms.txt, patterns/
├── mini-services/               # Optional independent Bun services (e.g. websocket)
├── examples/                    # websocket demo reference
├── Caddyfile                    # Gateway config — port 81 forwards to :3000 or ?XTransformPort=N
├── next.config.ts               # standalone output, image remote patterns
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js 20+** or **Bun 1.1+** (recommended — significantly faster)
- SQLite (bundled with the OS — no separate server needed)

### Install & run locally

```bash
# 1. Install dependencies
bun install

# 2. Set up environment
cp .env.example .env
# Edit .env if you need a custom DATABASE_URL (default: file:./db/custom.db)

# 3. Push schema + seed the database
bun run db:push
bun run db:seed           # base data: categories, coupons, FAQs, testimonials
bun run db:seed-full      # optional: full 105-product catalog

# 4. Start the dev server
bun run dev
# → http://localhost:3000
```

The dev server writes to `dev.log` — tail it with `tail -f dev.log`.

---

## Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start Next.js dev server on port 3000 (logs to `dev.log`) |
| `bun run build` | Production build — emits `.next/standalone` server + copies static + public |
| `bun run start` | Start the standalone production server |
| `bun run lint` | ESLint (Next.js + strict TypeScript rules) |
| `bun run db:push` | Push Prisma schema to SQLite (uses `--accept-data-loss`) |
| `bun run db:generate` | Regenerate Prisma Client |
| `bun run db:migrate` | Create + apply a migration (dev) |
| `bun run db:reset` | Drop + recreate + seed (dev) |
| `bun run db:seed` | Seed base reference data |
| `bun run db:seed-full` | Seed full 105-product catalog |

---

## Environment Variables

Create a `.env` file in the project root. See [`.env.example`](./.env.example) for the template.

```env
# Database — SQLite file (relative to project root)
DATABASE_URL="file:./db/custom.db"

# NextAuth (optional — admin uses simple mode switch by default)
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Site URL (used for SEO canonical URLs + sitemap)
NEXT_PUBLIC_SITE_URL="https://nandhinitex.example.com"

# WhatsApp business number (India)
NEXT_PUBLIC_WHATSAPP_NUMBER="917604811838"

# Optional — z-ai-web-dev-sdk for AI features (chatbot, image gen)
ZAI_API_KEY=""
```

---

## Database

The schema defines **10 models**:

| Model | Purpose |
|---|---|
| `Category` | Product collections (slug, bannerImage, productCount) |
| `Product` | Catalog items with prices, fabric, weave, zari, blouse info, ratings |
| `Variant` | Color/size/SKU combinations per product (stock + price override) |
| `Review` | Customer reviews with moderation status |
| `Order` | Full order record (items, shipping, payment, courier, timeline) |
| `Coupon` | Percent / flat discounts with usage limits + validity |
| `Testimonial` | Featured customer quotes |
| `Faq` | Categorized FAQs (Shipping / Returns / COD / Payments / Sarees / Care) |
| `NewsletterSubscriber` | Email captures |
| `Customer` | Aggregated customer view (auto-derived from orders) |

### Switching to PostgreSQL / MySQL

The schema is portable. To switch databases:

1. Change `provider` in `prisma/schema.prisma` from `"sqlite"` to `"postgresql"` (or `"mysql"`)
2. Update `DATABASE_URL` in `.env` to your connection string
3. Run `bun run db:push`

Note: SQLite stores JSON-encoded arrays in `String` columns (e.g. `Product.images`, `Order.items`). When migrating to Postgres, consider migrating these to `Json` columns.

---

## API Reference

All routes are under `/api/`. Visit `/api/docs` in the running app for an interactive HTML reference.

### Public endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List products — supports `?sort`, `?category`, `?limit`, `?isNew`, `?isBestseller`, `?minPrice`, `?maxPrice`, `?fabric`, `?q` |
| GET | `/api/products/[slug]` | Product detail with variants + related products |
| GET | `/api/categories` | All categories with product counts |
| GET | `/api/search?q=` | Full-text search |
| GET | `/api/testimonials` | Featured testimonials |
| GET | `/api/faqs` | FAQs by category |
| GET | `/api/orders/track?q=` | Track by order number or phone |
| POST | `/api/orders` | Place an order |
| POST | `/api/reviews` | Submit a product review (auto-marked `pending`) |
| POST | `/api/coupons/validate` | Validate + apply coupon code |
| POST | `/api/newsletter` | Subscribe to newsletter |

### Admin endpoints

All admin routes are under `/api/admin/*` and provide full CRUD:

- `/api/admin/products` (GET, POST) and `/api/admin/products/[id]` (PUT, DELETE)
- `/api/admin/orders` (GET) and `/api/admin/orders/[id]` (GET, PUT)
- `/api/admin/inventory` (GET), `/api/admin/inventory/[variantId]` (PUT), `/api/admin/inventory/bulk` (POST)
- `/api/admin/customers` (GET)
- `/api/admin/coupons` (GET, POST) and `/api/admin/coupons/[id]` (PUT, DELETE)
- `/api/admin/categories` (GET, POST) and `/api/admin/categories/[id]` (PUT, DELETE)
- `/api/admin/reviews` (GET) and `/api/admin/reviews/[id]` (PUT — approve/reject)
- `/api/admin/faqs` (GET, POST) and `/api/admin/faqs/[id]` (PUT, DELETE)
- `/api/admin/testimonials` (GET, POST) and `/api/admin/testimonials/[id]` (PUT, DELETE)
- `/api/dashboard` — aggregated metrics for the admin dashboard

### System endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | DB ping + uptime + service latencies |
| GET | `/api/status` | Build version + commit + uptime |
| GET | `/api/metrics` | Prometheus-style metrics |
| GET | `/api/docs` | HTML API reference |

---

## Admin Panel

The admin panel is **not a separate route** — it's a full-screen overlay that renders when the Zustand `mode` state is set to `"admin"`.

### How to access

1. Click the **Admin** button in the storefront header (desktop) or in the mobile menu
2. Or set `mode: "admin"` in the persisted Zustand store (`localStorage["nandhini-tex-store"]`)
3. The admin app takes over the viewport (`fixed inset-0 z-[100]`)

### How to exit

- Click the avatar dropdown (top-right) → **Exit to Store**
- Or programmatically: `useStore.getState().setMode("store")`

### Admin views

Dashboard · Products · Inventory · Orders · Customers · Reviews · Coupons · Content · Settings

---

## Deployment

See [**DEPLOYMENT.md**](./DEPLOYMENT.md) for complete guides covering:

- **Vercel** (zero-config)
- **Self-hosted with Node + Caddy** (current sandbox setup)
- **Docker / Fly.io / Railway**
- **Static export caveats**
- Production checklist + health verification

### Quick start — production build

```bash
# 1. Build (emits .next/standalone/)
bun run build

# 2. Run the standalone server
bun run start
# → http://localhost:3000
```

The standalone server is fully self-contained — no `node_modules` needed at runtime, just `.next/standalone/`, `.next/static/`, and `public/`.

---

## Mobile & Accessibility

This project follows **mobile-first, WCAG AA** standards:

- Touch targets ≥ 36–44px on all interactive elements (verified at 375×667 and 390×844)
- Sticky mobile add-to-cart bar with iOS safe-area inset support
- Mobile bottom navigation (Home / Shop / Wishlist / Account / Bag)
- Skeleton loaders mirror real layouts — no layout shift on data arrival
- ARIA labels on all icon-only buttons; `aria-busy` on loading regions
- Semantic HTML (`main`, `header`, `nav`, `section`, `article`)
- Reduced-motion support via `framer-motion`'s `useReducedMotion`
- No horizontal overflow on any viewport down to 320px

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Acknowledgements

- Handwoven sarees from master weavers of Elampillai, Kanchipuram, and Arani, Tamil Nadu
- Built with Next.js 16, Tailwind CSS 4, shadcn/ui, Prisma, and Framer Motion
- Customer support: **+91 76048 11838** (Mon–Sat, 10am–7pm IST)
