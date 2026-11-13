"use client";

import { useRef, useState, useEffect, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useScroll, useReducedMotion, useInView } from "framer-motion";
import { ArrowUp, X, Sparkles, Loader2, Home, ShoppingBag, Heart, User } from "lucide-react";
import { useStore } from "@/lib/store";
import { EASE_SILK, DUR, VIEWPORT_ONCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

// ============================================================================
// 1. ScrollProgress — thin gold bar at top showing scroll progress
// ============================================================================
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[120] h-[3px] origin-left bg-gold-gradient"
      aria-hidden
    />
  );
}

// ============================================================================
// 2. MagneticButton — button that subtly follows the cursor on hover
// ============================================================================
export function MagneticButton({
  children,
  className,
  strength = 0.3,
  onClick,
  disabled,
  ...props
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
} & Omit<React.ComponentProps<typeof motion.button>, "ref" | "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag">) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (reduce || !ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, type: "button" as const }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// ============================================================================
// 3. TiltCard — 3D tilt effect on hover (for product cards / feature cards)
// ============================================================================
export function TiltCard({
  children,
  className,
  maxTilt = 8,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * 2 * maxTilt);
    rx.set(-(py - 0.5) * 2 * maxTilt);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const reset = () => { rx.set(0); ry.set(0); };

  const glareBg = useTransform(
    [gx, gy],
    ([xv, yv]) => `radial-gradient(circle at ${xv}% ${yv}%, rgba(201,162,39,0.25), transparent 60%)`
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 800 }}
      className={cn("relative [transform-style:preserve-3d]", className)}
    >
      {children}
      {glare && !reduce && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}

