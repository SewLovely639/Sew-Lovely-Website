import { readContent } from "@sew-lovely/cms";
import { BackArrow } from "../components/back-arrow";
import { CartClient } from "../components/cart-client";
import { FloatingWhatsApp } from "../components/store-actions";
import { SiteNav } from "../components/site-nav";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const { site } = await readContent();

  return (
    <>
      <SiteNav navigation={site.navigation} />
      <BackArrow />
      <main className="wrap">
        <CartClient />
      </main>
      <FloatingWhatsApp />
    </>
  );
}
