"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { CartItem, cartKey } from "./cart-client";

type Status = "idle" | "loading" | "success" | "error";
type FormErrors = Partial<Record<string, string>>;

export function CheckoutForm({ storeEmail }: { storeEmail: string }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [mailLink, setMailLink] = useState("");
  const [delivery, setDelivery] = useState("reserve_in_store");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(cartKey) || "[]") as CartItem[]);
    } catch {
      setItems([]);
    }
  }, []);

  function validateForm(formData: FormData) {
    const nextErrors: FormErrors = {};
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const country = String(formData.get("country") ?? "").trim();
    const selected = String(formData.get("deliveryOption") ?? delivery);

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
    const form = new FormData(event.currentTarget);
    if (!validateForm(form)) {
      setStatus("error");
      setMessage("Please fix the highlighted fields before continuing.");
      return;
    }

    if (!items.length) {
      setStatus("error");
      setMessage("Your cart is empty. Add a product before checkout.");
      return;
    }

    // Save customer and delivery info to localStorage for payment page
    localStorage.setItem("checkout-data", JSON.stringify({
      customer: {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
      },
      delivery: {
        option: form.get("deliveryOption"),
        address: form.get("address"),
        city: form.get("city"),
        country: form.get("country"),
        notes: form.get("notes"),
      },
    }));

    window.location.href = "/checkout/payment";
  }

  const needsAddress = delivery === "cash_on_delivery" || delivery === "international_delivery";
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
      <form className="checkout-form" onSubmit={submit}>
        <fieldset>
          <legend>Customer details</legend>
          <label>
            Full name
            <input name="name" defaultValue="" aria-invalid={Boolean(errors.name)} className={errors.name ? "field-error" : ""} required minLength={2} />
            {errors.name && <span className="field-error-text">{errors.name}</span>}
          </label>
          <label>
            Email
            <input name="email" type="email" defaultValue="" aria-invalid={Boolean(errors.email)} className={errors.email ? "field-error" : ""} required />
            {errors.email && <span className="field-error-text">{errors.email}</span>}
          </label>
          <label>
            Phone
            <input name="phone" defaultValue="" aria-invalid={Boolean(errors.phone)} className={errors.phone ? "field-error" : ""} required minLength={5} />
            {errors.phone && <span className="field-error-text">{errors.phone}</span>}
          </label>
        </fieldset>
        <fieldset>
          <legend>Delivery option</legend>
          <label className={`radio-row ${delivery === "reserve_in_store" ? "selected" : ""}`} onClick={() => setDelivery("reserve_in_store")}><span>Reserve in store</span><input type="hidden" name="deliveryOption" value="reserve_in_store" /></label>
          <label className={`radio-row ${delivery === "cash_on_delivery" ? "selected" : ""}`} onClick={() => setDelivery("cash_on_delivery")}><span>Cash on delivery</span><input type="hidden" name="deliveryOption" value="cash_on_delivery" /></label>
          <label className={`radio-row ${delivery === "international_delivery" ? "selected" : ""}`} onClick={() => setDelivery("international_delivery")}><span>International delivery</span><input type="hidden" name="deliveryOption" value="international_delivery" /></label>
          {needsAddress && (
            <div className="delivery-grid">
              <label>
                Delivery address
                <textarea name="address" aria-invalid={Boolean(errors.address)} className={errors.address ? "field-error" : ""} required={needsAddress} />
                {errors.address && <span className="field-error-text">{errors.address}</span>}
              </label>
              <label>
                City
                <input name="city" aria-invalid={Boolean(errors.city)} className={errors.city ? "field-error" : ""} required={needsAddress} />
                {errors.city && <span className="field-error-text">{errors.city}</span>}
              </label>
              <label>
                Country
                <input name="country" aria-invalid={Boolean(errors.country)} className={errors.country ? "field-error" : ""} required={needsAddress} />
                {errors.country && <span className="field-error-text">{errors.country}</span>}
              </label>
            </div>
          )}
          <label>
            Delivery notes
            <textarea name="notes" />
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
