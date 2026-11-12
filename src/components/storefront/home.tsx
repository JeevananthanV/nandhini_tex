"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShieldCheck, Truck, RefreshCw, Hand, Star, ChevronRight,
  Sparkles, Award, Heart, Phone, Mail, MapPin, MessageCircle
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useStore } from "@/lib/store";
import { ProductCard } from "./product-card";
import { StarRating } from "./primitives";
import type { ProductCard as ProductCardType } from "@/lib/format";

type Category = { id: string; name: string; slug: string; description: string | null; bannerImage: string | null; productCount: number };
type Testimonial = { id: string; name: string; city: string | null; quote: string; rating: number };
type Faq = { id: string; question: string; answer: string; category: string };

export function HomePage({ categories }: { categories: Category[] }) {
  const goCategory = useStore((s) => s.goCategory);
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

  useEffect(() => {
    Promise.all([
      fetch("/api/products?isNew=true&limit=4").then((r) => r.json()),
      fetch("/api/products?isBestseller=true&limit=4").then((r) => r.json()),
      fetch("/api/products?category=bridal&limit=4").then((r) => r.json()),
      fetch("/api/products?category=offer-sarees&limit=4").then((r) => r.json()),
      fetch("/api/products?category=dhotis&limit=4").then((r) => r.json()),
      fetch("/api/testimonials").then((r) => r.json()),
      fetch("/api/faqs").then((r) => r.json()),
    ]).then(([na, bs, br, of, mw, ts, fq]) => {
      setNewArrivals(na.products || []);
      setBestsellers(bs.products || []);
      setBridal(br.products || []);
      setOffers(of.products || []);
      setMenswear(mw.products || []);
      setTestimonials(ts.testimonials || []);
      setFaqs(fq.faqs || []);
    });
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
            src="https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/504fe6faa6dc.jpg"
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

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-navy/30 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-gold backdrop-blur">
              <Sparkles className="h-3 w-3" /> Handwoven in Tamil Nadu
            </span>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.1] text-ivory md:text-6xl">
              Elegance Meets
              <span className="block text-gold-gradient">Tradition</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-ivory/80 md:text-lg">
              Curated handwoven silk & cotton sarees from Elampillai, Kanchipuram & Arani — woven on traditional looms by master artisans.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => goCategory("bridal")}
                className="rounded-sm bg-gold-gradient px-7 py-3 text-sm font-semibold text-navy shadow-gold transition-transform hover:scale-[1.02]"
              >
                Explore Bridal Collection
              </button>
              <button
                onClick={() => goCategory("soft-silk")}
                className="rounded-sm border border-ivory/40 px-7 py-3 text-sm font-semibold text-ivory backdrop-blur transition-colors hover:bg-ivory/10"
              >
                Shop All Sarees
              </button>
            </div>
            <div className="mt-9 flex items-center gap-6 text-ivory/70">
              <div className="flex items-center gap-1.5">
                <StarRating rating={4.8} size={14} />
                <span className="text-sm font-medium text-ivory">4.8</span>
                <span className="text-xs">/ 2,450+ reviews</span>
              </div>
              <div className="h-4 w-px bg-ivory/20" />
              <span className="text-xs">2,400+ happy customers</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="border-y border-border bg-navy text-ivory">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 py-5 md:grid-cols-4 md:px-8">
          {[
            { icon: Hand, label: "100% Handwoven" },
            { icon: Truck, label: "Pan-India Shipping" },
            { icon: RefreshCw, label: "7-Day Returns" },
            { icon: ShieldCheck, label: "Secure Payments" },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-center gap-2.5 text-center md:justify-start">
              <t.icon className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
              <span className="text-xs font-medium uppercase tracking-wider md:text-sm">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORY RAIL ===== */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <SectionHeading eyebrow="Shop by Collection" title="The Collections" />
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {categories.slice(0, 8).map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => goCategory(c.slug)}
              className="group relative aspect-[4/5] overflow-hidden rounded-md bg-muted"
            >
              {c.bannerImage && (
                <Image src={c.bannerImage} alt={c.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/85 via-navy-dark/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                <span className="font-serif text-lg font-semibold text-ivory md:text-xl">{c.name}</span>
                <span className="mt-0.5 block text-[11px] uppercase tracking-wider text-gold/90">{c.productCount} pieces</span>
              </div>
              <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/20 text-ivory backdrop-blur transition-all group-hover:bg-gold group-hover:text-navy">
                <ChevronRight className="h-4 w-4" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      {newArrivals.length > 0 && (
        <ProductRail eyebrow="Just In" title="New Arrivals" products={newArrivals} />
      )}

      {/* ===== BESTSELLERS ===== */}
      {bestsellers.length > 0 && (
        <ProductRail eyebrow="Customer Favourites" title="Bestsellers" products={bestsellers} bg="bg-ivory" />
      )}

      {/* ===== BRIDAL BANNER ===== */}
      <section className="relative overflow-hidden">
        <div className="relative h-[420px] w-full md:h-[480px]">
          <Image src="https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/57427ea841a4.png" alt="Bridal silk saree collection" fill sizes="100vw" className="object-cover" />
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
      {bridal.length > 0 && <ProductRail eyebrow="Heirloom Weaves" title="Bridal Collection" products={bridal} />}

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
                <div className="font-serif text-3xl font-bold text-gold">70+</div>
                <div className="text-xs uppercase tracking-wider text-ivory/60">Unique Weaves</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-bold text-gold">2,400+</div>
                <div className="text-xs uppercase tracking-wider text-ivory/60">Happy Customers</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-bold text-gold">4.8★</div>
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
            <Image src="https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a7699e04fe3b.png" alt="Handloom silk weaving" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </motion.div>
        </div>
      </section>

      {/* ===== OFFERS ===== */}
      {offers.length > 0 && (
        <ProductRail eyebrow="Limited Time" title="Offer Sarees" products={offers} />
      )}

      {/* ===== MENSWEAR ===== */}
      {menswear.length > 0 && (
        <ProductRail eyebrow="For Him" title="Menswear" products={menswear} bg="bg-ivory" />
      )}

      {/* ===== TESTIMONIALS ===== */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
          <SectionHeading eyebrow="Loved by Thousands" title="What Our Customers Say" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                className="relative rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <Star className="absolute right-5 top-5 h-8 w-8 fill-gold/10 text-gold/30" />
                <StarRating rating={t.rating} size={16} />
                <p className="mt-4 font-serif text-lg leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-gradient font-serif text-sm font-semibold text-gold">
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
        <section className="bg-ivory">
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
                className="h-12 flex-1 rounded-sm border border-ivory/30 bg-navy-dark/40 px-4 text-sm text-ivory placeholder:text-ivory/50 focus:border-gold focus:outline-none"
              />
              <button type="submit" className="rounded-sm bg-gold-gradient px-6 text-sm font-semibold text-navy hover:opacity-90">
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
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={center ? "text-center" : ""}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-dark">{eyebrow}</span>
      <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground md:text-4xl">{title}</h2>
      <div className={`mt-3 h-px w-16 bg-gold-gradient ${center ? "mx-auto" : ""}`} />
    </motion.div>
  );
}

function ProductRail({ eyebrow, title, products, bg }: { eyebrow: string; title: string; products: ProductCardType[]; bg?: string }) {
  const goCategory = useStore((s) => s.goCategory);
  return (
    <section className={bg ? `bg-ivory ${bg}` : ""}>
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow={eyebrow} title={title} />
          <button onClick={() => goCategory(products[0]?.categorySlug || "soft-silk")} className="hidden items-center gap-1 text-sm font-medium text-navy hover:text-gold md:flex">
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
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
