"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Heart, ShoppingBag, Menu, X, PackageSearch, Sparkles,
  ChevronDown, ArrowRight, Crown, Gem, Feather, ShieldCheck
} from "lucide-react";
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpenAccordion, setMobileOpenAccordion] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

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

  const closeDropdowns = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(null);
  };

  const handleMouseEnter = (menuId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(menuId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  // Close dropdown on click outside or escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        closeDropdowns();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        closeDropdowns();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      goSearch(query.trim());
      setSearchOpen(false);
      closeDropdowns();
    }
  };

  const onHome = storeView === "home";

  // Data definitions for multi-category dropdowns
  const MEGA_MENU_COLUMNS = [
    {
      title: "Silk Varieties",
      slug: "silk-varieties",
      badge: "32 DESIGNS",
      icon: <Sparkles className="h-4 w-4 text-[#D4AF37]" />,
      items: [
        { name: "Soft Silk Sarees", query: "Soft Silk", badge: "POPULAR" },
        { name: "Kubera Pattu Sarees", query: "Kubera Pattu" },
        { name: "Pure Kanchipuram Silks", query: "Kanchipuram" },
        { name: "Banarasi Mashru Silks", query: "Mashru" },
        { name: "Vairaoosi Striped Silks", query: "Vairaoosi" },
        { name: "Neelambari Temple Silks", query: "Neelambari" },
      ],
    },
    {
      title: "Bridal & Pattu",
      slug: "bridal",
      badge: "18 DESIGNS",
      icon: <Crown className="h-4 w-4 text-[#D4AF37]" />,
      items: [
        { name: "Samudhrikha Bridal Pattu", query: "Samudhrikha", badge: "HEIRLOOM" },
        { name: "Grand Muhurtham Silks", query: "Subhamugurtha" },
        { name: "Silver Bridal Zari Pattu", query: "Silver Bridal" },
        { name: "Two Gram Gold Zari Silks", query: "Two Gram" },
        { name: "One Gram Pure Zari Silks", query: "One Gram" },
        { name: "Elampillai Mayil Pattu", query: "Mayil Pattu" },
      ],
    },
    {
      title: "Cotton Collections",
      slug: "cotton-sarees",
      badge: "31 DESIGNS",
      icon: <Feather className="h-4 w-4 text-[#D4AF37]" />,
      items: [
        { name: "Handloom Khadi Cottons", query: "Khadi Cotton", badge: "NATURAL" },
        { name: "Madurai Sungudi Sarees", query: "Sungudi" },
        { name: "Narayanapet Temple Zari", query: "Narayanapet" },
        { name: "Kalyani Cotton Korvai", query: "Kalyani Cotton" },
        { name: "Maheshwari Cotton Silks", query: "Maheshwari" },
        { name: "Kerala Kasavu Weaves", query: "Kasavu" },
      ],
    },
    {
      title: "Designer & Combos",
      slug: "designer",
      badge: "24 DESIGNS",
      icon: <Gem className="h-4 w-4 text-[#D4AF37]" />,
      items: [
        { name: "Butterfly Cut Work Designer", query: "Butterfly", badge: "HOT" },
        { name: "Digital Softy Floral Prints", query: "Softy" },
        { name: "VIVAAHA Couple Sets", query: "Couple" },
        { name: "Traditional Half Saree Sets", query: "Half Saree" },
        { name: "Nita Ambani Tissue Gold", slug: "celebrity" },
        { name: "Vesti & Silk Shirt Combos", query: "Vesti" },
      ],
    },
  ];

  return (
    <>
      <motion.header
        ref={headerRef}
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
            scrolled || activeDropdown
              ? "bg-[#071731]/98 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.35)] border-b border-[#D4AF37]/30"
              : onHome
                ? "bg-gradient-to-b from-[#061224]/90 via-[#061224]/60 to-transparent"
                : "bg-[#071731]/95 backdrop-blur-md border-b border-[#D4AF37]/20"
          )}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:h-18 md:px-8">
            {/* Left: Mobile menu toggle + Brand Logo */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={toggleMobileMenu}
                className="flex h-10 w-10 items-center justify-center rounded-md text-ivory/90 transition-colors hover:bg-white/10 md:hidden cursor-pointer"
                aria-label="Open mobile menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                onClick={() => { goHome(); closeDropdowns(); }}
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

            {/* Center: Desktop Navigation Links with Multiple Category Dropdowns */}
            <nav className="hidden items-center gap-1 xl:gap-2 lg:flex" aria-label="Primary navigation">
              {/* 1. Home */}
              <button
                onClick={() => { goHome(); closeDropdowns(); }}
                className={cn(
                  "relative px-2.5 py-1.5 text-xs xl:text-sm font-medium transition-colors hover:text-[#ECC97D] cursor-pointer",
                  onHome ? "text-[#ECC97D] font-semibold" : "text-ivory/90"
                )}
              >
                Home
                {onHome && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-0.5 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                  />
                )}
              </button>

              {/* 2. All Collections ▾ (Mega Dropdown Menu with Multiple Categories) */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter("collections")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  data-nav="collections"
                  onClick={() => setActiveDropdown(activeDropdown === "collections" ? null : "collections")}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs xl:text-sm font-semibold tracking-wide transition-colors hover:text-[#ECC97D] cursor-pointer",
                    activeDropdown === "collections"
                      ? "text-[#ECC97D] bg-white/5"
                      : "text-ivory/90"
                  )}
                  aria-expanded={activeDropdown === "collections"}
                >
                  <span>Collections</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-[#D4AF37] transition-transform duration-200",
                      activeDropdown === "collections" && "rotate-180"
                    )}
                  />
                </button>

                {/* Mega Dropdown Panel */}
                <AnimatePresence>
                  {activeDropdown === "collections" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.99 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="fixed left-1/2 -translate-x-1/2 top-[calc(100%+6px)] w-[95vw] max-w-6xl rounded-2xl border border-[#D4AF37]/35 bg-[#071731]/98 backdrop-blur-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
                      onMouseEnter={() => handleMouseEnter("collections")}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Top Accent Shimmer */}
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

                      <div className="grid grid-cols-5 gap-6">
                        {/* 4 Categorized Columns */}
                        {MEGA_MENU_COLUMNS.map((col, idx) => (
                          <div key={idx} className="flex flex-col space-y-3">
                            <button
                              onClick={() => {
                                goCategory(col.slug);
                                closeDropdowns();
                              }}
                              className="group/col flex items-center justify-between border-b border-[#D4AF37]/20 pb-2 text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                {col.icon}
                                <span className="font-serif text-sm font-bold tracking-wide text-[#FAF7F0] group-hover/col:text-[#ECC97D] transition-colors">
                                  {col.title}
                                </span>
                              </div>
                              <span className="text-[9px] rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-1.5 py-0.5 font-bold uppercase tracking-wider text-[#ECC97D]">
                                {col.badge}
                              </span>
                            </button>

                            <div className="flex flex-col space-y-1 pt-1">
                              {col.items.map((subItem, sIdx) => (
                                <button
                                  key={sIdx}
                                  onClick={() => {
                                    if (subItem.slug) {
                                      goCategory(subItem.slug);
                                    } else if (subItem.query) {
                                      goSearch(subItem.query);
                                    }
                                    closeDropdowns();
                                  }}
                                  className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs text-ivory/80 transition-all hover:bg-white/5 hover:text-[#ECC97D] cursor-pointer"
                                >
                                  <span className="truncate transition-transform duration-150 group-hover:translate-x-1">
                                    {subItem.name}
                                  </span>
                                  {subItem.badge && (
                                    <span className="shrink-0 text-[8.5px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/25">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => {
                                goCategory(col.slug);
                                closeDropdowns();
                              }}
                              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4AF37] hover:text-[#F5E6A8] transition-colors pt-1 cursor-pointer"
                            >
                              <span>View All {col.title}</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        ))}

                        {/* 5th Column: Featured Spotlight Card */}
                        <div className="flex flex-col justify-between rounded-xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#0B1D3A] to-[#050F1F] p-4 text-ivory shadow-lg relative overflow-hidden group">
                          <div className="relative h-28 w-full rounded-lg overflow-hidden shrink-0 border border-[#D4AF37]/20">
                            <Image
                              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80"
                              alt="Handloom Silk Spotlight"
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050F1F]/90 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-[#071731]/90 border border-[#D4AF37]/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#ECC97D]">
                              <ShieldCheck className="h-3 w-3 text-[#D4AF37]" /> Silk Mark Certified
                            </div>
                          </div>

                          <div className="mt-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                              Master Artisan Edit
                            </span>
                            <h4 className="mt-1 font-serif text-sm font-bold text-ivory leading-snug">
                              Direct from Elampillai & Kanchipuram
                            </h4>
                            <p className="mt-1 text-[11px] text-ivory/70 leading-tight">
                              Authentic weaves with pure zari borders. COD & Pan-India dispatch in 24h.
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              goAllProducts();
                              closeDropdowns();
                            }}
                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-gold-gradient py-2 text-xs font-semibold uppercase tracking-wider text-[#081B3A] shadow-gold hover:brightness-105 transition-all cursor-pointer"
                          >
                            <span>Shop All 100+ Sarees</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Silk Varieties ▾ (Individual Dropdown) */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter("silk")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  data-nav="silk"
                  onClick={() => setActiveDropdown(activeDropdown === "silk" ? null : "silk")}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs xl:text-sm font-medium transition-colors hover:text-[#ECC97D] cursor-pointer",
                    selectedCategorySlug === "silk-varieties" || activeDropdown === "silk"
                      ? "text-[#ECC97D] font-semibold bg-white/5"
                      : "text-ivory/90"
                  )}
                  aria-expanded={activeDropdown === "silk"}
                >
                  <span>Silk Varieties</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-[#D4AF37] transition-transform duration-200",
                      activeDropdown === "silk" && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === "silk" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-full pt-2 w-76 z-50"
                      onMouseEnter={() => handleMouseEnter("silk")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="rounded-xl border border-[#D4AF37]/35 bg-[#071731]/98 backdrop-blur-xl p-3 shadow-[0_16px_45px_rgba(0,0,0,0.55)] relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                        <div className="px-3 py-1.5 border-b border-[#D4AF37]/20 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                            Silk Varieties (32 Designs)
                          </span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {[
                            { name: "Soft Silk Sarees", desc: "Lightweight, soft sheen for festive days", query: "Soft Silk" },
                            { name: "Kubera Pattu", desc: "Pochampalli zari border elegance", query: "Kubera Pattu" },
                            { name: "Kanchipuram Silk", desc: "Grand temple borders with pure zari", query: "Kanchipuram" },
                            { name: "Banarasi Mashru", desc: "Heritage jacquard wedding drape", query: "Mashru" },
                            { name: "Vairaoosi Striped", desc: "Salem & Arani classic needle stripes", query: "Vairaoosi" },
                          ].map((item, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                goSearch(item.query);
                                closeDropdowns();
                              }}
                              className="group flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <span className="text-xs font-semibold text-ivory group-hover:text-[#ECC97D] transition-colors flex items-center justify-between">
                                <span>{item.name}</span>
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#D4AF37]" />
                              </span>
                              <span className="text-[10px] text-ivory/60 leading-tight">
                                {item.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 border-t border-[#D4AF37]/20 pt-2 px-1">
                          <button
                            onClick={() => {
                              goCategory("silk-varieties");
                              closeDropdowns();
                            }}
                            className="flex w-full items-center justify-between rounded-md bg-[#D4AF37]/15 px-3 py-2 text-xs font-bold text-[#ECC97D] hover:bg-[#D4AF37]/25 transition-colors"
                          >
                            <span>Explore All Silk Varieties</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Bridal & Pattu ▾ (Individual Dropdown) */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter("bridal")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  data-nav="bridal"
                  onClick={() => setActiveDropdown(activeDropdown === "bridal" ? null : "bridal")}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs xl:text-sm font-medium transition-colors hover:text-[#ECC97D] cursor-pointer",
                    selectedCategorySlug === "bridal" || activeDropdown === "bridal"
                      ? "text-[#ECC97D] font-semibold bg-white/5"
                      : "text-ivory/90"
                  )}
                  aria-expanded={activeDropdown === "bridal"}
                >
                  <span>Bridal & Pattu</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-[#D4AF37] transition-transform duration-200",
                      activeDropdown === "bridal" && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === "bridal" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-full pt-2 w-76 z-50"
                      onMouseEnter={() => handleMouseEnter("bridal")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="rounded-xl border border-[#D4AF37]/35 bg-[#071731]/98 backdrop-blur-xl p-3 shadow-[0_16px_45px_rgba(0,0,0,0.55)] relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                        <div className="px-3 py-1.5 border-b border-[#D4AF37]/20 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                            Bridal Silks (18 Designs)
                          </span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {[
                            { name: "Samudhrikha Pattu", desc: "Crown jewel wedding silk with gold zari", query: "Samudhrikha" },
                            { name: "Muhurtham Silks", desc: "Sacred ruby red & deep maroon silks", query: "Subhamugurtha" },
                            { name: "Silver Bridal Pattu", desc: "Royal lavender and pastel silver zari", query: "Silver Bridal" },
                            { name: "Two Gram Gold Zari", desc: "Heirloom weight silk woven over 21 days", query: "Two Gram" },
                            { name: "Elampillai Mayil Pattu", desc: "Peacock motifs and temple borders", query: "Mayil Pattu" },
                          ].map((item, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                goSearch(item.query);
                                closeDropdowns();
                              }}
                              className="group flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <span className="text-xs font-semibold text-ivory group-hover:text-[#ECC97D] transition-colors flex items-center justify-between">
                                <span>{item.name}</span>
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#D4AF37]" />
                              </span>
                              <span className="text-[10px] text-ivory/60 leading-tight">
                                {item.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 border-t border-[#D4AF37]/20 pt-2 px-1">
                          <button
                            onClick={() => {
                              goCategory("bridal");
                              closeDropdowns();
                            }}
                            className="flex w-full items-center justify-between rounded-md bg-[#D4AF37]/15 px-3 py-2 text-xs font-bold text-[#ECC97D] hover:bg-[#D4AF37]/25 transition-colors"
                          >
                            <span>Explore All Bridal Silks</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 5. Cotton Collections ▾ (Individual Dropdown) */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter("cotton")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  data-nav="cotton"
                  onClick={() => setActiveDropdown(activeDropdown === "cotton" ? null : "cotton")}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs xl:text-sm font-medium transition-colors hover:text-[#ECC97D] cursor-pointer",
                    selectedCategorySlug === "cotton-sarees" || activeDropdown === "cotton"
                      ? "text-[#ECC97D] font-semibold bg-white/5"
                      : "text-ivory/90"
                  )}
                  aria-expanded={activeDropdown === "cotton"}
                >
                  <span>Cotton Collections</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-[#D4AF37] transition-transform duration-200",
                      activeDropdown === "cotton" && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === "cotton" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-full pt-2 w-76 z-50"
                      onMouseEnter={() => handleMouseEnter("cotton")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="rounded-xl border border-[#D4AF37]/35 bg-[#071731]/98 backdrop-blur-xl p-3 shadow-[0_16px_45px_rgba(0,0,0,0.55)] relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                        <div className="px-3 py-1.5 border-b border-[#D4AF37]/20 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                            Cotton Sarees (31 Designs)
                          </span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {[
                            { name: "Handloom Khadi Cotton", desc: "Breathable natural weaves for daily pooja", query: "Khadi Cotton" },
                            { name: "Madurai Sungudi", desc: "Traditional tie-dye with gold zari borders", query: "Sungudi" },
                            { name: "Narayanapet Temple Zari", desc: "Classic South Indian temple border cottons", query: "Narayanapet" },
                            { name: "Kalyani Cotton Korvai", desc: "Vibrant contrast borders and soft drape", query: "Kalyani Cotton" },
                            { name: "Kerala Kasavu Weaves", desc: "Traditional off-white & gold pallu", query: "Kasavu" },
                          ].map((item, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                goSearch(item.query);
                                closeDropdowns();
                              }}
                              className="group flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <span className="text-xs font-semibold text-ivory group-hover:text-[#ECC97D] transition-colors flex items-center justify-between">
                                <span>{item.name}</span>
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#D4AF37]" />
                              </span>
                              <span className="text-[10px] text-ivory/60 leading-tight">
                                {item.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 border-t border-[#D4AF37]/20 pt-2 px-1">
                          <button
                            onClick={() => {
                              goCategory("cotton-sarees");
                              closeDropdowns();
                            }}
                            className="flex w-full items-center justify-between rounded-md bg-[#D4AF37]/15 px-3 py-2 text-xs font-bold text-[#ECC97D] hover:bg-[#D4AF37]/25 transition-colors"
                          >
                            <span>Explore All Cotton Sarees</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 6. Designer & Combos ▾ (Individual Dropdown) */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter("designer")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  data-nav="designer"
                  onClick={() => setActiveDropdown(activeDropdown === "designer" ? null : "designer")}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs xl:text-sm font-medium transition-colors hover:text-[#ECC97D] cursor-pointer",
                    selectedCategorySlug === "designer" || selectedCategorySlug === "combos" || activeDropdown === "designer"
                      ? "text-[#ECC97D] font-semibold bg-white/5"
                      : "text-ivory/90"
                  )}
                  aria-expanded={activeDropdown === "designer"}
                >
                  <span>Designer & Sets</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-[#D4AF37] transition-transform duration-200",
                      activeDropdown === "designer" && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === "designer" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full pt-2 w-76 z-50"
                      onMouseEnter={() => handleMouseEnter("designer")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="rounded-xl border border-[#D4AF37]/35 bg-[#071731]/98 backdrop-blur-xl p-3 shadow-[0_16px_45px_rgba(0,0,0,0.55)] relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                        <div className="px-3 py-1.5 border-b border-[#D4AF37]/20 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                            Designer & Combos (24 Designs)
                          </span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {[
                            { name: "Butterfly Cut Work", desc: "Scalloped modern designer silks", query: "Butterfly" },
                            { name: "Digital Softy Florals", desc: "Pastel florals with lightweight drape", query: "Softy" },
                            { name: "VIVAAHA Couple Combos", desc: "Matching bridal saree & vesti shirt", query: "Couple" },
                            { name: "Traditional Half Sarees", desc: "Elampillai pavadai thavani sets", query: "Half Saree" },
                            { name: "Celebrity Inspired Tissue", desc: "Nita Ambani style metallic gold", slug: "celebrity" },
                          ].map((item, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                if (item.slug) goCategory(item.slug);
                                else if (item.query) goSearch(item.query);
                                closeDropdowns();
                              }}
                              className="group flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <span className="text-xs font-semibold text-ivory group-hover:text-[#ECC97D] transition-colors flex items-center justify-between">
                                <span>{item.name}</span>
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#D4AF37]" />
                              </span>
                              <span className="text-[10px] text-ivory/60 leading-tight">
                                {item.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 border-t border-[#D4AF37]/20 pt-2 px-1">
                          <button
                            onClick={() => {
                              goCategory("combos");
                              closeDropdowns();
                            }}
                            className="flex w-full items-center justify-between rounded-md bg-[#D4AF37]/15 px-3 py-2 text-xs font-bold text-[#ECC97D] hover:bg-[#D4AF37]/25 transition-colors"
                          >
                            <span>Explore Ethnic Sets & Combos</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 7. Shop All */}
              <button
                onClick={() => { goAllProducts(); closeDropdowns(); }}
                className={cn(
                  "relative px-2.5 py-1.5 text-xs xl:text-sm font-semibold tracking-wide transition-colors hover:text-[#ECC97D] cursor-pointer",
                  storeView === "all-products" ? "text-[#ECC97D]" : "text-ivory/90"
                )}
              >
                Shop All
                {storeView === "all-products" && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-0.5 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                  />
                )}
              </button>
            </nav>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={() => { goTrack(); closeDropdowns(); }}
                className="hidden h-9 items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#081B3A]/60 px-3.5 text-xs font-semibold text-[#ECC97D] transition-all hover:bg-[#D4AF37]/20 hover:border-[#D4AF37] sm:flex backdrop-blur-sm cursor-pointer"
                title="Track your order — delivered via Delhivery / DTDC / India Post"
              >
                <PackageSearch className="h-4 w-4 text-[#D4AF37]" /> Track Parcel
              </button>
              <button
                onClick={() => { setSearchOpen((v) => !v); closeDropdowns(); }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ivory/90 transition-colors hover:bg-white/10 hover:text-[#ECC97D] cursor-pointer"
                aria-label="Search sarees and collections"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
              <button
                onClick={() => { window.dispatchEvent(new Event("open-wishlist")); closeDropdowns(); }}
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
                onClick={() => { openCart(); closeDropdowns(); }}
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

      {/* Mobile Drawer Navigation with Multiple Category Accordions */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 z-[100] bg-navy-dark/70 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-[110] flex w-[88vw] max-w-sm flex-col bg-[#071731] border-r border-[#D4AF37]/30 text-ivory shadow-2xl md:hidden overflow-y-auto"
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

              <div className="flex flex-1 flex-col gap-1.5 p-4">
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
                  Shop All Products (100+ Sarees)
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
                <span className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Browse By Category & Weave
                </span>

                {/* Multiple Category Accordion Items */}
                {MEGA_MENU_COLUMNS.map((group) => {
                  const isOpen = mobileOpenAccordion === group.slug;
                  return (
                    <div key={group.slug} className="overflow-hidden rounded-lg border border-white/5 bg-white/[0.02]">
                      <button
                        data-mobile-group={group.slug}
                        onClick={() => setMobileOpenAccordion(isOpen ? null : group.slug)}
                        className="flex w-full items-center justify-between px-3.5 py-3 text-left text-sm font-medium text-ivory hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          {group.icon}
                          <span className="font-serif">{group.title}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-[#D4AF37]/20 px-1.5 py-0.5 text-[9px] text-[#ECC97D] font-bold">
                            {group.badge}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-[#D4AF37] transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                          />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="border-t border-white/5 bg-[#050F1F]/60 px-3 py-2 space-y-1"
                          >
                            <button
                              onClick={() => {
                                goCategory(group.slug);
                                toggleMobileMenu();
                              }}
                              className="flex w-full items-center justify-between rounded-md bg-[#D4AF37]/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#ECC97D] hover:bg-[#D4AF37]/20 cursor-pointer"
                            >
                              <span>View All {group.title}</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                            {group.items.map((sub, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => {
                                  if (sub.slug) goCategory(sub.slug);
                                  else if (sub.query) goSearch(sub.query);
                                  toggleMobileMenu();
                                }}
                                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs text-ivory/80 hover:bg-white/5 hover:text-ivory cursor-pointer"
                              >
                                <span>{sub.name}</span>
                                {sub.badge && (
                                  <span className="text-[9px] rounded bg-white/10 px-1.5 py-0.5 text-[#ECC97D]">
                                    {sub.badge}
                                  </span>
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#D4AF37]/20 p-5 bg-[#050F1F]/70 text-xs text-ivory/60">
                <p className="font-serif text-[#ECC97D] font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" /> Authentic Handloom Heritage
                </p>
                <p className="mt-1">Direct from master weavers of Tamil Nadu. Pan-India shipping with cash on delivery.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
