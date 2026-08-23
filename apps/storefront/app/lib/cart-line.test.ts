import assert from "node:assert/strict";
import test from "node:test";
import { resolveCartLineKey } from "./cart-line";

const lines = [
  { id: "ivory-suit", lineId: "ivory-suit::M" },
  { id: "mauve-set", lineId: "mauve-set::Standard" },
];

test("cart controls resolve an existing line identifier directly", () => {
  assert.equal(resolveCartLineKey(lines, "ivory-suit::M"), "ivory-suit::M");
});

test("cart controls resolve a unique legacy product identifier to its line identifier", () => {
  assert.equal(resolveCartLineKey(lines, "mauve-set"), "mauve-set::Standard");
});

test("cart controls do not guess when multiple size lines share one product identifier", () => {
  const multiSize = [...lines, { id: "ivory-suit", lineId: "ivory-suit::L" }];
  assert.equal(resolveCartLineKey(multiSize, "ivory-suit"), "ivory-suit");
});
