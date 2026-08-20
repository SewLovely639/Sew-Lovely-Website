import assert from "node:assert/strict";
import test from "node:test";
import { getOrderReceiptPreview } from "./email";

test("receipt preview produces escaped business and customer emails", () => {
  process.env.ORDER_RECEIPT_EMAIL = "orders@example.com";
  const preview = getOrderReceiptPreview({ id: "ORD-42", status: "pending", paymentStatus: "pending", customer: { name: "Asha <Test>", email: "asha@example.com", phone: "+267 123" }, items: [{ qty: 2, name: "Silk & <Thread>", price: 125 }], total: 250 });
  assert.equal(preview.business.to, "orders@example.com");
  assert.equal(preview.customer.to, "asha@example.com");
  assert.match(preview.business.html, /Asha &lt;Test&gt;/);
  assert.match(preview.customer.html, /Silk &amp; &lt;Thread&gt;/);
  assert.match(preview.customer.html, /P250\.00/);
});
