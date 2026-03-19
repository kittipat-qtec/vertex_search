"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { AskResponse, ChatMessage } from "@/lib/types";

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

    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();
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

      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          history,
        }),
        signal: abortController.signal,
      });

      const payload = (await response.json()) as AskResponse & {
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "ระบบไม่สามารถตอบคำถามได้");
      }

      startTransition(() => {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? {
                  id: assistantMessageId,
                  role: "assistant",
                  text: payload.answer,
                  sources: payload.sources,
                  latencyMs: payload.latencyMs,
                }
              : message,
          ),
        );
      });

      setLastLatencyMs(payload.latencyMs ?? null);
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
