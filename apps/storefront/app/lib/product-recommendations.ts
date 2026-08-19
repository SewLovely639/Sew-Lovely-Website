export type RelatedProduct = { id: string; category: string };

export function getRelatedProducts<T extends RelatedProduct>(products: T[], currentProduct: T, limit = 3) {
  const sameCategory = products.filter((item) => item.id !== currentProduct.id && item.category === currentProduct.category);
  const otherCategories = products.filter((item) => item.id !== currentProduct.id && item.category !== currentProduct.category);
  return [...sameCategory, ...otherCategories].slice(0, limit);
}
