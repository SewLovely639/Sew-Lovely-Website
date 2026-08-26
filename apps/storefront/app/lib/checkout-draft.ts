export type DeliveryOption = "reserve_in_store" | "cash_on_delivery" | "international_delivery";
export type PaymentMethod = "cash_on_delivery" | "pay_in_store";

export type CheckoutDraft = {
  customer: { name: string; email: string; phone: string };
  delivery: { option: DeliveryOption; address: string; city: string; country: string; notes: string };
  payment?: { method: PaymentMethod; reference: string };
  promoCode: string;
  consents: { terms: boolean; marketing: boolean };
};

export const checkoutStorageKey = "checkout-data";

export const emptyCheckoutDraft: CheckoutDraft = {
  customer: { name: "", email: "", phone: "" },
  delivery: { option: "reserve_in_store", address: "", city: "", country: "", notes: "" },
  promoCode: "",
  consents: { terms: false, marketing: true },
};

export function readCheckoutDraft() {
  try {
    const raw = localStorage.getItem(checkoutStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
    const option = ["reserve_in_store", "cash_on_delivery", "international_delivery"].includes(parsed.delivery?.option ?? "") ? parsed.delivery?.option as DeliveryOption : emptyCheckoutDraft.delivery.option;
    return {
      customer: { ...emptyCheckoutDraft.customer, ...parsed.customer },
      delivery: { ...emptyCheckoutDraft.delivery, ...parsed.delivery, option },
      payment: parsed.payment && ["cash_on_delivery", "pay_in_store"].includes(parsed.payment.method) ? { method: parsed.payment.method, reference: parsed.payment.reference ?? "" } : undefined,
      promoCode: typeof parsed.promoCode === "string" ? parsed.promoCode.slice(0, 64) : "",
      consents: { terms: parsed.consents?.terms === true, marketing: parsed.consents?.marketing !== false },
    } satisfies CheckoutDraft;
  } catch {
    return null;
  }
}

export function saveCheckoutDraft(draft: CheckoutDraft) {
  localStorage.setItem(checkoutStorageKey, JSON.stringify(draft));
}
