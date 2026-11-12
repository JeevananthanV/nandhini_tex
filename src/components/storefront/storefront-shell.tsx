"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useIsClient } from "@/hooks/use-is-client";
import { Header } from "./header";
import { Footer } from "./footer";
import { CartDrawer } from "./cart-drawer";
import { HomePage } from "./home";
import { CategoryPage } from "./category-page";
import { ProductPage } from "./product-page";
import { CartPage } from "./cart-page";
import { SearchPage } from "./search-page";

type Category = { id: string; name: string; slug: string; description: string | null; bannerImage: string | null; productCount: number };

export function Storefront({ categories }: { categories: Category[] }) {
  const storeView = useStore((s) => s.storeView);
  const selectedCategorySlug = useStore((s) => s.selectedCategorySlug);
  const selectedProductSlug = useStore((s) => s.selectedProductSlug);
  const searchQuery = useStore((s) => s.searchQuery);
  const mounted = useIsClient();

  const routeKey = `${storeView}:${selectedCategorySlug}:${selectedProductSlug}:${searchQuery}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header categories={categories} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={routeKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {mounted && storeView === "home" && <HomePage categories={categories} />}
            {mounted && storeView === "category" && <CategoryPage categories={categories} />}
            {mounted && storeView === "product" && <ProductPage />}
            {mounted && storeView === "cart" && <CartPage />}
            {mounted && storeView === "search" && <SearchPage />}
            {!mounted && <div className="h-screen" />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer categories={categories} />
      <CartDrawer />
    </div>
  );
}
