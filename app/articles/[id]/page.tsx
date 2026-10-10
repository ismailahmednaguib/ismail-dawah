// app/articles/[id]/page.tsx
// يدعم تلقائيًا:
// 1) app/articles/[id]/page.tsx
// 2) app/[lang]/articles/[id]/page.tsx

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import { getContent } from "@/lib/content";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ============================================================
// Types
// ============================================================

type Lang = "ar" | "en";

type Article = Record<string, any>;

type Content = {
  articles?: Article[];
  settings?: Record<string, any>;
  [key: string]: any;
};

// ============================================================
// Request-level cache
// يمنع استدعاء getContent أكثر من مرة داخل نفس الطلب
// ============================================================

const loadContent = cache(async (): Promise<Content> => {
  const data = await getContent();
  return data as Content;
});

// ============================================================
// Generic helpers
// ============================================================

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeArticleId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const id = value.trim();

  if (!id || id.length > 128) {
    return null;
  }

  // يسمح بالحروف والأرقام والشرطات والنقاط والكولون، ويشمل العربية
  if (!/^[\p{L}\p{N}._:-]+$/u.test(id)) {
    return null;
  }

  return id;
}

function resolveLang(value: unknown): { lang: Lang; hasLangParam: boolean } {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (raw === "ar" || raw === "en") {
    return { lang: raw, hasLangParam: true };
  }

  return { lang: "ar", hasLangParam: false };
}

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!envUrl) {
    return "http://localhost:3000";
  }

  return envUrl.endsWith("/") ? envUrl.slice(0, -1) : envUrl;
}

function toAbsoluteUrl(pathOrUrl?: string | null): string | null {
  if (!pathOrUrl) {
    return null;
  }

  try {
    return new URL(pathOrUrl, getBaseUrl()).toString();
  } catch {
    return null;
  }
}

function pickString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const text = pickString(item, "");
      if (text) {
        return text;
      }
    }

    return fallback;
  }

  const obj = asRecord(value);

  if (obj) {
    const keys = [
      "ar",
      "en",
      "name",
      "title",
      "text",
      "value",
      "label",
      "src",
      "url",
      "path",
      "id",
    ];

    for (const key of keys) {
      const text = pickString(obj[key], "");
      if (text) {
        return text;
      }
    }
  }

  return fallback;
}

function pickLocalized(value: unknown, lang: Lang, fallback = ""): string {
  const obj = asRecord(value);

  if (obj) {
    const preferred = pickString(obj[lang], "");
    if (preferred) {
      return preferred;
    }

    const other: Lang = lang === "ar" ? "en" : "ar";
    const secondary = pickString(obj[other], "");
    if (secondary) {
      return secondary;
    }
  }

  return pickString(value, fallback);
}

function pickTextBlock(value: unknown, lang: Lang, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  if (Array.isArray(value)) {
    return (
      value
        .map((item) => pickTextBlock(item, lang, ""))
        .filter(Boolean)
        .join("\n\n") || fallback
    );
  }

  const obj = asRecord(value);

  if (obj) {
    const preferred = pickTextBlock(obj[lang], lang, "");
    if (preferred) {
      return preferred;
    }

    const other: Lang = lang === "ar" ? "en" : "ar";
    const secondary = pickTextBlock(obj[other], lang, "");
    if (secondary) {
      return secondary;
    }

    const nestedKeys = ["body", "content", "text", "markdown", "html", "value"];

    for (const key of nestedKeys) {
      const nested = pickTextBlock(obj[key], lang, "");
      if (nested) {
        return nested;
      }
    }
  }

  return pickString(value, fallback);
}

function pickStringArray(value: unknown, lang: Lang): string[] {
  const out: string[] = [];

  const pushText = (text: string) => {
    const parts = text
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    out.push(...parts);
  };

  if (Array.isArray(value)) {
    for (const item of value) {
      const text = pickLocalized(item, lang, pickString(item, ""));
      if (text) {
        pushText(text);
      }
    }

    return Array.from(new Set(out));
  }

  const single = pickLocalized(value, lang, pickString(value, ""));

  if (single) {
    pushText(single);
  }

  return Array.from(new Set(out));
}

function getDateValue(article: Article, keys: string[]): unknown {
  for (const key of keys) {
    const value = article?.[key];

    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }

  return null;
}

function parseDateValue(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "object") {
    const text = pickString(value, "");
    if (text) {
      return parseDateValue(text);
    }

    return null;
  }

  const raw = String(value).trim();

  if (!raw) {
    return null;
  }

  // لو الرقم جاء كنص، اعتبره timestamp
  if (/^\d+$/.test(raw)) {
    const date = new Date(Number(raw));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(value: unknown): string | null {
  const date = parseDateValue(value);
  return date ? date.toISOString() : null;
}

function formatDate(value: unknown, lang: Lang): string | null {
  const date = parseDateValue(value);

  if (!date) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return date.toLocaleDateString(lang === "ar" ? "ar" : "en");
  }
}

