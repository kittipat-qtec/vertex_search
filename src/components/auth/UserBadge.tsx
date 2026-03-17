"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

type UserBadgeVariant = "compact" | "panel";

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

export function UserBadge({
  mockMode,
  variant = "compact",
}: {
  mockMode: boolean;
  variant?: UserBadgeVariant;
}) {
  const { user, isLoading } = useAuth();
  const [activeModal, setActiveModal] = useState<"help" | "settings" | null>(
    null,
  );
  const [isLightMode, setIsLightMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownId = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLightMode(document.documentElement.classList.contains("light"));
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const reportIssueHref = useMemo(() => {
    if (!user) {
      return "mailto:kittipat@qtec-technology.com";
    }

    const subject = encodeURIComponent("แจ้งปัญหาการใช้งาน QTEC Knowledge Brain");
    const body = encodeURIComponent(
      `สวัสดีครับ,\n\nพบปัญหาการใช้งานระบบดังนี้:\n\n[กรุณาระบุปัญหาที่พบ]\n\nข้อมูลผู้แจ้ง:\nชื่อ: ${user.displayName}\nEmail: ${user.email || user.username}`,
    );

    return `mailto:kittipat@qtec-technology.com?subject=${subject}&body=${body}`;
  }, [user]);

  if (isLoading) {
    return (
      <div
        className={`skeleton-chip ${variant === "panel" ? "skeleton-chip--panel" : ""}`}
      />
    );
  }

  if (!user) {
    return <Badge variant="warning">ไม่พบตัวตนผู้ใช้</Badge>;
  }

  const identity = user.email || user.username;
  const roleLabel = user.isAdmin ? "Administrator" : "Team Member";
  const environmentLabel = mockMode ? "Mock environment" : "Live environment";
  const initials = getInitials(user.displayName);
  const isPanel = variant === "panel";
  const summaryLabel = isPanel
    ? user.isAdmin
      ? "Dashboard and workspace access"
      : "Knowledge workspace access"
    : "";

  return (
    <>
      <div
        className={`user-badge-container user-badge-container--${variant}`}
        ref={dropdownRef}
      >
        <button
          aria-controls={dropdownId}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label={`${user.displayName} account menu`}
          className={`user-badge user-badge--${variant} ${isOpen ? "user-badge--active" : ""}`}
          onClick={() => {
            setIsOpen((current) => !current);
          }}
          type="button"
        >
          <span
            aria-hidden="true"
            className={`user-badge__avatar ${isPanel ? "" : "user-badge__avatar--compact"}`.trim()}
          >
            {initials}
          </span>

          <div className="user-badge__meta">
            {isPanel ? (
              <span className="user-badge__eyebrow">{roleLabel}</span>
            ) : null}
            <span className="user-badge__name" title={user.displayName}>
              {user.displayName}
            </span>
            {summaryLabel ? (
              <span className="user-badge__summary" title={summaryLabel}>
                {summaryLabel}
              </span>
            ) : null}
          </div>
          <svg
            aria-hidden="true"
            className="user-badge__chevron"
            fill="none"
            height="16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="16"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isOpen ? (
          <div
            className={`user-dropdown user-dropdown--${variant}`}
            id={dropdownId}
            role="menu"
          >
            <div className="user-dropdown__header">
              <span className="user-dropdown__eyebrow">Account</span>
              <span className="user-dropdown__name" title={user.displayName}>
                {user.displayName}
              </span>
              <span className="user-dropdown__email" title={identity}>
                {identity}
              </span>
              <span className="user-dropdown__meta">
                {roleLabel} / {environmentLabel}
              </span>
            </div>
            <div className="user-dropdown__divider" />
            <ul className="user-dropdown__list">
              {user.isAdmin ? (
                <li>
                  <Link
                    className="user-dropdown__item"
                    href="/dashboard"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    role="menuitem"
                  >
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="16"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="16"
                    >
                      <path d="M3 3v18h18" />
                      <path d="M18 17V9" />
                      <path d="M13 17V5" />
                      <path d="M8 17v-3" />
                    </svg>
                    แดชบอร์ดแอดมิน
                  </Link>
                </li>
              ) : null}
              <li>
                <button
                  className="user-dropdown__item"
                  onClick={() => {
                    setIsOpen(false);
                    setActiveModal("settings");
                  }}
                  role="menuitem"
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="16"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  การตั้งค่า
                </button>
              </li>
              <li>
                <button
                  className="user-dropdown__item"
                  onClick={() => {
                    setIsLightMode((current) => {
                      const nextIsLightMode = !current;

                      document.documentElement.classList.toggle(
                        "light",
                        nextIsLightMode,
                      );
                      localStorage.setItem(
                        "theme",
                        nextIsLightMode ? "light" : "dark",
                      );

                      return nextIsLightMode;
                    });
                    setIsOpen(false);
                  }}
                  role="menuitem"
                  type="button"
                >
                  {isLightMode ? (
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="16"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="16"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="16"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="16"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" x2="12" y1="1" y2="3" />
                      <line x1="12" x2="12" y1="21" y2="23" />
                      <line x1="4.22" x2="5.64" y1="4.22" y2="5.64" />
                      <line x1="18.36" x2="19.78" y1="18.36" y2="19.78" />
                      <line x1="1" x2="3" y1="12" y2="12" />
                      <line x1="21" x2="23" y1="12" y2="12" />
                      <line x1="4.22" x2="5.64" y1="19.78" y2="18.36" />
                      <line x1="18.36" x2="19.78" y1="5.64" y2="4.22" />
                    </svg>
                  )}
                  {isLightMode ? "เปลี่ยนเป็นโหมดมืด" : "เปลี่ยนเป็นโหมดสว่าง"}
                </button>
              </li>
              <li>
                <button
                  className="user-dropdown__item"
                  onClick={() => {
                    setIsOpen(false);
                    setActiveModal("help");
                  }}
                  role="menuitem"
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="16"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" x2="12.01" y1="17" y2="17" />
                  </svg>
                  คู่มือการใช้งาน
                </button>
              </li>
            </ul>
            <div className="user-dropdown__divider" />
            <a
              className="user-dropdown__item user-dropdown__item--danger"
              href={reportIssueHref}
              onClick={() => {
                setIsOpen(false);
              }}
              role="menuitem"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="16"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              แจ้งปัญหา
            </a>
          </div>
        ) : null}
      </div>

      <Modal
        isOpen={activeModal === "settings"}
        onClose={() => {
          setActiveModal(null);
        }}
        title="การตั้งค่าระบบ"
      >
        <h3>โหมดการเชื่อมต่อ</h3>
        <p>
          คุณกำลังใช้งาน
          {" "}
          <strong>{mockMode ? "Mock Mode (ทดสอบ)" : "Live Mode"}</strong>
        </p>
        <p className="modal-copy">
          การตั้งค่าเอกสารและสิทธิ์เข้าถึงถูกควบคุมจากฝั่งผู้ดูแลระบบ
          หากต้องการปรับสิทธิ์หรือเปลี่ยนแผนก ให้ติดต่อทีม IT Support
        </p>
      </Modal>

      <Modal
        isOpen={activeModal === "help"}
        onClose={() => {
          setActiveModal(null);
        }}
        title="วิธีการตั้งคำถาม"
      >
        <h3>เทคนิคที่ช่วยให้ตอบได้แม่นยำขึ้น</h3>
        <ul>
          <li>
            <strong>ระบุบริบทให้ชัด</strong>
            {" "}
            เช่น ถามว่าข้อมูลนี้ใช้กับพนักงานประจำ, พนักงานใหม่ หรือผู้บริหาร
          </li>
          <li>
            <strong>ใส่ปีหรือชื่อเอกสาร</strong>
            {" "}
            เช่น “วันหยุดประจำปี 2569” จะชัดกว่าการถามแบบกว้าง
          </li>
          <li>
            <strong>ขอให้สรุปเป็นขั้นตอน</strong>
            {" "}
            เมื่อต้องการเอาไปทำงานต่อ เช่น ขั้นตอนการเบิกค่า OT หรือสวัสดิการ
          </li>
        </ul>
        <h3>ข้อจำกัดของ AI</h3>
        <p className="modal-copy">
          ระบบตอบจากเอกสารที่ถูกเชื่อมไว้แบบ RAG จึงควรตรวจสอบตัวเลข,
          วันที่ และนโยบายสำคัญกับเอกสารต้นฉบับก่อนนำไปใช้งานจริงเสมอ
        </p>
      </Modal>
    </>
  );
}
