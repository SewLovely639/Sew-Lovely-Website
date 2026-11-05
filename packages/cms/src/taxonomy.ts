export type TaxonomyNode = { label: string; parent: string | null; children: TaxonomyNode[] };

export type TaxonomySource = {
  categories: string[];
  subcategories: Array<{ label: string; parent: string }>;
};

export const collectionSlug = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/['’]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

export function collectionHref(path: string[]) {
  return `/collections/${path.map(collectionSlug).filter(Boolean).join("/")}`;
}

/** Builds the category -> subcategory -> … tree used by both the admin and the storefront. */
export function buildTaxonomyTree(taxonomy: TaxonomySource): TaxonomyNode[] {
  const nodes = new Map<string, TaxonomyNode>();
  for (const label of taxonomy.categories) {
    if (!nodes.has(label)) nodes.set(label, { label, parent: null, children: [] });
  }
  for (const subcategory of taxonomy.subcategories) {
    if (nodes.has(subcategory.label)) continue;
    nodes.set(subcategory.label, { label: subcategory.label, parent: subcategory.parent, children: [] });
  }
  const roots: TaxonomyNode[] = [];
  for (const node of nodes.values()) {
    if (!node.parent) { roots.push(node); continue; }
    const parent = nodes.get(node.parent);
    if (parent && parent !== node) parent.children.push(node);
  }
  return roots;
}

export function findTaxonomyNode(tree: TaxonomyNode[], label: string): TaxonomyNode | undefined {
  for (const node of tree) {
    if (node.label === label) return node;
    const found = findTaxonomyNode(node.children, label);
    if (found) return found;
  }
  return undefined;
}

export function taxonomyPath(tree: TaxonomyNode[], label: string): TaxonomyNode[] {
  for (const node of tree) {
    if (node.label === label) return [node];
    const childPath = taxonomyPath(node.children, label);
    if (childPath.length) return [node, ...childPath];
  }
  return [];
}

export function descendantLabels(node: TaxonomyNode): string[] {
  return node.children.flatMap((child) => [child.label, ...descendantLabels(child)]);
}

/** A flattened, indented list for admin dropdowns and pickers. */
export function flattenTaxonomy(tree: TaxonomyNode[], parents: string[] = []): Array<{ label: string; depth: number; path: string[] }> {
  return tree.flatMap((node) => {
    const path = [...parents, node.label];
    return [
      { label: node.label, depth: parents.length, path },
      ...flattenTaxonomy(node.children, path),
    ];
  });
}
