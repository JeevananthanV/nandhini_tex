"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ShimmerSkeleton } from "./premium";
import { cn } from "@/lib/utils";

// ============================================================================
// Storefront skeleton loaders
// Placeholders mirror the real layouts so nothing jumps when data arrives.
// All skeletons are aria-hidden + aria-busy for screen readers.
// ============================================================================

// One product card placeholder — mirrors ProductCard (4/5 image, category
// eyebrow, two-line title, rating row, price row).
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)} aria-hidden="true">
      <ShimmerSkeleton className="aspect-[4/5] w-full rounded-md" />
      <Skeleton className="mt-3 h-3 w-20" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-3.5 w-24" />
      <Skeleton className="mt-2 h-5 w-28" />
    </div>
  );
}

// Grid of card skeletons — pass the same density classes as the real grid
// so the switch from skeleton to content is seamless.
export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-4 md:gap-6", className)}
      aria-hidden="true"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Full-width rail placeholder for the home page (heading block + 4 cards).
export function ProductRailSkeleton({ bg, className }: { bg?: string; className?: string }) {
  return (
    <section className={cn(bg, className)} aria-hidden="true" aria-busy="true">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="flex items-end justify-between">
          <div className="w-full max-w-xs">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-9 w-56" />
            <Skeleton className="mt-3 h-px w-16" />
          </div>
          <Skeleton className="hidden h-4 w-20 md:block" />
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// First-paint skeleton used by the shell before hydration — replaces the
// blank white flash with a structured preview of the home page.
export function HomeSkeleton() {
  return (
    <div className="min-h-screen" aria-hidden="true" aria-busy="true">
      {/* Hero */}
      <div className="relative h-[88vh] min-h-[560px] w-full bg-navy-gradient">
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 to-transparent" />
        <div className="absolute inset-0 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-8">
          <Skeleton className="h-8 w-44 bg-ivory/10" />
          <Skeleton className="mt-6 h-14 w-80 max-w-full bg-ivory/10" />
          <Skeleton className="mt-4 h-10 w-72 max-w-full bg-ivory/10" />
          <Skeleton className="mt-6 h-4 w-96 max-w-full bg-ivory/10" />
          <div className="mt-8 flex gap-4">
            <ShimmerSkeleton className="h-12 w-44 rounded-sm" />
            <ShimmerSkeleton className="h-12 w-40 rounded-sm" />
          </div>
        </div>
      </div>
      {/* Collections */}
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-9 w-48" />
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="aspect-[4/5] w-full rounded-md" />
          ))}
        </div>
      </div>
      <ProductRailSkeleton bg="bg-ivory" />
    </div>
  );
}

// PDP skeleton — breadcrumb + gallery column + info column.
export function PdpSkeleton() {
  return (
    <div className="min-h-screen pt-20" aria-hidden="true" aria-busy="true">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="grid gap-8 md:gap-12 lg:grid-cols-2">
          {/* Gallery column */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <ShimmerSkeleton className="aspect-[4/5] w-full rounded-lg" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-md" />
              ))}
            </div>
          </div>
          {/* Info column */}
          <div className="flex flex-col gap-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-9 w-2/3" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <div className="mt-2 grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
            <div className="mt-2 flex gap-3">
              <ShimmerSkeleton className="h-12 flex-1 rounded-sm" />
              <ShimmerSkeleton className="h-12 flex-1 rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
