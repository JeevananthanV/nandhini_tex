"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { ProductCard as ProductCardType } from "@/lib/format";

type Category = { id: string; name: string; slug: string; description: string | null };

const SORTS = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest" },
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

export function CategoryPage({ categories }: { categories: Category[] }) {
  const slug = useStore((s) => s.selectedCategorySlug);
  const goCategory = useStore((s) => s.goCategory);
  const goHome = useStore((s) => s.goHome);

  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popularity");
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [fabric, setFabric] = useState("");
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyBestseller, setOnlyBestseller] = useState(false);
  const [onlyOffers, setOnlyOffers] = useState(false);

  const category = useMemo(() => categories.find((c) => c.slug === slug), [categories, slug]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const params = new URLSearchParams({ category: slug, sort });
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
      });
    return () => { cancelled = true; };
  }, [slug, sort, priceRange, fabric, onlyNew, onlyBestseller]);

  // offer sarees filter = products with discount > 20
  const filtered = useMemo(() => {
    if (!onlyOffers) return products;
    return products.filter((p) => p.discountPct >= 20);
  }, [products, onlyOffers]);

  const FilterContent = (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy">Price Range</h4>
        <div className="flex flex-col gap-2">
          {PRICE_RANGES.map((r, i) => (
            <button
              key={i}
              onClick={() => setPriceRange(priceRange === i ? null : i)}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                priceRange === i ? "bg-navy/5 font-medium text-navy" : "text-foreground hover:bg-muted"
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${priceRange === i ? "border-navy bg-navy" : "border-border"}`}>
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
          {["Pure Mulberry Silk", "Soft Silk", "Handloom Cotton", "Silk", "Art Silk", "Cotton"].map((f) => (
            <button
              key={f}
              onClick={() => setFabric(fabric === f ? "" : f)}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                fabric === f ? "bg-navy/5 font-medium text-navy" : "text-foreground hover:bg-muted"
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-sm border ${fabric === f ? "border-navy bg-navy text-ivory" : "border-border"}`}>
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
          <CheckboxRow label="New Arrivals" checked={onlyNew} onChange={() => setOnlyNew(!onlyNew)} />
          <CheckboxRow label="Bestsellers" checked={onlyBestseller} onChange={() => setOnlyBestseller(!onlyBestseller)} />
          <CheckboxRow label="On Offer (20%+ off)" checked={onlyOffers} onChange={() => setOnlyOffers(!onlyOffers)} />
        </div>
      </div>
      <Button
        variant="outline"
        onClick={() => { setPriceRange(null); setFabric(""); setOnlyNew(false); setOnlyBestseller(false); setOnlyOffers(false); }}
        className="border-navy/30 text-navy hover:bg-navy/5"
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pt-20">
      {/* breadcrumb + banner */}
      <div className="border-b border-border bg-ivory">
        <div className="mx-auto max-w-7xl px-6 py-6 md:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <button onClick={goHome} className="hover:text-navy">Home</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{category?.name || "All Sarees"}</span>
          </nav>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy md:text-4xl">{category?.name || "All Sarees"}</h1>
          {category?.description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{category.description}</p>}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-28 rounded-lg border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                <SlidersHorizontal className="h-4 w-4 text-navy" />
                <h3 className="font-serif text-base font-semibold text-navy">Filters</h3>
              </div>
              {FilterContent}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`}
              </p>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="font-serif text-navy">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 px-1">{FilterContent}</div>
                  </SheetContent>
                </Sheet>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>Sort: {s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] rounded-md bg-muted" />
                    <div className="mt-3 h-3 w-20 rounded bg-muted" />
                    <div className="mt-2 h-4 w-full rounded bg-muted" />
                    <div className="mt-2 h-4 w-16 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
                <p className="font-serif text-lg text-foreground">No sarees match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your selection.</p>
                <Button variant="outline" onClick={() => { setPriceRange(null); setFabric(""); setOnlyNew(false); setOnlyBestseller(false); setOnlyOffers(false); }} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${checked ? "bg-navy/5 font-medium text-navy" : "text-foreground hover:bg-muted"}`}>
      <span className={`flex h-4 w-4 items-center justify-center rounded-sm border ${checked ? "border-navy bg-navy text-ivory" : "border-border"}`}>
        {checked && <span className="text-[10px]">✓</span>}
      </span>
      {label}
    </button>
  );
}
