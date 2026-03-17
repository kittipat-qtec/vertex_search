"use client";

import { useEffect, useId, useRef, useState } from "react";

interface QuestionInputProps {
  isLoading: boolean;
  suggestions: readonly string[];
  onSubmit: (question: string) => Promise<boolean>;
}

export function QuestionInput({
  isLoading,
  suggestions,
  onSubmit,
}: QuestionInputProps) {
  const [question, setQuestion] = useState("");
  const hintId = useId();
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [question]);

  const submit = async (value: string) => {
    const trimmed = value.trim();

    if (!trimmed || isLoading) {
      return;
    }

    const success = await onSubmit(trimmed);

    if (!success) {
      return;
    }

    setQuestion("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const canSubmit = !isLoading && question.trim().length > 0;

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(question);
      }}
    >
      {suggestions.length > 0 ? (
        <ul aria-label="คำถามแนะนำ" className="suggestion-row" role="list">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                className="chip"
                disabled={isLoading}
                onClick={() => {
                  void submit(suggestion);
                }}
                type="button"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="composer__field">
        <label className="visually-hidden" htmlFor={textareaId}>
          พิมพ์คำถามสำหรับค้นหาข้อมูล
        </label>
        <div className="composer__panel">
          <textarea
            aria-describedby={hintId}
            autoComplete="off"
            className="composer__textarea"
            disabled={isLoading}
            enterKeyHint="send"
            id={textareaId}
            inputMode="search"
            name="question"
            onChange={(event) => {
              setQuestion(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submit(question);
              }
            }}
            placeholder="พิมพ์คำถาม เช่น สรุปขั้นตอนการเบิก OT..."
            ref={textareaRef}
            rows={1}
            spellCheck={false}
            value={question}
          />
          <div className="composer__actions-inline">
            <button
              aria-label="ส่งคำถาม"
              className="composer__send-btn"
              disabled={!canSubmit}
              type="submit"
            >
              {isLoading ? (
                <span aria-hidden="true" className="composer__spinner" />
              ) : (
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.4 20.4L20.85 12.92C21.66 12.57 21.66 11.43 20.85 11.08L3.4 3.6C2.74 3.31 2.01 3.8 2.06 4.51L2.58 11.15C2.61 11.53 2.9 11.84 3.28 11.89L13.5 12L3.28 12.11C2.9 12.16 2.61 12.47 2.58 12.85L2.06 19.49C2.01 20.2 2.74 20.69 3.4 20.4Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <p aria-live="polite" className="composer__hint" id={hintId}>
        {isLoading
          ? "กรุณารอให้คำตอบก่อนหน้าสร้างเสร็จก่อนจึงจะส่งคำถามใหม่ได้"
          : "กด Enter เพื่อส่ง หรือ Shift + Enter เพื่อขึ้นบรรทัดใหม่"}
      </p>
    </form>
  );
}
