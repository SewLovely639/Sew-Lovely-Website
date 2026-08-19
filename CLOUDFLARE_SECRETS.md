# Sew Lovely Cloudflare configuration

Deploy the storefront and admin Workers first. After each Worker exists, add the following **server-side** values through the Cloudflare dashboard’s Worker settings or with `wrangler secret put`. Do not commit them to `.env` files, `wrangler.jsonc`, or source control.

| Worker | Cloudflare secret | Purpose |
|---|---|---|
| Storefront and admin | `SUPABASE_SERVICE_ROLE_KEY` | Server-only database access for durable CMS, customer, and order data. |
| Storefront | `RESEND_API_KEY` | Transactional email delivery. |
| Storefront | `RESEND_FROM_EMAIL` | Verified production Resend sender. |
| Storefront | `ORDER_RECEIPT_EMAIL` | Internal business receipt recipient. |
| Storefront | `CUSTOMER_SESSION_SECRET` | Customer session signing secret, at least 32 characters. |
| Storefront | `PAYMENT_WEBHOOK_SECRET` | Future payment webhook verification secret. |
| Admin | `ADMIN_EMAIL` | Admin sign-in identity. |
| Admin | `ADMIN_PASSWORD` | Admin sign-in password. |
| Admin | `ADMIN_SESSION_SECRET` | Admin session signing secret, at least 32 characters. |

| Worker | Non-secret Worker variable | Value |
|---|---|---|
| Storefront and admin | `SUPABASE_URL` | `https://ysddeszckbpmfhyrikxe.supabase.co` |
| Storefront and admin | `R2_PUBLIC_BASE_URL` | `https://pub-5620ca196c674ca09cc311878651751d.r2.dev` |
| Storefront and admin | `NEXT_PUBLIC_SENTRY_STOREFRONT_DSN` | `https://2bd272fb46ed2a85f4ac7a0c0e283623@o4511931505246208.ingest.de.sentry.io/4511936339181648` |

The `SEW_LOVELY_MEDIA` R2 binding is configured only in the admin Worker and requires **no R2 access key or secret**. Both public values above are present in the respective Wrangler configurations because they carry no credentials. The storefront consumes media through the public origin and deliberately has no R2 bucket-write binding.

## Storage and cache controls

Admin image uploads accept JPEG, PNG, and WebP files up to 8 MB. The browser calculates a SHA-256 content fingerprint; the admin Worker streams the bytes directly to R2 and writes them at an immutable content-addressed key. Re-uploading identical bytes reuses the existing object instead of consuming new storage. Each object receives `Cache-Control: public, max-age=31536000, immutable`, while edited images receive a new content URL and therefore never serve stale content.

The bucket’s `r2.dev` public media endpoint is enabled solely for storefront images. Do not store customer documents, private exports, or application secrets in the `sewlovely` bucket. Use a separate private bucket for any future non-public assets.
