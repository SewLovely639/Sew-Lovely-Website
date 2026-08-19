import { existsSync, promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { z } from "zod";

const image = z.string().trim().min(1).max(1_500_000).refine(
  (value) => value.startsWith("https://") || /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value),
  "Use an HTTPS image URL or an image upload.",
);

const shortText = (min = 2, max = 120) => z.string().trim().min(min).max(max);
const longText = (min = 2, max = 350) => z.string().trim().min(min).max(max);

const productSchema = z.object({
  id: z.string().min(1),
  name: shortText(2, 120),
  description: longText(2, 300),
  price: z.number().nonnegative().finite(),
  category: shortText(2, 60),
  brand: shortText(2, 60),
  images: z.array(image).min(1).max(8),
  story: z.string().trim().max(1200).default(""),
  stylingTips: z.array(shortText(2, 180)).max(6).default([]),
  pairingSuggestions: z.array(shortText(2, 180)).max(6).default([]),
});

const navItem = z.object({
  label: shortText(2, 30),
  type: z.enum(["category", "brand", "anchor"]),
  value: shortText(1, 80),
});

const heroSlideSchema = z.object({ id: shortText(1, 80), eyebrow: shortText(2, 80), title: shortText(2, 100), emphasis: shortText(2, 100), description: longText(2, 350), image, imageAlt: shortText(2, 160), cta: shortText(2, 60) });
const pageSchema = z.object({
  eyebrow: shortText(2, 80),
  title: shortText(2, 100),
  emphasis: shortText(2, 100),
  description: longText(2, 350),
  image,
});

const posterSchema = z.object({
  name: shortText(2, 100),
  description: longText(2, 220),
  image,
  price: z.number().nonnegative().optional(),
});

const lookbookSchema = z.object({
  eyebrow: shortText(2, 80),
  title: shortText(2, 140),
  cta: shortText(2, 60),
  images: z.array(image).min(1).max(6),
});

const connectSchema = z.object({
  title: shortText(2, 80),
  description: longText(2, 220),
  whatsappUrl: z.string().url().max(300),
  whatsappLabel: shortText(2, 80),
  instagramUrl: z.string().url().max(300),
  instagramLabel: shortText(2, 80),
});

const siteSchema = z.object({
  navigation: z.array(navItem).min(1).max(10),
  hero: pageSchema,
  heroSlides: z.array(heroSlideSchema).max(6).default([]),
  heroPills: z.array(shortText(2, 40)).min(1).max(12),
  arrivalsTitle: shortText(2, 80),
  arrivalsDescription: longText(2, 200),
  collectionsTitle: shortText(2, 80),
  collectionsDescription: longText(2, 200),
  homeCategories: z.array(posterSchema).min(1).max(12),
  collectionOne: posterSchema.extend({ price: z.number().nonnegative() }),
  collectionTwo: posterSchema.extend({ price: z.number().nonnegative() }),
  abaya: pageSchema,
  alterations: pageSchema,
  lookbook: lookbookSchema,
  connect: connectSchema,
  newsletterTitle: shortText(2, 120),
  newsletterDescription: longText(2, 220),
  instagramTitle: shortText(2, 100),
  instagramImages: z.array(image).min(1).max(8),
  instagramLinks: z.array(z.string().url().max(300).or(z.literal(""))).max(8).default([]),
  footerDescription: longText(2, 220),
  storeAddress: z.string().trim().min(5).max(220),
  phone: shortText(5, 40),
  email: z.string().email().max(254),
});

const contentSchema = z.object({
  products: z.array(productSchema).max(200),
  site: siteSchema,
});

export type CmsProduct = z.infer<typeof productSchema>;
export type SiteContent = z.infer<typeof siteSchema>;
export type CmsContent = z.infer<typeof contentSchema>;

const base = "https://lh3.googleusercontent.com/aida-public/";

