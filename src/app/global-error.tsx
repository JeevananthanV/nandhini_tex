"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

/**
 * Global error boundary — catches unhandled errors in any server or client
 * component and shows a friendly fallback instead of a blank white screen.
 * Next.js automatically wraps the root layout in this boundary.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the server console for monitoring. In production, hook this up
    // to Sentry / Vercel Analytics / a log aggregator.
    console.error("[GlobalError]", error.digest || error.message, error.stack);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200">
              <AlertTriangle className="h-8 w-8 text-amber-600" strokeWidth={1.5} />
            </div>
            <h1 className="mt-6 font-serif text-2xl font-semibold text-navy">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected error occurred. Our team has been notified — please try again.
            </p>
            {error.digest && (
              <p className="mt-3 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={reset}
                className="flex h-10 items-center gap-2 rounded-sm bg-navy px-5 text-sm font-semibold text-ivory transition-colors hover:bg-navy-light"
              >
                <RotateCcw className="h-4 w-4" /> Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex h-10 items-center gap-2 rounded-sm border border-border px-5 text-sm font-semibold text-navy transition-colors hover:bg-muted"
              >
                <Home className="h-4 w-4" /> Home
              </button>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
