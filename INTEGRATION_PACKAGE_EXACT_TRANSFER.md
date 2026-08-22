# Exact Integration-Package Storefront Transfer

## Binding visual rule

The supplied `sew-lovely-integration-package.zip` is now the sole source of truth for the customer-facing frontend. Its font stack, global tokens, announcement bar, transparent/sticky header, mega navigation, mobile menu, hero, campaign tiles, product cards, bag drawer, collection pages, product pages, standalone checkout, account screen, search screen, story gallery, and footer replace the former Sew Lovely 2 storefront presentation.

No prior Sew Lovely 2 storefront selectors or shared visual components are rendered by the migrated customer routes. Existing server-side CMS, Supabase, R2, order, email, monitoring, and authentication contracts are retained behind the transferred interfaces.

## Local visual checkpoint

The locally built home route renders the package’s full-bleed animated hero and transparent header structure, package-style ticker, desktop menu, campaign rail, considered-favourites grid, workroom stories, and Instagram layout. The local `/collections/new-arrivals` route renders the matching static header, breadcrumb, collection masthead, filters/sort row, and exact product-card presentation against real Sew Lovely CMS data.

The final 375-pixel local capture confirms that the transferred active hero retains the integration package’s announcement ticker, transparent navigation, campaign image, eyebrow, Playfair display heading, DM Sans body copy, CTA, pagination, and directional controls without overlap or concealment.

The local product detail route was also checked against the transferred gallery, product narrative, quantity control, add-to-bag, and recommendations structure. Adding a CMS product through its transferred `Add to bag` control updated the original `sew-lovely-cart` persistence contract and the shared header bag count; no checkout or order was submitted during this validation.

## Current data and behavior mapping

| Integration-package interface | Existing Sew Lovely implementation retained behind it |
|---|---|
| Product cards, quick-add, product bag drawer, and bag page | Local `sew-lovely-cart` persistence, product IDs, quantities, price totals, and cart event contract |
| Home hero, campaigns, product rails, story imagery, Instagram grid, and footer | `readContent()` CMS site and product records; admin-published R2 image URLs |
| Collection and product detail routes | Current CMS categories, product IDs, multi-image galleries, descriptions, stories, recommendations, and R2 media |
| Standalone checkout template | Persisted checkout draft, original delivery options, payment options, same-origin rate-limited order API, idempotency key, and existing order persistence/email path |
| Account screen and newsletter | Existing customer registration and newsletter endpoints |

## Publication state

All exact-transfer work remains local and uncommitted. No GitHub push or Cloudflare deployment has occurred.
