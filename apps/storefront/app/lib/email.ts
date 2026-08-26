type ReceiptOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  customer: { name: string; email: string; phone: string };
  items: Array<{ qty: number; name: string; price: number }>;
  total: number;
};

type ReceiptSkipReason = "missing_config" | "missing_recipient" | "invalid_sender";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const esc = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char] ?? char));
const money = (value: number) => `P${value.toFixed(2)}`;

function rows(order: ReceiptOrder) {
  return order.items.map((item) => `<tr><td>${item.qty} × ${esc(item.name)}</td><td style="text-align:right">${money(item.price * item.qty)}</td></tr>`).join("");
}

function html(order: ReceiptOrder, audience: "business" | "customer") {
  const intro = audience === "business" ? `New Sew Lovely order from ${esc(order.customer.name)}.` : `Thank you for your Sew Lovely order, ${esc(order.customer.name)}.`;
  return `<div style="font-family:Arial,sans-serif;color:#321225;max-width:620px;margin:auto"><h1 style="font-family:Georgia,serif">Sew Lovely</h1><p>${intro}</p><div style="background:#fff6e8;padding:24px"><p><strong>Order ${esc(order.id)}</strong><br>Status: ${esc(order.status)}<br>Payment: ${esc(order.paymentStatus)}</p><table style="width:100%;border-collapse:collapse">${rows(order)}<tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${money(order.total)}</strong></td></tr></table>${audience === "business" ? `<p>Customer: ${esc(order.customer.name)}<br>Email: ${esc(order.customer.email)}<br>Phone: ${esc(order.customer.phone)}</p>` : `<p>We have received your order details. Please keep this email for your records.</p>`}</div></div>`;
}

function normalizeSender(raw: string | undefined) {
  const value = raw?.trim() ?? "";
  if (emailPattern.test(value)) return value;

  // Resend expects an email address, not a bare domain. Treat a bare verified
  // domain as the orders mailbox on that domain.
  if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(value)) {
    const normalized = `orders@${value}`;
    console.warn(`[Resend] RESEND_FROM_EMAIL must be an email address; using ${normalized}. Set the Worker secret explicitly to this value.`);
    return normalized;
  }

  return null;
}

export function getOrderReceiptPreview(order: ReceiptOrder) {
  return {
    business: { to: process.env.ORDER_RECEIPT_EMAIL?.trim() ?? "", subject: `New Sew Lovely order ${order.id}`, html: html(order, "business") },
    customer: { to: order.customer.email.trim().toLowerCase(), subject: `Your Sew Lovely order ${order.id}`, html: html(order, "customer") },
  };
}

async function sendResendEmail(input: { apiKey: string; from: string; to: string; subject: string; html: string; idempotencyKey: string }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${input.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": input.idempotencyKey },
    body: JSON.stringify({ from: input.from, to: input.to, subject: input.subject, html: input.html }),
  });
  const payload = await response.json().catch(() => null) as { id?: string; message?: string; name?: string } | null;
  if (!response.ok) throw new Error(`[Resend ${response.status}] ${payload?.message ?? `Receipt delivery failed (${response.status}).`}`);
  return payload?.id;
}

export async function sendOrderReceipts(order: ReceiptOrder) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = normalizeSender(process.env.RESEND_FROM_EMAIL);
  if (!apiKey || !from) return { skipped: true as const, reason: from ? "missing_config" as const : "invalid_sender" as const };

  const business = process.env.ORDER_RECEIPT_EMAIL?.trim();
  if (!business) return { skipped: true as const, reason: "missing_recipient" as const };

  const idempotencyKey = `sew-lovely-order-${order.id}`;
  const preview = getOrderReceiptPreview(order);
  const [internal, customer] = await Promise.all([
    sendResendEmail({ apiKey, from, to: preview.business.to, subject: preview.business.subject, html: preview.business.html, idempotencyKey: `${idempotencyKey}-business` }),
    sendResendEmail({ apiKey, from, to: preview.customer.to, subject: preview.customer.subject, html: preview.customer.html, idempotencyKey: `${idempotencyKey}-customer` }),
  ]);
  return { skipped: false as const, internalId: internal, customerId: customer };
}
