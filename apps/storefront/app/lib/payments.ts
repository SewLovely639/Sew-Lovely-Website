import "server-only";

import type { StoreOrder } from "./orders";

function required(name: string) { const value = process.env[name]; if (!value) throw new Error(`${name} is not configured.`); return value; }

export async function createHostedCardSession(order: StoreOrder) {
  const secret = required("STRIPE_SECRET_KEY");
  const appUrl = required("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("mode", "payment"); params.set("success_url", `${appUrl}/checkout/confirmation?order=${encodeURIComponent(order.id)}`); params.set("cancel_url", `${appUrl}/checkout/payment?order=${encodeURIComponent(order.id)}&cancelled=1`);
  params.set("client_reference_id", order.id); params.set("customer_email", order.customer.email); params.set("line_items[0][price_data][currency]", "bwp"); params.set("line_items[0][price_data][product_data][name]", `Sew Lovely order ${order.id}`); params.set("line_items[0][price_data][unit_amount]", String(Math.round(order.total * 100))); params.set("line_items[0][quantity]", "1");
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `order-${order.id}` }, body: params });
  if (!response.ok) throw new Error("Secure card checkout is temporarily unavailable.");
  const result = await response.json() as { id?: string; url?: string };
  if (!result.id || !result.url) throw new Error("Payment provider returned an invalid checkout session.");
  return { id: result.id, url: result.url };
}