const urls = {
  hero: `${base}AB6AXuAYf1SHNj6xpKnozVeU5vsGATfIFwPEwtMlm4rXi9aF-zZepmqOeRfni1hbxWUI2yGCnpEMhIex7aoTVKqoCcLJKUnCAZGx9t6-m7R9q4avorw2IoRX5dC9Ay2jRZwZRFauIqVDXxwRNqHg-RlDsBwFPJC-4yRHP3Hr0OXgjUqc6PFQ9laFhwItkiLc3Uw_OsdkEMFGYx23_YMrHuMqPmOmH3KeFHcBiopz1mROhOoNA42vIJu5BXM0PbohEE1M8H9adg`,
  ivory: `${base}AB6AXuBOuedTSXKaA0yfxLploFAM2vXzCyr25jgFTcj4VDPt1Itky40WJ58MwlKABEz4tzv-HrzUn3FIGkTQJeeCTNYhRNIaDLqtLqHEs8OrVNPSd35_QIEDf8cfMMQmVcEbZii0pH1w_o6CcIkmb8gL2g-DUoA1LI3lf407EPEPBGyq653DQTDjvYXiOdF1LnBp7CB7bQJ1Olz-c7IUW7c2I-mDw3guWlNczPqyfbsk7hMlXoekOQyDGc8a`,
  mauve: `${base}AB6AXuAoFN3taxoT9tXFgKHYzXWaMIrnxm-Oric98a7sQzTlKi5LyL152-aQtD51lgsw5PXNWYxX99e-7wAhu6zVqUW-nbzFIbkHcd9IaTkNOsW1bwRZKd_myBkLmHU7k5IEcgGm0A2gahfFCtUeJO4I24rqTzV4F6cHyPNmjm4_CsiZgh7llwFZQ-3FHyha1Aj1khwFd368vTLT2y3xpXD0vNp_sYtohob-knJBY1EvQVYtJKo2orvsU49E`,
  olive: `${base}AB6AXuDSmkX0eJh2fkJmn79bH5r1uOvmSHAxKbFUVCkjXB4H1IdX7tezaVhLYSldlD5YC7Vrtrl4CuLD8XDH2PSeRx5XseVuVPi0nVcWYWGU8kcKcdujYPYjikNHZQkcReODw6Z8-tefwNrtfS2gtT3ik8RMB0hO882DfMmRtWHalfK24AJsU-ptZlgQ5810wueZ1C-DzaMzjFbYcbliYMiZcYejlUIbqN7SOPClrHiNiIfZhvlxPDcHbimF`,
  tailor: `${base}AB6AXuBUoUT0Re3oovfDwXgqscOI3ZIwa3DN1yrRrqhuaj5h4cFHZmgtek03sRzkrGK0bRgG7kIr2abe71-T4X48trQLQic_gOzT-4J8ms8gWV1pxrDjE76cGLQOPWfQwINqqfBFRq1dEcvIYwl4ImceRPMYlDoXpoxSq-xujV2gr_IyK60Z8niF3SnTHMuNYIoKSdY1FQpcMuGGbDf_DU2Jtss3ov2L9c8Td41_S2PaNmvgHpajfMAntsnN`,
};

const page = (eyebrow: string, title: string, emphasis: string, description: string, imageUrl: string) => ({
  eyebrow,
  title,
  emphasis,
  description,
  image: imageUrl,
});

