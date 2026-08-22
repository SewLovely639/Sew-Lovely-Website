import { readContent } from "@sew-lovely/cms";
import { SaanjhCollection } from "../components/saanjh-storefront";

export const dynamic = "force-dynamic";
export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { site, products } = await readContent();
  const params = await searchParams;
  return <SaanjhCollection site={site} products={products} initialCategory={params.category ?? "all"} />;
}
