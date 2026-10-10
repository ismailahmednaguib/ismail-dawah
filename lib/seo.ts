// lib/seo.ts
// دوال SEO المتقدمة والبيانات المنظمة (JSON-LD)
// محسّنة لموقع ثنائي اللغة: عربي / إنجليزي

import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, SITE_NAME_EN, DEFAULT_LOCALE } from "./site";
import type { Lang } from "./i18n";

// ============================================================
// Types
// ============================================================

type SupportedLang = Lang;

export interface SEOOptions {
  title: string;
  description?: string;
  path?: string;
  lang?: Lang | string;
  image?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  noIndex?: boolean;
}

export interface ArticleJsonLdOptions {
  title: string;
  description?: string;
  path: string;
  lang?: Lang | string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  image?: string;
  keywords?: string[];
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  url?: string;
}

export interface VideoJsonLdOptions {
  name: string;
  description: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
  lang?: Lang | string;
  isLiveBroadcast?: boolean;
}

export interface CourseJsonLdOptions {
  name: string;
  description: string;
  provider?: string;
  url?: string;
  lang?: Lang | string;
}

export interface SurahJsonLdOptions {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  ayahs: number;
  type: "makki" | "madani";
  lang?: Lang | string;
  description?: string;
}

export interface FatwaJsonLdOptions {
  question: string;
  answer: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  path?: string;
  lang?: Lang | string;
}

export interface EventJsonLdOptions {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  locationUrl?: string;
  url?: string;
  lang?: Lang | string;
  organizerName?: string;
}

export interface WebsiteJsonLdOptions {
  description?: string;
  sameAs?: string[];
}

export interface OrganizationJsonLdOptions {
  description?: string;
  sameAs?: string[];
  founder?: string;
}

// ============================================================
// Constants
// ============================================================

const SUPPORTED_LANGS: SupportedLang[] = ["ar", "en"];
const FALLBACK_LANG: SupportedLang = "ar";
const DEFAULT_IMAGE_PATH = "/icon-512.png";

function isSupportedLangStatic(value: unknown): value is SupportedLang {
  return (
    typeof value === "string" &&
    (SUPPORTED_LANGS as readonly string[]).includes(value)
  );
}

const DEFAULT_LANG: SupportedLang = isSupportedLangStatic(DEFAULT_LOCALE)
  ? (DEFAULT_LOCALE as SupportedLang)
  : FALLBACK_LANG;

function normalizeSiteUrl(input: string): string {
  const raw = String(input || "").trim();

  if (!raw) {
    return "";
  }

  try {
    const url = new URL(raw);
    const pathname =
      url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");

    return `${url.origin}${pathname}`;
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

const RAW_BASE_URL = normalizeSiteUrl(String(SITE_URL || ""));

const BASE_URL =
  RAW_BASE_URL || "https://ismailahmednaguib.vercel.app";

// ============================================================
// Helpers
// ============================================================

function resolveLang(lang?: Lang | string | null): SupportedLang {
  return isSupportedLangStatic(lang) ? lang : DEFAULT_LANG;
}

function getSiteName(lang: SupportedLang): string {
  return lang === "ar" ? SITE_NAME : SITE_NAME_EN || SITE_NAME;
}

function getOpenGraphLocale(lang: SupportedLang): string {
  return lang === "ar" ? "ar_EG" : "en_US";
}

function normalizePath(path?: string | null): string {
  if (!path) {
    return "/";
  }

  let p = String(path).trim();

  // إذا كان رابطًا مطلقًا، استخرج المسار فقط
  if (/^https?:\/\//i.test(p)) {
    try {
      p = new URL(p).pathname;
    } catch {
      p = "/";
    }
  }

  // إزالة الاستعلام والـ hash
  p = p.split(/[?#]/)[0] || "/";

  if (!p.startsWith("/")) {
    p = `/${p}`;
  }

  // منع الـ double slash
  p = p.replace(/\/{2,}/g, "/");

  // إزالة الشرطة الأخيرة إلا للجذر
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }

  // إزالة بادئة اللغة إن وُجدت حتى لا تتكرر في buildUrl
  const langMatch = p.match(/^\/(ar|en)(?=\/|$)/);

  if (langMatch) {
    p = p.slice(langMatch[0].length) || "/";
  }

  return p || "/";
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function toAbsoluteUrl(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const raw = String(value).trim();

  if (!raw) {
    return undefined;
  }

  if (isAbsoluteUrl(raw)) {
    return raw;
  }

  if (raw.startsWith("/")) {
    return `${BASE_URL}${raw}`;
  }

  return `${BASE_URL}/${raw}`;
}

function resolveImageUrl(image?: string | null): string {
  return toAbsoluteUrl(image || DEFAULT_IMAGE_PATH) || `${BASE_URL}${DEFAULT_IMAGE_PATH}`;
}

export function buildImageUrl(path: string): string {
  return resolveImageUrl(path);
}

export function buildUrl(path: string, lang?: Lang | string): string {
  const resolvedLang = resolveLang(lang);
  const normalizedPath = normalizePath(path);

  if (normalizedPath === "/") {
    return `${BASE_URL}/${resolvedLang}`;
  }

  return `${BASE_URL}/${resolvedLang}${normalizedPath}`;
}

function stripHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value: unknown, maxLength: number): string {
  if (maxLength <= 0) {
    return "";
  }

  const chars = Array.from(String(value ?? ""));

  if (chars.length <= maxLength) {
    return chars.join("");
  }

  return `${chars.slice(0, Math.max(0, maxLength - 1)).join("").trimEnd()}…`;
}

function toIsoDate(value?: string | number | Date | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function nowIso(): string {
  return new Date().toISOString();
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => String(value ?? "").trim())
        .filter(Boolean)
    )
  );
}

/**
 * تحويل JSON-LD إلى نص آمن للوضع داخل <script type="application/ld+json">
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value ?? {})
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * مساعد للاستخدام داخل Next.js:
 *
 * <script {...jsonLdProps(websiteJsonLd(lang))} />
 */
export function jsonLdProps(data: unknown) {
  return {
    type: "application/ld+json" as const,
    dangerouslySetInnerHTML: {
      __html: safeJsonLd(data),
    },
  };
}

function organizationNode(lang: SupportedLang) {
  const name = getSiteName(lang);

  return {
    "@type": "Organization",
    name,
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: resolveImageUrl(DEFAULT_IMAGE_PATH),
    },
  };
}

