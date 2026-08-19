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


- [ ] Inspect existing checkout completion, order persistence, and error boundaries
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
- [ ] Run storage, email, Sentry, typecheck, and build verification
- [x] Document production deployment requirements; final checkpoint remains pending
- [x] Configure the supplied sewlovely R2 bucket with ignored environment variables
- [x] Add an R2 S3 client helper and safe object put/get verification
