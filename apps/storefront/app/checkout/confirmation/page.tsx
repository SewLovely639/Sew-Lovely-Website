import Link from "next/link";

export default async function Confirmation({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const params = await searchParams;
  return <main className="wrap checkout-page"><section className="checkout-empty confirmation-card"><p className="eyebrow">Order received</p><h1>Thank you for shopping with us.</h1><p>Your order reference is <strong>{params.order || "pending"}</strong>. Payment status is confirmed by the payment provider and may remain pending briefly for bank or asynchronous payments.</p><Link className="button" href="/shop">Continue shopping</Link></section></main>;
}