// ============================================================
// Generate Metadata
// ============================================================

export function generateSEO(options: SEOOptions): Metadata {
  const lang = resolveLang(options.lang);
  const path = normalizePath(options.path);
  const canonical = buildUrl(path, lang);
  const siteName = getSiteName(lang);

  const rawTitle = String(options.title || "").trim();
  const pageTitle = rawTitle && rawTitle !== siteName ? rawTitle : siteName;

  const ogTitle = rawTitle
    ? rawTitle.includes(siteName)
      ? rawTitle
      : `${rawTitle} | ${siteName}`
    : siteName;

  const description = options.description
    ? truncateText(stripHtml(options.description), 300)
    : undefined;

  const imageUrl = resolveImageUrl(options.image);
  const publishedTime = toIsoDate(options.publishedTime);
  const modifiedTime = toIsoDate(options.modifiedTime);
  const author = stripHtml(options.author);
  const tags = uniqueStrings(options.tags || []).slice(0, 20);
  const isArticle = options.type === "article";
  const noIndex = Boolean(options.noIndex);

  const languages: Record<string, string> = {
    ar: buildUrl(path, "ar"),
    en: buildUrl(path, "en"),
    "x-default": buildUrl(path, DEFAULT_LANG),
  };

  const imageDimensions =
    !options.image || options.image === DEFAULT_IMAGE_PATH
      ? { width: 512, height: 512 }
      : {};

  return {
    title: pageTitle,
    description,
    keywords: tags.length ? tags : undefined,

    alternates: {
      canonical,
      languages,
    },

    openGraph: {
      type: options.type || "website",
      url: canonical,
      siteName,
      title: ogTitle,
      description,
      locale: getOpenGraphLocale(lang),
      images: [
        {
          url: imageUrl,
          alt: rawTitle || siteName,
          ...imageDimensions,
        },
      ],

      ...(isArticle && publishedTime
        ? { publishedTime }
        : {}),

      ...(isArticle && modifiedTime
        ? { modifiedTime }
        : {}),

      ...(isArticle && author
        ? { authors: [author] }
        : {}),

      ...(isArticle && tags.length
        ? { tags }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [imageUrl],
    },

    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
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

// ============================================================
// JSON-LD: WebSite
// ============================================================

export function websiteJsonLd(
  lang?: Lang | string,
  options: WebsiteJsonLdOptions = {}
) {
  const resolvedLang = resolveLang(lang);
  const name = getSiteName(resolvedLang);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name,
    alternateName: uniqueStrings([SITE_NAME, SITE_NAME_EN]),
    url: BASE_URL,
    inLanguage: resolvedLang,

    ...(options.description
      ? { description: stripHtml(options.description) }
      : {}),

    publisher: organizationNode(resolvedLang),

    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/${resolvedLang}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },

    ...(options.sameAs?.length
      ? { sameAs: uniqueStrings(options.sameAs) }
      : {}),
  };
}

// ============================================================
// JSON-LD: Organization
// ============================================================

export function organizationJsonLd(
  lang?: Lang | string,
  options: OrganizationJsonLdOptions = {}
) {
  const resolvedLang = resolveLang(lang);
  const name = getSiteName(resolvedLang);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name,
    alternateName: uniqueStrings([SITE_NAME, SITE_NAME_EN]),
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: resolveImageUrl(DEFAULT_IMAGE_PATH),
    },

    ...(options.description
      ? { description: stripHtml(options.description) }
      : {}),

    ...(options.founder
      ? {
          founder: {
            "@type": "Person",
            name: stripHtml(options.founder),
          },
        }
      : {}),

    ...(options.sameAs?.length
      ? { sameAs: uniqueStrings(options.sameAs) }
      : {}),
  };
}

