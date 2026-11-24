"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Tag, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Price } from "./primitives";
import { getCartWhatsAppUrl } from "@/lib/whatsapp";

export function CartDrawer() {
  const open = useStore((s) => s.cartOpen);
  const closeCart = useStore((s) => s.closeCart);
  const cart = useStore((s) => s.cart);
  const updateQty = useStore((s) => s.updateQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const goCart = useStore((s) => s.goCart);
  const goProduct = useStore((s) => s.goProduct);
  const subtotal = useStore((s) => s.cartSubtotal());
  const discount = useStore((s) => s.cartDiscount());
  const appliedCoupon = useStore((s) => s.appliedCoupon);
  const applyCoupon = useStore((s) => s.applyCoupon);

  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Keyboard Escape listener
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closeCart]);

  const shipping = subtotal - discount >= 999 || subtotal === 0 ? 0 : 60;
  const total = Math.max(0, subtotal - discount + shipping);

  const validateCoupon = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartValue: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        applyCoupon(data.coupon);
        setMsg({ ok: true, text: `Coupon ${data.coupon.code} applied!` });
        setCode("");
      } else {
        setMsg({ ok: false, text: data.message });
      }
    } catch {
      setMsg({ ok: false, text: "Could not validate coupon" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[80] bg-navy-dark/50 backdrop-blur-sm"
          />
          <motion.aside
            id="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Bag"
            data-state="open"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-navy" />
                <h2 className="font-serif text-lg font-semibold text-navy">
                  Your Bag <span className="text-sm font-normal text-muted-foreground">({cart.reduce((s, c) => s + c.qty, 0)})</span>
                </h2>
              </div>
              <button onClick={closeCart} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted" aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-serif text-lg text-foreground">Your bag is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">Discover our handwoven collection and add your favourites.</p>
                </div>
                <button onClick={closeCart} className="mt-2 rounded-sm bg-navy px-6 py-2.5 text-sm font-semibold text-ivory hover:bg-navy-light">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="scrollbar-elegant flex-1 overflow-y-auto px-5 py-4">
                  <ul className="flex flex-col gap-4">
                    {cart.map((item) => (
                      <li key={item.key} className="flex gap-3">
                        <button
                          onClick={() => { goProduct(item.slug); closeCart(); }}
                          className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-muted"
                        >
                          <Image src={item.image || "/placeholder.svg"} alt={item.title} fill sizes="80px" className="object-cover" />
                        </button>
                        <div className="flex flex-1 flex-col gap-1">
                          <button onClick={() => { goProduct(item.slug); closeCart(); }} className="text-left font-serif text-sm font-medium leading-snug text-foreground hover:text-navy">
                            {item.title}
                          </button>
                          {item.color && <span className="text-xs text-muted-foreground">{item.color}{item.size ? ` · ${item.size}` : ""}</span>}
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-border">
                              <button onClick={() => updateQty(item.key, item.qty - 1)} className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-navy" aria-label="Decrease">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-semibold">{item.qty}</span>
                              <button onClick={() => updateQty(item.key, item.qty + 1)} className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-navy" aria-label="Increase">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <Price price={item.price * item.qty} size="sm" />
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.key)} className="self-start text-muted-foreground hover:text-destructive" aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Coupon + summary */}
                <div className="border-t border-border px-5 py-4">
                  {appliedCoupon ? (
                    <div className="mb-3 flex items-center justify-between rounded-md bg-gold/10 px-3 py-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-navy">
                        <Tag className="h-3.5 w-3.5" /> {appliedCoupon.code} applied
                      </span>
                      <button onClick={() => { applyCoupon(null); setMsg(null); }} className="text-xs text-muted-foreground underline hover:text-navy">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3 flex gap-2">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Coupon code"
                        className="h-9 flex-1 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-gold"
                      />
                      <button onClick={validateCoupon} disabled={loading} className="rounded-sm border border-navy px-3 text-xs font-semibold text-navy hover:bg-navy hover:text-ivory disabled:opacity-50">
                        {loading ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {msg && <p className={`mb-2 text-xs ${msg.ok ? "text-green-700" : "text-destructive"}`}>{msg.text}</p>}

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="text-foreground"><PriceValue n={subtotal} /></span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Discount</span>
                        <span>− <PriceValue n={discount} /></span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? "text-green-700" : "text-foreground"}>{shipping === 0 ? "FREE" : <PriceValue n={shipping} />}</span>
                    </div>
                    {subtotal - discount < 999 && subtotal > 0 && (
                      <p className="text-[11px] text-muted-foreground">Add <PriceValue n={999 - (subtotal - discount)} /> more for free shipping</p>
                    )}
                    <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
                      <span>Total</span>
                      <span><PriceValue n={total} /></span>
                    </div>
                  </div>

                  <button
                    onClick={() => { goCart(); closeCart(); }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-navy py-3 text-sm font-semibold text-ivory hover:bg-navy-light cursor-pointer transition-all active:scale-[0.99]"
                  >
                    Proceed to Checkout <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href={getCartWhatsAppUrl(
                      cart.map((c) => ({ title: c.title, sku: c.variantId, price: c.price, color: c.color, size: c.size, qty: c.qty })),
                      total
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm border border-green-600 bg-green-50 py-2.5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-600 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" /> Order via WhatsApp
                  </a>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function PriceValue({ n }: { n: number }) {
  return <>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)}</>;
}
