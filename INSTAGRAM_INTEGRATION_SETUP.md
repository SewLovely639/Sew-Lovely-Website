# Instagram Professional Account Integration

The storefront is prepared to read up to six recent Instagram posts through `GET /api/instagram-feed`. Until credentials are configured, the endpoint returns an empty, non-error result and the existing CMS-managed Instagram tiles remain unchanged.

## Credentials to provide securely

When the Meta application is ready, add these **server-only** values to the storefront Worker configuration and local development environment. Do not commit either value.

| Variable | Purpose |
|---|---|
| `INSTAGRAM_PROFESSIONAL_ACCOUNT_ID` | The connected Instagram professional account ID. |
| `INSTAGRAM_ACCESS_TOKEN` | A valid Instagram API user access token with the permissions needed to read account media. |

The prepared endpoint requests `id`, `caption`, `media_type`, `media_url`, `thumbnail_url`, `permalink`, and `timestamp` from Meta’s current `/v26.0/<IG_ID>/media` endpoint. Videos use Meta’s returned `thumbnail_url` in the storefront feed, while every tile opens Meta’s `permalink`.

## Activation checklist

1. Ensure that the Instagram account is a professional account and connected to the approved Meta application.
2. Provide the account ID and access token securely when available.
3. Configure both values as Worker secrets for the storefront and set them only in the local environment needed for testing.
4. Verify `GET /api/instagram-feed` returns `{ "configured": true }` and valid post records.
5. After confirmation, replace the currently CMS-managed Instagram tile source with the live feed endpoint in a separate reviewed change.

The Meta API reference used for this preparation is the [IG User Media endpoint](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media). The legacy Instagram Basic Display API is not used.
