# Design.md — Nandhini Tex Visual & Interaction System

## 1. Design Philosophy
**Modern, minimalist, elegant.** The UI recedes so the sarees — color, texture, zari, drape — are the hero. Inspired by premium fashion e-commerce (think editorial fashion sites), not a busy discount bazaar. Generous whitespace, restrained color, confident typography, and purposeful motion that feels handcrafted rather than flashy.

Design principles:
1. **Fabric-first** — large imagery, minimal chrome around product photos.
2. **Quiet luxury** — muted, warm neutral palette with a single rich accent; avoid loud gradients/neon.
3. **Craft over clutter** — every animation/3D interaction reinforces the handwoven story (thread, weave, drape), not generic e-commerce flash.
4. **Effortless mobile** — one-hand reachable actions, sticky add-to-bag, minimal taps to checkout.
5. **Accessible elegance** — beauty never compromises contrast, focus order, or reduced-motion support.

## 2. Brand & Color System
| Token | Hex | Usage |
|---|---|---|
| `--color-ivory` | #FBF7F1 | Primary background |
| `--color-warm-white` | #FFFFFF | Cards/surfaces |
| `--color-charcoal` | #2A2420 | Primary text |
| `--color-taupe` | #8B7E74 | Secondary text/labels |
| `--color-maroon` (accent/brand) | #7A1F2B | CTAs, price highlight, brand mark — evokes Kanchipuram silk & kumkum |
| `--color-gold` | #B8860B / metallic gradient | Zari accents, borders, premium badges, "New"/"★" markers |
| `--color-sage` | #A9B79C | Secondary accent for offers/cotton category tags |
| `--color-line` | #E7DFD5 | Hairline borders/dividers |
| `--color-error` | #B3261E | Form errors, out-of-stock |
| `--color-success` | #3F6B4A | In-stock, confirmation states |

Rule: never more than one saturated accent (maroon **or** gold) per composition; gold is used sparingly for premium/festive emphasis (badges, bridal collection accents, hover glints).

## 3. Typography
- **Display/Headings:** A refined serif (e.g., "Fraunces", "Cormorant", or "Playfair Display") — used for hero headlines, section titles ("The Collection", "Bridal Collection"), product names on PDP. Conveys tradition + editorial elegance.
- **Body/UI:** A clean grotesk sans (e.g., "Inter", "General Sans", "Satoshi") for nav, prices, buttons, form fields, filters — keeps the UI feeling modern and legible at small sizes.
- Scale (desktop / mobile): H1 56/34, H2 40/28, H3 28/22, Body 16/15, Small 13/13, Micro (badges/labels) 11 uppercase tracked.
- Letter-spacing: uppercase micro-labels (category eyebrows, badges) get +0.08em tracking for a premium feel.

## 4. Layout & Grid
- 12-column grid, max content width 1440px, generous gutters (24–32px desktop, 16px mobile).
- Section rhythm: consistent vertical spacing (96px desktop / 56px mobile) between homepage sections — never crowd sections.
- Product cards: 4-up desktop, 2-up mobile grid; image aspect ratio 3:4 (portrait, matches saree drape photography).
- Sticky elements: sticky header (compresses on scroll), sticky "Add to Bag" bar on mobile PDP once primary CTA scrolls out of view.

## 5. Core Components
- **Header:** logo mark (left), primary nav (center/left), search, wishlist, bag icon w/ count, account (right). Transparent-over-hero on homepage, solid on scroll/inner pages.
- **Product Card:** image (hover = alt image or subtle Ken Burns zoom), category eyebrow, name, price + strikethrough MRP + %, badges (New/★/Offer%), quick "Add to Bag" that appears on hover/tap.
- **Buttons:** primary (filled maroon, cream text, subtle scale-on-hover), secondary (outline charcoal), ghost/text (underline animate-in on hover). Radius: 4–6px (sharp-soft, not pill — reads more premium/editorial than fully rounded).
- **Badges:** small pill/tag, gold for "New"/★ bestseller, maroon-outline for discount %.
- **Filters/Sort:** slide-in drawer on mobile, sticky sidebar on desktop; chips for active filters.
- **Review Module:** star row, distribution bars, photo grid, verified badge.
- **Accordion (FAQ):** minimal, thin divider lines, plus/minus rotate icon, smooth height animation.
- **Toasts/Micro-feedback:** "Added to Bag" slide-up toast with mini cart preview.

## 6. Motion System (Framer Motion)
Motion should feel like **fabric settling**, not UI popping — ease curves favor soft, slightly weighted easing over bouncy springs, except for small delight moments (wishlist heart, add-to-bag confirmation).

