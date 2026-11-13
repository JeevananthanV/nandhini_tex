import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/admin/inventory/bulk — bulk update stock for multiple variants
// Body: { updates: [{ id, stockQty }] }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { updates } = body as { updates: { id: string; stockQty: number }[] };

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "updates array required" }, { status: 400 });
  }

  const results = await Promise.all(
    updates.map((u) =>
      db.variant.update({
        where: { id: u.id },
        data: { stockQty: Math.max(0, u.stockQty) },
        select: { id: true, stockQty: true },
      })
    )
  );

  return NextResponse.json({ updated: results.length, results });
}
