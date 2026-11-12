import { db } from "@/lib/db";
import { Storefront } from "@/components/storefront/storefront-shell";
import { AdminApp } from "@/components/admin/admin-app";
import { getAllSchemas } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // ISR — revalidate every hour

// SEO metadata for the homepage (the only user-visible route)
export async function generateMetadata() {
  return {
    title: "Nandhini Tex — Handwoven Silk & Cotton Sarees | Elegance Meets Tradition",
    description:
      "Buy authentic handwoven Kanchipuram silk, soft silk, cotton & bridal sarees direct from Elampillai, Tamil Nadu. Pure mulberry silk, real gold zari, COD, pan-India shipping, 7-day returns. Shop 70+ handloom weaves.",
    alternates: { canonical: "/" },
    openGraph: {
      title: "Nandhini Tex — Handwoven Silk & Cotton Sarees",
      description: "Authentic handwoven sarees from Elampillai, Tamil Nadu. Pure silk, gold zari, COD, 7-day returns.",
      url: "/",
    },
  };
}

export default async function Page() {
  const [categories, schemas] = await Promise.all([
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true, description: true, bannerImage: true, productCount: true },
    }),
    getAllSchemas(),
  ]);

  const cats = categories.map((c) => ({
    ...c,
    description: c.description ?? null,
    bannerImage: c.bannerImage ?? null,
  }));

  return (
    <>
      {/* Server-rendered JSON-LD structured data for SEO / GEO / AEO */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* H1 is rendered by the hero section in the storefront for visual users */}
      {/* The sr-only section below provides keyword-rich, crawlable SEO/GEO content */}

      {/* SEO content block — keyword-rich, location-targeted, crawlable (visually hidden but in DOM) */}
      <section className="sr-only" aria-label="About Nandhini Tex Sarees">
        <h2>About Nandhini Tex Sarees</h2>
        <p>
          Nandhini Tex is a handloom saree store based in Elampillai, Salem, Tamil Nadu, India.
          We specialize in authentic handwoven Kanchipuram silk sarees, soft silk sarees,
          cotton sarees, bridal silk sarees, designer sarees, and men&apos;s ethnic wear including
          silk dhotis and shirts. Every saree is woven on traditional handlooms by master artisans
          from Elampillai, Kanchipuram, and Arani — the historic weaving centres of Tamil Nadu.
        </p>
        <p>
          Our collection includes over 70 unique handwoven weaves, ranging from ₹249 offer sarees
          to ₹35,000 grand bridal Kanchipuram silk sarees with pure gold zari. Every saree ships
          with an approximately 0.8 metre matching running blouse piece at no extra cost.
        </p>
        <h2>Why Shop at Nandhini Tex?</h2>
        <ul>
          <li>100% handwoven — no power looms, no shortcuts</li>
          <li>Pure mulberry silk with authentic Silk Mark assurance</li>
          <li>Real gold zari borders and pallus</li>
          <li>Cash on Delivery (COD) available across India</li>
          <li>Free shipping on orders above ₹999</li>
          <li>7-day easy returns and exchanges</li>
          <li>Pan-India shipping via Delhivery, DTDC, and India Post</li>
          <li>4.8-star average rating from 2,450+ verified customer reviews</li>
        </ul>
        <h2>Our Saree Collections</h2>
        <p>
          <strong>Soft Silk Sarees:</strong> Lightweight, everyday-elegant silk sarees with a soft
          sheen and subtle zari border, woven in Elampillai.
        </p>
        <p>
          <strong>Kanchipuram Silk Sarees:</strong> Pure mulberry silk Kanchipuram sarees with
          temple borders, real gold zari, and kuttu-joined contrast pallus.
        </p>
        <p>
          <strong>Cotton Sarees:</strong> Breathable handloom cotton sarees from Kanchipuram and
          Arani — perfect for daily wear and summers.
        </p>
        <p>
          <strong>Bridal Silk Sarees:</strong> Grand bridal silks in rich reds, maroons and gold —
          woven over 7 days with pure gold zari for your wedding day.
        </p>
        <p>
          <strong>Designer Sarees:</strong> Contemporary designer sarees with modern motifs and
          statement blouses.
        </p>
        <p>
          <strong>Men&apos;s Ethnic Wear:</strong> Silk dhotis, cotton veshtis, and silk &amp; cotton
          kurtas and shirts for weddings and festive occasions.
        </p>
        <p>
          <strong>Couple Combos:</strong> Coordinated saree and dhoti sets for engagements, weddings,
          and receptions.
        </p>
        <h2>Visit Our Store in Tamil Nadu</h2>
        <p>
          Nandhini Tex Handlooms is located in Elampillai, Salem, Tamil Nadu 637502, India.
          Call us at +91 76048 11838 (Monday to Saturday, 10am to 7pm IST) for saree enquiries,
          bulk orders, bridal consultations, or wholesale enquiries. We ship sarees across India
          including Chennai, Bengaluru, Coimbatore, Madurai, Trichy, Salem, Erode, Vellore,
          Pondicherry, Tirunelveli, Mumbai, Delhi, Hyderabad, and all serviceable pincodes.
        </p>
      </section>

      <Storefront categories={cats} />
      <AdminApp />
    </>
  );
}
