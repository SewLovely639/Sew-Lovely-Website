import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "sew_lovely_admin";
const sessionAgeSeconds = 60 * 60 * 8;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters.");
  return value;
}
function signature(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }
function safeEqual(left: string, right: string) { const a = Buffer.from(left); const b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b); }
export function verifyCredentials(email: string, password: string) {
  const allowedEmail = process.env.ADMIN_EMAIL;
  const allowedPassword = process.env.ADMIN_PASSWORD;
  return Boolean(allowedEmail && allowedPassword && safeEqual(email, allowedEmail) && safeEqual(password, allowedPassword));
}
export async function isAdmin() {
  try { const value = (await cookies()).get(cookieName)?.value; if (!value) return false; const [payload, provided] = value.split("."); if (!payload || !provided || !safeEqual(signature(payload), provided)) return false; const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number; role?: string }; return decoded.role === "admin" && typeof decoded.exp === "number" && decoded.exp > Date.now(); } catch { return false; }
}
export function sessionCookie() {
  const payload = Buffer.from(JSON.stringify({ role:"admin", exp:Date.now() + sessionAgeSeconds * 1000 })).toString("base64url");
  return { name:cookieName, value:`${payload}.${signature(payload)}`, options:{ httpOnly:true, secure:process.env.NODE_ENV === "production", sameSite:"lax" as const, path:"/", maxAge:sessionAgeSeconds } };
}
export const expiredCookie = { name:cookieName, value:"", options:{ httpOnly:true, secure:process.env.NODE_ENV === "production", sameSite:"lax" as const, path:"/", maxAge:0 } };
function isLoopbackHost(value: string) { return value === "localhost" || value === "127.0.0.1" || value === "::1" || value === "[::1]"; }
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    if (host && originUrl.host === host) return true;
    if (process.env.ALLOW_LOOPBACK_ORIGIN === "true" && host) return isLoopbackHost(originUrl.hostname) && isLoopbackHost(host.replace(/:\d+$/, ""));
    return false;
  } catch { return false; }
}
