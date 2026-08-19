import assert from "node:assert/strict";
import test from "node:test";
import { cmsSchemas } from "@sew-lovely/cms";

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
