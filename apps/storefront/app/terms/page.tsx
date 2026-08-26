import { readContent } from "@sew-lovely/cms";
import { SaanjhShell } from "../components/saanjh-storefront";

export const dynamic = "force-dynamic";

const sections = [
  {
    title: "1. About these terms",
    paragraphs: [
      "These Terms and Conditions govern your use of the Sew Lovely website and your purchase of products, services, and reservations through it. By browsing the website, submitting an order, or selecting the terms consent during checkout, you agree to these terms.",
      "Sew Lovely may update these terms from time to time. The version displayed at the time you submit an order will apply to that order. If a material change affects an order already accepted, we will communicate the change where required."
    ]
  },
  {
    title: "2. Our products and availability",
    paragraphs: [
      "Sew Lovely offers clothing, suits, kurtas, bridal pieces, jewellery, beauty products, alterations, and related items. Product images, colours, measurements, embroidery, and other details are provided as accurately as reasonably possible, but small variations may occur because of lighting, screens, textile batches, and hand-finishing.",
      "All products are subject to availability. A product shown on the website may become unavailable before an order is accepted. Where this happens, we will contact you and offer an appropriate solution, which may include a replacement, an amended fulfilment date, or a refund of the unavailable item."
    ]
  },
  {
    title: "3. Prices, promotions, and order acceptance",
    paragraphs: [
      "Prices are displayed in Botswana pula unless stated otherwise and may change before an order is accepted. Delivery charges, applicable taxes, and any other charges will be shown at checkout where applicable. Promotional codes must be entered before the order is submitted and may be subject to specific eligibility rules, expiry dates, exclusions, or usage limits.",
      "Submitting an order is an offer to purchase. Your order is accepted only when Sew Lovely confirms it and assigns an order reference. We may decline or cancel an order where a product is unavailable, an obvious pricing or description error occurred, fraud or misuse is suspected, or fulfilment is not reasonably possible. If payment has already been made for a cancelled order, we will arrange a refund of the affected amount."
    ]
  },
  {
    title: "4. Delivery and collection",
    paragraphs: [
      "At checkout you may be offered Reserve in store, Cash on delivery, or International delivery, subject to availability and the destination. Reserve in store orders are held for collection according to the confirmation message. Cash on delivery is available only where shown at checkout. International delivery charges and timing depend on the destination and are shown or confirmed before fulfilment.",
      "Delivery dates and collection estimates are provided in good faith and are not guaranteed unless expressly stated. Delays caused by couriers, customs, weather, public authorities, or events outside our reasonable control will not be treated as a breach of these terms. You are responsible for providing accurate contact and delivery information and for promptly notifying us of changes."
    ]
  },
  {
    title: "5. Payment",
    paragraphs: [
      "Available payment methods are displayed during checkout. They may include cash on delivery and pay in store for qualifying orders. A reservation or order marked as pay in store is not paid until the applicable in-store payment is completed. You must not submit payment details that you are not authorised to use.",
      "If an order is not paid when due, Sew Lovely may cancel the order or release a reserved item. Any payment dispute should be raised with us promptly using the contact details below."
    ]
  },
  {
    title: "6. Returns, exchanges, and defects",
    paragraphs: [
      "Unless a product listing or applicable law provides a longer period, eligible standard products may be returned within 14 days of delivery or collection. Items must be unused, unworn, unwashed, undamaged, and returned with original tags, packaging, and accessories. You are responsible for taking reasonable care of an item while it is in your possession.",
      "Returns may be restricted or excluded for made-to-order, personalised, altered, hygiene-sensitive, beauty, jewellery, sale, or otherwise clearly identified non-returnable items, except where the item is faulty, misdescribed, or applicable law gives you a non-excludable right. Contact us before sending a return so we can provide the correct process. If an item is faulty or incorrect, include photographs and the order reference so we can investigate and provide an appropriate remedy."
    ]
  },
  {
    title: "7. Alterations and made-to-order work",
    paragraphs: [
      "Alteration and made-to-order services depend on the measurements, instructions, fabric, design, and deadline agreed with you. You are responsible for providing accurate measurements and promptly reviewing any requested confirmation. Alteration or personalised work may not be cancellable or returnable once work has started, except where the service is defective or the law provides otherwise.",
      "We will use reasonable care and skill, but fit can be affected by body shape, fabric behaviour, requested styling, and changes in measurements after confirmation. We may request a fitting or clarification before completing the work."
    ]
  },
  {
    title: "8. Website use and intellectual property",
    paragraphs: [
      "The website, including its text, photographs, videos, logos, designs, product descriptions, and branding, is owned by or licensed to Sew Lovely. You may use the website for personal, lawful shopping purposes only. You must not copy, reproduce, scrape, alter, distribute, or commercially exploit website content without written permission.",
      "You must not interfere with the website, introduce malicious code, attempt unauthorised access, impersonate another person, submit false information, or use the website in a way that could harm Sew Lovely or other customers."
    ]
  },
  {
    title: "9. Privacy and promotional communications",
    paragraphs: [
      "We use the information you provide to process orders, communicate about fulfilment, provide customer support, prevent fraud, and operate the website. Please do not submit information that is not necessary for these purposes or that you are not authorised to provide.",
      "The promotional-updates checkbox is optional and is enabled by default for convenience. You may untick it before submitting an order and may unsubscribe from promotional communications at any time using the unsubscribe option in a message or by contacting us. Order and service messages may still be sent when necessary to fulfil or support an order."
    ]
  },
  {
    title: "10. Disclaimers and liability",
    paragraphs: [
      "The website and its content are provided with reasonable care, but we do not promise that the website will always be uninterrupted, error-free, or available. Nothing in these terms excludes or limits liability that cannot lawfully be excluded or limited, including applicable consumer rights, liability for fraud, or liability for death or personal injury caused by negligence.",
      "To the extent permitted by law, Sew Lovely will not be responsible for indirect or consequential loss, loss of opportunity, or loss caused by events outside our reasonable control. Our responsibility for a product or service will not exceed the amount paid for the affected product or service, except where applicable law requires otherwise."
    ]
  },
  {
    title: "11. Events outside our control",
    paragraphs: [
      "We are not responsible for delay or failure caused by circumstances beyond our reasonable control, including natural disasters, fire, power or network outages, labour disputes, public-health events, war, civil unrest, government action, customs restrictions, courier disruption, or failures of third-party platforms. We will take reasonable steps to reduce the effect of a disruption and will communicate material changes where practicable."
    ]
  },
  {
    title: "12. Contact and governing law",
    paragraphs: [
      "For order support, returns, alterations, or questions about these terms, contact Sew Lovely at sewlovely639@outlook.com and include your order reference where relevant. Please do not send card numbers, passwords, or API keys by email.",
      "These terms are intended to be governed by the laws applicable in Botswana, subject to any mandatory consumer protections that apply to you. Any dispute should first be raised with us so that we can try to resolve it promptly and fairly."
    ]
  }
];

