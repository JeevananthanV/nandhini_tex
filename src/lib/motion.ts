"use client";

// ============================================================================
// Motion Tokens — shared Framer Motion easing / spring / duration / variants
// Per design.md §6: "silk" ease-out, soft springs, weighted feel.
// All variants respect prefers-reduced-motion via the safe* helpers.
// ============================================================================

import type { Transition, Variants } from "framer-motion";

// ---- Easing curves ----
export const EASE_SILK = [0.22, 1, 0.36, 1] as const;        // "silk" ease-out (primary)
export const EASE_SOFT = [0.4, 0, 0.2, 1] as const;          // material-style soft
export const EASE_LUXE = [0.16, 1, 0.3, 1] as const;         // luxury ease (longer tail)
export const EASE_SPRING_OUT = [0.34, 1.56, 0.64, 1] as const; // subtle overshoot

// ---- Spring presets ----
export const SPRING_SOFT = { type: "spring" as const, stiffness: 120, damping: 18, mass: 0.9 };
export const SPRING_BOUNCE = { type: "spring" as const, stiffness: 300, damping: 20, mass: 0.6 };
export const SPRING_GENTLE = { type: "spring" as const, stiffness: 60, damping: 14, mass: 1 };
export const SPRING_SNAP = { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.5 };

// ---- Durations ----
export const DUR = {
  fast: 0.18,
  base: 0.32,
  slow: 0.6,
  slower: 0.9,
};

// ---- Shared transitions ----
export const tFadeUp: Transition = { duration: DUR.base, ease: EASE_SILK };
export const tFadeIn: Transition = { duration: DUR.base, ease: EASE_SILK };
export const tScaleIn: Transition = { duration: DUR.base, ease: EASE_SILK };
export const tSlideInRight: Transition = { duration: DUR.base, ease: EASE_SILK };
export const tSpringSoft: Transition = SPRING_SOFT;
export const tSpringBounce: Transition = SPRING_BOUNCE;

// ---- Variant presets ----

// Page / route transition
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: tFadeUp },
  exit: { opacity: 0, y: -8, transition: { duration: DUR.fast, ease: EASE_SILK } },
};

// Stagger container (for grids)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: tFadeUp },
};

// Scroll reveal (whileInView)
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: tFadeUp },
};

export const revealScale: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: DUR.slow, ease: EASE_SILK } },
};

export const revealLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: tFadeUp },
};

export const revealRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: tFadeUp },
};

// Letter-by-letter text reveal
export function textRevealVariants(stagger = 0.03): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  };
}
export const letterVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: tFadeUp },
};

// Drawer / sheet slide
export const drawerSlideRight: Variants = {
  closed: { x: "100%" },
  open: { x: 0, transition: { duration: DUR.base, ease: EASE_SILK } },
};

// Modal pop
export const modalPop: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: SPRING_BOUNCE },
  exit: { opacity: 0, scale: 0.95, transition: { duration: DUR.fast } },
};

// Toast slide-up
export const toastSlide: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING_BOUNCE },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: DUR.fast } },
};

// Counter / number
export const counterVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.base } },
};

// ---- Reduced-motion safe wrappers ----
// Components should use these instead of raw variants when they want
// automatic reduced-motion fallback.
export function safeReveal(reduce: boolean): Variants {
  if (reduce) return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  return revealUp;
}

export function safeStagger(reduce: boolean): Variants {
  if (reduce) return { hidden: { opacity: 0 }, show: { opacity: 1 } };
  return staggerContainer;
}

// Viewport options for whileInView — continuous re-trigger on scroll up or down
export const VIEWPORT_ONCE = { once: false, margin: "-10%" } as const;
export const VIEWPORT_ONCE_SOFT = { once: false, margin: "-5%" } as const;
export const VIEWPORT_RETRIGGER = { once: false, margin: "-8%" } as const;
