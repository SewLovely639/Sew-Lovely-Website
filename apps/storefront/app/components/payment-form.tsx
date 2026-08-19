"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { CartItem, cartKey } from "./cart-client";

type CheckoutData = { customer: { name: string; email: string; phone: string }; delivery: { option: string; address?: string; city?: string; country?: string; notes?: string } };
type Method = "cash_on_delivery" | "pay_in_store";

export function PaymentForm() {
  const [items, setItems] = useState<CartItem[]>([]); const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null); const [method, setMethod] = useState<Method>("cash_on_delivery"); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(cartKey) || "[]") as CartItem[]); const raw = localStorage.getItem("checkout-data"); if (raw) setCheckoutData(JSON.parse(raw) as CheckoutData); } catch { setItems([]); } }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!checkoutData || !items.length || busy) return; setBusy(true); setMessage("");
    const key = localStorage.getItem("checkout-idempotency") || crypto.randomUUID(); localStorage.setItem("checkout-idempotency", key);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify({ items: items.map((item) => ({ id: item.id, qty: item.qty })), customer: checkoutData.customer, delivery: checkoutData.delivery, payment: { method, reference: String(form.get("paymentReference") || "").trim() } }) });
    const payload = await response.json().catch(() => null) as { message?: string; checkoutUrl?: string; orderId?: string } | null;
    if (!response.ok) { setBusy(false); setMessage(payload?.message || "We could not start checkout. Please try again."); return; }
    if (payload?.checkoutUrl) { window.location.assign(payload.checkoutUrl); return; }
    localStorage.removeItem(cartKey); localStorage.removeItem("checkout-data"); localStorage.removeItem("checkout-idempotency"); window.location.assign(`/checkout/confirmation?order=${encodeURIComponent(payload?.orderId ?? "")}`);
  }
  if (!checkoutData) return <section className="checkout-empty"><p className="eyebrow">Payment</p><h2>Session expired</h2><p>Please start checkout again.</p><Link className="button" href="/checkout">Back to checkout</Link></section>;
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return <section className="checkout-layout"><form className="checkout-form" onSubmit={submit}>
    <fieldset><legend>Payment method</legend>{([ ["cash_on_delivery", "Cash on delivery"], ["pay_in_store", "Reserve in store / pay in store"] ] as [Method, string][]).map(([value, label]) => <label className={`radio-row ${method === value ? "selected" : ""}`} key={value}><span>{label}</span><input type="radio" name="paymentMethod" value={value} checked={method === value} onChange={() => setMethod(value)} /></label>)}</fieldset>
    <fieldset><legend>Payment note</legend><label><textarea name="paymentReference" placeholder="Optional bank reference or note" maxLength={220} /></label></fieldset>
    <div className="checkout-actions"><button className="button" type="submit" disabled={!items.length || busy}>{busy ? "Placing order…" : "Place order"}</button><Link className="button secondary" href="/checkout">Back to details</Link></div>
    {message && <p className="form-message error" role="alert">{message}</p>}
  </form><aside className="checkout-summary"><p className="eyebrow">Order summary</p><div className="summary-items">{items.map((item) => <div key={item.id} className="summary-line"><span>{item.qty} × {item.name}</span><strong>P{(item.price * item.qty).toFixed(2)}</strong></div>)}</div><div className="summary-total"><span>Estimated total</span><strong>P{total.toFixed(2)}</strong></div><small>Final total is recalculated securely at checkout.</small></aside></section>;
}
