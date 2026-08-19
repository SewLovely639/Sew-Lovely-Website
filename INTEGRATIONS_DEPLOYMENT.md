# Sew Lovely integrations deployment guide

## Resend

For local testing, the project uses `onboarding@resend.dev` as the sender and Resend permits delivery only to the account owner’s email address. The verified mock send was executed with order `SL-MOCK-EMAIL-001`; it produced one business receipt ID and one customer confirmation ID.

Before production customer delivery, verify the brand domain in the Resend dashboard, publish the required SPF/DKIM records, and set `RESEND_FROM_EMAIL` to an address on that verified domain. Keep `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `ORDER_RECEIPT_EMAIL` server-side only. The checkout route sends the business receipt and customer confirmation after the order has been created and uses idempotency keys derived from the order ID.

The safe local dry-run is:

```powershell
pnpm exec tsx .\scripts\test-checkout-email.mts
```

The explicit send mode is intentionally opt-in and should only be run with a verified Resend account recipient:

```powershell
$env:MOCK_TEST_RECIPIENT="your-verified-resend-account-email@example.com"
pnpm exec tsx .\scripts\test-checkout-email.mts --send
```

## Cloudflare R2

Set the following server-side variables in the deployment environment:

```text
R2_ACCOUNT_ID
R2_ENDPOINT
R2_BUCKET
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
```

The endpoint must be the S3-compatible account endpoint, and the bucket is currently `sewlovely`. The application uses the S3-compatible client in `apps/storefront/app/lib/r2.ts`; it does not expose access keys to the browser.

Rotate the R2 access key and secret after testing or whenever the credentials have been shared outside the deployment secret manager. Create a new scoped R2 API token, update the deployment secrets, verify object put/get/delete behavior, and only then revoke the old token. Do not commit `.env.local` or secret values.

The safe verification command is:

```powershell
pnpm exec tsx .\scripts\test-r2.mts
```

It performs no operation when R2 configuration is absent. With the variables present it writes a small verification object, reads it back, and deletes it unless `R2_KEEP_TEST_OBJECT=1` is set.

## Sentry

The shared DSN is configured for both storefront and admin. The storefront exposes a development-only verification route at `/api/debug/sentry`; it intentionally throws a test exception and must not be enabled as a public production diagnostic endpoint. Trigger it locally, then confirm the event in the shared Sentry project by searching for the test message and the `sew-lovely-storefront` release/environment. The admin application initializes Sentry through its own client/server instrumentation using the same DSN.

Do not place Sentry auth tokens or API secrets in client-exposed variables. Public DSNs are identifiers, but organization authentication tokens remain server-side.

## Final verification

Run these checks from the repository root before publishing:

```powershell
pnpm typecheck
pnpm test
pnpm build
```

The storefront and complete monorepo typecheck pass after the React Email dynamic import was changed to an extensionless import. The Resend mock send and R2 put/get/delete verification have also passed. If a production build takes longer than the terminal timeout, rerun it in a persistent local terminal and inspect the final exit code before publishing.