function findArticle(content: Content | null, id: string): Article | null {
  const articles = (content as any)?.articles;

  if (!Array.isArray(articles)) {
    return null;
  }

  return (
    articles.find((article: Article) => {
      const candidates = [
        article?.id,
        article?._id,
        article?.slug,
        article?.key,
        article?.uid,
      ];

      return candidates.some((candidate) => pickString(candidate) === id);
    }) ?? null
  );
}

function isDraftArticle(article: Article): boolean {
  const status = String(
    article?.status ?? article?.visibility ?? ""
  ).toLowerCase();

  const published = article?.published ?? article?.is_published;

  return (
    article?.draft === true ||
    published === false ||
    String(published).toLowerCase() === "false" ||
    status === "draft" ||
    status === "private" ||
    status === "unpublished"
  );
}

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value ?? {})
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function buildArticleJsonLd(params: {
  title: string;
  description: string;
  canonical: string;
  lang: Lang;
  publishedAt: string | null;
  modifiedAt: string | null;
  authorName: string | null;
  siteName: string;
  imageUrl: string | null;
  keywords: string[];
  section: string | null;
}) {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    inLanguage: params.lang,
    url: params.canonical,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": params.canonical,
    },
    publisher: {
      "@type": "Organization",
      name: params.siteName,
    },
  };

  if (params.publishedAt) {
    ld.datePublished = params.publishedAt;
  }

  if (params.modifiedAt) {
    ld.dateModified = params.modifiedAt;
  } else if (params.publishedAt) {
    ld.dateModified = params.publishedAt;
  }

  if (params.authorName) {
    ld.author = {
      "@type": "Person",
      name: params.authorName,
    };
  }

  if (params.imageUrl) {
    ld.image = [params.imageUrl];
  }

  if (params.keywords.length > 0) {
    ld.keywords = params.keywords.join(", ");
  }

  if (params.section) {
    ld.articleSection = params.section;
  }

  return ld;
}

