import { readContent } from "@sew-lovely/cms";
import { SaanjhHome, SaanjhShell } from "./components/saanjh-storefront";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { site, products } = await readContent();
  return <SaanjhShell site={site} products={products}><SaanjhHome site={site} products={products} /></SaanjhShell>;
}
