import { NextResponse } from "next/server";
import { markEventProcessed, updatePayment, verifyWebhookSignature } from "../../../lib/orders";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-payment-signature") || request.headers.get("stripe-signature") || "";
  if (!verifyWebhookSignature(raw, signature)) return NextResponse.json({ message: "Invalid signature." }, { status: 400 });
  const event = await request.json().catch(() => null) as { id?: string; type?: string; data?: { object?: { client_reference_id?: string; payment_status?: string; id?: string } } } | null;
  if (!event?.id || !event.type || !event.data?.object) return NextResponse.json({ message: "Invalid event." }, { status: 400 });
  if (!(await markEventProcessed(event.id))) return NextResponse.json({ ok: true, duplicate: true });
  const object = event.data.object; const orderId = object.client_reference_id;
  if (orderId) {
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type) && object.payment_status === "paid") await updatePayment(orderId, "paid", object.id);
    else if (["checkout.session.async_payment_failed", "payment_intent.payment_failed"].includes(event.type)) await updatePayment(orderId, "failed", object.id);
    else if (event.type === "checkout.session.expired") await updatePayment(orderId, "cancelled", object.id);
  }
  return NextResponse.json({ ok: true });
}
