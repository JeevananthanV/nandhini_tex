"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useScroll, useReducedMotion, useInView, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_SILK, EASE_LUXE, DUR, VIEWPORT_ONCE } from "@/lib/motion";

// ============================================================================
// Modern UI Effects — cutting-edge animations for a premium feel
// ============================================================================
// All effects respect prefers-reduced-motion.
// All effects are pure CSS / Framer Motion — no external libraries.
// ============================================================================

// ============================================================================
// 1. CursorSpotlight — radial gradient that follows the cursor (desktop only)
// ============================================================================
// Adds a subtle gold glow that follows the mouse across a section.
// Used on hero, CTA sections, and feature grids to add depth.
export function CursorSpotlight({ className, color = "rgba(212, 175, 55, 0.08)" }: { className?: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const x = useSpring(mouseX, { stiffness: 150, damping: 25 });
  const y = useSpring(mouseY, { stiffness: 150, damping: 25 });
  const bg = useTransform([x, y], ([cx, cy]) => `radial-gradient(400px circle at ${cx}px ${cy}px, ${color}, transparent 70%)`);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY, reduce]);

  if (reduce) return null;

  return (
    <motion.div
      ref={ref}
      style={{ background: bg }}
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// 2. AuroraBackground — animated flowing gradient (for hero / CTA)
// ============================================================================
// Multiple blurred blobs that drift slowly — creates a living background.
// Includes a liquid-morphing gold blob for organic movement.
export function AuroraBackground({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <motion.div
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-[100px]"
        style={{ background: "radial-gradient(circle, #D4AF37, transparent 70%)" }}
        animate={{ x: [0, 80, 0], y: [0, 60, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full opacity-25 blur-[120px]"
        style={{ background: "radial-gradient(circle, #081B3A, transparent 70%)" }}
        animate={{ x: [0, -60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full opacity-20 blur-[100px]"
        style={{ background: "radial-gradient(circle, #C9A227, transparent 70%)" }}
        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Liquid morphing gold blob — organic, flowing shape */}
      <div
        className="animate-liquid absolute right-1/4 top-1/4 h-40 w-40 opacity-10 blur-[60px]"
        style={{ background: "linear-gradient(135deg, #D4AF37, #C9A227)" }}
      />
    </div>
  );
}

// ============================================================================
// 3. GlassCard — glassmorphism card with backdrop-blur + border glow
// ============================================================================
export function GlassCard({
  children,
  className,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-white/20 bg-white/5 backdrop-blur-xl",
        glow && "shadow-[0_0_40px_-10px_rgba(212,175,55,0.3)]",
        className
      )}
    >
      {/* Subtle top-edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-xl bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {children}
    </div>
  );
}

// ============================================================================
// 4. ScrollReveal3D — 3D rotate-on-scroll reveal (for feature cards)
// ============================================================================
// Card rotates slightly on X axis as it enters the viewport, then settles.
export function ScrollReveal3D({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, rotateX: 25, y: 60 }}
      animate={inView ? { opacity: 1, rotateX: 0, y: 0 } : {}}
      transition={{ duration: DUR.slow, delay, ease: EASE_LUXE }}
      style={{ transformPerspective: 1000, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// 5. MagneticLink — link that subtly attracts to the cursor (desktop only)
// ============================================================================
export function MagneticLink({
  children,
  href,
  onClick,
  className,
  strength = 0.3,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * strength);
      y.set((e.clientY - cy) * strength);
    };
    const onLeave = () => { x.set(0); y.set(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y, strength, reduce]);

  const Tag = href ? motion.a : motion.button;

  return (
    <Tag
      ref={ref as any}
      href={href}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </Tag>
  );
}

// ============================================================================
// 6. TypewriterText — typewriter effect for hero / promo text
// ============================================================================
export function TypewriterText({
  text,
  className,
  speed = 40,
  delay = 0,
}: {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const [displayed, setDisplayed] = useState(reduce ? text : "");
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  useEffect(() => {
    if (reduce || !inView) return;
    const startTimer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(startTimer);
  }, [inView, delay, reduce]);

  useEffect(() => {
    if (!started || reduce) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed, reduce]);

  return (
    <span ref={ref} className={className}>
      {displayed}
      {!reduce && started && displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="ml-0.5 inline-block w-[2px] bg-current"
          style={{ height: "1em", verticalAlign: "text-bottom" }}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

// ============================================================================
// 7. NumberFlip — rolling number animation (for prices, stats)
// ============================================================================
// Animates from 0 to target when in view, with a subtle digit-flip feel.
export function NumberFlip({
  value,
  className,
  duration = 1.2,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [display, setDisplay] = useState(reduce ? value : 0);
  const [started, setStarted] = useState(false);

  // Start animation when in view (deferred to avoid sync setState in effect)
  useEffect(() => {
    if (inView && !started) {
      const t = setTimeout(() => setStarted(true), 0);
      return () => clearTimeout(t);
    }
  }, [inView, started]);

  useEffect(() => {
    if (!started || reduce) {
      // Defer to avoid sync setState in effect
      const t = setTimeout(() => setDisplay(value), 0);
      return () => clearTimeout(t);
    }
    let startTime: number | null = null;
    const animate = (t: number) => {
      if (startTime === null) startTime = t;
      const progress = Math.min((t - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(value * eased);
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplay(value);
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [started, value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

// ============================================================================
// 8. HoverGlowBorder — animated gradient border on hover
// ============================================================================
// The border sweeps a gold gradient around the card on hover.
export function HoverGlowBorder({
  children,
  className,
  borderRadius = "rounded-lg",
}: {
  children: ReactNode;
  className?: string;
  borderRadius?: string;
}) {
  return (
    <div className={cn("group relative", borderRadius, className)}>
      {/* Animated gradient border */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          borderRadius
        )}
        style={{
          background: "conic-gradient(from 0deg at 50% 50%, transparent, #D4AF37, transparent, #C9A227, transparent)",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />
      {children}
    </div>
  );
}

// ============================================================================
// 9. ParallaxLayers — multi-layer parallax for hero sections
// ============================================================================
// Layers move at different speeds based on scroll position.
// Each layer must be wrapped in <ParallaxLayer> to satisfy the rules of hooks.
export function ParallaxLayer({
  children,
  speed = 0.3,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, speed * -100]);

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

export function ParallaxLayers({
  layers,
  className,
}: {
  layers: Array<{ content: ReactNode; speed: number; className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {layers.map((layer, i) => (
        <ParallaxLayer key={i} speed={layer.speed} className={layer.className}>
          {layer.content}
        </ParallaxLayer>
      ))}
    </div>
  );
}

// ============================================================================
// 10. RippleButton — material-design ripple on click
// ============================================================================
export function RippleButton({
  children,
  onClick,
  className,
  rippleColor = "rgba(212, 175, 55, 0.4)",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  rippleColor?: string;
}) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const idRef = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = idRef.current++;
    setRipples((r) => [...r, { x, y, id }]);
    setTimeout(() => setRipples((r) => r.filter((rip) => rip.id !== id)), 600);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={cn("relative overflow-hidden", className)}
    >
      {children}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: r.x,
            top: r.y,
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
            background: rippleColor,
          }}
        />
      ))}
    </button>
  );
}

