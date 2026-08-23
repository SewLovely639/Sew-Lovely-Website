export const supportedMediaTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"] as const;
export type SupportedMediaType = (typeof supportedMediaTypes)[number];

function startsWith(bytes: Uint8Array, expected: number[]) {
  return bytes.length >= expected.length && expected.every((value, index) => bytes[index] === value);
}

export function mediaTypeFromSignature(bytes: Uint8Array): SupportedMediaType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  if (String.fromCharCode(...bytes.slice(4, 8)) === "ftyp") return "video/mp4";
  return null;
}

export function hasMatchingMediaSignature(contentType: string, bytes: Uint8Array) {
  return mediaTypeFromSignature(bytes) === contentType;
}
