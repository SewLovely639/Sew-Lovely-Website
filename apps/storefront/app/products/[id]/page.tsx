import { readContent } from "@sew-lovely/cms";
import { notFound } from "next/navigation";
import { ProductDetail } from "../../components/product-detail";
import { SaanjhShell } from "../../components/saanjh-storefront";

export const dynamic = "force-dynamic";
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const { site, products } = await readContent(); const product = products.find((item) => item.id === id); if (!product) notFound(); return <SaanjhShell site={site} products={products}><ProductDetail site={site} products={products} product={product} /></SaanjhShell>; }
