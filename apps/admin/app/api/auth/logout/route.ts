import { NextResponse } from "next/server";
import { expiredCookie, isSameOrigin } from "../../../lib/auth";
export async function POST(request: Request) { if (!isSameOrigin(request)) return NextResponse.json({ message:"Invalid request origin." }, { status:403 }); const response = NextResponse.json({ ok:true }); response.cookies.set(expiredCookie.name, expiredCookie.value, expiredCookie.options); return response; }
