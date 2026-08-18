"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function ProfileForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/customers/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password"),
        offers: data.get("offers") === "on",
      }),
    });

    if (response.ok) {
      setStatus("success");
      setMessage("Your profile details have been saved.");
      form.reset();
      return;
    }

    const payload = await response.json().catch(() => null);
    setStatus("error");
    setMessage(payload?.error ?? "We could not save your details yet.");
  }

  return (
    <form className="profile-form" onSubmit={submit}>
      <label>
        Full name
        <input name="name" autoComplete="name" required minLength={2} />
      </label>
      <label>
        Email address
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="new-password" required minLength={6} />
      </label>
      <label className="check-row">
        <input name="offers" type="checkbox" />
        Send me Sew Lovely offers and new arrival updates.
      </label>
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Saving..." : "Save profile"}
      </button>
      {message && <p className={`form-message ${status}`}>{message}</p>}
    </form>
  );
}
