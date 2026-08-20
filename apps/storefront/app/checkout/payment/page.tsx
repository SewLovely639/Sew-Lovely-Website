import Link from "next/link";
import { PaymentForm } from "../../components/payment-form";

export default function PaymentPage() {
  return (
    <div className="wrap">
      <div className="back-area">
        <Link className="back-arrow" href="/checkout" replace aria-label="Back to checkout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>
      <PaymentForm />
    </div>
  );
}
