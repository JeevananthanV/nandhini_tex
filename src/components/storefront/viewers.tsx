"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ZoomIn, RotateCw, X, Maximize2, Hand } from "lucide-react";
import { EASE_SILK, DUR } from "@/lib/motion";
import { cn } from "@/lib/utils";

// ============================================================================
// 360° Product Viewer
// Drag/swipe to rotate the saree. Uses the product's image set as "frames".
// Falls back to standard gallery if fewer than 2 images.
// ============================================================================
export function Viewer360({
  images,
  alt,
  className,
}: {
  images: string[];
  alt: string;
  className?: string;
}) {
  const [active, setActive] = useState(false);
  const [frame, setFrame] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const dragStartX = useRef(0);
  const dragStartFrame = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasMultiple = images.length >= 2;

  // Auto-rotate when idle
  useEffect(() => {
    if (!active || !autoRotate || !hasMultiple) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % images.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [active, autoRotate, hasMultiple, images.length]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!hasMultiple) return;
    setAutoRotate(false);
    dragStartX.current = e.clientX;
    dragStartFrame.current = frame;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!hasMultiple || e.buttons !== 1) return;
    const dx = e.clientX - dragStartX.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sensitivity = rect.width / (images.length * 2);
    const frameDelta = Math.round(dx / sensitivity);
    const newFrame = ((dragStartFrame.current + frameDelta) % images.length + images.length) % images.length;
    setFrame(newFrame);
  };

  if (!hasMultiple) {
    return (
      <div className={cn("relative aspect-[3/4] overflow-hidden rounded-lg bg-muted", className)}>
        <img src={images[0]} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="relative aspect-[3/4] cursor-grab touch-none overflow-hidden rounded-lg bg-muted active:cursor-grabbing select-none"
        style={{ touchAction: "none" }}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${alt} view ${i + 1}`}
            draggable={false}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-150",
              i === frame ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {/* Rotation indicator */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-navy-dark/70 px-3 py-1 text-[10px] font-medium text-ivory backdrop-blur">
          <span className="flex items-center gap-1.5">
            <Hand className="h-3 w-3" /> Drag to rotate
            <span className="ml-1 tabular-nums">{Math.round(((frame + 1) / images.length) * 360)}°</span>
          </span>
        </div>
        {/* Frame counter */}
        <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-navy backdrop-blur">
          {frame + 1} / {images.length}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          onClick={() => { setActive(!active); setAutoRotate(!active ? true : false); }}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
            active ? "border-gold bg-gold/10 text-navy" : "border-border text-muted-foreground hover:border-navy"
          )}
        >
          <RotateCw className={cn("h-3.5 w-3.5", active && "animate-spin")} style={{ animationDuration: "2s" }} />
          {active ? "Stop auto-rotate" : "View in 360°"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Deep-Zoom Image Inspector
// Hover/drag to pan & zoom into the saree border/pallu for zari detail.
// ============================================================================
export function DeepZoom({
  src,
  alt,
  className,
  maxZoom = 2.5,
}: {
  src: string;
  alt: string;
  className?: string;
  maxZoom?: number;
}) {
  const [zooming, setZooming] = useState(false);
  const [active, setActive] = useState(false);
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const bgX = useTransform(x, (v) => `${v}%`);
  const bgY = useTransform(y, (v) => `${v}%`);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.PointerEvent) => {
    if (!zooming) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(((e.clientX - rect.left) / rect.width) * 100);
    y.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        onPointerEnter={() => setZooming(true)}
        onPointerLeave={() => setZooming(false)}
        onPointerMove={handleMove}
        className="relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-lg bg-muted"
        style={{ touchAction: "none" }}
      >
        <motion.img
          src={src}
          alt={alt}
          animate={{ scale: zooming ? maxZoom : 1 }}
          transition={{ duration: 0.3, ease: EASE_SILK }}
          style={{ transformOrigin: `${bgX} ${bgY}`, x: "-50%", y: "-50%", left: "50%", top: "50%" }}
          className="absolute h-full w-full object-cover"
        />
        {/* Zoom hint */}
        <AnimatePresence>
          {!zooming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-navy backdrop-blur"
            >
              <ZoomIn className="h-3.5 w-3.5" /> Hover to zoom
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button
        onClick={() => setActive(true)}
        className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-navy backdrop-blur hover:bg-background"
      >
        <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
      </button>

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(false)}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-navy-dark/95 p-4 backdrop-blur"
          >
            <button className="absolute right-5 top-5 text-ivory" aria-label="Close">
              <X className="h-7 w-7" />
            </button>
            <motion.img
              src={src}
              alt={alt}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: DUR.base, ease: EASE_SILK }}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