// ============================================================
// JSON-LD: Article
// ============================================================

export function articleJsonLd(options: ArticleJsonLdOptions) {
  const lang = resolveLang(options.lang);
  const path = normalizePath(options.path);
  const url = buildUrl(path, lang);
  const siteName = getSiteName(lang);
  const image = resolveImageUrl(options.image);
  const author = stripHtml(options.author);
  const keywords = uniqueStrings(options.keywords || []);

  const publishedTime = toIsoDate(options.publishedTime);
  const modifiedTime = toIsoDate(options.modifiedTime) || publishedTime;

  const description = options.description
    ? truncateText(stripHtml(options.description), 300)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    headline: truncateText(stripHtml(options.title), 110),

    ...(description ? { description } : {}),

    inLanguage: lang,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: [image],

    author: author
      ? {
          "@type": "Person",
          name: author,
        }
      : {
          "@type": "Organization",
          name: siteName,
        },

    publisher: organizationNode(lang),

    datePublished: publishedTime || nowIso(),
    dateModified: modifiedTime || nowIso(),

    ...(keywords.length ? { keywords: keywords.join(", ") } : {}),
  };
}

// ============================================================
// JSON-LD: Breadcrumb
// ============================================================

export function breadcrumbJsonLd(
  items: BreadcrumbItem[],
  lang?: Lang | string
) {
  const resolvedLang = resolveLang(lang);

  const itemListElement = items
    .filter((item) => item && stripHtml(item.name))
    .map((item, index) => {
      const absoluteItem =
        toAbsoluteUrl(item.path) ||
        buildUrl(normalizePath(item.path), resolvedLang);

      return {
        "@type": "ListItem",
        position: index + 1,
        name: stripHtml(item.name),
        item: absoluteItem,
      };
    });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

// ============================================================
// JSON-LD: FAQ
// ============================================================

export function faqJsonLd(
  items: FAQItem[],
  options?: {
    lang?: Lang | string;
    url?: string;
  }
) {
  const lang = resolveLang(options?.lang);
  const url = toAbsoluteUrl(options?.url);

  const mainEntity = items
    .filter((item) => item && stripHtml(item.question) && stripHtml(item.answer))
    .map((item) => {
      const answerUrl = toAbsoluteUrl(item.url);

      return {
        "@type": "Question",
        name: stripHtml(item.question),
        acceptedAnswer: {
          "@type": "Answer",
          text: stripHtml(item.answer),
          ...(answerUrl ? { url: answerUrl } : {}),
        },
      };
    });

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { url } : {}),
    mainEntity,
    inLanguage: lang,
  };
}

// ============================================================
// JSON-LD: Video
// ============================================================

export function videoJsonLd(options: VideoJsonLdOptions) {
  const lang = resolveLang(options.lang);
  const thumbnailUrl = [resolveImageUrl(options.thumbnailUrl)];
  const contentUrl = toAbsoluteUrl(options.contentUrl);
  const embedUrl = toAbsoluteUrl(options.embedUrl);
  const uploadDate = toIsoDate(options.uploadDate) || nowIso();

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: stripHtml(options.name),
    description: stripHtml(options.description),
    thumbnailUrl,
    uploadDate,
    inLanguage: lang,

    ...(options.duration ? { duration: options.duration } : {}),
    ...(contentUrl ? { contentUrl } : {}),
    ...(embedUrl ? { embedUrl } : {}),

    publisher: organizationNode(lang),
  };
}

// ============================================================
// JSON-LD: Course
// ============================================================

export function courseJsonLd(options: CourseJsonLdOptions) {
  const lang = resolveLang(options.lang);
  const url = toAbsoluteUrl(options.url);
  const providerName = stripHtml(options.provider) || getSiteName(lang);

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: stripHtml(options.name),
    description: stripHtml(options.description),
    inLanguage: lang,

    ...(url ? { url } : {}),

    provider: {
      "@type": "Organization",
      name: providerName,
      url: BASE_URL,
    },

    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      ...(url ? { url } : {}),
    },
  };
}

