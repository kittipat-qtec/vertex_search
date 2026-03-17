import clsx from "clsx";
import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "success" | "warning";

const variantClassMap: Record<BadgeVariant, string> = {
  neutral: "badge--neutral",
  success: "badge--success",
  warning: "badge--warning",
};

export function Badge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
}) {
  return <span className={clsx("badge", variantClassMap[variant])}>{children}</span>;
}
