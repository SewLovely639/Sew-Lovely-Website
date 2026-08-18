import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { readContent } from "@sew-lovely/cms";

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
type OrderFile = { orders: StoreOrder[]; processedEvents?: string[] };
let writeQueue = Promise.resolve();
let orderCreationQueue = Promise.resolve();

function root() { let current = process.cwd(); while (!existsSync(path.join(current, "pnpm-workspace.yaml"))) { const parent = path.dirname(current); if (parent === current) return process.cwd(); current = parent; } return current; }
function file() { return process.env.SEW_LOVELY_ORDERS_FILE || path.join(root(), "packages", "cms", "data", "orders.json"); }
async function read(): Promise<OrderFile> { try { const parsed = JSON.parse(await fs.readFile(file(), "utf8")) as Partial<OrderFile>; return { orders: Array.isArray(parsed.orders) ? parsed.orders : [], processedEvents: Array.isArray(parsed.processedEvents) ? parsed.processedEvents : [] }; } catch { return { orders: [], processedEvents: [] }; } }
async function write(data: OrderFile) { const task = writeQueue.then(async () => { const target = file(); await fs.mkdir(path.dirname(target), { recursive: true }); const temp = path.join(path.dirname(target), `.orders.${process.pid}.${Date.now()}.${randomBytes(3).toString("hex")}.tmp`); await fs.writeFile(temp, JSON.stringify(data, null, 2), { mode: 0o600 }); await fs.rename(temp, target); }); writeQueue = task.catch(() => undefined); return task; }

export async function priceCart(items: Array<{ id: string; qty: number }>) {
  const content = await readContent(); const byId = new Map(content.products.map((product) => [product.id, product])); const normalized = new Map<string, number>();
  for (const item of items) { if (!Number.isSafeInteger(item.qty) || item.qty < 1 || item.qty > 99) throw new Error("Invalid quantity."); normalized.set(item.id, (normalized.get(item.id) ?? 0) + item.qty); }
  if (!normalized.size || normalized.size > 50) throw new Error("Invalid cart.");
  const priced: OrderItem[] = [];
  for (const [id, qty] of normalized) { const product = byId.get(id); if (!product || !Number.isFinite(product.price) || product.price < 0) throw new Error("A product is no longer available."); priced.push({ id, name: product.name, image: product.images[0], price: product.price, qty }); }
  const subtotal = Number(priced.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)); return { items: priced, subtotal, shipping: 0, tax: 0, discount: 0, total: subtotal };
}

export async function createOrder(input: { idempotencyKey: string; items: Array<{ id: string; qty: number }>; customer: StoreOrder["customer"]; payment: { method: PaymentMethod; reference?: string }; delivery: StoreOrder["delivery"] }) {
  const task = orderCreationQueue.then(async () => {
    const data = await read(); const existing = data.orders.find((order) => order.idempotencyKey === input.idempotencyKey); if (existing) return { order: existing, created: false };
    const priced = await priceCart(input.items); const now = new Date().toISOString();
    const order: StoreOrder = { ...priced, id: `SL-${randomBytes(5).toString("hex").toUpperCase()}`, idempotencyKey: input.idempotencyKey, status: "awaiting_payment", paymentStatus: "pending", customer: input.customer, payment: input.payment, delivery: input.delivery, createdAt: now, updatedAt: now };
    data.orders.unshift(order); await write(data); return { order, created: true };
  });
  orderCreationQueue = task.then(() => undefined, () => undefined); return task;
}

export async function updatePayment(orderId: string, status: PaymentStatus, providerReference?: string) {
  const data = await read(); const order = data.orders.find((item) => item.id === orderId); if (!order) throw new Error("Order not found.");
  if (order.paymentStatus === "paid" && status !== "paid") return order;
  order.paymentStatus = status; order.status = status === "paid" ? "paid" : status === "failed" ? "failed" : status === "cancelled" ? "cancelled" : order.status; if (providerReference) order.payment.providerReference = providerReference; order.updatedAt = new Date().toISOString(); await write(data); return order;
}
export async function markEventProcessed(eventId: string) { const data = await read(); if (data.processedEvents?.includes(eventId)) return false; data.processedEvents = [...(data.processedEvents ?? []), eventId].slice(-10000); await write(data); return true; }
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
