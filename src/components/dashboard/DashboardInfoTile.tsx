import clsx from "clsx";
import type { ReactNode } from "react";

interface DashboardInfoTileProps {
  icon: ReactNode;
  label: string;
  tone?: "danger" | "info" | "neutral" | "success" | "warning";
  value: ReactNode;
  variant?: "metric" | "stat";
}

const toneClassMap = {
  danger: "dashboard-icon--danger",
  info: "dashboard-icon--info",
  neutral: "dashboard-icon--neutral",
  success: "dashboard-icon--success",
  warning: "dashboard-icon--warning",
} as const;

export function DashboardInfoTile({
  icon,
  label,
  tone = "neutral",
  value,
  variant = "metric",
}: DashboardInfoTileProps) {
  const tileClassName = variant === "stat" ? "dashboard-stat" : "metric-tile";
  const headerClassName =
    variant === "stat" ? "dashboard-stat__header" : "metric-tile__header";
  const iconClassName =
    variant === "stat" ? "dashboard-stat__icon" : "metric-tile__icon";
  const labelClassName =
    variant === "stat" ? "dashboard-stat__label" : "metric-tile__label";
  const valueClassName =
    variant === "stat" ? "dashboard-stat__value" : "metric-tile__value";

  return (
    <div className={tileClassName}>
      <div className={headerClassName}>
        <div className={clsx(iconClassName, toneClassMap[tone])}>{icon}</div>
        <span className={labelClassName}>{label}</span>
      </div>
      <strong className={valueClassName}>{value}</strong>
    </div>
  );
}
