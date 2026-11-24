"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  PackageSearch, Search, Truck, Package, CheckCircle2, MapPin, Clock,
  MessageCircle, Phone, CircleAlert, ExternalLink, ShoppingBag, CreditCard, Loader2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { openRazorpayCheckout } from "@/lib/razorpay-client";

const STEPS = [
  { key: "pending", label: "Placed", note: "Order placed successfully" },
  { key: "confirmed", label: "Confirmed", note: "Order confirmed by our team" },
  { key: "packed", label: "Packed", note: "Packed with care at our Elampillai studio" },
  { key: "shipped", label: "Shipped", note: "Handed over to the courier" },
  { key: "out_for_delivery", label: "Out for Delivery", note: "Arriving today" },
  { key: "delivered", label: "Delivered", note: "Delivered — thank you!" },
];

// hours after order placement for synthesized timeline timestamps
const STEP_OFFSETS_H = [0, 6, 26, 50, 98, 122];

const TERMINAL_BAD = ["cancelled", "returned", "refunded"];

type TrackedItem = { title: string; variant?: string; qty: number; price: number; image?: string };
type TimelineEntry = { status: string; timestamp: string; note?: string };

type TrackedOrder = {
  orderNumber: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  codSurcharge: number;
  grandTotal: number;
  couponCode: string | null;
  createdAt: string;
  updatedAt: string;
  items: TrackedItem[];
  timeline: TimelineEntry[];
  courier: { name?: string; awb?: string; trackingUrl?: string };
  address: Record<string, string>;
};

