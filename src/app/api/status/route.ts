import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/status — API status, version, environment, and feature flags
export async function GET() {
  const status = {
    service: "nandhini-tex-api",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    status: "operational",
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(process.uptime()),
      human: formatUptime(process.uptime()),
    },
    server: {
      runtime: "node",
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
    },
    features: {
      storefront: true,
      adminPanel: true,
      inventoryManagement: true,
      codPayments: true,
      upiPayments: true,
      cardPayments: true,
      netbankingPayments: true,
      freeShippingThreshold: 999,
      codSurcharge: 40,
      returnsWindowDays: 7,
      maxImageUploads: 8,
      threeSixtyViewer: true,
      deepZoom: true,
      quickView: true,
      wishlist: true,
      liveChat: true,
      seo: true,
      geo: true,
      aeo: true,
      pwa: true,
    },
    limits: {
      maxProductsPerRequest: 200,
      maxCartItems: 50,
      rateLimit: "60 requests per minute",
      otpThrottle: "3 attempts per 10 minutes",
    },
    currency: "INR",
    locale: "en-IN",
    timezone: "Asia/Kolkata",
    contact: {
      phone: "+91 76048 11838",
      email: "hello@nandhinitex.com",
      hours: "Mon–Sat, 10am–7pm IST",
    },
    endpoints: {
      health: "/api/health",
      status: "/api/status",
      metrics: "/api/metrics",
      docs: "/api/docs",
    },
  };

  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}
