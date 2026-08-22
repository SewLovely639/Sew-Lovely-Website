import { readContent } from "@sew-lovely/cms";
import { SaanjhSearch } from "../components/saanjh-storefront";

export const dynamic = "force-dynamic";
export default async function SearchPage() { const { site, products } = await readContent(); return <SaanjhSearch site={site} products={products} />; }
