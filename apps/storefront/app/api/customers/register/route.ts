import { NextResponse } from "next/server";
import { z } from "zod";
import { customerSession, registerCustomer } from "../../../lib/customers";
const schema=z.object({name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(254),password:z.string().min(8).max(128),offers:z.boolean().default(true)});
export async function POST(request:Request){ const parsed=schema.safeParse(await request.json().catch(()=>null)); if(!parsed.success)return NextResponse.json({message:"Please complete all account fields."},{status:400}); try { await registerCustomer(parsed.data.name,parsed.data.email,parsed.data.password,parsed.data.offers); const response=NextResponse.json({ok:true}); response.cookies.set("sew_lovely_customer",customerSession(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:604800}); return response; } catch(error){ return NextResponse.json({message:error instanceof Error?error.message:"Registration failed."},{status:400}); } }
