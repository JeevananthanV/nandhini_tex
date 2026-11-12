import { db } from "@/lib/db";

// ============================================================================
// SEO / GEO / AEO / Local SEO — Structured Data Generators
// Generates JSON-LD for Organization, LocalBusiness, WebSite, ItemList,
// FAQPage, Product, BreadcrumbList, and AggregateOffer.
// ============================================================================

const SITE_URL = "https://nandhinitex.com";
const BUSINESS = {
  name: "Nandhini Tex",
  legalName: "Nandhini Tex Handlooms",
  tagline: "Elegance Meets Tradition",
  description:
    "Nandhini Tex is a curated online store for handwoven silk and cotton sarees direct from Elampillai, Kanchipuram, and other Tamil Nadu weaving centers. Shop Soft Silk, Kanchipuram Silk, Bridal, Designer, Cotton sarees, dhotis, shirts, and couple combos with COD, pan-India shipping, and 7-day returns.",
  phone: "+91-76048-11838",
  phoneDisplay: "+91 76048 11838",
  email: "hello@nandhinitex.com",
  street: "Elampillai, Salem",
  city: "Salem",
  state: "Tamil Nadu",
  postalCode: "637502",
  country: "IN",
  latitude: 11.6087,
  longitude: 78.2578,
  priceRange: "₹249 - ₹35,000",
  foundingDate: "2015",
  supportHours: "Mo-Sa 10:00-19:00",
};

export const SEO_KEYWORDS = [
  // Primary product keywords
  "Kanchipuram silk sarees",
  "handwoven silk sarees",
  "bridal silk sarees",
  "soft silk sarees",
  "cotton sarees online",
  "designer sarees",
  "pure silk sarees",
  "Kanchipuram saree online",
  // Location-based (Local SEO)
  "saree shop Elampillai",
  "sarees Salem Tamil Nadu",
  "Kanchipuram saree store",
  "handloom sarees Tamil Nadu",
  "saree shop near Salem",
  "Elampillai silk sarees",
  "Tamil Nadu handloom sarees",
  // Long-tail / intent
  "buy silk saree online India",
  "bridal saree online shopping",
  "pure mulberry silk saree",
  "gold zari silk saree",
  "handwoven cotton saree",
  "wedding saree COD India",
  "saree with blouse piece",
  "soft silk saree for festival",
  // Menswear
  "silk dhoti online",
  "men's ethnic wear Tamil Nadu",
  "silk shirt for wedding",
  "dhoti kurta set",
  "couple combo saree",
  // Brand & trust
  "Nandhini Tex sarees",
  "authentic handloom sarees",
  "COD saree online India",
  "7-day return saree",
  // Fabric & craft
  "Kanchipuram mulberry silk",
  "zari border saree",
  "temple border saree",
  "kuttu pallu saree",
  "Arani silk saree",
  "handloom weaving Elampillai",
];

export const TARGET_KEYWORDS_BY_PAGE: Record<string, string[]> = {
  home: [
    "handwoven silk sarees online",
    "Kanchipuram sarees",
    "bridal saree shop India",
    "saree store Tamil Nadu",
    "Nandhini Tex",
  ],
  "soft-silk": [
    "soft silk sarees online",
    "lightweight silk saree",
    "everyday silk saree",
    "soft silk saree with blouse piece",
    "Elampillai soft silk",
  ],
  "kanchipuram-silk": [
    "Kanchipuram silk sarees",
    "pure mulberry silk saree",
    "original Kanchipuram saree",
    "Kanchipuram bridal saree",
    "gold zari Kanchipuram saree",
  ],
  cotton: [
    "handloom cotton sarees",
    "cotton saree online India",
    "summer cotton saree",
    "daily wear cotton saree",
    "Kanchipuram cotton saree",
  ],
  bridal: [
    "bridal silk sarees",
    "wedding saree online",
    "bridal Kanchipuram saree",
    "red bridal saree",
    "south Indian bridal saree",
  ],
  designer: [
    "designer sarees online",
    "modern designer saree",
    "designer silk saree",
    "contemporary saree India",
  ],
  "offer-sarees": [
    "cheap sarees online",
    "offer sarees",
    "budget silk saree",
    "discount saree online India",
  ],
  dhotis: [
    "silk dhoti online",
    "men's dhoti Tamil Nadu",
    "wedding dhoti silk",
    "panchakacham dhoti",
  ],
  shirts: [
    "silk kurta online",
    "men's ethnic shirt",
    "silk shirt wedding",
    "kurta for men Tamil Nadu",
  ],
  "couple-combo": [
    "couple combo saree",
    "wedding couple saree dhoti set",
    "matching saree and dhoti",
    "engagement couple combo",
  ],
};

