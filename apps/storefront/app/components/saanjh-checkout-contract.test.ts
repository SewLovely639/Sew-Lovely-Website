import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./saanjh-checkout.tsx", import.meta.url), "utf8");

test("transferred checkout preserves Sew Lovely draft persistence and live order submission", () => {
  assert.match(source, /readCheckoutDraft\(\)/);
  assert.match(source, /saveCheckoutDraft\(next\)/);
  assert.match(source, /fetch\("\/api\/orders"/);
  assert.match(source, /"idempotency-key": crypto\.randomUUID\(\)/);
  assert.match(source, /cash_on_delivery/);
  assert.match(source, /pay_in_store/);
  assert.doesNotMatch(source, /Place demo order/);
});
