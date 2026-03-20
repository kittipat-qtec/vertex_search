"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { AskResponse, ChatMessage } from "@/lib/types";
import { generateId } from "@/lib/generateId";

export type SubmitQuestionResult = "success" | "error" | "aborted";

const pendingMessage = (id: string): ChatMessage => ({
  id,
  role: "assistant",
  text: "",
  pending: true,
});

const getLatestLatency = (messages: ChatMessage[]) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const latencyMs = messages[index].latencyMs;

    if (typeof latencyMs === "number") {
      return latencyMs;
    }
  }

  return null;
};

const RECOVERED_PENDING_MESSAGE =
  "คำตอบก่อนหน้าถูกยกเลิกก่อนเสร็จสมบูรณ์ โปรดลองถามอีกครั้ง";
const EMPTY_MESSAGES: ChatMessage[] = [];

const isRecoveredPendingMessage = (message: ChatMessage) =>
  message.role === "assistant" &&
  message.error === true &&
  message.text === RECOVERED_PENDING_MESSAGE;

const sanitizeMessages = (messages: ChatMessage[]) =>
  messages.filter(
    (message) => !message.pending && !isRecoveredPendingMessage(message),
  );

const hasTransientMessages = (messages: ChatMessage[]) =>
  messages.some(
    (message) => message.pending || isRecoveredPendingMessage(message),
  );

