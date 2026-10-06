import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";
import BackTop from "@/components/BackTop";
import SWRegister from "@/components/SWRegister";
import { getContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  const images = c.settings.ogImage ? [c.settings.ogImage] : [];
  return {
    title: {
      default: `${c.settings.ownerName} | موقع دعوي`,
      template: `%s | ${c.settings.shortName}`,
    },
    description: `${c.settings.jobTitle} — دروس ومرئيات ومقالات وكتب في العلوم الشرعية.`,
    openGraph: {
      type: "website",
      locale: "ar_EG",
      siteName: c.settings.ownerName,
      title: c.settings.ownerName,
      description: c.settings.motto,
      images,
    },
    twitter: { card: "summary_large_image", title: c.settings.ownerName, description: c.settings.motto, images },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0b2e22" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="الشيخ إسماعيل" />
      </head>
      <body>
        <TopBar />
        {children}
        <BackTop />
        <SWRegister />
      </body>
    </html>
  );
}