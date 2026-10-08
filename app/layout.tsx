import type { Metadata, Viewport } from "next";
import { Cairo, Amiri, Scheherazade_New } from "next/font/google";
import "./globals.css";
import HtmlDir from "@/components/HtmlDir";
import SWRegister from "@/components/SWRegister";
import AnalyticsTracker from "@/components/AnalyticsTracker";

// ===== الخطوط العربية =====
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const scheherazade = Scheherazade_New({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-scheherazade",
  display: "swap",
});

// ===== الـ Metadata الأساسي =====
export const metadata: Metadata = {
  title: {
    default: "إسماعيل أحمد نجيب | منصة دعوية شاملة",
    template: "%s | إسماعيل أحمد نجيب",
  },
  description:
    "منصة إسلامية شاملة: القرآن الكريم، الأذكار، الفتاوى، مواقيت الصلاة، الرد على الشبهات، وأدوات الدعوة — كل ما يحتاجه المسلم في مكان واحد",
  keywords: [
    "إسلام",
    "قرآن",
    "أذكار",
    "فتاوى",
    "مواقيت الصلاة",
    "القبلة",
    "دعوة",
    "الإسلام",
    "Islam",
    "Quran",
    "Adhkar",
    "Dawah",
  ],
  authors: [{ name: "إسماعيل أحمد نجيب" }],
  creator: "إسماعيل أحمد نجيب",
  publisher: "إسماعيل أحمد نجيب",
  alternates: {
    canonical: "https://ismailahmednaguib.vercel.app",
    languages: {
      ar: "https://ismailahmednaguib.vercel.app/ar",
      en: "https://ismailahmednaguib.vercel.app/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: ["en_US"],
    url: "https://ismailahmednaguib.vercel.app",
    siteName: "إسماعيل أحمد نجيب | منصة دعوية شاملة",
    title: "إسماعيل أحمد نجيب | منصة دعوية شاملة",
    description:
      "منصة إسلامية شاملة: القرآن الكريم، الأذكار، الفتاوى، مواقيت الصلاة، الرد على الشبهات، وأدوات الدعوة",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "إسماعيل أحمد نجيب",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "إسماعيل أحمد نجيب | منصة دعوية شاملة",
    description: "منصة إسلامية شاملة لكل ما يحتاجه المسلم",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        url: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "إسماعيل أحمد نجيب",
  },
  category: "education",
};

// ===== الـ Viewport =====
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0e7490" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1628" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
};

// ===== الـ Layout الرئيسي =====
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${amiri.variable} ${scheherazade.variable}`}
    >
      <body className="min-h-screen flex flex-col font-[family-name:var(--font-cairo)]">
        {/* بيضبط الاتجاه واللغة والوضع الليلي حسب المسار */}
        <HtmlDir />

        {/* تسجيل الـ Service Worker للـ PWA */}
        <SWRegister />

        {/* تتبع التحليلات */}
        <AnalyticsTracker />

        {children}
      </body>
    </html>
  );
}