const defaults: CmsContent = {
  products: [
    { id: "ivory-suit", name: "Ivory Embroidered 3-Piece Suit", description: "Handcrafted Silk Blend", price: 3450, category: "Suits", brand: "Sew Lovely", images: [urls.ivory], story: "A softly structured occasion set selected for its hand-finished embroidery and graceful movement.", stylingTips: ["Pair with pearl-toned jewellery for a quiet bridal finish.", "Add a tonal dupatta and a soft berry lip for evening celebrations."], pairingSuggestions: ["Costume jewellery edit", "Soft glam beauty essentials"] },
    { id: "mauve-set", name: "Mauve Floral Embroidered Set", description: "Premium Floral Collection", price: 2900, category: "Kurtas", brand: "Sew Lovely", images: [urls.mauve], story: "A romantic floral set for easy dressing with a little ceremony in every detail.", stylingTips: ["Style with metallic sandals and a compact shoulder bag.", "Keep accessories delicate to let the floral work lead."], pairingSuggestions: ["Mauve occasion edit", "Everyday adornment"] },
    { id: "olive-kurta", name: "Olive Green Embroidered Kurta Set", description: "Artisanal Cotton Silk", price: 2750, category: "Kurtas", brand: "Sew Lovely", images: [urls.olive], story: "An earthy cotton-silk silhouette with artisanal texture for celebrations and slow Sundays.", stylingTips: ["Try warm gold earrings and a woven clutch.", "Wear with a low bun for a clean, sculptural line."], pairingSuggestions: ["Artisanal cotton-silk edit", "Warm-toned beauty"] },
  ],
  site: {
    navigation: [
      { label: "Indian Clothing", type: "anchor", value: "services" },
      { label: "Suits", type: "category", value: "Suits" },
      { label: "Kurtas", type: "category", value: "Kurtas" },
      { label: "Bridal", type: "anchor", value: "lookbook" },
      { label: "Alterations", type: "anchor", value: "services" },
    ],
    heroSlides: [
      { id: "hero-alterations", eyebrow: "Alterations, made personal", title: "Wear your", emphasis: "story.", description: "Tailoring, Indian fashion, beauty and costume jewellery — thoughtfully chosen and made to feel like you.", image: urls.hero, imageAlt: "Sew Lovely hero editorial", cta: "Explore the edit" },
      { id: "hero-festive", eyebrow: "The festive edit", title: "Dress for", emphasis: "the moment.", description: "Indian silhouettes, rich textiles and easy pairings for the celebrations already on your calendar.", image: urls.olive, imageAlt: "Indian festive clothing detail", cta: "Shop clothing" },
      { id: "hero-adornment", eyebrow: "Adornment, reimagined", title: "Details make", emphasis: "the look.", description: "Find the finishing touch in costume jewellery, beauty rituals and pieces that make everyday feel special.", image: urls.mauve, imageAlt: "Jewellery and beauty detail", cta: "Find your lovely" },
    ],
    hero: page("Indian Elegance", "Find Your Perfect Fit", "With Skilled Alterations", "What are you looking for?", urls.hero),
    heroPills: ["Alterations", "Indian Clothing", "Make-up Brands", "Costume Jewellery", "Sarees", "Kurtas"],
    arrivalsTitle: "Featured Services",
    arrivalsDescription: "Alterations, Indian clothing and finishing touches selected for Sew Lovely customers.",
    collectionsTitle: "Popular Products",
    collectionsDescription: "Customer favourites from our latest stock.",
    homeCategories: [
      { name: "Alterations", description: "Expert tailoring and fitting", image: urls.tailor },
      { name: "Indian Clothing", description: "Ready-to-wear and occasion pieces", image: urls.hero },
      { name: "Make-up Brands", description: "Beauty essentials in store", image: urls.ivory },
      { name: "Costume Jewellery", description: "Finishing touches for every outfit", image: urls.mauve },
      { name: "Sarees", description: "Classic drapes and festive styles", image: urls.olive },
      { name: "Kurtas", description: "Everyday and occasion kurta sets", image: urls.mauve },
      { name: "Bridal Wear", description: "Special occasion styling", image: urls.ivory },
      { name: "Custom Tailoring", description: "Made and adjusted for your fit", image: urls.tailor },
    ],
    collectionOne: { name: "Designer Gown Series", description: "Hand-embroidery on premium silk", image: urls.mauve, price: 5000 },
    collectionTwo: { name: "Floral Long Dresses", description: "Artisanal prints and textures", image: urls.olive, price: 5000 },
    abaya: page("New arrival", "Premium", "Abaya Collection", "Modesty meets high-fashion with intricate beadwork and premium fabrics.", urls.olive),
    alterations: page("Our services", "Expert", "Alterations", "Our in-house master tailors preserve craftsmanship while perfecting your silhouette.", urls.tailor),
    lookbook: {
      eyebrow: "Now In Store",
      title: "Fresh Indian Clothing Stock and New Costume Jewellery Sets",
      cta: "Visit Us Today",
      images: [urls.mauve, urls.olive, urls.tailor],
    },
    connect: {
      title: "Scan & Connect",
      description: "Join our WhatsApp group or follow us on Instagram for new arrivals",
      whatsappUrl: "https://wa.me/26771677786",
      whatsappLabel: "Scan For WhatsApp Group",
      instagramUrl: "https://instagram.com/sewlovelybw",
      instagramLabel: "@SEWLOVELYBW",
    },
    newsletterTitle: "Subscribe for alteration tips and updates on new arrivals",
    newsletterDescription: "Exclusive launches, artisanal stories and styling tips.",
    instagramTitle: "Follow us on Instagram",
    instagramImages: [urls.ivory, urls.mauve, urls.olive, urls.tailor],
    instagramLinks: ["", "", "", ""],
    footerDescription: "Artisanal Indian Ethnic Wear.\nCelebrating heritage through craftsmanship.",
    storeAddress: "Plot 1007, African Mall\nGaborone, Botswana",
    phone: "+267 71 234 567",
    email: "hello@sewlovely.com",
  },
};

