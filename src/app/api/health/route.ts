import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/health — Liveness + Readiness probe
// Returns 200 if the app is alive AND the database is reachable.
// Query param ?check=liveness for a lightweight liveness-only check (no DB hit).
export async function GET(req: NextRequest) {
  const check = req.nextUrl.searchParams.get("check") || "readiness";
  const startTime = Date.now();

  // --- Liveness: app is running ---
  const status: {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    uptime: number;
    check: string;
    services: Record<string, { status: string; latencyMs?: number; error?: string }>;
    responseMs: number;
  } = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    check,
    services: {},
    responseMs: 0,
  };

  // --- Readiness: database is reachable ---
  if (check !== "liveness") {
    try {
      const dbStart = Date.now();
      // Lightweight query — counts the first row of Category
      await db.category.findFirst({ select: { id: true } });
      const dbLatency = Date.now() - dbStart;
      status.services.database = {
        status: "connected",
        latencyMs: dbLatency,
      };
      // Flag degraded if DB is slow (>500ms)
      if (dbLatency > 500) {
        status.status = "degraded";
        status.services.database.status = "slow";
      }
    } catch (err) {
      // Don't leak raw DB error messages — they can contain file paths or
      // connection-string fragments. Log server-side only.
      console.error("[health] database check failed:", err);
      status.status = "unhealthy";
      status.services.database = {
        status: "disconnected",
        // Generic message only — no internal details
        error: "Database connection failed",
      };
    }
  } else {
    status.services.database = { status: "skipped (liveness check)" };
  }

  status.responseMs = Date.now() - startTime;

  const httpStatus = status.status === "unhealthy" ? 503 : 200;

  // Set cache-control to prevent caching of health checks
  return NextResponse.json(status, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Health-Status": status.status,
    },
  });
}
