# Sew Lovely 2 Integration TODO

- [x] Preserve the existing storefront and admin behavior before visual integration
- [x] Add the Sew Lovely branded navbar to the existing storefront
- [x] Add an admin-configurable hero slideshow with editable poster text and selectable images
- [x] Add the animated hero UI effects with responsive and reduced-motion behavior
- [x] Add the Sew Lovely gift box “Make it personal” section to the storefront
- [x] Extend shared CMS/types/validation contracts for hero slideshow content
- [x] Add or preserve admin publishing and persistence for hero content
- [x] Add regression tests for admin content validation and storefront rendering contracts
- [x] Run storefront and admin typechecks/builds
- [x] Verify admin changes appear in the storefront without breaking existing flows
- [x] Save a final project checkpoint


- [x] Inspect existing checkout completion, order persistence, and error boundaries
- [x] Configure Resend receipt delivery to a designated recipient using secure environment variables
- [x] Add Sentry server and client monitoring without exposing secrets
- [x] Add receipt and monitoring regression coverage
- [x] Run typechecks/builds and save an integrations checkpoint
- [x] Send a business receipt and customer confirmation after successful order creation
- [x] Configure separate Sentry identities for storefront and admin
- [x] Preserve shared checkout/content behavior between storefront and admin
- [x] Use onboarding@resend.dev as the temporary receipt sender for testing
- [x] Use the existing shared Sentry DSN for storefront and admin


- [x] Inspect the GitHub repository and current storage, checkout email, and Sentry boundaries
- [x] Add Cloudflare R2-compatible storage configuration without committing credentials
- [x] Add a safe mock-order checkout email test that does not create a real order or send real email by default
- [x] Add a controlled storefront Sentry test-error path and verification procedure
- [x] Add React Email customer confirmation template guidance and reusable template structure
- [x] Run storage, email, Sentry, typecheck, and build verification
- [x] Document production deployment requirements; final checkpoint remains pending
- [x] Configure the supplied sewlovely R2 bucket with ignored environment variables
- [x] Add an R2 S3 client helper and safe object put/get verification

- [x] Execute production_ecommerce_launch_master_checklist.md and classify deployment gates before Cloudflare launch
- [x] Resolve or document any blocking production-readiness findings from the launch checklist

- [x] Make the permanent marker font consistent across the storefront
- [x] Add Sew Lovely logo usage across required storefront pages and metadata
- [x] Replace hero slideshow white-block arrows with accessible branded controls
- [x] Add scroll-triggered fade/scale reveals with reduced-motion support
- [x] Give each Gift Box mood option a distinct specific icon
- [x] Remove the scan and connect section
- [x] Fix the duplicated email-address label/search-bar text
- [x] Add admin-managed direct Instagram post links for each follow-us image
- [x] Add complete product detail routes with gallery, descriptions, styling, and pairing details
- [ ] Configure and validate OpenNext/Wrangler Cloudflare deployment (configuration added; Linux/WSL preview validation pending)
- [x] Replace Permanent Marker with a professional apparel-store typography system
- [x] Use a hamburger icon for the mobile category navigation
- [x] Change the product detail back link to return customers home
- [x] Add quantity selection beside product-detail add-to-cart actions
- [x] Show related purchasable products beneath each product detail
- [x] Audit the current admin image workflow, R2 helper, and Cloudflare Worker compatibility
- [x] Add memory-safe multi-image product uploads from the admin to Cloudflare R2
- [x] Store product, customer, order, reservation, and webhook-idempotency data durably in Supabase
- [x] Verify Supabase schema, R2 storage, Sentry monitoring, and Cloudflare deployment configuration; Resend production-domain verification remains a launch gate
- [ ] Complete Linux/WSL OpenNext preview validation and production launch documentation
- [x] Centralize production secret requirements in Cloudflare Worker configuration and remove project-local secret dependencies
- [x] Configure immutable media caching, content-addressed de-duplication, and streaming upload safeguards for admin images
- [x] Replace instance-local checkout throttling with an atomic Supabase rate limiter
- [x] Write final production-readiness report with verified checks and a secure Cloudflare launch runbook
- [x] Fix Cloudflare GitHub build failure by supplying the admin R2 binding type declaration
- [ ] Correct Cloudflare deployment commands so each Worker deploys from its app directory
- [ ] Configure the approved two-Worker Cloudflare deployment: isolated storefront and admin Workers
