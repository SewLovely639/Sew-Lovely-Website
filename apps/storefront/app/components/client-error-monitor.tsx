"use client";

import { useEffect } from "react";

export function ClientErrorMonitor() {
  useEffect(() => {
    const report = (message: string, source: string) => {
      void fetch("/api/monitoring/client", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({ message: message.slice(0, 500), source: source.slice(0, 200) }) });
    };
    const onError = (event: ErrorEvent) => report(event.message || "Unhandled client error", event.filename || "browser");
    const onRejection = (event: PromiseRejectionEvent) => report(event.reason instanceof Error ? event.reason.message : String(event.reason), "unhandledrejection");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
