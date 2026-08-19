# Sew Lovely Production Readiness Report

**Prepared:** 19 August 2026

**Scope:** `apps/storefront`, `apps/admin`, shared CMS package, Supabase persistence, Cloudflare R2 media, Resend receipts, and Sentry monitoring.

## Executive assessment

The codebase is **ready to enter the Cloudflare deployment stage**, subject to the remaining external launch gates in this report. The customer storefront and private admin application now share durable Supabase-backed content and order persistence. Admin images are streamed into the `sewlovely` R2 bucket under immutable SHA-256 content-addressed keys, avoiding browser base64 payloads and avoiding duplicate object creation when identical bytes are uploaded again.

The production application does not depend on committed `.env` or `.env.local` files. Secrets are explicitly separated from safe Worker variables in [`CLOUDFLARE_SECRETS.md`](./CLOUDFLARE_SECRETS.md). The only browser-visible monitoring value is the Sentry DSN; it is an ingestion identifier rather than a credential, so it is configured as a public Worker value and intentionally retained by the client instrumentation build. Database service keys, Resend credentials, and session secrets remain server-only Cloudflare secrets.

## Verified engineering checks

| Area | Result | Evidence and interpretation |
|---|---:|---|
| Storefront type check | **Passed** | `pnpm --filter storefront typecheck` completed successfully after the Supabase rate-limit integration. |
| Admin type check | **Passed** | `pnpm --filter admin typecheck` completed successfully in the final validation suite. |
| Storefront production build | **Passed** | Current Next.js production build completed successfully for all storefront routes, including checkout and `/shop/[id]`. |
| Admin production build | **Passed** | Current Next.js production build completed successfully, including `/api/media` and `/orders`. |
| Storefront regression tests | **2 / 2 passed** | Product recommendations exclude the active product and prioritise matching categories; CMS validation accepts HTTPS media URLs and rejects `data:` / base64 images. |
| Cloudflare configuration typing | **Passed** | `cf:typegen` completed for both Workers after validating the public Supabase URL, R2 origin, Sentry DSN, and admin R2 binding. |
| Durable rate limiting | **Passed** | Supabase has both the `request_rate_limits` table and the atomic `consume_rate_limit` function. Checkout throttling now survives Worker scale-out and restarts. |
| Supabase security advisor | **0 warnings** | Re-run after the durable rate-limit migration; no current security advisories were returned. |
| R2 object storage | **Passed in integration verification** | Previous project-session health check completed PUT, GET, and DELETE successfully against the configured `sewlovely` bucket and public media origin. |
| Sentry ingestion | **Verified in project-session monitoring check** | The prior controlled storefront test error was observed in the `sewlovely-website` Sentry project. The public DSN is now retained reliably for client bundles and configured for Worker runtime. |

The Supabase schema includes durable storefront content, customers, newsletter subscriptions, orders and line items, webhook idempotency, inventory, reservations, and request throttling. Access is protected with RLS and restricted service-role access. Supabase advises enabling RLS for tables exposed through the public schema, using both grants and policies, and never exposing a service key in a browser.[1]

## Production architecture and protections

| Concern | Implemented control |
|---|---|
| Content, orders, customers, inventory, webhook event history | Supabase PostgreSQL with service-role-only access from Worker server code. |
| Checkout duplicates | Atomic Supabase order creation plus idempotency keys. |
| Checkout abuse | Atomic 12-attempt-per-minute, per-address Supabase rate limit with automatic stale-record cleanup. |
| Public product media | R2 public origin with immutable one-year caching, content-addressed SHA-256 paths, and de-duplication. |
| Upload resource use | Admin route validates MIME signatures and size, streams upload bytes directly to R2, and rejects base64 CMS values. |
| Media privilege boundary | Only the admin Worker receives the `SEW_LOVELY_MEDIA` R2 bucket binding; storefront images are loaded from the public media origin. |
| Transactional email | Resend customer confirmation plus internal business receipt is dispatched only after a newly created order. |
| Observability | Sentry server/client/edge instrumentation with PII collection disabled and a 10% trace sample rate. |
| Payment scope | Checkout permits only Cash on Delivery and Reserve/Pay in Store. Card and bank-transfer capture are not enabled. |

## Remaining launch gates

The following items need completion **before live customer traffic is invited**. None requires a source-code redesign; they are deployment, credential, or real-world acceptance steps.

