import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./hero-editor.tsx", import.meta.url), "utf8");

test("hero image uploads use the shared streamed R2 endpoint instead of base64 CMS values", () => {
  assert.match(source, /fetch\("\/api\/media"/);
  assert.match(source, /x-sew-lovely-content-sha256/);
  assert.match(source, /crypto\.subtle\.digest\("SHA-256"/);
  assert.doesNotMatch(source, /FileReader|readAsDataURL/);
});
