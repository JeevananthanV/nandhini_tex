# PRD — Nandhini Tex Sarees E-Commerce Platform

## 1. Overview
**Product:** Nandhini Tex — a curated online store for handwoven silk & cotton sarees direct from Elampillai, Kanchipuram, and other Tamil Nadu weaving centers.
**Tagline:** "Elegance Meets Tradition"
**Goal:** Replace/rebuild the current storefront with a modern, minimalist, elegant e-commerce site (customer storefront + full admin panel) that supports the full catalog, cart, checkout, reviews, and order operations, with a signature 3D/motion product experience.

## 2. Business Context
- Based in Elampillai, Tamil Nadu. Handloom-first brand story.
- COD + prepaid (UPI, cards, net banking) across India via Delhivery / DTDC / India Post.
- 2,450+ reviews, 4.8★ average, 2,400+ trusted customers (existing social proof to migrate).
- Categories (from current catalog): Soft Silk (12), Kanchipuram Silk (10), Cotton (14), Bridal (8), Designer (8), Offer Sarees (7), Dhotis (10), Shirts (10), Couple Combo (5).
- Price range: ₹249 (offer sarees) to ₹35,000 (grand bridal Kanchipuram silk); combos up to ₹28,000.
- Every saree ships with a ~0.8m matching running blouse piece — must be represented as an included attribute, not an add-on.

## 3. Goals & Success Metrics
| Goal | Metric |
|---|---|
| Increase conversion vs current site | +20% add-to-cart → checkout completion |
| Reduce cart abandonment | -15% abandonment rate |
| Improve perceived quality/trust | Avg. session time, review submission rate |
| Give ops team full self-serve control | 100% of catalog/order/coupon changes doable without dev involvement |
| Showcase craftsmanship | 3D drape/zoom viewer used on ≥30% of PDP sessions |

## 4. Target Users
1. **Shopper (primary):** Women 25–55, buying for self, festivals, weddings; secondary male shoppers buying dhotis/shirts/couple combos.
2. **Gifting/Bridal shopper:** Higher AOV, browses Bridal + Couple Combo, wants detailed zari/fabric info, larger images/video/3D.
3. **Admin / Store Ops:** Small internal team managing catalog, inventory, orders, offers, and customer support (phone: current support line +91 76048 11838).
4. **Guest checkout users:** COD-heavy, mobile-first, low patience for account creation friction.

## 5. Functional Scope

### 5.1 Storefront (Customer)
**Discovery & Browse**
- Home page: hero, category rail (9 collections with counts), New Arrivals, Bestsellers, Bridal Collection, Offers, Menswear, curated collection grid, testimonials, FAQ accordion, About/Trust strip, newsletter signup, footer.
- Category / listing pages: filters (category, price range, fabric, color, occasion, offer %), sort (popularity, price, newest), grid/list toggle, pagination or infinite scroll.
- Search with autosuggest (product name, category, fabric).
- Badges: New, Bestseller (★), Offer % off, Out of Stock.

**Product Detail Page (PDP)**
- Image gallery + zoom, video support, **3D/360° drape viewer** (see Design doc §3D Experience).
- Price with MRP strikethrough + discount %.
- Variant selection: color, blouse-included indicator, (size for shirts/dhotis).
- Stock status, delivery estimate by pincode, COD availability check.
- Fabric/weave details: origin (Elampillai/Kanchipuram/Arani/Kadhi), weave time (3–7 days), zari type, care instructions.
- Add to Bag, Buy Now, Add to Wishlist.
- Reviews & Ratings module: average rating, rating distribution, photo/video reviews, verified-purchase tag, helpful votes, write-a-review (post-delivery gated).
- Cross-sell: "Complete the Look" (matching blouse/dhoti/shirt), "You may also like", recently viewed.
- Trust strip: Handwoven / COD Available / Pan India / 7-Day Returns.

**Cart & Checkout**
- Persistent cart (guest + logged-in, merged on login).
- Cart drawer + full cart page: qty edit, remove, save for later, coupon code, order summary.
- Checkout: address (with pincode serviceability + COD eligibility check), shipping method, payment (UPI/Card/NetBanking via gateway, COD with ₹40 surcharge flag), order review, place order.
- Guest checkout supported end-to-end.
- Order confirmation page + email/SMS/WhatsApp notification.

