type MonitoringContext = { tags?: Record<string, string> };

function sentryEnvelopeUrl(dsn: string) {
  const parsed = new URL(dsn);
  const projectId = parsed.pathname.split("/").filter(Boolean).at(-1);
  if (!parsed.username || !projectId) throw new Error("Invalid Sentry DSN.");
  return `https://${parsed.host}/api/${projectId}/envelope/?sentry_version=7&sentry_key=${encodeURIComponent(parsed.username)}`;
}

export async function captureException(error: unknown, context: MonitoringContext = {}) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_STOREFRONT_DSN;
  if (!dsn) return false;
  try {
    const exception = error instanceof Error ? error : new Error(String(error));
    const eventId = crypto.randomUUID().replaceAll("-", "");
    const event = { event_id: eventId, timestamp: new Date().toISOString(), platform: "javascript", level: "error", tags: { runtime: "cloudflare-worker", area: "admin", ...context.tags }, exception: { values: [{ type: exception.name, value: exception.message }] } };
    const envelope = `${JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() })}\n${JSON.stringify({ type: "event" })}\n${JSON.stringify(event)}`;
    return (await fetch(sentryEnvelopeUrl(dsn), { method: "POST", headers: { "Content-Type": "application/x-sentry-envelope" }, body: envelope })).ok;
  } catch (monitoringError) {
    console.error("[Monitoring] Failed to send exception", monitoringError);
    return false;
  }
}