// ----------------------------------------------------------------------------
// Organization + LocalBusiness (the core entity for GEO / AI search)
// ----------------------------------------------------------------------------
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["ClothingStore", "LocalBusiness", "Store"],
    "@id": `${SITE_URL}/#business`,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    description: BUSINESS.description,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, Debit Card, UPI, Net Banking, COD",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.street,
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.state,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.latitude,
      longitude: BUSINESS.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Handwoven Sarees & Menswear",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Soft Silk Sarees" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Kanchipuram Silk Sarees" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Cotton Sarees" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Bridal Silk Sarees" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Designer Sarees" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Silk Dhotis" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Silk & Cotton Shirts" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Couple Combo Sets" } },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "2450",
      bestRating: "5",
      worstRating: "1",
    },
    sameAs: [
      "https://www.instagram.com/nandhinitex",
      "https://www.facebook.com/nandhinitex",
      "https://www.youtube.com/@nandhinitex",
    ],
    founder: {
      "@type": "Person",
      name: "Nandhini Tex Family",
    },
    foundingDate: BUSINESS.foundingDate,
    knowsAbout: [
      "Kanchipuram silk sarees",
      "handloom weaving",
      "pure mulberry silk",
      "gold zari work",
      "Tamil Nadu handloom textiles",
      "bridal sarees",
      "saree care and draping",
    ],
  };
}

// ----------------------------------------------------------------------------
// WebSite (with SearchAction for sitelinks search box)
// ----------------------------------------------------------------------------
export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BUSINESS.name,
    alternateName: "Nandhini Tex Sarees",
    description: BUSINESS.description,
    publisher: { "@id": `${SITE_URL}/#business` },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ----------------------------------------------------------------------------
// BreadcrumbList
// ----------------------------------------------------------------------------
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

// ----------------------------------------------------------------------------
// ItemList — all products (helps discoverability for product-rich results)
// ----------------------------------------------------------------------------
export async function getProductListSchema() {
  const products = await db.product.findMany({
    where: { status: "published" },
    include: { category: true, variants: true },
    take: 20,
    orderBy: { createdAt: "desc" },
  });
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Handwoven Sarees Collection — Nandhini Tex",
    description: "Browse our full collection of handwoven silk and cotton sarees, dhotis, and ethnic wear from Tamil Nadu.",
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/?product=${p.slug}`,
      name: p.title,
    })),
  };
}

// ----------------------------------------------------------------------------
// FAQPage — powers AEO (Answer Engine Optimization) + FAQ rich results
// ----------------------------------------------------------------------------
export async function getFaqSchema() {
  const faqs = await db.faq.findMany({ orderBy: { sortOrder: "asc" } });
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

// ----------------------------------------------------------------------------
// Product (detailed — for product rich results with offers + reviews)
// ----------------------------------------------------------------------------
export function getProductSchema(p: {
  title: string;
  description: string;
  slug: string;
  basePrice: number;
  mrp: number;
  images: string[];
  fabricType: string | null;
  weaveOrigin: string | null;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  categoryName: string;
  inStock: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description,
    image: p.images,
    url: `${SITE_URL}/?product=${p.slug}`,
    sku: p.slug.toUpperCase().replace(/-/g, ""),
    brand: {
      "@type": "Brand",
      name: p.brand || "Nandhini Tex",
    },
    category: p.categoryName,
    material: p.fabricType || "Silk",
    countryOfOrigin: {
      "@type": "Country",
      name: "India",
    },
    isAccessibleForFree: false,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/?product=${p.slug}`,
      priceCurrency: "INR",
      price: p.basePrice,
      priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#business` },
      priceSpecification: p.mrp > p.basePrice ? {
        "@type": "PriceSpecification",
        price: p.mrp,
        priceCurrency: "INR",
      } : undefined,
    },
    aggregateRating: p.rating && p.reviewCount ? {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: p.reviewCount,
      bestRating: "5",
      worstRating: "1",
    } : undefined,
  };
}

// ----------------------------------------------------------------------------
// Collection — all product schemas (for ItemList + Product rich results)
// ----------------------------------------------------------------------------
export async function getAllProductSchemas() {
  const products = await db.product.findMany({
    where: { status: "published", isFeatured: true },
    include: { category: true, variants: true },
    take: 8,
    orderBy: { rating: "desc" },
  });
  return products.map((p) =>
    getProductSchema({
      title: p.title,
      description: p.description,
      slug: p.slug,
      basePrice: p.basePrice,
      mrp: p.mrp,
      images: JSON.parse(p.images || "[]"),
      fabricType: p.fabricType,
      weaveOrigin: p.weaveOrigin,
      rating: p.rating,
      reviewCount: p.reviewCount,
      categoryName: p.category.name,
      inStock: p.variants.some((v) => v.stockQty > 0),
    })
  );
}

// ----------------------------------------------------------------------------
// Flatten all schemas into a script-tag array for SSR injection
// ----------------------------------------------------------------------------
export async function getAllSchemas() {
  const [itemList, faq, products] = await Promise.all([
    getProductListSchema(),
    getFaqSchema(),
    getAllProductSchemas(),
  ]);
  return [
    getLocalBusinessSchema(),
    getWebsiteSchema(),
    itemList,
    faq,
    ...products,
  ];
}
