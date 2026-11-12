# AGENTS.md — Working Agreement for AI Coding Agents (Claude Code / others)

This file tells any AI agent (Claude Code, Cursor, Copilot Workspace, etc.) how to work in this repository. Read this before making changes.

## 1. Project Snapshot
- **Product:** Nandhini Tex Sarees — handwoven saree e-commerce (storefront + admin panel).
- **Source of truth docs:** `docs/prd.md` (what to build), `docs/design.md` (how it should look/move), `docs/architecture.md` (how it's built), `docs/decisions.md` (why), `docs/tasks.md` (current backlog/status).
- Always check `docs/tasks.md` first to see what's in progress before starting new work, and update it when you complete or start a task.

## 2. Repo Layout
See `architecture.md §6`. Key apps: `apps/storefront`, `apps/admin`, `apps/api`. Shared code lives in `packages/*` — prefer extending shared packages (`packages/ui`, `packages/motion`, `packages/three`, `packages/types`) over duplicating components between storefront and admin.

## 3. Ground Rules
1. **Don't invent scope.** If a request isn't covered by `prd.md`, flag it and ask, or add it to `decisions.md` as an open question before building.
2. **Design tokens are law.** Use the CSS variables/Tailwind theme tokens defined in `design.md §2–3`. No hardcoded hex colors or ad-hoc font sizes in components.
3. **Motion tokens are shared.** All Framer Motion usage pulls `ease`, `springSoft`, `durations` from `packages/motion` — don't hand-roll new easing curves per component. Every animated component must respect `useReducedMotion()`.
4. **Type-safety end to end.** Backend DTOs and frontend types come from `packages/types` (Prisma-generated + zod). Don't duplicate interface shapes.
5. **Server vs client boundaries (Next.js App Router):** default to Server Components; only mark `"use client"` where interactivity/animation/state requires it (e.g., PDP gallery, cart drawer, 3D viewer, forms).
6. **Admin panel is separate from storefront branding.** Do not import maroon/gold brand accents into `apps/admin` — see `design.md §8`.
7. **Never commit secrets.** Payment gateway keys, courier API tokens, SMS/email provider keys live in environment variables, never in code or docs.
8. **Inventory-affecting code is transactional.** Any code touching stock/order state must go through the reservation pattern in `architecture.md §5` — no direct stock decrements outside the checkout/order service.
9. **Accessibility is not optional.** Every interactive component needs keyboard support, visible focus states, and correct ARIA roles — this includes the 3D/360 viewer (must have a non-3D fallback path).

## 4. Workflow Expectations
- **Before coding:** re-read the relevant section of `prd.md`/`design.md`/`architecture.md` for the task; check `decisions.md` for any prior decision that constrains the approach.
- **Small, reviewable changes:** prefer one feature/module per PR/commit set. Don't mix storefront and admin changes in the same change unless they share a package.
- **Tests:** add/update unit tests for service-layer logic (pricing, coupon calc, inventory reservation) and at least one integration test per new API route. Snapshot/interaction tests for critical UI (cart, checkout, PDP add-to-bag).
- **Lint/type-check/build must pass** before considering a task done.
- **Update docs as you go:** if you make an architectural choice not already captured, add an entry to `decisions.md`. If you complete a backlog item, check it off in `tasks.md`.
- **Seed/demo data:** use `infra/prisma/seed.ts` reflecting the real current catalog categories/pricing (see `prd.md §2`) so admin/storefront always have realistic data to develop against.

## 5. Definition of Done (per feature)
- [ ] Matches `prd.md` functional requirement and `design.md` visual/motion spec
- [ ] Responsive at all breakpoints in `design.md §10`
- [ ] Reduced-motion fallback verified
- [ ] Loading/empty/error states implemented (skeletons per `design.md §6`, not spinners, on storefront)
- [ ] Types shared via `packages/types`, no `any`
- [ ] Unit/integration tests added and passing
- [ ] Accessible (keyboard nav, focus, ARIA, color contrast)
- [ ] No secrets/keys committed
- [ ] `tasks.md` updated

## 6. Communication Style for Agent Output
- When summarizing work, state what was built, what deviated from the spec (and why), and what remains.
- Flag ambiguity rather than silently guessing on anything touching pricing, inventory, payments, or PII.
- If a task is genuinely underspecified, propose the most sensible default, implement it, and note the assumption — don't block on it unless it's a payments/data-integrity question.

## 7. Escalation / Out-of-Bounds
Do not, without explicit human sign-off:
- Change payment gateway or courier provider selections made in `decisions.md`.
- Alter the database schema in a way that's destructive to existing data without a migration + backup plan.
- Introduce a new third-party service/dependency with recurring cost.
- Modify RBAC/permission logic for the admin panel.
