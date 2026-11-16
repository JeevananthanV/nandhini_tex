"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShieldCheck, Truck, RefreshCw, Hand, Star, ChevronRight,
  Sparkles, Award, Heart, Phone, Mail, MapPin, MessageCircle, ArrowRight
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/store";
import { ProductCard } from "./product-card";
import { StarRating } from "./primitives";
import { AnimatedCounter, Marquee, TextReveal, MagneticButton, SectionReveal, StaggerGrid, StaggerItem } from "./premium";
import { CountdownTimer } from "./premium-features";
import { ProductRailSkeleton, ProductGridSkeleton } from "./skeletons";
import { AuroraBackground, CursorSpotlight, GradientText, ScrollIndicator, FloatingElements, NumberFlip } from "./effects";
import type { ProductCard as ProductCardType } from "@/lib/format";

type Category = { id: string; name: string; slug: string; description: string | null; bannerImage: string | null; productCount: number };
type Testimonial = { id: string; name: string; city: string | null; quote: string; rating: number };
type Faq = { id: string; question: string; answer: string; category: string };

const CATEGORY_TAGLINES: Record<string, string> = {
  "silk-varieties": "Soft Silk, Kubera Pattu & Banarasi Mashru",
  "bridal": "Grand Samudhrikha & Pure Gold Zari Silks",
  "cotton-sarees": "Breathable Handloom Khadi & Sungudi",
  "designer": "Modern Softy Prints & Butterfly Cut Work",
  "combos": "Bridal Couple Combos & Traditional Sets",
  "celebrity": "Celebrity-Inspired Handwoven Silks",
};

