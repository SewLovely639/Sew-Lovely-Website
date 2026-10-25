import type { SiteContent } from "@sew-lovely/cms";

export type Promotion = SiteContent["promotion"];

export function getPromotionDiscount(subtotal: number, enteredCode: string, promotion: Promotion) {
  if (!promotion.enabled || enteredCode.trim().toUpperCase() !== promotion.code.trim().toUpperCase()) return 0;
  const amount = promotion.discountType === "percentage"
    ? subtotal * promotion.discountValue / 100
    : promotion.discountValue;
  return Number(Math.min(subtotal, Math.max(0, amount)).toFixed(2));
}
