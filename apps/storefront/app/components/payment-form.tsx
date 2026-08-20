"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { CartItem, cartKey } from "./cart-client";
import { type CheckoutDraft, type PaymentMethod, readCheckoutDraft, saveCheckoutDraft } from "../lib/checkout-draft";

export function PaymentForm() {
  const [items, setItems] = useState<CartItem[]>([]); const [checkoutData, setCheckoutData] = useState<CheckoutDraft | null>(null); const [method, setMethod] = useState<PaymentMethod>("cash_on_delivery"); const [reference, setReference] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(cartKey) || "[]") as CartItem[]); const draft = readCheckoutDraft(); if (draft) { setCheckoutData(draft); setMethod(draft.payment?.method ?? (draft.delivery.option === "reserve_in_store" ? "pay_in_store" : "cash_on_delivery")); setReference(draft.payment?.reference ?? ""); } } catch { setItems([]); } }, []);
  function chooseMethod(nextMethod: PaymentMethod) { setMethod(nextMethod); if (checkoutData) { const next = { ...checkoutData, payment: { method: nextMethod, reference } }; setCheckoutData(next); saveCheckoutDraft(next); } }
  function updateReference(nextReference: string) { setReference(nextReference); if (checkoutData) { const next = { ...checkoutData, payment: { method, reference: nextReference } }; setCheckoutData(next); saveCheckoutDraft(next); } }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!checkoutData || !items.length || busy) return; setBusy(true); setMessage("");
    const key = localStorage.getItem("checkout-idempotency") || crypto.randomUUID(); localStorage.setItem("checkout-idempotency", key);
    const nextCheckout = { ...checkoutData, payment: { method, reference: reference.trim() } }; saveCheckoutDraft(nextCheckout);
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify({ items: items.map((item) => ({ id: item.id, qty: item.qty })), customer: nextCheckout.customer, delivery: nextCheckout.delivery, payment: nextCheckout.payment }) });
    const payload = await response.json().catch(() => null) as { message?: string; checkoutUrl?: string; orderId?: string } | null;
    if (!response.ok) { setBusy(false); setMessage(payload?.message || "We could not start checkout. Please try again."); return; }
    if (payload?.checkoutUrl) { window.location.assign(payload.checkoutUrl); return; }
    localStorage.removeItem(cartKey); localStorage.removeItem("checkout-data"); localStorage.removeItem("checkout-idempotency"); window.location.assign(`/checkout/confirmation?order=${encodeURIComponent(payload?.orderId ?? "")}`);
  }
  if (!checkoutData) return <section className="checkout-empty"><p className="eyebrow">Payment</p><h2>Session expired</h2><p>Please start checkout again.</p><Link className="button" href="/checkout">Back to checkout</Link></section>;
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return <section className="checkout-layout"><form className="checkout-form" onSubmit={submit}>
    <fieldset><legend>Payment method</legend>{([ ["cash_on_delivery", "Cash on delivery"], ["pay_in_store", "Reserve in store / pay in store"] ] as [PaymentMethod, string][]).map(([value, label]) => <button type="button" className={`radio-row ${method === value ? "selected" : ""}`} aria-pressed={method === value} key={value} onClick={() => chooseMethod(value)}>{label}</button>)}</fieldset>
    <fieldset><legend>Payment note</legend><label><textarea name="paymentReference" value={reference} onChange={(event) => updateReference(event.target.value)} placeholder="Optional order note" maxLength={220} /></label></fieldset>
    <div className="checkout-actions"><button className="button" type="submit" disabled={!items.length || busy}>{busy ? "Placing order…" : "Place order"}</button><Link className="button secondary" href="/checkout">Back to details</Link></div>
    {message && <p className="form-message error" role="alert">{message}</p>}
  </form><aside className="checkout-summary"><p className="eyebrow">Order summary</p><div className="summary-items">{items.map((item) => <div key={item.id} className="summary-line"><span>{item.qty} × {item.name}</span><strong>P{(item.price * item.qty).toFixed(2)}</strong></div>)}</div><div className="summary-total"><span>Estimated total</span><strong>P{total.toFixed(2)}</strong></div><small>Final total is recalculated securely at checkout.</small></aside></section>;
}
