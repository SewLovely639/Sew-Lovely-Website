import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeOffer } from "../../../lib/customers";
const schema=z.object({email:z.string().trim().email().max(254)});
export async function POST(request:Request){const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({message:"Enter a valid email address."},{status:400});await subscribeOffer(parsed.data.email);return NextResponse.json({ok:true});}
