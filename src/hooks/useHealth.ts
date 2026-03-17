"use client";

import { useCallback, useEffect, useState } from "react";

import type { HealthResponse } from "@/lib/types";

const POLL_INTERVAL_MS = 30_000;

export const useHealth = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollLatencyMs, setPollLatencyMs] = useState<number | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    const startedAt = performance.now();
    setError(null);

    try {
      const response = await fetch("/api/health", {
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถตรวจสอบสถานะระบบได้");
      }

      const payload = (await response.json()) as HealthResponse;
      setHealth(payload);
      setPollLatencyMs(Math.round(performance.now() - startedAt));
    } catch (caughtError) {
      if (
        caughtError instanceof DOMException &&
        caughtError.name === "AbortError"
      ) {
        return;
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "ไม่สามารถตรวจสอบสถานะระบบได้",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  return {
    health,
    isLoading,
    error,
    pollLatencyMs,
    refresh,
  };
};
