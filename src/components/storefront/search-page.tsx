"use client";

import { useEffect, useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { ProductCard } from "./product-card";
import type { ProductCard as ProductCardType } from "@/lib/format";

export function SearchPage() {
  const query = useStore((s) => s.searchQuery);
  const goSearch = useStore((s) => s.goSearch);
  const goHome = useStore((s) => s.goHome);
  const [results, setResults] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(!!query);
  const [input, setInput] = useState(query);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    fetch(`/api/products?q=${encodeURIComponent(query)}&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setResults(d.products || []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [query]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) goSearch(input.trim());
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <button onClick={goHome} className="hover:text-navy">Home</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Search</span>
        </nav>

        <form onSubmit={submit} className="flex max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search sarees, fabrics, collections..."
              className="h-12 w-full rounded-sm border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-gold"
            />
          </div>
          <button type="submit" className="rounded-sm bg-navy px-6 text-sm font-semibold text-ivory hover:bg-navy-light">Search</button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          {loading ? "Searching..." : `${results.length} ${results.length === 1 ? "result" : "results"} for "${query}"`}
        </p>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] rounded-md bg-muted" />
                <div className="mt-3 h-3 w-20 rounded bg-muted" />
                <div className="mt-2 h-4 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center text-center">
            <Search className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 font-serif text-xl text-foreground">No results found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or browse our collections.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {results.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
