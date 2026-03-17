"use client";

import { useDeferredValue } from "react";

import { MessageBubble } from "@/components/chat/MessageBubble";
import { QuestionInput } from "@/components/chat/QuestionInput";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import type { ChatMessage } from "@/lib/types";

const EMPTY_SUGGESTIONS: readonly string[] = [];

function getInitials(displayName: string) {
  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "QT";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function ChatInterface({
  sessionId,
  initialMessages = [],
  mockMode,
  onSubmittingChange,
  onMessagesChange,
  starterSuggestions = EMPTY_SUGGESTIONS,
}: {
  sessionId: string;
  initialMessages?: ChatMessage[];
  mockMode: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
  onMessagesChange?: (msgs: ChatMessage[]) => void;
  starterSuggestions?: readonly string[];
}) {
  const { user } = useAuth();
  const { isSubmitting, lastLatencyMs, messages, submitQuestion } = useChat({
    initialMessages,
    onMessagesChange,
    onSubmittingChange,
    sessionId,
  });
  const deferredMessages = useDeferredValue(messages);
  const composerSuggestions =
    deferredMessages.length === 0 ? starterSuggestions : EMPTY_SUGGESTIONS;
  const initials = user ? getInitials(user.displayName) : "QT";
  const roleLabel = user?.isAdmin ? "Administrator" : "Team Member";
  const environmentLabel = mockMode ? "Mock mode" : "Live mode";
  const statusMessage = isSubmitting
    ? "กำลังสร้างคำตอบ..."
    : lastLatencyMs
      ? `ตอบกลับล่าสุดใน ${lastLatencyMs} ms`
      : "พร้อมตอบคำถามจากเอกสารภายใน";

  return (
    <section aria-busy={isSubmitting} aria-label="หน้าต่างสนทนา" className="chat-shell">
      <div className="chat-constraint">
        <div className="chat-toolbar">
          <span aria-live="polite" className="chat-toolbar__status" role="status">
            {statusMessage}
          </span>
        </div>
      </div>

      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="message-scroller"
        role="log"
      >
        <div className="chat-constraint message-list-inner">
          {deferredMessages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__hero">
                <span aria-hidden="true" className="empty-state__avatar">
                  {initials}
                </span>
                <div className="empty-state__hero-copy">
                  <span className="empty-state__eyebrow">
                    {user ? "Workspace ready" : "Ready"}
                  </span>
                  <h2 className="empty-state__title">
                    {user ? `สวัสดี ${user.displayName}` : "QTEC Knowledge Brain"}
                  </h2>
                  <div className="empty-state__meta">
                    {user ? (
                      <span className="empty-state__pill">{roleLabel}</span>
                    ) : null}
                    <span className="empty-state__pill">{environmentLabel}</span>
                  </div>
                </div>
              </div>
              <p className="empty-state__copy">
                ถามได้เลยทั้งเรื่องนโยบายบริษัท, วันหยุด, สิทธิพนักงาน และข้อมูลจากเอกสารภายใน
              </p>
            </div>
          ) : (
            deferredMessages.map((message) => (
              <MessageBubble
                isBusy={isSubmitting}
                key={message.id}
                message={message}
                onFollowUpClick={submitQuestion}
              />
            ))
          )}
        </div>
      </div>

      <div className="chat-constraint">
        <QuestionInput
          isLoading={isSubmitting}
          onSubmit={submitQuestion}
          suggestions={composerSuggestions}
        />
      </div>
    </section>
  );
}
