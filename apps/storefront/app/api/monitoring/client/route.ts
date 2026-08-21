import { NextResponse } from "next/server";
import { z } from "zod";
import { captureException } from "../../../lib/monitoring";
import { hasSameOrigin } from "../../../lib/request-security";
import { consumeRateLimit } from "../../../lib/supabase";

const payloadSchema = z.object({ message: z.string().trim().min(1).max(500), source: z.string().trim().min(1).max(200) });

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const clientAddress = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  try {
    if (!(await consumeRateLimit(`monitoring:${clientAddress}`, 30, 60))) return NextResponse.json({ ok: false }, { status: 429 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  const payload = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ ok: false }, { status: 400 });
  await captureException(new Error(payload.data.message), { tags: { area: "browser", source: payload.data.source } });
  return NextResponse.json({ ok: true });
}
