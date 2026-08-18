import { readContent } from "../packages/cms/src/index.ts";

const content = await readContent();
if (!content.site.heroSlides.length) throw new Error("Expected at least one hero slide");
if (content.site.heroSlides.some((slide) => !slide.image || !slide.title || !slide.description)) throw new Error("Hero slides must contain image, title, and description");
console.log(JSON.stringify({ heroSlides: content.site.heroSlides.length, products: content.products.length, navigation: content.site.navigation.length }));

