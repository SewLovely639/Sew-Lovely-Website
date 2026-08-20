import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "../../lib/auth";
import { captureException } from "../../lib/monitoring";

const allowed = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxBytes = 8 * 1024 * 1024;

type MediaBucket = {
  put: (key: string, value: ReadableStream<Uint8Array> | null, options: { httpMetadata: { contentType: string; cacheControl: string }; customMetadata: Record<string, string> }) => Promise<unknown>;
  head: (key: string) => Promise<unknown | null>;
};

type MediaEnv = { SEW_LOVELY_MEDIA?: MediaBucket; R2_PUBLIC_BASE_URL?: string };

function mediaBaseUrl(env: MediaEnv) {
  const value = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!value?.startsWith("https://")) throw new Error("R2_PUBLIC_BASE_URL must be an HTTPS public media origin.");
  return value;
}

function validSignature(contentType: string, bytes: number[]) {
  if (contentType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === "image/png") return bytes.length >= 8 && bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}

function validatedImageStream(body: ReadableStream<Uint8Array>, contentType: string) {
  const required = contentType === "image/webp" ? 12 : contentType === "image/png" ? 8 : 3;
  let size = 0;
  let sample: number[] = [];
  let signatureChecked = false;
  return body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      size += chunk.byteLength;
      if (size > maxBytes) throw new Error("Upload rejected: the image exceeds 8 MB.");
      if (sample.length < required) sample = sample.concat(Array.from(chunk.slice(0, required - sample.length)));
      if (!signatureChecked && sample.length >= required) {
        if (!validSignature(contentType, sample)) throw new Error("Upload rejected: the file does not match its image type.");
        signatureChecked = true;
      }
      controller.enqueue(chunk);
    },
    flush() {
      if (!signatureChecked) throw new Error("Upload rejected: the image file is incomplete.");
    },
  }));
}

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ message: "Sign in is required." }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });

  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.toLowerCase() ?? "";
  const extension = allowed.get(contentType);
  const fileSize = Number(request.headers.get("x-sew-lovely-file-size"));
  const contentHash = request.headers.get("x-sew-lovely-content-sha256")?.toLowerCase() ?? "";
  if (!extension || !Number.isSafeInteger(fileSize) || fileSize < 1 || fileSize > maxBytes || !/^[a-f0-9]{64}$/.test(contentHash) || !request.body) {
    return NextResponse.json({ message: "Upload a JPEG, PNG, or WebP image under 8 MB." }, { status: 400 });
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
    if (!existing) await bucket.put(key, validatedImageStream(request.body, contentType), {
      httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { createdBy: "sew-lovely-admin", contentHash, originalName: decodeURIComponent(request.headers.get("x-sew-lovely-file-name") ?? "upload").slice(0, 160) },
    });
    return NextResponse.json({ key, url: `${mediaBaseUrl(mediaEnv)}/${key}`, reused: Boolean(existing) }, { status: existing ? 200 : 201 });
  } catch (error) {
    void captureException(error, { tags: { area: "admin_media_upload" } });
    const message = error instanceof Error && error.message.startsWith("Upload rejected:") ? error.message.replace("Upload rejected: ", "") : "Image upload could not be completed.";
    return NextResponse.json({ message }, { status: message === "Image upload could not be completed." ? 500 : 400 });
  }
}
