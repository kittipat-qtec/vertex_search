"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Modal } from "@/components/ui/Modal";
import type { ChatSession } from "@/hooks/useChatHistory";

interface SidebarProps {
  activeSessionId: string | null;
  isBusy: boolean;
  isOpen: boolean;
  onDeleteSession: (id: string) => void;
  onNewChat: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onSelectSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  sessions: ChatSession[];
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeSessionId,
  isBusy,
  isOpen,
  onDeleteSession,
  onNewChat,
  onRenameSession,
  onSelectSession,
  onTogglePinSession,
  sessions,
  setIsOpen,
}: SidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [pendingDeleteSession, setPendingDeleteSession] =
    useState<ChatSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const visibleSessions = useMemo(
    () => {
      const base = sessions.filter(
        (session) => session.messages.length > 0 || session.id === activeSessionId,
      );

      if (!searchQuery.trim()) {
        return base;
      }

      const q = searchQuery.toLowerCase().trim();
      return base.filter((session) =>
        session.title.toLowerCase().includes(q) ||
        session.messages.some((m) => m.text.toLowerCase().includes(q)),
      );
    },
    [activeSessionId, searchQuery, sessions],
  );

  const closeSidebar = useCallback(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [setIsOpen]);

  const closeDropdown = useCallback(() => {
    setOpenDropdownId(null);
  }, []);

  const saveEditing = useCallback(() => {
    if (!editingSessionId) {
      return;
    }

    const nextTitle = editTitle.trim();

    if (nextTitle) {
      onRenameSession(editingSessionId, nextTitle);
    }

    setEditingSessionId(null);
    setEditTitle("");
  }, [editTitle, editingSessionId, onRenameSession]);

  const startEditing = useCallback((session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
    setOpenDropdownId(null);
  }, []);

  useEffect(() => {
    if (isBusy) {
      closeDropdown();
    }
  }, [closeDropdown, isBusy]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [closeDropdown]);

  useEffect(() => {
    if (!editingSessionId || window.innerWidth < 768) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [editingSessionId]);

  return (
    <>
      {isOpen ? (
        <button
          aria-label="ปิดเมนูแชท"
          className="sidebar-overlay"
          onClick={closeSidebar}
          type="button"
        />
      ) : null}

      <aside
        aria-label="ประวัติการสนทนา"
        className={`sidebar ${isOpen ? "sidebar--open" : ""}`}
      >
        <div className="sidebar__header">
          <button
            className="sidebar__new-btn"
            disabled={isBusy}
            onClick={onNewChat}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="18"
            >
              <line x1="12" x2="12" y1="5" y2="19" />
              <line x1="5" x2="19" y1="12" y2="12" />
            </svg>
            แชทใหม่
          </button>
        </div>

        <div className="sidebar__content">
          <div className="sidebar__search">
            <svg aria-hidden="true" className="sidebar__search-icon" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
            <input
              aria-label="ค้นหาประวัติแชท"
              className="sidebar__search-input"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาแชท..."
              type="text"
              value={searchQuery}
            />
            {searchQuery && (
              <button
                aria-label="ล้างการค้นหา"
                className="sidebar__search-clear"
                onClick={() => setSearchQuery("")}
                type="button"
              >
                ✕
              </button>
            )}
          </div>

          <h2 className="sidebar__label" id="chat-history-heading">
            ประวัติการสนทนา
          </h2>

          {visibleSessions.length === 0 ? (
            <div className="sidebar__empty">ยังไม่มีประวัติการสนทนา</div>
          ) : (
            <ul aria-labelledby="chat-history-heading" className="sidebar__list">
              {visibleSessions.map((session) => {
                const isEditing = editingSessionId === session.id;
                const isMenuOpen = openDropdownId === session.id;

                return (
                  <li
                    className={`sidebar__item-wrapper ${isMenuOpen ? "sidebar__item-wrapper--open" : ""}`}
                    key={session.id}
                  >
                    <button
                      aria-pressed={activeSessionId === session.id}
                      className={`sidebar__item ${activeSessionId === session.id ? "sidebar__item--active" : ""}`}
                      disabled={isBusy}
                      onClick={() => {
                        if (!isEditing) {
                          onSelectSession(session.id);
                          closeSidebar();
                        }
                      }}
                      type="button"
                    >
                      {session.isPinned ? (
                        <svg
                          aria-hidden="true"
                          className="sidebar__item-icon sidebar__item-icon--pinned"
                          fill="currentColor"
                          height="16"
                          stroke="none"
                          viewBox="0 0 24 24"
                          width="16"
                        >
                          <path d="M19.141 6.556c-0.551-0.291-1.221-0.25-1.748 0.088l-2.022 1.309-3.879-3.879 1.309-2.022c0.339-0.528 0.38-1.198 0.088-1.749s-0.811-0.908-1.424-0.933l-7.234-0.292c-0.643-0.027-1.193 0.448-1.233 1.09l-0.292 7.234c-0.025 0.613 0.331 1.132 0.883 1.424 0.222 0.117 0.463 0.176 0.704 0.176 0.373 0 0.742-0.165 0.994-0.473l2.022-2.476 3.879 3.879-2.476 2.022c-0.308 0.252-0.473 0.621-0.473 0.994 0 0.241 0.059 0.481 0.176 0.704 0.292 0.552 0.811 0.908 1.424 0.933l7.234 0.292c0.041 0.002 0.081 0.003 0.122 0.003 0.6 0 1.121-0.457 1.206-1.09l0.292-7.234c0.025-0.613-0.331-1.132-0.883-1.424z" />
                        </svg>
                      ) : (
                        <svg
                          aria-hidden="true"
                          className="sidebar__item-icon"
                          fill="none"
                          height="16"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="16"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      )}

                      {isEditing ? (
                        <input
                          aria-label="เปลี่ยนชื่อแชท"
                          className="sidebar__item-input"
                          onBlur={saveEditing}
                          onChange={(event) => {
                            setEditTitle(event.target.value);
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              saveEditing();
                            }

                            if (event.key === "Escape") {
                              setEditingSessionId(null);
                              setEditTitle("");
                            }
                          }}
                          ref={editInputRef}
                          type="text"
                          value={editTitle}
                        />
                      ) : (
                        <span className="sidebar__item-title">{session.title}</span>
                      )}
                    </button>

                    <div
                      className="sidebar__kebab-wrapper"
                      ref={isMenuOpen ? dropdownRef : null}
                    >
                      <button
                        aria-expanded={isMenuOpen}
                        aria-haspopup="menu"
                        aria-label={`จัดการแชท ${session.title}`}
                        className="sidebar__kebab-btn"
                        disabled={isBusy}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenDropdownId((currentId) =>
                            currentId === session.id ? null : session.id,
                          );
                        }}
                        type="button"
                      >
                        <svg
                          aria-hidden="true"
                          fill="none"
                          height="18"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="18"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>

                      {isMenuOpen && !isBusy ? (
                        <ul
                          aria-label={`ตัวเลือกสำหรับ ${session.title}`}
                          className="sidebar__dropdown"
                          role="menu"
                        >
                          <li>
                            <button
                              className="sidebar__dropdown-item"
                              onClick={() => {
                                onTogglePinSession(session.id);
                                closeDropdown();
                              }}
                              role="menuitem"
                              type="button"
                            >
                              <svg
                                aria-hidden="true"
                                fill="none"
                                height="14"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="14"
                              >
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                              </svg>
                              {session.isPinned ? "ยกเลิกปักหมุด" : "ปักหมุด"}
                            </button>
                          </li>
                          <li>
                            <button
                              className="sidebar__dropdown-item"
                              onClick={() => {
                                startEditing(session);
                              }}
                              role="menuitem"
                              type="button"
                            >
                              <svg
                                aria-hidden="true"
                                fill="none"
                                height="14"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="14"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              เปลี่ยนชื่อแชท
                            </button>
                          </li>
                          <li>
                            <button
                              className="sidebar__dropdown-item sidebar__dropdown-item--danger"
                              onClick={() => {
                                setPendingDeleteSession(session);
                                closeDropdown();
                              }}
                              role="menuitem"
                              type="button"
                            >
                              <svg
                                aria-hidden="true"
                                fill="none"
                                height="14"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="14"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              ลบ
                            </button>
                          </li>
                        </ul>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="sidebar__footer">
          <div className="sidebar__branding">
            <span className="sidebar__branding-th">บริษัท คิวเทค เทคโนโลยี จำกัด</span>
            <span className="sidebar__branding-en">QTEC TECHNOLOGY COMPANY LIMITED</span>
          </div>
        </div>
      </aside>

      <Modal
        isOpen={pendingDeleteSession !== null}
        onClose={() => {
          setPendingDeleteSession(null);
        }}
        title="ลบประวัติการสนทนา"
      >
        <p className="modal-copy">
          ต้องการลบประวัติแชท
          {" "}
          <strong>{pendingDeleteSession?.title}</strong>
          {" "}
          ใช่หรือไม่
        </p>
        <div className="modal-actions">
          <button
            className="btn btn--ghost"
            onClick={() => {
              setPendingDeleteSession(null);
            }}
            type="button"
          >
            ยกเลิก
          </button>
          <button
            className="btn btn--secondary"
            onClick={() => {
              if (!pendingDeleteSession) {
                return;
              }

              onDeleteSession(pendingDeleteSession.id);
              setPendingDeleteSession(null);
            }}
            type="button"
          >
            ยืนยันการลบ
          </button>
        </div>
      </Modal>
    </>
  );
}
