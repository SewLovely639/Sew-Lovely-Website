import type { Metadata } from "next";
import { readContent } from "@sew-lovely/cms";
import { buildTaxonomyTree, collectionHref, collectionSlug, descendantLabels, findTaxonomyNode } from "@sew-lovely/cms/taxonomy";
import { notFound } from "next/navigation";
import { SaanjhCollection } from "../../../components/saanjh-storefront";
import { getCollectionCopy } from "../../../lib/collection-content";

export const dynamic = "force-dynamic";

type Breadcrumb = { label: string; href: string };
type ResolvedCollection = {
  categories: string[];
  subcategories: Array<{ label: string; href: string }>;
  subcategoryLabels: string[];
  activeSubcategory?: string;
  breadcrumb: Breadcrumb[];
  canonicalSlug: string;
  title: string;
};

async function resolveCollection(slug: string, path: string[] = []): Promise<ResolvedCollection | null> {
  const { products, site } = await readContent();
  const tree = buildTaxonomyTree(site.taxonomy);
  const rootSlug = slug.toLowerCase();
  const segments = path.map((segment) => segment.toLowerCase());

  if (!segments.length && ["new-arrivals", "all"].includes(rootSlug)) {
    return { categories: ["all"], subcategories: [], subcategoryLabels: [], breadcrumb: [{ label: "New arrivals", href: "/collections/new-arrivals" }], canonicalSlug: "new-arrivals", title: "New Arrivals" };
  }
  if (!segments.length && rootSlug === "bestsellers") {
    return { categories: ["all"], subcategories: [], subcategoryLabels: [], breadcrumb: [{ label: "Best sellers", href: "/collections/bestsellers" }], canonicalSlug: "bestsellers", title: "Best sellers" };
  }

  const group = site.taxonomy.categoryGroups.find((entry) => collectionSlug(entry.label) === rootSlug);
  const category = site.taxonomy.categories.find((entry) => collectionSlug(entry) === rootSlug)
    ?? products.find((product) => collectionSlug(product.category) === rootSlug)?.category;
  const legacyCategory = ["sarees", "lehengas", "salwar-kameez", "costume-jewellery", "abayas"].includes(rootSlug)
    ? rootSlug.replace(/-/g, " ")
    : undefined;

  if (!group && !category && !legacyCategory) return null;

  const rootLabel = group?.label ?? category ?? legacyCategory!;
  const rootHref = `/collections/${collectionSlug(rootLabel)}`;
  const rootCategories = group ? group.categories : [category ?? legacyCategory!];
  let currentNode = group ? undefined : findTaxonomyNode(tree, rootCategories[0]);
  let trail: string[] = group ? [] : [rootCategories[0]];
  let remaining = [...segments];

  // A grouped URL can begin with the category (e.g. /collections/indian-clothing/suits).
  if (group && remaining.length) {
    const matched = rootCategories.find((entry) => collectionSlug(entry) === remaining[0]);
    if (!matched) return null;
    currentNode = findTaxonomyNode(tree, matched);
    trail = [matched];
    remaining = remaining.slice(1);
  }

  for (const segment of remaining) {
    const matched = currentNode?.children.find((entry) => collectionSlug(entry.label) === segment);
    if (!matched) return null;
    currentNode = matched;
    trail = [...trail, matched.label];
  }

  const nodeLabel = currentNode?.label ?? (group ? group.label : rootCategories[0]);
  const categoryRoot = trail[0] ?? rootCategories[0];
  const canonicalPath = trail.length ? trail : group ? [] : [categoryRoot];
  const canonicalSlug = canonicalPath.length ? canonicalPath.map(collectionSlug).join("/") : collectionSlug(rootLabel);
  const children = currentNode?.children ?? (group && !trail.length ? rootCategories.map((entry) => findTaxonomyNode(tree, entry)).filter((entry): entry is NonNullable<ReturnType<typeof findTaxonomyNode>> => Boolean(entry)) : []);
  const subcategories = children.map((entry) => ({
    label: entry.label,
    href: collectionHref(trail.length ? [...trail, entry.label] : [entry.label]),
  }));
  const inSubcategory = Boolean(currentNode && (group ? trail.length > 0 : trail.length > 1));
  const subcategoryLabels = currentNode && inSubcategory ? [currentNode.label, ...descendantLabels(currentNode)] : [];

  const breadcrumb: Breadcrumb[] = [{ label: group ? group.label : categoryRoot, href: rootHref }];
  if (currentNode && (group || trail.length > 1)) {
    let running = [categoryRoot];
    breadcrumb.push({ label: categoryRoot, href: collectionHref(running) });
    for (const label of trail.slice(1)) {
      running = [...running, label];
      breadcrumb.push({ label, href: collectionHref(running) });
    }
  }

  return {
    categories: group && !trail.length ? rootCategories : [categoryRoot],
    subcategories,
    subcategoryLabels,
    activeSubcategory: currentNode && inSubcategory ? nodeLabel : undefined,
    breadcrumb: dedupeBreadcrumb(breadcrumb),
    canonicalSlug,
    title: nodeLabel,
  };
}

function dedupeBreadcrumb(breadcrumb: Breadcrumb[]) {
  const seen = new Set<string>();
  return breadcrumb.filter((entry) => {
    if (seen.has(entry.href)) return false;
    seen.add(entry.href);
    return true;
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; path?: string[] }> }): Promise<Metadata> {
  const { slug, path } = await params;
  const resolved = await resolveCollection(slug, path ?? []);
  if (!resolved) return { title: "Collection not found", robots: { index: false, follow: false } };
  const copy = getCollectionCopy(resolved.title);
  return {
    title: `${resolved.title} | Sew Lovely`,
    description: copy.description,
    alternates: { canonical: `/collections/${resolved.canonicalSlug}` },
    openGraph: { url: `/collections/${resolved.canonicalSlug}`, title: `${resolved.title} | Sew Lovely`, description: copy.description },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string; path?: string[] }> }) {
  const { slug, path } = await params;
  const resolved = await resolveCollection(slug, path ?? []);
  if (!resolved) notFound();
  const { site, products } = await readContent();
  return <SaanjhCollection
    site={site}
    products={products}
    initialCategories={resolved.categories}
    initialSubcategories={resolved.subcategoryLabels}
    collectionTitle={resolved.title}
    breadcrumb={resolved.breadcrumb}
    subcategories={resolved.subcategories}
    activeSubcategory={resolved.activeSubcategory}
  />;
}
