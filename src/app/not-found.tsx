import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, PackageSearch } from "lucide-react";

/**
 * 404 page — shown when a route doesn't exist.
 * Since this app only exposes `/`, this mainly catches typos like `/admin` or
 * `/products/some-slug` (which are handled client-side via Zustand, not routes).
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy-gradient ring-1 ring-gold/40">
          <span className="font-display text-2xl font-bold text-gold-gradient">N</span>
        </div>
        <p className="mt-6 font-display text-6xl font-bold text-navy">404</p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-navy">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="flex h-10 items-center justify-center gap-2 rounded-sm bg-navy px-5 text-sm font-semibold text-ivory transition-colors hover:bg-navy-light"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>
          <Link
            href="/?view=all-products"
            className="flex h-10 items-center justify-center gap-2 rounded-sm border border-border px-5 text-sm font-semibold text-navy transition-colors hover:bg-muted"
          >
            <Search className="h-4 w-4" /> Browse Products
          </Link>
        </div>
        <div className="mt-8 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Need help? Call us at{" "}
            <a href="tel:+917604811838" className="font-medium text-navy">
              +91 76048 11838
            </a>{" "}
            (Mon–Sat, 10am–7pm IST)
          </p>
        </div>
      </motion.div>
    </div>
  );
}
