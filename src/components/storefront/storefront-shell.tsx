"use client";

import { motion } from "framer-motion";
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
import {
  ScrollProgress, BackToTop, PageLoader, LiveChatWidget, FestiveBanner, GradientMesh, MobileBottomNav,
} from "./premium";
import { QuickViewModal, WishlistDrawer } from "./premium-features";

type Category = { id: string; name: string; slug: string; description: string | null; bannerImage: string | null; productCount: number };

export function Storefront({ categories }: { categories: Category[] }) {
  const storeView = useStore((s) => s.storeView);
  const selectedCategorySlug = useStore((s) => s.selectedCategorySlug);
  const selectedProductSlug = useStore((s) => s.selectedProductSlug);
  const searchQuery = useStore((s) => s.searchQuery);
  const mounted = useIsClient();

  const routeKey = `${storeView}:${selectedCategorySlug}:${selectedProductSlug}:${searchQuery}`;

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <PageLoader />
      <ScrollProgress />
      <FestiveBanner />
      <GradientMesh className="fixed inset-0 z-0" />
      <div className="relative z-10 flex flex-1 flex-col">
        <Header categories={categories} />
        <main className="flex-1 pb-16 md:pb-0">
          {mounted ? (
            <motion.div
              key={routeKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {storeView === "home" && <HomePage categories={categories} />}
              {storeView === "category" && <CategoryPage categories={categories} />}
              {storeView === "product" && <ProductPage />}
              {storeView === "cart" && <CartPage />}
              {storeView === "search" && <SearchPage />}
            </motion.div>
          ) : (
            <div className="h-screen" />
          )}
        </main>
        <Footer categories={categories} />
      </div>
      <CartDrawer />
      <QuickViewModal />
      <WishlistDrawer />
      <BackToTop />
      <LiveChatWidget />
      <MobileBottomNav />
    </div>
  );
}