**Account**
- Register/login (mobile OTP + email/password + optional social login).
- Order history, order tracking (courier + AWB), invoice download.
- Wishlist, saved addresses, saved payment methods (tokenized).
- Returns/exchange request flow (7-day window, unused/tags-intact validation prompts).
- Reviews written by the user.

**Content/Trust**
- FAQs page (accordion, categorized: Shipping, Returns, COD, Payments, Sarees/Blouse, Care).
- About Us / Our Story.
- Policies: Shipping, Returns & Exchange, Privacy, Terms, Saree Care, Size Guide.
- Contact page (phone, email, address, WhatsApp CTA).

### 5.2 Admin Panel
**Dashboard**
- Sales overview (today/week/month), order status breakdown, low-stock alerts, top products, revenue chart, new customer count, pending reviews to moderate.

**Catalog Management**
- Product CRUD: title, SKU, category/subcategory, description, fabric details, images (multi-upload, reorder, alt text), video URL, 3D model upload/config, price + MRP + discount, stock/inventory per variant, tags (New/Bestseller), status (draft/published/archived), SEO fields (slug, meta title/description).
- Bulk actions: bulk price update, bulk stock update, CSV import/export.
- Category management: create/edit categories & collections, reorder, set banner images, assign products.
- Variant/attribute management: color, size, blouse-included flag.

**Order Management**
- Order list with filters (status, date, payment method, COD/prepaid).
- Order detail: items, customer, address, payment status, timeline.
- Status updates: Pending → Confirmed → Packed → Shipped → Out for Delivery → Delivered / Cancelled / Returned / Refunded.
- Courier integration hooks (AWB assignment, tracking link, label/invoice print).
- Manual order creation (phone orders), refund initiation, cancellation with reason.

**Customer Management**
- Customer list, profile (orders, LTV, addresses), support notes.
- Segment tagging (VIP, wholesale, bridal-lead) for marketing.

**Reviews & Moderation**
- Approve/reject/reply to reviews, flag/report handling, feature review on PDP/testimonials.

**Marketing & Offers**
- Coupon engine: %/flat, min cart value, category/product restriction, usage limits, expiry.
- Banner/hero content management (home hero, promo strips) with scheduling.
- Newsletter subscriber export.

**Content Management**
- FAQ, policy pages, About Us — WYSIWYG editable.
- Testimonials management.

**Settings**
- Shipping rules (free shipping threshold ₹999, zone-based rates, COD surcharge, serviceable pincodes).
- Payment gateway configuration.
- Roles & permissions (Super Admin, Catalog Manager, Order Manager, Support).
- Tax/GST settings, invoice template.
- Audit log of admin actions.

## 6. Non-Functional Requirements
- **Performance:** LCP < 2.5s on 4G mobile, PDP images lazy-loaded, 3D assets loaded on-demand/deferred.
- **Mobile-first:** ≥65% of Indian e-commerce traffic is mobile; all flows must be thumb-friendly.
- **Accessibility:** WCAG 2.1 AA — focus states, alt text, color contrast, reduced-motion support for all Framer Motion animations.
- **SEO:** SSR/SSG for storefront, structured data (Product, Review, BreadcrumbList schema.org).
- **Security:** PCI-scope minimized via gateway tokenization, admin RBAC, rate-limited auth, OTP throttling.
- **Localization-ready:** INR currency, future-proof for Tamil/Hindi language toggle.
- **Reliability:** 99.9% storefront uptime target; graceful checkout retry on payment failure.

## 7. Out of Scope (Phase 1)
- Native mobile apps (responsive web only initially).
- Multi-warehouse/inventory-location routing.
- International shipping/currency.
- Marketplace (multi-vendor) support.

## 8. Assumptions
- Single-vendor, single-currency (INR), India-only shipping at launch.
- Payment gateway (e.g., Razorpay/Cashfree) selected in Architecture doc.
- Existing product/testimonial/FAQ data (as scraped) is migrated as seed data.

## 9. Open Questions
- Which payment gateway and courier aggregator are contractually preferred?
- Is a loyalty/rewards program planned for a later phase?
- Do bridal/couple-combo customers need appointment/consultation booking (video call styling)?