**Global defaults**
```js
// shared transition tokens
export const ease = [0.22, 1, 0.36, 1]; // "silk" ease-out
export const springSoft = { type: "spring", stiffness: 120, damping: 18, mass: 0.9 };
export const durations = { fast: 0.18, base: 0.32, slow: 0.6 };
```

**Patterns**
- **Page/route transitions:** fade + 12px upward drift (`opacity 0→1`, `y 12→0`, `duration: base`, `ease`) via `AnimatePresence` on route change.
- **Scroll reveal:** sections/product cards fade+rise into view once with `whileInView`, `viewport={{ once: true, margin: "-10%" }}` — staggered children (stagger 0.06s) for grids.
- **Hero:** slow parallax on hero image (subtle, ~10–20px translate on scroll), headline letters fade/slide in with stagger on load.
- **Product card hover:** image cross-fade to secondary shot (0.4s), card lifts translateY(-4px) with soft shadow bloom, "Add to Bag" button slides up from bottom edge.
- **Add to Bag:** button micro-bounce (springSoft, scale 1→0.96→1), cart icon count "pop" (scale spring), mini-cart drawer slides in from right (`x: 100%→0`, `ease`, `duration: base`).
- **Wishlist heart:** fill + scale burst (springSoft) on tap.
- **Filter drawer / mobile nav:** slide + backdrop fade, `duration: fast` in, `fast` out (snappy for utility UI, unlike content which is slower/softer).
- **Accordion (FAQ):** animate `height: auto` via measured content height, `duration: base`, chevron rotates 45°→0.
- **Image gallery / lightbox:** crossfade + slight scale (1.02→1) on image change; pinch/drag-to-zoom on mobile.
- **Loading/skeleton:** shimmer gradient sweep (CSS or Framer `animate` looping opacity) — never spinners on the storefront; skeletons preserve layout for perceived elegance.
- **Reduced motion:** wrap all non-essential motion in `useReducedMotion()` check — fall back to opacity-only fades, disable parallax/scale.

## 7. 3D Product Experience ("SilkSnap" 3D/360 Viewer)
Goal: let shoppers feel the drape, sheen, and zari border the way they would in-store.

**Tech approach**
- **360° spin viewer** (primary, lower cost): 24–36 sequential photos of the saree draped on a form, rotated on a turntable; rendered via `react-360-view` / custom canvas sprite-sheet component with drag/swipe to rotate, auto-rotate idle demo (3s loop) with `prefers-reduced-motion` respecting pause.
- **True 3D (Phase 2, premium/bridal SKUs)**: glTF model of a draped mannequin per saree family (a handful of drape "styles"), textured with the saree's fabric photo/pattern mapped onto the model, rendered with `three.js` / `@react-three/fiber` + `@react-three/drei` (OrbitControls limited to Y-axis rotation only, soft studio-style HDRI lighting, subtle idle rotation).
- **Zoom/inspect mode:** high-res texture zoom on the border/pallu to show zari and weave detail (deep-zoom / tile-based image, e.g., OpenSeadragon-style) — this is the single highest-perceived-value feature for silk buyers and should ship before full 3D.
- **Fallback:** if 3D/360 assets aren't available for a SKU, gracefully degrade to the standard image gallery — never block PDP render on 3D asset load (lazy-load on interaction/viewport entry, show a "View in 3D" toggle button rather than auto-loading heavy assets).
- **Performance guardrails:** compressed KTX2/Draco assets, max model budget (~2–3MB per SKU), viewer code-split and loaded only when toggled into view.

## 8. Admin Panel Design
- Visually distinct from storefront: neutral light/dark-mode-capable UI, information-dense but organized (data-table first), sans-serif only (Inter throughout), functional color coding for order/stock status (success/warning/error tokens above) — **no maroon/gold brand flourishes** in the admin, to keep operational clarity primary.
- Left nav (Dashboard, Catalog, Orders, Customers, Reviews, Marketing, Content, Settings), top bar with search + admin profile.
- Tables: sticky header, inline status badges, row actions menu, bulk-select checkbox row, pagination.
- Forms: multi-step for product creation (Details → Images/3D → Pricing/Inventory → SEO → Publish) with autosave draft.
- Motion in admin is minimal/fast (durations.fast only) — utility over delight.

## 9. Imagery & Content Style
- Photography: neutral/soft studio backdrops or heritage-loom/weaver-at-work environmental shots for storytelling sections (About, hero).
- Consistent drape styling across product photography (same 3–4 pose/fold set) so the grid feels curated, not stock-photo-random.
- Icons: thin-line icon set (1.5px stroke) for trust badges (Handwoven, COD, Pan India, Returns) — consistent stroke weight matches typography weight.

## 10. Responsive Breakpoints
`sm: 375px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1440px` — design mobile-first; verify all motion/3D interactions have touch-equivalents (drag/swipe replaces hover/OrbitControls mouse-drag).