// ============================================================================
// 11. Marquee3D — 3D rotating marquee (for logos / trust badges)
// ============================================================================
export function Marquee3D({
  items,
  className,
  speed = 30,
}: {
  items: ReactNode[];
  className?: string;
  speed?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={cn("flex flex-wrap gap-6", className)}>
        {items.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ perspective: "1000px" }}>
      <motion.div
        className="flex gap-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className="shrink-0" style={{ transformStyle: "preserve-3d" }}>
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ============================================================================
// 12. ScrollIndicator — animated scroll-down hint (for hero)
// ============================================================================
export function ScrollIndicator({ className, color = "text-ivory/60" }: { className?: string; color?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      className={cn("flex flex-col items-center gap-2", color, className)}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.3em]">Scroll</span>
      <div className="flex h-10 w-6 justify-center rounded-full border border-current">
        <motion.div
          animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="mt-1.5 h-1.5 w-1.5 rounded-full bg-current"
        />
      </div>
    </motion.div>
  );
}

// ============================================================================
// 13. GradientText — animated gradient text (for headings)
// ============================================================================
export function GradientText({
  children,
  className,
  from = "#D4AF37",
  to = "#C9A227",
  animate = true,
}: {
  children: ReactNode;
  className?: string;
  from?: string;
  to?: string;
  animate?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <span
      className={cn("bg-clip-text text-transparent", className)}
      style={{
        backgroundImage: `linear-gradient(135deg, ${from}, ${to}, ${from})`,
        backgroundSize: animate && !reduce ? "200% 100%" : "100% 100%",
        animation: animate && !reduce ? "gradient-shift 4s ease infinite" : undefined,
      }}
    >
      {children}
      {animate && !reduce && (
        <style>{`@keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }`}</style>
      )}
    </span>
  );
}

// ============================================================================
// 14. FloatingElements — decorative floating shapes (background depth)
// ============================================================================
export function FloatingElements({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  const shapes = [
    { size: 60, x: "10%", y: "20%", delay: 0, duration: 12 },
    { size: 40, x: "80%", y: "15%", delay: 2, duration: 14 },
    { size: 80, x: "70%", y: "70%", delay: 1, duration: 16 },
    { size: 30, x: "20%", y: "80%", delay: 3, duration: 10 },
  ];

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-gold/10"
          style={{
            width: s.size,
            height: s.size,
            left: s.x,
            top: s.y,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// 15. TextStagger — word-by-word staggered text reveal
// ============================================================================
export function TextStagger({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const words = text.split(" ");

  if (reduce) {
    return <div ref={ref} className={className}>{text}</div>;
  }

  return (
    <div ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.5, delay: delay + i * 0.08, ease: EASE_SILK }}
          className="inline-block"
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </div>
  );
}
