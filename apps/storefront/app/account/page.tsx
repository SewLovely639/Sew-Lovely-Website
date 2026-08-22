import { readContent } from "@sew-lovely/cms";
import { SaanjhAccount } from "../components/saanjh-storefront";

export const dynamic = "force-dynamic";
export default async function AccountPage() { const { site, products } = await readContent(); return <SaanjhAccount site={site} products={products} />; }
