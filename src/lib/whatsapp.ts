// WhatsApp commerce utilities — bridges Instagram-to-WhatsApp buying model

const WHATSAPP_NUMBER = "917604811838"; // +91 76048 11838

export type WhatsAppOrderItem = {
  title: string;
  sku?: string;
  price: number;
  color?: string;
  size?: string | null;
  qty?: number;
};

// Build a pre-filled WhatsApp message for a single product order
export function buildWhatsAppProductMessage(item: WhatsAppOrderItem): string {
  const lines = [
    "Namaste Nandhini Tex! 🙏",
    "",
    "I'd like to order this saree:",
    "",
    `🥻 *${item.title}*`,
  ];
  if (item.sku) lines.push(`SKU: ${item.sku}`);
  if (item.color) lines.push(`Color: ${item.color}`);
  if (item.size) lines.push(`Size: ${item.size}`);
  lines.push(`💰 Price: ₹${item.price.toLocaleString("en-IN")}`);
  if (item.qty && item.qty > 1) lines.push(`Quantity: ${item.qty}`);
  lines.push("", "Is this available? Please confirm and I'll proceed with payment.");
  return lines.join("\n");
}

// Build a pre-filled WhatsApp message for cart checkout
export function buildWhatsAppCartMessage(items: WhatsAppOrderItem[], total: number): string {
  const lines = [
    "Namaste Nandhini Tex! 🙏",
    "",
    "I'd like to place an order:",
    "",
  ];
  items.forEach((item, i) => {
    lines.push(`${i + 1}. *${item.title}*`);
    const details: string[] = [];
    if (item.color) details.push(`Color: ${item.color}`);
    if (item.size) details.push(`Size: ${item.size}`);
    details.push(`₹${item.price.toLocaleString("en-IN")}`);
    if (item.qty && item.qty > 1) details.push(`x${item.qty}`);
    lines.push(`   ${details.join(" · ")}`);
  });
  lines.push("", `*Total: ₹${total.toLocaleString("en-IN")}*`, "", "Please confirm availability and I'll pay via UPI/COD.");
  return lines.join("\n");
}

// Build a bulk inquiry message
export function buildWhatsAppBulkMessage(productTitle: string, quantity: number): string {
  return [
    "Namaste Nandhini Tex! 🙏",
    "",
    `I'm interested in a *bulk order* for:`,
    "",
    `🥻 *${productTitle}*`,
    `📦 Quantity needed: ${quantity}+ pieces`,
    "",
    "Could you share tiered pricing for this quantity?",
    "This is for: [event/resale/gift]",
  ].join("\n");
}

// Generate the wa.me URL with pre-filled message
export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Quick helper for a single product
export function getProductWhatsAppUrl(item: WhatsAppOrderItem): string {
  return getWhatsAppUrl(buildWhatsAppProductMessage(item));
}

// Quick helper for cart
export function getCartWhatsAppUrl(items: WhatsAppOrderItem[], total: number): string {
  return getWhatsAppUrl(buildWhatsAppCartMessage(items, total));
}

// Quick helper for bulk inquiry
export function getBulkWhatsAppUrl(productTitle: string, quantity: number): string {
  return getWhatsAppUrl(buildWhatsAppBulkMessage(productTitle, quantity));
}