// ============================================================
// JSON-LD: WebApplication
// ============================================================

export function webAppJsonLd(lang?: Lang | string) {
  const resolvedLang = resolveLang(lang);
  const name = getSiteName(resolvedLang);

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url: BASE_URL,
    description:
      resolvedLang === "ar"
        ? "منصة إسلامية دعوية شاملة تجمع القرآن والأذكار والفتاوى وأدوات الدعوة."
        : "A comprehensive Islamic dawah platform gathering Quran, adhkar, fatwas, and dawah tools.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires a modern web browser",
    inLanguage: resolvedLang,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

// ============================================================
// JSON-LD: Surah
// ============================================================

export function surahJsonLd(options: SurahJsonLdOptions) {
  const lang = resolveLang(options.lang);
  const url = buildUrl(`/quran/${options.number}`, lang);

  const name =
    lang === "ar"
      ? `سورة ${options.nameArabic}`
      : `Surah ${options.nameEnglish}`;

  const description =
    options.description?.trim() ||
    (lang === "ar"
      ? `سورة ${options.nameArabic} عدد آياتها ${options.ayahs}، وهي سورة ${
          options.type === "makki" ? "مكية" : "مدنية"
        }.`
      : `Surah ${options.nameEnglish} contains ${options.ayahs} verses and is ${
          options.type === "makki" ? "Makki" : "Madani"
        }.`);

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": url,
    name,
    alternateName: uniqueStrings([options.nameArabic, options.nameEnglish]),
    inLanguage: "ar",
    genre: "Religious Text",
    abstract: stripHtml(description),
    position: options.number,
    numberOfPages: 1,
    url,

    isPartOf: {
      "@type": "CreativeWork",
      name: lang === "ar" ? "القرآن الكريم" : "The Holy Quran",
      url: buildUrl("/quran", lang),
    },
  };
}

// ============================================================
// JSON-LD: Fatwa / QAPage
// ============================================================

export function fatwaJsonLd(options: FatwaJsonLdOptions) {
  const lang = resolveLang(options.lang);
  const url = options.path ? buildUrl(normalizePath(options.path), lang) : undefined;
  const author = stripHtml(options.author) || getSiteName(lang);

  const dateCreated = toIsoDate(options.datePublished) || nowIso();
  const dateModified = toIsoDate(options.dateModified) || dateCreated;

  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    ...(url ? { url } : {}),
    inLanguage: lang,

    mainEntity: {
      "@type": "Question",
      name: stripHtml(options.question),
      dateCreated,
      dateModified,

      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtml(options.answer),
        dateCreated,
        dateModified,
        author: {
          "@type": "Person",
          name: author,
        },
      },
    },
  };
}

// ============================================================
// JSON-LD: Event
// ============================================================

export function eventJsonLd(options: EventJsonLdOptions) {
  const lang = resolveLang(options.lang);
  const url = toAbsoluteUrl(options.url);
  const locationUrl = toAbsoluteUrl(options.locationUrl) || url;

  const startDate = toIsoDate(options.startDate) || options.startDate;
  const endDate = toIsoDate(options.endDate);

  const locationName = stripHtml(options.location) || "Online";
  const normalizedLocation = locationName.toLowerCase();

  const isOnline =
    !options.location ||
    normalizedLocation === "online" ||
    normalizedLocation === "أونلاين" ||
    normalizedLocation === "عن بعد";

  const locationNode = isOnline
    ? {
        "@type": "VirtualLocation",
        name: locationName,
        ...(locationUrl ? { url: locationUrl } : {}),
      }
    : {
        "@type": "Place",
        name: locationName,
        ...(locationUrl ? { url: locationUrl } : {}),
      };

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: stripHtml(options.name),
    description: stripHtml(options.description),
    startDate,

    ...(endDate ? { endDate } : {}),
    ...(url ? { url } : {}),

    inLanguage: lang,

    eventAttendanceMode: isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/PhysicalEventAttendanceMode",

    eventStatus: "https://schema.org/EventScheduled",

    location: locationNode,

    organizer: {
      "@type": "Organization",
      name: stripHtml(options.organizerName) || getSiteName(lang),
      url: BASE_URL,
    },
  };
}

// ============================================================
// Default export for convenience
// ============================================================

const seo = {
  BASE_URL,
  DEFAULT_LANG,
  DEFAULT_IMAGE_PATH,

  buildUrl,
  buildImageUrl,
  generateSEO,

  safeJsonLd,
  jsonLdProps,

  websiteJsonLd,
  organizationJsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  videoJsonLd,
  courseJsonLd,
  webAppJsonLd,
  surahJsonLd,
  fatwaJsonLd,
  eventJsonLd,
};

export default seo;