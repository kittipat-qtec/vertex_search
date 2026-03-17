"use client";

import { UserBadge } from "@/components/auth/UserBadge";
import { Badge } from "@/components/ui/Badge";

export function TopBar({
  mockMode,
  onToggleSidebar,
}: {
  mockMode: boolean;
  onToggleSidebar?: () => void;
}) {
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

      <UserBadge mockMode={mockMode} variant="compact" />
    </header>
  );
}
