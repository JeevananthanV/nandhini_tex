import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [totalRevenue, totalOrders, totalProducts, totalCustomers, pendingReviews, lowStockVariants, recentOrders, topProducts] = await Promise.all([
    db.order.aggregate({ _sum: { grandTotal: true } }),
    db.order.count(),
    db.product.count(),
    db.customer.count(),
    db.review.count({ where: { status: "pending" } }),
    db.variant.count({ where: { stockQty: { lt: 5 } } }),
    db.order.findMany({ take: 6, orderBy: { createdAt: "desc" } }),
    db.product.findMany({ where: { isBestseller: true }, take: 5, orderBy: { rating: "desc" } }),
  ]);

  // revenue + order count for last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentOrdersList = await db.order.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { grandTotal: true, createdAt: true, status: true, paymentMethod: true },
  });

  const days: { label: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const dayOrders = recentOrdersList.filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd);
    const label = dayStart.toLocaleDateString("en-IN", { weekday: "short" });
    days.push({
      label,
      revenue: dayOrders.reduce((s, o) => s + o.grandTotal, 0),
      orders: dayOrders.length,
    });
  }

  // status breakdown
  const statusCounts = await db.order.groupBy({ by: ["status"], _count: true });

  // payment method breakdown
  const paymentBreakdown = await db.order.groupBy({ by: ["paymentMethod"], _count: true });

  // category breakdown of products
  const categoryCounts = await db.product.groupBy({ by: ["categoryId"], _count: true });
  const categories = await db.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const categoryStats = categoryCounts.map((c) => ({ name: categoryMap.get(c.categoryId) || "—", count: c._count }));

  return NextResponse.json({
    summary: {
      totalRevenue: totalRevenue._sum.grandTotal || 0,
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingReviews,
      lowStockCount: lowStockVariants,
      avgOrderValue: totalOrders > 0 ? Math.round((totalRevenue._sum.grandTotal || 0) / totalOrders) : 0,
    },
    revenueChart: days,
    statusBreakdown: statusCounts,
    paymentBreakdown,
    categoryStats,
    recentOrders,
    topProducts: topProducts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.basePrice,
      rating: p.rating,
      reviewCount: p.reviewCount,
      images: JSON.parse(p.images || "[]"),
    })),
  });
}