export default async function TermsPage() {
  const { site, products } = await readContent();
  return <SaanjhShell site={site} products={products}><main className="mx-auto max-w-[920px] px-5 py-12 sm:px-8 lg:py-20"><p className="eyebrow">Customer care</p><h1 className="mt-3 font-display text-5xl leading-[.95] sm:text-6xl">Terms &amp; Conditions</h1><p className="mt-5 max-w-2xl text-sm leading-6 text-[#1d2220]/70">These terms explain how Sew Lovely orders, payments, delivery, returns, alterations, communications, and website use are handled.</p><p className="mt-4 border-l-2 border-[#b51863] pl-4 text-xs leading-5 text-[#1d2220]/65">Draft for review before publication. Have a qualified Botswana legal professional review this document and confirm the business’s registered details, final contact information, consumer-law wording, privacy notice, and governing-law requirements before relying on it.</p><div className="mt-12 grid gap-9">{sections.map((section) => <section key={section.title} className="border-t border-[#1d2220]/12 pt-6"><h2 className="font-display text-3xl leading-tight">{section.title}</h2><div className="mt-3 grid gap-3 text-sm leading-7 text-[#1d2220]/75">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}</div><p className="mt-12 border-t border-[#1d2220]/12 pt-5 text-xs text-[#1d2220]/55">Last updated: 26 August 2026</p></main></SaanjhShell>;
}
