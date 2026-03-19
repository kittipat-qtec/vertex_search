"use client";

import { memo } from "react";
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

function MessageBubbleComponent({ message }: { message: ChatMessage }) {
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

        {isAssistant && message.latencyMs ? (
          <div className="message-bubble__meta">
            ตอบกลับใน {message.latencyMs} ms
          </div>
        ) : null}
      </div>
    </article>
  );
}

export const MessageBubble = memo(MessageBubbleComponent);
