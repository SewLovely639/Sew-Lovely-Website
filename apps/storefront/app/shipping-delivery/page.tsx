import { readContent } from "@sew-lovely/cms";
import { CustomerInfoPage } from "../components/customer-info-page";

export const metadata = { title: "Shipping & Delivery | Sew Lovely", description: "Local delivery, store collection and international delivery information for Sew Lovely orders." };
export const dynamic = "force-dynamic";

export default async function ShippingDeliveryPage() {
  const { site, products } = await readContent();
  return <CustomerInfoPage site={site} products={products} title="Shipping & delivery" intro="Choose the fulfilment option shown for your order at checkout. We’ll confirm the next steps and any order-specific details with you." sections={[
    { title: "Collection in Gaborone", paragraphs: ["If Reserve in store is available at checkout, we’ll contact you when your order is ready and confirm where and when to collect it. Please wait for our confirmation before travelling. Bring your order reference when you collect."] },
    { title: "Delivery within Botswana", paragraphs: ["Cash on delivery may be offered for eligible destinations. Availability is confirmed at checkout or by our team. Enter a complete address and a working phone number so the delivery can be arranged. The delivery timing and any applicable charge will be confirmed for your order before fulfilment."] },
    { title: "International delivery", paragraphs: ["International delivery is subject to destination and courier availability. The checkout currently displays the applicable delivery option and charge; we’ll confirm the delivery details before fulfilment. Delivery estimates can vary with the destination, courier, customs processing and local conditions. Import duties, taxes or customs charges imposed by the destination country are the customer’s responsibility unless we expressly confirm otherwise."] },
    { title: "Tracking and delivery issues", paragraphs: ["Where tracking is available, we’ll share it when the parcel is dispatched. Contact us promptly if your order appears delayed, arrives damaged, or cannot be delivered. We’ll work with you and the courier to investigate."] },
  ]} />;
}
