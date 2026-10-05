import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: {
    default: "الشيخ إسماعيل أحمد نجيب | موقع دعوي",
    template: "%s | الشيخ إسماعيل أحمد نجيب",
  },
  description: "داعية إسلامي وباحث في مقارنة الأديان — دروس ومحاضرات ومرئيات ومقالات وجدول دروس أسبوعي.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <TopBar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}