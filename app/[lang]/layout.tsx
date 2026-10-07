import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import { getDir, type Lang } from "@/lib/i18n";
import "@/app/globals.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const L = lang as Lang;

  const titles: Record<string, string> = {
    ar: "الشيخ إسماعيل أحمد نجيب — موقع دعوي",
    en: "Sheikh Ismail Ahmed Naguib - Dawah Website",
    fr: "Cheikh Ismail Ahmed Naguib - Site de Da'wa",
    ur: "شیخ اسماعیل احمد نجیب — دعوتی ویب سائٹ",
    tr: "Şeyh İsmail Ahmed Necaib - Davet Sitesi",
    id: "Syekh Ismail Ahmed Naguib - Situs Dakwah",
    ha: "Sheikh Ismail Ahmed Naguib - Shafin Daw'a",
    bn: "শেখ ইসমাইল আহমেদ নাগুইব — দাওয়াত ওয়েবসাইট",
    so: "Sheikh Ismail Ahmed Naguib - Bogga Dacwada",
    fa: "شیخ اسماعیل احمد نجیب — سایت دعوت",
    es: "Sheij Ismail Ahmed Naguib - Sitio de Da'wah",
    ru: "Шейх Исмаил Ахмед Нагиб — сайт даавата",
    sw: "Sheikh Ismail Ahmed Naguib - Tovuti ya Da'awa",
  };

  const descriptions: Record<string, string> = {
    ar: "موقع فضيلة الشيخ إسماعيل أحمد نجيب — دروس وفتاوى ومقالات في العلوم الشرعية",
    en: "Official website of Sheikh Ismail Ahmed Naguib — lessons, fatwas and articles in Islamic sciences",
    fr: "Site officiel du Cheikh Ismail Ahmed Naguib — cours, fatwas et articles en sciences islamiques",
    ur: "فضیلۃ الشیخ اسماعیل احمد نجیب کی آفیشل ویب سائٹ — اسلامی علوم میں اسباق، فتاویٰ اور مضامین",
    tr: "Şeyh İsmail Ahmed Necaib'in resmi web sitesi — İslami ilimlerde dersler, fetvalar ve makaleler",
    id: "Situs resmi Syekh Ismail Ahmed Naguib — pelajaran, fatwa, dan artikel dalam ilmu-ilmu Islam",
    ha: "Shafin hukuma na Sheikh Ismail Ahmed Naguib — darussa, fatwa da labarai a kimiyyar Musulunci",
    bn: "শেখ ইসমাইল আহমেদ নাগুইব-এর অফিসিয়াল ওয়েবসাইট — ইসলামী বিজ্ঞানে পাঠ, ফতোয়া ও প্রবন্ধ",
    so: "Bogga rasmiga ah ee Sheikh Ismail Ahmed Naguib — duruus, fatwooyin iyo maqaallo culuumta islaamka",
    fa: "سایت رسمی شیخ اسماعیل احمد نجیب — درس‌ها، فتواها و مقالات در علوم اسلامی",
    es: "Sitio oficial del Sheij Ismail Ahmed Naguib — lecciones, fatwas y artículos en ciencias islámicas",
    ru: "Официальный сайт шейха Исмаила Ахмеда Нагиба — уроки, фетвы и статьи по исламским наукам",
    sw: "Tovuti rasmi ya Sheikh Ismail Ahmed Naguib — masomo, fatwa na makala katika sayansi za Kiislamu",
  };

  return {
    title: titles[L] || titles.ar,
    description: descriptions[L] || descriptions.ar,
    metadataBase: new URL("https://ismailahmednaguib.vercel.app"),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ar: "/ar", en: "/en", fr: "/fr", ur: "/ur", tr: "/tr",
        id: "/id", ha: "/ha", bn: "/bn", so: "/so", fa: "/fa",
        es: "/es", ru: "/ru", sw: "/sw",
      },
    },
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
  const dir = getDir(lang as Lang);

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;600;700;900&family=Noto+Naskh+Arabic:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script defer data-domain="ismailahmednaguib.vercel.app" src="https://plausible.io/js/script.js"></script>
      </head>
      <body className="bg-cream-dark dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans antialiased">
        <TopBar />
        {children}
      </body>
    </html>
  );
}