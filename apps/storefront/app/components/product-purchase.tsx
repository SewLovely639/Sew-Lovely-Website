"use client";

import { useState } from "react";
import { QuickAdd } from "./store-actions";

type Product = { id: string; name: string; price: number; images: string[] };

export function ProductPurchase({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  return <div className="detail-purchase"><div className="detail-qty" aria-label="Select quantity"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button><output aria-live="polite">{quantity}</output><button type="button" onClick={() => setQuantity((value) => Math.min(20, value + 1))} aria-label="Increase quantity">+</button></div><QuickAdd product={product} quantity={quantity} /></div>;
}
