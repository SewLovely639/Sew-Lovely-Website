"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <main className="fixed inset-0 z-[100] grid place-items-center bg-[#fcfbf8]" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-7 px-6 text-center">
        <img src="/sewlovelylogo.png" alt="Sew Lovely" className="h-auto w-[min(72vw,320px)] object-contain" />
        <span aria-hidden="true" className="size-7 animate-spin rounded-full border-2 border-[#b51863]/20 border-t-[#b51863] motion-reduce:animate-none" />
        <span className="sr-only">Loading your page…</span>
      </div>
    </main>
  );
}
