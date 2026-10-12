import type { Metadata } from "next";
import type { ReactNode } from "react";

// صفحة إعداد إدارية: ممنوع تظهر في محركات البحث
export const metadata: Metadata = {
  title: "Setup",
  robots: { index: false, follow: false, nocache: true },
};

export default function SetupAdminLayout({ children }: { children: ReactNode }) {
  return children;
}