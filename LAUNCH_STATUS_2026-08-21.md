# Sew Lovely — Production Launch Status

**Status date:** 21 August 2026  
**Working branch:** `master`  
**Latest storefront code commit:** `7c2c0f7` — *Harden monitoring endpoint and patch dependencies*

## Current assessment

The storefront and admin are operational on their respective Cloudflare Workers. The domain-independent launch checks are complete. The only material launch gate is **transactional email delivery**, which requires a custom sender domain verified in Resend. The temporary `onboarding@resend.dev` address cannot send customer receipts to normal recipients.[1]

| Area | Status | Evidence |
|---|---|---|
| Storefront Worker | Verified | The active 100% Cloudflare deployment was created at `2026-08-21 09:26:49 UTC`, after commit `7c2c0f7` at `09:25:29 UTC`. |
| Primary customer routes | Verified | `/`, `/shop`, `/cart`, `/checkout`, and `/checkout/payment` each returned HTTP `200`. |
| Checkout draft and return flow | Verified in code | Delivery/payment draft persistence, deterministic return targets, type checking, tests, and production build all passed. |
| Admin access control | Verified | An anonymous request to `/api/cms` returned HTTP `401`. |
| Product media | Verified previously | R2 multi-image uploads, content-addressed objects, immutable one-year cache headers, and storefront gallery rendering passed. |
| Monitoring | Verified | A controlled live event appeared in Sentry and was resolved. The public client-monitoring endpoint now rejects cross-origin submissions with HTTP `403` and has a durable per-client rate limit. |
| Dependency security | Verified | The high-severity transitive `nanoid` advisory was remediated with a workspace override to `3.3.18`; the production dependency audit now reports zero vulnerabilities. |
| Test catalogue cleanup | Complete | The product **“R2 upload verification — delete me”** was removed from the published CMS content and a follow-up query found zero remaining matches. |

## Remaining launch gates

| Priority | Required action | Owner |
|---|---|---|
| Critical | Purchase a custom domain for Sew Lovely. | Business owner |
| Critical | Add that domain to Resend and publish the DNS records Resend supplies until its status is **Verified**. | Business owner, with DNS guidance as needed |
| Critical | Change the Cloudflare storefront secret `RESEND_FROM_EMAIL` to a sender at the verified domain, for example `orders@your-domain`. | Business owner / deployment operator |
| Critical | Place one new controlled COD or Reserve-in-Store order. Confirm the customer receipt and the business receipt at `subedar639@gmail.com`. | Business owner and launch operator |
| High | Rotate credentials previously shared outside Cloudflare’s encrypted-secret store, especially the Resend API key, Supabase service-role key, and any R2 S3 access keys. Update the corresponding Cloudflare secret immediately after each rotation. | Business owner / deployment operator |

## Important operational notes

The email failure did **not** prevent the live order from being created: the test order was present in Supabase. The receipt path has since been corrected so the Worker awaits the receipt attempt and captures skipped or failed sends in monitoring. However, delivery will remain unavailable to ordinary customer email addresses until a Resend domain is verified and configured.

The active checkout options remain **Cash on Delivery** and **Reserve in Store**. No online payment gateway should be presented until DPO or another provider is separately integrated, secured, and tested.

## Recommended next sequence after obtaining a domain

1. Add the bare domain (for example, `sewlovely.example`) in the Resend Domains page; do not enter a Gmail address, a `workers.dev` hostname, or `https://`.
2. Copy each TXT, MX, and/or CNAME record shown by Resend into the domain registrar’s DNS panel, then wait for Resend to mark the domain as verified.
3. Set `RESEND_FROM_EMAIL` in the Cloudflare storefront Worker to `orders@<verified-domain>` and deploy the Worker configuration.
4. Run one controlled live order test, verify the two receipt destinations, and keep the resulting Sentry view clear of unreviewed delivery errors.

## References

[1] [Resend — 403 Error Using resend.dev Domain](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)
