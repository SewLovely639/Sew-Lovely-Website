export const collectionCopy: Record<string, { title: string; description: string; eyebrow: string; detail: string }> = {
  "indian clothing": {
    title: "Indian Clothing in Gaborone",
    eyebrow: "Indian clothing in Botswana",
    description: "Browse Indian occasion wear, embroidered suits and kurta sets available from Sew Lovely in Gaborone. Visit our African Mall boutique for current in-store pieces, accessories and fit guidance.",
    detail: "Looking for Indian outfits in Botswana? Our edit includes pieces for celebrations, family occasions and everyday dressing. Stock changes as new pieces arrive, and the Sew Lovely team can help you think through size, styling and alterations before you choose.",
  },
  lehengas: {
    title: "Lehenga Online | Bridal & Party Wear Lehengas",
    eyebrow: "Bridal and party wear lehengas",
    description: "Explore bridal, party wear, and designer lehengas online at Sew Lovely. Discover premium fabrics, detailed embroidery, and occasion-ready styles with fit guidance in Gaborone.",
    detail: "From a wedding guest lehenga to a bridal celebration look, choose a silhouette that feels comfortable, expressive and easy to style. Ask Sew Lovely about current availability, sizing and alterations.",
  },
  abayas: {
    title: "Abayas Online | Modest & Elegant Abaya Collection",
    eyebrow: "Modest and elegant abayas",
    description: "Shop classic, embroidered, and occasion abayas online at Sew Lovely. Find modest, elegant designs in breathable fabrics for everyday wear and festive occasions.",
    detail: "A well-chosen abaya balances movement, coverage and personal style. Browse the current edit and contact Sew Lovely for help with sizing, styling or availability.",
  },
  suits: {
    title: "Indian Suits in Gaborone",
    eyebrow: "Suits and occasion wear",
    description: "Shop embroidered Indian suits and three-piece occasion sets in Gaborone, with fit guidance and alteration support available from Sew Lovely.",
    detail: "Explore current suit pieces online, then contact or visit Sew Lovely at African Mall to check in-store availability, sizing and finishing options.",
  },
  kurtas: {
    title: "Kurta Sets in Gaborone",
    eyebrow: "Everyday and occasion kurtas",
    description: "Find embroidered kurta sets in Gaborone for celebrations, easy dressing and thoughtful everyday style. Ask Sew Lovely about sizing and fit support.",
    detail: "A kurta set can move between everyday wear and special occasions with the right fit and accessories. Browse the current edit and contact us if you need help choosing a size or arranging an alteration.",
  },
  sarees: {
    title: "Sarees in Gaborone",
    eyebrow: "Sarees and Indian occasion wear",
    description: "Looking for sarees in Gaborone? Browse Sew Lovely’s current Indian occasion-wear edit and contact the boutique to check the latest in-store saree availability.",
    detail: "Saree stock can change quickly, so the most useful next step is to contact Sew Lovely before visiting if you have a particular colour, fabric or occasion in mind.",
  },
};

export function getCollectionCopy(category: string) {
  return collectionCopy[category.toLowerCase()] ?? {
    title: category === "all" ? "New Arrivals" : category,
    eyebrow: "The collection",
    description: "An edit of considered pieces for celebrations, everyday dressing and the moments that deserve a little more thought.",
    detail: "Explore the current Sew Lovely edit online, or contact the boutique for help with availability, sizing and styling.",
  };
}
