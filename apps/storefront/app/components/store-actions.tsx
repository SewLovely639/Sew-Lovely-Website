"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = { id: string; name: string; price: number; image: string; qty: number };
const cartKey = "sew-lovely-cart";
const whatsappUrl = "https://wa.me/26771677786";

export function StoreActions() {
  const [bag, setBag] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const update = () => {
      const raw = localStorage.getItem(cartKey);
      const next = raw ? JSON.parse(raw) as CartItem[] : [];
      setBag(next.reduce((total, item) => total + item.qty, 0));
    };
    update();
    window.addEventListener("sew-lovely-cart", update);
    window.addEventListener("sew-lovely-cart-toast", handleToast as EventListener);
    return () => {
      window.removeEventListener("sew-lovely-cart", update);
      window.removeEventListener("sew-lovely-cart-toast", handleToast as EventListener);
    };
  }, []);

  function handleToast(event: Event) {
    const detail = (event as CustomEvent<string>).detail;
    setToast(detail);
    window.clearTimeout((window as Window & { __cartToast?: number }).__cartToast);
    (window as Window & { __cartToast?: number }).__cartToast = window.setTimeout(() => setToast(""), 2200);
  }

  return (
    <div className="actions">
      <form className="nav-search" action="/shop">
        <span className="nav-icon" aria-hidden="true">{searchIcon}</span>
        <input name="q" placeholder="Search products" aria-label="Search products" />
        <button type="submit" aria-label="Submit search">{searchIcon}</button>
      </form>
      <Link className="action-link icon-button" href="/profile" aria-label="Profile">
        {profileIcon}
      </Link>
      <Link className="action-link icon-button cart-link" href="/cart" aria-label="Open cart">
        {cartIcon}<span>{bag || ""}</span>
      </Link>
      {toast && <div className="cart-toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}

export function QuickAdd({ product }: { product: { id: string; name: string; price: number; images: string[] } }) {
  function add() {
    const raw = localStorage.getItem(cartKey);
    const items = raw ? JSON.parse(raw) as CartItem[] : [];
    const image = product.images[0] || "";
    const index = items.findIndex((item) => item.id === product.id);
    if (index >= 0) items[index] = { ...items[index], qty: items[index].qty + 1 };
    else items.push({ id: product.id, name: product.name, price: product.price, image, qty: 1 });
    localStorage.setItem(cartKey, JSON.stringify(items));
    window.dispatchEvent(new Event("sew-lovely-cart"));
    window.dispatchEvent(new CustomEvent("sew-lovely-cart-toast", { detail: "Item added to cart" }));
  }

  return (
    <button type="button" onClick={add} aria-label={`Add ${product.name} to cart`}>
      Add to cart
    </button>
  );
}

export function FloatingWhatsApp() {
  return (
    <a className="whatsapp-fab" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
      {whatsappIcon}
    </a>
  );
}

const searchIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm6.9 10.49 2.1 2.1-1.41 1.41-2.1-2.1 1.41-1.41Z" fill="currentColor" />
  </svg>
);

const profileIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Zm0 2c-3.85 0-7 2.36-7 5.3V21h14v-1.5c0-2.94-3.15-5.3-7-5.3Z" fill="currentColor" />
  </svg>
);

const cartIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 6h15l-2 8H8L7 6Zm0 0L6.2 3H3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="19" r="1.5" fill="currentColor" />
    <circle cx="18" cy="19" r="1.5" fill="currentColor" />
  </svg>
);

const whatsappIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.5 11.8a8.2 8.2 0 0 1-12.2 7.1L4 20l1.2-4.1a8.2 8.2 0 1 1 15.3-4.1Zm-8.2-6.2a6.2 6.2 0 0 0-5.3 9.4l.2.3-.7 2.4 2.5-.7.3.2a6.2 6.2 0 1 0 3-11.6Zm3.6 8.2c-.2.5-1 1-1.5 1s-.8 0-1.2-.2a10.8 10.8 0 0 1-3.8-3.8c-.4-.6-.7-1.3-.7-2 0-.7.4-1.3.8-1.7.2-.2.4-.2.6-.2h.5c.2 0 .4 0 .5.4l.7 1.8c.1.3.1.4 0 .6l-.3.4c-.1.1-.2.3-.1.5a4.9 4.9 0 0 0 2 2l.5-.5c.2-.2.4-.1.6 0l1.8.9c.4.2.4.4.3.7Z" fill="currentColor" />
  </svg>
);
