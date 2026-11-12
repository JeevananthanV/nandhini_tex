"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X, Heart, ShoppingBag, Clock, Star, ChevronRight, Trash2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { EASE_SILK, DUR, modalPop, drawerSlideRight } from "@/lib/motion";
import { Price, StarRating, DiscountBadge, NewBadge, BestsellerBadge } from "./primitives";
import { cn } from "@/lib/utils";

// ============================================================================
// QuickView Modal — rapid product preview without leaving the grid
// Triggered by product card "eye" icon. Loads product data on demand.
// ============================================================================
export function QuickViewModal() {
  const reduce = useReducedMotion();
  const [productId, setProductId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Listen for a global event to open quick view
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail?.productId;
      if (id) {
        setProductId(id);
      }
    };
    window.addEventListener("open-quickview", handler);
    return () => window.removeEventListener("open-quickview", handler);
  }, []);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    fetch(`/api/products?limit=100`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const p = (d.products || []).find((x: any) => x.id === productId);
        if (p) setData(p);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId]);

  const close = () => { setProductId(null); setData(null); };
  const addToCart = useStore((s) => s.addToCart);
  const goProduct = useStore((s) => s.goProduct);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const isWishlisted = useStore((s) => s.wishlist.some((w) => w.productId === (data?.id || "")));

  return (
    <AnimatePresence>
      {productId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-navy-dark/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
            transition={reduce ? { duration: DUR.base } : { type: "spring", stiffness: 200, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-card shadow-2xl"
          >
            <button onClick={close} className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur hover:text-navy" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            {loading || !data ? (
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div className="aspect-[4/5] animate-pulse rounded-lg bg-muted" />
                <div className="flex flex-col gap-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-20 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            ) : (
              <div className="grid gap-0 sm:grid-cols-2">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <Image src={data.images[0]} alt={data.title} fill sizes="50vw" className="object-cover" />
                  <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {data.isNew && <NewBadge />}
                    {data.isBestseller && <BestsellerBadge />}
                    {data.discountPct > 0 && <DiscountBadge pct={data.discountPct} />}
                  </div>
                </div>
                <div className="flex flex-col p-5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-dark">{data.categoryName}</span>
                  <h3 className="mt-1 font-serif text-xl font-semibold text-foreground">{data.title}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating rating={data.rating} size={14} />
                    <span className="text-xs text-muted-foreground">({data.reviewCount} reviews)</span>
                  </div>
                  <div className="mt-3"><Price price={data.basePrice} mrp={data.mrp} size="lg" /></div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">{data.shortDescription}</p>
                  {data.weaveOrigin && (
                    <p className="mt-2 text-xs text-muted-foreground"><span className="font-medium text-foreground">Weave Origin:</span> {data.weaveOrigin}</p>
                  )}
                  <div className="mt-auto flex flex-col gap-2 pt-4">
                    <button
                      onClick={() => {
                        addToCart({
                          productId: data.id,
                          slug: data.slug,
                          variantId: data.id,
                          title: data.title,
                          image: data.images[0],
                          color: "",
                          size: null,
                          price: data.basePrice,
                          mrp: data.mrp,
                        });
                        close();
                      }}
                      disabled={!data.inStock}
                      className="flex items-center justify-center gap-2 rounded-sm bg-navy py-3 text-sm font-semibold text-ivory hover:bg-navy-light disabled:opacity-50"
                    >
                      <ShoppingBag className="h-4 w-4" /> {data.inStock ? "Add to Bag" : "Out of Stock"}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { goProduct(data.slug); close(); }}
                        className="flex flex-1 items-center justify-center gap-1 rounded-sm border border-border py-2.5 text-sm font-medium text-navy hover:border-navy"
                      >
                        View Details <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => toggleWishlist({ productId: data.id, slug: data.slug, title: data.title, image: data.images[0], price: data.basePrice })}
                        className={cn("flex items-center justify-center rounded-sm border border-border px-3 py-2.5", isWishlisted ? "text-navy" : "text-muted-foreground hover:text-navy")}
                        aria-label="Add to wishlist"
                      >
                        <Heart className={cn("h-4 w-4", isWishlisted && "fill-navy")} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper to trigger quick view from product cards
export function openQuickView(productId: string) {
  window.dispatchEvent(new CustomEvent("open-quickview", { detail: { productId } }));
}

// ============================================================================
// Wishlist Drawer — slide-in panel showing saved items
// ============================================================================
export function WishlistDrawer() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const wishlist = useStore((s) => s.wishlist);
  const goProduct = useStore((s) => s.goProduct);
  const removeWishlist = useStore((s) => s.removeWishlist);
  const addToCart = useStore((s) => s.addToCart);

  // Listen for open events
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-wishlist", handler);
    return () => window.removeEventListener("open-wishlist", handler);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[85] bg-navy-dark/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: DUR.base, ease: EASE_SILK }}
            className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-navy" />
                <h2 className="font-serif text-lg font-semibold text-navy">
                  Wishlist <span className="text-sm font-normal text-muted-foreground">({wishlist.length})</span>
                </h2>
              </div>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {wishlist.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Heart className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-serif text-lg text-foreground">Your wishlist is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">Save sarees you love for later.</p>
                </div>
                <button onClick={() => setOpen(false)} className="mt-2 rounded-sm bg-navy px-6 py-2.5 text-sm font-semibold text-ivory hover:bg-navy-light">
                  Discover Sarees
                </button>
              </div>
            ) : (
              <div className="scrollbar-elegant flex-1 overflow-y-auto px-5 py-4">
                <ul className="flex flex-col gap-4">
                  {wishlist.map((item) => (
                    <li key={item.productId} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                      <button onClick={() => { goProduct(item.slug); setOpen(false); }} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />
                      </button>
                      <div className="flex flex-1 flex-col">
                        <button onClick={() => { goProduct(item.slug); setOpen(false); }} className="text-left font-serif text-sm font-medium leading-snug text-foreground hover:text-navy">
                          {item.title}
                        </button>
                        <Price price={item.price} size="sm" />
                        <div className="mt-auto flex items-center gap-2">
                          <button
                            onClick={() => {
                              addToCart({
                                productId: item.productId,
                                slug: item.slug,
                                variantId: item.productId,
                                title: item.title,
                                image: item.image,
                                color: "",
                                size: null,
                                price: item.price,
                                mrp: item.price,
                              });
                            }}
                            className="flex items-center gap-1 rounded-sm bg-navy px-3 py-1.5 text-xs font-semibold text-ivory hover:bg-navy-light"
                          >
                            <ShoppingBag className="h-3 w-3" /> Add to Bag
                          </button>
                          <button onClick={() => removeWishlist(item.productId)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function openWishlist() {
  window.dispatchEvent(new Event("open-wishlist"));
}

// ============================================================================
// Countdown Timer — for offers / festive deals
// ============================================================================
export function CountdownTimer({
  targetDate,
  className,
  onComplete,
}: {
  targetDate: Date | string;
  className?: string;
  onComplete?: () => void;
}) {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(target));
  const reduce = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = calcTimeLeft(target);
      setTimeLeft(tl);
      if (tl.total <= 0) { onComplete?.(); clearInterval(timer); }
    }, 1000);
    return () => clearInterval(timer);
  }, [target, onComplete]);

  if (timeLeft.total <= 0) return null;

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Clock className="h-4 w-4 text-gold" />
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <motion.span
              key={u.value}
              initial={reduce ? undefined : { y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: EASE_SILK }}
              className="min-w-[1.75rem] rounded-md bg-navy-gradient px-1.5 py-1 text-center font-serif text-base font-bold tabular-nums text-gold"
            >
              {String(u.value).padStart(2, "0")}
            </motion.span>
            <span className="mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">{u.label}</span>
          </div>
          {i < units.length - 1 && <span className="text-sm font-bold text-muted-foreground">:</span>}
        </div>
      ))}
    </div>
  );
}

function calcTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// ============================================================================
// Recently Viewed — tracks viewed products in localStorage
// ============================================================================
const RECENT_KEY = "nandhini-recent";
export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch { return []; }
}
export function addRecentlyViewed(productId: string) {
  if (typeof window === "undefined") return;
  const recent = getRecentlyViewed().filter((id) => id !== productId);
  recent.unshift(productId);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 8)));
}
