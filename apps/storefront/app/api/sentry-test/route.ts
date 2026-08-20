import { NextResponse } from "next/server";
import { captureException } from "../../lib/monitoring";

export async function GET() {
  if (process.env.NODE_ENV === "production" || process.env.SENTRY_TEST_MODE !== "true") {
    return NextResponse.json({ message: "Sentry test endpoint is disabled." }, { status: 404 });
  }
  const error = new Error("Sew Lovely Sentry test error");
  const delivered = await captureException(error, { tags: { source: "manual-storefront-test" } });
  console.error("[Sentry test] captured storefront exception", { delivered });
  return NextResponse.json({ ok: true, delivered });
}
