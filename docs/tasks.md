# tasks.md — Delivery Plan & Task Board

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Phase 0 — Foundations
- [ ] Initialize monorepo (`apps/storefront`, `apps/admin`, `apps/api`, `packages/*`) per `architecture.md §6`
- [ ] Set up Tailwind + design tokens from `design.md §2–3` in `packages/ui`
- [ ] Set up shared Framer Motion tokens in `packages/motion` (`design.md §6`)
- [ ] Prisma schema for core entities (`architecture.md §3`) + initial migration
- [ ] Seed script with real current catalog data (categories, sample products, testimonials, FAQs)
- [ ] Auth: mobile OTP + email login (storefront), JWT+RBAC (admin)
- [ ] CI/CD: lint, type-check, test, preview deploys (GitHub Actions)
- [ ] Base layout shells: storefront header/footer, admin left-nav shell

## Phase 1 — Storefront Core (MVP)
### Discovery
- [ ] Home page: hero, category rail, New Arrivals, Bestsellers, Bridal Collection, Offers, Menswear, testimonials, FAQ accordion, trust strip, newsletter
- [ ] Category/listing pages with filters (category, price, fabric, occasion, offer%) and sort
- [ ] Search with autosuggest (Meilisearch/Algolia integration)
- [ ] Product card component (image hover swap, badges, quick add-to-bag)

### PDP
- [ ] Image gallery + zoom
- [ ] 360° viewer (photo-sequence) — Phase 1 scope per ADR-003
- [ ] Deep-zoom border/pallu inspection
- [ ] Variant selection (color, size where applicable), stock status
- [ ] Pincode serviceability + COD check
- [ ] Fabric/weave detail block, blouse-included indicator
- [ ] Add to Bag / Buy Now / Wishlist
- [ ] Reviews module (display) + write-a-review (delivery-gated)
- [ ] Cross-sell: Complete the Look, You may also like, Recently viewed

### Cart & Checkout
- [ ] Cart drawer + full cart page (guest + logged-in, merge on login)
- [ ] Coupon code application
- [ ] Address form + pincode serviceability
- [ ] Payment integration (gateway per ADR-006) + COD flow with surcharge
- [ ] Inventory reservation on checkout start (ADR-008)
- [ ] Order confirmation page + email/SMS notification

### Account
- [ ] Register/login (OTP + email/password)
- [ ] Order history + tracking + invoice download
- [ ] Wishlist, saved addresses
- [ ] Return/exchange request flow

### Content
- [ ] FAQ page, About page, Policy pages (Shipping, Returns, Privacy, Terms, Saree Care, Size Guide)
- [ ] Contact page

## Phase 1 — Admin Panel Core
- [ ] Dashboard (sales overview, order status breakdown, low-stock alerts, top products)
- [ ] Product CRUD (multi-step form: Details → Images/3D → Pricing/Inventory → SEO → Publish)
- [ ] Bulk actions (price/stock update, CSV import/export)
- [ ] Category/collection management
- [ ] Order management (list, detail, status updates, manual order creation, refunds)
- [ ] Customer management (list, profile, segments)
- [ ] Review moderation (approve/reject/reply/feature)
- [ ] Coupon engine (create/edit, restrictions, usage limits)
- [ ] Content management (FAQ, policies, About, testimonials)
- [ ] Settings: shipping rules, payment config, roles/permissions, tax/invoice
- [ ] Audit log

## Phase 2 — Motion & 3D Polish
- [ ] Scroll-reveal + stagger animations across homepage sections
- [ ] Hero parallax + headline stagger-in
- [ ] Micro-interactions: add-to-bag bounce, wishlist heart burst, mini-cart slide-in
- [ ] Reduced-motion audit across all animated components
- [ ] True 3D glTF drape viewer for Bridal + Designer collections (ADR-003 Phase 2)
- [ ] Courier tracking integration (Shiprocket or chosen aggregator) with live AWB status in account + admin

## Phase 3 — Growth / Nice-to-Have
- [ ] Loyalty/rewards program (pending decision)
- [ ] Bridal consultation/styling booking flow (pending decision)
- [ ] Tamil/Hindi localization
- [ ] Referral program
- [ ] Marketing automation (abandoned cart email/WhatsApp)
- [ ] Native app shell (PWA install → future native)

## Testing & Launch Checklist
- [ ] Cross-device QA (mobile-first, per `design.md §10` breakpoints)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance audit (LCP < 2.5s target)
- [ ] Payment + COD end-to-end test (including failure/retry paths)
- [ ] Inventory oversell stress test
- [ ] SEO check: structured data, sitemap, meta tags
- [ ] Analytics events verified (incl. `3d_viewer_engaged` per PRD success metric)
- [ ] Content migration verified (categories, prices, testimonials, FAQs match current site)
- [ ] Soft launch → monitor → full launch

## Ownership Template (fill in per team)
| Task Group | Owner | Target Date | Status |
|---|---|---|---|
| Foundations | | | |
| Storefront Core | | | |
| Admin Core | | | |
| Motion & 3D Polish | | | |
| Launch QA | | | |
