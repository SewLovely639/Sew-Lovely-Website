import type { MetadataRoute } from "next";
import { readContent } from "@sew-lovely/cms";
import { absoluteUrl } from "./lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await readContent();
  const now = new Date();
  const collectionSlugs = new Set(["new-arrivals", "bestsellers", "indian-clothing", "suits", "kurtas", "sarees", "lehengas", "salwar-kameez", "abayas"]);
  products.forEach((product) => collectionSlugs.add(product.category.toLowerCase().replace(/\s+/g, "-")));
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/alterations"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...["/contact", "/shipping-delivery", "/returns-exchanges", "/sizing-guide", "/ready-to-ship", "/privacy-terms"].map((path) => ({ url: absoluteUrl(path), lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...Array.from(collectionSlugs).map((slug) => ({ url: absoluteUrl(`/collections/${slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((product) => ({ url: absoluteUrl(`/products/${product.id}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
