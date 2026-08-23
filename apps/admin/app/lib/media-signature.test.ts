import assert from "node:assert/strict";
import test from "node:test";
import { hasMatchingMediaSignature, mediaTypeFromSignature } from "./media-signature";

test("detects supported image and video signatures independently of the filename MIME label", () => {
  assert.equal(mediaTypeFromSignature(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
  assert.equal(mediaTypeFromSignature(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), "image/png");
  assert.equal(mediaTypeFromSignature(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])), "image/webp");
  assert.equal(mediaTypeFromSignature(new Uint8Array([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70])), "video/mp4");
});

test("retains strict rejection for a declared media type that does not match the file signature", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(hasMatchingMediaSignature("image/png", png), true);
  assert.equal(hasMatchingMediaSignature("image/jpeg", png), false);
  assert.equal(mediaTypeFromSignature(new Uint8Array([1, 2, 3, 4])), null);
});
