/**
 * MSG91 integration — India-focused SMS provider.
 *
 * Free tier: 130 SMS credits on signup. Set up at https://msg91.com.
 *
 * Use cases:
 * - Order confirmation SMS (auto-sent on order placement)
 * - Shipping notification (auto-sent when AWB is generated)
 * - Out-for-delivery alert
 * - Delivery confirmation
 * - COD reminder
 *
 * Environment variables:
 * - MSG91_AUTH_KEY     — your MSG91 auth key (found in dashboard)
 * - MSG91_SENDER_ID    — 6-char sender ID (must be approved; e.g. "NDHTXT")
 * - MSG91_TEMPLATE_ID  — DLT-approved template ID (required for Indian numbers)
 *
 * Note: TRAI regulations require all marketing/transactional SMS to use a
 * DLT-approved template. Register your templates at https://msg91.com/dlt.
 */

export type MSG91Config = {
  authKey: string;
  senderId: string;
  templateId: string;
};

export function getMSG91Config(): MSG91Config | null {
  const authKey = process.env.MSG91_AUTH_KEY;
  const senderId = process.env.MSG91_SENDER_ID;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!authKey || !senderId || !templateId) return null;
  return { authKey, senderId, templateId };
}

export function isMSG91Configured(): boolean {
  return getMSG91Config() !== null;
}

export type SMSParams = {
  to: string;
  message: string;
  /** Variables for DLT template: { var1: "value1", var2: "value2" } */
  variables?: Record<string, string>;
};

const MSG91_API = "https://api.msg91.com/api/v5/flow";

/**
 * Send a transactional SMS via MSG91.
 * Returns true on success, false if not configured or failed.
 */
export async function sendSMS(params: SMSParams): Promise<boolean> {
  const cfg = getMSG91Config();
  if (!cfg) {
    console.warn("[sms] MSG91 not configured — skipping send to", params.to);
    return false;
  }

  // Normalize the recipient number (strip +91 prefix if present)
  let to = params.to.replace(/\D/g, "");
  if (to.startsWith("91") && to.length === 12) to = to.slice(2);
  if (to.length !== 10) {
    console.error("[sms] Invalid mobile number:", params.to);
    return false;
  }

  try {
    const body = {
      template_id: cfg.templateId,
      short_url: "0",
      recipients: [{ mobiles: to }],
      ...(cfg.senderId ? { sender: cfg.senderId } : {}),
      ...params.variables,
    };

    const res = await fetch(`${MSG91_API}/${cfg.templateId}`, {
      method: "POST",
      headers: {
        "authkey": cfg.authKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[sms] MSG91 send failed:", err);
      return false;
    }

    const data = await res.json() as { type: string; message: string };
    return data.type === "success";
  } catch (err) {
    console.error("[sms] MSG91 send error:", err);
    return false;
  }
}

// ============================================================================
// SMS templates — pre-formatted messages for common events
// ============================================================================

/**
 * Order confirmation SMS.
 * DLT template: "Dear {var1}, your order {var2} for Rs.{var3} is confirmed.
 * Track at {var4}. - Nandhini Tex"
 */
export function sendOrderConfirmationSMS(
  customerName: string,
  phone: string,
  orderNumber: string,
  total: number,
  trackingUrl: string,
): Promise<boolean> {
  return sendSMS({
    to: phone,
    message: "",
    variables: {
      var1: customerName.split(" ")[0],
      var2: orderNumber,
      var3: String(total),
      var4: trackingUrl,
    },
  });
}

/**
 * Shipping notification SMS.
 * DLT template: "Dear {var1}, your order {var2} has been shipped via {var3}.
 * AWB: {var4}. Track at {var5}. - Nandhini Tex"
 */
export function sendShippingSMS(
  customerName: string,
  phone: string,
  orderNumber: string,
  courierName: string,
  awb: string,
  trackingUrl: string,
): Promise<boolean> {
  return sendSMS({
    to: phone,
    message: "",
    variables: {
      var1: customerName.split(" ")[0],
      var2: orderNumber,
      var3: courierName,
      var4: awb,
      var5: trackingUrl,
    },
  });
}

/**
 * Delivery confirmation SMS.
 * DLT template: "Dear {var1}, your order {var2} has been delivered.
 * Thank you for shopping with Nandhini Tex!"
 */
export function sendDeliverySMS(
  customerName: string,
  phone: string,
  orderNumber: string,
): Promise<boolean> {
  return sendSMS({
    to: phone,
    message: "",
    variables: {
      var1: customerName.split(" ")[0],
      var2: orderNumber,
    },
  });
}
