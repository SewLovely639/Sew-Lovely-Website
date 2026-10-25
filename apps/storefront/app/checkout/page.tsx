import { readContent } from "@sew-lovely/cms";
import { SaanjhCheckout } from "../components/saanjh-checkout";

export const dynamic = "force-dynamic";
export default async function CheckoutPage() {
  const { site } = await readContent();
  return <SaanjhCheckout promotion={site.promotion} />;
}
