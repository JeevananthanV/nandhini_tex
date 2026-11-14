import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bulkInventorySchema, formatZodErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

// POST /api/admin/inventory/bulk — bulk update stock for multiple variants
// Body: { updates: [{ id, stockQty, action }] } (max 500 entries)
export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bulkInventorySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_FAILED", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }
  const { updates } = parsed.data;

  const results = await Promise.all(
    updates.map(async (u) => {
      const existing = await db.variant.findUnique({ where: { id: u.id }, select: { id: true, stockQty: true } });
      if (!existing) return { id: u.id, error: "not_found" as const };
      let newStock: number;
      if (u.action === "add") newStock = existing.stockQty + u.stockQty;
      else if (u.action === "subtract") newStock = Math.max(0, existing.stockQty - u.stockQty);
      else newStock = Math.max(0, u.stockQty);
      const updated = await db.variant.update({
        where: { id: u.id },
        data: { stockQty: newStock },
        select: { id: true, stockQty: true },
      });
      return updated;
    })
  );

  const successCount = results.filter((r) => !("error" in r)).length;
  return NextResponse.json({ updated: successCount, total: updates.length, results });
}
