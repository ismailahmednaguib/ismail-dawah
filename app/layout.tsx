// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Cairo, Amiri, Scheherazade_New } from "next/font/google";
import "./globals.css";
import HtmlDir from "@/components/HtmlDir";
import SWRegister from "@/components/SWRegister";
import AnalyticsTracker from "@/components/AnalyticsTracker";

// ============================================================
// Site constants
// ============================================================

const FALLBACK_SITE_URL = "https://ismailahmednaguib.vercel.app";

function normalizeSiteUrl(raw: string | undefined | null): string {
  const value = String(raw || "").trim();

  if (!value) {
    return FALLBACK_SITE_URL;
  }

  try {
    const url = new URL(value);

    // نستخدم origin فقط حتى لا تتكرر مسارات غريبة في metadataBase
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

const SITE_NAME = "إسماعيل أحمد نجيب | منصة دعوية شاملة";
const SITE_SHORT_NAME = "إسماعيل أحمد نجيب";

const SITE_DESCRIPTION_AR =
  "منصة إسلامية شاملة: القرآن الكريم، الأذكار، الفتاوى، مواقيت الصلاة، الرد على الشبهات، وأدوات الدعوة — كل ما يحتاجه المسلم في مكان واحد.";

// ============================================================
// Fonts
// مهم: نستخدم -source حتى لا تتعارض أسماء المتغيرات مع Tailwind
// ============================================================

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700", "900"],
  variable: "--font-cairo-source",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri-source",
  display: "swap",
});

const scheherazade = Scheherazade_New({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-scheherazade-source",
  display: "swap",
});

// ============================================================
// Metadata
// ============================================================

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_SHORT_NAME}`,
  },

  description: SITE_DESCRIPTION_AR,

  applicationName: SITE_SHORT_NAME,

  keywords: [
    "إسلام",
    "قرآن",
    "أذكار",
    "فتاوى",
    "مواقيت الصلاة",
    "القبلة",
    "دعوة",
    "الرد على الشبهات",
    "منصة دعوية",
    "قصص الأنبياء",
    "الرقية الشرعية",
    "حاسبة الزكاة",
    "دليل الحج",
    "Islam",
    "Quran",
    "Adhkar",
    "Fatwa",
    "Prayer Times",
    "Qibla",
    "Dawah",
    "Islamic Platform",
    "Prophets Stories",
    "Ruqyah",
    "Zakat Calculator",
    "Hajj Guide",
  ],

  authors: [
    {
      name: SITE_SHORT_NAME,
      url: SITE_URL,
    },
  ],

  creator: SITE_SHORT_NAME,
  publisher: SITE_SHORT_NAME,

  category: "education",

  alternates: {
    canonical: SITE_URL,
    languages: {
      ar: `${SITE_URL}/ar`,
      en: `${SITE_URL}/en`,
      "x-default": SITE_URL,
    },
  },

  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION_AR,
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: SITE_SHORT_NAME,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "منصة إسلامية شاملة لكل ما يحتاجه المسلم.",
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
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
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
    title: SITE_SHORT_NAME,
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

// ============================================================
// Viewport
// ============================================================

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
  viewportFit: "cover",

  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#0e7490",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#0a1628",
    },
  ],
};

// ============================================================
// Root Layout
// ============================================================

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
      <body
        className="min-h-screen flex flex-col antialiased"
        style={{
          fontFamily:
            "var(--font-cairo-source), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* يضبط الاتجاه واللغة والوضع الليلي حسب المسار */}
        <HtmlDir />

        {/* تخطي إلى المحتوى — مفيد للوصولية */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-cyan-700 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
        >
          تخطَّ إلى المحتوى
        </a>

        {/* تسجيل Service Worker للـ PWA */}
        <SWRegister />

        {/* تتبع التحليلات */}
        <AnalyticsTracker />

        {children}
      </body>
    </html>
  );
}