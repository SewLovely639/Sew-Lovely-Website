import { NextResponse } from "next/server";
import { z } from "zod";
import { recordVideoShopClick } from "@sew-lovely/cms";
import { captureException } from "../../lib/monitoring";
import { hasSameOrigin } from "../../lib/request-security";
import { consumeRateLimit } from "../../lib/supabase";

const payloadSchema = z.object({ videoId: z.string().trim().min(1).max(80), productId: z.string().trim().min(1).max(120) });

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const clientAddress = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const payload = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    if (!(await consumeRateLimit(`video-shop:${clientAddress}`, 40, 60))) return NextResponse.json({ ok: false }, { status: 429 });
    await recordVideoShopClick(payload.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    void captureException(error, { tags: { area: "video_shop_click" } });
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
