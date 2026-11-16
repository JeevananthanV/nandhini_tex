import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { isShiprocketConfigured, createShiprocketShipment, type ShiprocketShipmentRequest } from "@/lib/integrations/shiprocket";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/orders/[id]/ship
 *
 * Creates a Shiprocket shipment for an order — auto-assigns AWB + courier partner.
 *
 * Admin-only. Called when the admin moves an order from "confirmed" → "shipped".
 *
 * Flow:
 * 1. Verify admin session (middleware already does this, but double-check)
 * 2. Verify Shiprocket is configured
 * 3. Fetch the order from the DB
 * 4. Transform to Shiprocket's shipment format
 * 5. Call createShiprocketShipment()
 * 6. Save the AWB + courier info to the order
 * 7. Update timeline + order status → "shipped"
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Double-check admin session (middleware already enforces this)
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;
  if (!/^[a-z0-9]{1,50}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  // Check Shiprocket is configured
  if (!isShiprocketConfigured()) {
    return NextResponse.json(
      { error: "Shipping integration not configured — set SHIPROCKET_EMAIL + SHIPROCKET_PASSWORD", code: "SHIPPING_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  // Fetch the order
  const order = await db.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Only ship confirmed orders
  if (order.status !== "confirmed" && order.status !== "packed") {
    return NextResponse.json(
      { error: `Cannot ship order with status "${order.status}" — must be "confirmed" or "packed"`, code: "INVALID_STATUS" },
      { status: 409 }
    );
  }

  // Parse stored JSON fields
  let items: Array<{ title: string; variant?: string; qty: number; price: number; image?: string }> = [];
  let address: { name?: string; phone?: string; line1?: string; line2?: string; city?: string; state?: string; pincode?: string; email?: string } = {};
  let timeline: Array<{ status: string; timestamp: string; note: string }> = [];
  try { items = JSON.parse(order.items); } catch { /* ignore */ }
  try { address = JSON.parse(order.shippingAddress); } catch { /* ignore */ }
  try { timeline = JSON.parse(order.timeline); } catch { /* ignore */ }

  // Build the Shiprocket shipment request
  const shipmentReq: ShiprocketShipmentRequest = {
    orderId: order.orderNumber,
    orderDate: order.createdAt.toISOString().split("T")[0],
    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    billing: {
      name: order.customerName,
      address: address.line1 || "N/A",
      city: address.city || "N/A",
      state: address.state || "Tamil Nadu",
      pincode: address.pincode || "000000",
      phone: order.customerPhone,
      email: order.customerEmail || undefined,
    },
    shipping: {
      name: address.name || order.customerName,
      address: address.line1 || "N/A",
      city: address.city || "N/A",
      state: address.state || "Tamil Nadu",
      pincode: address.pincode || "000000",
      phone: order.customerPhone,
    },
    items: items.map((item, i) => ({
      name: item.title,
      sku: `SKU-${order.orderNumber}-${i + 1}`,
      units: item.qty,
      sellingPrice: item.price,
      hsn: "5407" as const, // HSN code for woven fabrics (silk sarees)
    })),
    paymentMethod: order.paymentMethod === "cod" ? "cod" as const : "prepaid" as const,
    subTotal: order.subtotal,
    // Saree package dimensions (approx)
    lengthCm: 30,
    breadthCm: 25,
    heightCm: 5,
    weightKg: 0.5, // 500g per saree
  };

  try {
    const shipment = await createShiprocketShipment(shipmentReq);

    // Add timeline entry
    timeline.push({
      status: "shipped",
      timestamp: new Date().toISOString(),
      note: `Shipped via ${shipment.courier_name || "courier"} — AWB: ${shipment.awb_code || "N/A"}`,
    });

    // Update the order with shipment info
    const updated = await db.order.update({
      where: { id },
      data: {
        status: "shipped",
        timeline: JSON.stringify(timeline),
        courier: JSON.stringify({
          name: shipment.courier_name || "Shiprocket",
          awb: shipment.awb_code || "",
          trackingUrl: shipment.awb_code
            ? `https://www.shiprocket.in/tracking/${shipment.awb_code}`
            : "",
          shipmentId: shipment.shipment_id,
          labelUrl: shipment.label_url,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      shipment: {
        shipmentId: shipment.shipment_id,
        awb: shipment.awb_code,
        courier: shipment.courier_name,
        labelUrl: shipment.label_url,
        trackingUrl: shipment.awb_code
          ? `https://www.shiprocket.in/tracking/${shipment.awb_code}`
          : null,
      },
      order: { id: updated.id, status: updated.status },
    });
  } catch (err) {
    console.error("[shipping] Shiprocket shipment creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create shipment — check Shiprocket credentials", code: "SHIPMENT_FAILED" },
      { status: 502 }
    );
  }
}
