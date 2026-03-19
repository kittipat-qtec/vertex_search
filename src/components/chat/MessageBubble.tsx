"use client";

import { memo, useCallback, useState } from "react";
import dynamic from "next/dynamic";

import { SourceCitation } from "@/components/chat/SourceCitation";
import type { ChatMessage } from "@/lib/types";

const MarkdownRenderer = dynamic(
  () => import("@/components/chat/MarkdownRenderer"),
  {
    loading: () => <p className="message-bubble__text">กำลังแสดงคำตอบ...</p>,
  },
);

function SkeletonBubble() {
  return (
    <div className="message-bubble message-bubble--assistant">
      <div className="message-bubble__label">Knowledge Brain</div>
      <div aria-hidden="true" className="skeleton-body">
        <div className="skeleton-line skeleton-line--long" />
        <div className="skeleton-line skeleton-line--medium" />
        <div className="skeleton-line skeleton-line--short" />
        <div className="skeleton-icon-row">
          <div className="skeleton-icon" />
          <div className="skeleton-line skeleton-line--xs" />
        </div>
      </div>
    </div>
  );
}

type Feedback = "up" | "down" | null;

function FeedbackButtons({ messageId }: { messageId: string }) {
  const [feedback, setFeedback] = useState<Feedback>(null);

  const handleFeedback = useCallback(
    (value: "up" | "down") => {
      setFeedback((current) => (current === value ? null : value));
      console.log(`[Feedback] messageId=${messageId} feedback=${value}`);
    },
    [messageId],
  );

  return (
    <div className="feedback-row">
      <button
        aria-label="คำตอบนี้ดี"
        aria-pressed={feedback === "up"}
        className={`feedback-btn ${feedback === "up" ? "feedback-btn--active" : ""}`}
        onClick={() => handleFeedback("up")}
        type="button"
      >
        <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </button>
      <button
        aria-label="คำตอบนี้ไม่ดี"
        aria-pressed={feedback === "down"}
        className={`feedback-btn ${feedback === "down" ? "feedback-btn--active feedback-btn--negative" : ""}`}
        onClick={() => handleFeedback("down")}
        type="button"
      >
        <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
          <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
      </button>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, [text]);

  return (
    <button
      aria-label="คัดลอกคำตอบ"
      className={`icon-btn${copied ? " icon-btn--copied" : ""}`}
      onClick={handleCopy}
      title={copied ? "คัดลอกแล้ว ✓" : "คัดลอก"}
      type="button"
    >
      {copied ? (
        <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
          <rect height="13" rx="2" ry="2" width="13" x="9" y="9" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

function MessageBubbleComponent({
  message,
  onRegenerate,
  onSuggestedQuestion,
  isLast,
}: {
  message: ChatMessage;
  onRegenerate?: () => void;
  onSuggestedQuestion?: (q: string) => void;
  isLast?: boolean;
}) {
  const isAssistant = message.role === "assistant";

  if (message.pending) {
    return (
      <article className="message-row message-row--assistant">
        <SkeletonBubble />
      </article>
    );
  }

  return (
    <article
      className={`message-row ${isAssistant ? "message-row--assistant" : "message-row--user"}`}
    >
      <div
        className={`message-bubble ${isAssistant ? "message-bubble--assistant" : "message-bubble--user"} ${
          message.error ? "message-bubble--error" : ""
        }`}
      >
        <div className="message-bubble__label">
          {isAssistant ? "Knowledge Brain" : "คุณ"}
        </div>

        <div className="message-bubble__markdown">
          {isAssistant ? (
            <MarkdownRenderer>{message.text}</MarkdownRenderer>
          ) : (
            <p className="message-bubble__text">{message.text}</p>
          )}
        </div>

        {isAssistant && message.sources?.length ? (
          <div className="source-list">
            {message.sources.map((source) => (
              <SourceCitation
                key={`${source.title}-${source.uri ?? source.snippet}`}
                source={source}
              />
            ))}
          </div>
        ) : null}

        <div className="message-bubble__footer">
          <div className="message-bubble__footer-left">
            {isAssistant && message.latencyMs ? (
              <div className="message-bubble__meta">
                ตอบกลับใน {message.latencyMs} ms
              </div>
            ) : null}
          </div>

          {isAssistant && !message.error ? (
            <div className="message-bubble__footer-right">
              <CopyButton text={message.text} />
              {isLast && onRegenerate ? (
                <button
                  aria-label="สร้างคำตอบใหม่"
                  className="icon-btn"
                  onClick={onRegenerate}
                  title="สร้างคำตอบใหม่"
                  type="button"
                >
                  <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-3.78" />
                  </svg>
                </button>
              ) : null}
              <FeedbackButtons messageId={message.id} />
            </div>
          ) : null}
        </div>

        {/* Suggested follow-up questions */}
        {isAssistant && !message.error && message.suggestedQuestions?.length ? (
          <div className="suggestion-chips">
            {message.suggestedQuestions.map((q) => (
              <button
                key={q}
                className="suggestion-chip"
                onClick={() => onSuggestedQuestion?.(q)}
                type="button"
              >
                {q}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export const MessageBubble = memo(MessageBubbleComponent);
