# Sew Lovely production launch-readiness report

**Assessment:** **No-go for a production Cloudflare launch in the current architecture.** The repository typechecks and builds successfully, and the live payment scope was tightened during this review. However, orders, customer records, and webhook idempotency are persisted to local JSON files, there is no Cloudflare OpenNext/Wrangler configuration, and several production controls required by the supplied checklist are not implemented. Deploying this build as-is would risk non-durable order data and would not provide a tested Cloudflare Workers runtime path.

## Checks executed

| Check | Result | Evidence or interpretation |
|---|---:|---|
| Monorepo typecheck | **Passed** | `pnpm typecheck` completed successfully across the workspace. |
| Production build | **Passed** | `pnpm build` completed successfully; the build emitted warnings about traced filesystem access from the file-backed CMS/order code, which is important for Cloudflare compatibility. |
| Test command | **Not meaningful** | `pnpm test` exited `0`, but Turbo reported that no test tasks were configured or executed. This is not equivalent to passing automated tests. |
| Secret-pattern scan of tracked files | **No matches** | The tracked-file scan found no matching Resend, AWS access-key, private-key, or R2 secret patterns. This does not replace a full historical secret scan or provider-side rotation. |
| Payment UI/API audit | **Fixed during review** | Card and bank-transfer methods were removed from the customer UI and rejected by the order API. COD and Reserve in Store / pay in store remain. |
| Cloudflare adapter configuration | **Missing** | No `wrangler.*`, `open-next.config.*`, or Cloudflare deployment scripts were present. |
| Durable order persistence | **Blocking** | `apps/storefront/app/lib/orders.ts` writes to `packages/cms/data/orders.json` by default. This is not a production database. |

## Change made before deployment

The checklist explicitly states that COD and Reserve in Store are live while card/online payment is not live. The original checkout exposed **Credit / debit card** and **Bank transfer**, and the server accepted those methods. The review removed both options from `apps/storefront/app/components/payment-form.tsx`, restricted the order API schema in `apps/storefront/app/api/orders/route.ts` to `cash_on_delivery` and `pay_in_store`, and removed the card-session call from the order route.

The dormant hosted-card helper and webhook code remain isolated for a future payment-provider integration, but they are no longer reachable through the live checkout API. Before re-enabling online payments, replace the current provider-specific implementation with the approved DPO Pay design and add provider-specific tests, webhook verification, reconciliation, and failure handling.

## Blocking findings

### 1. Orders are file-backed rather than database-backed

The order implementation resolves `SEW_LOVELY_ORDERS_FILE` or falls back to `packages/cms/data/orders.json`. It performs read-modify-write operations on a local file and stores the processed webhook event IDs in that same JSON document. This does not satisfy the checklist’s requirements for production database durability, concurrency safety, foreign keys, constraints, backups, point-in-time recovery, restore testing, or multi-instance consistency.

Before launch, move orders, order items, customer records, inventory/reservations, and webhook idempotency records to a managed database such as Supabase PostgreSQL. Use migrations, unique constraints, foreign keys, transactional stock/order operations, and a documented restore procedure. Do not deploy the current JSON persistence as the system of record.

### 2. Cloudflare Workers deployment configuration is absent

The repository has no Wrangler configuration, OpenNext configuration, Cloudflare preview command, or Cloudflare deploy command. Cloudflare’s current guidance deploys full-stack Next.js applications to Workers through the OpenNext adapter; App Router and Route Handlers are supported, but the project must be built and previewed in the Workers runtime before deployment [1] [2]. Cloudflare’s Pages guide directs full-stack SSR Next.js applications to the Workers path rather than static Pages [3].

The minimum deployment preparation is to add `@opennextjs/cloudflare`, Wrangler, `open-next.config.ts`, a root `wrangler.jsonc`, and `preview`/`deploy` scripts. Do this only after the file-backed persistence and Node-runtime assumptions have been addressed. The current `node:fs` persistence path and generated build tracing warnings are a strong signal that the application has not yet been validated under Workers.

### 3. The automated test gate is incomplete

The root `test` script exits successfully because no workspace package exposes a `test` script to Turbo. The checklist requires server-side behavior, authorization, failure handling, recovery, and concurrency verification. Add Vitest or an equivalent test runner for at least order idempotency, price recalculation, invalid payment-method rejection, COD/reservation validation, receipt delivery failure handling, webhook signature verification, admin authorization, and R2 access controls.

### 4. Production operational controls remain unverified

The current repository does not demonstrate separate staging infrastructure, a production database, reservation stock/expiry rules, cancellation and returns policies, shipping/tax configuration, backup and restore testing, MFA or multi-user RBAC for the admin portal, upload-route authorization and file validation, R2 lifecycle/orphan cleanup, or a full Sentry dashboard verification. These are checklist requirements and should not be marked complete based solely on UI presence.

## Required actions before Cloudflare deployment

| Priority | Required action | Launch gate |
|---|---|---:|
| P0 | Migrate order/customer/inventory/reservation/webhook state from JSON files to a durable production database. | Must complete |
| P0 | Add and run the OpenNext Cloudflare adapter in a Linux CI or WSL environment, then run the Cloudflare Workers preview. | Must complete |
| P0 | Configure separate staging and production secrets, databases, R2 buckets, and email settings. | Must complete |
| P0 | Verify COD and Reserve in Store end-to-end against the production-like database, including concurrent checkout and idempotent retries. | Must complete |
| P1 | Add executable automated tests; the current `pnpm test` command executes zero tests. | Must complete |
| P1 | Configure and verify R2 upload authorization, MIME/size limits, signed URL expiry, public/private delivery, and cleanup. | Must complete |
| P1 | Confirm Resend domain verification and production sender identity. | Must complete |
| P1 | Confirm Sentry event ingestion from staging and configure alert ownership. | Must complete |
| P1 | Document cancellation, returns/refunds, shipping, VAT/tax, reservation expiry, and store-location rules. | Must complete |
| P2 | Enable branch protection, secret scanning, push protection, Dependabot alerts, and a historical secret scan. | Strongly recommended |

## Safe conclusion

The current source is in a better state for deployment than before this review: it typechecks, builds, contains no detected tracked secret-pattern matches, and no longer exposes card or bank-transfer checkout. It is **not yet production-ready for Cloudflare** because the primary order system is local-file based and the required Workers deployment adapter/configuration is absent. The next safe milestone is a database-backed staging deployment with OpenNext/Wrangler preview validation, followed by a production smoke test and backup/restore verification.

## References

[1]: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/ "Cloudflare Workers: Next.js"

[2]: https://opennext.js.org/cloudflare "OpenNext Cloudflare adapter"

[3]: https://developers.cloudflare.com/pages/framework-guides/nextjs/ "Cloudflare Pages: Next.js"
