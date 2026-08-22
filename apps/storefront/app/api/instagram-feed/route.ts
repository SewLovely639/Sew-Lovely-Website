import { NextResponse } from "next/server";
import { z } from "zod";

const responseSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    caption: z.string().optional(),
    media_type: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]).optional(),
    media_url: z.string().url().optional(),
    thumbnail_url: z.string().url().optional(),
    permalink: z.string().url(),
    timestamp: z.string().optional(),
  })).default([]),
});

export type InstagramFeedPost = { id: string; caption: string; image: string; permalink: string; mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" };

export async function GET() {
  const accountId = process.env.INSTAGRAM_PROFESSIONAL_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accountId || !accessToken) return NextResponse.json({ configured: false, posts: [] as InstagramFeedPost[] }, { headers: { "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" } });
  try {
    const params = new URLSearchParams({ fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp", limit: "6", access_token: accessToken });
    const response = await fetch(`https://graph.instagram.com/v26.0/${encodeURIComponent(accountId)}/media?${params}`, { next: { revalidate: 900 } });
    if (!response.ok) throw new Error(`Instagram returned ${response.status}.`);
    const parsed = responseSchema.safeParse(await response.json());
    if (!parsed.success) throw new Error("Instagram returned an unexpected media response.");
    const posts = parsed.data.data.flatMap((post): InstagramFeedPost[] => {
      const image = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
      return image ? [{ id: post.id, caption: post.caption ?? "", image, permalink: post.permalink, mediaType: post.media_type ?? "IMAGE" }] : [];
    });
    return NextResponse.json({ configured: true, posts }, { headers: { "cache-control": "public, max-age=60, s-maxage=900, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ configured: true, posts: [] as InstagramFeedPost[] }, { status: 502, headers: { "cache-control": "no-store" } });
  }
}
