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
      <span className={cn("font-serif font-bold text-foreground", sz)}>{fmt(price)}</span>
      {mrp && mrp > price && <span className={cn("text-muted-foreground/75 line-through font-sans", mrpSz)}>{fmt(mrp)}</span>}
    </div>
  );
}

export function DiscountBadge({ pct }: { pct: number }) {
  if (pct <= 0) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-[#7A1F2B] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-[#FAF7F0] shadow-xs border border-[#962635]/50">
      {pct}% Off
    </span>
  );
}

export function NewBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-[#D4AF37] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-[#081B3A] shadow-xs">
      New
    </span>
  );
}

export function BestsellerBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold-gradient px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-[#081B3A] shadow-xs">
      <Star className="h-2.5 w-2.5 fill-[#081B3A] text-[#081B3A]" /> Bestseller
    </span>
  );
}
