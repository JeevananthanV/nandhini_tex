# Changelog

All notable changes to **Nandhini Tex** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] — 2025-01-XX

### Mobile responsiveness & UI/UX polish

#### Fixed
- **Storefront header**: mobile menu button bumped from 20×20px to 40×40px touch target with centered icon and hover state
- **Logo button**: added `min-h-10 py-1` for proper touch area
- **Festive banner**: dismiss button enlarged from 14×14px to 32×32px with hover background; repositioned to avoid cropping on small screens
- **LiveChat popup**: replaced fixed `w-[300px]` with responsive `w-[min(340px,calc(100vw-2rem))]` plus `left-4 right-4 md:left-6 md:right-auto` so it never overflows on small viewports
- **PDP action row**: now uses `flex-wrap` with `min-w-[140px]` / `min-w-[120px]` so quantity + Add to Bag + Buy Now + Wishlist wrap gracefully on narrow screens
- **Cart page line items**: qty −/+ buttons enlarged from 32×32px to 36×36px; remove button converted from text-only to 36×36px icon button with destructive hover state
- **Admin topbar**: mobile menu button enlarged from 36×36px to 40×40px
- **Admin system health widget**: wrapped with `flex-col sm:flex-row` so the Uptime/Response/API Docs cluster wraps below the status on mobile instead of overflowing
- **All products category pills**: upgraded from `py-1.5` (30px) to `flex h-9 items-center` (36px) for consistent touch target sizing
- **Product card wishlist button**: enlarged from 32×32px to 36×36px across all product grids

#### Added
- **Sticky mobile add-to-cart bar** on PDP — fixed to bottom of viewport on screens < 768px, showing price + Add to Bag + Buy Now + Wishlist, with `env(safe-area-inset-bottom)` padding for iOS notch support
- Spacer divs on PDP to prevent the sticky bar from covering related products
- **Touch target audit**: verified all interactive elements meet WCAG AA 44px minimum on iPhone SE (375×667) and iPhone 14 (390×844)

#### Skeleton loading (existing — verified in this release)
- `HomeSkeleton`, `ProductRailSkeleton`, `ProductGridSkeleton`, `ProductCardSkeleton`, `PdpSkeleton` in `src/components/storefront/skeletons.tsx`
- `DashboardSkeleton` in admin app
- Per-row `<Skeleton className="h-10 w-full">` rows in Products / Orders / Customers / Coupons / FAQs / Reviews admin tables
- Inline skeleton on Track Order page

### Verification
- `bun run lint`: 0 errors / 0 warnings
- Mobile viewport tests (375×667, 390×844): no horizontal overflow on home, all-products, PDP, search, cart, admin dashboard, admin products
- PDP sticky bar buttons measure 114×44 / 114×44 / 44×44 — all meet WCAG 44px minimum
- Admin dashboard: zero small touch targets in overlay
- Dev server log: clean 200 responses, no runtime errors

---

## [0.2.1] — Admin product CRUD hardening

### Fixed
- **POST `/api/admin/products`**: added required-field validation (400 on missing title/basePrice/categoryId), category existence check, try/catch with friendly 500 messages; category `productCount` auto-incremented on create
- **PUT/DELETE `/api/admin/products/[id]`**: proper 404 handling for missing products; DELETE now decrements category `productCount` (clamped at 0)
- **Admin product form UI**: toast now displays specific API error messages; MRP field shows "Optional" hint

### Added
- New `src/lib/product-utils.ts` with helpers:
  - `uniqueSlug` — prevents collisions by appending `-2`, `-3`, etc.
  - `safeMrp` — falls back to `basePrice` when MRP is empty
  - `normalizeVariants` — auto-generates SKUs like `NT-QTKS-MARO-01`
  - `teaserFrom` — derives short description from full description

### Verification
- Added a product via admin UI → toast "Product added"; storefront API immediately reflects the new item; product count went 105 → 106
- Deleted the product via confirm dialog → count returned 106 → 105; product removed from public storefront
- Lint: 0 errors / 0 warnings

---

## [0.2.0] — Premium storefront + admin panel

### Added
- **Royal Heritage theme**: Navy `#081B3A` / Gold `#D4AF37` / Ivory `#FAF7F0`; Cinzel / Playfair Display / Cormorant Garamond / Inter fonts
- **Storefront sections**: Hero, Trust Strip, Category Rail, New Arrivals, Bestsellers, Bridal Collection, Festival Collection (with CountdownTimer), Menswear, Story/Counters, Instagram Feed, Testimonials, FAQs, Newsletter
- **All Products page**: sticky category pills, sort (popularity / newest / price / rating), price range + fabric filters, density toggle (3/4 cols), infinite scroll pagination, mobile filter Sheet
- **Category page**: banner with description, product grid, breadcrumb
- **PDP**: Gallery / 360° view / Deep Zoom modes; color + size + variant selection; stock urgency; blouse matching guide; fabric/weave/zari details; pincode delivery check; bulk & uniform inquiry module; WhatsApp order integration; customer reviews with rating distribution + review form; related products; lightbox
- **Cart drawer + three-step checkout** (cart → address → payment → confirmation) with COD surcharge, free-shipping threshold (₹999), coupon validation
- **Search page** with live query
- **Track Order page** (by order number or phone) with timeline visualization
- **Wishlist drawer** + **Quick View modal**
- **Live Chat widget** with WhatsApp deep link
- **Mobile bottom nav** (Home / Shop / Wishlist / Account / Bag)
- **Festive banner** marquee, scroll progress bar, back-to-top, page loader, gradient mesh background

- **Admin panel** (full-screen overlay):
  - Dashboard: revenue chart (Recharts), order status breakdown, payment methods, recent orders, top products, low-stock alerts, pending reviews, system health widget
  - Products: searchable/filterable table; add/edit/delete dialog with variant management
  - Inventory: bulk stock update; per-variant editing
  - Orders: list, filter, view detail, update status/courier
  - Customers: segment, total spent, notes
  - Reviews: moderate pending/approved/rejected
  - Coupons: CRUD with usage limits and validity windows
  - Content: testimonials + FAQs management
  - Settings: store info, shipping, payment config

- **API surface** — 30+ endpoints under `/api/`:
  - Public: products, categories, search, orders, reviews, coupons/validate, testimonials, faqs, newsletter
  - Admin: full CRUD for products, orders, inventory, customers, coupons, faqs, reviews, testimonials, categories
  - System: health, status, metrics, docs

- **SEO/GEO/AEO**: server-rendered JSON-LD (Organization, WebSite, Product, BreadcrumbList, FAQPage), `sitemap.ts`, `robots.txt`, `manifest.json`, `llms.txt`, keyword-rich sr-only content
- **Database**: 10 Prisma models (Category, Product, Variant, Review, Order, Coupon, Testimonial, Faq, NewsletterSubscriber, Customer)
- **Seed data**: 105 products, 9 categories, 79 variants, 4 coupons, plus testimonials, FAQs, customer records

---

## [0.1.0] — Initial scaffold

### Added
- Next.js 16 with App Router, TypeScript 5, Tailwind CSS 4
- shadcn/ui component library (50+ primitives, New York style)
- Prisma ORM with SQLite
- Zustand store with persistence
- Framer Motion animations
- Project structure: `src/app`, `src/components/{ui,storefront,admin}`, `src/lib`, `src/hooks`
- Caddyfile gateway configuration for sandbox
