import { NextResponse } from "next/server";
import { cmsSchemas, readContent, removeProduct, updateSite, upsertProduct, writeContent } from "@sew-lovely/cms";
import { isAdmin, isSameOrigin } from "../../lib/auth";
import { captureException } from "../../lib/monitoring";

function unauthorized() { return NextResponse.json({ message: "Sign in is required." }, { status: 401 }); }

/**
 * Cloudflare Workers cannot write the local JSON fallback. If the deployed
 * admin Worker is missing either Supabase runtime value, saves silently fail
 * behind a generic error, so report the exact missing configuration instead.
 */
function hostedConfigurationError() {
  if (process.env.NODE_ENV !== "production") return null;
  const missing = [
    !process.env.SUPABASE_URL && "SUPABASE_URL",
    !process.env.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter((value): value is string => Boolean(value));
  if (!missing.length) return null;
  return NextResponse.json({
    message: `This admin Worker cannot save to Supabase because ${missing.join(" and ")} ${missing.length === 1 ? "is" : "are"} missing. Add the value as a runtime variable/secret on the sew-lovely-admin Worker in Cloudflare, then redeploy.`,
  }, { status: 500 });
}

function validationError(error: { issues: Array<{ path: Array<string | number>; message: string }> }, summary: string) {
  const issues = error.issues.slice(0, 10).map((issue) => `${issue.path.join(".") || "content"}: ${issue.message}`);
  return NextResponse.json({ message: `${summary} ${issues.join(" · ")}`, issues }, { status: 400 });
}

async function persist<T>(operation: () => Promise<T>) {
  try {
    return NextResponse.json(await operation());
  } catch (error) {
    void captureException(error, { tags: { area: "admin_cms" } });
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to save storefront content." }, { status: 500 });
  }
}

export async function GET() {
  if (!await isAdmin()) return unauthorized();
  return hostedConfigurationError() ?? persist(() => readContent());
}

export async function PUT(request: Request) {
  if (!await isAdmin()) return unauthorized();
  if (!isSameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const configurationError = hostedConfigurationError();
  if (configurationError) return configurationError;
  const body = await request.json().catch(() => null) as { kind?: string; data?: unknown } | null;
  if (body?.kind === "content") {
    const parsed = cmsSchemas.content.safeParse(body.data);
    if (!parsed.success) return validationError(parsed.error, "These changes could not be saved.");
    return persist(() => writeContent(parsed.data));
  }
  if (body?.kind === "site") {
    const parsed = cmsSchemas.site.safeParse(body.data);
    if (!parsed.success) return validationError(parsed.error, "These site changes could not be saved.");
    return persist(() => updateSite(parsed.data));
  }
  if (body?.kind === "product") {
    const parsed = cmsSchemas.product.safeParse(body.data);
    if (!parsed.success) return validationError(parsed.error, "This product could not be saved.");
    return persist(() => upsertProduct(parsed.data));
  }
  return NextResponse.json({ message: "Unknown content operation." }, { status: 400 });
}

export async function DELETE(request: Request) {
  if (!await isAdmin()) return unauthorized();
  if (!isSameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const configurationError = hostedConfigurationError();
  if (configurationError) return configurationError;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Product id is required." }, { status: 400 });
  return persist(() => removeProduct(id));
}
