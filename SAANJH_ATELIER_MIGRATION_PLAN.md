# Saanjh Atelier Visual Migration Plan

## Objective

Adopt the **Saanjh Atelier** luxury-fashion visual system for Sew Lovely while retaining the current, production-ready Next.js commerce implementation. This is a **presentation and interaction migration**, not an application-platform replacement.

## Compatibility rules

| Preserve without functional change | Adopt from the Saanjh Atelier direction |
|---|---|
| Next.js App Router, Cloudflare Workers, Supabase, R2, Resend, Sentry, and the two-Worker deployment model | Ivory, ink, plum, rose, and magenta editorial palette; Playfair-style display typography with concise sans-serif utility text; restrained borders and luxury-fashion spacing |
| CMS content model and published product IDs | Announcement bar, transparent-over-hero desktop header, elevated menu treatment, editorial collection headers, visual product cards, and large campaign blocks |
| Cart local-storage contract and cart events | Image-led product cards, hover motion, refined cart/checkout surfaces, mobile horizontal product rails, and darker considered footer |
| Checkout draft persistence, delivery/payment stages, order API, rate limit, monitoring, and email behavior | Saanjh Atelier-inspired mobile navigation, responsive rhythm, visual hierarchy, and reduced-motion-safe micro-interactions |
| Admin authentication, product publishing, R2 media uploads, hero content schema, orders access, and CMS API contracts | A dark-plum studio dashboard treatment with cleaner section hierarchy and aligned form/card system |

## Route-by-route migration

| Existing route | Visual migration | Functional contract retained |
|---|---|---|
| `/` | Editorial hero, campaign/category rail, featured product rail, campaign panel, styled gift builder, Instagram grid, and new footer | CMS-backed hero slides, categories, products, gift selection, newsletter, Instagram links, WhatsApp |
| `/shop` | Saanjh-style collection masthead, applied filter context, premium product-grid cards, and refined empty state | Existing `category`, `brand`, and `q` search parameters; CMS product data |
| `/shop/[id]` | Editorial split product page, image gallery emphasis, full-width product narrative, pairing panels, and recommendations | Product IDs, gallery, quantity, quick add, related-product logic |
| `/cart` | “Your bag” editorial layout, image-led line items, quantity controls, and sticky order summary | Existing local-storage cart, quantities, removal, totals, and checkout links |
| `/checkout` and `/checkout/payment` | Sequential luxury checkout shell with clear delivery and payment cards plus order summary | Saved delivery details, selectable delivery/payment options, validation, order submission, back-navigation contract |
| `/profile` | Quiet account panel with an editorial header and refined form controls | Customer registration and profile persistence |
| Admin | Studio dashboard layout, reference-aligned navigation hierarchy, consistent component styling | Authentication, CMS requests, R2 product uploads, slide editing, order access |

## Required technical reconciliation

The supplied Saanjh Atelier export is a Vite/Wouter application. Its code will be used as **visual and structural reference only**; its application shell, authentication, router, database model, and demo checkout will not be copied into the Cloudflare production storefront.

The existing admin hero editor currently reads local files as base64 data URLs, while the established admin media contract requires streamed, content-addressed R2 URLs. During the admin migration, hero-image selection will be aligned with the existing R2 upload endpoint so slide publishing remains compatible with the CMS image validation and production media rules.

## Validation plan

After implementation, validate the storefront on desktop and mobile, retain current unit tests, add coverage for any extracted route/UI contracts, run typecheck and production builds for both apps, and verify that no GitHub push is performed. The user will review the local result before authorizing a commit or push.

## Initial local visual-review checkpoint

The local storefront preview rendered the migrated full-bleed hero, transparent editorial header, announcement ticker, image-led category rail, fashion product cards, campaign feature, gift builder, and Instagram composition. The existing CMS hero copy, category content, products, cart controls, and WhatsApp entry remained present in the rendered experience. The remaining visual review will confirm narrow-screen navigation, collection/product pages, checkout, and the admin editor after their final CSS and route checks.

The local collection route also rendered a Saanjh Atelier-style masthead, result count, CMS-derived filter chips, and all published product routes without altering the existing query parameter behavior.

The local production cart and checkout routes rendered their new editorial summary and empty-state surfaces while retaining the existing back control, continue-shopping link, cart-state handling, and checkout-stage structure.

The local admin route preserved its authentication boundary; without a local admin session it remains on the loading/authentication path rather than exposing CMS data. Type checking, the expanded hero-media contract test, and the production build verified the migrated admin source independently.

The first 375-pixel mobile capture identified hero text beginning too close to the transparent header. The corrected capture confirms a single-line announcement ticker and reserved hero spacing beneath the mobile header; the logo, menu control, headline, body copy, call-to-action, and slide controls no longer overlap.
