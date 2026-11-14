"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Error boundary for the root layout — catches errors thrown by server
 * components during streaming/route rendering. (Global-error.tsx catches
 * errors in the root layout itself.)
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error.digest || error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200">
          <AlertTriangle className="h-7 w-7 text-amber-600" strokeWidth={1.5} />
        </div>
        <h1 className="mt-5 font-serif text-xl font-semibold text-navy">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We encountered an error loading this page. Please try again.
        </p>
        {error.digest && (
          <p className="mt-3 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-5 flex h-10 items-center gap-2 rounded-sm bg-navy px-5 text-sm font-semibold text-ivory transition-colors hover:bg-navy-light"
        >
          <RotateCcw className="h-4 w-4" /> Try Again
        </button>
      </motion.div>
    </div>
  );
}
