/**
 * Shiprocket integration — India's leading shipping aggregator.
 *
 * Aggregates Delhivery, DTDC, India Post, BlueDart, Xpressbees, etc. into a
 * single API. Set up at https://app.shiprocket.in.
 *
 * Features:
 * - Create shipments (auto-assigns AWB + courier partner)
 * - Track shipments by AWB
 * - Pickup scheduling
 * - Print labels + invoices
 *
 * Environment variables:
 * - SHIPROCKET_EMAIL    — your Shiprocket account email
 * - SHIPROCKET_PASSWORD — your Shiprocket account password
 *   (Shiprocket uses email+password auth, not API keys — we cache the token)
 *
 * Note: For production, create a dedicated "API user" in Shiprocket rather
 * than using your main account credentials.
 */

export type ShiprocketToken = {
  token: string;
  expiresAt: number; // epoch ms
};

let cachedToken: ShiprocketToken | null = null;

const SHIPROCKET_API = process.env.SHIPROCKET_SANDBOX === "true"
  ? "https://apiv2.shiprocket.in/v1"
  : "https://apiv2.shiprocket.in/v1";

export type ShiprocketConfig = {
  email: string;
  password: string;
};

export function getShiprocketConfig(): ShiprocketConfig | null {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

export function isShiprocketConfigured(): boolean {
  return getShiprocketConfig() !== null;
}

/** Get a valid Shiprocket auth token (caches + auto-refreshes). */
export async function getShiprocketToken(): Promise<string> {
  const cfg = getShiprocketConfig();
  if (!cfg) throw new Error("Shiprocket not configured — set SHIPROCKET_EMAIL + SHIPROCKET_PASSWORD");

  // Return cached token if still valid (with 5min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const res = await fetch(`${SHIPROCKET_API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: cfg.email, password: cfg.password }),
  });

  if (!res.ok) {
    throw new Error(`Shiprocket auth failed: ${await res.text()}`);
  }

  const data = await res.json() as { token: string };
  // Shiprocket tokens are JWTs valid for ~10 days; we cache for 7 to be safe
  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  return data.token;
}

export type ShiprocketShipmentRequest = {
  orderId: string;
  orderDate: string;
  pickupLocation: string;
  billing: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email?: string;
  };
  shipping: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items: Array<{
    name: string;
    sku: string;
    units: number;
    sellingPrice: number;
    discount?: number;
    hsn?: string;
  }>;
  paymentMethod: "prepaid" | "cod";
  subTotal: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  weightKg: number;
};

export type ShiprocketShipmentResponse = {
  shipment_id: string;
  order_id: string;
  status: string;
  awb_code?: string;
  courier_company_id?: string;
  courier_name?: string;
  label_url?: string;
};

/**
 * Create a shipment in Shiprocket — auto-assigns AWB + courier partner.
 * Called by the admin when an order moves to "confirmed" status.
 */
export async function createShiprocketShipment(
  req: ShiprocketShipmentRequest,
): Promise<ShiprocketShipmentResponse> {
  const token = await getShiprocketToken();
  const res = await fetch(`${SHIPROCKET_API}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Shiprocket create failed: ${await res.text()}`);
  return await res.json();
}

export type ShiprocketTrackingResponse = {
  tracking_data: {
    track_status: string;
    current_status: string;
    current_status_time: string;
    awb_code: string;
    courier_name: string;
    edd?: string;
    track_history: Array<{
      status: string;
      status_date: string;
      status_time: string;
      location: string;
      sr_instructions?: string;
    }>;
  };
};

/**
 * Track a shipment by AWB code.
 * Called by the public order-tracking endpoint to show live status.
 */
export async function trackShiprocketShipment(awb: string): Promise<ShiprocketTrackingResponse | null> {
  try {
    const token = await getShiprocketToken();
    const res = await fetch(`${SHIPROCKET_API}/courier/track/awb/${awb}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
