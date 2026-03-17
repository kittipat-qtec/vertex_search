import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DashboardInfoTile } from "@/components/dashboard/DashboardInfoTile";
import { DashboardPanelHeader } from "@/components/dashboard/DashboardPanelHeader";
import type { HealthResponse } from "@/lib/types";

interface HealthCardProps {
  health: HealthResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function HealthCard({ health, isLoading, error }: HealthCardProps) {
  const stats = [
    {
      icon: (
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
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      label: "Project",
      value: health?.project || "not-configured",
    },
    {
      icon: (
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
          <circle cx="12" cy="12" r="10" />
          <line x1="2" x2="22" y1="12" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      label: "Location",
      tone: "success" as const,
      value: health?.location || "-",
    },
    {
      icon: (
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
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      label: "Model",
      tone: "warning" as const,
      value: health?.model || "-",
    },
    {
      icon: (
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
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      label: "Mode",
      tone: "info" as const,
      value: health?.mock ? "Mock Service" : "Live Vertex",
    },
  ];

  return (
    <Card className="dashboard-panel">
      <DashboardPanelHeader
        badge={
          <Badge variant={health?.ok ? "success" : "warning"}>
            {isLoading
              ? "Loading…"
              : health?.ok
                ? "Healthy & Online"
                : "Attention Required"}
          </Badge>
        }
        eyebrow="System Health"
        title="สถานะการเชื่อมต่อ"
        tone={health?.ok ? "success" : "warning"}
      />

      {error ? (
        <p aria-live="polite" className="dashboard-panel__error" role="status">
          {error}
        </p>
      ) : null}

      <div className="dashboard-stats">
        {stats.map((stat) => (
          <DashboardInfoTile
            icon={stat.icon}
            key={stat.label}
            label={stat.label}
            tone={stat.tone}
            value={stat.value}
            variant="stat"
          />
        ))}
      </div>
    </Card>
  );
}
