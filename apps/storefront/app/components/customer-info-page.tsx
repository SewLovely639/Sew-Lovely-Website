import Link from "next/link";
import { SaanjhShell } from "./saanjh-storefront";
import type { CmsProduct, SiteContent } from "@sew-lovely/cms";

type InfoSection = { title: string; paragraphs: string[]; bullets?: string[] };

export function CustomerInfoPage({ site, products, eyebrow = "Customer care", title, intro, sections, contact = false }: {
  site: SiteContent;
  products: CmsProduct[];
  eyebrow?: string;
  title: string;
  intro: string;
  sections: InfoSection[];
  contact?: boolean;
}) {
  const mapQuery = encodeURIComponent(site.storeAddress);
  return <SaanjhShell site={site} products={products}><main className="mx-auto max-w-[1000px] px-5 py-12 sm:px-8 lg:py-20">
    <Link href="/" className="mb-8 inline-flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[.14em] text-[#1d2220]/65 transition hover:text-[#b51863]">← Return to home</Link>
    <p className="eyebrow">{eyebrow}</p>
    <h1 className="mt-3 font-display text-5xl leading-[.95] sm:text-6xl">{title}</h1>
    <p className="mt-5 max-w-2xl text-sm leading-7 text-[#1d2220]/70">{intro}</p>
    {contact && <div className="mt-9 grid gap-8 md:grid-cols-[.8fr_1.2fr]">
      <section className="bg-[#f8edf3] p-6 sm:p-8"><h2 className="font-display text-3xl">Visit or get in touch</h2><dl className="mt-5 grid gap-4 text-sm leading-6">
        <div><dt className="text-[.62rem] font-bold uppercase tracking-[.14em] text-[#1d2220]/55">Location</dt><dd className="mt-1">{site.storeAddress}</dd></div>
        <div><dt className="text-[.62rem] font-bold uppercase tracking-[.14em] text-[#1d2220]/55">Phone / WhatsApp</dt><dd className="mt-1"><a className="underline underline-offset-2" href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>{site.phone}</a></dd></div>
        <div><dt className="text-[.62rem] font-bold uppercase tracking-[.14em] text-[#1d2220]/55">Email</dt><dd className="mt-1"><a className="underline underline-offset-2" href={`mailto:${site.email}`}>{site.email}</a></dd></div>
        <div><dt className="text-[.62rem] font-bold uppercase tracking-[.14em] text-[#1d2220]/55">WhatsApp</dt><dd className="mt-1"><a className="underline underline-offset-2" href={site.connect.whatsappUrl} target="_blank" rel="noreferrer">Message Sew Lovely</a></dd></div>
      </dl></section>
      <div className="min-h-[300px] overflow-hidden bg-[#f3dfe9]"><iframe title="Map showing Sew Lovely at African Mall, Gaborone" src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} className="size-full min-h-[300px] border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><a className="sr-only" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}>Open Sew Lovely in Google Maps</a></div>
    </div>}
    <div className="mt-10 grid gap-8">{sections.map((section) => <section key={section.title} className="border-t border-[#1d2220]/12 pt-6"><h2 className="font-display text-3xl leading-tight">{section.title}</h2><div className="mt-3 grid gap-3 text-sm leading-7 text-[#1d2220]/75">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>{section.bullets && <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-[#1d2220]/75">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}</div>
    <p className="mt-12 border-t border-[#1d2220]/12 pt-5 text-xs leading-5 text-[#1d2220]/55">For individual order questions, include your order reference. See our <Link href="/terms" className="underline underline-offset-2">Terms &amp; Conditions</Link>.</p>
  </main></SaanjhShell>;
}
