import * as Sentry from "@sentry/nextjs";

// A Sentry DSN identifies an ingestion endpoint rather than authorizing access;
// it must be present in the browser bundle for client-side error reporting.
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_STOREFRONT_DSN ?? "https://2bd272fb46ed2a85f4ac7a0c0e283623@o4511931505246208.ingest.de.sentry.io/4511936339181648";

Sentry.init({
  dsn: sentryDsn,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
});