| Gate | Status | Required action |
|---|---:|---|
| OpenNext Worker build on a Linux filesystem | **Required** | Run the deployment build from WSL, Linux CI, or a Linux development environment. Windows currently raises a known `EPERM` symlink error in the OpenNext build. |
| Deploy both Workers | **Required** | Deploy storefront and admin after their Linux build succeeds. Do not treat a local Next.js build as a Worker deployment. |
| Add Cloudflare secrets | **Required after each Worker exists** | Add every server-only value listed in [`CLOUDFLARE_SECRETS.md`](./CLOUDFLARE_SECRETS.md), particularly `SUPABASE_SERVICE_ROLE_KEY`, Resend configuration, and the session secrets. |
| Verify a Resend-owned sending domain | **Required for launch** | Replace the temporary `onboarding@resend.dev` sender with an address on a verified owned domain. Resend requires adding and verifying an owned domain before it can send with that domain.[3] |
| Configure production host names | **Required** | Assign final Cloudflare host names/custom domain, then update canonical and social metadata if a branded URL and share image are desired. The temporary relative social image was removed to avoid emitting a localhost URL in production builds. |
| End-to-end acceptance testing | **Required** | Test admin login, multiple-image upload, CMS publish, product gallery, COD, reserve-in-store checkout, customer receipt, business receipt, and a controlled Sentry error on the deployed Worker URLs. |
| R2 public content review | **Required** | Confirm the public bucket contains product/editorial media only; do not use it for customer documents, exports, or secrets. |

## Secure deployment runbook

> **Do not put secret values in `wrangler.jsonc`, Git, a CI log, or a message.** Cloudflare Workers secrets are encrypted bindings, are not shown after configuration, and can be added in the dashboard or with `wrangler secret put`.[2]

First use WSL, Linux, or Linux CI and run the build/deploy sequence from the repository root:

```bash
pnpm --filter storefront cf:build
pnpm --filter storefront cf:deploy
pnpm --filter admin cf:build
pnpm --filter admin cf:deploy
```

After each Worker has been created, enter the documented secret values interactively. Run the commands from the relevant app directory so Wrangler applies the correct Worker configuration.

```bash
# apps/storefront
pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY
pnpm exec wrangler secret put RESEND_API_KEY
pnpm exec wrangler secret put RESEND_FROM_EMAIL
pnpm exec wrangler secret put ORDER_RECEIPT_EMAIL
pnpm exec wrangler secret put CUSTOMER_SESSION_SECRET
pnpm exec wrangler secret put PAYMENT_WEBHOOK_SECRET

# apps/admin
pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY
pnpm exec wrangler secret put ADMIN_EMAIL
pnpm exec wrangler secret put ADMIN_PASSWORD
pnpm exec wrangler secret put ADMIN_SESSION_SECRET
```

The safe, version-controlled Worker values (`SUPABASE_URL`, `R2_PUBLIC_BASE_URL`, and the public Sentry DSN) are already declared in both `wrangler.jsonc` files. The admin Worker also declares the `SEW_LOVELY_MEDIA` R2 binding; no R2 S3 access key or secret should be placed in either Worker.

## Post-deployment acceptance record

Complete this record against the actual Worker URLs, preferably before DNS is switched to a customer-facing domain.

| Test | Expected result | Record |
|---|---|---|
| Admin multi-image upload | Every valid JPEG/PNG/WebP under 8 MB returns an immutable R2 URL; uploading the same image twice reuses its content-addressed key. | Pending live Worker deployment |
| CMS publish | A published hero/product/gallery update appears in the storefront and no base64 image data is stored. | Pending live Worker deployment |
| COD checkout | One order is created, customer and business receipts arrive, and a same-key retry does not create a second order. | Pending live Worker deployment |
| Reserve in Store checkout | One reservation order is created with the intended payment status and both receipts arrive. | Pending live Worker deployment |
| Sentry | A controlled test error appears in `sewlovely-website` with neither customer PII nor secrets attached. | Pending live Worker deployment |
| R2 cache | Revisit a product image and confirm `Cache-Control: public, max-age=31536000, immutable`. | Pending live Worker deployment |

## Source-control handoff

Once the final code checkpoint is committed, push the current branch to the selected repository:

```bash
git push origin HEAD
```

The release commit should include this report, `CLOUDFLARE_SECRETS.md`, Worker configuration, Supabase-backed data code, R2 upload route, media regression test, and the removal of the obsolete S3-compatible R2 helper. It must not include `.env.local`, the Supabase service-role key, R2 access keys, Resend API key, or generated Worker declaration files.

## References

[1]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase: Row Level Security"
[2]: https://developers.cloudflare.com/workers/configuration/secrets/ "Cloudflare Workers: Secrets"
[3]: https://resend.com/docs/dashboard/domains/introduction "Resend: Verified Domains"