function extractArticleData(article: Article, lang: Lang) {
  const title = pickLocalized(article?.title, lang, lang === "ar" ? "مقال" : "Article");

  const excerpt = pickLocalized(
    article?.excerpt ?? article?.summary ?? article?.description,
    lang
  );

  const body = pickTextBlock(
    article?.body ?? article?.content ?? article?.text ?? article?.markdown,
    lang
  );

  const publishedAt = toIsoDate(
    getDateValue(article, [
      "date",
      "publishedAt",
      "published_at",
      "createdAt",
      "created_at",
    ])
  );

  const modifiedAt =
    toIsoDate(
      getDateValue(article, [
        "updatedAt",
        "updated_at",
        "modifiedAt",
        "modified_at",
      ])
    ) ?? publishedAt;

  const imageUrl = toAbsoluteUrl(
    pickString(
      article?.image ??
        article?.cover ??
        article?.thumbnail ??
        article?.featuredImage ??
        article?.image_url
    )
  );

  const authorName = pickString(
    article?.author ?? article?.writer ?? article?.byline ?? article?.author_name
  );

  const keywords = Array.from(
    new Set([
      ...pickStringArray(article?.tags ?? article?.keywords, lang),
      ...pickStringArray(article?.category ?? article?.section, lang),
    ])
  ).slice(0, 10);

  const section =
    pickLocalized(article?.category ?? article?.section, lang) || null;

  const description =
    excerpt ||
    body.replace(/\s+/g, " ").trim().slice(0, 300) ||
    title;

  return {
    title,
    excerpt,
    body,
    description,
    publishedAt,
    modifiedAt,
    imageUrl,
    authorName,
    keywords,
    section,
  };
}

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; lang?: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;

  const id = normalizeArticleId(resolvedParams.id);
  const { lang, hasLangParam } = resolveLang((resolvedParams as any).lang);

  if (!id) {
    return {
      title: lang === "ar" ? "المقال غير موجود" : "Article not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  let content: Content | null = null;

  try {
    content = await loadContent();
  } catch {
    return {
      title: lang === "ar" ? "تعذر تحميل المقال" : "Unable to load article",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const article = findArticle(content, id);

  if (!article || isDraftArticle(article)) {
    return {
      title: lang === "ar" ? "المقال غير موجود" : "Article not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalPath = hasLangParam
    ? `/${lang}/articles/${id}`
    : `/articles/${id}`;

  const canonical = toAbsoluteUrl(canonicalPath) ?? canonicalPath;

  const data = extractArticleData(article, lang);

  const siteName =
    pickString(
      (content as any)?.settings?.siteName ??
        (content as any)?.settings?.site_title ??
        (content as any)?.siteName
    ) || (lang === "ar" ? "إسماعيل أحمد نجيب" : "Ismail Ahmed Naguib");

  const alternates: Metadata["alternates"] = {
    canonical,
  };

  if (hasLangParam) {
    alternates.languages = {
      ar: toAbsoluteUrl(`/ar/articles/${id}`) ?? `/ar/articles/${id}`,
      en: toAbsoluteUrl(`/en/articles/${id}`) ?? `/en/articles/${id}`,
      "x-default": canonical,
    };
  }

  return {
    title: data.title,
    description: data.description,
    alternates,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: data.title,
      description: data.description,
      siteName,
      locale: lang === "ar" ? "ar_SA" : "en_US",
      publishedTime: data.publishedAt ?? undefined,
      modifiedTime: data.modifiedAt ?? undefined,
      authors: data.authorName ? [data.authorName] : undefined,
      images: data.imageUrl
        ? [
            {
              url: data.imageUrl,
              alt: data.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: data.imageUrl ? "summary_large_image" : "summary",
      title: data.title,
      description: data.description,
      images: data.imageUrl ? [data.imageUrl] : undefined,
    },
  };
}

// ============================================================
// Page
// ============================================================

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string; lang?: string }>;
}) {
  const resolvedParams = await params;

  const id = normalizeArticleId(resolvedParams.id);
  const { lang, hasLangParam } = resolveLang((resolvedParams as any).lang);

  if (!id) {
    notFound();
  }

  let content: Content | null = null;

  try {
    content = await loadContent();
  } catch {
    return (
      <main
        dir={lang === "ar" ? "rtl" : "ltr"}
        lang={lang}
        className="flex min-h-[60vh] items-center justify-center px-4 py-24 text-center"
      >
        <div>
          <h1 className="mb-4 font-serif text-3xl text-primary">
            {lang === "ar" ? "تعذر تحميل المقال" : "Unable to load article"}
          </h1>
          <p className="text-gray-600">
            {lang === "ar"
              ? "حدث خطأ مؤقت أثناء جلب المحتوى. حاول لاحقًا."
              : "A temporary error occurred while fetching content. Please try again later."}
          </p>
        </div>
      </main>
    );
  }

  const article = findArticle(content, id);

  if (!article || isDraftArticle(article)) {
    notFound();
  }

  const canonicalPath = hasLangParam
    ? `/${lang}/articles/${id}`
    : `/articles/${id}`;

  const canonical = toAbsoluteUrl(canonicalPath) ?? canonicalPath;

  const data = extractArticleData(article, lang);

  const siteName =
    pickString(
      (content as any)?.settings?.siteName ??
        (content as any)?.settings?.site_title ??
        (content as any)?.siteName
    ) || (lang === "ar" ? "إسماعيل أحمد نجيب" : "Ismail Ahmed Naguib");

  const formattedDate = formatDate(
    getDateValue(article, [
      "date",
      "publishedAt",
      "published_at",
      "createdAt",
      "created_at",
    ]),
    lang
  );

  const paragraphs = data.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const jsonLd = buildArticleJsonLd({
    title: data.title,
    description: data.description,
    canonical,
    lang,
    publishedAt: data.publishedAt,
    modifiedAt: data.modifiedAt,
    authorName: data.authorName,
    siteName,
    imageUrl: data.imageUrl,
    keywords: data.keywords,
    section: data.section,
  });

  const contentSettings = (content as any)?.settings;

  return (
    <>
      <Header {...({ lang, settings: contentSettings } as any)} />

      <main
        dir={lang === "ar" ? "rtl" : "ltr"}
        lang={lang}
        className="py-16"
      >
        <article className="mx-auto max-w-3xl px-4">
          {formattedDate ? (
            <div className="mb-3 text-sm text-gray-400">
              📅{" "}
              <time dateTime={data.publishedAt ?? undefined}>
                {formattedDate}
              </time>
            </div>
          ) : null}

          <h1 className="mb-6 font-serif text-4xl leading-snug text-primary">
            {data.title}
          </h1>

          {data.excerpt ? (
            <p className="mb-8 text-lg leading-relaxed text-gray-600">
              {data.excerpt}
            </p>
          ) : null}

          {data.imageUrl ? (
            <div className="mb-8 overflow-hidden rounded-xl bg-gray-100">
              {/*
                ملاحظة:
                إذا كانت الصور من Supabase أو مصدر موثوق، يمكنك استخدام img عادي.
                إذا أردت تحسين الأداء مع Next Image، استورد Image من next/image
                وضبط domains/remotePatterns في next.config.
              */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.imageUrl}
                alt={data.title}
                className="h-auto w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : null}

          <div className="rounded-xl bg-white p-8 text-lg leading-loose text-gray-700 shadow-md">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={index} className="mb-5 whitespace-pre-line last:mb-0">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-500">
                {lang === "ar"
                  ? "لا يوجد محتوى لهذا المقال."
                  : "This article has no content."}
              </p>
            )}
          </div>

          {data.authorName ? (
            <div className="mt-8 text-sm text-gray-500">
              {lang === "ar" ? "بقلم: " : "By: "}
              {data.authorName}
            </div>
          ) : null}

          {data.keywords.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {data.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-10">
            <p className="mb-3 text-center font-bold text-primary">
              {lang === "ar" ? "شارك المقال:" : "Share this article:"}
            </p>

            <ShareButtons
              {...({
                title: data.title,
                url: canonical,
                text: data.description,
              } as any)}
            />
          </div>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
          />
        </article>
      </main>

      <Footer {...({ lang, settings: contentSettings } as any)} />
    </>
  );
}