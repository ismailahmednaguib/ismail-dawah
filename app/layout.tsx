// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import HtmlDir from "@/components/HtmlDir";
import SkipLink from "@/components/SkipLink";
import SWRegister from "@/components/SWRegister";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { SITE_NAME as BRAND_NAME, SITE_AUTHOR } from "@/lib/site";

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
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

const SITE_NAME = BRAND_NAME;
const SITE_SHORT_NAME = SITE_AUTHOR;

const SITE_DESCRIPTION_AR =
  "منصة إسلامية شاملة: القرآن الكريم، الأذكار، الفتاوى، مواقيت الصلاة، الرد على الشبهات، وأدوات الدعوة — كل ما يحتاجه المسلم في مكان واحد.";

// ============================================================
// Metadata
// ============================================================

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION_AR,

  applicationName: SITE_NAME,

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
  publisher: SITE_NAME,

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
      // لا تضع purpose هنا إذا كان إصدار Next عندك لا يدعمه.
      // الأيقونة Maskable تُضاف في manifest.webmanifest.
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
    >
      <body
        className="min-h-screen flex flex-col antialiased"
        style={{
          fontFamily:
            "var(--font-cairo-source), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/*
          يضبط اللغة والاتجاه قبل أول رسم، فلا تظهر صفحة إنجليزية
          باتجاه عربي أو بلغة خاطئة لقارئ الشاشة أثناء التحميل.
        */}
        <Script id="html-lang-dir" strategy="beforeInteractive">
          {`(function(){try{var p=location.pathname.split('/')[1];var l=p==='en'?'en':'ar';document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark', s==='dark'||(!s&&d));}catch(e){}})();`}
        </Script>

        <HtmlDir />

        <SkipLink />

        <SWRegister />

        <AnalyticsTracker />

        {/*
          لا نضع id="main-content" هنا: كل صفحة تضع الهيدر داخل children،
          فكان الرابط يتخطى إلى غلاف يشمل الهيدر نفسه. الصفحات العامة تضع
          المعرّف على <main> بعد الهيدر مباشرة.
        */}
        <div>{children}</div>
      </body>
    </html>
  );
}
