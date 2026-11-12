import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL = "https://nandhinitex.com";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true, updatedAt: true } }),
    db.product.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const now = new Date();

  // Homepage
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // Category pages
  categories.forEach((c) => {
    entries.push({
      url: `${SITE_URL}/?category=${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  });

  // Product pages
  products.forEach((p) => {
    entries.push({
      url: `${SITE_URL}/?product=${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  // Static content pages
  const contentPages = [
    { path: "/?q=bridal", priority: 0.7 },
    { path: "/?q=kanchipuram", priority: 0.7 },
    { path: "/?q=soft+silk", priority: 0.7 },
    { path: "/?q=cotton", priority: 0.7 },
    { path: "/?q=dhoti", priority: 0.7 },
  ];
  contentPages.forEach((p) => {
    entries.push({
      url: `${SITE_URL}${p.path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: p.priority,
    });
  });

  return entries;
}
