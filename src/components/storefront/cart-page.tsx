"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, Tag, Check, ChevronRight, Truck, ShieldCheck, RefreshCw, MessageCircle, CreditCard, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { getCartWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { openRazorpayCheckout } from "@/lib/razorpay-client";

export function CartPage() {
  const goHome = useStore((s) => s.goHome);
  const goTrack = useStore((s) => s.goTrack);
  const goCategory = useStore((s) => s.goCategory);
  const goProduct = useStore((s) => s.goProduct);
  const cart = useStore((s) => s.cart);
  const updateQty = useStore((s) => s.updateQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const clearCart = useStore((s) => s.clearCart);
  const subtotal = useStore((s) => s.cartSubtotal());
  const discount = useStore((s) => s.cartDiscount());
  const appliedCoupon = useStore((s) => s.appliedCoupon);
  const applyCoupon = useStore((s) => s.applyCoupon);

  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address" | "payment" | "done">("cart");
  const [address, setAddress] = useState({ name: "", phone: "", line1: "", city: "", state: "Tamil Nadu", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placedOrder, setPlacedOrder] = useState<{ orderNumber: string; paymentMethod?: string } | null>(null);

  const shipping = subtotal - discount >= 999 || subtotal === 0 ? 0 : 60;
  const codSurcharge = paymentMethod === "cod" ? 40 : 0;
  const total = Math.max(0, subtotal - discount + shipping + codSurcharge);

  const validateCoupon = async () => {
    if (!code.trim()) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    setLoading(true);
    setPaymentError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: address.name,
        customerPhone: address.phone,
        customerEmail: "",
        shippingAddress: address,
        items: cart.map((c) => ({
          title: c.title,
          slug: c.slug,
          productId: c.productId,
          variant: c.color,
          qty: c.qty,
          price: c.price,
          image: c.image,
        })),
        paymentMethod,
        subtotal,
        discount,
        shippingFee: shipping,
        codSurcharge,
        grandTotal: total,
        couponCode: appliedCoupon?.code,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setPaymentError(data.error || "Failed to place order. Please try again.");
      return;
    }

    const orderNumber = data.order.orderNumber as string;

    // For COD, order is complete — show confirmation
    if (paymentMethod === "cod") {
      setPlacedOrder({ orderNumber, paymentMethod: "cod" });
      setCheckoutStep("done");
      clearCart();
      return;
    }

    // For online payments (upi/card/netbanking), open Razorpay Checkout
    if (paymentMethod === "upi" || paymentMethod === "card" || paymentMethod === "netbanking") {
      setLoading(true);
      const result = await openRazorpayCheckout({
        orderNumber,
        amountInRupees: total,
        customerName: address.name,
        customerPhone: address.phone,
      });
      setLoading(false);

      if (result.success) {
        setPlacedOrder({ orderNumber, paymentMethod: result.method });
        setCheckoutStep("done");
        clearCart();
      } else {
        // Payment failed or cancelled — order still exists as "pending"
        // Show error so customer can retry payment
        setPaymentError(
          result.code === "USER_CANCELLED"
            ? "Payment cancelled. Your order is saved — retry payment from the order tracking page."
            : result.error || "Payment failed. Your order is saved — retry from the tracking page."
        );
        // Still navigate to a "partial" confirmation so the customer sees their order number
        setPlacedOrder({ orderNumber, paymentMethod: "pending" });
        setCheckoutStep("done");
        // Don't clear cart — they might want to retry
      }
      return;
    }

    // Fallback (shouldn't reach here)
    setPlacedOrder({ orderNumber, paymentMethod });
    setCheckoutStep("done");
    clearCart();
  };

  if (checkoutStep === "done" && placedOrder) {
    const isPaid = placedOrder.paymentMethod !== "cod" && placedOrder.paymentMethod !== "pending";
    const isPendingPayment = placedOrder.paymentMethod === "pending";

    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className={`flex h-20 w-20 items-center justify-center rounded-full ${isPendingPayment ? "bg-amber-100" : "bg-green-100 animate-pulse-glow"}`}
        >
          {isPendingPayment ? (
            <Loader2 className="h-10 w-10 animate-spin text-amber-700" />
          ) : (
            <Check className="h-10 w-10 text-green-700" />
          )}
        </motion.div>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-navy">
          {isPendingPayment ? "Payment Pending" : "Order Confirmed!"}
        </h1>
        <p className="mt-2 max-w-md text-center text-muted-foreground">
          {isPendingPayment
            ? "Your order is placed but payment is pending. Complete payment now or retry from the tracking page."
            : isPaid
              ? "Thank you! Your payment is confirmed. We'll send a confirmation on WhatsApp & SMS shortly."
              : "Thank you for your order. We'll send a confirmation on WhatsApp & SMS shortly."}
        </p>
        {paymentError && (
          <div className="mt-4 max-w-md rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
            {paymentError}
          </div>
        )}
        <div className="mt-6 rounded-lg border border-border bg-card px-8 py-5 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Order Number</p>
          <p className="font-serif text-2xl font-bold text-navy">{placedOrder.orderNumber}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Payment: {isPaid ? <span className="font-semibold text-green-700">Paid</span> : isPendingPayment ? <span className="font-semibold text-amber-700">Pending</span> : <span className="font-semibold">COD</span>}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={goHome} className="bg-navy hover:bg-navy-light">Continue Shopping</Button>
          <Button onClick={() => goTrack(placedOrder.orderNumber)} variant="outline" className="border-navy/30 text-navy hover:bg-navy/5">
            Track Your Order
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">For any queries, call us at +91 76048 11838</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-serif text-2xl font-semibold text-navy">Your bag is empty</h1>
        <p className="mt-2 text-center text-muted-foreground">Discover handwoven sarees, dhotis & more.</p>
        <Button onClick={() => goCategory("soft-silk")} className="mt-6 bg-navy hover:bg-navy-light">Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <button onClick={goHome} className="hover:text-navy">Home</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{checkoutStep === "cart" ? "Shopping Bag" : "Checkout"}</span>
        </nav>

        <h1 className="font-serif text-3xl font-semibold text-navy">{checkoutStep === "cart" ? "Shopping Bag" : "Checkout"}</h1>

        {/* Steps */}
        {checkoutStep !== "cart" && (
          <div className="mt-6 flex items-center gap-2 text-sm">
            {["Address", "Payment"].map((step, i) => {
              const stepKey = i === 0 ? "address" : "payment";
              return (
                <div key={step} className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${checkoutStep === stepKey ? "bg-navy text-ivory" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <span className={checkoutStep === stepKey ? "font-medium text-navy" : "text-muted-foreground"}>{step}</span>
                  {i === 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left: items / form */}
          <div className="lg:col-span-2">
            {checkoutStep === "cart" && (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.key} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                    <button onClick={() => goProduct(item.slug)} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image src={item.image} alt={item.title} fill sizes="96px" className="object-cover" />
                    </button>
                    <div className="flex flex-1 flex-col">
                      <button onClick={() => goProduct(item.slug)} className="text-left font-serif text-base font-medium text-foreground hover:text-navy">{item.title}</button>
                      <p className="text-xs text-muted-foreground">{item.color}{item.size ? ` · Size ${item.size}` : ""}</p>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex items-center rounded-full border border-border">
                          <button onClick={() => updateQty(item.key, item.qty - 1)} className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-navy" aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                          <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                          <button onClick={() => updateQty(item.key, item.qty + 1)} className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-navy" aria-label="Increase"><Plus className="h-3 w-3" /></button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                          <button onClick={() => removeFromCart(item.key)} className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => goCategory("soft-silk")} className="text-navy">Continue Shopping</Button>
                </div>
              </div>
            )}

            {checkoutStep === "address" && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="font-serif text-lg font-semibold text-navy">Shipping Address</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" value={address.name} onChange={(v) => setAddress({ ...address, name: v })} required />
                  <Field label="Phone Number" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v.replace(/\D/g, "").slice(0, 10) })} required />
                  <div className="sm:col-span-2">
                    <Field label="Address Line" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} required />
                  </div>
                  <Field label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} required />
                  <Field label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} required />
                  <Field label="Pincode" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v.replace(/\D/g, "").slice(0, 6) })} required />
                </div>
                <div className="mt-6 flex justify-between">
                  <Button variant="ghost" onClick={() => setCheckoutStep("cart")} className="text-navy">Back to Bag</Button>
                  <Button onClick={() => setCheckoutStep("payment")} disabled={!address.name || address.phone.length < 10 || !address.pincode} className="bg-navy hover:bg-navy-light">
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {checkoutStep === "payment" && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="font-serif text-lg font-semibold text-navy">Payment Method</h2>
                <div className="mt-4 space-y-3">
                  {[
                    { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive · ₹40 surcharge applies", icon: null },
                    { id: "upi", label: "UPI (GPay / PhonePe / Paytm)", desc: "Pay instantly via UPI · Secured by Razorpay", icon: <CreditCard className="h-4 w-4 text-gold-dark" /> },
                    { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay · Secured by Razorpay", icon: <CreditCard className="h-4 w-4 text-gold-dark" /> },
                    { id: "netbanking", label: "Net Banking", desc: "All major banks · Secured by Razorpay", icon: <CreditCard className="h-4 w-4 text-gold-dark" /> },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setPaymentMethod(p.id); setPaymentError(null); }}
                      className={`flex w-full items-center gap-3 rounded-md border p-4 text-left transition-colors ${paymentMethod === p.id ? "border-navy bg-navy/5" : "border-border hover:border-navy/40"}`}
                    >
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${paymentMethod === p.id ? "border-navy" : "border-muted-foreground/40"}`}>
                        {paymentMethod === p.id && <span className="h-2.5 w-2.5 rounded-full bg-navy" />}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{p.label}</p>
                          {p.icon}
                        </div>
                        <p className="text-xs text-muted-foreground">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {paymentError && (
                  <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {paymentError}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button variant="ghost" onClick={() => setCheckoutStep("address")} className="text-navy">Back</Button>
                  <Button onClick={placeOrder} disabled={loading} className="bg-gold-gradient text-navy hover:opacity-90">
                    {loading
                      ? (paymentMethod === "cod" ? "Placing Order..." : "Processing Payment...")
                      : paymentMethod === "cod"
                        ? `Place Order · ₹${total.toLocaleString("en-IN")}`
                        : `Pay ₹${total.toLocaleString("en-IN")} Securely`}
                  </Button>
                </div>

                {paymentMethod !== "cod" && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 text-green-600" />
                    <span>256-bit SSL encrypted · PCI-DSS compliant · Powered by Razorpay</span>
                  </div>
                )}

                {/* WhatsApp Order Alternative */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <a
                  href={getCartWhatsAppUrl(
                    cart.map((c) => ({ title: c.title, sku: c.variantId, price: c.price, color: c.color, size: c.size, qty: c.qty })),
                    total
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-sm border border-green-600 bg-green-50 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-600 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" /> Order via WhatsApp instead
                </a>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">Prefer to chat? Send your cart details to our WhatsApp and pay via UPI / COD.</p>
              </div>
            )}
          </div>

          {/* Right: summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-lg border border-border bg-card p-5">
              <h3 className="font-serif text-base font-semibold text-navy">Order Summary</h3>

              {checkoutStep === "cart" && (
                <>
                  {appliedCoupon ? (
                    <div className="mt-4 flex items-center justify-between rounded-md bg-gold/10 px-3 py-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-navy"><Tag className="h-3.5 w-3.5" /> {appliedCoupon.code}</span>
                      <button onClick={() => { applyCoupon(null); setMsg(null); }} className="text-xs text-muted-foreground underline">Remove</button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="flex gap-2">
                        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="h-9 flex-1 rounded-sm border border-border px-3 text-sm outline-none focus:border-gold" />
                        <Button onClick={validateCoupon} disabled={loading} variant="outline" size="sm" className="border-navy text-navy">Apply</Button>
                      </div>
                      {msg && <p className={`mt-1.5 text-xs ${msg.ok ? "text-green-700" : "text-destructive"}`}>{msg.text}</p>}
                      <p className="mt-2 text-[11px] text-muted-foreground">Try: WELCOME10, FESTIVE15, FLAT500</p>
                    </div>
                  )}
                </>
              )}

              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal ({cart.length} items)</dt><dd>₹{subtotal.toLocaleString("en-IN")}</dd></div>
                {discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount</dt><dd>− ₹{discount.toLocaleString("en-IN")}</dd></div>}
                <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className={shipping === 0 ? "font-medium text-green-700" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</dd></div>
                {codSurcharge > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">COD Surcharge</dt><dd>₹{codSurcharge}</dd></div>}
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt>Total</dt><dd className="text-navy">₹{total.toLocaleString("en-IN")}</dd></div>
              </dl>

              {checkoutStep === "cart" && (
                <Button onClick={() => setCheckoutStep("address")} className="mt-5 w-full bg-navy hover:bg-navy-light">Proceed to Checkout</Button>
              )}

              {shipping === 0 && subtotal > 0 && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-green-700"><Truck className="h-3.5 w-3.5" /> You've unlocked free shipping!</p>
              )}

              <div className="mt-5 space-y-2 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-gold-dark" /> 100% Secure Checkout</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><RefreshCw className="h-3.5 w-3.5 text-gold-dark" /> 7-Day Easy Returns</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Truck className="h-3.5 w-3.5 text-gold-dark" /> Pan-India Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}{required && <span className="text-destructive"> *</span>}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-sm border border-border px-3 text-sm outline-none focus:border-gold"
      />
    </div>
  );
}
