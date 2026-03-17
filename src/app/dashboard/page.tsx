import Link from "next/link";

import { UserBadge } from "@/components/auth/UserBadge";
import { DashboardConsole } from "@/components/dashboard/DashboardConsole";
import { Header } from "@/components/layout/Header";
import { appConfig } from "@/lib/config";
import { requireServerAdmin } from "@/lib/server-auth";

export default async function DashboardPage() {
  await requireServerAdmin();

  const environmentName = appConfig.mockMode ? "Mock service" : "Live Vertex";
  const environmentSummary = appConfig.mockMode
    ? "Responses are currently served from mock data for testing and UI validation."
    : "Vertex AI and Search grounding are active for production traffic.";

  return (
    <main className="dashboard-layout dashboard-layout--admin" id="main-content">
      <aside aria-label="เมนูผู้ดูแลระบบ" className="admin-sidebar">
        <div className="admin-sidebar__body">
          <div className="admin-sidebar__section">
            <p className="admin-sidebar__label">
              <span aria-hidden="true" className="admin-sidebar__dot" />
              Admin Control
            </p>
            <nav aria-label="Admin navigation" className="admin-sidebar__nav">
              <Link className="sidebar__item admin-sidebar__link" href="/">
                <span
                  aria-hidden="true"
                  className="sidebar__item-icon admin-sidebar__link-icon"
                >
                  <svg
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="16"
                  >
                    <line x1="19" x2="5" y1="12" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </span>
                <span className="sidebar__item-title">กลับสู่หน้าแชทหลัก</span>
              </Link>
            </nav>
          </div>

          <div className="admin-sidebar__footer">
            <div className="admin-sidebar__status-card">
              <p className="admin-sidebar__label">Environment</p>
              <div aria-live="polite" className="admin-sidebar__status" role="status">
                <span
                  aria-hidden="true"
                  className={`status-dot ${appConfig.mockMode ? "status-dot--warning" : "status-dot--success"} ${appConfig.mockMode ? "" : "status-dot--pulse"}`}
                />
                <span>{environmentName}</span>
              </div>
              <p className="admin-sidebar__status-copy">{environmentSummary}</p>
            </div>
            <UserBadge mockMode={appConfig.mockMode} variant="panel" />
            <div className="sidebar__branding">
              <span className="sidebar__branding-th">บริษัท คิวเทค เทคโนโลยี จำกัด</span>
              <span className="sidebar__branding-en">QTEC TECHNOLOGY COMPANY LIMITED</span>
            </div>
          </div>
        </div>
        </aside>

      <section className="page-stack">
        <Header
          description="ใช้หน้านี้เพื่อตรวจสอบสภาพแวดล้อม, การตั้งค่า Vertex AI และสัญญาณสำคัญก่อนเปิดใช้งานจริง"
          eyebrow="Operations View"
          title="System Dashboard"
        />
        <DashboardConsole />
      </section>
    </main>
  );
}
