import { readContent } from "@sew-lovely/cms";
import { SaanjhCartPage } from "../components/saanjh-storefront";

export const dynamic = "force-dynamic";
export default async function CartPage() { const { site, products } = await readContent(); return <SaanjhCartPage site={site} products={products} />; }
