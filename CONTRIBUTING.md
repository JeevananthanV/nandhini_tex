# Contributing to Nandhini Tex

Thank you for your interest in contributing! This document covers the development workflow, code style, and pull request process.

---

## Development setup

```bash
# Clone + install
git clone https://github.com/<you>/nandhini-tex.git
cd nandhini-tex
bun install

# Set up the database
cp .env.example .env
bun run db:push
bun run db:seed-full   # seeds 105 products

# Start the dev server
bun run dev
```

The dev server writes to `dev.log` — tail it with `tail -f dev.log`.

---

## Tech stack conventions

- **Framework**: Next.js 16 with App Router (non-negotiable)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 with shadcn/ui — **prefer existing components** in `src/components/ui/` over custom implementations
- **Database**: Prisma 6 ORM with SQLite (dev). See `prisma/schema.prisma`
- **State**: Zustand for client state (`src/lib/store.ts`), TanStack Query available for server state
- **Animation**: Framer Motion
- **AI**: `z-ai-web-dev-sdk` — **backend only**, never client-side

See [README.md](./README.md) for the full stack overview.

---

## Code style

### TypeScript
- Strict typing throughout — no `any` unless absolutely necessary
- Use `import type` for type-only imports
- Prefer `interface` for object shapes, `type` for unions and intersections
- All API routes must validate input with Zod (or manual guards)

### React
- `'use client'` directive at the top of any file using hooks, state, or browser APIs
- `'use server'` for server actions (we use API routes instead — see below)
- Functional components only; no class components
- Hooks: custom hooks go in `src/hooks/`

### API routes (preferred over server actions)
This project uses **API routes** exclusively for backend logic. Do not introduce server actions.

```typescript
// src/app/api/<resource>/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const items = await db.item.findMany();
  return NextResponse.json({ items });
}
```

### Styling
- Use Tailwind utility classes — no custom CSS unless absolutely necessary
- The theme uses **Navy / Gold / Ivory** — do not introduce indigo or blue
- Responsive: **mobile-first** (default classes are mobile, `sm:` / `md:` / `lg:` for larger)
- Touch targets: minimum 36px on mobile (44px preferred for primary actions)
- Sticky footer required on all pages — use `min-h-screen flex flex-col` + `mt-auto` on footer

### Components
- shadcn/ui components live in `src/components/ui/` — do not edit these unless fixing a bug
- Storefront components in `src/components/storefront/`
- Admin components in `src/components/admin/` (currently a single `admin-app.tsx` — split if it grows further)
- Use Lucide icons (`lucide-react`), not emoji, in UI

### Database
- Prisma schema lives in `prisma/schema.prisma`
- The DB client is exported from `src/lib/db.ts` — `import { db } from "@/lib/db"`
- After changing the schema: `bun run db:push` (uses `--accept-data-loss`)
- For migrations (production): `bun run db:migrate`
- **Prisma schema primitive types cannot be lists** — use `String` with JSON encoding for arrays

---

## Lint + build

Before opening a PR:

```bash
# Lint must pass
bun run lint

# Build must succeed
bun run build
```

Both must return 0 errors.

---

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Example:
```
feat(storefront): add sticky mobile add-to-cart bar on PDP

- Fixed bottom bar with price + Add to Bag + Buy Now + Wishlist
- Safe-area inset padding for iOS notch
- Spacer div prevents bar from covering related products

Verified on iPhone SE (375x667) and iPhone 14 (390x844).
```

---

## Pull request process

1. **Fork + branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes** — keep commits focused and atomic

3. **Test locally**:
   - `bun run lint` passes
   - `bun run build` succeeds
   - Manual smoke test on mobile + desktop viewports
   - For UI changes: take screenshots before/after

4. **Update documentation** if needed:
   - `README.md` for new features
   - `CHANGELOG.md` under `## [Unreleased]`
   - `DEPLOYMENT.md` if deployment changes

5. **Open a pull request** with:
   - Clear description of what + why
   - Screenshots for UI changes
   - Verification steps for the reviewer

6. **Address review feedback** — keep force-pushes to a minimum

---

## Mini services

If you need a separate backend service (e.g. websocket):

1. Create `mini-services/<name>/` with its own `package.json` and `index.ts`
2. Use a **specific port** (not `process.env.PORT`) — e.g. `3003`
3. Use `bun --hot` for auto-restart on file change
4. Start it in the background: `cd mini-services/<name> && bun run dev &`
5. Frontend connects via `io("/?XTransformPort=3003")` (never direct port URLs)

See `examples/websocket/` for a reference implementation.

---

## Browser verification

For UI changes, you **must** verify with [agent-browser](https://github.com/vercel-labs/agent-browser) before opening a PR:

```bash
agent-browser set device "iPhone 14"
agent-browser open http://localhost:3000
agent-browser screenshot --full
```

Check for:
- No horizontal overflow (`document.documentElement.scrollWidth <= window.innerWidth`)
- All touch targets ≥ 36px
- No console errors
- Core interactions work (click products, add to cart, open admin)

---

## Questions?

- **Business context**: see `upload/prd.md`
- **Architecture**: see `upload/architecture.md`
- **Design system**: see `upload/design.md`
- **Deployment**: see [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Customer support**: +91 76048 11838 (Mon–Sat, 10am–7pm IST)

Happy weaving! 🧵
