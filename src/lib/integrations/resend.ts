/**
 * Resend integration — modern email API for transactional emails.
 *
 * Free tier: 3,000 emails/month, 100/day. Set up at https://resend.com.
 *
 * Use cases:
 * - Order confirmation emails
 * - Shipping notification emails
 * - Welcome / newsletter emails
 * - Admin alerts (low stock, new order)
 *
 * Environment variables:
 * - RESEND_API_KEY        — starts with `re_`
 * - RESEND_FROM_EMAIL     — sender address (must be verified in Resend dashboard)
 *                           On free tier, you can only send FROM onboarding@resend.dev
 *                           After verifying your domain, use noreply@yourdomain.com
 * - RESEND_REPLY_TO       — optional reply-to address (defaults to support email)
 */

export type ResendConfig = {
  apiKey: string;
  fromEmail: string;
  replyTo?: string;
};

export function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  if (!apiKey) return null;
  return {
    apiKey,
    fromEmail,
    replyTo: process.env.RESEND_REPLY_TO,
  };
}

export function isResendConfigured(): boolean {
  return getResendConfig() !== null;
}

export type EmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
};

/**
 * Send an email via Resend.
 * Returns the email ID on success, or null if not configured / failed.
 */
export async function sendEmail(params: EmailParams): Promise<string | null> {
  const cfg = getResendConfig();
  if (!cfg) {
    console.warn("[email] Resend not configured — skipping send to", params.to);
    return null;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: cfg.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: params.replyTo || cfg.replyTo,
        tags: params.tags,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[email] Resend send failed:", err);
      return null;
    }

    const data = await res.json() as { id: string };
    return data.id;
  } catch (err) {
    console.error("[email] Resend send error:", err);
    return null;
  }
}

// ============================================================================
// Email templates — transactional emails for the saree store
// ============================================================================

export type OrderConfirmationEmail = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ title: string; qty: number; price: number; image?: string }>;
  subtotal: number;
  discount: number;
  shippingFee: number;
  codSurcharge: number;
  grandTotal: number;
  paymentMethod: string;
  shippingAddress: { name: string; line1: string; city: string; state: string; pincode: string };
  estimatedDelivery: string;
};

/** Order confirmation email HTML template (Royal Heritage theme). */
export function renderOrderConfirmationEmail(d: OrderConfirmationEmail): string {
  const itemsHtml = d.items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #E7DFD5;">
        ${item.image ? `<img src="${item.image}" width="60" height="75" style="vertical-align:middle;border-radius:4px;margin-right:12px;" alt="" />` : ""}
        <span style="font-family:Georgia,serif;font-size:14px;color:#081B3A;">${item.title}</span>
        <br><span style="font-size:12px;color:#8B7E74;">Qty: ${item.qty} · ₹${item.price.toLocaleString("en-IN")}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #E7DFD5;text-align:right;font-weight:600;color:#081B3A;">
        ₹${(item.price * item.qty).toLocaleString("en-IN")}
      </td>
    </tr>
  `).join("");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nandhinitex.com";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF7F0;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:8px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#081B3A,#0A1F44);padding:32px 40px;text-align:center;">
      <div style="font-family:Cinzel,Georgia,serif;font-size:28px;font-weight:700;color:#D4AF37;letter-spacing:2px;">NANDHINI TEX</div>
      <div style="color:#D4AF37;font-size:11px;letter-spacing:3px;margin-top:4px;">ROYAL HERITAGE</div>
    </div>
    <div style="padding:32px 40px;">
      <h1 style="font-family:Playfair Display,Georgia,serif;color:#081B3A;margin:0 0 8px;font-size:22px;">Order Confirmed!</h1>
      <p style="color:#8B7E74;margin:0 0 24px;font-size:14px;">Namaste ${d.customerName}, thank you for your order.</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="color:#8B7E74;font-size:12px;padding:4px 0;">Order Number</td><td style="text-align:right;font-weight:600;color:#081B3A;font-family:monospace;font-size:13px;">${d.orderId}</td></tr>
        <tr><td style="color:#8B7E74;font-size:12px;padding:4px 0;">Payment Method</td><td style="text-align:right;color:#081B3A;font-size:13px;text-transform:uppercase;">${d.paymentMethod}</td></tr>
        <tr><td style="color:#8B7E74;font-size:12px;padding:4px 0;">Estimated Delivery</td><td style="text-align:right;color:#081B3A;font-size:13px;">${d.estimatedDelivery}</td></tr>
      </table>
      <h2 style="font-family:Playfair Display,Georgia,serif;color:#081B3A;font-size:16px;margin:24px 0 12px;">Order Summary</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${itemsHtml}
      </table>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="color:#8B7E74;font-size:13px;padding:4px 0;">Subtotal</td><td style="text-align:right;color:#081B3A;">₹${d.subtotal.toLocaleString("en-IN")}</td></tr>
        ${d.discount > 0 ? `<tr><td style="color:#8B7E74;font-size:13px;padding:4px 0;">Discount</td><td style="text-align:right;color:#16a34a;">−₹${d.discount.toLocaleString("en-IN")}</td></tr>` : ""}
        <tr><td style="color:#8B7E74;font-size:13px;padding:4px 0;">Shipping</td><td style="text-align:right;color:#081B3A;">${d.shippingFee === 0 ? "FREE" : "₹" + d.shippingFee.toLocaleString("en-IN")}</td></tr>
        ${d.codSurcharge > 0 ? `<tr><td style="color:#8B7E74;font-size:13px;padding:4px 0;">COD Charges</td><td style="text-align:right;color:#081B3A;">₹${d.codSurcharge.toLocaleString("en-IN")}</td></tr>` : ""}
        <tr><td style="border-top:2px solid #D4AF37;padding:12px 0;font-weight:700;color:#081B3A;font-size:16px;">Total</td><td style="border-top:2px solid #D4AF37;text-align:right;font-weight:700;color:#081B3A;font-size:16px;">₹${d.grandTotal.toLocaleString("en-IN")}</td></tr>
      </table>
      <div style="background:#FAF7F0;border-radius:8px;padding:16px;margin-top:24px;">
        <p style="margin:0 0 4px;font-weight:600;color:#081B3A;font-size:13px;">Shipping to:</p>
        <p style="margin:0;color:#8B7E74;font-size:13px;line-height:1.5;">
          ${d.shippingAddress.name}<br>${d.shippingAddress.line1}<br>${d.shippingAddress.city}, ${d.shippingAddress.state} ${d.shippingAddress.pincode}
        </p>
      </div>
      <p style="color:#8B7E74;font-size:12px;line-height:1.6;margin-top:24px;">
        Questions? Reply to this email or call us at +91 76048 11838 (Mon–Sat, 10am–7pm IST).
        Track your order at <a href="${siteUrl}" style="color:#D4AF37;">${siteUrl}</a>.
      </p>
    </div>
    <div style="background:#FAF7F0;padding:16px 40px;text-align:center;">
      <p style="color:#8B7E74;font-size:11px;margin:0;">© ${new Date().getFullYear()} Nandhini Tex Handlooms · Elampillai, Tamil Nadu, India</p>
    </div>
  </div>
</body>
</html>`;
}
