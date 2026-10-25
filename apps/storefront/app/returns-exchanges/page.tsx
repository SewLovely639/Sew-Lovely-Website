import { readContent } from "@sew-lovely/cms";
import { CustomerInfoPage } from "../components/customer-info-page";

export const metadata = { title: "Returns & Exchanges | Sew Lovely", description: "How to contact Sew Lovely about a return, exchange, faulty or incorrect item." };
export const dynamic = "force-dynamic";

export default async function ReturnsExchangesPage() {
  const { site, products } = await readContent();
  return <CustomerInfoPage site={site} products={products} title="Returns & exchanges" intro="If something isn’t right with your order, contact us first so we can guide you through the appropriate next step. Your rights under applicable consumer law are not limited by this information." sections={[
    { title: "Start a request", paragraphs: ["Email or WhatsApp us with your order reference, the item name, a short description of the issue, and clear photographs if the item is faulty or incorrect. Please contact us before sending an item back so we can confirm the return method and keep it traceable."] },
    { title: "Change-of-mind requests", paragraphs: ["For a change-of-mind request, contact us within 14 days of delivery or collection. As a voluntary store policy, standard items may be considered if they are unworn, unused, unwashed, undamaged, and returned with their tags and original packaging. We’ll confirm eligibility and any applicable return arrangements before you send the item. This voluntary policy does not take away any rights or remedies available under applicable law."] },
    { title: "Faulty, unsafe or incorrectly described goods", paragraphs: ["Botswana’s Consumer Protection Act 2018 provides consumer remedies for goods that fail to meet the applicable quality requirements and standards. The Competition and Consumer Authority explains that qualifying goods may be returned within six months in their original state without penalty and at the supplier’s risk and expense, with repair, replacement or refund remedies under the Act. Contact us as soon as you identify a problem so we can assess it and arrange the remedy required by law."] },
    { title: "Personalised, altered and hygiene-sensitive items", paragraphs: ["Please contact us before ordering if you have questions about a personalised, made-to-order, altered, or hygiene-sensitive item. These items may not be eligible for a change-of-mind return once work has begun or the seal has been broken, but no store policy excludes a remedy required by law for faulty, unsafe, misdescribed or otherwise qualifying goods."] },
    { title: "Refunds and exchanges", paragraphs: ["We’ll explain the available resolution after reviewing your request. Where a refund is due, we’ll confirm the amount and method with you; processing time may depend on the payment method. Exchanges depend on stock and will be confirmed before we proceed."] },
    { title: "Policy note", paragraphs: ["This page is general customer information and does not replace legal advice or the Consumer Protection Act. If anything here conflicts with applicable law, the law applies. We recommend having the store’s final returns process reviewed by a Botswana-qualified legal professional before publication."] },
  ]} />;
}
