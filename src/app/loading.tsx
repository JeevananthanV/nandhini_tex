import Link from "next/link";

/**
 * Loading UI — shown automatically by Next.js when a server component
 * is streaming (e.g. the `/` route is waiting for the DB category query).
 * Returns an elegant skeleton that mirrors the home page hero so there's
 * no visual jump when the real content arrives.
 */
export default function Loading() {
  return (
    <div className="min-h-screen" aria-busy="true" aria-live="polite">
      {/* Hero skeleton */}
      <section className="relative h-[88vh] min-h-[560px] w-full bg-navy-gradient">
        <div className="absolute inset-0 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-8">
          <div className="h-8 w-44 animate-pulse rounded-full bg-ivory/10" />
          <div className="mt-6 h-14 w-80 max-w-full animate-pulse rounded-md bg-ivory/10" />
          <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded-md bg-ivory/10" />
          <div className="mt-6 h-4 w-96 max-w-full animate-pulse rounded-md bg-ivory/10" />
          <div className="mt-8 flex gap-4">
            <div className="h-12 w-44 animate-pulse rounded-sm bg-gold/20" />
            <div className="h-12 w-40 animate-pulse rounded-sm bg-ivory/10" />
          </div>
        </div>
      </section>

      {/* Trust strip skeleton */}
      <section className="border-y border-border bg-navy">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 py-5 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-center gap-2.5">
              <div className="h-5 w-5 animate-pulse rounded-full bg-ivory/20" />
              <div className="h-3 w-20 animate-pulse rounded-md bg-ivory/20" />
            </div>
          ))}
        </div>
      </section>

      {/* Collections skeleton */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
        <div className="mt-3 h-9 w-48 animate-pulse rounded-md bg-muted" />
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-md bg-muted"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </section>

      {/* SR-only skip link for screen readers */}
      <Link href="#main" className="sr-only focus:not-sr-only">
        Skip to main content
      </Link>
    </div>
  );
}
