export type CartLineReference = { id: string; lineId?: string };

export function resolveCartLineKey(items: CartLineReference[], key: string) {
  if (items.some((item) => (item.lineId ?? item.id) === key)) return key;
  const matchingProductLines = items.filter((item) => item.id === key);
  return matchingProductLines.length === 1 ? (matchingProductLines[0].lineId ?? matchingProductLines[0].id) : key;
}
