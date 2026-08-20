import assert from "node:assert/strict";
import test from "node:test";
import { checkoutStorageKey, readCheckoutDraft, saveCheckoutDraft } from "./checkout-draft";

const values = new Map<string, string>();
Object.assign(globalThis, { localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });

test("checkout draft survives payment-page navigation with delivery and payment details", () => {
  values.clear();
  saveCheckoutDraft({ customer: { name: "Asha Patel", email: "asha@example.com", phone: "+26712345" }, delivery: { option: "cash_on_delivery", address: "12 Market Road", city: "Gaborone", country: "Botswana", notes: "Ring bell" }, payment: { method: "cash_on_delivery", reference: "Test note" } });
  const draft = readCheckoutDraft();
  assert.equal(draft?.customer.name, "Asha Patel");
  assert.equal(draft?.delivery.option, "cash_on_delivery");
  assert.equal(draft?.delivery.address, "12 Market Road");
  assert.equal(draft?.payment?.method, "cash_on_delivery");
  assert.equal(draft?.payment?.reference, "Test note");
  assert.ok(values.has(checkoutStorageKey));
});
