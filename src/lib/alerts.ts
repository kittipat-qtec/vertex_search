/**
 * Sends an alert to a Google Chat webhook.
 * Set GOOGLE_CHAT_WEBHOOK_URL in env to enable.
 */

const WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK_URL?.trim() ?? "";

interface AlertPayload {
  severity: "WARNING" | "ERROR" | "CRITICAL";
  title: string;
  message: string;
  metadata?: Record<string, string | number | boolean>;
}

export const sendAlert = async (payload: AlertPayload): Promise<void> => {
  if (!WEBHOOK_URL) return;

  const emoji =
    payload.severity === "CRITICAL"
      ? "🔴"
      : payload.severity === "ERROR"
        ? "🟠"
        : "🟡";

  const meta = payload.metadata
    ? Object.entries(payload.metadata)
        .map(([k, v]) => `• ${k}: \`${v}\``)
        .join("\n")
    : "";

  const text = `${emoji} *[QTEC Brain] ${payload.title}*\n${payload.message}${meta ? `\n\n${meta}` : ""}`;

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    // Fire-and-forget — never let alert failure break the app
  }
};

// ----- Convenience helpers -----

export const alertHighLatency = (requestId: string, latencyMs: number) =>
  sendAlert({
    severity: "WARNING",
    title: "High Latency Detected",
    message: "Response time exceeded threshold.",
    metadata: { requestId, latencyMs, threshold: 10_000 },
  });

export const alertRateLimited = (userId: string) =>
  sendAlert({
    severity: "WARNING",
    title: "Rate Limit Triggered",
    message: `User hit rate limit.`,
    metadata: { userId },
  });

export const alertError = (requestId: string, error: string, userId: string) =>
  sendAlert({
    severity: "ERROR",
    title: "API Error",
    message: error,
    metadata: { requestId, userId },
  });
