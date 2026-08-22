"use client";

import { MessageCircle, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const newsletterDismissedKey = "sew-lovely-newsletter-dismissed";

export function StorefrontMarketingTools({ newsletterTitle, newsletterDescription, whatsappUrl, heroTiles }: { newsletterTitle: string; newsletterDescription: string; whatsappUrl: string; heroTiles: Array<{ destination: string }> }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (sessionStorage.getItem(newsletterDismissedKey)) return;
    const timer = window.setTimeout(() => setOpen(true), 850);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.querySelectorAll<HTMLAnchorElement>("a.campaign-tile").forEach((tile, index) => {
      const destination = heroTiles[index]?.destination;
      if (destination) tile.href = destination;
    });
  }, [heroTiles]);
  const dismiss = () => { sessionStorage.setItem(newsletterDismissedKey, "1"); setOpen(false); };
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setMessage("Please enter a valid email address."); return; }
    try {
      const response = await fetch("/api/customers/offers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      if (!response.ok) throw new Error("We could not save your email yet.");
      setMessage("Thank you — you’re on the list.");
      setEmail("");
      sessionStorage.setItem(newsletterDismissedKey, "1");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not save your email yet.");
    }
  }
  return <>
    {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat with Sew Lovely on WhatsApp" className="fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_28px_rgba(25,80,45,.35)] transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:ring-offset-2"><MessageCircle className="size-6" fill="currentColor" strokeWidth={1.7} /></a>}
    {open && <div className="fixed inset-0 z-[80] grid place-items-center bg-[#211018]/45 p-5" onClick={dismiss}><section role="dialog" aria-modal="true" aria-labelledby="newsletter-title" className="relative w-full max-w-md bg-[#fffafb] p-7 shadow-[0_24px_80px_rgba(37,21,33,.35)] sm:p-9" onClick={(event) => event.stopPropagation()}><button type="button" onClick={dismiss} className="absolute right-4 top-4 grid size-9 place-items-center text-[#21161e]/60 transition hover:text-[#cc1f76]" aria-label="Close newsletter prompt"><X className="size-5" /></button><p className="eyebrow">Sew Lovely notes</p><h2 id="newsletter-title" className="mt-3 max-w-sm font-display text-4xl leading-[.96] text-[#251521]">{newsletterTitle}</h2><p className="mt-4 max-w-sm text-sm leading-6 text-[#21161e]/65">{newsletterDescription}</p><form className="mt-7 grid gap-3" onSubmit={(event) => void subscribe(event)}><label className="sr-only" htmlFor="newsletter-modal-email">Email address</label><input id="newsletter-modal-email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="Email address" className="border border-[#21161e]/20 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#251521]" required /><button className="bg-[#251521] px-5 py-3.5 text-[.65rem] font-bold uppercase tracking-[.16em] text-white transition hover:bg-[#5a1d46]">Subscribe</button>{message && <p className="text-sm text-[#b51863]" role="status">{message}</p>}</form><button type="button" onClick={dismiss} className="mt-5 text-[.61rem] font-bold uppercase tracking-[.14em] text-[#21161e]/55 transition hover:text-[#cc1f76]">No thanks, continue to the collection</button></section></div>}
  </>;
}
