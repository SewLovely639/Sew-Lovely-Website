import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV === "production" || process.env.SENTRY_TEST_MODE !== "true") {
    return NextResponse.json({ message: "Sentry test endpoint is disabled." }, { status: 404 });
  }
  const error = new Error("Sew Lovely Sentry test error");
  Sentry.captureException(error, { tags: { source: "manual-storefront-test" } });
  const flushed = await Sentry.flush(2000);
  console.error("[Sentry test] captured storefront exception", { flushed });
  return NextResponse.json({ ok: true, flushed });
}
