"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Cloudflare Turnstile — invisible CAPTCHA widget
// ============================================================================
// Docs: https://developers.cloudflare.com/turnstile/
//
// Usage:
//   <TurnstileWidget onVerify={(token) => setToken(token)} />
//   // Then submit `token` to your API route, which calls verifyTurnstileToken()
//
// If NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set, this renders nothing and
// onVerify is called with an empty token (server-side verify fails open).

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileOptions = {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  callback?: (token: string) => void;
  "error-callback"?: (error: string) => void;
  "expired-callback"?: () => void;
};

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

// Load the Turnstile script once (shared across all widget instances)
let scriptPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile script"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

type TurnstileWidgetProps = {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  className?: string;
  theme?: "light" | "dark" | "auto";
};

export function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  className,
  theme = "light",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [siteKey] = useState(() => process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "");
  const [loaded, setLoaded] = useState(false);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;
    // Clear any previous widget
    if (widgetIdRef.current) {
      try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme,
      callback: onVerify,
      "error-callback": onError,
      "expired-callback": onExpire,
    });
  }, [siteKey, theme, onVerify, onError, onExpire]);

  useEffect(() => {
    if (!siteKey) {
      // Not configured — call onVerify with empty token so the form can proceed
      onVerify("");
      return;
    }

    let cancelled = false;
    loadTurnstileScript()
      .then(() => {
        if (cancelled) return;
        setLoaded(true);
        renderWidget();
      })
      .catch((err) => {
        if (!cancelled && onError) onError(err.message);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
      }
    };
  }, [siteKey, renderWidget, onError, onVerify]);

  // Not configured — render nothing
  if (!siteKey) return null;

  return (
    <div
      ref={containerRef}
      className={cn("cf-turnstile", !loaded && "min-h-[65px]", className)}
      aria-label="CAPTCHA verification"
    />
  );
}
