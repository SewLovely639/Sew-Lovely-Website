import type { Metadata } from "next";
import { readContent } from "@sew-lovely/cms";
import { notFound } from "next/navigation";
import { ProductDetail } from "../../components/product-detail";
import { SaanjhShell } from "../../components/saanjh-storefront";
import { absoluteUrl, serializeJsonLd } from "../../lib/seo";

export const dynamic = "force-dynamic";

async function getProduct(id: string) {
  const { products } = await readContent();
  return products.find((item) => item.id === id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };
  const primaryKeyword = product.category.toLowerCase();
  const description = `${product.name} ${primaryKeyword} from Sew Lovely. ${product.story || product.description}`.slice(0, 158);
  return {
    title: `${product.name} – ${product.category}`,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: { type: "website", url: `/products/${product.id}`, title: `${product.name} – ${product.category} | Sew Lovely`, description, images: [{ url: product.images[0], alt: `${product.name} ${primaryKeyword}` }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site, products } = await readContent();
  const product = products.find((item) => item.id === id);
  if (!product) notFound();
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.story || product.description,
    category: product.category,
    brand: { "@type": "Brand", name: product.brand },
    offers: { "@type": "Offer", url: absoluteUrl(`/products/${product.id}`), priceCurrency: "BWP", price: product.price.toFixed(2), availability: "https://schema.org/InStock", seller: { "@id": absoluteUrl("/#store") } },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: product.category, item: absoluteUrl(`/collections/${product.category.toLowerCase().replace(/\s+/g, "-")}`) },
      { "@type": "ListItem", position: 3, name: product.name, item: absoluteUrl(`/products/${product.id}`) },
    ],
  };
  return <SaanjhShell site={site} products={products}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} /><ProductDetail site={site} products={products} product={product} /></SaanjhShell>;
}
