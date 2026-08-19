import assert from "node:assert/strict";
import test from "node:test";
import { getRelatedProducts } from "./product-recommendations";

test("related products exclude the current product and prioritize matching categories", () => {
  const products = [
    { id: "current", category: "Suits" },
    { id: "same-category", category: "Suits" },
    { id: "other-one", category: "Kurtas" },
    { id: "other-two", category: "Jewellery" },
  ];
  assert.deepEqual(getRelatedProducts(products, products[0], 2).map((product) => product.id), ["same-category", "other-one"]);
});
