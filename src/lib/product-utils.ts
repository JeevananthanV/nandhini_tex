// Shared helpers for admin product create / update / delete.
// Keeps API routes small and behaviour consistent.

import { db } from "@/lib/db";

// Sanitize a title (or explicit slug) into a URL-safe slug and guarantee
// uniqueness by appending -2, -3, ... when a collision exists.
export async function uniqueSlug(raw: string, excludeId?: string): Promise<string> {
  const clean =
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "saree";

  let slug = clean;
  let n = 2;
  for (;;) {
    const existing = await db.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${clean}-${n++}`;
  }
}

// MRP is optional on the admin form; fall back to base price so the
// required Float column never receives NaN.
export function safeMrp(mrpRaw: unknown, basePrice: number): number {
  const n = parseFloat(String(mrpRaw ?? ""));
  return Number.isFinite(n) && n > 0 ? n : basePrice;
}

export type NormalizedVariant = {
  color: string;
  colorHex: string | null;
  size: string | null;
  sku: string;
  stockQty: number;
};

// Normalize raw variant rows from the admin form: sensible defaults for
// color, auto-generated SKU when left blank, clamped stock.
export function normalizeVariants(raw: unknown, slug: string): NormalizedVariant[] {
  if (!Array.isArray(raw)) return [];
  const out: NormalizedVariant[] = [];
  raw.forEach((v, i) => {
    if (!v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    const color = String(o.color ?? "").trim() || "Default";
    const stock = parseInt(String(o.stockQty ?? "0"), 10);
    const sku = String(o.sku ?? "").trim() || autoSku(slug, color, i);
    out.push({
      color: color.slice(0, 60),
      colorHex: o.colorHex ? String(o.colorHex).slice(0, 20) : null,
      size: o.size ? String(o.size).trim().slice(0, 40) || null : null,
      sku: sku.slice(0, 40),
      stockQty: Number.isFinite(stock) ? Math.max(0, stock) : 0,
    });
  });
  return out;
}

// Generate a readable SKU like "NT-KANJ-MARO-01" when the admin leaves it blank.
function autoSku(slug: string, color: string, index: number): string {
  const initials =
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase())
      .join("")
      .slice(0, 4) || "NT";
  const colorCode =
    color
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, 4) || "STD";
  return `NT-${initials}-${colorCode}-${String(index + 1).padStart(2, "0")}`;
}

// First sentence of the description as the card teaser, with a safe fallback.
export function teaserFrom(description: string, title: string): string {
  const first = description.split(". ")[0]?.trim();
  if (first && first.length > 0) return first.endsWith(".") ? first : `${first}.`;
  return `Handcrafted ${title} by Nandhini Tex.`;
}
