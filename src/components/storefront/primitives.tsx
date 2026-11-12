"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            i <= Math.round(rating) ? "fill-gold text-gold" : "fill-transparent text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}

export function Price({ price, mrp, size = "md" }: { price: number; mrp?: number; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
  const mrpSz = size === "lg" ? "text-base" : "text-xs";
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  return (
    <div className="flex items-baseline gap-2">
      <span className={cn("font-semibold text-foreground", sz)}>{fmt(price)}</span>
      {mrp && mrp > price && <span className={cn("text-muted-foreground line-through", mrpSz)}>{fmt(mrp)}</span>}
    </div>
  );
}

export function DiscountBadge({ pct }: { pct: number }) {
  if (pct <= 0) return null;
  return (
    <span className="inline-flex items-center rounded-sm bg-navy px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ivory">
      {pct}% Off
    </span>
  );
}

export function NewBadge() {
  return (
    <span className="inline-flex items-center rounded-sm bg-gold px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">
      New
    </span>
  );
}

export function BestsellerBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-sm bg-gold-gradient px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">
      <Star className="h-2.5 w-2.5 fill-navy text-navy" /> Bestseller
    </span>
  );
}
