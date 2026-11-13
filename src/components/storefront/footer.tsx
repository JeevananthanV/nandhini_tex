"use client";

import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, Youtube, Send } from "lucide-react";
import { useStore } from "@/lib/store";

export function Footer({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  const goHome = useStore((s) => s.goHome);
  const goAllProducts = useStore((s) => s.goAllProducts);
  const goCategory = useStore((s) => s.goCategory);
  const goTrack = useStore((s) => s.goTrack);
  const setMode = useStore((s) => s.setMode);

  const goFaq = () => {
    goHome();
    // Wait for the home view to mount, then scroll to the FAQ section.
    window.setTimeout(() => {
      document.getElementById("faq")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  return (
    <footer className="mt-auto bg-navy-gradient text-ivory">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <button onClick={goHome} className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-ivory/10 ring-1 ring-gold/40">
                <span className="font-serif text-xl font-bold text-gold-gradient">N</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-lg font-semibold">Nandhini Tex</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-gold/80">Handwoven Heritage</span>
              </div>
            </button>
            <p className="mt-4 text-sm leading-relaxed text-ivory/70">
              Curated handwoven silk & cotton sarees from Elampillai, Kanchipuram & Arani. Every weave carries the warmth of the loom.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Facebook, Youtube, MessageCircle].map((Icon, i) => (
                <button key={i} className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory/10 text-ivory/80 transition-colors hover:bg-gold hover:text-navy" aria-label="Social link">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold">Shop</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button onClick={goAllProducts} className="font-medium text-gold transition-colors hover:text-ivory">Shop All Products</button>
              </li>
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button onClick={() => goCategory(c.slug)} className="text-ivory/70 transition-colors hover:text-gold">{c.name}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold">Help</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {["FAQs", "Shipping Policy", "Returns & Exchange", "Saree Care Guide", "Size Guide", "Track Order"].map((l) => (
                <li key={l}>
                  <button
                    onClick={l === "Track Order" ? goTrack : l === "FAQs" ? goFaq : undefined}
                    className={l === "FAQs" || l === "Track Order" ? "text-ivory/70 transition-colors hover:text-gold" : "cursor-default text-ivory/70"}
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold">Get in Touch</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-ivory/70">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                <div>
                  <a href="tel:+917604811838" className="hover:text-gold">+91 76048 11838</a>
                  <p className="text-xs text-ivory/50">Mon–Sat, 10am–7pm IST</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-ivory/70">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                <a href="mailto:hello@nandhinitex.com" className="hover:text-gold">hello@nandhinitex.com</a>
              </li>
              <li className="flex items-start gap-2.5 text-ivory/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                <span>Elampillai, Salem<br />Tamil Nadu 637502, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 grid grid-cols-2 gap-4 border-t border-ivory/10 pt-8 md:grid-cols-4">
          {[
            { title: "100% Handwoven", sub: "No power looms" },
            { title: "Pan-India COD", sub: "₹40 surcharge" },
            { title: "7-Day Returns", sub: "Easy & hassle-free" },
            { title: "Secure Payments", sub: "UPI · Cards · NB" },
          ].map((b, i) => (
            <div key={i} className="text-center md:text-left">
              <p className="text-sm font-semibold text-ivory">{b.title}</p>
              <p className="text-xs text-ivory/50">{b.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar — extra bottom padding on mobile clears the fixed bottom nav */}
      <div className="border-t border-ivory/10 pb-20 md:pb-0">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-ivory/50 md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} Nandhini Tex. Handwoven with care in Tamil Nadu.</p>
          <div className="flex items-center gap-4">
            <button className="hover:text-gold">Privacy Policy</button>
            <button className="hover:text-gold">Terms of Service</button>
            <button onClick={() => setMode("admin")} className="flex items-center gap-1 hover:text-gold">
              <Send className="h-3 w-3" /> Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