export function HomePage({ categories }: { categories: Category[] }) {
  const goCategory = useStore((s) => s.goCategory);
  const goAllProducts = useStore((s) => s.goAllProducts);
  const goProduct = useStore((s) => s.goProduct);
  const [newArrivals, setNewArrivals] = useState<ProductCardType[]>([]);
  const [bestsellers, setBestsellers] = useState<ProductCardType[]>([]);
  const [bridal, setBridal] = useState<ProductCardType[]>([]);
  const [offers, setOffers] = useState<ProductCardType[]>([]);
  const [menswear, setMenswear] = useState<ProductCardType[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/products?isNew=true&limit=4").then((r) => r.json()),
      fetch("/api/products?isBestseller=true&limit=4").then((r) => r.json()),
      fetch("/api/products?category=bridal&limit=4").then((r) => r.json()),
      fetch("/api/products?category=offer-sarees&limit=4").then((r) => r.json()),
      fetch("/api/products?category=dhotis&limit=4").then((r) => r.json()),
      fetch("/api/testimonials").then((r) => r.json()),
      fetch("/api/faqs").then((r) => r.json()),
    ])
      .then(([na, bs, br, of, mw, ts, fq]) => {
        if (cancelled) return;
        setNewArrivals(na.products || []);
        setBestsellers(bs.products || []);
        setBridal(br.products || []);
        setOffers(of.products || []);
        setMenswear(mw.products || []);
        setTestimonials(ts.testimonials || []);
        setFaqs(fq.faqs || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newsletterEmail }),
    });
    setNewsletterDone(true);
    setNewsletterEmail("");
  };

  return (
    <div className="flex flex-col">
      {/* ===== HERO ===== */}
      <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden" aria-label="Hero — Handwoven silk sarees from Tamil Nadu">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=85"
            alt="Bride wearing a handwoven red Kanchipuram silk saree with gold zari border from Nandhini Tex"
            fill
            priority
            loading="eager"
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/85 via-navy-dark/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/70 via-transparent to-transparent" />
        </div>

        {/* Animated aurora background + floating elements for depth */}
        <AuroraBackground className="z-[1]" />
        <FloatingElements className="z-[1] opacity-30" />
        <CursorSpotlight className="z-[2]" color="rgba(212, 175, 55, 0.06)" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-navy/30 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gold backdrop-blur font-display"
            >
              <Sparkles className="h-3 w-3" /> The Royal Silk Collection
            </motion.span>
            <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.05] text-ivory md:text-6xl">
              Elegance Woven
              <span className="block">
                <GradientText from="#D4AF37" to="#F5E6A8" animate>
                  Through Generations
                </GradientText>
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-5 max-w-md text-base text-ivory/80 md:text-lg font-light"
            >
              Discover the beauty of traditional Indian sarees, crafted with timeless artistry by master weavers of Elampillai, Kanchipuram & Arani.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <div className="relative overflow-hidden rounded-sm">
                <MagneticButton
                  onClick={() => goCategory("bridal")}
                  className="relative rounded-sm bg-gold-gradient px-7 py-3 text-sm font-semibold text-navy shadow-gold uppercase tracking-wider shimmer-sweep"
                >
                  Explore Collection
                </MagneticButton>
              </div>
              <MagneticButton
                onClick={() => goAllProducts()}
                className="rounded-sm border border-ivory/40 px-7 py-3 text-sm font-semibold text-ivory backdrop-blur transition-colors hover:bg-ivory/10"
                strength={0.2}
              >
                Shop All Sarees
              </MagneticButton>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-9 flex items-center gap-6 text-ivory/70"
            >
              <div className="flex items-center gap-1.5">
                <StarRating rating={4.8} size={14} />
                <span className="text-sm font-medium text-ivory">4.8</span>
                <span className="text-xs">/ 2,450+ reviews</span>
              </div>
              <div className="h-4 w-px bg-ivory/20" />
              <span className="text-xs">2,400+ happy customers</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll-down hint */}
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <ScrollIndicator />
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="relative border-y border-gold/20 bg-navy text-ivory shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6 md:px-8 md:py-7">
          <div className="grid grid-cols-2 gap-4 divide-y divide-white/10 sm:divide-y-0 sm:gap-6 md:grid-cols-4 md:divide-x md:divide-white/15">
            {[
              { icon: Hand, title: "100% Handwoven", sub: "Master weavers from Elampillai" },
              { icon: Truck, title: "Pan-India Shipping", sub: "Dispatched in 24h · Free above ₹999" },
              { icon: RefreshCw, title: "7-Day Easy Returns", sub: "Hassle-free doorstep exchanges" },
              { icon: ShieldCheck, title: "Secure Payments", sub: "COD, UPI & 256-bit safe checkout" },
            ].map((t, i) => (
              <div
                key={i}
                className={`flex items-center gap-3.5 pt-3 sm:pt-0 ${i % 2 === 1 ? "sm:pl-3" : ""} ${i > 0 ? "md:pl-6" : ""}`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold ring-1 ring-gold/30 transition-transform duration-300 hover:scale-105">
                  <t.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-serif text-sm font-semibold tracking-wide text-ivory md:text-base">
                    {t.title}
                  </span>
                  <span className="text-[11px] text-ivory/65 leading-tight mt-0.5">
                    {t.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORY RAIL ===== */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Shop by Collection" title="The Collections" />
          <button
            onClick={goAllProducts}
            className="inline-flex items-center gap-1.5 self-start text-xs font-semibold uppercase tracking-wider text-navy transition-colors hover:text-gold sm:self-end md:text-sm"
          >
            View All Sarees <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-3">
          {categories.slice(0, 6).map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              onClick={() => goCategory(c.slug)}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted text-left ring-1 ring-border/50 transition-all duration-500 hover:ring-gold/60 hover:shadow-[0_25px_60px_-15px_rgba(8,27,58,0.45)]"
              aria-label={`Explore ${c.name} Collection, ${c.productCount} sarees`}
            >
              {c.bannerImage && (
                <Image
                  src={c.bannerImage}
                  alt=""
                  role="presentation"
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              )}
              {/* Multi-stop atmospheric luxury vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/45 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />

              {/* Top badge row: piece count tag */}
              <div className="absolute left-3.5 top-3.5 z-10 flex items-center gap-2">
                <span className="rounded-full border border-gold/40 bg-navy/85 px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-gold backdrop-blur-md shadow-sm">
                  {c.productCount} Designs
                </span>
              </div>

              {/* Arrow badge top-right */}
              <div className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/35 text-ivory backdrop-blur-md transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-navy group-hover:rotate-45">
                <ChevronRight className="h-4 w-4" />
              </div>

              {/* Bottom content: Title + Subtitle + Action link */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-4 md:p-5">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-gold/90">
                  Handloom Collection
                </span>
                <h3 className="mt-1 font-serif text-lg font-semibold leading-tight text-ivory md:text-xl group-hover:text-gold-light transition-colors">
                  {c.name}
                </h3>
                <p className="mt-1 text-xs text-ivory/70 line-clamp-1">
                  {CATEGORY_TAGLINES[c.slug] || c.description || "Authentic Handloom Weaves"}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold opacity-90 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  <span>Explore Collection</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Golden hover glow line at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gold-gradient transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      {loading ? (
        <ProductRailSkeleton />
      ) : (
        newArrivals.length > 0 && (
          <ProductRail eyebrow="Just In" title="New Arrivals" products={newArrivals} />
        )
      )}

      {/* ===== BESTSELLERS ===== */}
      {loading ? (
        <ProductRailSkeleton bg="bg-ivory" />
      ) : (
        bestsellers.length > 0 && (
          <ProductRail eyebrow="Customer Favourites" title="Bestsellers" products={bestsellers} bg="bg-ivory" />
        )
      )}

      {/* ===== BRIDAL BANNER ===== */}
      <section className="relative overflow-hidden">
        <div className="relative h-[420px] w-full md:h-[480px]">
          <Image src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&q=85" alt="Bridal silk saree collection" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy-dark/50 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-lg"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-gold">
                <Award className="h-3 w-3" /> The Bridal Edit
              </span>
              <h2 className="mt-4 font-serif text-3xl font-semibold text-ivory md:text-5xl">For Your Big Day</h2>
              <p className="mt-4 text-ivory/80">Grand Kanchipuram bridal silks in rich reds, maroons and gold — woven over 7 days with pure zari. The heirloom your daughter will cherish.</p>
              <button
                onClick={() => goCategory("bridal")}
                className="mt-6 rounded-sm bg-gold-gradient px-7 py-3 text-sm font-semibold text-navy shadow-gold"
              >
                Shop Bridal Collection
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== BRIDAL PRODUCTS ===== */}
      {loading ? <ProductRailSkeleton /> : bridal.length > 0 && <ProductRail eyebrow="Heirloom Weaves" title="Bridal Collection" products={bridal} />}

      {/* ===== STORY / ABOUT ===== */}
      <section className="bg-navy-gradient text-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-gold">Our Story</span>
            <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Threads of Heritage from Elampillai</h2>
            <p className="mt-5 text-ivory/80">
              For generations, the weavers of Elampillai and Kanchipuram have created sarees that tell stories — of temple festivals, of weddings, of devotion. At Nandhini Tex, we work directly with these master artisans, bringing you handwoven silk that carries the warmth of the loom and the pride of its maker.
            </p>
            <p className="mt-3 text-ivory/80">
              Every saree ships with a matching blouse piece and the assurance of authentic handloom — no power looms, no shortcuts.
            </p>
            <div className="mt-6 flex gap-8">
              <div>
                <div className="font-serif text-3xl font-bold text-gold"><NumberFlip value={70} suffix="+" /></div>
                <div className="text-xs uppercase tracking-wider text-ivory/60">Unique Weaves</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-bold text-gold"><NumberFlip value={2400} suffix="+" /></div>
                <div className="text-xs uppercase tracking-wider text-ivory/60">Happy Customers</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-bold text-gold"><NumberFlip value={4.8} decimals={1} suffix="★" /></div>
                <div className="text-xs uppercase tracking-wider text-ivory/60">Avg. Rating</div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-navy"
          >
            <Image src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80" alt="Handloom silk weaving" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </motion.div>
        </div>
      </section>

      {/* ===== OFFERS ===== */}
      {loading ? (
        <section className="bg-ivory">
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-3 h-9 w-44" />
              </div>
              <Skeleton className="h-11 w-40 rounded-lg" />
            </div>
            <ProductGridSkeleton count={4} className="mt-10 md:grid-cols-4" />
          </div>
        </section>
      ) : (
        offers.length > 0 && (
          <section className="bg-ivory">
            <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                <SectionHeading eyebrow="Limited Time" title="Offer Sarees" />
                <CountdownTimer targetDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)} className="rounded-lg border border-gold/30 bg-gold/5 px-4 py-2" />
              </div>
              <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {offers.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          </section>
        )
      )}

      {/* ===== MENSWEAR ===== */}
      {loading ? (
        <ProductRailSkeleton bg="bg-ivory" />
      ) : (
        menswear.length > 0 && (
          <ProductRail eyebrow="For Him" title="Menswear" products={menswear} bg="bg-ivory" />
        )
      )}

      {/* ===== ENTIRE COLLECTION CTA ===== */}
      <section aria-label="Browse the entire collection">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-xl bg-navy-gradient px-6 py-10 text-center md:px-12 md:py-14"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: "url(/patterns/heritage-motif.svg)", backgroundSize: "180px" }}
            />
            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">One Loom, Every Weave</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-ivory md:text-4xl">Browse the Entire Collection</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-ivory/70">
                Every silk, cotton, bridal and everyday weave from our Elampillai looms — filter by price, fabric and occasion to find yours.
              </p>
              <button
                onClick={goAllProducts}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-bold text-navy shadow-lg transition-all hover:bg-ivory hover:shadow-xl"
              >
                Shop All Products <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FESTIVAL COLLECTION ===== */}
      <section className="bg-navy-gradient text-ivory">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
          <SectionHeading eyebrow="Seasonal Edits" title="Festival Collection" />
          <p className="mt-4 max-w-2xl text-ivory/70">Celebrate Pongal, Diwali, and wedding seasons with our curated festive sarees — rich colours, pure zari, and heirloom weaves for every auspicious occasion.</p>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {[
              { name: "Pongal Edit", desc: "Vibrant silks for the harvest festival", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", color: "#D4AF37" },
              { name: "Diwali Collection", desc: "Luminous zari weaves for the festival of lights", img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", color: "#B3261E" },
              { name: "Wedding Season", desc: "Grand bridal and reception sarees", img: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", color: "#7A1F2B" },
              { name: "Navratri Specials", desc: "Festive nine-night celebration weaves", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80", color: "#5B2A6B" },
            ].map((f, i) => (
              <motion.button
                key={f.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-5%" }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => goCategory("bridal")}
                className="group relative aspect-[4/5] overflow-hidden rounded-lg"
              >
                <Image src={f.img} alt={f.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                  <span className="font-serif text-lg font-semibold text-ivory md:text-xl">{f.name}</span>
                  <span className="mt-1 block text-xs text-ivory/70">{f.desc}</span>
                </div>
                <div className="absolute right-3 top-3 h-2 w-2 rounded-full ring-2 ring-white/30" style={{ backgroundColor: f.color }} />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INSTAGRAM GALLERY ===== */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
          <SectionHeading eyebrow="#NandhiniTex" title="Saree Styling Inspiration" center />
          <p className="mx-auto mt-4 max-w-lg text-center text-sm text-muted-foreground">Follow us on Instagram for saree draping styles, blouse pairing ideas, and behind-the-scenes weaving stories.</p>
          <div className="mt-10 grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
            {[
              "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
              "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80",
              "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
              "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80",
              "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
              "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&q=80",
            ].map((img, i) => (
              <motion.a
                key={i}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group relative aspect-square overflow-hidden rounded-md bg-muted"
              >
                <Image src={img} alt={`Instagram post ${i + 1}`} fill sizes="(max-width: 768px) 33vw, 16vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 flex items-center justify-center bg-navy/0 opacity-0 transition-all duration-300 group-hover:bg-navy/40 group-hover:opacity-100">
                  <svg className="h-6 w-6 text-ivory" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                  </svg>
                </div>
              </motion.a>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-navy px-6 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-ivory"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
              </svg>
              Follow @nandhinitex
            </a>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
          <SectionHeading eyebrow="Loved by Thousands" title="What Our Customers Say" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 24, rotateY: 15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, scale: 1.02 }}
                style={{ transformStyle: "preserve-3d", transformPerspective: 1000 }}
                className="group relative rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-[0_20px_50px_-15px_rgba(212,175,55,0.25)] hover:border-gold/30"
              >
                <Star className="absolute right-5 top-5 h-8 w-8 fill-gold/10 text-gold/30 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                <StarRating rating={t.rating} size={16} />
                <p className="mt-4 font-serif text-lg leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-gradient font-serif text-sm font-semibold text-gold transition-transform duration-300 group-hover:scale-110">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    {t.city && <div className="text-xs text-muted-foreground">{t.city}</div>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ===== FAQ ===== */}
      {faqs.length > 0 && (
        <section id="faq" className="bg-ivory">
          <div className="mx-auto max-w-3xl px-6 py-16 md:px-8 md:py-24">
            <SectionHeading eyebrow="Good to Know" title="Frequently Asked Questions" center />
            <Accordion type="single" collapsible className="mt-10">
              {faqs.map((f) => (
                <AccordionItem key={f.id} value={f.id} className="border-b border-border">
                  <AccordionTrigger className="py-5 text-left font-serif text-base font-medium text-foreground hover:text-navy hover:no-underline">
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* ===== NEWSLETTER ===== */}
      <section className="bg-navy-gradient text-ivory">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center md:px-8 md:py-20">
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-gold">Stay in the weave</span>
          <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Join the Nandhini Tex Family</h2>
          <p className="mt-3 text-ivory/80">Be the first to know about new arrivals, festive offers, and weaving stories. Get 10% off your first order.</p>
          {newsletterDone ? (
            <div className="mt-7 rounded-md border border-gold/40 bg-gold/10 px-6 py-4">
              <p className="text-sm font-medium text-gold">Thank you for subscribing! Check your inbox for the welcome code.</p>
            </div>
          ) : (
            <form onSubmit={subscribe} className="mx-auto mt-7 flex max-w-md gap-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address"
                className="h-12 min-w-0 flex-1 rounded-sm border border-ivory/30 bg-navy-dark/40 px-4 text-sm text-ivory placeholder:text-ivory/50 focus:border-gold focus:outline-none"
              />
              <button type="submit" className="h-12 flex items-center justify-center rounded-sm bg-gold-gradient px-6 text-sm font-semibold text-navy hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ===== CONTACT STRIP ===== */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-3 md:px-8">
          <ContactCard icon={Phone} title="Call Us" lines={["+91 76048 11838", "Mon–Sat, 10am–7pm IST"]} />
          <ContactCard icon={MessageCircle} title="WhatsApp" lines={["Quick replies & order updates", "Chat with our team"]} />
          <ContactCard icon={MapPin} title="Visit Us" lines={["Elampillai, Salem", "Tamil Nadu 637502, India"]} />
        </div>
      </section>

      {/* ===== SEO / GEO CONTENT — keyword-rich, location-targeted ===== */}
      <section className="border-t border-border bg-ivory" aria-label="About our handwoven sarees">
        <div className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-20">
          <SectionHeading eyebrow="Our Heritage" title="Handwoven Sarees from the Heart of Tamil Nadu" center />
          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Nandhini Tex</strong> brings you authentic{" "}
              <strong className="text-foreground">handwoven silk and cotton sarees</strong> direct from the
              weaving looms of <strong className="text-foreground">Elampillai, Kanchipuram, and Arani</strong> —
              the historic handloom centres of Tamil Nadu, India. For generations, master weavers in these
              towns have created sarees that tell stories of temple festivals, weddings, and devotion.
            </p>
            <p>
              Our collection spans pure{" "}
              <strong className="text-foreground">Kanchipuram mulberry silk sarees</strong> with real gold zari
              borders, lightweight <strong className="text-foreground">soft silk sarees</strong> for everyday
              elegance, breathable <strong className="text-foreground">handloom cotton sarees</strong> for daily
              wear, and grand <strong className="text-foreground">bridal silk sarees</strong> woven over seven
              days for your wedding day. Every saree is 100% handwoven — no power looms, no shortcuts — and
              ships with a matching running blouse piece included at no extra cost.
            </p>
            <p>
              Whether you&apos;re searching for a{" "}
              <strong className="text-foreground">Kanchipuram bridal saree</strong>, a{" "}
              <strong className="text-foreground">soft silk saree for a festival</strong>, a{" "}
              <strong className="text-foreground">cotton saree for daily wear</strong>, or a{" "}
              <strong className="text-foreground">silk dhoti and kurta set</strong> for the groom, we have a
              handwoven piece for every occasion. We also offer{" "}
              <strong className="text-foreground">couple combo sets</strong> (coordinated saree + dhoti) for
              engagements and receptions.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold text-navy">Shop by Saree Type</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Kanchipuram Silk Sarees — pure mulberry silk with gold zari</li>
                <li>Soft Silk Sarees — lightweight and elegant</li>
                <li>Cotton Sarees — breathable handloom cotton</li>
                <li>Bridal Silk Sarees — grand weaves for weddings</li>
                <li>Designer Sarees — contemporary motifs and styles</li>
                <li>Offer Sarees — best-value handloom sarees</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold text-navy">Why Choose Nandhini Tex?</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>100% handwoven on traditional looms</li>
                <li>Silk Mark assurance on pure silk sarees</li>
                <li>Real gold zari borders and pallus</li>
                <li>COD available across India</li>
                <li>Free shipping above ₹999</li>
                <li>7-day easy returns</li>
                <li>4.8-star rating from 2,450+ reviews</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 rounded-lg bg-navy-gradient p-6 text-center text-ivory md:p-8">
            <h3 className="font-serif text-xl font-semibold md:text-2xl">
              Saree Shop in Elampillai, Salem, Tamil Nadu
            </h3>
            <p className="mt-3 text-sm text-ivory/80">
              Visit our store in Elampillai, Salem, Tamil Nadu 637502, India, or shop online with COD,
              UPI, card, or net banking. We ship sarees across India — Chennai, Bengaluru, Coimbatore,
              Madurai, Trichy, Salem, Erode, Vellore, Pondicherry, Tirunelveli, Mumbai, Delhi, Hyderabad,
              and all serviceable pincodes. Call <a href="tel:+917604811838" className="font-semibold text-gold underline">+91 76048 11838</a>{" "}
              for saree enquiries, bulk orders, or bridal consultations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, center }: { eyebrow: string; title: string; center?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={center ? "text-center" : ""}
    >
      <motion.span
        initial={{ opacity: 0, letterSpacing: "0.3em" }}
        whileInView={{ opacity: 1, letterSpacing: "0.15em" }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-dark"
      >
        {eyebrow}
      </motion.span>
      <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground md:text-4xl">{title}</h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`mt-3 h-px w-16 origin-left bg-gold-gradient ${center ? "mx-auto" : ""}`}
      />
    </motion.div>
  );
}

function ProductRail({ eyebrow, title, products, bg, viewAllAction }: { eyebrow: string; title: string; products: ProductCardType[]; bg?: string; viewAllAction?: () => void }) {
  const goCategory = useStore((s) => s.goCategory);
  const goAllProducts = useStore((s) => s.goAllProducts);

  const handleViewAll = viewAllAction || (() => {
    if (title.toLowerCase().includes("new") || title.toLowerCase().includes("bestseller")) {
      goAllProducts();
    } else {
      goCategory(products[0]?.categorySlug || "soft-silk");
    }
  });

  return (
    <section className={bg ? `bg-ivory ${bg}` : ""}>
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow={eyebrow} title={title} />
          <button onClick={handleViewAll} className="hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-navy transition-colors hover:text-gold md:flex md:text-sm">
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
        <div className="mt-8 flex justify-center md:hidden">
          <button
            onClick={handleViewAll}
            className="flex items-center gap-1.5 rounded-sm border border-navy/25 bg-background px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-navy shadow-sm transition-colors hover:border-gold hover:text-gold"
          >
            View All {title} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ContactCard({ icon: Icon, title, lines }: { icon: typeof Phone; title: string; lines: string[] }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-gradient">
        <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-serif text-base font-semibold text-foreground">{title}</h3>
        {lines.map((l, i) => (
          <p key={i} className="text-sm text-muted-foreground">{l}</p>
        ))}
      </div>
    </div>
  );
}