function repoRoot() {
  let current = process.cwd();
  while (!existsSync(path.join(current, "pnpm-workspace.yaml"))) {
    const parent = path.dirname(current);
    if (parent === current) return process.cwd();
    current = parent;
  }
  return current;
}

function filePath() {
  return process.env.SEW_LOVELY_CONTENT_FILE || path.join(repoRoot(), "packages", "cms", "data", "content.json");
}

function toPage(source: Record<string, unknown>, prefix: string, fallback: SiteContent["hero"]) {
  const legacyPrefix = prefix === "alterations" ? "alteration" : prefix;
  return page(
    String(source[`${legacyPrefix}Eyebrow`] ?? fallback.eyebrow),
    String(source[`${legacyPrefix}Title`] ?? fallback.title),
    String(source[`${legacyPrefix}Emphasis`] ?? fallback.emphasis),
    String(source[`${legacyPrefix}Description`] ?? fallback.description),
    String(source[`${legacyPrefix}Image`] ?? fallback.image),
  );
}

function stringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.length ? value.map(String) : fallback;
}

function imageArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.length ? value.map(String) : fallback;
}

function posterArray(value: unknown, fallback: SiteContent["homeCategories"]) {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  return value.map((item, index) => {
    const entry = item as Partial<SiteContent["homeCategories"][number]>;
    const safeFallback = fallback[index % fallback.length];
    return {
      name: String(entry.name ?? safeFallback.name),
      description: String(entry.description ?? safeFallback.description),
      image: String(entry.image ?? safeFallback.image),
      price: entry.price === undefined ? undefined : Number(entry.price),
    };
  });
}

