import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./saanjh-checkout.tsx", import.meta.url), "utf8");
const storefrontSource = readFileSync(new URL("./saanjh-storefront.tsx", import.meta.url), "utf8");
const gallerySource = readFileSync(new URL("./workroom-video-gallery.tsx", import.meta.url), "utf8");
const productDetailSource = readFileSync(new URL("./product-detail.tsx", import.meta.url), "utf8");
const collectionRouteSource = readFileSync(new URL("../collections/[slug]/page.tsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../globals.css", import.meta.url), "utf8");

test("transferred checkout preserves Sew Lovely draft persistence and live order submission", () => {
  assert.match(source, /readCheckoutDraft\(\)/);
  assert.match(source, /saveCheckoutDraft\(next\)/);
  assert.match(source, /fetch\("\/api\/orders"/);
  assert.match(source, /"idempotency-key": crypto\.randomUUID\(\)/);
  assert.match(source, /const steps = \["Contact", "Delivery", "Shipping", "Payment"\]/);
  assert.match(source, /promoCode/);
  assert.match(source, /w-full max-w-\[1240px\] px-0/);
  assert.match(source, /cash_on_delivery/);
  assert.match(source, /pay_in_store/);
  assert.doesNotMatch(source, /Place demo order/);
});

test("storefront keeps cart controls, visible cancellation, and responsive media contracts", () => {
  assert.match(storefrontSource, /function NoticeToast\(/);
  assert.match(storefrontSource, /onClick=\{onClose\}[^>]*aria-label="Dismiss notification"/);
  assert.match(storefrontSource, /cart\.remove\(line\.lineId \?\? line\.id\)/);
  assert.match(storefrontSource, /cart\.update\(line\.lineId \?\? line\.id, line\.qty - 1\)/);
  assert.match(storefrontSource, /cart\.update\(line\.lineId \?\? line\.id, line\.qty \+ 1\)/);
  assert.match(storefrontSource, /sew-hero-frame/);
  assert.match(storefrontSource, /loading=\{index === 0 \? "eager" : "lazy"\}/);
  assert.match(storefrontSource, /sew-editorial-tile/);
  assert.match(storefrontSource, /grid grid-cols-2 gap-x-3/);
  assert.match(storefrontSource, /sm:grid-cols-2.*lg:grid-cols-4/);
  assert.match(storefrontSource, /aspect-\[\.95\] sm:aspect-\[\.79\]/);
  assert.match(gallerySource, /href=\{`\/products\/\$\{taggedProducts\[0\]\.id\}`\}/);
  assert.match(gallerySource, /Shop now/);
  assert.match(gallerySource, /sew-editorial-grid/);
  assert.match(gallerySource, /sew-editorial-tile/);
  assert.match(gallerySource, /nearViewport/);
  assert.match(storefrontSource, /sew-editorial-grid/);
  assert.match(cssSource, /\.sew-editorial-grid \{ display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); gap: \.25rem; \}/);
  assert.match(gallerySource, /preload=\{nearViewport \? "metadata" : "none"\}/);
  assert.match(cssSource, /\.sew-editorial-tile \{ min-width: 0; aspect-ratio: 1 \/ 1\.05; \}/);
  assert.match(productDetailSource, /aria-label="Dismiss notification"/);
  assert.match(productDetailSource, /setNotice\(""\)/);
  assert.match(storefrontSource, /isIndianClothing/);
  assert.match(storefrontSource, /indianClothingCategories\.has/);
  assert.match(collectionRouteSource, /normalizedSlug === "indian-clothing"/);
});
