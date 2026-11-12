import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "Nandhini Tex — Handwoven Silk & Cotton Sarees | Elegance Meets Tradition",
  description:
    "Curated handwoven silk & cotton sarees from Elampillai, Kanchipuram and Tamil Nadu weaving centers. Soft Silk, Kanchipuram, Bridal, Designer, Cotton sarees, dhotis & shirts. COD available, pan-India shipping.",
  keywords: [
    "Kanchipuram sarees",
    "handwoven silk sarees",
    "bridal sarees",
    "cotton sarees",
    "Nandhini Tex",
    "Elampillai sarees",
    "Tamil Nadu handloom",
    "designer sarees",
    "dhoti",
    "saree online India",
  ],
  authors: [{ name: "Nandhini Tex" }],
  openGraph: {
    title: "Nandhini Tex — Handwoven Silk & Cotton Sarees",
    description: "Elegance Meets Tradition. Curated handwoven sarees from Tamil Nadu.",
    siteName: "Nandhini Tex",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nandhini Tex — Handwoven Sarees",
    description: "Elegance Meets Tradition. Curated handwoven sarees from Tamil Nadu.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
