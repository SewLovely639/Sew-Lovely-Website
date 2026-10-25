"use client";

import type { FormEvent } from "react";

export type ManagedPromotion = {
  enabled: boolean;
  code: string;
  discountType: "percentage" | "amount";
  discountValue: number;
};

export function PromotionEditor({ promotion, onChange, onSave }: {
  promotion: ManagedPromotion;
  onChange: (promotion: ManagedPromotion) => void;
  onSave: (event: FormEvent) => Promise<void>;
}) {
  return <form className="panel site-panel" onSubmit={(event) => void onSave(event)}>
    <div className="panel-heading"><p>CHECKOUT</p><h2>Promotional code</h2></div>
    <p className="field-note">Manage the single code customers can use at checkout. Percentage discounts are calculated from the order subtotal; fixed discounts are in Botswana pula and cannot reduce an order below zero.</p>
    <label className="inline-row"><input type="checkbox" checked={promotion.enabled} onChange={(event) => onChange({ ...promotion, enabled: event.target.checked })} /> Enable this promotion</label>
    <label>Code shown to customers<input value={promotion.code} onChange={(event) => onChange({ ...promotion, code: event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })} maxLength={32} pattern="[A-Za-z0-9_-]+" required /></label>
    <div className="two">
      <label>Discount type<select value={promotion.discountType} onChange={(event) => onChange({ ...promotion, discountType: event.target.value as ManagedPromotion["discountType"] })}><option value="percentage">Percentage</option><option value="amount">Fixed amount (BWP)</option></select></label>
      <label>{promotion.discountType === "percentage" ? "Discount (%)" : "Discount (BWP)"}<input type="number" value={promotion.discountValue} min="0.01" max={promotion.discountType === "percentage" ? 100 : 1000000} step="0.01" onChange={(event) => onChange({ ...promotion, discountValue: Number(event.target.value) })} required /></label>
    </div>
    <p className="field-note">The active code is <strong>{promotion.code || "not set"}</strong>. Changes take effect after you publish.</p>
    <button className="save" type="submit">Save promotion</button>
  </form>;
}
