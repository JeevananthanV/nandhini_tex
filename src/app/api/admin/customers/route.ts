import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const segment = searchParams.get("segment") || "";
  const where: Record<string, unknown> = {};
  if (segment && segment !== "all") where.segment = segment;
  const customers = await db.customer.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ customers });
}
