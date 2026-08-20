import { NextResponse } from "next/server";
import { z } from "zod";
import { captureException } from "../../../lib/monitoring";

const payloadSchema = z.object({ message: z.string().trim().min(1).max(500), source: z.string().trim().min(1).max(200) });

export async function POST(request: Request) {
  const payload = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ ok: false }, { status: 400 });
  await captureException(new Error(payload.data.message), { tags: { area: "browser", source: payload.data.source } });
  return NextResponse.json({ ok: true });
}
