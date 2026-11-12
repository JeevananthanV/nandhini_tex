import { PrismaClient } from "@prisma/client";
import seedImages from "../seed-images.json";

const db = new PrismaClient();

type ImgKey = keyof typeof seedImages;
const IMG = seedImages as Record<ImgKey, string[]>;

function pick(arr: string[], i: number): string {
  return arr[i % arr.length];
}
function twoImages(arr: string[], i: number): string[] {
  return [pick(arr, i), pick(arr, i + 1)];
}

// ---- Category definitions (from PRD §2) ----
const categories = [
  { name: "Soft Silk", slug: "soft-silk", desc: "Lightweight, everyday-elegant silk sarees with a soft sheen and subtle zari.", imgKey: "softSilk" as ImgKey, count: 12 },
  { name: "Kanchipuram Silk", slug: "kanchipuram-silk", desc: "Pure mulberry silk Kanchipuram sarees with temple borders and real zari.", imgKey: "kanchipuram" as ImgKey, count: 10 },
  { name: "Cotton", slug: "cotton", desc: "Breathable handloom cotton sarees — perfect for daily wear and summers.", imgKey: "cotton" as ImgKey, count: 14 },
  { name: "Bridal", slug: "bridal", desc: "Grand bridal silks in rich reds, maroons and gold — woven for your big day.", imgKey: "bridal" as ImgKey, count: 8 },
  { name: "Designer", slug: "designer", desc: "Contemporary designer sarees with modern motifs and statement blouses.", imgKey: "designer" as ImgKey, count: 8 },
  { name: "Offer Sarees", slug: "offer-sarees", desc: "Best-value picks — handloom quality at irresistible prices.", imgKey: "cotton" as ImgKey, count: 7 },
  { name: "Dhotis", slug: "dhotis", desc: "Traditional men's dhotis in silk & cotton — festive and wedding-ready.", imgKey: "dhoti" as ImgKey, count: 10 },
  { name: "Shirts", slug: "shirts", desc: "Ethnic silk & cotton shirts for men — pair with dhotis for a complete look.", imgKey: "shirt" as ImgKey, count: 10 },
  { name: "Couple Combo", slug: "couple-combo", desc: "Coordinated saree + dhoti combos for engagements, weddings & receptions.", imgKey: "couple" as ImgKey, count: 5 },
];

// ---- Product templates per category ----
type ProductSeed = {
  title: string;
  desc: string;
  fabric: string;
  origin: string;
  zari: string;
  price: number;
  mrp: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  colors: { name: string; hex: string }[];
  sizes?: string[];
};

