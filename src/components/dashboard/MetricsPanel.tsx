import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DashboardInfoTile } from "@/components/dashboard/DashboardInfoTile";
import { DashboardPanelHeader } from "@/components/dashboard/DashboardPanelHeader";
import type { HealthResponse } from "@/lib/types";

interface MetricsPanelProps {
  health: HealthResponse | null;
  pollLatencyMs: number | null;
}

const timeFormatter = new Intl.DateTimeFormat("th-TH", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function MetricsPanel({ health, pollLatencyMs }: MetricsPanelProps) {
  const metrics = [
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
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      label: "Client Poll Latency",
      tone: "info" as const,
      value: pollLatencyMs ? `${pollLatencyMs} ms` : "-",
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
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      label: "Vertex Config",
      tone: "success" as const,
      value: health?.vertexAiConfigured ? "Connected" : "Pending",
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
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      ),
      label: "Data Store",
      tone: health?.dataStoreConfigured ? ("success" as const) : ("danger" as const),
      value: health?.dataStoreConfigured ? "Configured" : "Need Config",
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
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-10.45l.25.32" />
        </svg>
      ),
      label: "Last Updated",
      tone: "neutral" as const,
      value: health?.timestamp ? timeFormatter.format(new Date(health.timestamp)) : "-",
    },
  ];

  return (
    <Card className="dashboard-panel">
      <DashboardPanelHeader
        badge={
          <Badge variant={health?.dataStoreConfigured ? "success" : "warning"}>
            {health?.dataStoreConfigured ? "Datastore Ready" : "Datastore Missing"}
          </Badge>
        }
        eyebrow="Runtime Signals"
        title="ตัวชี้วัดและความพร้อม"
        tone={health?.dataStoreConfigured ? "success" : "danger"}
      />

      <div className="dashboard-metrics">
        {metrics.map((metric) => (
          <DashboardInfoTile
            icon={metric.icon}
            key={metric.label}
            label={metric.label}
            tone={metric.tone}
            value={metric.value}
          />
        ))}
      </div>
    </Card>
  );
}
