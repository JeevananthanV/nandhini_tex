"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ShoppingBag, Truck, RefreshCw, ShieldCheck, Hand, ChevronRight,
  Check, Minus, Plus, Star, MapPin, ZoomIn, X,
  MessageCircle, Flame, PackageCheck, Award, Camera,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { ProductCard } from "./product-card";
import { StarRating, Price, DiscountBadge, NewBadge, BestsellerBadge } from "./primitives";
import { Viewer360, DeepZoom } from "./viewers";
import { addRecentlyViewed } from "./premium-features";
import { SectionReveal } from "./premium";
import { PdpSkeleton } from "./skeletons";
import { getProductWhatsAppUrl, getBulkWhatsAppUrl } from "@/lib/whatsapp";
import { TurnstileWidget } from "@/components/ui/turnstile";
import type { ProductDetail, ReviewOut } from "@/lib/format";

export function ProductPage() {
  const slug = useStore((s) => s.selectedProductSlug);
  const goHome = useStore((s) => s.goHome);
  const goCategory = useStore((s) => s.goCategory);
  const goProduct = useStore((s) => s.goProduct);
  const goCart = useStore((s) => s.goCart);
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlist = useStore((s) => s.wishlist);
  const openCart = useStore((s) => s.openCart);

  const [data, setData] = useState<{ product: ProductDetail; reviews: ReviewOut[]; related: ProductDetail[] } | null>(null);
  const isWishlisted = Boolean(data?.product && wishlist.some((w) => w.productId === data.product.id));
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [galleryMode, setGalleryMode] = useState<"gallery" | "360" | "zoom">("gallery");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setLoading(false);
        if (d.product?.id) addRecentlyViewed(d.product.id);
        if (d.product?.variants?.length) {
          setSelectedVariant(d.product.variants[0].id);
          const sizes = [...new Set(d.product.variants.map((v: { size: string | null }) => v.size).filter(Boolean))] as string[];
          if (sizes.length > 0) setSelectedSize(sizes[0]);
        }
      });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  const checkPincode = () => {
    if (pincode.length !== 6) {
      setPincodeResult({ ok: false, msg: "Please enter a valid 6-digit pincode" });
      return;
    }
    const serviceable = parseInt(pincode) % 3 !== 0; // mock logic
    setPincodeResult({
      ok: serviceable,
      msg: serviceable ? "Delivers in 3–6 days · COD available" : "Sorry, not serviceable at this pincode",
    });
  };

  const handleAddToCart = (buyNow = false) => {
    if (!data) return;
    const variant = data.product.variants.find((v) => v.id === selectedVariant) || data.product.variants[0];
    if (!variant) return;
    addToCart({
      productId: data.product.id,
      slug: data.product.slug,
      variantId: variant.id,
      title: data.product.title,
      image: data.product.images[0] || "",
      color: variant.color,
      size: variant.size,
      price: variant.priceOverride || data.product.basePrice,
      mrp: data.product.mrp,
      qty,
    });
    if (buyNow) {
      goCart();
    } else {
      openCart();
    }
  };

  if (loading || !data) {
    return <PdpSkeleton />;
  }

  const { product, reviews, related } = data;
  const colors = [...new Map(product.variants.map((v) => [v.color, v])).values()];
  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[];
  const currentVariant = product.variants.find((v) => v.id === selectedVariant) || product.variants[0];
  const inStock = currentVariant?.stockQty > 0;
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        {/* breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <button onClick={goHome} className="hover:text-navy">Home</button>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => goCategory(product.categorySlug)} className="hover:text-navy">{product.categoryName}</button>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-foreground">{product.title}</span>
        </nav>

        <div className="grid gap-8 md:gap-12 lg:grid-cols-2">
          {/* Gallery with 360° + Deep Zoom modes */}
          <div className="flex min-w-0 flex-col gap-3">
            {/* Mode toggle */}
            <div className="flex gap-2">
              {[
                { id: "gallery", label: "Gallery" },
                { id: "360", label: "View 360°" },
                { id: "zoom", label: "Deep Zoom" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setGalleryMode(m.id as typeof galleryMode)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${galleryMode === m.id ? "border-navy bg-navy text-ivory" : "border-border text-muted-foreground hover:border-navy"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {galleryMode === "360" ? (
              <Viewer360 images={product.images} alt={product.title} className="w-full" />
            ) : galleryMode === "zoom" ? (
              <DeepZoom src={product.images[activeImg] || product.images[0] || "/placeholder.svg"} alt={product.title} className="w-full" />
            ) : (
              <div className="flex flex-col gap-3 md:flex-row-reverse">
                <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={product.images[activeImg] || product.images[0] || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="cursor-zoom-in object-cover"
                    onClick={() => setLightboxOpen(true)}
                  />
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-navy backdrop-blur hover:bg-background"
                  >
                    <ZoomIn className="h-3.5 w-3.5" /> Zoom
                  </button>
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-elegant md:flex-col md:overflow-visible md:pb-0">
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors md:w-20 ${activeImg === i ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"}`}
                      >
                        <Image src={img || "/placeholder.svg"} alt={`${product.title} view ${i + 1}`} fill sizes="80px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gold-dark">{product.categoryName}</span>
              {product.isNew && <NewBadge />}
              {product.isBestseller && <BestsellerBadge />}
              {product.discountPct > 0 && <DiscountBadge pct={product.discountPct} />}
            </div>
            <h1 className="mt-2 font-serif text-2xl font-semibold leading-tight text-foreground md:text-3xl">{product.title}</h1>

            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={product.rating} size={16} />
              <span className="text-sm font-medium text-foreground">{product.rating.toFixed(1)}</span>
              <button className="text-sm text-muted-foreground hover:text-navy">({product.reviewCount} reviews)</button>
            </div>

            <div className="mt-4 flex items-end gap-3">
              <Price price={currentVariant?.priceOverride || product.basePrice} mrp={product.mrp} size="lg" />
              {product.discountPct > 0 && (
                <span className="mb-1 text-sm font-semibold text-green-700">You save {product.discountPct}%</span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

            {/* Color selection */}
            {colors.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-navy">Color: <span className="text-foreground normal-case">{colors[selectedColor]?.color}</span></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedColor(i); setSelectedVariant(c.id); }}
                      className={`relative h-9 w-9 rounded-full border-2 transition-all ${selectedColor === i ? "border-gold ring-2 ring-gold/30" : "border-border hover:border-navy"}`}
                      title={c.color}
                    >
                      <span className="absolute inset-1 rounded-full" style={{ backgroundColor: c.colorHex || "#ccc" }} />
                      {selectedColor === i && <Check className="absolute inset-0 m-auto h-4 w-4 text-ivory mix-blend-difference" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {sizes.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-navy">Size</span>
                  <button className="text-xs text-muted-foreground underline hover:text-navy">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[3rem] rounded-sm border px-3 py-2 text-sm font-medium transition-colors ${selectedSize === s ? "border-navy bg-navy text-ivory" : "border-border text-foreground hover:border-navy"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className="mt-5 flex items-center gap-2 text-sm">
              {inStock ? (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-green-600" />
                  <span className="font-medium text-green-700">In Stock</span>
                  <span className="text-muted-foreground">· {currentVariant?.stockQty} left</span>
                </>
              ) : (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-destructive" />
                  <span className="font-medium text-destructive">Out of Stock</span>
                </>
              )}
            </div>

            {/* Blouse included */}
            {product.blouseIncluded && (
              <div className="mt-4 flex items-center gap-2 rounded-md bg-gold/10 px-3 py-2">
                <Check className="h-4 w-4 text-gold-dark" />
                <span className="text-xs text-navy">Includes {product.blouseLengthM}m matching running blouse piece</span>
              </div>
            )}

            {/* Qty + actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex h-12 items-center rounded-sm border border-border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-navy" aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-navy" aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => handleAddToCart(false)}
                disabled={!inStock}
                className="flex h-12 flex-1 min-w-[140px] items-center justify-center gap-2 rounded-sm bg-navy px-6 text-sm font-semibold text-ivory transition-all hover:bg-navy-light cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Bag
              </button>
              <button
                onClick={() => handleAddToCart(true)}
                disabled={!inStock}
                className="flex h-12 flex-1 min-w-[120px] items-center justify-center rounded-sm bg-gold-gradient px-6 text-sm font-semibold text-navy shadow-gold transition-all hover:brightness-105 cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>
              <button
                onClick={() => toggleWishlist({ productId: product.id, slug: product.slug, title: product.title, image: product.images[0] || "", price: product.basePrice })}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border cursor-pointer transition-all active:scale-95 ${isWishlisted ? "border-red-200 bg-red-50 text-red-500 shadow-xs" : "border-border text-muted-foreground hover:border-navy"}`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-5 w-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>

            {/* WhatsApp Order Button */}
            <a
              href={getProductWhatsAppUrl({
                title: product.title,
                sku: currentVariant?.sku,
                price: currentVariant?.priceOverride || product.basePrice,
                color: currentVariant?.color,
                size: currentVariant?.size,
                qty,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-sm border border-green-600 bg-green-50 px-6 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-600 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Order on WhatsApp
              <span className="ml-1 text-[10px] font-normal text-green-600/70">Auto-fills saree details</span>
            </a>

            {/* Stock urgency indicator */}
            {inStock && currentVariant && currentVariant.stockQty <= 5 && currentVariant.stockQty > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-amber-800">
                <Flame className="h-4 w-4 shrink-0 animate-pulse text-amber-600" />
                <span className="text-xs font-semibold">
                  Only {currentVariant.stockQty} {currentVariant.stockQty === 1 ? "piece" : "pieces"} left! Selling fast — order now.
                </span>
              </div>
            )}

            {/* Trust & Social Proof Strip */}
            <div className="mt-5 rounded-lg border border-gold/20 bg-gradient-to-b from-gold/5 to-transparent p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <Hand className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                  <div>
                    <p className="text-xs font-semibold text-navy">Direct Elampillai Weaver Pricing</p>
                    <p className="text-[10px] text-muted-foreground">No middleman markup</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="mt-0.5 h-4 w-4 shrink-0 fill-gold text-gold" />
                  <div>
                    <p className="text-xs font-semibold text-navy">4.8★ Google Rating</p>
                    <p className="text-[10px] text-muted-foreground">2,450+ verified reviews</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                  <div>
                    <p className="text-xs font-semibold text-navy">Pan-India Courier</p>
                    <p className="text-[10px] text-muted-foreground">Delhivery · DTDC · India Post</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Camera className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                  <div>
                    <p className="text-xs font-semibold text-navy">Dispatch Proof Gallery</p>
                    <p className="text-[10px] text-muted-foreground">Photo on WhatsApp before shipping</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk & Uniform Inquiry Module */}
            <div className="mt-4 rounded-lg border border-navy/20 bg-navy/5 p-4">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-navy" />
                <h4 className="text-sm font-semibold text-navy">Bulk & Uniform Orders</h4>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Planning a wedding or event? Get tiered pricing on 10+ pieces for this saree.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { qty: 10, label: "10+ pieces" },
                  { qty: 25, label: "25+ pieces" },
                  { qty: 50, label: "50+ pieces" },
                ].map((b) => (
                  <a
                    key={b.qty}
                    href={getBulkWhatsAppUrl(product.title, b.qty)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-navy/30 bg-card px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:bg-navy hover:text-ivory"
                  >
                    {b.label} →
                  </a>
                ))}
              </div>
            </div>

            {/* Pincode check */}
            <div className="mt-6 rounded-lg border border-border bg-ivory p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-navy" />
                <span className="text-sm font-medium text-navy">Check Delivery</span>
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit pincode"
                  className="h-10 flex-1 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-gold"
                />
                <button onClick={checkPincode} className="h-10 rounded-sm bg-navy px-4 text-sm font-semibold text-ivory hover:bg-navy-light transition-colors">
                  Check
                </button>
              </div>
              {pincodeResult && (
                <p className={`mt-2 flex items-center gap-1.5 text-xs ${pincodeResult.ok ? "text-green-700" : "text-destructive"}`}>
                  {pincodeResult.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {pincodeResult.msg}
                </p>
              )}
            </div>

            {/* Fabric / weave details */}
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-4 text-sm">
              {product.fabricType && <Detail label="Fabric" value={product.fabricType} />}
              {product.weaveOrigin && <Detail label="Weave Origin" value={product.weaveOrigin} />}
              {product.weaveDays && <Detail label="Weave Time" value={`${product.weaveDays} days`} />}
              {product.zariType && <Detail label="Zari Type" value={product.zariType} />}
              <Detail label="Saree Length" value="6.3 m (5.5m + 0.8m blouse)" />
              <Detail label="SKU" value={currentVariant?.sku || product.slug.toUpperCase().slice(0, 12)} />
            </div>

            {/* Zari detail gallery */}
            {product.images.length > 1 && (
              <div className="mt-6">
                <h3 className="font-heading text-base font-semibold text-navy">Zari & Weave Details</h3>
                <p className="mt-1 text-xs text-muted-foreground">High-resolution close-ups of border, pallu, and weaving</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {product.images.slice(0, 3).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setGalleryMode("zoom"); setActiveImg(i); }}
                      className="group relative aspect-square overflow-hidden rounded-md border border-border"
                      aria-label={`View ${["Border", "Pallu", "Weave"][i] || "Detail"} close up`}
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`${product.title} zari detail ${i + 1}`}
                        fill
                        sizes="160px"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 z-10 flex items-end bg-gradient-to-t from-navy/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-[10px] font-medium text-ivory">{["Border", "Pallu", "Weave"][i] || "Detail"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Blouse matching guide */}
            {product.blouseIncluded && (
              <div className="mt-6 rounded-lg border border-gold/30 bg-gold/5 p-4">
                <h3 className="font-heading text-base font-semibold text-navy">Blouse Matching Guide</h3>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-navy-gradient ring-1 ring-gold/40">
                    <span className="font-display text-xs text-gold">0.8m</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{product.blouseLengthM}m matching running blouse piece included</p>
                    <p className="text-xs text-muted-foreground">Unstitched · matches saree colour · ready for tailoring</p>
                  </div>
                </div>
              </div>
            )}

            {/* Trust strip */}
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Hand className="h-4 w-4 text-gold-dark" /> 100% Handwoven</div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-gold-dark" /> Pan-India Shipping</div>
              <div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-gold-dark" /> 7-Day Returns</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold-dark" /> Secure Checkout</div>
            </div>

            {/* Description */}
            <div className="mt-6 border-t border-border pt-6">
              <h3 className="font-serif text-lg font-semibold text-navy">About this saree</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
              {product.careInstructions && (
                <div className="mt-4 rounded-md bg-muted p-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-navy">Care Instructions</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{product.careInstructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16 border-t border-border pt-12">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="md:w-1/3">
              <h2 className="font-serif text-2xl font-semibold text-navy">Customer Reviews</h2>
              <div className="mt-4 flex items-center gap-3">
                <span className="font-serif text-5xl font-bold text-navy">{product.rating.toFixed(1)}</span>
                <div>
                  <StarRating rating={product.rating} size={18} />
                  <p className="mt-1 text-xs text-muted-foreground">Based on {product.reviewCount} reviews</p>
                </div>
              </div>
              <div className="mt-5 space-y-1.5">
                {ratingDist.map((r) => (
                  <div key={r.star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-muted-foreground">{r.star}</span>
                    <Star className="h-3 w-3 fill-gold text-gold" />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${reviews.length > 0 ? (r.count / reviews.length) * 100 : 0}%` }} />
                    </div>
                    <span className="w-6 text-right text-muted-foreground">{r.count}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="mt-6 w-full rounded-sm border border-navy px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-ivory"
              >
                Write a Review
              </button>
              <AnimatePresence>
                {showReviewForm && (
                  <ReviewForm productId={product.id} onClose={() => setShowReviewForm(false)} />
                )}
              </AnimatePresence>
            </div>
            <div className="flex-1 space-y-5">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="border-b border-border pb-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-gradient font-serif text-xs font-semibold text-gold">
                            {r.authorName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{r.authorName}</p>
                            {r.authorCity && <p className="text-xs text-muted-foreground">{r.authorCity}</p>}
                          </div>
                        </div>
                      </div>
                      {r.verified && (
                        <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                          <Check className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <StarRating rating={r.rating} size={12} />
                      <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <h4 className="mt-2 font-serif text-sm font-semibold text-foreground">{r.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <h2 className="font-serif text-2xl font-semibold text-navy">You May Also Like</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {related.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p as any}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile add-to-cart bar — keeps the primary actions reachable without scrolling back up */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-background/95 px-4 py-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Price</span>
            <span className="font-serif text-base font-bold leading-tight text-navy">
              ₹{(currentVariant?.priceOverride || product.basePrice).toLocaleString("en-IN")}
            </span>
          </div>
          <button
            onClick={() => handleAddToCart(false)}
            disabled={!inStock}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-navy px-4 text-sm font-semibold text-ivory transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4" /> Add to Bag
          </button>
          <button
            onClick={() => handleAddToCart(true)}
            disabled={!inStock}
            className="flex h-11 flex-1 items-center justify-center rounded-sm bg-gold-gradient px-4 text-sm font-semibold text-navy transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buy Now
          </button>
          <button
            onClick={() => toggleWishlist({ productId: product.id, slug: product.slug, title: product.title, image: product.images[0] || "", price: product.basePrice })}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border transition-colors ${isWishlisted ? "border-navy bg-navy/5 text-navy" : "border-border text-muted-foreground"}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? "fill-navy" : ""}`} />
          </button>
        </div>
      </div>
      {/* Spacer to prevent sticky bar from covering the related-products section */}
      <div className="h-24 md:hidden" aria-hidden="true" />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-dark/90 p-4 backdrop-blur"
          >
            <button onClick={() => setLightboxOpen(false)} className="absolute right-5 top-5 text-ivory hover:opacity-80 transition" aria-label="Close Lightbox">
              <X className="h-7 w-7" />
            </button>
            <div className="relative aspect-[3/4] h-[85vh]">
              <Image src={product.images[activeImg] || product.images[0] || "/placeholder.svg"} alt={product.title} fill sizes="80vw" className="object-contain" onClick={(e) => e.stopPropagation()} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  );
}

function ReviewForm({ productId, onClose }: { productId: string; onClose: () => void }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        authorName: name,
        authorCity: city,
        rating,
        title,
        body: body,
        turnstileToken,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setTimeout(onClose, 2500);
    }
  };

  if (done) {
    return (
      <div className="mt-4 rounded-md border border-gold/40 bg-gold/10 p-4 text-sm text-navy">
        Thank you! Your review has been submitted and will appear once approved.
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      onSubmit={submit}
      className="mt-4 space-y-3 overflow-hidden rounded-md border border-border bg-card p-4"
    >
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-navy">Your Rating</label>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} stars`}>
              <Star className={`h-6 w-6 ${i <= rating ? "fill-gold text-gold" : "fill-transparent text-muted-foreground/40"}`} />
            </button>
          ))}
        </div>
      </div>
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-10 w-full rounded-sm border border-border px-3 text-sm outline-none focus:border-gold" />
      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (optional)" className="h-10 w-full rounded-sm border border-border px-3 text-sm outline-none focus:border-gold" />
      <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review title" className="h-10 w-full rounded-sm border border-border px-3 text-sm outline-none focus:border-gold" />
      <textarea required value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your experience..." rows={3} className="w-full rounded-sm border border-border p-3 text-sm outline-none focus:border-gold" />
      <TurnstileWidget onVerify={setTurnstileToken} />
      <button type="submit" disabled={loading} className="rounded-sm bg-navy px-4 py-2 text-sm font-semibold text-ivory hover:bg-navy-light disabled:opacity-50">
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </motion.form>
  );
}
