# Sew Lovely

A Turborepo foundation for an enterprise Indian apparel storefront and admin surface.

## Run locally

1. Copy `apps/storefront/.env.example` to `apps/storefront/.env.local` and set public URLs for your environment.
2. Run `pnpm install`.
3. Run `pnpm dev --filter storefront`.

## Included now

- Next.js App Router storefront with responsive, accessible catalogue UX
- Shared strict TypeScript product types and validation schemas
- Server-side security headers and remote-image allowlist
- A separately deployable admin application shell; no admin code is imported by the storefront
- Architecture and security implementation plan in [`docs/architecture.md`](docs/architecture.md)

## Required production integrations

Add Supabase/PostgreSQL, Better Auth, Redis, R2, Stripe/Razorpay and Resend through server-only service adapters. Credentials are deliberately not included in source control.
