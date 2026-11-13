import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// PATCH /api/admin/inventory/[variantId] — update stock for a single variant
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ variantId: string }> }) {
  const { variantId } = await params;
  const body = await req.json();
  const { stockQty, action } = body as { stockQty?: number; action?: "set" | "add" | "subtract" };

  if (stockQty === undefined) {
    return NextResponse.json({ error: "stockQty required" }, { status: 400 });
  }

  const existing = await db.variant.findUnique({ where: { id: variantId } });
  if (!existing) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }

  let newStock: number;
  if (action === "add") newStock = existing.stockQty + stockQty;
  else if (action === "subtract") newStock = Math.max(0, existing.stockQty - stockQty);
  else newStock = Math.max(0, stockQty); // "set" (default)

  const updated = await db.variant.update({
    where: { id: variantId },
    data: { stockQty: newStock },
  });

  return NextResponse.json({ variant: updated, newStock });
}
