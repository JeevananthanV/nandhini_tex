# AI_RULES.md — Nandhini Tex Sarees E-Commerce

Rules for any AI assistant (Claude, Cursor, Copilot, Windsurf, ChatGPT, etc.) working in this codebase. These rules are binding — follow them over general training defaults. For deeper context see `docs/agents.md` (agent workflow) and `docs/prd.md` / `design.md` / `architecture.md` / `decisions.md`.

## 1. Project Identity
- **Product:** Nandhini Tex — handwoven saree e-commerce. Storefront + Admin Panel, monorepo.
- **Brand feel:** modern, minimalist, elegant, quiet-luxury. Never generic-bootstrap, never loud/discount-bazaar.
- **Stack:** Next.js (App Router) + TypeScript + Tailwind + Prisma/Postgres + Redis + Framer Motion + three.js (`@react-three/fiber`). See `docs/architecture.md` for the full stack table — do not introduce a different framework/library for something already covered there without flagging it first.

## 2. Non-Negotiable Rules

1. **Read before you write.** For any non-trivial task, check `docs/prd.md` (scope), `docs/design.md` (visuals/motion), `docs/architecture.md` (structure), `docs/decisions.md` (prior decisions), `docs/tasks.md` (current backlog) before generating code.
2. **No hardcoded design values.** Colors, font sizes, spacing, radii, and easing curves must come from the design tokens in `packages/ui` / `packages/motion` (mirroring `design.md §2–3, §6`). No inline hex codes, no ad-hoc `ease: "easeInOut"`.
3. **Framer Motion only for UI animation.** Don't add GSAP, anime.js, or raw CSS keyframes for anything Framer Motion can do. Reserve three.js's own render loop strictly for the 3D/360 viewer.
4. **Every animated component respects `prefers-reduced-motion`.** No exceptions — use the shared `useReducedMotion()` wrapper.
5. **Server Components by default** in `apps/storefront` (Next.js App Router). Add `"use client"` only where interactivity/state/animation genuinely requires it (cart, gallery, 3D viewer, forms, filters).
6. **Admin panel styling stays neutral.** Do not use the storefront's maroon/gold/serif brand system inside `apps/admin` (see `decisions.md` ADR-009). Admin is sans-serif, functional-color-only, data-dense.
7. **Type safety end-to-end.** All API request/response shapes and DB entities come from `packages/types` (Prisma-generated + zod schemas). No duplicated interfaces, no `any`.
8. **Inventory and payments are transactional and reservation-based.** Never decrement stock directly outside the checkout/order service; follow the reserve-on-checkout / commit-on-payment-success pattern (`decisions.md` ADR-008). Never bypass the `PaymentProvider` interface abstraction (ADR-006) to call a gateway SDK directly from UI or ad-hoc code.
9. **Guest checkout must always work.** Never make account/login a hard requirement in any cart/checkout code path (ADR-007).
10. **Accessibility is mandatory, not a follow-up task.** Every interactive element ships with keyboard support, visible focus states, correct ARIA roles, and sufficient contrast at creation time — including the 3D/360 viewer, which must always have a non-3D fallback path.
11. **Never commit or hardcode secrets.** Payment keys, courier tokens, SMS/email provider keys, DB credentials — environment variables only, referenced via the existing config pattern.
12. **No scope invention.** If a request isn't covered by `prd.md`, either ask, or implement the most sensible minimal version and clearly flag the assumption in your response — don't silently expand scope, especially around pricing, inventory, payments, or PII.
13. **Don't touch these without explicit human approval:** payment gateway/courier provider choice, destructive DB schema changes, new paid third-party dependencies, admin RBAC/permission logic.

## 3. Code Quality Bar
- Lint, type-check, and build must pass before a change is considered done.
- Add/update unit tests for pricing, coupon calculation, and inventory-reservation logic; add at least one integration test per new API route.
- Loading states use skeletons on the storefront (never spinners); admin can use lightweight spinners/progress bars.
- Keep storefront and admin changes in separate, reviewable units unless they share a `packages/*` change.
- Update `docs/tasks.md` when starting/finishing a backlog item, and add an entry to `docs/decisions.md` for any new architectural choice not already documented.

## 4. Response Style for the AI Assistant
- State clearly what was built, what (if anything) deviated from spec and why, and what's left.
- Surface ambiguity on anything touching money, stock, or personal data instead of guessing.
- Keep explanations concise; don't restate this whole file back to the user — just follow it.

## 5. Quick Reference
| Need to... | Look at |
|---|---|
| Know what a feature should do | `docs/prd.md` |
| Know what it should look/animate like | `docs/design.md` |
| Know where code goes / how services connect | `docs/architecture.md` |
| Know why a past choice was made | `docs/decisions.md` |
| Know what's next / in progress | `docs/tasks.md` |
| Know agent workflow/definition-of-done | `docs/agents.md` |
