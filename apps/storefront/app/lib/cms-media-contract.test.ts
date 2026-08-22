import assert from "node:assert/strict";
import test from "node:test";
import { cmsSchemas, readContent } from "@sew-lovely/cms";

const product = {
  id: "media-test",
  name: "Media test piece",
  description: "A test product used only to validate image URL storage.",
  price: 1,
  category: "Tests",
  brand: "Sew Lovely",
  images: ["https://pub-5620ca196c674ca09cc311878651751d.r2.dev/storefront/sha256/example.webp"],
  story: "",
  stylingTips: [],
  pairingSuggestions: [],
};

test("CMS accepts immutable HTTPS media URLs and rejects base64 image payloads", () => {
  assert.equal(cmsSchemas.product.safeParse(product).success, true);
  assert.equal(cmsSchemas.product.safeParse({ ...product, images: ["data:image/png;base64,AAAA"] }).success, false);
});

test("CMS supports managed product sections, size ranges, and safe badge treatments", () => {
  const configured = { ...product, productDetails: "Hand-finished embroidery.", fabricAndFit: "Silk blend with a relaxed fit.", careInstructions: "Dry clean only.", sizes: ["S", "M", "L", "XL", "Custom", "Unstitched"], badge: { label: "50% off", tone: "discount" as const } };
  assert.equal(cmsSchemas.product.safeParse(configured).success, true);
  assert.equal(cmsSchemas.product.safeParse({ ...configured, sizes: [] }).success, false);
  assert.equal(cmsSchemas.product.safeParse({ ...configured, badge: { label: "Sale", tone: "invalid" } }).success, false);
});

test("CMS preserves category imagery and safe destinations for navigation and hero tiles", async () => {
  const content = await readContent();
  const navigation = [{ label: "Festive", type: "category" as const, value: "Festive", image: "https://pub-5620ca196c674ca09cc311878651751d.r2.dev/storefront/sha256/festive.webp", destination: "/collections/festive" }];
  const homeCategories = [{ ...content.site.homeCategories[0], destination: "/collections/festive" }];
  assert.equal(cmsSchemas.site.safeParse({ ...content.site, navigation, homeCategories }).success, true);
  assert.equal(cmsSchemas.site.safeParse({ ...content.site, navigation: [{ ...navigation[0], destination: "javascript:alert(1)" }], homeCategories }).success, false);
});

test("CMS accepts a managed category and brand taxonomy", async () => {
  const content = await readContent();
  assert.equal(cmsSchemas.site.safeParse({ ...content.site, taxonomy: { categories: ["Suits", "Kurtas", "Bridal"], brands: ["Sew Lovely", "Atelier Edit"] } }).success, true);
  assert.equal(cmsSchemas.site.safeParse({ ...content.site, taxonomy: { categories: [], brands: ["Sew Lovely"] } }).success, false);
});

test("CMS accepts managed workroom MP4 videos, multiple product tags, and safe custom shopping buttons", async () => {
  const content = await readContent();
  const workroomVideos = [{ id: "workroom-test", src: "https://pub-5620ca196c674ca09cc311878651751d.r2.dev/storefront/sha256/workroom-test.mp4", label: "Hand-finishing a festive look", startAt: 1.5, productIds: ["ivory-suit", "mauve-set"], buttonLabel: "Shop the look", buttonColor: "#cc1f76" }];
  assert.equal(cmsSchemas.site.safeParse({ ...content.site, workroomVideos }).success, true);
  assert.equal(cmsSchemas.site.safeParse({ ...content.site, workroomVideos: [{ ...workroomVideos[0], src: "javascript:alert(1)" }] }).success, false);
  assert.equal(cmsSchemas.site.safeParse({ ...content.site, workroomVideos: [{ ...workroomVideos[0], productIds: Array.from({ length: 9 }, (_, index) => `product-${index}`) }] }).success, false);
  assert.equal(cmsSchemas.site.safeParse({ ...content.site, workroomVideos: [{ ...workroomVideos[0], buttonColor: "magenta" }] }).success, false);
});
