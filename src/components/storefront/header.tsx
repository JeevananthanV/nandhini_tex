"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, X, Shield, PackageSearch } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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
  const setMode = useStore((s) => s.setMode);
  const cartCount = useStore((s) => s.cartCount());
  const wishlistCount = useStore((s) => s.wishlist.length);
  const storeView = useStore((s) => s.storeView);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          onHome && !scrolled
            ? "bg-transparent"
            : "bg-background/95 shadow-[0_1px_0_0_rgba(201,162,39,0.2)] backdrop-blur"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-8">
          {/* Left: mobile menu + logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-muted/60 md:hidden"
              aria-label="Open menu"
            >
              <Menu className={cn("h-5 w-5", onHome && !scrolled ? "text-ivory" : "text-foreground")} />
            </button>
            <button onClick={goHome} className="flex min-h-10 items-center gap-2 py-1" aria-label="Nandhini Tex home">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-navy-gradient ring-1 ring-gold/50">
                <span className="font-display text-lg font-bold text-gold-gradient">N</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className={cn("font-display text-base font-semibold tracking-wider md:text-lg", onHome && !scrolled ? "text-ivory" : "text-navy")}>
                  NANDHINI TEX
                </span>
                <span className={cn("text-[8px] uppercase tracking-[0.25em]", onHome && !scrolled ? "text-gold/80" : "text-gold-dark")}>
                  Royal Heritage
                </span>
              </div>
            </button>
          </div>

          {/* Center: nav */}
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
            <button onClick={goHome} className={cn("text-sm font-medium transition-colors hover:text-gold", onHome && !scrolled ? "text-ivory/90" : "text-foreground")}>
              Home
            </button>
            <button
              onClick={goAllProducts}
              className={cn(
                "text-sm font-semibold tracking-wide transition-colors hover:text-gold",
                storeView === "all-products" ? "text-gold" : onHome && !scrolled ? "text-ivory/90" : "text-foreground"
              )}
            >
              Shop All
            </button>
            {categories.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => goCategory(c.slug)}
                className={cn("text-sm font-medium transition-colors hover:text-gold", onHome && !scrolled ? "text-ivory/90" : "text-foreground")}
              >
                {c.name}
              </button>
            ))}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => goTrack()}
              className={cn("hidden h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors hover:bg-muted sm:flex", onHome && !scrolled ? "text-ivory/90 hover:bg-ivory/10" : "text-navy hover:bg-muted")}
              title="Track your order — delivered via Delhivery / DTDC / India Post"
            >
              <PackageSearch className="h-4 w-4" /> Track Parcel
            </button>
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className={cn("flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted", onHome && !scrolled ? "text-ivory" : "text-foreground")}
              aria-label="Search sarees and collections"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => setMode("admin")}
              className={cn("hidden h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors sm:flex", onHome && !scrolled ? "text-ivory hover:bg-ivory/10" : "text-navy hover:bg-muted")}
              title="Admin Panel"
            >
              <Shield className="h-4 w-4" /> Admin
            </button>
            <button
              onClick={() => window.dispatchEvent(new Event("open-wishlist"))}
              className={cn("relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted", onHome && !scrolled ? "text-ivory" : "text-foreground")}
              aria-label={`Wishlist, ${wishlistCount} items`}
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-navy">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={openCart}
              className={cn("relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted", onHome && !scrolled ? "text-ivory" : "text-foreground")}
              aria-label={`Shopping cart, ${cartCount} items`}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-navy px-1 text-[9px] font-bold text-ivory">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={submitSearch}
              className="overflow-hidden border-t border-border bg-background"
            >
              <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 md:px-8">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sarees, fabrics, collections..."
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" className="rounded-sm bg-navy px-4 py-1.5 text-sm font-semibold text-ivory hover:bg-navy-light">
                  Search
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 z-[60] bg-navy-dark/50 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-[70] w-[80vw] max-w-sm overflow-y-auto bg-background p-6 shadow-2xl md:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-serif text-xl font-semibold text-navy">Menu</span>
                <button onClick={toggleMobileMenu} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => { goHome(); toggleMobileMenu(); }}
                  className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted"
                >
                  Home
                </button>
                <button
                  onClick={() => { goAllProducts(); toggleMobileMenu(); }}
                  className="rounded-md px-3 py-2.5 text-left text-sm font-semibold text-navy hover:bg-muted"
                >
                  Shop All Products
                </button>
                <button
                  onClick={() => { goTrack(); toggleMobileMenu(); }}
                  className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted"
                >
                  Track Order
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { goCategory(c.slug); toggleMobileMenu(); }}
                    className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {c.name}
                  </button>
                ))}
              </nav>
              <div className="mt-6 border-t border-border pt-6">
                <button
                  onClick={() => { setMode("admin"); toggleMobileMenu(); }}
                  className="flex w-full items-center gap-2 rounded-md bg-navy px-4 py-3 text-sm font-semibold text-ivory"
                >
                  <Shield className="h-4 w-4" /> Admin Panel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
