# decisions.md — Architecture & Product Decision Log

Format: **ADR-XXX — Title** | Status | Context | Decision | Consequences

---

### ADR-001 — Modular monolith over microservices for Phase 1
**Status:** Accepted
**Context:** Team is small; PRD scope is a single-vendor storefront + admin panel, not a large multi-tenant marketplace.
**Decision:** Build one backend service (`apps/api`) internally organized into modules (catalog, orders, users, reviews, marketing, content) mirroring the logical services in `architecture.md`, instead of separate deployable microservices.
**Consequences:** Faster initial development, simpler ops/deploy. Revisit and split into services only if a specific module needs independent scaling (e.g., search/catalog under heavy load) — module boundaries are kept clean specifically to make that split possible later.

---

### ADR-002 — Next.js App Router for storefront (SSR/ISR)
**Status:** Accepted
**Context:** SEO matters for organic saree/category search traffic; PDP and category pages change relatively infrequently (catalog updates), so full CSR would hurt discoverability and initial load performance.
**Decision:** Use Next.js App Router with ISR for product/category pages, revalidated via webhook when admin publishes changes; client components only for interactive islands (cart, gallery, 3D viewer, forms).
**Consequences:** Better Core Web Vitals and SEO; requires care around server/client component boundaries (documented in `agents.md §3.5`).

---

### ADR-003 — 360° photo-based viewer first, true 3D glTF as Phase 2
**Status:** Accepted
**Context:** PRD requires a signature 3D/motion product experience (`design.md §7`) but full 3D asset production (draped mannequin models per SKU) is costly and slow for a catalog of 70+ SKUs at launch.
**Decision:** Launch with a 360° turntable photo-sequence viewer + deep-zoom border/pallu inspection as the primary "3D" experience for all products. True three.js/glTF 3D drape models are scoped to Phase 2 for the Bridal and Designer collections only (highest AOV, justifies asset cost).
**Consequences:** Faster time-to-market, lower content-production cost, still delivers a strong tactile/premium feel. Requires the PDP viewer component to support both modes via a common interface (`packages/three`).

---

### ADR-004 — Framer Motion as the single animation library
**Status:** Accepted
**Context:** Multiple libraries (GSAP, CSS animations, Framer Motion) could satisfy the motion requirements.
**Decision:** Standardize on Framer Motion for all storefront/admin UI animation (page transitions, scroll reveals, micro-interactions), reserving three.js's own animation loop only for the 3D viewer itself.
**Consequences:** Consistent motion language, one dependency to maintain, good React Server Component compatibility. Complex canvas-level animation (e.g., particle effects) is out of scope unless a specific future need arises.

---

### ADR-005 — Postgres + Prisma as system of record
**Status:** Accepted
**Context:** Orders, inventory, and reviews require strong relational integrity (foreign keys, transactions) that a document store would complicate.
**Decision:** PostgreSQL via Prisma ORM as the primary datastore; Redis for cache/session/cart/reservation TTLs; Meilisearch/Algolia as a derived search index (not source of truth).
**Consequences:** Strong consistency for orders/inventory; requires a sync job to keep the search index current with catalog changes.

---

### ADR-006 — Payment gateway: TBD (Razorpay vs Cashfree)
**Status:** Proposed — pending business decision
**Context:** Both support UPI/cards/netbanking + COD flagging for the India market; pricing and settlement terms differ and are a business (not purely technical) decision.
**Decision:** Default recommendation is Razorpay for broader ecosystem/plugin support, but this is not finalized — flagged as an open question in `prd.md §9`.
**Consequences:** Payment integration code should be written behind an internal `PaymentProvider` interface so the concrete gateway can be swapped with minimal blast radius.

---

### ADR-007 — Guest checkout is mandatory, not optional
**Status:** Accepted
**Context:** COD-heavy, mobile-first Indian shopper base has low tolerance for forced account creation (per PRD target users).
**Decision:** Full checkout (browse → cart → address → payment/COD → confirmation) must work without a mandatory account; account creation/OTP login is offered but never blocking.
**Consequences:** Cart/order data model must support nullable `user_id` with `session_id` fallback, and a post-purchase "claim this order" flow to merge into an account if the guest later registers.

---

### ADR-008 — Inventory reservation on checkout start
**Status:** Accepted
**Context:** Offer sarees (up to 64% off) and limited bridal pieces are prone to overselling if stock is decremented only after payment confirms, given payment gateway latency/retries.
**Decision:** Reserve stock in Redis with a short TTL (e.g., 10–15 min) when checkout begins; commit the decrement transactionally in Postgres on payment success; release the reservation on timeout/failure.
**Consequences:** Slight complexity added to checkout flow; prevents overselling of limited-stock/offer items, protecting brand trust.

---

### ADR-009 — Admin panel visually distinct from storefront brand system
**Status:** Accepted
**Context:** Storefront uses an editorial maroon/gold/serif brand system (`design.md §2–3`) tuned for shopper emotion; admin users need speed and clarity, not brand persuasion.
**Decision:** Admin panel uses a neutral, sans-serif-only, data-dense UI with functional status colors only — no maroon/gold flourishes (`design.md §8`).
**Consequences:** Two design systems to maintain in `packages/ui`, but each is optimized for its actual job (conversion vs. operational efficiency).

---

## Open Questions (not yet decided)
- Final payment gateway selection (ADR-006).
- Courier aggregator contract (Shiprocket assumed in `architecture.md`, not confirmed).
- Whether a loyalty/rewards program is in scope for Phase 2.
- Whether bridal consultation/video-styling booking is in scope for Phase 2.
- Tamil/Hindi localization timeline.
