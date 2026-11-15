import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/integrations/status — returns which third-party services are configured.
 *
 * Admin-only — exposes the integration config status (NOT the actual secrets).
 * Used by the admin Settings page to show a checklist of what's wired up.
 */
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized — admin session required", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { INTEGRATIONS, getIntegrationSummary } = await import("@/lib/integrations");

  return NextResponse.json({
    integrations: INTEGRATIONS.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      isConfigured: i.isConfigured,
      isRequired: i.isRequired || false,
      requiredEnvVars: i.requiredEnvVars,
      docsUrl: i.docsUrl,
      description: i.description,
    })),
    summary: getIntegrationSummary(),
  });
}
