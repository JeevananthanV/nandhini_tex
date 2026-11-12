import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") || "";
  const search = searchParams.get("q") || "";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [{ orderNumber: { contains: search } }, { customerName: { contains: search } }, { customerPhone: { contains: search } }];
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      ...o,
      items: JSON.parse(o.items),
      shippingAddress: JSON.parse(o.shippingAddress),
      courier: JSON.parse(o.courier),
      timeline: JSON.parse(o.timeline),
    })),
  });
}
