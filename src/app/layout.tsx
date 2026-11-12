import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond, Cinzel } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { SEO_KEYWORDS } from "@/lib/seo";

const SITE_URL = "https://nandhinitex.com";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F0" },
    { media: "(prefers-color-scheme: dark)", color: "#050F1F" },
  ],
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nandhini Tex — Handwoven Silk & Cotton Sarees | Elegance Meets Tradition",
    template: "%s | Nandhini Tex",
  },
  description:
    "Buy authentic handwoven Kanchipuram silk, soft silk, cotton & bridal sarees direct from Elampillai, Tamil Nadu. Pure mulberry silk, real gold zari, COD available, pan-India shipping, 7-day returns. Shop 70+ handloom weaves.",
  keywords: SEO_KEYWORDS,
  authors: [{ name: "Nandhini Tex" }],
  creator: "Nandhini Tex",
  publisher: "Nandhini Tex",
  applicationName: "Nandhini Tex",
  category: "Shopping > Clothing > Sarees",
  classification: "Sarees, Handloom, Silk, Textiles, Indian Ethnic Wear",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Nandhini Tex",
    title: "Nandhini Tex — Handwoven Silk & Cotton Sarees | Elegance Meets Tradition",
    description:
      "Authentic handwoven Kanchipuram silk, soft silk, cotton & bridal sarees from Elampillai, Tamil Nadu. Pure mulberry silk, gold zari, COD, pan-India shipping, 7-day returns.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nandhini Tex — Handwoven Silk Sarees from Tamil Nadu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@nandhinitex",
    creator: "@nandhinitex",
    title: "Nandhini Tex — Handwoven Silk & Cotton Sarees",
    description:
      "Authentic handwoven sarees from Elampillai, Tamil Nadu. Kanchipuram silk, bridal, cotton & designer sarees. COD, pan-India shipping.",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Nandhini Tex",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  verification: {
    google: "google-site-verification-token",
  },
  other: {
    "geo.region": "IN-TN",
    "geo.placename": "Elampillai, Salem, Tamil Nadu",
    "geo.position": "11.6087;78.2578",
    "ICBM": "11.6087, 78.2578",
    "theme-color": "#081B3A",
    "msvalidate.01": "bing-site-verification-token",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://z-cdn.chatglm.cn" />
        <link rel="dns-prefetch" href="https://z-cdn.chatglm.cn" />
        <meta name="format-detection" content="telephone=yes, address=yes, email=yes" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${cinzel.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
