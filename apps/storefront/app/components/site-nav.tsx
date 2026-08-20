"use client";
import Link from "next/link";
import { useState } from "react";
import { StoreActions } from "./store-actions";

type NavItem = { label: string; type: "category" | "brand" | "anchor"; value: string };

export function SiteNav({ navigation }: { navigation: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const href = (item: NavItem) => item.type === "anchor" ? `#${item.value}` : `/shop?${item.type}=${encodeURIComponent(item.value)}`;
  return <header className="sl-nav" id="top"><div className="wrap sl-nav-inner"><Link className="sl-wordmark" href="/" onClick={() => setOpen(false)} aria-label="Sew Lovely home"><img src="/sewlovelylogo.png" alt="Sew Lovely" /></Link><nav id="sl-menu" className={`sl-nav-links ${open ? "is-open" : ""}`}>{navigation.map((item) => <Link key={item.label} href={href(item)} onClick={() => setOpen(false)}>{item.label}</Link>)}<Link href="#gift-box" onClick={() => setOpen(false)}>Gift box</Link></nav><div className="sl-nav-bag"><StoreActions /></div><button className={`sl-menu-toggle ${open ? "is-open" : ""}`} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="sl-menu" aria-label={open ? "Close categories" : "Open categories"}><span /><span /><span /></button></div></header>;
}
