"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type CartItem = { id: string; name: string; price: number; image: string; qty: number };
export const cartKey = "sew-lovely-cart";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey) || "[]") as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(cartKey, JSON.stringify(items));
  window.dispatchEvent(new Event("sew-lovely-cart"));
}

export function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const update = () => setItems(readCart());
    update();
    window.addEventListener("sew-lovely-cart", update);
    return () => window.removeEventListener("sew-lovely-cart", update);
  }, []);

  function updateQty(id: string, delta: number) {
    const next = items.map((item) => item.id === id ? { ...item, qty: item.qty + delta } : item).filter((item) => item.qty > 0);
    setItems(next);
    writeCart(next);
  }

  function remove(id: string) {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    writeCart(next);
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <section className="cart-page">
      <div className="cart-heading">
        <p className="eyebrow">Your cart</p>
        <h1>Review your order</h1>
        <p>{items.length ? "Adjust quantities before checkout." : "Your cart is empty."}</p>
      </div>
      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <article className="cart-line" key={item.id}>
              <div className="cart-thumb">{item.image ? <img src={item.image} alt="" /> : null}</div>
              <div className="cart-copy-details">
                <h2>{item.name}</h2>
                <p>P{item.price.toFixed(2)}</p>
                <div className="qty-row">
                  <button type="button" onClick={() => updateQty(item.id, -1)} aria-label={`Remove one ${item.name}`}>-</button>
                  <span>{item.qty}</span>
                  <button type="button" onClick={() => updateQty(item.id, 1)} aria-label={`Add one more ${item.name}`}>+</button>
                </div>
              </div>
              <button className="remove-line" type="button" onClick={() => remove(item.id)}>Remove</button>
            </article>
          ))}
          {!items.length && <Link className="button" href="/shop">Continue shopping</Link>}
        </div>
        <aside className="cart-summary">
          <p className="summary-label">Total</p>
          <strong>P{total.toFixed(2)}</strong>
          <div className="cart-actions">
            <Link className="button secondary" href="/shop">Continue shopping</Link>
            <Link className={`button ${items.length ? "" : "secondary disabled"}`} href={items.length ? "/checkout" : "/shop"}>
              {items.length ? "Proceed to checkout" : "Go shopping"}
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
