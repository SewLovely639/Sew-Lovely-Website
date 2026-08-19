import { readFile } from "node:fs/promises";

const env = await readFile("apps/storefront/.env.local", "utf8");
for (const line of env.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const { deleteR2Object, getR2ObjectUrl, headR2Object, putR2Object } = await import("../apps/storefront/app/lib/r2.ts");
const key = `healthchecks/sew-lovely-${Date.now()}.txt`;
const body = `Sew Lovely R2 health check ${new Date().toISOString()}`;
try {
  await putR2Object(key, body, "text/plain; charset=utf-8");
  const head = await headR2Object(key);
  const { url } = await getR2ObjectUrl(key, 120);
  const response = await fetch(url);
  const downloaded = await response.text();
  if (!response.ok || downloaded !== body) throw new Error(`R2 read-back failed with ${response.status}`);
  console.log("[r2] put/head/presigned-get passed", { key, contentLength: head.ContentLength, contentType: head.ContentType });
} finally {
  await deleteR2Object(key).catch((error) => console.error("[r2] cleanup failed", error));
}
