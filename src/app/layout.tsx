import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Script from "next/script";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { appConfig } from "@/lib/config";
import { getOptionalServerUser } from "@/lib/server-auth";

import "./globals.css";

const bodyFont = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: appConfig.appName,
  title: {
    default: appConfig.appName,
    template: `%s | ${appConfig.appName}`,
  },
  description:
    "Thai-first enterprise managed RAG interface for internal QTEC knowledge search.",
};

export const viewport: Viewport = {
  themeColor: "#07111c",
};

const themeScript = `
(() => {
  try {
    if (localStorage.getItem("theme") === "light") {
      document.documentElement.classList.add("light");
    }
  } catch (error) {
    void error;
  }
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getOptionalServerUser();

  return (
    <html lang="th" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={bodyFont.variable}
        style={{ "--font-display": "var(--font-sans)" } as CSSProperties}
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <a className="skip-link" href="#main-content">
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
      </body>
    </html>
  );
}
