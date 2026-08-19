import { readContent } from "@sew-lovely/cms";
import { BackArrow } from "../components/back-arrow";
import { CheckoutForm } from "../components/checkout-form";
import { FloatingWhatsApp } from "../components/store-actions";
import { SiteNav } from "../components/site-nav";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { site } = await readContent();

  return (
    <>
      <SiteNav navigation={site.navigation} />
      <BackArrow />
      <main className="wrap checkout-page">
        <p className="eyebrow">Checkout</p>
        <h1>Delivery and payment</h1>
        <CheckoutForm storeEmail={site.email} />
      </main>
      <FloatingWhatsApp />
    </>
  );
}
