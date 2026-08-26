import assert from "node:assert/strict";
import test from "node:test";
import { getOrderReceiptPreview, sendOrderReceipts } from "./email";

test("receipt preview produces escaped business and customer emails", () => {
  process.env.ORDER_RECEIPT_EMAIL = "orders@example.com";
  const preview = getOrderReceiptPreview({ id: "ORD-42", status: "pending", paymentStatus: "pending", customer: { name: "Asha <Test>", email: "asha@example.com", phone: "+267 123" }, items: [{ qty: 2, name: "Silk & <Thread>", price: 125 }], total: 250 });
  assert.equal(preview.business.to, "orders@example.com");
  assert.equal(preview.customer.to, "asha@example.com");
  assert.match(preview.business.html, /Asha &lt;Test&gt;/);
  assert.match(preview.customer.html, /Silk &amp; &lt;Thread&gt;/);
  assert.match(preview.customer.html, /P250\.00/);
});

test("receipt sender submits both business and customer confirmations", async () => {
  const previousFetch = globalThis.fetch;
  const previousApiKey = process.env.RESEND_API_KEY;
  const previousFrom = process.env.RESEND_FROM_EMAIL;
  const previousRecipient = process.env.ORDER_RECEIPT_EMAIL;
  const sent: Array<{ to: string; subject: string; from: string }> = [];
  process.env.RESEND_API_KEY = "test-key";
  process.env.RESEND_FROM_EMAIL = "sewlovely.cc";
  process.env.ORDER_RECEIPT_EMAIL = "owner@example.com";
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as { to: string; subject: string; from: string };
    sent.push({ to: body.to, subject: body.subject, from: body.from });
    return new Response(JSON.stringify({ id: `email-${sent.length}` }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const result = await sendOrderReceipts({ id: "ORD-43", status: "awaiting_payment", paymentStatus: "pending", customer: { name: "Asha Patel", email: "asha@example.com", phone: "+267 123" }, items: [{ qty: 1, name: "Silk Thread", price: 125 }], total: 125 });
    assert.equal(result.skipped, false);
    assert.deepEqual(sent.map((email) => email.to).sort(), ["asha@example.com", "owner@example.com"]);
    assert.ok(sent.every((email) => email.from === "orders@sewlovely.cc"));
    assert.ok(sent.every((email) => email.subject.includes("ORD-43")));
  } finally {
    globalThis.fetch = previousFetch;
    if (previousApiKey === undefined) Reflect.deleteProperty(process.env, "RESEND_API_KEY"); else process.env.RESEND_API_KEY = previousApiKey;
    if (previousFrom === undefined) Reflect.deleteProperty(process.env, "RESEND_FROM_EMAIL"); else process.env.RESEND_FROM_EMAIL = previousFrom;
    if (previousRecipient === undefined) Reflect.deleteProperty(process.env, "ORDER_RECEIPT_EMAIL"); else process.env.ORDER_RECEIPT_EMAIL = previousRecipient;
  }
});
