"use client";

import type { CmsProduct, SiteContent } from "@sew-lovely/cms";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, Heart, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cartKey, type CartItem } from "./cart-client";
import { SaanjhProductCard } from "./saanjh-storefront";

const money = (value: number) => `P${value.toFixed(2)}`;
const collectionHref = (value: string) => `/collections/${encodeURIComponent(value.toLowerCase().replace(/\s+/g, "-"))}`;

export function ProductDetail({ site, products, product }: { site: SiteContent; products: CmsProduct[]; product: CmsProduct }) {
  const [image, setImage] = useState(product.images[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(product.sizes[0] ?? "Standard");
  const [details, setDetails] = useState<string | null>("Details");
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(""), 2800); return () => window.clearTimeout(timer); }, [notice]);
  const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4);
  const recommendations = related.length ? related : products.filter((item) => item.id !== product.id).slice(0, 4);
  const addToBag = () => {
    const current = (() => { try { return JSON.parse(localStorage.getItem(cartKey) || "[]") as CartItem[]; } catch { return []; } })();
    const imageUrl = product.images[0] ?? "";
    const lineId = `${product.id}::${size}`;
    const existing = current.find((item) => (item.lineId ?? item.id) === lineId);
    const next = existing ? current.map((item) => (item.lineId ?? item.id) === lineId ? { ...item, qty: item.qty + quantity } : item) : [...current, { id: product.id, lineId, name: product.name, price: product.price, image: imageUrl, qty: quantity, size }];
    localStorage.setItem(cartKey, JSON.stringify(next));
    window.dispatchEvent(new Event("sew-lovely-cart"));
    setNotice(`${product.name} in size ${size} has been added to your bag.`);
  };
  return <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:py-12">
    <nav className="mb-7 flex flex-wrap gap-2 text-xs text-[#1d2220]/55"><Link href="/">Home</Link><span>/</span><Link href={collectionHref(product.category)}>{product.category}</Link><span>/</span><span>{product.name}</span></nav>
    <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-14">
      <div className="grid gap-3 sm:grid-cols-[92px_1fr]"><div className="order-2 flex gap-2 sm:order-1 sm:flex-col">{product.images.map((entry, index) => <button key={`${entry}-${index}`} type="button" onClick={() => setImage(entry)} className={`relative aspect-[.8] w-16 overflow-hidden sm:w-full ${image === entry ? "ring-1 ring-[#cc1f76]" : "opacity-65 hover:opacity-100"}`} aria-label={`Show product image ${index + 1}`}><img src={entry} alt="" className="size-full object-cover" /></button>)}</div><div className="order-1 aspect-[.79] overflow-hidden bg-[#eee8df] sm:order-2"><img src={image} alt={product.name} className="size-full object-cover" /></div></div>
      <div className="max-w-xl lg:pt-5"><div className="flex items-start justify-between gap-6"><div><p className="eyebrow">{product.category}</p><h1 className="mt-3 font-display text-5xl leading-[.93] sm:text-6xl">{product.name}</h1></div><button type="button" onClick={() => setSaved((value) => !value)} className="grid size-10 place-items-center rounded-full border border-[#21161e]/15" aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}><Heart className={`size-5 ${saved ? "fill-[#cc1f76] text-[#cc1f76]" : ""}`} strokeWidth={1.3} /></button></div><p className="mt-5 text-lg font-medium">{money(product.price)}</p><p className="mt-5 text-sm leading-6 text-[#1d2220]/70">{product.description}</p>
        <div className="mt-8"><div className="mb-3 flex items-center justify-between"><p className="text-[0.63rem] font-bold uppercase tracking-[.16em]">Select size</p><span className="text-xs text-[#b51863]">Selected: {size}</span></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{product.sizes.map((option) => <button key={option} type="button" onClick={() => setSize(option)} className={`min-h-11 border px-2 text-xs font-semibold transition ${size === option ? "border-[#251521] bg-[#251521] text-white" : "border-[#1d2220]/20 bg-[#fffafb] text-[#251521] hover:border-[#251521]"}`}>{option}</button>)}</div></div>
        <div className="mt-6 flex gap-3"><div className="inline-flex items-center border border-[#1d2220]/20"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid size-12 place-items-center" aria-label="Decrease quantity"><Minus className="size-4" /></button><span className="grid size-10 place-items-center text-sm">{quantity}</span><button type="button" onClick={() => setQuantity(quantity + 1)} className="grid size-12 place-items-center" aria-label="Increase quantity"><Plus className="size-4" /></button></div><button type="button" onClick={addToBag} className="flex flex-1 items-center justify-center gap-2 bg-[#251521] px-5 text-[0.65rem] font-bold uppercase tracking-[.16em] text-white transition hover:bg-[#5a1d46] active:scale-[.98]"><ShoppingBag className="size-4" /> Add to bag</button></div>
        <div className="mt-7 grid gap-3 border-y border-[#1d2220]/12 py-5 text-sm"><p>Complimentary standard delivery with your Sew Lovely order.</p><p>Returns accepted within 14 days of delivery.</p></div><div className="mt-2">{["Product Details", "Fabric & Fit", "Care Instructions", "Shipping & returns"].map((label) => <div key={label} className="border-b border-[#1d2220]/12"><button type="button" onClick={() => setDetails(details === label ? null : label)} className="flex w-full items-center justify-between py-4 text-left text-[0.64rem] font-bold uppercase tracking-[.15em]">{label}<ChevronDown className={`size-4 transition ${details === label ? "rotate-180" : ""}`} /></button>{details === label && <p className="whitespace-pre-line pb-4 text-sm leading-6 text-[#1d2220]/65">{label === "Product Details" ? product.productDetails || product.story || "Each Sew Lovely piece is thoughtfully finished in small batches." : label === "Fabric & Fit" ? product.fabricAndFit || "Fabric and fit guidance will be available soon." : label === "Care Instructions" ? product.careInstructions || "Care guidance will be available soon." : "Ready-to-ship pieces leave our atelier within two business days. Made-to-order pieces include estimated timelines at checkout."}</p>}</div>)}</div>
      </div>
    </div>
    <section className="mt-14 border-t border-[#21161e]/12 pt-10 sm:mt-20"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">More to discover</p><h2 className="mt-2 font-display text-3xl sm:text-5xl">You May Also Like</h2></div><Link href={collectionHref(product.category)} className="border-b border-[#21161e] pb-1 text-[0.62rem] font-bold uppercase tracking-[.16em]">View all</Link></div><div className="flex gap-3 overflow-x-auto pb-3 sm:gap-4 lg:grid lg:grid-cols-4 lg:overflow-visible">{recommendations.map((item) => <div key={item.id} className="min-w-[65%] sm:min-w-[45%] lg:min-w-0"><SaanjhProductCard product={item} /></div>)}</div></section>
    {notice && <div role="status" className="fixed bottom-5 left-1/2 z-[80] w-[min(92vw,440px)] -translate-x-1/2 border border-[#21161e]/15 bg-[#fffafb] px-4 pb-4 pt-11 text-sm text-[#21161e] shadow-xl"><span className="block pr-1">{notice}</span><button type="button" onClick={() => setNotice("")} className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full border border-[#21161e]/35 bg-[#fffafb] text-[#21161e] transition hover:border-[#cc1f76] hover:text-[#cc1f76]" aria-label="Dismiss notification"><X className="size-3.5" strokeWidth={2} /></button></div>}
  </div>;
}
