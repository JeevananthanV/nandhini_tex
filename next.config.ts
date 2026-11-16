import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  // Prevent clickjacking — same-origin only
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limit referrer leakage — only send origin to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down browser features — we don't use camera/mic/geolocation/etc
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
  // Force HTTPS for 2 years (only sent over HTTPS, ignored on plain HTTP)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Cross-Origin Opener Policy — isolate browsing context group
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // Cross-Origin Resource Policy — restrict cross-origin reads
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  // Content Security Policy
  // - default-src 'self' — only load from same origin by default
  // - script-src 'self' 'unsafe-inline' — Next.js needs inline styles/scripts in dev;
  //   in prod, Next inlines styles but uses nonce-hashed scripts. 'unsafe-inline' is
  //   acceptable for now because we don't render user-supplied HTML.
  // - style-src 'self' 'unsafe-inline' — Tailwind + Framer Motion inject inline styles
  // - img-src 'self' data: https: — allow images from any HTTPS host (configured in next/image)
  // - font-src 'self' data: — Google Fonts loaded via next/font (self-hosted)
  // - connect-src 'self' https: — allow API calls to our backend + image CDN
  // - frame-ancestors 'self' — equivalent to X-Frame-Options but in CSP
  // - form-action 'self' — forms can only submit to our origin
  // - base-uri 'self' — prevent <base> tag injection
  // - object-src 'none' — no Flash/Java/etc
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      isProd
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // dev needs eval for HMR
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "media-src 'self' https:",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Note: we intentionally do NOT set typescript.ignoreBuildErrors here.
  // The previous config had `ignoreBuildErrors: true` which silently shipped
  // broken code — type errors should fail the build so they get fixed.
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable strict mode in dev to catch unsafe lifecycle/effect bugs
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Extra headers for admin API routes — no caching
        source: "/api/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        // Dashboard is also admin-only
        source: "/api/dashboard",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
