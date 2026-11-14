"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, Maximize2 } from "lucide-react";
import type { ProductCard } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Price, DiscountBadge, NewBadge, BestsellerBadge, StarRating } from "./primitives";
import { TiltCard } from "./premium";
import { openQuickView } from "./premium-features";
import { cn } from "@/lib/utils";

export function ProductCard({ product, index = 0 }: { product: ProductCard; index?: number }) {
  const goProduct = useStore((s) => s.goProduct);
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const isWishlisted = useStore((s) => s.wishlist.some((w) => w.productId === product.id));

  const img = product.images[0] || "/placeholder.svg";
  const altImg = product.images[1] || product.images[0] || "/placeholder.svg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col"
    >
      <TiltCard maxTilt={6} className="aspect-[4/5] overflow-hidden rounded-md bg-muted">
        <button
          onClick={() => goProduct(product.slug)}
          className="absolute inset-0 z-10"
          aria-label={`View ${product.title}`}
        />
        <Image
          src={img}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-0"
        />
        <Image
          src={altImg}
          alt={`${product.title} alternate view`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-100"
        />
        {/* badges */}
        <div className="absolute left-2 top-2 z-20 flex flex-col items-start gap-1">
          {product.isNew && <NewBadge />}
          {product.isBestseller && <BestsellerBadge />}
          {product.discountPct > 0 && <DiscountBadge pct={product.discountPct} />}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60">
            <span className="rounded-sm bg-navy px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ivory">
              Out of Stock
            </span>
          </div>
        )}
        {/* quick add + quick view — always visible on touch screens (<lg),
            hover-reveal on desktop where hover exists */}
        <div className="absolute inset-x-2 bottom-2 z-20 flex translate-y-3 gap-2 opacity-0 transition-all duration-300 ease-out max-lg:translate-y-0 max-lg:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                productId: product.id,
                slug: product.slug,
                variantId: product.id,
                title: product.title,
                image: img,
                color: "",
                size: null,
                price: product.basePrice,
                mrp: product.mrp,
              });
            }}
            disabled={!product.inStock}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-navy px-3 py-2 text-xs font-semibold text-ivory shadow-navy transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to Bag
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product.id);
            }}
            className="flex items-center justify-center rounded-md border border-border bg-background/90 px-2.5 py-2 text-navy backdrop-blur transition-colors hover:border-gold"
            aria-label="Quick view product"
            title="Quick view"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </TiltCard>

      <div className="mt-3 flex flex-col gap-1">
        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-gold-dark">
          {product.categoryName}
        </span>
        <button
          onClick={() => goProduct(product.slug)}
          className="text-left font-serif text-[15px] font-medium leading-snug text-foreground transition-colors hover:text-navy line-clamp-2"
        >
          {product.title}
        </button>
        <div className="flex items-center gap-1.5">
          <StarRating rating={product.rating} size={11} />
          <span className="text-[11px] text-muted-foreground">({product.reviewCount})</span>
        </div>
        <Price price={product.basePrice} mrp={product.mrp} size="sm" />
      </div>

      <button
        onClick={() =>
          toggleWishlist({
            productId: product.id,
            slug: product.slug,
            title: product.title,
            image: img,
            price: product.basePrice,
          })
        }
        className={cn(
          "absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-all hover:bg-background",
          isWishlisted ? "text-navy" : "text-muted-foreground"
        )}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={cn("h-4 w-4 transition-all", isWishlisted && "fill-navy")} />
      </button>
    </motion.div>
  );
}
