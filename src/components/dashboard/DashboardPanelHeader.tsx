import type { ReactNode } from "react";

interface DashboardPanelHeaderProps {
  badge?: ReactNode;
  eyebrow: string;
  title: string;
  tone?: "danger" | "success" | "warning";
}

const toneClassMap = {
  danger: "status-dot--danger",
  success: "status-dot--success status-dot--pulse",
  warning: "status-dot--warning",
} as const;

export function DashboardPanelHeader({
  badge,
  eyebrow,
  title,
  tone = "success",
}: DashboardPanelHeaderProps) {
  return (
    <div className="dashboard-panel__header">
      <div className="dashboard-panel__heading">
        <span
          aria-hidden="true"
          className={`status-dot ${toneClassMap[tone]}`}
        />
        <div>
          <span className="dashboard-panel__eyebrow">{eyebrow}</span>
          <h2 className="dashboard-panel__title">{title}</h2>
        </div>
      </div>
      {badge ? <div className="dashboard-panel__meta">{badge}</div> : null}
    </div>
  );
}
