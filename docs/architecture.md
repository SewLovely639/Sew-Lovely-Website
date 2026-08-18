# Architecture and production plan

## Boundaries

`apps/storefront` is a customer-facing Next.js App Router application. `apps/admin` is a separate application and deployment. Shared packages contain contracts only; browser bundles never import admin services or server credentials.

Production request flow is: **presentation → server action/route handler → service → repository → Prisma/PostgreSQL**. Authentication, payments, R2 signing, email and cache access are server-only adapters behind services.

## Implemented foundation

- The homepage is a server-rendered catalogue layout based on the provided Sew Lovely design.
- `packages/types` owns product contracts and `packages/validation` owns Zod input parsing.
- Storefront responses include restrictive baseline headers; CSP should be finalized with real analytics, payment and media origins before launch.
- Image hosts are explicit in `next.config.ts`, preventing arbitrary remote optimization requests.
- The admin app has a signed, HttpOnly development session, login rate limiting, same-origin checks, a product catalogue editor, image upload validation, and editable homepage/contact content. It writes through `@sew-lovely/cms`, so the UI does not depend on a storage implementation.
- Checkout now accepts only product IDs and quantities, reprices against the trusted CMS catalogue, uses a checkout idempotency key, and never accepts card data. Card payments use Stripe-hosted Checkout and a signed, timestamp-bounded, idempotent webhook before payment state changes.
- Admins can inspect order and payment status at `/orders`.

## Local CMS setup

Copy `apps/admin/.env.example` to `apps/admin/.env.local`, create a unique password and 32-byte session secret, then set the same absolute `SEW_LOVELY_CONTENT_FILE` path in `apps/storefront/.env.local`. Start both applications with `pnpm dev`. Visit the admin application, sign in, and publish products or content changes. The content file is ignored by Git.

The JSON/file adapter exists to provide a working local admin experience. It is not suitable for a Cloudflare or multi-instance deployment: replace the adapter implementation with Prisma/PostgreSQL and the image data URLs with signed Cloudflare R2 uploads before production.

## Implementation sequence for integrations

1. Provision PostgreSQL/Supabase and Prisma schema for normalized catalogue, identity, order, inventory and audit entities.
2. Add Better Auth with HttpOnly, Secure, SameSite=Lax cookies; guard every admin route and action with RBAC.
3. Implement R2 signed multipart uploads server-side. Validate declared and detected MIME type, byte size and dimensions; re-encode image uploads in a worker and persist metadata only.
4. Replace the local JSON order adapter with PostgreSQL/Prisma (including unique idempotency and provider-reference constraints) before production. The local adapter is serialized per process only and is not safe for multiple instances.
5. Provision Stripe webhook signing secrets and configure the hosted Checkout return/webhook URLs. Test provider-specific failure, pending, cancellation and asynchronous settlement events in a sandbox.
6. Introduce Redis-backed rate limits and queues, OpenTelemetry traces, structured logs with request IDs, and a CSP report endpoint.

## Review register

| Area | Severity | Current mitigation | Required production test |
| --- | --- | --- | --- |
| Secrets | Critical | No credentials or private keys committed | secret scan in CI |
| Admin authorization | Critical | Separate app prevents storefront bundle exposure | role matrix and route/action tests |
| Uploads | High | No public upload endpoint exists | MIME spoofing and malicious-image tests |
| Payments | Critical | Not stubbed as successful checkout | webhook replay/idempotency tests |
| Input validation | High | Newsletter input validated by Zod client-side; server endpoint still required | malformed payload tests |
| Accessibility | Medium | Semantic landmarks, labels, focus styles and buttons | axe + keyboard E2E |
| Performance | Medium | Server Components and Next images | Lighthouse CI on deployed preview |

## CI quality gate

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, dependency audit, secret scan, Playwright/axe tests, and Lighthouse CI on preview deploys. Block releases on critical vulnerabilities, failed authorization tests, or failed payment webhook verification.
