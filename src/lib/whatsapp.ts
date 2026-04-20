import type { CartItem } from '../CartContext';

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  pincode: string;
}

/**
 * Builds a WhatsApp message URL pre-filled with the full order details.
 * The customer's WhatsApp will open directly to the seller's chat with the message ready to send.
 */
export function buildWhatsAppOrderUrl(customer: CustomerInfo, items: CartItem[], total: number): string {
  const ownerNumber = import.meta.env.VITE_OWNER_WHATSAPP || '919999999999';

  // Build the item list
  const itemLines = items
    .map((item) => `  • ${item.name} × ${item.quantity}  → ₹${item.price * item.quantity}`)
    .join('\n');

  const message = `🥭 *NEW MANGO ORDER!*

👤 *Customer:* ${customer.name}
📱 *Phone:* ${customer.phone}
📍 *Address:* ${customer.address}, ${customer.pincode}

🛒 *Order Details:*
${itemLines}

💰 *Total: ₹${total}*

Please confirm delivery at the earliest. Thank you!`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${ownerNumber}?text=${encoded}`;
}

/** Opens the WhatsApp order message in a new tab */
export function sendWhatsAppOrder(customer: CustomerInfo, items: CartItem[], total: number): void {
  const url = buildWhatsAppOrderUrl(customer, items, total);
  window.open(url, '_blank', 'noopener,noreferrer');
}
