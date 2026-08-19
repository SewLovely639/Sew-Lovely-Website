import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { readContent } from "@sew-lovely/cms";
import { getSupabase } from "./supabase";

export type PaymentMethod = "cash_on_delivery" | "pay_in_store" | "bank_transfer" | "credit_debit_card";
export type OrderStatus = "awaiting_payment" | "paid" | "confirmed" | "failed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";
export type OrderItem = { id: string; name: string; price: number; image?: string; qty: number };
export type StoreOrder = {
  id: string; idempotencyKey: string; status: OrderStatus; paymentStatus: PaymentStatus;
  subtotal: number; shipping: number; tax: number; discount: number; total: number; items: OrderItem[];
  customer: { name: string; email: string; phone: string };
  payment: { method: PaymentMethod; provider?: string; providerReference?: string; reference?: string };
  delivery: { option: string; address?: string; city?: string; country?: string; notes?: string };
  createdAt: string; updatedAt: string;
};

type DbRow = Record<string, unknown>;
const number = (value: unknown) => Number(value ?? 0);
const object = <T>(value: unknown) => (value && typeof value === "object" ? value as T : {} as T);

function toOrder(row: DbRow, items: DbRow[] = []): StoreOrder {
  return {
    id: String(row.id), idempotencyKey: String(row.idempotency_key), status: row.status as OrderStatus, paymentStatus: row.payment_status as PaymentStatus,
    subtotal: number(row.subtotal), shipping: number(row.shipping), tax: number(row.tax), discount: number(row.discount), total: number(row.total),
    customer: { name: String(row.customer_name), email: String(row.customer_email), phone: String(row.customer_phone) },
    payment: object<StoreOrder["payment"]>(row.payment), delivery: object<StoreOrder["delivery"]>(row.delivery),
    items: items.map((item) => ({ id: String(item.product_id), name: String(item.name), price: number(item.price), image: item.image ? String(item.image) : undefined, qty: Number(item.quantity) })),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

async function fetchOrder(orderId: string) {
  const { data, error } = await getSupabase().from("orders").select("*, order_items(*)").eq("id", orderId).single();
  if (error || !data) throw new Error(error?.message ?? "Order not found.");
  const row = data as DbRow & { order_items?: DbRow[] };
  return toOrder(row, Array.isArray(row.order_items) ? row.order_items : []);
}

export async function priceCart(items: Array<{ id: string; qty: number }>) {
  const content = await readContent(); const byId = new Map(content.products.map((product) => [product.id, product])); const normalized = new Map<string, number>();
  for (const item of items) { if (!Number.isSafeInteger(item.qty) || item.qty < 1 || item.qty > 99) throw new Error("Invalid quantity."); normalized.set(item.id, (normalized.get(item.id) ?? 0) + item.qty); }
  if (!normalized.size || normalized.size > 50) throw new Error("Invalid cart.");
  const priced: OrderItem[] = [];
  for (const [id, qty] of normalized) { const product = byId.get(id); if (!product || !Number.isFinite(product.price) || product.price < 0) throw new Error("A product is no longer available."); priced.push({ id, name: product.name, image: product.images[0], price: product.price, qty }); }
  const subtotal = Number(priced.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)); return { items: priced, subtotal, shipping: 0, tax: 0, discount: 0, total: subtotal };
}

export async function createOrder(input: { idempotencyKey: string; items: Array<{ id: string; qty: number }>; customer: StoreOrder["customer"]; payment: { method: PaymentMethod; reference?: string }; delivery: StoreOrder["delivery"] }) {
  const priced = await priceCart(input.items); const now = new Date().toISOString();
  const order: StoreOrder = { ...priced, id: `SL-${randomBytes(5).toString("hex").toUpperCase()}`, idempotencyKey: input.idempotencyKey, status: "awaiting_payment", paymentStatus: "pending", customer: { ...input.customer, email: input.customer.email.toLowerCase() }, payment: input.payment, delivery: input.delivery, createdAt: now, updatedAt: now };
  const { data, error } = await getSupabase().rpc("create_storefront_order", { p_order: order, p_items: priced.items });
  if (error || !data) throw new Error(error?.message ?? "Unable to create order.");
  const result = data as { order: StoreOrder; created: boolean };
  return result;
}

export async function updatePayment(orderId: string, status: PaymentStatus, providerReference?: string) {
  const { error } = await getSupabase().rpc("update_order_payment", { p_order_id: orderId, p_status: status, p_provider_reference: providerReference ?? null });
  if (error) throw new Error(error.message);
  return fetchOrder(orderId);
}

export async function markEventProcessed(eventId: string) {
  const { data, error } = await getSupabase().rpc("mark_webhook_event_processed", { p_event_id: eventId });
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export function verifyWebhookSignature(payload: string, signature: string) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET; if (!secret || !signature) return false;
  if (signature.startsWith("t=")) {
    const parts = Object.fromEntries(signature.split(",").map((part) => part.split("=", 2))) as { t?: string; v1?: string };
    const timestamp = Number(parts.t); if (!Number.isSafeInteger(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300 || !parts.v1) return false;
    const expected = createHmac("sha256", secret).update(`${parts.t}.${payload}`).digest("hex");
    return parts.v1.length === expected.length && timingSafeEqual(Buffer.from(parts.v1), Buffer.from(expected));
  }
  const expected = createHmac("sha256", secret).update(payload).digest("hex"); const provided = signature.replace(/^sha256=/, "");
  return provided.length === expected.length && timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export function orderEmailBody(order: StoreOrder) { return [`Order: ${order.id}`, `Status: ${order.status}`, `Payment: ${order.paymentStatus}`, `Created: ${order.createdAt}`, "", "Customer", `Name: ${order.customer.name}`, `Email: ${order.customer.email}`, `Phone: ${order.customer.phone}`, "", "Items", ...order.items.map((item) => `${item.qty} x ${item.name} @ P${item.price.toFixed(2)}`), "", `Subtotal: P${order.subtotal.toFixed(2)}`, `Shipping: P${order.shipping.toFixed(2)}`, `Tax: P${order.tax.toFixed(2)}`, `Total: P${order.total.toFixed(2)}`].join("\n"); }
