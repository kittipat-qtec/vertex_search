"use client";

import { useCallback, useEffect, useDeferredValue, useRef } from "react";

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

function exportMessages(messages: ChatMessage[]) {
  const lines = messages
    .filter((m) => !m.pending)
    .map((m) => {
      const label = m.role === "user" ? "คุณ" : "Knowledge Brain";
      return `[${label}]\n${m.text}\n`;
    });

  const text = `QTEC Knowledge Brain — ส่งออกเมื่อ ${new Date().toLocaleString("th-TH")}\n${"─".repeat(50)}\n\n${lines.join("\n")}`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `qtec-chat-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    userScrolledUpRef.current = !atBottom;
  }, []);

  useEffect(() => {
    if (userScrolledUpRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [deferredMessages, isSubmitting]);

  useEffect(() => {
    userScrolledUpRef.current = false;
    const el = scrollerRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [sessionId]);

  const handleExport = useCallback(() => {
    if (deferredMessages.length > 0) {
      exportMessages(deferredMessages);
    }
  }, [deferredMessages]);

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
          {deferredMessages.length > 0 && (
            <button
              aria-label="ส่งออกประวัติแชท"
              className="chat-toolbar__export-btn"
              onClick={handleExport}
              type="button"
            >
              <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              ส่งออก
            </button>
          )}
        </div>
      </div>

      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="message-scroller"
        onScroll={handleScroll}
        ref={scrollerRef}
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
              <MessageBubble key={message.id} message={message} />
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
