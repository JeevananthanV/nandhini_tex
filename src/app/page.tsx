import { db } from "@/lib/db";
import { Storefront } from "@/components/storefront/storefront-shell";
import { AdminApp } from "@/components/admin/admin-app";

export const dynamic = "force-dynamic";

export default async function Page() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, description: true, bannerImage: true, productCount: true },
  });

  const cats = categories.map((c) => ({
    ...c,
    description: c.description ?? null,
    bannerImage: c.bannerImage ?? null,
  }));

  return <AppShell categories={cats} />;
}

function AppShell({ categories }: { categories: { id: string; name: string; slug: string; description: string | null; bannerImage: string | null; productCount: number }[] }) {
  return (
    <>
      <Storefront categories={categories} />
      <AdminApp />
    </>
  );
}
