import { NextResponse } from "next/server";
import { listVideoShopClickAnalytics } from "@sew-lovely/cms";
import { isAdmin } from "../../lib/auth";
import { captureException } from "../../lib/monitoring";

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ message: "Sign in is required." }, { status: 401 });
  try {
    return NextResponse.json({ rows: await listVideoShopClickAnalytics() });
  } catch (error) {
    void captureException(error, { tags: { area: "video_shop_analytics" } });
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to load video shopping analytics." }, { status: 500 });
  }
}
