# Integration Findings

## Cloudflare R2

Cloudflare R2 exposes an S3-compatible API at `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, uses `auto` as the SDK region, and requires an R2 Access Key ID plus Secret Access Key in addition to the account ID. Presigned URLs can support GET, PUT, HEAD, and DELETE operations and should be treated as bearer tokens with short expirations. The repository currently has the account ID and endpoint but still needs the bucket name, Access Key ID, and Secret Access Key before live storage verification.

Sources: [Cloudflare R2 S3 API](https://developers.cloudflare.com/r2/api/s3/api/), [Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/).

## React Email and Resend

Resend’s Next.js guidance uses a React Email component as the email template and passes it to Resend through the `react` parameter. React Email’s `render` utility converts React components into HTML for email providers, making it suitable for reusable Sew Lovely customer confirmation templates with shared brand tokens.

Sources: [Resend Send with Next.js](https://resend.com/docs/send-with-nextjs), [React Email introduction](https://react.email/docs/introduction).
