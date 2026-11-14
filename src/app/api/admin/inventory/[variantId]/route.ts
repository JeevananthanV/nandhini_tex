import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateInventorySchema, formatZodErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

// PATCH /api/admin/inventory/[variantId] — update stock for a single variant
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ variantId: string }> }) {
  const { variantId } = await params;
  // Validate variantId format
  if (!/^[a-z0-9]{1,50}$/i.test(variantId)) {
    return NextResponse.json({ error: "Invalid variant id" }, { status: 400 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateInventorySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_FAILED", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }
  const { stockQty, action } = parsed.data;

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
