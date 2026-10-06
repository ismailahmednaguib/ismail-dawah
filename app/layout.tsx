import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";
import BackTop from "@/components/BackTop";
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
    twitter: {
      card: "summary_large_image",
      title: c.settings.ownerName,
      description: c.settings.motto,
      images,
    },
  };
}

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
        <BackTop />
      </body>
    </html>
  );
}