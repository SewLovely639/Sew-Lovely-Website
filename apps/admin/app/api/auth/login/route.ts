import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin, sessionCookie, verifyCredentials } from "../../../lib/auth";

const attempts = new Map<string, { count:number; reset:number }>();
const loginSchema = z.object({ email:z.string().trim().email().max(254), password:z.string().min(8).max(256) });
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message:"Invalid request origin." }, { status:403 });
  }
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now(); const state = attempts.get(key); if (state && state.reset > now && state.count >= 5) return NextResponse.json({ message:"Too many sign-in attempts. Try again later." }, { status:429 });
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !verifyCredentials(parsed.data.email, parsed.data.password)) { attempts.set(key, { count:(state?.reset ?? 0) > now ? (state?.count ?? 0) + 1 : 1, reset:now + 15 * 60_000 }); return NextResponse.json({ message:"Invalid email or password." }, { status:401 }); }
  attempts.delete(key); const response = NextResponse.json({ ok:true }); const cookie = sessionCookie(); response.cookies.set(cookie.name, cookie.value, cookie.options); return response;
}
