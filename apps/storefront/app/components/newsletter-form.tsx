"use client";

import { useState } from "react";
import { newsletterSchema } from "@sew-lovely/validation";

export function NewsletterForm() {
  const [message, setMessage] = useState("");

  async function subscribe(formData: FormData) {
    const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
    if (!parsed.success) { setMessage(parsed.error.issues[0]?.message ?? "Please try again."); return; }
    const response = await fetch("/api/customers/offers", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(parsed.data) });
    const result = await response.json(); setMessage(response.ok ? "Thank you — you’re on the list." : result.message ?? "Please try again.");
  }

  return <form action={subscribe} className="newsletter-form" noValidate>
    <label className="sr-only" htmlFor="newsletter-email">Email address</label>
    <input id="newsletter-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="Your email address" required />
    <button type="submit">Subscribe</button>
    <p className="form-message" aria-live="polite">{message}</p>
  </form>;
}