export function TrackOrderPage() {
  const goHome = useStore((s) => s.goHome);
  const goAllProducts = useStore((s) => s.goAllProducts);
  const trackQuery = useStore((s) => s.trackQuery);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [searchedFor, setSearchedFor] = useState("");

  const runLookup = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      const list: TrackedOrder[] = data.orders || [];
      setSearchedFor(trimmed);
      setOrders(list);
      setActiveIdx(0);
      if (list.length === 0) setNotFound(true);
    } catch {
      setSearchedFor(trimmed);
      setOrders([]);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-lookup when arriving from the order-confirmation screen with a prefilled number
  useEffect(() => {
    if (!trackQuery) return;
    const t = window.setTimeout(() => {
      setQuery(trackQuery);
      runLookup(trackQuery);
    }, 0);
    return () => window.clearTimeout(t);
  }, [trackQuery]);

  const active = orders && orders.length > 0 ? orders[Math.min(activeIdx, orders.length - 1)] : null;

  return (
    <div className="min-h-screen pt-28 md:pt-32">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-gradient">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "url(/patterns/heritage-motif.svg)", backgroundSize: "220px" }}
        />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 py-12 text-center md:px-8 md:py-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold">Order Status · Delivery Updates</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-ivory md:text-4xl">Track Your Order</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-ivory/70">
            Enter your order number (e.g. NTX2025xxxx) or the 10-digit phone number you ordered with.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); runLookup(query); }}
            className="mx-auto mt-7 flex max-w-lg items-stretch gap-2"
          >
            <div className="relative flex-1">
              <PackageSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="NTX2025xxxx or 10-digit phone"
                aria-label="Order number or phone number"
                className="h-12 w-full rounded-md border border-ivory/20 bg-ivory/95 pl-10 pr-3 text-sm text-foreground shadow-lg outline-none placeholder:text-muted-foreground focus:border-gold"
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()} className="h-12 bg-gold-gradient px-6 font-bold text-navy hover:opacity-90 disabled:opacity-50">
              {loading ? "Checking…" : "Track"}
            </Button>
          </form>
          <p className="mt-3 text-[11px] text-ivory/50">Delivered pan-India via Delhivery, DTDC & India Post</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-10 md:px-8">
        {/* Loading skeleton */}
        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-24 rounded-lg bg-muted" />
            <div className="h-40 rounded-lg bg-muted" />
            <div className="h-56 rounded-lg bg-muted" />
          </div>
        )}

        {/* Not found */}
        {!loading && notFound && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-lg border border-dashed border-border py-14 text-center"
          >
            <CircleAlert className="h-10 w-10 text-gold-dark" />
            <p className="mt-4 font-serif text-lg text-foreground">No order found for “{searchedFor}”</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Double-check the order number from your confirmation, or search with the phone number used at checkout.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={goAllProducts} className="border-navy/30 text-navy">Continue Shopping</Button>
              <a
                href="https://wa.me/917604811838?text=Hi!%20I%20need%20help%20finding%20my%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 items-center gap-2 rounded-sm border border-green-600 bg-green-50 px-4 text-sm font-semibold text-green-700 hover:bg-green-600 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Support
              </a>
            </div>
          </motion.div>
        )}

        {/* Multiple orders (phone search) */}
        {!loading && orders && orders.length > 1 && (
          <div className="mb-6">
            <h2 className="mb-3 font-serif text-lg font-semibold text-navy">
              {orders.length} orders found{searchedFor && !/^\d{10}$/.test(searchedFor) ? "" : " for this number"}
            </h2>
            <div className="space-y-2">
              {orders.map((o, i) => (
                <button
                  key={o.orderNumber}
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors",
                    i === activeIdx ? "border-navy bg-navy/5" : "border-border bg-card hover:border-navy/40"
                  )}
                >
                  <div>
                    <p className="font-serif font-semibold text-navy">{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {o.items.length} item{o.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">₹{o.grandTotal.toLocaleString("en-IN")}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order detail */}
        {!loading && active && <OrderDetail order={active} />}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    delivered: "bg-green-100 text-green-800",
    out_for_delivery: "bg-amber-100 text-amber-800",
    shipped: "bg-navy/10 text-navy",
    packed: "bg-gold/20 text-navy",
    confirmed: "bg-gold/20 text-navy",
    pending: "bg-muted text-muted-foreground",
    cancelled: "bg-red-100 text-red-700",
    returned: "bg-red-100 text-red-700",
    refunded: "bg-red-100 text-red-700",
  };
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide", map[status] || "bg-muted text-muted-foreground")}>
      {label}
    </span>
  );
}

function OrderDetail({ order }: { order: TrackedOrder }) {
  const stepIdx = STEPS.findIndex((s) => s.key === order.status);
  const isBad = TERMINAL_BAD.includes(order.status);

  // Build display timeline — use real entries where available, synthesize for seeded history
  const displayTimeline = useMemo(() => {
    if (isBad) {
      return order.timeline.map((t) => ({
        label: t.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        note: t.note || "",
        at: new Date(t.timestamp),
        done: true,
      }));
    }
    const createdAt = new Date(order.createdAt);
    return STEPS.slice(0, Math.max(stepIdx + 1, 1)).map((s, i) => {
      const real = order.timeline.find((t) => t.status === s.key);
      const at = real ? new Date(real.timestamp) : new Date(createdAt.getTime() + STEP_OFFSETS_H[i] * 3600 * 1000);
      return { label: s.label, note: real?.note || s.note, at, done: true };
    });
  }, [order, stepIdx, isBad]);

  const eta = useMemo(() => {
    const created = new Date(order.createdAt);
    if (order.status === "delivered") {
      const d = order.timeline.find((t) => t.status === "delivered");
      return {
        label: "Delivered",
        date: new Date(d?.timestamp || order.updatedAt),
        done: true,
      };
    }
    if (isBad) return null;
    return { label: "Estimated Delivery", date: new Date(created.getTime() + 5 * 24 * 3600 * 1000), done: false };
  }, [order, isBad]);

  const courier = useMemo(() => {
    if (order.courier?.awb) return order.courier;
    if (!isBad && stepIdx >= 3) {
      return {
        name: "Delhivery Express",
        awb: `DLV${order.orderNumber.replace(/\D/g, "")}`,
        trackingUrl: "https://www.delhivery.com/tracking",
      };
    }
    return null;
  }, [order.courier, order.orderNumber, stepIdx, isBad]);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const fmtTime = (d: Date) =>
    d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

  const addr = order.address || {};
  const phone = addr.phone || "";
  const maskedPhone = phone.length === 10 ? `${phone.slice(0, 2)}xxxxx${phone.slice(-3)}` : phone;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header card */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Order</p>
            <p className="font-serif text-xl font-bold text-navy">{order.orderNumber}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Placed {fmtTime(new Date(order.createdAt))} · {order.items.length} item{order.items.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={order.status} />
            <span className="text-xs text-muted-foreground">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod.toUpperCase()}
              {order.paymentStatus === "paid" ? " · Paid" : order.paymentStatus === "pending" && order.paymentMethod !== "cod" ? " · Payment Pending" : ""}
            </span>
          </div>
        </div>

        {/* Retry payment banner for pending online payments */}
        {order.paymentStatus === "pending" && order.paymentMethod !== "cod" && order.status !== "cancelled" && (
          <RetryPaymentBanner orderNumber={order.orderNumber} total={order.grandTotal} customerName={order.customerName || ""} customerPhone={phone} />
        )}

        {/* Terminal bad states */}
        {isBad && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            This order was <strong>{order.status}</strong>. If this is unexpected, reach us on WhatsApp or call +91 76048 11838.
          </div>
        )}

        {/* Stepper */}
        {!isBad && (
          <div className="mt-7 overflow-x-auto pb-1 scrollbar-elegant">
            <div className="flex min-w-[520px] items-start">
              {STEPS.map((s, i) => {
                const done = i <= stepIdx;
                const isCurrent = i === stepIdx;
                return (
                  <div key={s.key} className="flex flex-1 flex-col items-center">
                    <div className="relative flex w-full items-center justify-center">
                      {i > 0 && (
                        <div className={cn("absolute right-1/2 h-0.5 w-full", i <= stepIdx ? "bg-gold" : "bg-border")} />
                      )}
                      <span
                        className={cn(
                          "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors",
                          done ? "border-gold bg-gold text-navy" : "border-border bg-background text-muted-foreground",
                          isCurrent && "ring-4 ring-gold/25"
                        )}
                      >
                        {done ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                      </span>
                      {i < STEPS.length - 1 && (
                        <div className={cn("absolute left-1/2 h-0.5 w-full", i + 1 <= stepIdx ? "bg-gold" : "bg-border")} />
                      )}
                    </div>
                    <span className={cn("mt-2 text-center text-[9px] font-semibold leading-tight md:text-[11px]", done ? "text-navy" : "text-muted-foreground")}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ETA */}
        {eta && (
          <div className={cn("mt-5 flex items-center gap-2 rounded-md px-4 py-3 text-sm", eta.done ? "bg-green-50 text-green-800" : "bg-gold/10 text-navy")}>
            <Truck className="h-4 w-4 shrink-0" />
            <span className="font-medium">{eta.label}:</span>
            <span className="font-semibold">{fmtDate(eta.date)}</span>
          </div>
        )}
      </div>

      {/* Courier card */}
      {courier?.awb && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/10">
              <Package className="h-5 w-5 text-navy" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{courier.name || "Courier Partner"}</p>
              <p className="text-xs text-muted-foreground">AWB: <span className="font-mono font-semibold text-navy">{courier.awb}</span></p>
            </div>
          </div>
          <a
            href={courier.trackingUrl || "https://www.delhivery.com/tracking"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-sm border border-navy/30 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-ivory"
          >
            Open Courier Site <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* Timeline log */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-serif text-base font-semibold text-navy">Journey</h3>
        <ol className="mt-4 space-y-0">
          {displayTimeline.map((t, i) => (
            <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
              {i < displayTimeline.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-border" />}
              <span className={cn("relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2", t.done ? "border-gold bg-gold" : "border-border bg-background")} />
              <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4">
                <div>
                  <p className={cn("text-sm font-semibold", t.done ? "text-foreground" : "text-muted-foreground")}>{t.label}</p>
                  {t.note && <p className="text-xs text-muted-foreground">{t.note}</p>}
                </div>
                <span className="text-[11px] text-muted-foreground">{fmtTime(t.at)}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Items + totals */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-serif text-base font-semibold text-navy">Items in this Order</h3>
        <div className="mt-4 space-y-3">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {it.image ? (
                  <Image src={it.image || "/placeholder.svg"} alt={it.title} fill sizes="56px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><ShoppingBag className="h-5 w-5 text-muted-foreground/50" /></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{it.title}</p>
                {it.variant && <p className="text-xs text-muted-foreground">{it.variant}</p>}
                <p className="text-xs text-muted-foreground">Qty {it.qty}</p>
              </div>
              <span className="text-sm font-semibold">₹{(it.price * it.qty).toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
        <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>₹{order.subtotal.toLocaleString("en-IN")}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt><dd>− ₹{order.discount.toLocaleString("en-IN")}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shippingFee === 0 ? "FREE" : `₹${order.shippingFee}`}</dd></div>
          {order.codSurcharge > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">COD Surcharge</dt><dd>₹{order.codSurcharge}</dd></div>}
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt>Total</dt><dd className="text-navy">₹{order.grandTotal.toLocaleString("en-IN")}</dd></div>
        </dl>
      </div>

      {/* Address + support */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-navy"><MapPin className="h-4 w-4 text-gold-dark" /> Delivery Address</h3>
          <div className="mt-3 space-y-0.5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{order.customerName}</p>
            {addr.line1 && <p>{addr.line1}</p>}
            {(addr.city || addr.state) && <p>{[addr.city, addr.state].filter(Boolean).join(", ")}</p>}
            {addr.pincode && <p>PIN: {addr.pincode}</p>}
            {maskedPhone && <p>Phone: {maskedPhone}</p>}
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-5">
          <div>
            <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-navy"><Clock className="h-4 w-4 text-gold-dark" /> Need Help?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Our team replies Mon–Sat, 10am–7pm IST.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/917604811838?text=${encodeURIComponent(`Hi! I need help with my order ${order.orderNumber}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-sm border border-green-600 bg-green-50 px-3 text-xs font-semibold text-green-700 hover:bg-green-600 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href="tel:+917604811838"
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-sm border border-navy/30 px-3 text-xs font-semibold text-navy hover:bg-navy hover:text-ivory"
            >
              <Phone className="h-4 w-4" /> Call Us
            </a>
          </div>
        </div>
      </div>

      {/* Search another */}
      <p className="text-center text-xs text-muted-foreground">
        Want to check another order? Use the search box above — order numbers look like NTX2025xxxx.
      </p>
    </motion.div>
  );
}

// ============================================================================
// Retry Payment Banner — shown when an online order has pending payment
// ============================================================================
function RetryPaymentBanner({
  orderNumber,
  total,
  customerName,
  customerPhone,
}: {
  orderNumber: string;
  total: number;
  customerName: string;
  customerPhone: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const retryPayment = async () => {
    setLoading(true);
    setError(null);
    const result = await openRazorpayCheckout({
      orderNumber,
      amountInRupees: total,
      customerName,
      customerPhone,
    });
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      // Reload after 2s to show updated payment status
      setTimeout(() => window.location.reload(), 2000);
    } else {
      setError(result.error || "Payment failed. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span>Payment successful! Refreshing order status…</span>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Payment Pending</p>
            <p className="text-xs text-amber-700">
              Complete your payment of ₹{total.toLocaleString("en-IN")} to confirm this order.
            </p>
          </div>
        </div>
        <Button
          onClick={retryPayment}
          disabled={loading}
          className="bg-navy text-ivory hover:bg-navy-light"
        >
          {loading ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <CreditCard className="mr-1.5 h-4 w-4" />
              Pay Now
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-amber-800">{error}</p>
      )}
    </div>
  );
}
