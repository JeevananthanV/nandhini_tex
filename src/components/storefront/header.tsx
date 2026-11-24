"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, X, PackageSearch, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ANNOUNCEMENTS = [
  { text: "Free Pan-India Express Delivery on orders above ₹999", tag: "FREE SHIPPING" },
  { text: "Direct from Master Weavers of Elampillai & Kanchipuram", tag: "100% HANDLOOM" },
  { text: "Use Code WELCOME10 for 10% Off your first purchase", tag: "SPECIAL OFFER" },
  { text: "Cash on Delivery & 7-Day Doorstep Exchanges Pan-India", tag: "COD AVAILABLE" },
  { text: "Silk Mark Certified Pure Mulberry & Soft Silk Sarees", tag: "AUTHENTIC" },
];

export function Header({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const goHome = useStore((s) => s.goHome);
  const goTrack = useStore((s) => s.goTrack);
  const goAllProducts = useStore((s) => s.goAllProducts);
  const goCategory = useStore((s) => s.goCategory);
  const goSearch = useStore((s) => s.goSearch);
  const openCart = useStore((s) => s.openCart);
  const toggleMobileMenu = useStore((s) => s.toggleMobileMenu);
  const mobileMenuOpen = useStore((s) => s.mobileMenuOpen);
  const cartCount = useStore((s) => s.cartCount());
  const wishlistCount = useStore((s) => s.wishlist.length);
  const storeView = useStore((s) => s.storeView);
  const selectedCategorySlug = useStore((s) => s.selectedCategorySlug);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      goSearch(query.trim());
      setSearchOpen(false);
    }
  };

  const onHome = storeView === "home";

  return (
    <>
      <motion.header
        initial={false}
        className="fixed inset-x-0 top-0 z-50 flex flex-col transition-all duration-300"
      >
        {/* Top Announcement Bar — Integrated Marquee Ticker */}
        <div className="relative z-20 flex h-8 items-center overflow-hidden border-b border-[#D4AF37]/25 bg-[#061224] text-[#ECC97D] text-[11px] select-none">
          <div className="group relative flex w-full overflow-hidden">
            <div className="flex shrink-0 animate-marquee items-center gap-8 whitespace-nowrap pr-8 group-hover:[animation-play-state:paused]">
              {ANNOUNCEMENTS.map((item, idx) => (
                <span key={`ann-1-${idx}`} className="inline-flex items-center gap-2 font-medium tracking-wide">
                  <Sparkles className="h-3 w-3 text-[#D4AF37] shrink-0" />
                  <span>{item.text}</span>
                  {item.tag && (
                    <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#F5E6A8] border border-[#D4AF37]/40">
                      {item.tag}
                    </span>
                  )}
                  <span className="text-[#D4AF37]/40">✦</span>
                </span>
              ))}
            </div>
            <div className="flex shrink-0 animate-marquee items-center gap-8 whitespace-nowrap pr-8 group-hover:[animation-play-state:paused]" aria-hidden="true">
              {ANNOUNCEMENTS.map((item, idx) => (
                <span key={`ann-2-${idx}`} className="inline-flex items-center gap-2 font-medium tracking-wide">
                  <Sparkles className="h-3 w-3 text-[#D4AF37] shrink-0" />
                  <span>{item.text}</span>
                  {item.tag && (
                    <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#F5E6A8] border border-[#D4AF37]/40">
                      {item.tag}
                    </span>
                  )}
                  <span className="text-[#D4AF37]/40">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div
          className={cn(
            "relative transition-all duration-300",
            scrolled
              ? "bg-[#071731]/95 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.3)] border-b border-[#D4AF37]/30"
              : onHome
                ? "bg-gradient-to-b from-[#061224]/90 via-[#061224]/60 to-transparent"
                : "bg-[#071731]/95 backdrop-blur-md border-b border-[#D4AF37]/20"
          )}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-18 md:px-8">
            {/* Left: Mobile hamburger + Brand Logo */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={toggleMobileMenu}
                className="flex h-10 w-10 items-center justify-center rounded-md text-ivory/90 transition-colors hover:bg-white/10 md:hidden cursor-pointer"
                aria-label="Open mobile menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                onClick={goHome}
                className="flex min-h-10 items-center gap-2.5 py-1 text-left cursor-pointer group"
                aria-label="Nandhini Tex home"
              >
                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-sm bg-gradient-to-br from-[#10294D] via-[#081B3A] to-[#050F1F] ring-1 ring-[#D4AF37]/60 group-hover:ring-[#D4AF37] transition-all duration-300 shadow-md">
                  <span className="font-display text-lg md:text-xl font-bold text-gold-gradient">N</span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-display text-base font-bold tracking-wider text-ivory md:text-lg group-hover:text-[#F5E6A8] transition-colors">
                    NANDHINI TEX
                  </span>
                  <span className="text-[8.5px] uppercase tracking-[0.25em] text-[#D4AF37] font-medium mt-0.5">
                    Royal Heritage
                  </span>
                </div>
              </button>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
              <button
                onClick={goHome}
                className={cn(
                  "relative py-1 text-sm font-medium transition-colors hover:text-[#ECC97D] cursor-pointer",
                  onHome ? "text-[#ECC97D] font-semibold" : "text-ivory/90"
                )}
              >
                Home
                {onHome && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                  />
                )}
              </button>
              <button
                onClick={goAllProducts}
                className={cn(
                  "relative py-1 text-sm font-semibold tracking-wide transition-colors hover:text-[#ECC97D] cursor-pointer",
                  storeView === "all-products" ? "text-[#ECC97D]" : "text-ivory/90"
                )}
              >
                Shop All
                {storeView === "all-products" && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                  />
                )}
              </button>
              {categories.slice(0, 6).map((c) => {
                const isActive = storeView === "category" && selectedCategorySlug === c.slug;
                return (
                  <button
                    key={c.id}
                    onClick={() => goCategory(c.slug)}
                    className={cn(
                      "relative py-1 text-sm font-medium transition-colors hover:text-[#ECC97D] cursor-pointer",
                      isActive ? "text-[#ECC97D] font-semibold" : "text-ivory/90"
                    )}
                  >
                    {c.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={() => goTrack()}
                className="hidden h-9 items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#081B3A]/60 px-3.5 text-xs font-semibold text-[#ECC97D] transition-all hover:bg-[#D4AF37]/20 hover:border-[#D4AF37] sm:flex backdrop-blur-sm cursor-pointer"
                title="Track your order — delivered via Delhivery / DTDC / India Post"
              >
                <PackageSearch className="h-4 w-4 text-[#D4AF37]" /> Track Parcel
              </button>
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ivory/90 transition-colors hover:bg-white/10 hover:text-[#ECC97D] cursor-pointer"
                aria-label="Search sarees and collections"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
              <button
                onClick={() => window.dispatchEvent(new Event("open-wishlist"))}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-ivory/90 transition-colors hover:bg-white/10 hover:text-[#ECC97D] cursor-pointer"
                aria-label={`Wishlist, ${wishlistCount} items`}
              >
                <Heart className="h-[18px] w-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-navy shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button
                onClick={openCart}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-ivory/90 transition-colors hover:bg-white/10 hover:text-[#ECC97D] cursor-pointer"
                aria-label={`Shopping cart, ${cartCount} items`}
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[9px] font-bold text-[#081B3A] shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Integrated Search Bar dropdown */}
          <AnimatePresence>
            {searchOpen && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={submitSearch}
                className="overflow-hidden border-t border-[#D4AF37]/30 bg-[#071731]/98 backdrop-blur-md shadow-2xl"
              >
                <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 md:px-8">
                  <Search className="h-5 w-5 text-[#D4AF37]" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search sarees, fabrics, bridal collections..."
                    className="flex-1 bg-transparent text-base text-ivory outline-none placeholder:text-ivory/50"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-ivory/60 hover:bg-white/10 hover:text-ivory cursor-pointer"
                      aria-label="Clear search input"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="rounded-sm bg-gold-gradient px-5 py-2 text-sm font-semibold text-navy hover:brightness-105 cursor-pointer shadow-gold"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ivory/60 hover:bg-white/10 hover:text-ivory cursor-pointer"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 z-[60] bg-navy-dark/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[85vw] max-w-sm flex-col bg-[#071731] border-r border-[#D4AF37]/30 text-ivory shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#D4AF37]/20 p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-gold-gradient text-navy font-bold text-base shadow-sm">
                    N
                  </div>
                  <span className="font-display text-base font-bold text-ivory">NANDHINI TEX</span>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ivory/70 hover:bg-white/10 hover:text-ivory cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-1 p-4">
                <span className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]/80">
                  Navigation
                </span>
                <button
                  onClick={() => { goHome(); toggleMobileMenu(); }}
                  className={cn(
                    "rounded-lg px-3.5 py-3 text-left text-sm font-medium transition-colors cursor-pointer",
                    onHome ? "bg-white/10 text-[#ECC97D] font-semibold" : "text-ivory/90 hover:bg-white/5"
                  )}
                >
                  Home
                </button>
                <button
                  onClick={() => { goAllProducts(); toggleMobileMenu(); }}
                  className={cn(
                    "rounded-lg px-3.5 py-3 text-left text-sm font-semibold transition-colors cursor-pointer",
                    storeView === "all-products" ? "bg-white/10 text-[#ECC97D]" : "text-ivory/90 hover:bg-white/5"
                  )}
                >
                  Shop All Products
                </button>
                <button
                  onClick={() => { goTrack(); toggleMobileMenu(); }}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3.5 py-3 text-left text-sm font-medium transition-colors cursor-pointer",
                    storeView === "track" ? "bg-white/10 text-[#ECC97D]" : "text-ivory/90 hover:bg-white/5"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <PackageSearch className="h-4 w-4 text-[#D4AF37]" /> Track Order Parcel
                  </span>
                  <span className="text-[10px] rounded bg-[#D4AF37]/20 px-1.5 py-0.5 text-[#ECC97D]">Live</span>
                </button>

                <div className="my-2 border-t border-[#D4AF37]/20" />
                <span className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]/80">
                  Handloom Collections
                </span>
                {categories.map((c) => {
                  const isActive = storeView === "category" && selectedCategorySlug === c.slug;
                  return (
                    <button
                      key={c.id}
                      onClick={() => { goCategory(c.slug); toggleMobileMenu(); }}
                      className={cn(
                        "rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer",
                        isActive ? "bg-white/10 text-[#ECC97D] font-semibold" : "text-ivory/80 hover:bg-white/5"
                      )}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-[#D4AF37]/20 p-5 bg-[#050F1F]/60 text-xs text-ivory/60">
                <p className="font-serif text-[#ECC97D] font-medium">Authentic Handloom Heritage</p>
                <p className="mt-1">Direct from master weavers of Tamil Nadu. Pan-India shipping with cash on delivery.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
