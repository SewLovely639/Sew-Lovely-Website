import { readContent } from "@sew-lovely/cms";
import { SaanjhCollection } from "../../components/saanjh-storefront";

export const dynamic = "force-dynamic";
export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const { site, products } = await readContent(); const normalizedSlug = slug.toLowerCase(); const matched = normalizedSlug === "indian-clothing" ? "Indian Clothing" : products.find((item) => item.category.toLowerCase().replace(/\s+/g, "-") === normalizedSlug)?.category ?? "all"; return <SaanjhCollection site={site} products={products} initialCategory={matched} />; }
