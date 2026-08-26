import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./saanjh-checkout.tsx", import.meta.url), "utf8");
const storefrontSource = readFileSync(new URL("./saanjh-storefront.tsx", import.meta.url), "utf8");
const gallerySource = readFileSync(new URL("./workroom-video-gallery.tsx", import.meta.url), "utf8");
const productDetailSource = readFileSync(new URL("./product-detail.tsx", import.meta.url), "utf8");

test("transferred checkout preserves Sew Lovely draft persistence and live order submission", () => {
  assert.match(source, /readCheckoutDraft\(\)/);
  assert.match(source, /saveCheckoutDraft\(next\)/);
  assert.match(source, /fetch\("\/api\/orders"/);
  assert.match(source, /"idempotency-key": crypto\.randomUUID\(\)/);
  assert.match(source, /const steps = \["Contact", "Delivery", "Shipping", "Payment"\]/);
  assert.match(source, /promoCode/);
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
  assert.match(storefrontSource, /min-h-\[500px\]/);
  assert.match(storefrontSource, /aspect-\[\.82\]/);
  assert.match(storefrontSource, /sm:grid-cols-2 lg:grid-cols-4/);
  assert.match(gallerySource, /href=\{`\/products\/\$\{taggedProducts\[0\]\.id\}`\}/);
  assert.match(gallerySource, /Shop now/);
  assert.match(gallerySource, /min-w-\[43%\]/);
  assert.match(productDetailSource, /aria-label="Dismiss notification"/);
  assert.match(productDetailSource, /setNotice\(""\)/);
});
