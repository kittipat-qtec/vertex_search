import { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "ไม่มีสิทธิ์เข้าถึง",
};

export default function UnauthorizedPage() {
  return (
    <main className="unauthorized-shell" id="main-content">
      <section
        aria-labelledby="unauthorized-title"
        className="surface unauthorized-card unauthorized-card--centered"
      >
        <div aria-hidden="true" className="unauthorized-card__icon">
          <svg
            fill="none"
            height="64"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            width="64"
          >
            <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <span className="unauthorized-card__kicker unauthorized-card__kicker--danger">
          Access Denied
        </span>
        <h1
          className="unauthorized-card__title unauthorized-card__title--compact"
          id="unauthorized-title"
        >
          ไม่มีสิทธิ์เข้าถึงระบบ
        </h1>
        <p className="unauthorized-card__copy unauthorized-card__copy--spaced">
          คุณยังไม่ได้รับสิทธิ์ให้เข้าถึงระบบในส่วนนี้
          <br />
          กรุณาติดต่อทีม IT เพื่อขอสิทธิ์การใช้งาน
        </p>

        <div className="unauthorized-card__actions">
          <a
            className="btn btn--primary unauthorized-card__action"
            href="mailto:it@qtec-technology.com?subject=Request%20Access%20to%20QTEC%20Knowledge%20Brain"
          >
            ติดต่อฝ่าย IT
          </a>
          <Link className="btn btn--secondary unauthorized-card__action" href="/">
            กลับหน้าแรก
          </Link>
        </div>
      </section>
    </main>
  );
}
