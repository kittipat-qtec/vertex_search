"use client";

import { HealthCard } from "@/components/dashboard/HealthCard";
import { MetricsPanel } from "@/components/dashboard/MetricsPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useHealth } from "@/hooks/useHealth";

export function DashboardConsole() {
  const { error, health, isLoading, pollLatencyMs, refresh } = useHealth();

  return (
    <section className="dashboard-grid">
      <HealthCard error={error} health={health} isLoading={isLoading} />
      <MetricsPanel health={health} pollLatencyMs={pollLatencyMs} />

      <Card className="dashboard-note dashboard-note--highlight">
        <div className="dashboard-panel__header">
          <div>
            <span className="dashboard-panel__eyebrow">Verification</span>
            <h2 className="dashboard-panel__title">แนวทางทดสอบเร็ว</h2>
          </div>
          <Button onClick={() => void refresh()} type="button" variant="secondary">
            รีเฟรช
          </Button>
        </div>

        <ol className="dashboard-checklist">
          <li>เรียก `/api/health` เพื่อตรวจว่า mock หรือ live mode ทำงานอยู่</li>
          <li>เรียก `/api/auth/whoami` เพื่อตรวจการ parse IIS headers</li>
          <li>ส่งคำถามไป `/api/ask` และดูว่ามี source citations กลับมาหรือไม่</li>
          <li>ใช้ `/api/search/debug` เมื่อต้องการดู retrieval chunks แบบเร็ว</li>
        </ol>
      </Card>
    </section>
  );
}
