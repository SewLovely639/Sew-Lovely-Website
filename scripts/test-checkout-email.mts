import { readFile } from "node:fs/promises";

const env = await readFile("apps/storefront/.env.local", "utf8");
for (const line of env.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const receiptEmail = process.env.MOCK_TEST_RECIPIENT || process.env.ORDER_RECEIPT_EMAIL || "";
if (process.argv.includes("--send") && process.env.MOCK_TEST_RECIPIENT) process.env.ORDER_RECEIPT_EMAIL = process.env.MOCK_TEST_RECIPIENT;
const { getOrderReceiptPreview, sendOrderReceipts } = await import("../apps/storefront/app/lib/email.ts");
const mockOrder = {
  id: "SL-MOCK-EMAIL-001",
  status: "awaiting_payment",
  paymentStatus: "pending",
  customer: { name: "Sew Lovely Test Customer", email: receiptEmail, phone: "+267 000 0000" },
  items: [{ qty: 1, name: "Mock Burgundy Festive Kurta", price: 899 }],
  total: 899,
};

const preview = getOrderReceiptPreview(mockOrder);
console.log("[checkout-email] mock order:", mockOrder.id);
console.log("[checkout-email] business recipient:", preview.business.to);
console.log("[checkout-email] customer recipient:", preview.customer.to);
console.log("[checkout-email] business subject:", preview.business.subject);
console.log("[checkout-email] customer subject:", preview.customer.subject);
console.log("[checkout-email] html bytes:", preview.business.html.length, preview.customer.html.length);

if (process.argv.includes("--send")) {
  if (!receiptEmail) throw new Error("ORDER_RECEIPT_EMAIL is required for --send");
  const result = await sendOrderReceipts(mockOrder);
  console.log("[checkout-email] Resend result:", result);
} else {
  console.log("[checkout-email] dry run only; no email was sent. Use --send to send both mock messages to the configured receipt address.");
}
