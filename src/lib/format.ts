import type { Product, Variant, Review, Order, Category } from "@prisma/client";

// ---- Shared types (frontend-friendly, JSON parsed) ----
export type ProductWithRelations = Product & {
  category: Category;
  variants: Variant[];
};

export type ProductCard = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  basePrice: number;
  mrp: number;
  discountPct: number;
  images: string[];
  fabricType: string | null;
  weaveOrigin: string | null;
  rating: number;
  reviewCount: number;
  isBestseller: boolean;
  isNew: boolean;
  isFeatured: boolean;
  categorySlug: string;
  categoryName: string;
  inStock: boolean;
};

export type ProductDetail = ProductCard & {
  description: string;
  careInstructions: string | null;
  blouseIncluded: boolean;
  blouseLengthM: number;
  zariType: string | null;
  weaveDays: number | null;
  tags: string[];
  variants: {
    id: string;
    color: string;
    colorHex: string | null;
    size: string | null;
    sku: string;
    stockQty: number;
    priceOverride: number | null;
  }[];
};

export type ReviewOut = {
  id: string;
  authorName: string;
  authorCity: string | null;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  helpfulCount: number;
  featured: boolean;
  createdAt: string;
};

// ---- Format helpers ----
export function parseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function toProductCard(p: Product & { category: Category; variants: Variant[] }): ProductCard {
  const images = parseJSON<string[]>(p.images, []);
  const inStock = p.variants.some((v) => v.stockQty > 0);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    basePrice: p.basePrice,
    mrp: p.mrp,
    discountPct: p.discountPct,
    images,
    fabricType: p.fabricType,
    weaveOrigin: p.weaveOrigin,
    rating: p.rating,
    reviewCount: p.reviewCount,
    isBestseller: p.isBestseller,
    isNew: p.isNew,
    isFeatured: p.isFeatured,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
    inStock,
  };
}

export function toProductDetail(p: Product & { category: Category; variants: Variant[] }): ProductDetail {
  const card = toProductCard(p);
  return {
    ...card,
    description: p.description,
    careInstructions: p.careInstructions,
    blouseIncluded: p.blouseIncluded,
    blouseLengthM: p.blouseLengthM,
    zariType: p.zariType,
    weaveDays: p.weaveDays,
    tags: parseJSON<string[]>(p.tags, []),
    variants: p.variants.map((v) => ({
      id: v.id,
      color: v.color,
      colorHex: v.colorHex,
      size: v.size,
      sku: v.sku,
      stockQty: v.stockQty,
      priceOverride: v.priceOverride,
    })),
  };
}

export function toReviewOut(r: Review): ReviewOut {
  return {
    id: r.id,
    authorName: r.authorName,
    authorCity: r.authorCity,
    rating: r.rating,
    title: r.title,
    body: r.body,
    verified: r.verified,
    helpfulCount: r.helpfulCount,
    featured: r.featured,
    createdAt: r.createdAt.toISOString(),
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function relativeTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}
