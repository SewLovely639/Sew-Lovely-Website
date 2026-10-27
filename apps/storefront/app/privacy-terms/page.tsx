import type { Metadata } from "next";
import { readContent } from "@sew-lovely/cms";
import { SaanjhShell } from "../components/saanjh-storefront";
import { termsSections } from "../lib/legal-content";

export const metadata: Metadata = {
  title: "Privacy & Terms | Sew Lovely",
  description: "Read how Sew Lovely handles personal information and the terms that apply to using our store.",
};
export const dynamic = "force-dynamic";

const privacySections = [
  {
    title: "Information we collect",
    paragraphs: [
      "When you place an order, we collect the details needed to process it, such as your name, email address, phone number, delivery address where required, order items, delivery choice and order notes. If you create an account, we collect your name and email address and store a protected password hash. If you subscribe to updates, we collect your email address and your subscription choice.",
      "The site stores cart contents, saved items and checkout progress in your browser so those features work between visits. An account session uses a necessary cookie. Browser error reports may include an error message, source and technical request details. We do not ask you to enter payment card numbers in the current checkout."
    ]
  },
  {
    title: "How we use information",
    paragraphs: [
      "We use order and contact information to confirm, fulfil and support orders; arrange delivery or collection; respond to questions; maintain customer accounts; prevent misuse; and meet legal or accounting obligations. We use newsletter addresses to send Sew Lovely news only where you have chosen to receive it. The optional checkout marketing box is checked by default; untick it before placing your order if you do not want promotional emails. You can also ask us to stop promotional messages at any time.",
      "Technical error information is used to diagnose and maintain the website. We do not use the checkout information to send promotional messages unless you have selected the relevant marketing option."
    ]
  },
  {
    title: "Service providers and international processing",
    paragraphs: [
      "We use service providers to host and operate the store, store order and account records, send order emails and, when configured, monitor technical errors. These may include Cloudflare, Supabase, Resend and Sentry. The Contact page embeds Google Maps, and the site loads fonts from Google Fonts; those providers may receive technical information from your browser when those resources load. Providers process information to deliver their services and may process it outside Botswana. The providers used can change as the store’s technical setup changes."
    ]
  },
  {
    title: "Retention and security",
    paragraphs: [
      "We keep personal information for as long as needed to handle the purposes described here, operate accounts and orders, resolve disputes, and meet applicable record-keeping duties. We apply reasonable technical and organisational safeguards, including protected password storage and restricted server-side access. No internet transmission or storage method can be guaranteed completely secure."
    ]
  },
  {
    title: "Your choices and privacy requests",
    paragraphs: [
      "You may request access to, correction of, or deletion of personal information, or raise a concern about how it is used, by contacting us through the details on our Contact us page. We may need to verify your identity and may retain information where the law requires or permits it. You can clear browser-stored cart, saved-item and checkout data using your browser settings; doing so may remove saved shopping progress.",
      "This notice is intended to describe the current storefront. It should be reviewed against Sew Lovely’s actual retention practices, provider arrangements, and obligations under Botswana’s Data Protection Act before publication."
    ]
  }
];

export default async function PrivacyTermsPage() {
  const { site, products } = await readContent();
  return <SaanjhShell site={site} products={products}><main className="mx-auto max-w-[920px] px-5 py-12 sm:px-8 lg:py-20">
    <p className="eyebrow">Customer care</p>
    <h1 className="mt-3 font-display text-5xl leading-[.95] sm:text-6xl">Privacy &amp; Terms</h1>
    <p className="mt-5 max-w-2xl text-sm leading-6 text-[#1d2220]/70">This page explains how Sew Lovely handles personal information and the terms that apply to orders, delivery, returns, alterations and use of the website.</p>
    <p className="mt-4 border-l-2 border-[#b51863] pl-4 text-xs leading-5 text-[#1d2220]/65">Draft for review before publication. Have a qualified Botswana legal professional review this notice and the Terms &amp; Conditions against the store’s actual data practices, provider contracts, registered business details and applicable law.</p>
    <section id="privacy" className="mt-12 scroll-mt-8"><h2 className="font-display text-4xl">Privacy notice</h2><div className="mt-7 grid gap-9">{privacySections.map((section) => <section key={section.title} className="border-t border-[#1d2220]/12 pt-6"><h3 className="font-display text-3xl leading-tight">{section.title}</h3><div className="mt-3 grid gap-3 text-sm leading-7 text-[#1d2220]/75">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}</div><p className="mt-8 text-xs leading-5 text-[#1d2220]/60">This notice should be reviewed against Botswana’s <a className="underline underline-offset-2" href="https://www.bocra.org.bw/data-protection-act" target="_blank" rel="noreferrer">Data Protection Act</a> and the store’s actual data-handling practices.</p></section>
    <section id="terms" className="mt-14 scroll-mt-8"><h2 className="font-display text-4xl">Terms &amp; Conditions</h2><p className="mt-3 text-sm leading-6 text-[#1d2220]/70">These terms apply when you browse the website, place an order, or use Sew Lovely services.</p><div className="mt-8 grid gap-9">{termsSections.map((section) => <section key={section.title} className="border-t border-[#1d2220]/12 pt-6"><h3 className="font-display text-3xl leading-tight">{section.title}</h3><div className="mt-3 grid gap-3 text-sm leading-7 text-[#1d2220]/75">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}</div></section>
    <p className="mt-12 border-t border-[#1d2220]/12 pt-5 text-xs text-[#1d2220]/55">Last updated: 25 October 2026</p>
  </main></SaanjhShell>;
}
