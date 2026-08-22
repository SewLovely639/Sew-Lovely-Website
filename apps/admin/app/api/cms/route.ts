import { NextResponse } from "next/server";
import { cmsSchemas, readContent, removeProduct, updateSite, upsertProduct, writeContent } from "@sew-lovely/cms";
import { isAdmin, isSameOrigin } from "../../lib/auth";
import { captureException } from "../../lib/monitoring";

function unauthorized() { return NextResponse.json({ message:"Sign in is required." }, { status:401 }); }
export async function GET() { if (!await isAdmin()) return unauthorized(); try { return NextResponse.json(await readContent()); } catch (error) { void captureException(error, { tags: { area: "admin_cms" } }); return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to load admin content." }, { status: 500 }); } }
export async function PUT(request: Request) {
  if (!await isAdmin()) return unauthorized(); if (!isSameOrigin(request)) return NextResponse.json({ message:"Invalid request origin." }, { status:403 });
  const body = await request.json().catch(() => null) as { kind?:string; data?:unknown } | null;
  if (body?.kind === "content") { const parsed = cmsSchemas.content.safeParse(body.data); if (!parsed.success) return NextResponse.json({ message:"Invalid catalogue and taxonomy content." }, { status:400 }); return NextResponse.json(await writeContent(parsed.data).catch((error) => { void captureException(error, { tags: { area: "admin_cms" } }); throw error; })); }
  if (body?.kind === "site") { const parsed = cmsSchemas.site.safeParse(body.data); if (!parsed.success) return NextResponse.json({ message:"Invalid site content." }, { status:400 }); return NextResponse.json(await updateSite(parsed.data).catch((error) => { void captureException(error, { tags: { area: "admin_cms" } }); throw error; })); }
  if (body?.kind === "product") { const parsed = cmsSchemas.product.safeParse(body.data); if (!parsed.success) return NextResponse.json({ message:"Invalid product details." }, { status:400 }); return NextResponse.json(await upsertProduct(parsed.data).catch((error) => { void captureException(error, { tags: { area: "admin_cms" } }); throw error; })); }
  return NextResponse.json({ message:"Unknown content operation." }, { status:400 });
}
export async function DELETE(request: Request) { if (!await isAdmin()) return unauthorized(); if (!isSameOrigin(request)) return NextResponse.json({ message:"Invalid request origin." }, { status:403 }); const id = new URL(request.url).searchParams.get("id"); if (!id) return NextResponse.json({ message:"Product id is required." }, { status:400 }); return NextResponse.json(await removeProduct(id).catch((error) => { void captureException(error, { tags: { area: "admin_cms" } }); throw error; })); }