function migrate(raw: unknown): CmsContent {
  const legacy = raw as { products?: Array<Record<string, unknown>>; site?: Record<string, unknown> };
  const products = (legacy.products ?? []).map((item) => ({
    id: String(item.id ?? randomUUID()),
    name: String(item.name ?? "Untitled product"),
    description: String(item.description ?? item.subtitle ?? "Product details"),
    price: Number(item.price ?? 0),
    category: String(item.category ?? "Uncategorized"),
    brand: String(item.brand ?? "Sew Lovely"),
    images: Array.isArray(item.images) ? item.images.map(String) : [String(item.image ?? urls.ivory)],
    story: String(item.story ?? ""),
    stylingTips: Array.isArray(item.stylingTips) ? item.stylingTips.map(String) : [],
    pairingSuggestions: Array.isArray(item.pairingSuggestions) ? item.pairingSuggestions.map(String) : [],
  }));

  const source = legacy.site ?? {};
  const lookbook = (source.lookbook ?? {}) as Partial<SiteContent["lookbook"]>;
  const connect = (source.connect ?? {}) as Partial<SiteContent["connect"]>;
  const site = {
    ...defaults.site,
    ...source,
    hero: source.hero ?? toPage(source, "hero", defaults.site.hero),
    abaya: source.abaya ?? toPage(source, "abaya", defaults.site.abaya),
    alterations: source.alterations ?? toPage(source, "alterations", defaults.site.alterations),
    heroPills: stringArray(source.heroPills, defaults.site.heroPills),
    homeCategories: posterArray(source.homeCategories, defaults.site.homeCategories),
    collectionOne: {
      name: String(source.collectionOneName ?? (source.collectionOne as SiteContent["collectionOne"] | undefined)?.name ?? defaults.site.collectionOne.name),
      description: String(source.collectionOneDescription ?? (source.collectionOne as SiteContent["collectionOne"] | undefined)?.description ?? defaults.site.collectionOne.description),
      image: String(source.collectionOneImage ?? (source.collectionOne as SiteContent["collectionOne"] | undefined)?.image ?? defaults.site.collectionOne.image),
      price: Number(source.collectionOnePrice ?? (source.collectionOne as SiteContent["collectionOne"] | undefined)?.price ?? defaults.site.collectionOne.price),
    },
    collectionTwo: {
      name: String(source.collectionTwoName ?? (source.collectionTwo as SiteContent["collectionTwo"] | undefined)?.name ?? defaults.site.collectionTwo.name),
      description: String(source.collectionTwoDescription ?? (source.collectionTwo as SiteContent["collectionTwo"] | undefined)?.description ?? defaults.site.collectionTwo.description),
      image: String(source.collectionTwoImage ?? (source.collectionTwo as SiteContent["collectionTwo"] | undefined)?.image ?? defaults.site.collectionTwo.image),
      price: Number(source.collectionTwoPrice ?? (source.collectionTwo as SiteContent["collectionTwo"] | undefined)?.price ?? defaults.site.collectionTwo.price),
    },
    lookbook: {
      ...defaults.site.lookbook,
      ...lookbook,
      images: imageArray(lookbook.images, defaults.site.lookbook.images),
    },
    connect: {
      ...defaults.site.connect,
      ...connect,
    },
    instagramImages: imageArray(source.instagramImages, defaults.site.instagramImages),
    instagramLinks: Array.isArray(source.instagramLinks) ? source.instagramLinks.map(String).slice(0, 8) : defaults.site.instagramLinks,
  };

  const normalizedSite = { ...site, heroSlides: Array.isArray(source.heroSlides) && source.heroSlides.length ? source.heroSlides : defaults.site.heroSlides };
  return contentSchema.parse({ products: products.length ? products : defaults.products, site: normalizedSite });
}

export async function readContent() {
  try {
    return migrate(JSON.parse(await fs.readFile(filePath(), "utf8")));
  } catch {
    return defaults;
  }
}

export async function writeContent(input: CmsContent) {
  const content = contentSchema.parse(input);
  await fs.mkdir(path.dirname(filePath()), { recursive: true });
  await fs.writeFile(filePath(), JSON.stringify(content, null, 2));
  return content;
}

export async function upsertProduct(input: CmsProduct) {
  const content = await readContent();
  const product = productSchema.parse(input);
  const index = content.products.findIndex((item) => item.id === product.id);
  if (index < 0) content.products.unshift(product);
  else content.products[index] = product;
  return writeContent(content);
}

export async function removeProduct(id: string) {
  const content = await readContent();
  return writeContent({ ...content, products: content.products.filter((item) => item.id !== id) });
}

export async function updateSite(input: SiteContent) {
  const content = await readContent();
  return writeContent({ ...content, site: siteSchema.parse(input) });
}

export const cmsSchemas = { product: productSchema, site: siteSchema };






