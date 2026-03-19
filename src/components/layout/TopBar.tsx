"use client";

import { useCallback, useEffect, useState } from "react";

import { UserBadge } from "@/components/auth/UserBadge";
import { Badge } from "@/components/ui/Badge";

export function TopBar({
  mockMode,
  onToggleSidebar,
}: {
  mockMode: boolean;
  onToggleSidebar?: () => void;
}) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
  }, []);

  const toggleTheme = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("light", !next);

    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [isDark]);

  return (
    <header className="topbar-slim">
      {onToggleSidebar && (
        <button
          aria-label="เปิดหรือปิดเมนูแชท"
          className="topbar-slim__toggle"
          onClick={onToggleSidebar}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
          >
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
        </button>
      )}

      <div className="topbar-slim__brand">
        <span className="topbar-slim__kicker">QTEC</span>
        <span className="topbar-slim__title">Knowledge Brain</span>
        <Badge variant={mockMode ? "warning" : "success"}>
          {mockMode ? "Mock" : "Live"}
        </Badge>
      </div>

      <div className="topbar-slim__actions">
        <button
          aria-label={isDark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
          className="topbar-slim__theme-btn"
          onClick={toggleTheme}
          type="button"
        >
          {isDark ? (
            <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
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
          ) : (
            <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <UserBadge mockMode={mockMode} variant="compact" />
      </div>
    </header>
  );
}

