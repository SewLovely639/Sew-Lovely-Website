import type { Metadata } from "next";
import { readContent } from "@sew-lovely/cms";
import { notFound } from "next/navigation";
import { SaanjhCollection } from "../../components/saanjh-storefront";
import { getCollectionCopy } from "../../lib/collection-content";

export const dynamic = "force-dynamic";

async function resolveCollection(slug: string) {
  const { products } = await readContent();
  const normalizedSlug = slug.toLowerCase();
  if (["new-arrivals", "bestsellers", "all"].includes(normalizedSlug)) return { category: "all", canonicalSlug: "new-arrivals" };
  if (normalizedSlug === "indian-clothing") return { category: "Indian Clothing", canonicalSlug: normalizedSlug };
  const matched = products.find((item) => item.category.toLowerCase().replace(/\s+/g, "-") === normalizedSlug)?.category;
  if (matched) return { category: matched, canonicalSlug: normalizedSlug };
  if (["sarees", "lehengas", "salwar-kameez", "costume-jewellery", "abayas"].includes(normalizedSlug)) return { category: normalizedSlug.replace(/-/g, " "), canonicalSlug: normalizedSlug };
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveCollection(slug);
  if (!resolved) return { title: "Collection not found", robots: { index: false, follow: false } };
  const copy = getCollectionCopy(resolved.category);
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: `/collections/${resolved.canonicalSlug}` },
    openGraph: { url: `/collections/${resolved.canonicalSlug}`, title: `${copy.title} | Sew Lovely`, description: copy.description },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resolved = await resolveCollection(slug);
  if (!resolved) notFound();
  const { site, products } = await readContent();
  return <SaanjhCollection site={site} products={products} initialCategory={resolved.category} />;
}
