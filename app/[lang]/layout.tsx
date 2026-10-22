// app/[lang]/layout.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { isValidLang, type Lang } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/content";
import { readSettingText } from "@/lib/settings-text";
import { SITE_NAME, SITE_NAME_EN, SITE_AUTHOR, SITE_AUTHOR_EN } from "@/lib/site";

// نُخفّف قراءة الإعدادات: تُقرأ مرة واحدة لكل طلب وتُستخدم في generateMetadata
// وفي عرض JSON-LD معًا.
const getCachedSettings = cache(getSiteSettings);

/**
 * يقرأ إعدادًا نصيًّا مترجمًا من اللوحة مع احتياطي ثابت.
 * كائن `{ ar, en }` له الأولوية، ولا نُسرّب نصًّا عربيًّا إلى الواجهة الإنجليزية.
 */
function pickSetting(
  settings: Record<string, any>,
  key: string,
  lang: Lang,
  fallback: string
): string {
  return readSettingText(settings?.[key], lang, fallback);
}

const DEFAULT_NAMES: Record<Lang, string> = {
  ar: SITE_NAME,
  en: SITE_NAME_EN,
};

const DEFAULT_DESCRIPTIONS: Record<Lang, string> = {
  ar: "منصة دعوية شاملة تجمع القرآن الكريم، والأذكار، والفتاوى، وقصص الأنبياء، ومواقيت الصلاة، واتجاه القبلة، وأدوات الدعوة في مكان واحد، بلغتين وتصميم متجاوب.",
  en: "A comprehensive dawah platform bringing together the Holy Quran, adhkar, fatwas, prophets' stories, prayer times, Qibla direction, and dawah tools in one place, bilingual and responsive.",
};

// ============================================================
// Metadata ديناميكية شاملة
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    return {};
  }

  const l = lang as Lang;
  const isRTL = l === "ar";

  const settings = await getCachedSettings();

  const siteName = pickSetting(settings, "ownerName", l, DEFAULT_NAMES[l]);
  const description = pickSetting(
    settings,
    "siteDescription",
    l,
    DEFAULT_DESCRIPTIONS[l]
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ismailahmednaguib.vercel.app";

  return {
    metadataBase: new URL(baseUrl),
    manifest: `/${l}/manifest.webmanifest`,
    title: {
      default: siteName,
      template: isRTL ? `%s | ${siteName}` : `%s | ${siteName}`,
    },
    description,
    applicationName: siteName,
    authors: [
      {
        name: isRTL ? SITE_AUTHOR : SITE_AUTHOR_EN,
        url: baseUrl,
      },
    ],
    creator: isRTL ? SITE_AUTHOR : SITE_AUTHOR_EN,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: `/${l}`,
      languages: {
        ar: `${baseUrl}/ar`,
        en: `${baseUrl}/en`,
        "x-default": `${baseUrl}/ar`,
      },
      types: {
        "application/rss+xml": `${baseUrl}/${l}/rss.xml`,
      },
    },
    openGraph: {
      type: "website",
      locale: isRTL ? "ar_EG" : "en_US",
      url: `/${l}`,
      siteName,
      title: siteName,
      description,
      images: [
        {
          url: `/og/og-${l}.png`,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [`/og/og-${l}.png`],
      creator: "@ismail_dawah",
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
    verification: {
      // google: "your-google-verification-code",
      // yandex: "your-yandex-verification-code",
    },
    category: "Islamic Education",
    other: {
      "apple-mobile-web-app-title": siteName,
      "application-name": siteName,
      "msapplication-TileColor": "#0e7490",
      "theme-color": "#0e7490",
    },
  };
}

// ============================================================
// Viewport ديناميكي
// ============================================================

export function generateViewport() {
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#0e7490" },
      { media: "(prefers-color-scheme: dark)", color: "#083344" },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  };
}

// ============================================================
// Static Params للغات
// ============================================================

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// Layout الرئيسي
// ============================================================

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // 🛡️ حماية: لو اللغة غير صالحة، ارجع 404
  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const isRTL = l === "ar";

  const settings = await getCachedSettings();
  const siteName = pickSetting(settings, "ownerName", l, DEFAULT_NAMES[l]);
  const otherName = DEFAULT_NAMES[isRTL ? "en" : "ar"];

  // JSON-LD للمنظمة ككل
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: otherName,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://ismailahmednaguib.vercel.app",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ismailahmednaguib.vercel.app"}/icon-512.png`,
    description: isRTL
      ? "منصة دعوية شاملة لنشر العلم الشرعي والمحتوى الإسلامي بلغتين."
      : "A comprehensive dawah platform for spreading Islamic knowledge and content in two languages.",
    founder: {
      "@type": "Person",
      name: isRTL ? SITE_AUTHOR : SITE_AUTHOR_EN,
    },
    knowsLanguage: ["ar", "en"],
    sameAs: [],
  };

  // JSON-LD للموقع ككل (مع SearchAction)
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://ismailahmednaguib.vercel.app",
    inLanguage: l,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ismailahmednaguib.vercel.app"}/${l}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div
      lang={l}
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-cream-dark dark:bg-gray-900"
    >
      {/* ===== JSON-LD Schema ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />

      {/* ===== المحتوى ===== */}
      {/* 
        ملاحظة مهمة:
        - Header و Footer تم إزالتها من هنا لأنها موجودة الآن داخل كل صفحة
        - هذا يمنع التكرار ويسمح لكل صفحة بتخصيص TopBar و Hero الخاص بها
        - لو أردت Header/Footer ثابتين في كل الصفحات، أعد إضافتهما هنا واحذفهما من الصفحات
      */}
      {children}
    </div>
  );
}