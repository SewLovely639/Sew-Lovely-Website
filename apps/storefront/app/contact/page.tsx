import { readContent } from "@sew-lovely/cms";
import { CustomerInfoPage } from "../components/customer-info-page";

export const metadata = { title: "Contact Sew Lovely", description: "Contact Sew Lovely in Gaborone for store visits, order support and styling questions." };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { site, products } = await readContent();
  return <CustomerInfoPage site={site} products={products} title="Contact us" intro="We’re happy to help with store visits, product questions, orders, sizing and alterations. Reach us using the details below." contact sections={[
    { title: "Before you visit", paragraphs: ["Our store is at African Mall, Plot 1006, Gaborone, Botswana. Please contact us before travelling if you need to confirm opening hours, a particular item’s availability, or an appointment for alterations."] },
    { title: "Order support", paragraphs: ["For help with an existing order, email or message us and include your order reference, the name used at checkout, and the best way to reach you. Please do not send payment card details or passwords."] },
  ]} />;
}
