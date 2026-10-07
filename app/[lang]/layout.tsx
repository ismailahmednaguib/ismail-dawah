import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import JsonLd from "@/components/JsonLd";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { getDir, type Lang } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { generateJsonLd } from "@/lib/seo";
import "@/app/globals.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const L = lang as Lang;
  const c = await getContent();

  const titles: Record<string, string> = {
    ar: `${c.settings.ownerName} — موقع دعوي شامل | دروس وفتاوى ومقالات`,
    en: `${c.settings.ownerName} - Islamic Dawah Website | Lessons & Fatwas`,
    fr: `${c.settings.ownerName} - Site de Da'wa Islamique`,
    ur: `${c.settings.ownerName} — دعوتی ویب سائٹ`,
    tr: `${c.settings.ownerName} - İslami Davet Sitesi`,
    id: `${c.settings.ownerName} - Situs Dakwah Islam`,
    ha: `${c.settings.ownerName} - Shafin Daw'a`,
    bn: `${c.settings.ownerName} — ইসলামী দাওয়াত ওয়েবসাইট`,
    so: `${c.settings.ownerName} - Bogga Dacwada Islaamka`,
    fa: `${c.settings.ownerName} — سایت دعوت اسلامی`,
    es: `${c.settings.ownerName} - Sitio Islámico de Da'wah`,
    ru: `${c.settings.ownerName} — исламский сайт даавата`,
    sw: `${c.settings.ownerName} - Tovuti ya Da'awa ya Kiislamu`,
  };

  const descriptions: Record<string, string> = {
    ar: `موقع فضيلة ${c.settings.ownerName} — منصة دعوية شاملة تحتوي على دروس وفتاوى ومقالات في ${c.fields.length} علماً شرعياً، المصحف الكريم، مواقيت الصلاة، حاسبة الزكاة والمواريث، وقصص الأنبياء. متوفر بـ 13 لغة.`,
    en: `Official website of Sheikh ${c.settings.ownerName} — comprehensive Islamic platform with lessons, fatwas, and articles in ${c.fields.length} Islamic sciences, Holy Quran, prayer times, Zakat calculator, and prophets' stories. Available in 13 languages.`,
    fr: `Site officiel du Cheikh ${c.settings.ownerName} — plateforme islamique complète`,
    ur: `فضیلۃ الشیخ ${c.settings.ownerName} کی آفیشل ویب سائٹ`,
    tr: `Şeyh ${c.settings.ownerName} resmi İslami platformu`,
    id: `Situs resmi Syekh ${c.settings.ownerName} - platform dakwah Islam`,
    ha: `Shafin hukuma na Sheikh ${c.settings.ownerName}`,
    bn: `শেখ ${c.settings.ownerName}-এর অফিসিয়াল ওয়েবসাইট`,
    so: `Bogga rasmiga ah ee Sheikh ${c.settings.ownerName}`,
    fa: `سایت رسمی شیخ ${c.settings.ownerName}`,
    es: `Sitio oficial del Sheij ${c.settings.ownerName}`,
    ru: `Официальный сайт шейха ${c.settings.ownerName}`,
    sw: `Tovuti rasmi ya Sheikh ${c.settings.ownerName}`,
  };

  const keywords = [
    "الشيخ إسماعيل", "دروس إسلامية", "فتاوى", "المصحف الكريم",
    "مواقيت الصلاة", "حاسبة الزكاة", "قصص الأنبياء", "الرقية الشرعية",
    "Islamic scholar", "Quran", "prayer times", "fatwa", "Islamic lessons",
    "Sheikh Ismail", "da'wah", "Islamic website"
  ];

  return {
    title: {
      default: titles[L] || titles.ar,
      template: `%s | ${c.settings.shortName}`,
    },
    description: descriptions[L] || descriptions.ar,
    keywords,
    authors: [{ name: c.settings.ownerName, url: "https://ismailahmednaguib.vercel.app" }],
    creator: c.settings.ownerName,
    publisher: c.settings.shortName,
    metadataBase: new URL("https://ismailahmednaguib.vercel.app"),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ar: "/ar", en: "/en", fr: "/fr", ur: "/ur", tr: "/tr",
        id: "/id", ha: "/ha", bn: "/bn", so: "/so", fa: "/fa",
        es: "/es", ru: "/ru", sw: "/sw",
      },
    },
    openGraph: {
      type: "website",
      locale: L === "ar" ? "ar_EG" : L === "en" ? "en_US" : L,
      url: `https://ismailahmednaguib.vercel.app/${lang}`,
      siteName: c.settings.shortName,
      title: titles[L] || titles.ar,
      description: descriptions[L] || descriptions.ar,
      images: [
        {
          url: c.settings.ogImage || "/og-default.jpg",
          width: 1200,
          height: 630,
          alt: c.settings.ownerName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[L] || titles.ar,
      description: descriptions[L] || descriptions.ar,
      images: [c.settings.ogImage || "/og-default.jpg"],
      creator: "@sheikh_ismail",
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
      google: "4W49aXhP1rd36urlMh93CbGtqdZwHw39_mBvIDb1ENE",
    },
    category: "religion",
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const L = lang as Lang;
  const dir = getDir(L);
  const c = await getContent();

  // JSON-LD للموقع
  const websiteJsonLd = generateJsonLd("website", {
    name: c.settings.ownerName,
    description: c.settings.bio[0],
    url: `https://ismailahmednaguib.vercel.app/${lang}`,
    lang,
  });

  // JSON-LD للشخص (الشيخ)
  const personJsonLd = generateJsonLd("person", {
    name: c.settings.ownerName,
    jobTitle: c.settings.jobTitle,
    description: c.settings.bio.join(" "),
    image: c.settings.portraitSrc,
    url: `https://ismailahmednaguib.vercel.app/${lang}/about`,
    interests: c.settings.interests,
    socialLinks: [
      c.settings.facebookUrl,
      c.settings.youtubeUrl,
      c.settings.twitterUrl,
    ].filter(Boolean),
  });

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0b2e22" />
        
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.aladhan.com" />
        <link rel="preconnect" href="https://api.alquran.cloud" />
        
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;600;700;900&family=Noto+Naskh+Arabic:wght@400;700&display=swap"
          rel="stylesheet"
        />
        
        {/* PWA */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Plausible Analytics */}
        <script defer data-domain="ismailahmednaguib.vercel.app" src="https://plausible.io/js/script.js"></script>
      </head>
      <body className="bg-cream-dark dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans antialiased">
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={personJsonLd} />
        <AnalyticsTracker />
        <TopBar />
        {children}
      </body>
    </html>
  );
}