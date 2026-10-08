// lib/seo.ts
// دوال SEO المتقدمة والبيانات المنظمة (JSON-LD)

import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, SITE_NAME_EN, DEFAULT_LOCALE } from "./site";
import type { Lang } from "./i18n";

// ===== الأنواع =====
interface SEOOptions {
  title: string;
  description?: string;
  path?: string;
  lang?: Lang;
  image?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  noIndex?: boolean;
}

// ===== توليد Metadata كامل =====
export function generateSEO({
  title,
  description,
  path = "/",
  lang = DEFAULT_LOCALE,
  image = "/icon-512.png",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  tags,
  noIndex = false,
}: SEOOptions): Metadata {
  const url = `${SITE_URL}/${lang}${path === "/" ? "" : path}`;
  const siteName = lang === "ar" ? SITE_NAME : SITE_NAME_EN;
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${SITE_URL}/ar${path === "/" ? "" : path}`,
        en: `${SITE_URL}/en${path === "/" ? "" : path}`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      type,
      locale: lang === "ar" ? "ar_EG" : "en_US",
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: title,
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
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
  };
}

// ===== JSON-LD: موقع =====
export function websiteJsonLd(lang: Lang = DEFAULT_LOCALE) {
  const siteName = lang === "ar" ? SITE_NAME : SITE_NAME_EN;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: SITE_URL,
    inLanguage: lang,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/${lang}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

// ===== JSON-LD: منظمة =====
export function organizationJsonLd(lang: Lang = DEFAULT_LOCALE) {
  const siteName = lang === "ar" ? SITE_NAME : SITE_NAME_EN;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    sameAs: [],
  };
}

// ===== JSON-LD: مقال =====
interface ArticleJsonLdOptions {
  title: string;
  description: string;
  path: string;
  lang?: Lang;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  image?: string;
}

export function articleJsonLd({
  title,
  description,
  path,
  lang = DEFAULT_LOCALE,
  publishedTime,
  modifiedTime,
  author,
  image = "/icon-512.png",
}: ArticleJsonLdOptions) {
  const siteName = lang === "ar" ? SITE_NAME : SITE_NAME_EN;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${SITE_URL}/${lang}${path}`,
    inLanguage: lang,
    author: {
      "@type": "Person",
      name: author || siteName,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
      },
    },
    datePublished: publishedTime || new Date().toISOString(),
    dateModified: modifiedTime || new Date().toISOString(),
    image: image.startsWith("http") ? image : `${SITE_URL}${image}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${lang}${path}`,
    },
  };
}

// ===== JSON-LD: مسار التنقل (Breadcrumb) =====
interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(
  items: BreadcrumbItem[],
  lang: Lang = DEFAULT_LOCALE
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}/${lang}${item.path}`,
    })),
  };
}

// ===== JSON-LD: أسئلة شائعة (FAQ) =====
interface FAQItem {
  question: string;
  answer: string;
}

export function faqJsonLd(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// ===== JSON-LD: فيديو / بث مباشر =====
interface VideoJsonLdOptions {
  name: string;
  description: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: string;
  contentUrl?: string;
  isLiveBroadcast?: boolean;
}

export function videoJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  isLiveBroadcast = false,
}: VideoJsonLdOptions) {
  const siteName = SITE_NAME;
  return {
    "@context": "https://schema.org",
    "@type": isLiveBroadcast ? "LiveBroadcast" : "VideoObject",
    name,
    description,
    thumbnailUrl,
    uploadDate: uploadDate || new Date().toISOString(),
    duration,
    contentUrl,
    isLiveBroadcast,
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
      },
    },
  };
}

// ===== JSON-LD: دورة تعليمية =====
interface CourseJsonLdOptions {
  name: string;
  description: string;
  provider?: string;
}

export function courseJsonLd({
  name,
  description,
  provider,
}: CourseJsonLdOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: provider || SITE_NAME,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
    },
  };
}

// ===== JSON-LD: تطبيق ويب =====
export function webAppJsonLd(lang: Lang = DEFAULT_LOCALE) {
  const siteName = lang === "ar" ? SITE_NAME : SITE_NAME_EN;
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteName,
    url: SITE_URL,
    description:
      lang === "ar"
        ? "منصة دعوية إسلامية شاملة"
        : "A comprehensive Islamic Dawah platform",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: lang,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

// ===== JSON-LD: سورة قرآنية =====
interface SurahJsonLdOptions {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  ayahs: number;
  type: "makki" | "madani";
  lang?: Lang;
}

export function surahJsonLd({
  number,
  nameArabic,
  nameEnglish,
  ayahs,
  type,
  lang = DEFAULT_LOCALE,
}: SurahJsonLdOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: lang === "ar" ? `سورة ${nameArabic}` : `Surah ${nameEnglish}`,
    inLanguage: "ar",
    genre: "Religious Text",
    about: {
      "@type": "Thing",
      name: "القرآن الكريم",
    },
    position: number,
    numberOfPages: 1,
    description: `سورة ${nameArabic} - ${ayahs} آية - ${
      type === "makki" ? "مكية" : "مدنية"
    }`,
    url: `${SITE_URL}/${lang}/quran/${number}`,
  };
}

// ===== JSON-LD: فتوى =====
interface FatwaJsonLdOptions {
  question: string;
  answer: string;
  datePublished?: string;
  author?: string;
}

export function fatwaJsonLd({
  question,
  answer,
  datePublished,
  author,
}: FatwaJsonLdOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
        author: {
          "@type": "Person",
          name: author || SITE_NAME,
        },
      },
      dateCreated: datePublished || new Date().toISOString(),
    },
  };
}

// ===== JSON-LD: حدث =====
interface EventJsonLdOptions {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  url?: string;
}

export function eventJsonLd({
  name,
  description,
  startDate,
  endDate,
  location = "Online",
  url,
}: EventJsonLdOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description,
    startDate,
    endDate,
    location: {
      "@type": "VirtualLocation",
      name: location,
      url,
    },
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}

// ===== مساعد: بناء مسار كامل =====
export function buildUrl(path: string, lang: Lang = DEFAULT_LOCALE): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}/${lang}${cleanPath === "/" ? "" : cleanPath}`;
}

// ===== مساعد: بناء مسار صورة كامل =====
export function buildImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}