export const useChat = (options?: {
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
  sessionId: string;
}) => {
  const initialMessages = useMemo(
    () => options?.initialMessages ?? EMPTY_MESSAGES,
    [options?.initialMessages],
  );
  const sanitizedInitialMessages = useMemo(
    () => sanitizeMessages(initialMessages),
    [initialMessages],
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    sanitizedInitialMessages,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(
    getLatestLatency(sanitizedInitialMessages),
  );
  const requestAbortControllerRef = useRef<AbortController | null>(null);
  const submissionLockRef = useRef(false);
  const skipSyncRef = useRef(true);
  const onMessagesChangeRef = useRef(options?.onMessagesChange);
  const onSubmittingChangeRef = useRef(options?.onSubmittingChange);
  const sanitizedInitialMessagesRef = useRef(sanitizedInitialMessages);

  useEffect(() => {
    onMessagesChangeRef.current = options?.onMessagesChange;
  }, [options?.onMessagesChange]);

  useEffect(() => {
    onSubmittingChangeRef.current = options?.onSubmittingChange;
  }, [options?.onSubmittingChange]);

  useEffect(() => {
    sanitizedInitialMessagesRef.current = sanitizedInitialMessages;
  }, [sanitizedInitialMessages]);

  useEffect(() => {
    if (hasTransientMessages(initialMessages)) {
      onMessagesChangeRef.current?.(sanitizedInitialMessages);
    }
  }, [initialMessages, sanitizedInitialMessages]);

  useEffect(() => {
    requestAbortControllerRef.current?.abort();
    requestAbortControllerRef.current = null;
    submissionLockRef.current = false;
    skipSyncRef.current = true;
    setIsSubmitting(false);
    onSubmittingChangeRef.current?.(false);
    setMessages(sanitizedInitialMessagesRef.current);
    setLastLatencyMs(getLatestLatency(sanitizedInitialMessagesRef.current));
  }, [options?.sessionId]);

  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }

    onMessagesChangeRef.current?.(sanitizeMessages(messages));
  }, [messages]);

  useEffect(() => {
    return () => {
      requestAbortControllerRef.current?.abort();
      submissionLockRef.current = false;
      onSubmittingChangeRef.current?.(false);
    };
  }, []);

  const submitQuestion = async (
    question: string,
  ): Promise<SubmitQuestionResult> => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || submissionLockRef.current) {
      return "aborted";
    }

    const userMessageId = generateId();
    const assistantMessageId = generateId();
    const abortController = new AbortController();

    submissionLockRef.current = true;
    requestAbortControllerRef.current = abortController;
    onSubmittingChangeRef.current?.(true);

    startTransition(() => {
      setMessages((current) => [
        ...current,
        {
          id: userMessageId,
          role: "user",
          text: trimmedQuestion,
        },
        pendingMessage(assistantMessageId),
      ]);
    });

    setIsSubmitting(true);

    try {
      // Build history from current messages (exclude pending/error)
      const currentMessages = messages.filter(
        (m) => !m.pending && !m.error && m.text.trim().length > 0,
      );
      const history = currentMessages.slice(-10).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await fetch("/api/ask/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion, history }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        const err = await response.json().catch(() => ({}) ) as { error?: string };
        throw new Error(err.error || "ระบบไม่สามารถตอบคำถามได้");
      }

      // ── SSE stream consumer ──────────────────────────────
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamedText = "";
      let streamedSources: import("@/lib/types").Source[] = [];
      let streamedSuggested: string[] = [];
      let latencyMs: number | undefined;
      let receivedDone = false;

      const parseLine = (line: string) => {
        if (!line.startsWith("data:")) return null;
        try {
          return JSON.parse(line.slice(5).trim()) as Record<string, unknown>;
        } catch { return null; }
      };

      const processBlock = (block: string) => {
        const lines = block.split("\n");
        const eventLine = lines.find((l) => l.startsWith("event:"));
        const dataLine = lines.find((l) => l.startsWith("data:"));
        if (!eventLine || !dataLine) return false; // false = continue

        const event = eventLine.slice(6).trim();
        const data = parseLine(dataLine);
        if (!data) return false;

        if (event === "token") {
          streamedText += (data.text as string) ?? "";
          startTransition(() => {
            setMessages((cur) =>
              cur.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, text: streamedText, pending: false }
                  : m,
              ),
            );
          });
        } else if (event === "source") {
          streamedSources = [...streamedSources, data as unknown as import("@/lib/types").Source];
          startTransition(() => {
            setMessages((cur) =>
              cur.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, sources: streamedSources }
                  : m,
              ),
            );
          });
        } else if (event === "suggested") {
          streamedSuggested = (data.questions as string[]) ?? [];
        } else if (event === "done") {
          latencyMs = (data.latencyMs as number) ?? undefined;
          receivedDone = true;
          return true; // true = stop
        } else if (event === "error") {
          throw new Error((data.message as string) ?? "ระบบไม่สามารถตอบคำถามได้");
        }
        return false;
      };

      outer: while (true) {
        const { done, value } = await reader.read();

        // Flush remaining buffer before exiting (includes partial last event)
        const chunk = done
          ? decoder.decode()          // flush TextDecoder internal state
          : decoder.decode(value, { stream: true });
        buffer += chunk;

        const parts = buffer.split("\n\n");
        // Only keep tail as remainder if stream is still open
        buffer = done ? "" : (parts.pop() ?? "");

        for (const block of parts) {
          if (processBlock(block)) break outer;
        }

        if (done) break;
      }

      // ── Always finalize message (even if 'done' event was missed) ──
      startTransition(() => {
        setMessages((cur) =>
          cur.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  text: streamedText || (receivedDone ? m.text : m.text),
                  sources: streamedSources,
                  suggestedQuestions: streamedSuggested,
                  latencyMs,
                  pending: false,
                }
              : m,
          ),
        );
      });

      setLastLatencyMs(latencyMs ?? null);
      return "success";
    } catch (caughtError) {
      if (
        caughtError instanceof DOMException &&
        caughtError.name === "AbortError"
      ) {
        return "aborted";
      }

      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "ระบบไม่สามารถตอบคำถามได้";

      startTransition(() => {
        setMessages((current) =>
          current.map((item) =>
            item.id === assistantMessageId
              ? {
                  id: assistantMessageId,
                  role: "assistant",
                  text: message,
                  error: true,
                }
              : item,
          ),
        );
      });

      return "error";
    } finally {
      if (requestAbortControllerRef.current === abortController) {
        requestAbortControllerRef.current = null;
      }

      submissionLockRef.current = false;
      setIsSubmitting(false);
      onSubmittingChangeRef.current?.(false);
    }
  };

  return {
    messages,
    isSubmitting,
    lastLatencyMs,
    submitQuestion,
  };
};
