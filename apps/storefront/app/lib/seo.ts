export const SITE_URL = "https://sewlovely.cc";
export const SITE_NAME = "Sew Lovely";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
