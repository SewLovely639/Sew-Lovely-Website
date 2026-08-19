import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { createOrder, type PaymentMethod } from "../../lib/orders";
import { sendOrderReceipts } from "../../lib/email";

const requestSchema = z.object({
  items: z.array(z.object({ id: z.string().trim().min(1).max(120), qty: z.number().int().min(1).max(99) })).min(1).max(50),
  customer: z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(254), phone: z.string().trim().min(5).max(40) }),
  payment: z.object({ method: z.enum(["cash_on_delivery", "pay_in_store"]), reference: z.string().trim().max(220).optional().or(z.literal("")) }),
  delivery: z.object({ option: z.enum(["cash_on_delivery", "reserve_in_store", "international_delivery"]), address: z.string().trim().max(400).optional().or(z.literal("")), city: z.string().trim().max(120).optional().or(z.literal("")), country: z.string().trim().max(120).optional().or(z.literal("")), notes: z.string().trim().max(400).optional().or(z.literal("")) }),
}).superRefine((value, ctx) => { if (["cash_on_delivery", "international_delivery"].includes(value.delivery.option)) for (const field of ["address", "city", "country"] as const) if (!value.delivery[field]?.trim()) ctx.addIssue({ code: "custom", path: ["delivery", field], message: `Please enter your delivery ${field}.` }); });

const attempts = new Map<string, { count: number; reset: number }>();
function limited(request: Request) { const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"; const now = Date.now(); const entry = attempts.get(key); if (!entry || entry.reset < now) { attempts.set(key, { count: 1, reset: now + 60_000 }); return false; } entry.count += 1; return entry.count > 12; }
function sameOrigin(request: Request) { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; }

export async function POST(request: Request) {
  if (limited(request)) return NextResponse.json({ message: "Too many checkout attempts. Please try again shortly." }, { status: 429 });
  if (!sameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 100) return NextResponse.json({ message: "A checkout retry key is required." }, { status: 400 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid checkout details." }, { status: 400 });
  try {
    const result = await createOrder({ ...parsed.data, idempotencyKey, payment: parsed.data.payment as { method: PaymentMethod; reference?: string } });
    if (result.created) {
      void sendOrderReceipts(result.order).catch((error) => console.error("[Resend] Receipt delivery failed", error));
    }
    return NextResponse.json({ ok: true, orderId: result.order.id, status: result.order.status, paymentStatus: result.order.paymentStatus });
  } catch (error) { Sentry.captureException(error); const message = error instanceof Error ? error.message : "Checkout could not be completed."; return NextResponse.json({ message: message.includes("temporarily") || message.includes("not available") ? message : "Checkout could not be completed. Please review your cart and try again." }, { status: 400 }); }
}
