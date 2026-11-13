"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---- Types ----
export type AppMode = "store" | "admin";
export type StoreView = "home" | "category" | "all-products" | "product" | "cart" | "search";
export type AdminView =
  | "dashboard"
  | "products"
  | "inventory"
  | "orders"
  | "customers"
  | "reviews"
  | "coupons"
  | "content"
  | "settings";

export type CartItem = {
  key: string; // productId-variantId
  productId: string;
  slug: string;
  variantId: string;
  title: string;
  image: string;
  color: string;
  size: string | null;
  price: number;
  qty: number;
  mrp: number;
};

export type WishlistItem = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number;
};

type State = {
  // Mode + routing
  mode: AppMode;
  storeView: StoreView;
  adminView: AdminView;
  selectedCategorySlug: string | null;
  selectedProductSlug: string | null;
  searchQuery: string;

  // UI state
  cartOpen: boolean;
  mobileMenuOpen: boolean;
  adminProductEditingId: string | null;
  adminOrderEditingId: string | null;
  adminCouponEditingId: string | null;
  adminReviewFilter: string;
  toastKey: number;

  // Data
  cart: CartItem[];
  wishlist: WishlistItem[];
  appliedCoupon: { code: string; type: string; value: number } | null;

  // Actions
  setMode: (m: AppMode) => void;
  goHome: () => void;
  goAllProducts: () => void;
  goCategory: (slug: string) => void;
  goProduct: (slug: string) => void;
  goCart: () => void;
  goSearch: (q: string) => void;
  setAdminView: (v: AdminView) => void;
  setAdminProductEditing: (id: string | null) => void;
  setAdminOrderEditing: (id: string | null) => void;
  setAdminCouponEditing: (id: string | null) => void;
  setAdminReviewFilter: (s: string) => void;

  openCart: () => void;
  closeCart: () => void;
  toggleMobileMenu: () => void;
  setMobileMenu: (open: boolean) => void;

  addToCart: (item: Omit<CartItem, "key" | "qty"> & { qty?: number }) => void;
  updateQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;

  toggleWishlist: (item: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
  removeWishlist: (productId: string) => void;

  applyCoupon: (c: { code: string; type: string; value: number } | null) => void;
  cartSubtotal: () => number;
  cartDiscount: () => number;
  cartTotal: () => number;
  cartCount: () => number;
  bumpToast: () => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      mode: "store",
      storeView: "home",
      adminView: "dashboard",
      selectedCategorySlug: null,
      selectedProductSlug: null,
      searchQuery: "",
      cartOpen: false,
      mobileMenuOpen: false,
      adminProductEditingId: null,
      adminOrderEditingId: null,
      adminCouponEditingId: null,
      adminReviewFilter: "all",
      toastKey: 0,

      cart: [],
      wishlist: [],
      appliedCoupon: null,

      setMode: (m) => set({ mode: m }),
      goHome: () => set({ mode: "store", storeView: "home", selectedCategorySlug: null, selectedProductSlug: null }),
      goAllProducts: () =>
        set({ mode: "store", storeView: "all-products", selectedCategorySlug: null, selectedProductSlug: null, cartOpen: false, mobileMenuOpen: false }),
      goCategory: (slug) =>
        set({ mode: "store", storeView: "category", selectedCategorySlug: slug, selectedProductSlug: null, cartOpen: false, mobileMenuOpen: false }),
      goProduct: (slug) =>
        set({ mode: "store", storeView: "product", selectedProductSlug: slug, cartOpen: false, mobileMenuOpen: false }),
      goCart: () => set({ mode: "store", storeView: "cart", cartOpen: false }),
      goSearch: (q) => set({ mode: "store", storeView: "search", searchQuery: q, selectedProductSlug: null }),

      setAdminView: (v) => set({ mode: "admin", adminView: v, adminProductEditingId: null, adminOrderEditingId: null, adminCouponEditingId: null }),
      setAdminProductEditing: (id) => set({ adminProductEditingId: id }),
      setAdminOrderEditing: (id) => set({ adminOrderEditingId: id }),
      setAdminCouponEditing: (id) => set({ adminCouponEditingId: id }),
      setAdminReviewFilter: (s) => set({ adminReviewFilter: s }),

      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
      toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
      setMobileMenu: (open) => set({ mobileMenuOpen: open }),

      addToCart: (item) =>
        set((s) => {
          const key = `${item.productId}-${item.variantId}`;
          const existing = s.cart.find((c) => c.key === key);
          if (existing) {
            return {
              cart: s.cart.map((c) => (c.key === key ? { ...c, qty: c.qty + (item.qty ?? 1) } : c)),
              cartOpen: true,
              toastKey: s.toastKey + 1,
            };
          }
          return {
            cart: [...s.cart, { ...item, key, qty: item.qty ?? 1 }],
            cartOpen: true,
            toastKey: s.toastKey + 1,
          };
        }),
      updateQty: (key, qty) =>
        set((s) => ({
          cart: qty <= 0 ? s.cart.filter((c) => c.key !== key) : s.cart.map((c) => (c.key === key ? { ...c, qty } : c)),
        })),
      removeFromCart: (key) => set((s) => ({ cart: s.cart.filter((c) => c.key !== key) })),
      clearCart: () => set({ cart: [], appliedCoupon: null }),

      toggleWishlist: (item) =>
        set((s) => {
          const exists = s.wishlist.some((w) => w.productId === item.productId);
          return {
            wishlist: exists ? s.wishlist.filter((w) => w.productId !== item.productId) : [...s.wishlist, item],
            toastKey: s.toastKey + 1,
          };
        }),
      isWishlisted: (productId) => get().wishlist.some((w) => w.productId === productId),
      removeWishlist: (productId) => set((s) => ({ wishlist: s.wishlist.filter((w) => w.productId !== productId) })),

      applyCoupon: (c) => set({ appliedCoupon: c }),

      cartSubtotal: () => get().cart.reduce((sum, c) => sum + c.price * c.qty, 0),
      cartDiscount: () => {
        const { appliedCoupon, cart } = get();
        if (!appliedCoupon) return 0;
        const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
        if (appliedCoupon.type === "percent") return Math.round((subtotal * appliedCoupon.value) / 100);
        return Math.min(appliedCoupon.value, subtotal);
      },
      cartTotal: () => {
        const subtotal = get().cartSubtotal();
        const discount = get().cartDiscount();
        const shipping = subtotal - discount >= 999 || subtotal === 0 ? 0 : 60;
        return Math.max(0, subtotal - discount + shipping);
      },
      cartCount: () => get().cart.reduce((sum, c) => sum + c.qty, 0),

      bumpToast: () => set((s) => ({ toastKey: s.toastKey + 1 })),
    }),
    {
      name: "nandhini-tex-store",
      partialize: (s) => ({
        cart: s.cart,
        wishlist: s.wishlist,
        appliedCoupon: s.appliedCoupon,
        mode: s.mode,
      }),
    }
  )
);
