"use client";

import { useRouter } from "next/navigation";

export function BackArrow({ label = "Go back", href }: { label?: string; href?: string }) {
  const router = useRouter();

  function goBack() {
    if (href) {
      router.push(href);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  return (
    <div className="back-area wrap">
      <button className="back-arrow" type="button" onClick={goBack} aria-label={label} title={label}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
