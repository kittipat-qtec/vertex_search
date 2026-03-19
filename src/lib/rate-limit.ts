import type { NextRequest } from "next/server";

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000; // 1 minute
const CLEANUP_INTERVAL_MS = 5 * 60_000; // cleanup stale entries every 5 min

const cleanup = () => {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
};

// Periodic cleanup to prevent unbounded memory growth
if (typeof globalThis !== "undefined") {
  const interval = setInterval(cleanup, CLEANUP_INTERVAL_MS);

  // Allow Node.js to exit without waiting for the timer
  if (typeof interval === "object" && "unref" in interval) {
    interval.unref();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number | null;
}

export const checkRateLimit = (identifier: string): RateLimitResult => {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  let entry = store.get(identifier);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(identifier, entry);
  }

  // Slide the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + WINDOW_MS - now;

    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 0),
    };
  }

  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.timestamps.length,
    retryAfterMs: null,
  };
};

export const getRateLimitIdentifier = (request: NextRequest | Request) => {
  const headers = request.headers;

  return (
    headers.get("x-iis-auth-user") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"
  );
};
