import { render } from "@react-email/render";
import { Resend } from "resend";
type ReceiptOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  customer: { name: string; email: string; phone: string };
  items: Array<{ qty: number; name: string; price: number }>;
  total: number;
};

const esc = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char] ?? char));
const money = (value: number) => `P${value.toFixed(2)}`;

function rows(order: ReceiptOrder) {
  return order.items.map((item) => `<tr><td>${item.qty} × ${esc(item.name)}</td><td style="text-align:right">${money(item.price * item.qty)}</td></tr>`).join("");
}

function html(order: ReceiptOrder, audience: "business" | "customer") {
  const intro = audience === "business" ? `New Sew Lovely order from ${esc(order.customer.name)}.` : `Thank you for your Sew Lovely order, ${esc(order.customer.name)}.`;
  return `<div style="font-family:Arial,sans-serif;color:#321225;max-width:620px;margin:auto"><h1 style="font-family:Georgia,serif">Sew Lovely</h1><p>${intro}</p><div style="background:#fff6e8;padding:24px"><p><strong>Order ${esc(order.id)}</strong><br>Status: ${esc(order.status)}<br>Payment: ${esc(order.paymentStatus)}</p><table style="width:100%;border-collapse:collapse">${rows(order)}<tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${money(order.total)}</strong></td></tr></table>${audience === "business" ? `<p>Customer: ${esc(order.customer.name)}<br>Email: ${esc(order.customer.email)}<br>Phone: ${esc(order.customer.phone)}</p>` : `<p>We have received your order details. Please keep this email for your records.</p>`}</div></div>`;
}

export function getOrderReceiptPreview(order: ReceiptOrder) {
  return {
    business: { to: process.env.ORDER_RECEIPT_EMAIL ?? "", subject: `New Sew Lovely order ${order.id}`, html: html(order, "business") },
    customer: { to: order.customer.email, subject: `Your Sew Lovely order ${order.id}`, html: html(order, "customer") },
  };
}

async function renderCustomerHtml(order: ReceiptOrder) {
  const { default: CustomerOrderConfirmation } = await import("../../emails/customer-order-confirmation");
  return render(CustomerOrderConfirmation({ orderId: order.id, customerName: order.customer.name, status: order.status, paymentStatus: order.paymentStatus, total: order.total, items: order.items }));
}

export async function sendOrderReceipts(order: ReceiptOrder) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return { skipped: true as const, reason: "missing_config" as const };
  const business = process.env.ORDER_RECEIPT_EMAIL;
  if (!business) return { skipped: true as const, reason: "missing_recipient" as const };
  const resend = new Resend(process.env.RESEND_API_KEY);
  const idempotencyKey = `sew-lovely-order-${order.id}`;
  const preview = getOrderReceiptPreview(order);
  const customerHtml = await renderCustomerHtml(order);
  const [internal, customer] = await Promise.all([
    resend.emails.send({ from: process.env.RESEND_FROM_EMAIL, to: preview.business.to, subject: preview.business.subject, html: preview.business.html, headers: { "Idempotency-Key": `${idempotencyKey}-business` } }),
    resend.emails.send({ from: process.env.RESEND_FROM_EMAIL, to: preview.customer.to, subject: preview.customer.subject, html: customerHtml, headers: { "Idempotency-Key": `${idempotencyKey}-customer` } }),
  ]);
  if (internal.error || customer.error) throw new Error(internal.error?.message ?? customer.error?.message ?? "Receipt delivery failed.");
  return { skipped: false as const, internalId: internal.data?.id, customerId: customer.data?.id };
}
