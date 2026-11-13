"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, ChevronRight, Rows3, Sparkles, Grid2X2, Grid3X3 } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductGridSkeleton } from "./skeletons";
import type { ProductCard as ProductCardType } from "@/lib/format";

type Category = { id: string; name: string; slug: string; description: string | null; productCount?: number };

const SORTS = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const PRICE_RANGES = [
  { label: "Under ₹1,000", min: 0, max: 1000 },
  { label: "₹1,000 – ₹3,000", min: 1000, max: 3000 },
  { label: "₹3,000 – ₹8,000", min: 3000, max: 8000 },
  { label: "₹8,000 – ₹20,000", min: 8000, max: 20000 },
  { label: "₹20,000+", min: 20000, max: 0 },
];

const FABRICS = ["Pure Mulberry Silk", "Soft Silk", "Handloom Cotton", "Silk", "Art Silk", "Cotton"];

const PAGE_SIZE = 12;

export function AllProductsPage({ categories }: { categories: Category[] }) {
  const goHome = useStore((s) => s.goHome);
  const goCategory = useStore((s) => s.goCategory);

  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [sort, setSort] = useState("popularity");
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [fabric, setFabric] = useState("");
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyBestseller, setOnlyBestseller] = useState(false);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [density, setDensity] = useState<3 | 4>(4);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    // Deferred so quick refetches don't flash a spinner (also avoids sync setState in effect)
    const refreshTimer = window.setTimeout(() => { if (!cancelled) setRefreshing(true); }, 120);
    const params = new URLSearchParams({ sort, limit: "200" });
    if (categorySlug) params.set("category", categorySlug);
    if (priceRange !== null) {
      params.set("minPrice", String(PRICE_RANGES[priceRange].min));
      if (PRICE_RANGES[priceRange].max > 0) params.set("maxPrice", String(PRICE_RANGES[priceRange].max));
    }
    if (fabric) params.set("fabric", fabric);
    if (onlyNew) params.set("isNew", "true");
    if (onlyBestseller) params.set("isBestseller", "true");
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setProducts(d.products || []);
        setLoading(false);
        setRefreshing(false);
        setVisibleCount(PAGE_SIZE);
      })
      .catch(() => { if (!cancelled) { setLoading(false); setRefreshing(false); } });
    return () => { cancelled = true; window.clearTimeout(refreshTimer); };
  }, [categorySlug, sort, priceRange, fabric, onlyNew, onlyBestseller]);

  const filtered = useMemo(() => {
    let list = products;
    if (onlyOffers) list = list.filter((p) => p.discountPct >= 20);
    if (inStockOnly) list = list.filter((p) => p.inStock);
    return list;
  }, [products, onlyOffers, inStockOnly]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const activeFilters = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (categorySlug) {
      const c = categories.find((x) => x.slug === categorySlug);
      if (c) chips.push({ label: c.name, clear: () => setCategorySlug("") });
    }
    if (priceRange !== null) chips.push({ label: PRICE_RANGES[priceRange].label, clear: () => setPriceRange(null) });
    if (fabric) chips.push({ label: fabric, clear: () => setFabric("") });
    if (onlyNew) chips.push({ label: "New Arrivals", clear: () => setOnlyNew(false) });
    if (onlyBestseller) chips.push({ label: "Bestsellers", clear: () => setOnlyBestseller(false) });
    if (onlyOffers) chips.push({ label: "On Offer", clear: () => setOnlyOffers(false) });
    if (inStockOnly) chips.push({ label: "In Stock", clear: () => setInStockOnly(false) });
    return chips;
  }, [categorySlug, priceRange, fabric, onlyNew, onlyBestseller, onlyOffers, inStockOnly, categories]);

  const clearAll = () => {
    setCategorySlug(""); setPriceRange(null); setFabric("");
    setOnlyNew(false); setOnlyBestseller(false); setOnlyOffers(false); setInStockOnly(false);
  };

  const hasFilters = activeFilters.length > 0;

  const priceStat = useMemo(() => {
    if (products.length === 0) return "";
    const prices = products.map((p) => p.basePrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
  }, [products]);

  const FilterContent = (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy">Collection</h4>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setCategorySlug("")}
            className={cn(
              "flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
              categorySlug === "" ? "bg-navy/5 font-medium text-navy" : "text-foreground hover:bg-muted"
            )}
          >
            All Collections
            <span className="text-[10px] text-muted-foreground">{categories.reduce((s, c) => s + (c.productCount ?? 0), 0) || ""}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategorySlug(categorySlug === c.slug ? "" : c.slug)}
              className={cn(
                "flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                categorySlug === c.slug ? "bg-navy/5 font-medium text-navy" : "text-foreground hover:bg-muted"
              )}
            >
              {c.name}
              {typeof c.productCount === "number" && <span className="text-[10px] text-muted-foreground">{c.productCount}</span>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy">Price Range</h4>
        <div className="flex flex-col gap-2">
          {PRICE_RANGES.map((r, i) => (
            <button
              key={i}
              onClick={() => setPriceRange(priceRange === i ? null : i)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                priceRange === i ? "bg-navy/5 font-medium text-navy" : "text-foreground hover:bg-muted"
              )}
            >
              <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", priceRange === i ? "border-navy bg-navy" : "border-border")}>
                {priceRange === i && <span className="h-2 w-2 rounded-full bg-gold" />}
              </span>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy">Fabric</h4>
        <div className="flex flex-col gap-2">
          {FABRICS.map((f) => (
            <button
              key={f}
              onClick={() => setFabric(fabric === f ? "" : f)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                fabric === f ? "bg-navy/5 font-medium text-navy" : "text-foreground hover:bg-muted"
              )}
            >
              <span className={cn("flex h-4 w-4 items-center justify-center rounded-sm border", fabric === f ? "border-navy bg-navy text-ivory" : "border-border")}>
                {fabric === f && <span className="text-[10px]">✓</span>}
              </span>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy">Quick Filters</h4>
        <div className="flex flex-col gap-2">
          <FilterRow label="New Arrivals" checked={onlyNew} onChange={() => setOnlyNew(!onlyNew)} />
          <FilterRow label="Bestsellers" checked={onlyBestseller} onChange={() => setOnlyBestseller(!onlyBestseller)} />
          <FilterRow label="On Offer (20%+ off)" checked={onlyOffers} onChange={() => setOnlyOffers(!onlyOffers)} />
          <FilterRow label="In Stock Only" checked={inStockOnly} onChange={() => setInStockOnly(!inStockOnly)} />
        </div>
      </div>
      <Button variant="outline" onClick={clearAll} className="border-navy/30 text-navy hover:bg-navy/5">
        Clear All Filters
      </Button>
    </div>
  );

  const activeChipFor = (label: string) => {
    if (label === "New Arrivals") return onlyNew;
    if (label === "Bestsellers") return onlyBestseller;
    if (label === "On Offer") return onlyOffers;
    if (label === "In Stock") return inStockOnly;
    if (label === "All") return !hasFilters;
    return false;
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-navy-gradient">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "url(/patterns/heritage-motif.svg)",
            backgroundSize: "220px",
          }}
        />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-14 text-center md:px-8 md:py-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold"
          >
            Handwoven in Elampillai · Est. Generations
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-3 font-serif text-3xl font-semibold text-ivory md:text-5xl"
          >
            The Complete Collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mx-auto mt-3 max-w-xl text-sm text-ivory/70"
          >
            Every saree, dhoti and shirt from our looms — silks, cottons, bridal grandeur and everyday grace. Browse the full heritage catalogue in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ivory/60"
          >
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-gold" /> {loading ? "—" : filtered.length} Handwoven Designs</span>
            <span className="hidden h-1 w-1 rounded-full bg-gold/50 sm:block" />
            <span>{categories.length} Collections</span>
            <span className="hidden h-1 w-1 rounded-full bg-gold/50 sm:block" />
            <span>{priceStat || "—"}</span>
            <span className="hidden h-1 w-1 rounded-full bg-gold/50 sm:block" />
            <span>Free Shipping ₹999+</span>
          </motion.div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-border bg-ivory">
        <div className="mx-auto max-w-7xl px-6 py-3.5 md:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <button onClick={goHome} className="hover:text-navy">Home</button>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">All Products</span>
          </nav>
        </div>
      </div>

      {/* Category chip rail */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur md:top-20">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-6 py-3 scrollbar-elegant md:px-8">
          <button
            onClick={() => setCategorySlug("")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
              categorySlug === "" ? "border-navy bg-navy text-ivory" : "border-border bg-card text-muted-foreground hover:border-navy hover:text-navy"
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => (categorySlug === c.slug ? goCategory(c.slug) : setCategorySlug(c.slug))}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                categorySlug === c.slug ? "border-navy bg-navy text-ivory" : "border-border bg-card text-muted-foreground hover:border-navy hover:text-navy"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-40 max-h-[calc(100vh-11rem)] overflow-y-auto rounded-lg border border-border bg-card p-5 scrollbar-elegant">
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                <SlidersHorizontal className="h-4 w-4 text-navy" />
                <h3 className="font-serif text-base font-semibold text-navy">Refine</h3>
                {hasFilters && <span className="ml-auto rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-navy">{activeFilters.length}</span>}
              </div>
              {FilterContent}
            </div>
          </aside>

          {/* Main grid */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading…" : <>Showing <span className="font-semibold text-navy">{Math.min(visibleCount, filtered.length)}</span> of <span className="font-semibold text-navy">{filtered.length}</span> {filtered.length === 1 ? "product" : "products"}</>}
              </p>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
                      {hasFilters && <span className="ml-1 rounded-full bg-navy px-1.5 text-[10px] font-bold text-ivory">{activeFilters.length}</span>}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="font-serif text-navy">Refine Collection</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 px-1">{FilterContent}</div>
                  </SheetContent>
                </Sheet>

                {/* density toggle */}
                <div className="hidden items-center overflow-hidden rounded-md border border-border md:flex" role="group" aria-label="Grid density">
                  <button
                    onClick={() => setDensity(3)}
                    className={cn("flex h-9 w-9 items-center justify-center transition-colors", density === 3 ? "bg-navy text-ivory" : "bg-background text-muted-foreground hover:text-navy")}
                    aria-label="Comfortable grid"
                    aria-pressed={density === 3}
                  >
                    <Rows3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDensity(4)}
                    className={cn("flex h-9 w-9 items-center justify-center transition-colors", density === 4 ? "bg-navy text-ivory" : "bg-background text-muted-foreground hover:text-navy")}
                    aria-label="Compact grid"
                    aria-pressed={density === 4}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort products"
                  className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>Sort: {s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {activeFilters.map((f, i) => (
                  <button
                    key={i}
                    onClick={f.clear}
                    className="flex items-center gap-1.5 rounded-full border border-navy/20 bg-navy/5 px-3 py-1 text-xs font-medium text-navy transition-colors hover:border-navy/40"
                  >
                    {f.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button onClick={clearAll} className="text-xs font-medium text-gold-dark underline underline-offset-2 hover:text-navy">
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <ProductGridSkeleton
                count={8}
                className={density === 3 ? "md:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"}
              />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
                <Grid2X2 className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-4 font-serif text-lg text-foreground">No products match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting or clearing your selection.</p>
                <Button variant="outline" onClick={clearAll} className="mt-4">Clear Filters</Button>
              </div>
            ) : (
              <>
                <div className={cn("grid grid-cols-2 gap-4 transition-opacity duration-200 md:gap-6", density === 3 ? "md:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4", refreshing && "pointer-events-none opacity-50")}>
                  {visible.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
                {visibleCount < filtered.length && (
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gold-gradient transition-all duration-500" style={{ width: `${Math.min(100, (visibleCount / filtered.length) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">Viewing {visibleCount} of {filtered.length}</p>
                    <Button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="bg-navy px-8 text-ivory hover:bg-navy-light"
                      size="lg"
                    >
                      Load More Sarees
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        checked ? "bg-navy/5 font-medium text-navy" : "text-foreground hover:bg-muted"
      )}
    >
      <span className={cn("flex h-4 w-4 items-center justify-center rounded-sm border", checked ? "border-navy bg-navy text-ivory" : "border-border")}>
        {checked && <span className="text-[10px]">✓</span>}
      </span>
      {label}
    </button>
  );
}