const productSets: Record<string, ProductSeed[]> = {
  "soft-silk": [
    { title: "Anjali Soft Silk Saree", desc: "A graceful soft silk saree in peacock blue with a delicate gold zari border and mango motifs on the pallu. Woven on traditional handlooms in Elampillai, it drapes effortlessly for festive mornings and evening functions alike.", fabric: "Soft Silk", origin: "Elampillai", zari: "Tested zari", price: 2499, mrp: 3999, isBestseller: true, colors: [{ name: "Peacock Blue", hex: "#1E5F74" }, { name: "Maroon", hex: "#7A1F2B" }] },
    { title: "Meenakshi Soft Silk Saree", desc: "Muted mustard soft silk with temple-style border and contrast pallu. Lightweight and easy to drape for long festival days.", fabric: "Soft Silk", origin: "Elampillai", zari: "Tested zari", price: 2299, mrp: 3499, isNew: true, colors: [{ name: "Mustard", hex: "#C9A227" }, { name: "Green", hex: "#3F6B4A" }] },
    { title: "Lakshmi Soft Silk Saree", desc: "Rose-pink soft silk with subtle silver zari butis all over and a richly woven pallu. A versatile pick for poojas and family gatherings.", fabric: "Soft Silk", origin: "Arani", zari: "Half-fine zari", price: 2799, mrp: 4200, colors: [{ name: "Rose Pink", hex: "#C2587A" }, { name: "Ivory", hex: "#F3EDE2" }] },
    { title: "Padma Soft Silk Saree", desc: "Deep teal soft silk with a contrasting maroon border and traditional kuttu join. Lightweight and breathable.", fabric: "Soft Silk", origin: "Kanchipuram", zari: "Tested zari", price: 3199, mrp: 4800, isBestseller: true, colors: [{ name: "Teal", hex: "#0F5F5C" }, { name: "Maroon", hex: "#7A1F2B" }] },
    { title: "Sundari Soft Silk Saree", desc: "Classic maroon soft silk with gold zari border and peacock motifs. A timeless wardrobe essential.", fabric: "Soft Silk", origin: "Elampillai", zari: "Real zari", price: 2999, mrp: 4500, colors: [{ name: "Maroon", hex: "#7A1F2B" }, { name: "Purple", hex: "#5B2A6B" }] },
    { title: "Thamarai Soft Silk Saree", desc: "Lotus-pink soft silk with woven lotus motifs on the pallu and a thin gold border. Feminine and festive.", fabric: "Soft Silk", origin: "Arani", zari: "Tested zari", price: 2599, mrp: 3900, isNew: true, colors: [{ name: "Lotus Pink", hex: "#D67BA0" }] },
  ],
  "kanchipuram-silk": [
    { title: "Brihadamba Kanchipuram Silk Saree", desc: "A majestic pure mulberry silk Kanchipuram saree in deep maroon with a 5-inch gold temple border, kuttu-joined contrast pallu, and woven peacock-and-yali motifs. The heirloom piece every bride dreams of.", fabric: "Pure Mulberry Silk", origin: "Kanchipuram", zari: "Pure gold zari", price: 18999, mrp: 24000, isBestseller: true, isFeatured: true, colors: [{ name: "Maroon", hex: "#7A1F2B" }, { name: "Red", hex: "#B3261E" }] },
    { title: "Kamakshi Kanchipuram Silk Saree", desc: "Royal blue Kanchipuram with a gold zari border featuring rudraksha motifs and a richly woven pallu of paisleys and elephants.", fabric: "Pure Mulberry Silk", origin: "Kanchipuram", zari: "Pure gold zari", price: 16500, mrp: 21000, colors: [{ name: "Royal Blue", hex: "#1E3A6B" }, { name: "Green", hex: "#1B5E20" }] },
    { title: "Akilandeshwari Kanchipuram Silk Saree", desc: "Grand green Kanchipuram with a broad gold border of temple gopuram motifs and a contrast red pallu. Pure silk, pure zari, pure heritage.", fabric: "Pure Mulberry Silk", origin: "Kanchipuram", zari: "Pure gold zari", price: 22000, mrp: 28000, isFeatured: true, colors: [{ name: "Emerald Green", hex: "#0F5F2E" }, { name: "Red", hex: "#B3261E" }] },
    { title: "Meenakshi Kanchipuram Silk Saree", desc: "Muted gold Kanchipuram with a maroon border and delicate butis. Understated luxury for the connoisseur.", fabric: "Pure Mulberry Silk", origin: "Kanchipuram", zari: "Pure gold zari", price: 14500, mrp: 19000, colors: [{ name: "Antique Gold", hex: "#A07E16" }, { name: "Maroon", hex: "#7A1F2B" }] },
    { title: "Andal Kanchipuram Silk Saree", desc: "Vibrant orange Kanchipuram with a contrast purple pallu and gold zari parrot motifs. A showstopper for receptions.", fabric: "Pure Mulberry Silk", origin: "Kanchipuram", zari: "Pure gold zari", price: 17500, mrp: 22500, isNew: true, colors: [{ name: "Orange", hex: "#E65100" }, { name: "Purple", hex: "#5B2A6B" }] },
  ],
  "cotton": [
    { title: "Karpagam Cotton Saree", desc: "Breathable handloom cotton in earthy brown with a woven koorai border. Ideal for office and daily wear.", fabric: "Handloom Cotton", origin: "Kanchipuram", zari: "Cotton thread", price: 1299, mrp: 1999, isBestseller: true, colors: [{ name: "Earth Brown", hex: "#6B4226" }, { name: "Olive", hex: "#5C6B3B" }] },
    { title: "Saraswathi Cotton Saree", desc: "Crisp white cotton with a maroon koorai border and gold thread accents. Classic and comfortable.", fabric: "Handloom Cotton", origin: "Kanchipuram", zari: "Half-fine zari", price: 1499, mrp: 2299, colors: [{ name: "Ivory", hex: "#F3EDE2" }, { name: "Maroon", hex: "#7A1F2B" }] },
    { title: "Gowri Cotton Saree", desc: "Sunshine-yellow cotton with a green border and woven checks. Cheerful and light for summer.", fabric: "Handloom Cotton", origin: "Elampillai", zari: "Cotton thread", price: 999, mrp: 1599, isNew: true, colors: [{ name: "Yellow", hex: "#E0BE4A" }, { name: "Green", hex: "#3F6B4A" }] },
    { title: "Sita Cotton Saree", desc: "Indigo blue cotton with a woven ikat-inspired border. Earthy and elegant for everyday.", fabric: "Handloom Cotton", origin: "Arani", zari: "Cotton thread", price: 1199, mrp: 1799, colors: [{ name: "Indigo", hex: "#26415E" }] },
    { title: "Durgai Cotton Saree", desc: "Rich maroon cotton with a gold-thread koorai border. Festive cotton for poojas and functions.", fabric: "Handloom Cotton", origin: "Kanchipuram", zari: "Half-fine zari", price: 1399, mrp: 2199, colors: [{ name: "Maroon", hex: "#7A1F2B" }, { name: "Green", hex: "#1B5E20" }] },
    { title: "Vijaya Cotton Saree", desc: "Muted grey cotton with a mustard border — minimalist and modern for the working woman.", fabric: "Handloom Cotton", origin: "Elampillai", zari: "Cotton thread", price: 1099, mrp: 1699, colors: [{ name: "Slate Grey", hex: "#5A6470" }] },
  ],
  "bridal": [
    { title: "Mahalakshmi Bridal Silk Saree", desc: "The grandest of them all — deep red pure Kanchipuram silk with a 7-inch gold zari border, murali-and-peacock pallu, and real gold zari throughout. The bridal heirloom.", fabric: "Pure Mulberry Silk", origin: "Kanchipuram", zari: "Pure gold zari", price: 35000, mrp: 42000, isFeatured: true, isBestseller: true, colors: [{ name: "Bridal Red", hex: "#B3261E" }] },
    { title: "Raja Rajeshwari Bridal Silk Saree", desc: "Maroon bridal silk with a contrast gold-green pallu, woven anna-pakshi motifs and a rich kuttu join. Woven over 21 days.", fabric: "Pure Mulberry Silk", origin: "Kanchipuram", zari: "Pure gold zari", price: 28000, mrp: 34000, isFeatured: true, colors: [{ name: "Maroon", hex: "#7A1F2B" }] },
    { title: "Sivagami Bridal Silk Saree", desc: "Royal purple bridal silk with a broad gold border of temple motifs and a contrast magenta pallu. A regal statement.", fabric: "Pure Mulberry Silk", origin: "Kanchipuram", zari: "Pure gold zari", price: 24500, mrp: 30000, colors: [{ name: "Royal Purple", hex: "#5B2A6B" }] },
    { title: "Padmavathi Bridal Silk Saree", desc: "Peacock green bridal silk with a maroon-gold contrast border and woven floral pallu. Striking and timeless.", fabric: "Pure Mulberry Silk", origin: "Kanchipuram", zari: "Pure gold zari", price: 26000, mrp: 32000, isNew: true, colors: [{ name: "Peacock Green", hex: "#0F5F5C" }] },
  ],
  "designer": [
    { title: "Nyla Designer Saree", desc: "Contemporary designer saree in dusty rose with modern geometric zari work and a statement tassel pallu. For the new-age bride.", fabric: "Art Silk", origin: "Elampillai", zari: "Tested zari", price: 4999, mrp: 7500, isNew: true, isFeatured: true, colors: [{ name: "Dusty Rose", hex: "#C79BA8" }] },
    { title: "Zara Designer Saree", desc: "Midnight blue designer saree with silver embroidery and a sheer pallu. Evening-ready elegance.", fabric: "Art Silk", origin: "Chennai", zari: "Silver zari", price: 5499, mrp: 8200, colors: [{ name: "Midnight Blue", hex: "#13294B" }] },
    { title: "Inara Designer Saree", desc: "Blush-pink designer saree with sequin work and a ruffled pallu. Modern minimalism meets tradition.", fabric: "Art Silk", origin: "Chennai", zari: "Tested zari", price: 4799, mrp: 7200, isBestseller: true, colors: [{ name: "Blush Pink", hex: "#E8B7C4" }] },
    { title: "Dia Designer Saree", desc: "Charcoal-grey designer saree with gold foil prints and a contrast neon border. Bold and stylish.", fabric: "Art Silk", origin: "Elampillai", zari: "Tested zari", price: 5299, mrp: 7900, colors: [{ name: "Charcoal", hex: "#3A3A3A" }] },
  ],
  "offer-sarees": [
    { title: "Daily Delight Cotton Saree", desc: "Soft cotton saree in sea-green with a printed border. Unbeatable value for everyday wear.", fabric: "Cotton Blend", origin: "Elampillai", zari: "Printed", price: 499, mrp: 899, colors: [{ name: "Sea Green", hex: "#3F8E8C" }, { name: "Yellow", hex: "#E0BE4A" }] },
    { title: "Festive Print Saree", desc: "Festive printed saree in maroon with gold-foil motifs. Light on the pocket, bright on the day.", fabric: "Poly-Cotton", origin: "Elampillai", zari: "Gold print", price: 249, mrp: 599, isBestseller: true, colors: [{ name: "Maroon", hex: "#7A1F2B" }] },
    { title: "Kasavu Style Saree", desc: "Kerala-style kasavu saree in off-white with a gold border. Classic and cool for summers.", fabric: "Cotton", origin: "Elampillai", zari: "Gold print", price: 749, mrp: 1299, colors: [{ name: "Off-White", hex: "#F3EDE2" }] },
    { title: "Offer Silk Saree", desc: "Soft art-silk saree in royal blue with a printed gold border. Festive look at an offer price.", fabric: "Art Silk", origin: "Arani", zari: "Printed", price: 999, mrp: 1999, colors: [{ name: "Royal Blue", hex: "#1E3A6B" }] },
  ],
  "dhotis": [
    { title: "Silk Dhoti — Royal", desc: "Pure silk dhoti in cream-gold with a maroon silk border. The perfect partner for the wedding ensemble.", fabric: "Silk", origin: "Kanchipuram", zari: "Real zari", price: 3499, mrp: 4999, isBestseller: true, colors: [{ name: "Cream", hex: "#F3EDE2" }], sizes: ["36", "38", "40", "42", "44"] },
    { title: "Cotton Dhoti — Classic", desc: "Comfortable cotton dhoti in white with a woven gold border. Daily festive and pooja wear.", fabric: "Cotton", origin: "Elampillai", zari: "Half-fine zari", price: 899, mrp: 1499, colors: [{ name: "White", hex: "#FFFFFF" }], sizes: ["36", "38", "40", "42"] },
    { title: "Silk Dhoti — Maroon", desc: "Rich maroon silk dhoti with a gold zari border. Statement piece for receptions.", fabric: "Silk", origin: "Kanchipuram", zari: "Real zari", price: 3999, mrp: 5500, isNew: true, colors: [{ name: "Maroon", hex: "#7A1F2B" }], sizes: ["38", "40", "42", "44"] },
    { title: "Veshti — Mundu Style", desc: "Traditional Kerala-style veshti in off-white with a gold kasavu border. Cool and classic.", fabric: "Cotton", origin: "Elampillai", zari: "Cotton thread", price: 699, mrp: 1199, colors: [{ name: "Off-White", hex: "#F3EDE2" }], sizes: ["36", "38", "40", "42"] },
  ],
  "shirts": [
    { title: "Silk Kurta — Gold", desc: "Silk kurta in antique gold with a mandarin collar and subtle weaving. Pair with a dhoti for a complete look.", fabric: "Silk", origin: "Elampillai", zari: "Tested zari", price: 2499, mrp: 3999, isBestseller: true, colors: [{ name: "Antique Gold", hex: "#A07E16" }], sizes: ["38", "40", "42", "44"] },
    { title: "Cotton Kurta — Ivory", desc: "Breathable cotton kurta in ivory with contrast buttons. Comfortable ethnic wear for any occasion.", fabric: "Cotton", origin: "Elampillai", zari: "—", price: 1299, mrp: 1999, colors: [{ name: "Ivory", hex: "#F3EDE2" }], sizes: ["38", "40", "42", "44"] },
    { title: "Silk Shirt — Maroon", desc: "Rich maroon silk shirt with a subtle sheen and woven motifs. Wedding-ready.", fabric: "Silk", origin: "Kanchipuram", zari: "Tested zari", price: 2199, mrp: 3499, isNew: true, colors: [{ name: "Maroon", hex: "#7A1F2B" }], sizes: ["38", "40", "42"] },
    { title: "Cotton Kurta — Teal", desc: "Modern teal cotton kurta with a placket and wooden buttons. Smart-casual ethnic.", fabric: "Cotton", origin: "Elampillai", zari: "—", price: 1499, mrp: 2299, colors: [{ name: "Teal", hex: "#0F5F5C" }], sizes: ["38", "40", "42", "44"] },
  ],
  "couple-combo": [
    { title: "Wedding Combo — Red & Cream", desc: "Coordinated bridal-red silk saree with matching cream silk dhoti. The perfect couple set for weddings and receptions.", fabric: "Silk", origin: "Kanchipuram", zari: "Real zari", price: 22000, mrp: 28000, isFeatured: true, isBestseller: true, colors: [{ name: "Red & Cream", hex: "#B3261E" }] },
    { title: "Engagement Combo — Blue & Gold", desc: "Royal blue silk saree with a gold-bordered cream dhoti. Elegant pairing for engagements and muhurtham.", fabric: "Silk", origin: "Kanchipuram", zari: "Real zari", price: 18000, mrp: 23000, colors: [{ name: "Blue & Gold", hex: "#1E3A6B" }] },
    { title: "Reception Combo — Maroon & Mustard", desc: "Maroon silk saree with a mustard silk dhoti. A striking contrast combo for receptions.", fabric: "Silk", origin: "Elampillai", zari: "Tested zari", price: 15500, mrp: 20000, isNew: true, colors: [{ name: "Maroon & Mustard", hex: "#7A1F2B" }] },
  ],
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function discountPct(price: number, mrp: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

const reviewSeeds = [
  { author: "Priya Ramanathan", city: "Chennai", rating: 5, title: "Stunning weave and colour", body: "The saree exceeded my expectations. The zari work is gorgeous and it draped beautifully for my sister's wedding. Received so many compliments!", verified: true, featured: true },
  { author: "Lakshmi Narayanan", city: "Bengaluru", rating: 5, title: "Authentic Kanchipuram quality", body: "You can feel the quality of pure silk. The blouse piece matched perfectly. Will definitely buy again for my daughter's wedding.", verified: true, featured: true },
  { author: "Sneha Krishnan", city: "Coimbatore", rating: 4, title: "Lovely saree, fast delivery", body: "Beautiful colour and the fabric is soft. Delivery was quick and packaging was elegant. Took off one star only because I wished for more colour options.", verified: true, featured: false },
  { author: "Deepa Senthil", city: "Madurai", rating: 5, title: "Perfect bridal saree", body: "This was my wedding saree and it was everything I dreamed of. The gold zari shimmered beautifully in every photo. Thank you Nandhini Tex!", verified: true, featured: true },
  { author: "Anitha Ram", city: "Salem", rating: 5, title: "Great value for soft silk", body: "For the price, the quality is excellent. Wore it for a family function and it was comfortable all day. Highly recommend.", verified: true, featured: false },
  { author: "Kavitha Murthy", city: "Trichy", rating: 4, title: "Beautiful, slight colour variation", body: "The saree is lovely and well-woven. The shade was a touch different from the photo but still beautiful. Blouse piece was included as promised.", verified: true, featured: false },
  { author: "Revathi Subramaniam", city: "Erode", rating: 5, title: "Heirloom quality", body: "This is a saree I will pass down to my daughter. The craftsmanship is evident in every motif. Worth every rupee.", verified: true, featured: true },
  { author: "Divya Anand", city: "Vellore", rating: 5, title: "Exactly as shown", body: "Colour, border, zari — all exactly as in the photos. COD option made it stress-free to order. Very happy!", verified: true, featured: false },
];

const testimonials = [
  { name: "Meenakshi Iyer", city: "Chennai", quote: "Nandhini Tex sarees are my go-to for every family function. The weaves are authentic and the colours are exactly as shown.", rating: 5, featured: true },
  { name: "Saravanan & Kavitha", city: "Salem", quote: "Bought our entire wedding set from Nandhini Tex — bridal saree, dhoti, and combo. Quality and service were outstanding.", rating: 5, featured: true },
  { name: "Geetha Ramesh", city: "Coimbatore", quote: "I've been their customer for 3 years. Never disappointed. The COD option and 7-day returns give so much peace of mind.", rating: 5, featured: true },
  { name: "Vijaya Lakshmi", city: "Madurai", quote: "The Kanchipuram saree I bought for my daughter's wedding was the talk of the function. Thank you for the heirloom piece!", rating: 5, featured: true },
  { name: "Sundaram Pillai", city: "Trichy", quote: "Bought silk dhotis and shirts for my son's wedding. Excellent fit and finish. Will recommend to everyone.", rating: 5, featured: false },
  { name: "Rajalakshmi", city: "Erode", quote: "Beautiful soft silk sarees at honest prices. The blouse piece was included and matched perfectly.", rating: 5, featured: false },
];

const faqs = [
  { question: "Do you ship across India?", answer: "Yes! We ship pan-India via Delhivery, DTDC, and India Post. Free shipping on orders above ₹999. Most pincodes are serviceable for both prepaid and COD.", category: "Shipping", order: 1 },
  { question: "Is Cash on Delivery (COD) available?", answer: "Yes, COD is available across most serviceable pincodes. A nominal ₹40 surcharge applies on COD orders to cover handling. You can check COD availability for your pincode on the product page.", category: "COD", order: 2 },
  { question: "What is your return & exchange policy?", answer: "We offer 7-day returns on unused sarees with original tags and packaging intact. Bridal and offer sarees are eligible for exchange only. Initiate a return from your account or by calling our support line.", category: "Returns", order: 3 },
  { question: "What payment methods do you accept?", answer: "We accept UPI (GPay, PhonePe, Paytm), all major credit/debit cards, net banking, and Cash on Delivery. All prepaid payments are secured via our payment gateway.", category: "Payments", order: 4 },
  { question: "Does every saree come with a blouse piece?", answer: "Yes — every saree ships with an approximately 0.8 metre matching running blouse piece, unless explicitly mentioned otherwise. This is included at no extra cost.", category: "Sarees", order: 5 },
  { question: "How do I know the saree is authentic silk?", answer: "All our Kanchipuram and soft silk sarees are handwoven on traditional looms in Elampillai, Kanchipuram, and Arani. Pure silk sarees come with a Silk Mark assurance. Fabric and zari details are listed on each product page.", category: "Sarees", order: 6 },
  { question: "How should I care for my silk saree?", answer: "Dry clean only for the first wash. Store wrapped in a muslin cloth in a cool, dry place. Avoid direct sunlight and perfumes. Air the saree every few months and refold to prevent zari from snapping.", category: "Care", order: 7 },
  { question: "How long does weaving and delivery take?", answer: "In-stock sarees ship within 24–48 hours. Made-to-order and bridal sarees take 3–7 weaving days. Delivery typically takes 3–6 business days post-dispatch depending on your location.", category: "Shipping", order: 8 },
];

const coupons = [
  { code: "WELCOME10", description: "10% off on your first order", type: "percent", value: 10, minCartValue: 1500, usageLimit: 1000, perUserLimit: 1, active: true, expiresAt: new Date("2026-12-31") },
  { code: "FESTIVE15", description: "15% off on festive collection", type: "percent", value: 15, minCartValue: 3000, usageLimit: 500, perUserLimit: 2, active: true, expiresAt: new Date("2026-03-31") },
  { code: "FLAT500", description: "Flat ₹500 off on orders above ₹5000", type: "flat", value: 500, minCartValue: 5000, usageLimit: 300, perUserLimit: 1, active: true, expiresAt: new Date("2026-06-30") },
  { code: "BRIDAL25", description: "25% off on bridal collection", type: "percent", value: 25, minCartValue: 20000, usageLimit: 100, perUserLimit: 1, active: true, expiresAt: new Date("2026-12-31") },
];

const cities = ["Chennai", "Bengaluru", "Coimbatore", "Madurai", "Salem", "Trichy", "Erode", "Vellore", "Pondicherry", "Tirunelveli"];
const customerNames = ["Priya Ramanathan", "Lakshmi Narayanan", "Sneha Krishnan", "Deepa Senthil", "Anitha Ram", "Kavitha Murthy", "Revathi Subramaniam", "Divya Anand", "Saravanan Pillai", "Geetha Ramesh", "Vijaya Lakshmi", "Sundaram Pillai", "Rajalakshmi", "Meenakshi Iyer"];

function randPhone(): string {
  let p = "+91 9";
  for (let i = 0; i < 9; i++) p += Math.floor(Math.random() * 10);
  return p;
}

async function main() {
  console.log("Clearing existing data...");
  await db.review.deleteMany();
  await db.variant.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.testimonial.deleteMany();
  await db.faq.deleteMany();
  await db.coupon.deleteMany();
  await db.order.deleteMany();
  await db.customer.deleteMany();
  await db.newsletterSubscriber.deleteMany();

  console.log("Creating categories...");
  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await db.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.desc,
        bannerImage: pick(IMG[cat.imgKey], 0),
        sortOrder: categories.indexOf(cat),
        productCount: 0,
      },
    });
    catMap[cat.slug] = created.id;
  }

  console.log("Creating products...");
  let productIndex = 0;
  for (const [catSlug, set] of Object.entries(productSets)) {
    const categoryId = catMap[catSlug];
    const cat = categories.find((c) => c.slug === catSlug)!;
    const imgArr = IMG[cat.imgKey];

    for (let i = 0; i < set.length; i++) {
      const p = set[i];
      productIndex++;
      const slug = slugify(p.title);
      const images = twoImages(imgArr, i);
      const disc = discountPct(p.price, p.mrp);

      const product = await db.product.create({
        data: {
          slug,
          title: p.title,
          description: p.desc,
          shortDescription: p.desc.split(". ")[0] + ".",
          categoryId,
          status: "published",
          basePrice: p.price,
          mrp: p.mrp,
          discountPct: disc,
          fabricType: p.fabric,
          weaveOrigin: p.origin,
          weaveDays: cat.slug.includes("bridal") || cat.slug.includes("kanchipuram") ? 7 : cat.slug.includes("cotton") ? 3 : 5,
          zariType: p.zari,
          careInstructions: "Dry clean only. Store wrapped in muslin cloth in a cool, dry place. Avoid direct sunlight and perfumes.",
          blouseIncluded: cat.slug.includes("dhoti") || cat.slug.includes("shirt") ? false : true,
          blouseLengthM: 0.8,
          images: JSON.stringify(images),
          tags: JSON.stringify([cat.name, p.isNew ? "New Arrival" : "", p.isBestseller ? "Bestseller" : ""].filter(Boolean)),
          isBestseller: !!p.isBestseller,
          isNew: !!p.isNew,
          isFeatured: !!p.isFeatured,
          rating: 4.3 + Math.random() * 0.6,
          reviewCount: Math.floor(Math.random() * 120) + 15,
          metaTitle: `${p.title} — Nandhini Tex`,
          metaDescription: p.desc.slice(0, 150),
        },
      });

      // Variants — one per color (+ sizes for menswear)
      for (const color of p.colors) {
        if (p.sizes && p.sizes.length > 0) {
          for (const size of p.sizes) {
            await db.variant.create({
              data: {
                productId: product.id,
                color: color.name,
                colorHex: color.hex,
                size,
                sku: `${slug.toUpperCase().replace(/-/g, "")}-${color.name.toUpperCase().replace(/\s/g, "")}-${size}`,
                stockQty: Math.floor(Math.random() * 30) + 5,
              },
            });
          }
        } else {
          await db.variant.create({
            data: {
              productId: product.id,
              color: color.name,
              colorHex: color.hex,
              sku: `${slug.toUpperCase().replace(/-/g, "")}-${color.name.toUpperCase().replace(/\s/g, "")}`,
              stockQty: Math.floor(Math.random() * 40) + 8,
            },
          });
        }
      }

      // Reviews (2-4 per product)
      const reviewCount = 2 + Math.floor(Math.random() * 3);
      for (let r = 0; r < reviewCount; r++) {
        const rv = reviewSeeds[(productIndex + r) % reviewSeeds.length];
        await db.review.create({
          data: {
            productId: product.id,
            authorName: rv.author,
            authorCity: rv.city,
            rating: rv.rating,
            title: rv.title,
            body: rv.body,
            status: "approved",
            verified: rv.verified,
            featured: rv.featured && r === 0,
            helpfulCount: Math.floor(Math.random() * 30),
          },
        });
      }

      // Update category count
      await db.category.update({ where: { id: categoryId }, data: { productCount: { increment: 1 } } });
    }
  }

  console.log("Creating testimonials...");
  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }

  console.log("Creating FAQs...");
  for (const f of faqs) {
    await db.faq.create({ data: { question: f.question, answer: f.answer, category: f.category, sortOrder: f.order } });
  }

  console.log("Creating coupons...");
  for (const c of coupons) {
    await db.coupon.create({ data: c });
  }

  console.log("Creating sample customers...");
  const customerIds: string[] = [];
  for (const name of customerNames) {
    const c = await db.customer.create({
      data: {
        name,
        phone: randPhone(),
        email: name.toLowerCase().replace(/\s+/g, ".") + "@gmail.com",
        city: cities[Math.floor(Math.random() * cities.length)],
        totalOrders: 1 + Math.floor(Math.random() * 8),
        totalSpent: 2000 + Math.floor(Math.random() * 45000),
        segment: Math.random() > 0.7 ? "vip" : Math.random() > 0.85 ? "bridal_lead" : "regular",
      },
    });
    customerIds.push(c.id);
  }

  console.log("Creating sample orders...");
  const orderStatuses = ["delivered", "delivered", "delivered", "shipped", "confirmed", "pending", "out_for_delivery", "cancelled"];
  const paymentMethods = ["cod", "upi", "card", "upi"];
  for (let i = 0; i < 24; i++) {
    const custName = customerNames[i % customerNames.length];
    const city = cities[i % cities.length];
    const status = orderStatuses[i % orderStatuses.length];
    const pay = paymentMethods[i % paymentMethods.length];
    const subtotal = 1500 + Math.floor(Math.random() * 30000);
    const discount = Math.random() > 0.6 ? Math.floor(subtotal * 0.1) : 0;
    const shipping = subtotal > 999 ? 0 : 60;
    const cod = pay === "cod" ? 40 : 0;
    const grand = subtotal - discount + shipping + cod;
    const daysAgo = Math.floor(Math.random() * 30);
    const created = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const orderNum = `NTX${created.getFullYear()}${String(1000 + i).padStart(4, "0")}`;

    await db.order.create({
      data: {
        orderNumber: orderNum,
        customerName: custName,
        customerPhone: randPhone(),
        customerEmail: custName.toLowerCase().replace(/\s+/g, ".") + "@gmail.com",
        shippingAddress: JSON.stringify({ name: custName, line1: `${10 + i} ${city === "Chennai" ? "T Nagar" : "Gandhi Road"}`, city, state: "Tamil Nadu", pincode: `6000${10 + i}`, phone: randPhone() }),
        items: JSON.stringify([{ title: "Soft Silk Saree", variant: "Peacock Blue", qty: 1, price: subtotal, image: IMG.softSilk[0] }]),
        status,
        paymentStatus: status === "delivered" ? "paid" : status === "cancelled" ? "failed" : "pending",
        paymentMethod: pay,
        subtotal,
        discount,
        shippingFee: shipping,
        codSurcharge: cod,
        tax: 0,
        grandTotal: grand,
        couponCode: discount > 0 ? "WELCOME10" : null,
        courier: JSON.stringify(status === "delivered" || status === "shipped" || status === "out_for_delivery" ? { name: "Delhivery", awb: `DLV${Date.now()}${i}`, trackingUrl: "https://delhivery.com/track" } : {}),
        timeline: JSON.stringify([{ status: "pending", timestamp: created.toISOString(), note: "Order placed" }, ...(status !== "pending" ? [{ status: "confirmed", timestamp: new Date(created.getTime() + 3600000).toISOString(), note: "Order confirmed" }] : []), ...(status === "delivered" || status === "shipped" || status === "out_for_delivery" ? [{ status: "shipped", timestamp: new Date(created.getTime() + 86400000).toISOString(), note: "Dispatched via Delhivery" }] : []), ...(status === "delivered" ? [{ status: "delivered", timestamp: new Date(created.getTime() + 259200000).toISOString(), note: "Delivered" }] : [])]),
        createdAt: created,
      },
    });
  }

  console.log("Creating newsletter subscribers...");
  for (const name of ["anitha.r", "meena.k", "deepa.s", "kavi.m"]) {
    await db.newsletterSubscriber.create({ data: { email: name + "@gmail.com" } });
  }

  console.log("Seed complete!");
  const counts = {
    categories: await db.category.count(),
    products: await db.product.count(),
    variants: await db.variant.count(),
    reviews: await db.review.count(),
    testimonials: await db.testimonial.count(),
    faqs: await db.faq.count(),
    coupons: await db.coupon.count(),
    orders: await db.order.count(),
    customers: await db.customer.count(),
  };
  console.log(counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
