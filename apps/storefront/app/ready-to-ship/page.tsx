import { readContent } from "@sew-lovely/cms";
import { CustomerInfoPage } from "../components/customer-info-page";

export const metadata = { title: "Ready to Ship | Sew Lovely", description: "Contact Sew Lovely to confirm which pieces are currently available for immediate dispatch or collection." };
export const dynamic = "force-dynamic";

export default async function ReadyToShipPage() {
  const { site, products } = await readContent();
  return <CustomerInfoPage site={site} products={products} eyebrow="The collection" title="Ready to ship" intro="Looking for a piece that can leave the store soon? Our ready-to-ship selection changes as pieces sell and new stock arrives. Contact us to confirm current availability before placing your order." sections={[
    { title: "Check current availability", paragraphs: ["Message or call the store with the product name or link, preferred size and your delivery destination. We’ll confirm whether the piece is on hand, whether any finishing is needed, and the likely dispatch or collection timing."] },
    { title: "How to order", paragraphs: ["Once we confirm availability, you can place your order through the product page and select an available fulfilment option at checkout. Dispatch timing, delivery charges and collection details are confirmed for each order."] },
  ]} />;
}
