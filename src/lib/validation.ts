import { z } from "zod";

/**
 * Zod schemas for API request validation.
 *
 * Usage:
 *   const result = schema.safeParse(body);
 *   if (!result.success) return 400 with formatted errors;
 *   const data = result.data;  // typed
 */

// ============================================================================
// Public endpoints
// ============================================================================

export const placeOrderSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile").max(10),
  customerEmail: z.string().email().max(200).optional().or(z.literal("")),
  shippingAddress: z.object({
    name: z.string().min(2).max(120).optional(),
    phone: z.string().max(20).optional(),
    line1: z.string().min(5).max(300),
    line2: z.string().max(300).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100).default("Tamil Nadu"),
    pincode: z.string().regex(/^\d{6}$/, "Must be 6-digit pincode"),
  }),
  items: z.array(z.object({
    title: z.string().min(2).max(300),
    variant: z.string().max(100).optional(),
    qty: z.number().int().min(1).max(99),
    price: z.number().min(0).max(1_000_000),  // client-supplied, will be RE-COMPUTED server-side
    image: z.string().url().max(2000).optional(),
    slug: z.string().max(200).optional(),
    productId: z.string().max(100).optional(),
  })).min(1).max(50),
  paymentMethod: z.enum(["cod", "upi", "card", "netbanking"]).default("cod"),
  couponCode: z.string().max(50).optional(),
  // subtotal/discount/shippingFee/codSurcharge/grandTotal are IGNORED from the
  // client — server recomputes from DB product prices. They remain in the
  // schema for backward compatibility with the existing frontend, but we
  // override them.
  subtotal: z.number().optional(),
  discount: z.number().optional(),
  shippingFee: z.number().optional(),
  codSurcharge: z.number().optional(),
  grandTotal: z.number().optional(),
});

export const submitReviewSchema = z.object({
  productId: z.string().min(1).max(100),
  authorName: z.string().min(2).max(80),
  authorCity: z.string().max(100).optional().or(z.literal("")),
  authorEmail: z.string().email().max(200).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(200),
  body: z.string().min(10).max(5000),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1).max(50),
  cartValue: z.number().min(0).max(10_000_000),
});

export const newsletterSchema = z.object({
  email: z.string().email().max(200),
});

// ============================================================================
// Admin endpoints
// ============================================================================

export const orderStatusEnum = z.enum([
  "pending", "confirmed", "packed", "shipped", "out_for_delivery",
  "delivered", "cancelled", "returned", "refunded",
]);

export const paymentStatusEnum = z.enum([
  "pending", "paid", "failed", "refunded",
]);

export const paymentMethodEnum = z.enum([
  "cod", "upi", "card", "netbanking",
]);

export const updateOrderSchema = z.object({
  status: orderStatusEnum.optional(),
  paymentStatus: paymentStatusEnum.optional(),
  note: z.string().max(500).optional(),
});

export const couponTypeEnum = z.enum(["percent", "flat"]);

export const createCouponSchema = z.object({
  code: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  type: couponTypeEnum,
  value: z.number().min(0).max(100),  // percent 0-100 or flat INR
  minCartValue: z.number().min(0).max(1_000_000).default(0),
  usageLimit: z.number().int().min(0).max(1_000_000).default(0),
  perUserLimit: z.number().int().min(0).max(1000).default(1),
  active: z.boolean().default(true),
  expiresAt: z.string().datetime().optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const inventoryActionEnum = z.enum(["set", "add", "subtract"]);

export const updateInventorySchema = z.object({
  stockQty: z.number().int().min(0).max(1_000_000),
  action: inventoryActionEnum.default("set"),
});

export const bulkInventorySchema = z.object({
  updates: z.array(z.object({
    id: z.string().min(1).max(100),
    stockQty: z.number().int().min(0).max(1_000_000),
    action: inventoryActionEnum.default("set"),
  })).min(1).max(500),
});

export const createFaqSchema = z.object({
  question: z.string().min(5).max(500),
  answer: z.string().min(5).max(5000),
  category: z.string().max(100).default("General"),
  sortOrder: z.number().int().min(-1000).max(1000).default(0),
});

export const updateFaqSchema = createFaqSchema.partial();

export const createTestimonialSchema = z.object({
  name: z.string().min(2).max(120),
  city: z.string().max(100).optional(),
  quote: z.string().min(5).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
  featured: z.boolean().default(false),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export const reviewStatusEnum = z.enum(["pending", "approved", "rejected"]);

export const updateReviewSchema = z.object({
  status: reviewStatusEnum.optional(),
  featured: z.boolean().optional(),
  helpfulCount: z.number().int().min(0).max(1_000_000).optional(),
});

/** Format Zod errors into a friendly { field: message } object. */
export function formatZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
