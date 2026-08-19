import { readFile } from "node:fs/promises";

const storefrontEnv = await readFile("apps/storefront/.env.local", "utf8");
const adminEnv = await readFile("apps/admin/.env.local", "utf8");
const route = await readFile("apps/storefront/app/api/orders/route.ts", "utf8");
const webhook = await readFile("apps/storefront/app/api/payments/webhook/route.ts", "utf8");
const email = await readFile("apps/storefront/app/lib/email.ts", "utf8");

for (const [name, content] of [
  ["RESEND_API_KEY", storefrontEnv],
  ["RESEND_FROM_EMAIL", storefrontEnv],
  ["ORDER_RECEIPT_EMAIL", storefrontEnv],
  ["NEXT_PUBLIC_SENTRY_STOREFRONT_DSN", storefrontEnv],
  ["NEXT_PUBLIC_SENTRY_STOREFRONT_DSN", adminEnv],
]) {
  if (!content.includes(`${name}=`) || content.includes(`${name}=\n`)) throw new Error(`Missing ${name}`);
}
if (!route.includes("sendOrderReceipts") || !webhook.includes("sendOrderReceipts")) throw new Error("Receipt delivery is not wired to both order success paths");
if (!email.includes("Idempotency-Key") || !email.includes("customer")) throw new Error("Receipt module is missing customer delivery or idempotency protection");
console.log("Resend/Sentry integration wiring verified without sending email.");
