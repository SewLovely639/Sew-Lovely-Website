import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "../../lib/auth";
import { hasMatchingMediaSignature } from "../../lib/media-signature";
import { captureException } from "../../lib/monitoring";

const allowed = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["video/mp4", "mp4"],
]);
const maxBytes = 8 * 1024 * 1024;
const maxVideoBytes = 50 * 1024 * 1024;

type MediaBucket = {
  put: (key: string, value: ReadableStream<Uint8Array> | Uint8Array | null, options: { httpMetadata: { contentType: string; cacheControl: string }; customMetadata: Record<string, string> }) => Promise<unknown>;
  head: (key: string) => Promise<unknown | null>;
};

type FixedLengthStreamLike = { readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> };
declare const FixedLengthStream: { new(length: number | bigint): FixedLengthStreamLike };

type MediaEnv = { SEW_LOVELY_MEDIA?: MediaBucket; R2_PUBLIC_BASE_URL?: string };

function mediaBaseUrl(env: MediaEnv) {
  const value = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!value?.startsWith("https://")) throw new Error("R2_PUBLIC_BASE_URL must be an HTTPS public media origin.");
  return value;
}

const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
async function verifyPublicMedia(url: string, contentType: string) {
  for (const delay of [0, 300, 900, 1800]) {
    if (delay) await pause(delay);
    try {
      const response = await fetch(url, { headers: { Range: "bytes=0-0", "cache-control": "no-cache" } });
      const servedType = response.headers.get("content-type")?.split(";", 1)[0]?.toLowerCase();
      if ((response.status === 200 || response.status === 206) && servedType === contentType) return;
    } catch { /* Retry briefly while public R2 delivery becomes available. */ }
  }
  throw new Error("Upload reached storage but is not publicly playable from R2 yet. Start the admin with `pnpm --filter admin dev:remote` and retry the upload.");
}

async function validatedImageStream(body: ReadableStream<Uint8Array>, contentType: string, expectedSize: number) {
  const required = 12;
  const maximum = contentType === "video/mp4" ? maxVideoBytes : maxBytes;
  if (typeof FixedLengthStream === "undefined") {
    const bytes = new Uint8Array(await new Response(body).arrayBuffer());
    if (bytes.byteLength !== expectedSize) throw new Error("Upload rejected: the image size does not match the selected file.");
    if (bytes.byteLength > maximum) throw new Error(`Upload rejected: the ${contentType === "video/mp4" ? "video exceeds 50 MB" : "image exceeds 8 MB"}.`);
    if (!hasMatchingMediaSignature(contentType, bytes.slice(0, required))) throw new Error(`Upload rejected: the file does not match its ${contentType === "video/mp4" ? "MP4" : "image"} type.`);
    return { readable: bytes, completed: Promise.resolve() };
  }
  const fixed = new FixedLengthStream(expectedSize);
  let size = 0;
  let sample: number[] = [];
  let signatureChecked = false;
  const validation = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      size += chunk.byteLength;
      if (size > maximum) throw new Error(`Upload rejected: the ${contentType === "video/mp4" ? "video exceeds 50 MB" : "image exceeds 8 MB"}.`);
      if (sample.length < required) sample = sample.concat(Array.from(chunk.slice(0, required - sample.length)));
      if (!signatureChecked && sample.length >= required) {
        if (!hasMatchingMediaSignature(contentType, new Uint8Array(sample))) throw new Error(`Upload rejected: the file does not match its ${contentType === "video/mp4" ? "MP4" : "image"} type.`);
        signatureChecked = true;
      }
      controller.enqueue(chunk);
    },
    flush() {
      if (!signatureChecked) throw new Error("Upload rejected: the image file is incomplete.");
    },
  });
  return { readable: fixed.readable, completed: body.pipeThrough(validation).pipeTo(fixed.writable) };
}

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ message: "Sign in is required." }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });

  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.toLowerCase() ?? "";
  const extension = allowed.get(contentType);
  const fileSize = Number(request.headers.get("x-sew-lovely-file-size"));
  const contentHash = request.headers.get("x-sew-lovely-content-sha256")?.toLowerCase() ?? "";
  const maximum = contentType === "video/mp4" ? maxVideoBytes : maxBytes;
  if (!extension || !Number.isSafeInteger(fileSize) || fileSize < 1 || fileSize > maximum || !/^[a-f0-9]{64}$/.test(contentHash) || !request.body) {
    return NextResponse.json({ message: "Upload a JPEG, PNG, or WebP image under 8 MB, or an MP4 video under 50 MB." }, { status: 400 });
  }

  try {
    const { env } = getCloudflareContext();
    // The normal Next.js build runs before Wrangler's generated declarations exist.
    // Keep the runtime binding explicit while retaining a self-contained type contract.
    const mediaEnv = env as unknown as MediaEnv;
    const bucket = mediaEnv.SEW_LOVELY_MEDIA;
    if (!bucket) throw new Error("SEW_LOVELY_MEDIA R2 binding is not configured.");
    const key = `storefront/sha256/${contentHash}.${extension}`;
    const existing = await bucket.head(key);
    if (!existing) {
      const upload = await validatedImageStream(request.body, contentType, fileSize);
      await Promise.all([
        bucket.put(key, upload.readable, { httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" }, customMetadata: { createdBy: "sew-lovely-admin", contentHash, originalName: decodeURIComponent(request.headers.get("x-sew-lovely-file-name") ?? "upload").slice(0, 160) } }),
        upload.completed,
      ]);
    }
    const url = `${mediaBaseUrl(mediaEnv)}/${key}`;
    await verifyPublicMedia(url, contentType);
    return NextResponse.json({ key, url, reused: Boolean(existing) }, { status: existing ? 200 : 201 });
  } catch (error) {
    void captureException(error, { tags: { area: "admin_media_upload" } });
    const detail = error instanceof Error ? error.message.slice(0, 240) : "Unknown runtime error.";
    console.error("[Admin media upload]", detail);
    const rejected = detail.startsWith("Upload rejected:");
    const mediaKind = contentType === "video/mp4" ? "Video" : "Image";
    const message = rejected ? detail.replace("Upload rejected: ", "") : `${mediaKind} upload error: ${detail}`;
    return NextResponse.json({ message }, { status: rejected ? 400 : 500 });
  }
}
