import assert from "node:assert/strict";
import test from "node:test";
import { hasSameOrigin } from "./request-security";

test("same-origin request guard accepts same-site requests and rejects cross-site requests", () => {
  const url = "https://sew-lovely-storefront.example/api/monitoring/client";
  assert.equal(hasSameOrigin(new Request(url, { headers: { Origin: "https://sew-lovely-storefront.example" } })), true);
  assert.equal(hasSameOrigin(new Request(url, { headers: { Origin: "https://untrusted.example" } })), false);
});