// ============================================================================
// 4. AnimatedCounter — counts up to a number when in view
// ============================================================================
export function AnimatedCounter({
  value,
  duration = 1.5,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const shouldAnimate = inView && !reduce;

  useEffect(() => {
    if (!shouldAnimate) return;
    let raf: number;
    const start = performance.now();
    const animate = (t: number) => {
      const elapsed = (t - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(value * eased);
      if (progress < 1) raf = requestAnimationFrame(animate);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [shouldAnimate, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {(inView && !reduce ? display : value).toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

// ============================================================================
// 5. Marquee — infinite horizontal scroll (for trust badges / tickers)
// ============================================================================
export function Marquee({
  children,
  speed = 30,
  reverse = false,
  className,
}: {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      <motion.div
        className="flex shrink-0 items-center gap-8 pr-8"
        animate={reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={reduce ? undefined : { duration: speed, ease: "linear", repeat: Infinity }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// ============================================================================
// 6. TextReveal — letter-by-letter headline animation
// ============================================================================
export function TextReveal({
  text,
  className,
  stagger = 0.04,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}) {
  const reduce = useReducedMotion();
  if (reduce) return <Tag className={className}>{text}</Tag>;
  const words = text.split(" ");
  return (
    <Tag className={className}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block">
          {word.split("").map((char, ci) => (
            <motion.span
              key={ci}
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: DUR.base, ease: EASE_SILK, delay: (wi * 3 + ci) * stagger }}
            >
              {char}
            </motion.span>
          ))}
          {wi < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}

// ============================================================================
// 7. ParallaxImage — subtle parallax on scroll (for hero / banners)
// ============================================================================
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  strength = 40,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  strength?: number;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-strength, strength]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y }}
        priority={priority as any}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}

// ============================================================================
// 8. BackToTop — floating button that appears on scroll
// ============================================================================
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: DUR.base, ease: EASE_SILK }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-[90] flex h-11 w-11 items-center justify-center rounded-full bg-navy-gradient text-gold shadow-navy ring-1 ring-gold/40"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// 9. PageLoader — elegant preloader with logo shimmer
// ============================================================================
export function PageLoader() {
  const [loading, setLoading] = useState(true);
  const reduce = useReducedMotion();
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE_SILK }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ivory"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={reduce ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={reduce ? { duration: 0.3 } : { scale: { type: "spring", stiffness: 200, damping: 15 }, opacity: { duration: 0.3 } }}
            className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-navy-gradient shadow-navy ring-2 ring-gold/40"
          >
            <motion.span
              className="font-serif text-3xl font-bold text-gold-gradient"
              animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
              transition={reduce ? undefined : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              N
            </motion.span>
            {!reduce && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ background: "linear-gradient(120deg, transparent, rgba(201,162,39,0.3), transparent)" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: DUR.base }}
            className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-navy/60"
          >
            Nandhini Tex
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// 10. ShimmerSkeleton — elegant loading skeleton with gold shimmer sweep
// ============================================================================
export function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-muted", className)}>
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.15), transparent)" }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ============================================================================
// 11. FestiveBanner — animated top announcement bar with marquee
// ============================================================================
export function FestiveBanner({
  message,
  onClose,
}: {
  message?: string;
  onClose?: () => void;
}) {
  const [closed, setClosed] = useState(false);
  const text = message || "Free shipping on orders above ₹999 · Use code WELCOME10 for 10% off your first order · COD available pan-India";
  if (closed) return null;
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: DUR.base, ease: EASE_SILK }}
      className="relative overflow-hidden bg-navy-gradient text-ivory"
    >
      <Marquee speed={28} className="py-2 text-xs font-medium tracking-wide">
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          {text}
        </span>
      </Marquee>
      <button
        onClick={() => { setClosed(true); onClose?.(); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/60 hover:text-gold"
        aria-label="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ============================================================================
// 12. GradientMesh — animated gradient background mesh
// ============================================================================
export function GradientMesh({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #C9A227, transparent 70%)" }}
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
        transition={reduce ? undefined : { duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #0A1F44, transparent 70%)" }}
        animate={reduce ? undefined : { x: [0, -40, 0], y: [0, -30, 0] }}
        transition={reduce ? undefined : { duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ============================================================================
// 13. LiveChatWidget — animated floating chat button + popup
// ============================================================================
export function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={reduce ? undefined : { scale: 1.08 }}
        whileTap={reduce ? undefined : { scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-navy-gradient text-gold shadow-navy ring-1 ring-gold/40"
        aria-label="Open chat"
      >
        <motion.span
          animate={reduce ? undefined : { scale: [1, 1.15, 1] }}
          transition={reduce ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </motion.span>
        {!reduce && (
          <motion.span
            className="absolute inset-0 rounded-full ring-2 ring-gold/50"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: DUR.base, ease: EASE_SILK }}
            className="fixed bottom-24 left-6 z-[95] w-[300px] overflow-hidden rounded-xl border border-border bg-card shadow-navy"
          >
            <div className="bg-navy-gradient p-4 text-ivory">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-gradient font-serif text-sm font-bold text-navy">N</div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-navy" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Nandhini Tex</p>
                    <p className="text-[10px] text-ivory/70">Typically replies in minutes</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close chat"><X className="h-4 w-4 text-ivory/70 hover:text-gold" /></button>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="rounded-lg rounded-tl-none bg-muted p-3 text-sm text-foreground">
                <p className="font-medium text-navy">Namaste!</p>
                <p className="mt-1 text-muted-foreground">How can we help you find the perfect saree today? Ask about our bridal collection, fabrics, or COD availability.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Bridal sarees", "COD available?", "Track my order", "Custom blouse"].map((q) => (
                  <button key={q} className="rounded-full border border-border px-3 py-1 text-xs text-navy hover:border-gold hover:bg-muted">
                    {q}
                  </button>
                ))}
              </div>
              <a
                href="https://wa.me/917604811838"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-ivory hover:bg-navy-light"
              >
                Chat on WhatsApp
              </a>
              <p className="text-center text-[10px] text-muted-foreground">Or call +91 76048 11838</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// 14. SectionReveal — wrapper that fades + rises children into view
// ============================================================================
export function SectionReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: DUR.base, ease: EASE_SILK, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// 15. StaggerGrid — staggered reveal for product/feature grids
// ============================================================================
export function StaggerGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT_ONCE}
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={reduce ? { hidden: { opacity: 0 }, show: { opacity: 1 } } : { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_SILK } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// 16. MobileBottomNav — fixed bottom nav for mobile (Home, Shop, Wishlist, Account, Bag)
// ============================================================================
export function MobileBottomNav() {
  const goHome = useStore((s) => s.goHome);
  const goAllProducts = useStore((s) => s.goAllProducts);
  const openCart = useStore((s) => s.openCart);
  const cartCount = useStore((s) => s.cartCount());
  const wishlistCount = useStore((s) => s.wishlist.length);
  const storeView = useStore((s) => s.storeView);

  const items = [
    { icon: Home, label: "Home", onClick: goHome, active: storeView === "home" },
    { icon: ShoppingBag, label: "Shop", onClick: goAllProducts, active: storeView === "all-products" || storeView === "category" || storeView === "product" || storeView === "search" },
    { icon: Heart, label: "Wishlist", onClick: () => window.dispatchEvent(new Event("open-wishlist")), badge: wishlistCount, active: false },
    { icon: User, label: "Account", onClick: () => {}, active: false },
    { icon: ShoppingBag, label: "Bag", onClick: openCart, badge: cartCount, active: storeView === "cart" },
  ];

  return (
    <motion.nav
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, duration: DUR.base, ease: EASE_SILK }}
      className="fixed inset-x-0 bottom-0 z-[80] flex items-center justify-around border-t border-gold/20 bg-navy-gradient/95 backdrop-blur-lg md:hidden"
      aria-label="Mobile navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={item.onClick}
          className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5"
          aria-label={item.label}
          aria-current={item.active ? "page" : undefined}
        >
          <item.icon
            className={cn(
              "h-5 w-5 transition-colors",
              item.active ? "text-gold" : "text-ivory/60"
            )}
            strokeWidth={item.active ? 2 : 1.5}
          />
          <span className={cn("text-[9px] font-medium uppercase tracking-wider", item.active ? "text-gold" : "text-ivory/60")}>
            {item.label}
          </span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="absolute right-[28%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-navy">
              {item.badge}
            </span>
          )}
          {item.active && (
            <motion.span
              layoutId="mobile-nav-active"
              className="absolute -top-px h-0.5 w-8 rounded-full bg-gold-gradient"
              transition={{ duration: DUR.base, ease: EASE_SILK }}
            />
          )}
        </button>
      ))}
    </motion.nav>
  );
}
