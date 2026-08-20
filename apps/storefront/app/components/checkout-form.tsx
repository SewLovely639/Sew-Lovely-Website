"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { CartItem, cartKey } from "./cart-client";
import { emptyCheckoutDraft, type CheckoutDraft, type DeliveryOption, readCheckoutDraft, saveCheckoutDraft } from "../lib/checkout-draft";

type Status = "idle" | "loading" | "success" | "error";
type FormErrors = Partial<Record<string, string>>;

export function CheckoutForm({ storeEmail }: { storeEmail: string }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [mailLink, setMailLink] = useState("");
  const [draft, setDraft] = useState<CheckoutDraft>(emptyCheckoutDraft);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(cartKey) || "[]") as CartItem[]);
      setDraft(readCheckoutDraft() ?? emptyCheckoutDraft);
    } catch {
      setItems([]);
    }
  }, []);

  function validateForm(nextDraft: CheckoutDraft) {
    const nextErrors: FormErrors = {};
    const { name, email, phone } = nextDraft.customer;
    const { address, city, country, option: selected } = nextDraft.delivery;

    if (!name) nextErrors.name = "Please enter your full name.";
    else if (name.length < 2) nextErrors.name = "Name must be at least 2 characters long.";

    if (!email) nextErrors.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Please enter a valid email address.";

    if (!phone) nextErrors.phone = "Please enter your phone number.";
    else if (phone.length < 5) nextErrors.phone = "Phone number must be at least 5 characters long.";

    if (selected === "cash_on_delivery" || selected === "international_delivery") {
      if (!address) nextErrors.address = "Please enter a delivery address.";
      if (!city) nextErrors.city = "Please enter a delivery city.";
      if (!country) nextErrors.country = "Please enter the delivery country.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateForm(draft)) {
      setStatus("error");
      setMessage("Please fix the highlighted fields before continuing.");
      return;
    }

    if (!items.length) {
      setStatus("error");
      setMessage("Your cart is empty. Add a product before checkout.");
      return;
    }

    saveCheckoutDraft(draft);

    window.location.href = "/checkout/payment";
  }

  const needsAddress = draft.delivery.option === "cash_on_delivery" || draft.delivery.option === "international_delivery";
  const selectDelivery = (option: DeliveryOption) => setDraft((current) => ({ ...current, delivery: { ...current.delivery, option } }));
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (!items.length && status !== "success") {
    return (
      <section className="checkout-empty">
        <p className="eyebrow">Checkout</p>
        <h2>Your cart is empty</h2>
        <p>Add products before you continue to checkout.</p>
        <Link className="button" href="/shop">Continue shopping</Link>
      </section>
    );
  }

  return (
    <section className="checkout-layout">
      <form className="checkout-form" onSubmit={submit} noValidate>
        <fieldset>
          <legend>Customer details</legend>
          <label>
            Full name
            <input name="name" value={draft.customer.name} onChange={(event) => setDraft((current) => ({ ...current, customer: { ...current.customer, name: event.target.value } }))} aria-invalid={Boolean(errors.name)} className={errors.name ? "field-error" : ""} required minLength={2} />
            {errors.name && <span className="field-error-text">{errors.name}</span>}
          </label>
          <label>
            Email
            <input name="email" type="email" value={draft.customer.email} onChange={(event) => setDraft((current) => ({ ...current, customer: { ...current.customer, email: event.target.value } }))} aria-invalid={Boolean(errors.email)} className={errors.email ? "field-error" : ""} required />
            {errors.email && <span className="field-error-text">{errors.email}</span>}
          </label>
          <label>
            Phone
            <input name="phone" value={draft.customer.phone} onChange={(event) => setDraft((current) => ({ ...current, customer: { ...current.customer, phone: event.target.value } }))} aria-invalid={Boolean(errors.phone)} className={errors.phone ? "field-error" : ""} required minLength={5} />
            {errors.phone && <span className="field-error-text">{errors.phone}</span>}
          </label>
        </fieldset>
        <fieldset>
          <legend>Delivery option</legend>
          <input type="hidden" name="deliveryOption" value={draft.delivery.option} />
          <button type="button" className={`radio-row ${draft.delivery.option === "reserve_in_store" ? "selected" : ""}`} aria-pressed={draft.delivery.option === "reserve_in_store"} onClick={() => selectDelivery("reserve_in_store")}>Reserve in store</button>
          <button type="button" className={`radio-row ${draft.delivery.option === "cash_on_delivery" ? "selected" : ""}`} aria-pressed={draft.delivery.option === "cash_on_delivery"} onClick={() => selectDelivery("cash_on_delivery")}>Cash on delivery</button>
          <button type="button" className={`radio-row ${draft.delivery.option === "international_delivery" ? "selected" : ""}`} aria-pressed={draft.delivery.option === "international_delivery"} onClick={() => selectDelivery("international_delivery")}>International delivery</button>
          {needsAddress && (
            <div className="delivery-grid">
              <label>
                Delivery address
                <textarea name="address" value={draft.delivery.address} onChange={(event) => setDraft((current) => ({ ...current, delivery: { ...current.delivery, address: event.target.value } }))} aria-invalid={Boolean(errors.address)} className={errors.address ? "field-error" : ""} required={needsAddress} />
                {errors.address && <span className="field-error-text">{errors.address}</span>}
              </label>
              <label>
                City
                <input name="city" value={draft.delivery.city} onChange={(event) => setDraft((current) => ({ ...current, delivery: { ...current.delivery, city: event.target.value } }))} aria-invalid={Boolean(errors.city)} className={errors.city ? "field-error" : ""} required={needsAddress} />
                {errors.city && <span className="field-error-text">{errors.city}</span>}
              </label>
              <label>
                Country
                <input name="country" value={draft.delivery.country} onChange={(event) => setDraft((current) => ({ ...current, delivery: { ...current.delivery, country: event.target.value } }))} aria-invalid={Boolean(errors.country)} className={errors.country ? "field-error" : ""} required={needsAddress} />
                {errors.country && <span className="field-error-text">{errors.country}</span>}
              </label>
            </div>
          )}
          <label>
            Delivery notes
            <textarea name="notes" value={draft.delivery.notes} onChange={(event) => setDraft((current) => ({ ...current, delivery: { ...current.delivery, notes: event.target.value } }))} />
          </label>
        </fieldset>
        <div className="checkout-actions">
          <button className="button" type="submit" disabled={!items.length || status === "loading"}>{status === "loading" ? "Proceeding..." : "Proceed to payment"}</button>
          <Link className="button secondary" href="/shop">Continue shopping</Link>
        </div>
      </form>
      <aside className="checkout-summary">
        <p className="eyebrow">Order summary</p>
        <div className="summary-items">
          {items.map((item) => (
            <div key={item.id} className="summary-line">
              <span>{item.qty} x {item.name}</span>
              <strong>P{(item.price * item.qty).toFixed(2)}</strong>
            </div>
          ))}
        </div>
        <div className="summary-total">
          <span>Total</span>
          <strong>P{total.toFixed(2)}</strong>
        </div>
      </aside>
    </section>
  );
}
