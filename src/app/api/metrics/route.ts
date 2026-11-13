import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/metrics — Business and operational metrics
export async function GET() {
  const startTime = Date.now();

  const [
    totalProducts,
    totalVariants,
    totalCategories,
    totalOrders,
    totalCustomers,
    totalReviews,
    pendingReviews,
    totalCoupons,
    activeCoupons,
    newsletterSubscribers,
    totalTestimonials,
    totalFaqs,
    orderStatusBreakdown,
    paymentMethodBreakdown,
    revenueAgg,
    lowStockVariants,
    outOfStockVariants,
    totalStockUnits,
  ] = await Promise.all([
    db.product.count(),
    db.variant.count(),
    db.category.count(),
    db.order.count(),
    db.customer.count(),
    db.review.count(),
    db.review.count({ where: { status: "pending" } }),
    db.coupon.count(),
    db.coupon.count({ where: { active: true } }),
    db.newsletterSubscriber.count(),
    db.testimonial.count(),
    db.faq.count(),
    db.order.groupBy({ by: ["status"], _count: true }),
    db.order.groupBy({ by: ["paymentMethod"], _count: true }),
    db.order.aggregate({ _sum: { grandTotal: true }, _avg: { grandTotal: true } }),
    db.variant.count({ where: { stockQty: { lt: 5, gt: 0 } } }),
    db.variant.count({ where: { stockQty: 0 } }),
    db.variant.aggregate({ _sum: { stockQty: true } }),
  ]);

  const metrics = {
    timestamp: new Date().toISOString(),
    responseMs: Date.now() - startTime,
    catalog: {
      products: totalProducts,
      variants: totalVariants,
      categories: totalCategories,
      publishedProducts: totalProducts, // all are published in seed
    },
    orders: {
      total: totalOrders,
      byStatus: orderStatusBreakdown.reduce((acc, s) => {
        acc[s.status] = s._count;
        return acc;
      }, {} as Record<string, number>),
      byPaymentMethod: paymentMethodBreakdown.reduce((acc, p) => {
        acc[p.paymentMethod] = p._count;
        return acc;
      }, {} as Record<string, number>),
    },
    revenue: {
      total: revenueAgg._sum.grandTotal || 0,
      averageOrderValue: Math.round(revenueAgg._avg.grandTotal || 0),
    },
    customers: {
      total: totalCustomers,
    },
    reviews: {
      total: totalReviews,
      pending: pendingReviews,
    },
    marketing: {
      coupons: { total: totalCoupons, active: activeCoupons },
      newsletterSubscribers,
      testimonials: totalTestimonials,
    },
    inventory: {
      totalVariants,
      totalUnits: totalStockUnits._sum.stockQty || 0,
      lowStock: lowStockVariants,
      outOfStock: outOfStockVariants,
      healthScore: totalVariants > 0
        ? Math.round(((totalVariants - outOfStockVariants) / totalVariants) * 100)
        : 100,
    },
    content: {
      faqs: totalFaqs,
    },
  };

  return NextResponse.json(metrics, {
    headers: { "Cache-Control": "no-store" },
  });
}
