// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";

// ============================================================
// الأنواع
// ============================================================

type Lang = "ar" | "en";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

interface SitemapRoute {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
  lastModified?: Date;
  langs?: Lang[];
}

// ============================================================
// الإعدادات
// ============================================================

const ALL_LANGS: Lang[] = ["ar", "en"];

/**
 * رابط الموقع الأساسي.
 *
 * على Vercel يُفضَّل ضبط:
 * NEXT_PUBLIC_SITE_URL=https://ismailahmednaguib.vercel.app
 *
 * وإذا لم يكن موجودًا، سيستخدم VERCEL_URL أو الرابط الاحتياطي.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://ismailahmednaguib.vercel.app")
).replace(/\/+$/, "");

/**
 * إذا كان النشر على Vercel:
 * - production: نولّد sitemap طبيعي
 * - preview / development: نرجع sitemap فارغ حتى لا تُفهرس روابط التجربة
 *
 * محليًا بدون VERCEL_ENV نسمح بالتوليد لسهولة الاختبار.
 */
const VERCEL_ENV = process.env.VERCEL_ENV;
const isProduction = VERCEL_ENV === "production" || VERCEL_ENV === undefined;

/**
 * هل نضيف صفحات المقالات الديناميكية؟
 *
 * متغير اختياري:
 * SITEMAP_INCLUDE_ARTICLE_PAGES=false
 */
const INCLUDE_ARTICLE_PAGES =
  process.env.SITEMAP_INCLUDE_ARTICLE_PAGES !== "false";

/**
 * اللغات التي تحتوي فعلًا على صفحات مقالات.
 *
 * افتراضيًا العربية فقط لأن صفحة المقال الرئيسية عندك بالعربي غالبًا.
 *
 * إذا كانت صفحات المقالات الإنجليزية موجودة فعلًا مثل:
 * /en/articles/123
 *
 * فاضبط في البيئة:
 * SITEMAP_ARTICLE_LANGS=ar,en
 */
const ARTICLE_LANGS: Lang[] = (
  process.env.SITEMAP_ARTICLE_LANGS || "ar"
)
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter((value): value is Lang => value === "ar" || value === "en");

if (ARTICLE_LANGS.length === 0) {
  ARTICLE_LANGS.push("ar");
}

/**
 * أقصى عدد مقالات نضيفها في sitemap.
 * هذا مهم إذا كان عندك عدد كبير جدًا من المقالات.
 */
const MAX_ARTICLE_ROUTES = 5000;

/**
 * تاريخ افتراضي لآخر تحديث.
 * يمكن تحديثه يدويًا عند تغيير كبير في الموقع.
 */
const FALLBACK_LAST_MODIFIED = new Date("2026-10-09T00:00:00.000Z");

// ============================================================
// الصفحات الثابتة
// ============================================================

const STATIC_ROUTES: SitemapRoute[] = [
  {
    path: "/",
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    path: "/quran",
    changeFrequency: "weekly",
    priority: 0.95,
  },
  {
    path: "/adhkar",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/prayer-times",
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    path: "/qibla",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/tasbih",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/fatwa",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/prophets-stories",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/quran-memorization",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/ruqyah",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/daily-wird",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/zakat",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/inheritance",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/hajj-guide",
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/dawah-guide",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/articles",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/calendar",
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    path: "/faq",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/contact",
    changeFrequency: "monthly",
    priority: 0.65,
  },
  {
    path: "/about",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/privacy",
    changeFrequency: "yearly",
    priority: 0.5,
  },
  {
    path: "/terms",
    changeFrequency: "yearly",
    priority: 0.5,
  },
  {
    path: "/download",
    changeFrequency: "weekly",
    priority: 0.75,
  },

  /**
   * ملاحظة:
   * أخرجت /search من sitemap عمدًا.
   *
   * صفحات البحث عادةً لا تصلح للفهرسة لأنها:
   * - تعتمد على استعلام المستخدم
   * - قد تنتج صفحات رقيقة Thin Content
   * - ليست محتوى دائمًا قابلًا للمشاركة
   *
   * إذا كنت مصرًا على إضافتها، يمكنك إرجاعها هكذا:
   *
   * {
   *   path: "/search",
   *   changeFrequency: "yearly",
   *   priority: 0.1,
   * }
   */
];

// ============================================================
// دوال مساعدة
// ============================================================

function normalizePath(path: string): string {
  const clean = path.trim();

  if (!clean) {
    return "/";
  }

  return clean.startsWith("/") ? clean : `/${clean}`;
}

function buildUrl(lang: Lang, path: string): string {
  const normalizedPath = normalizePath(path);

  if (normalizedPath === "/") {
    return `${SITE_URL}/${lang}`;
  }

  return `${SITE_URL}/${lang}${normalizedPath}`;
}

function buildAlternates(
  path: string,
  langs: Lang[]
): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const lang of langs) {
    languages[lang] = buildUrl(lang, path);
  }

  /**
   * x-default مهم لمحركات البحث عندما يكون الموقع متعدد اللغة.
   * نوجهه افتراضيًا إلى أول لغة موجودة في القائمة.
   */
  const defaultLang = langs[0] || "ar";
  languages["x-default"] = buildUrl(defaultLang, path);

  return languages;
}

function normalizeArticleId(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return encodeURIComponent(String(value));
  }

  if (typeof value !== "string") {
    return null;
  }

  const id = value.trim();

  if (!id || id.length > 128) {
    return null;
  }

  // منع أي slash قد يكسر مسار URL
  if (id.includes("/") || id.includes("\\")) {
    return null;
  }

  return encodeURIComponent(id);
}

function parseDate(value: unknown): Date | null {
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

  if (typeof value !== "string") {
    return null;
  }

  const raw = value.trim();

  if (!raw) {
    return null;
  }

  // لو الرقم جاء كنص، اعتبره timestamp
  if (/^\d+$/.test(raw)) {
    const date = new Date(Number(raw));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();

  // تجاهل التواريخ غير المنطقية
  if (year < 1970 || year > 2100) {
    return null;
  }

  return date;
}

function dedupeRoutes(routes: SitemapRoute[]): SitemapRoute[] {
  const seen = new Set<string>();
  const result: SitemapRoute[] = [];

  for (const route of routes) {
    const langs = route.langs?.length ? route.langs : ALL_LANGS;
    const key = `${normalizePath(route.path)}|${langs.join(",")}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(route);
  }

  return result;
}

// ============================================================
// صفحات المقالات الديناميكية
// ============================================================

async function getArticleRoutes(): Promise<SitemapRoute[]> {
  if (!INCLUDE_ARTICLE_PAGES) {
    return [];
  }

  try {
    const content = await getContent();

    const articles = Array.isArray((content as any)?.articles)
      ? (content as any).articles
      : [];

    const routes: SitemapRoute[] = [];

    for (const article of articles) {
      const id = normalizeArticleId(
        article?.id ?? article?.slug ?? article?.articleId
      );

      if (!id) {
        continue;
      }

      const path = `/articles/${id}`;

      const lastModified =
        parseDate(
          article?.date ??
            article?.publishedAt ??
            article?.created_at ??
            article?.updatedAt ??
            article?.updated_at
        ) ?? FALLBACK_LAST_MODIFIED;

      routes.push({
        path,
        changeFrequency: "monthly",
        priority: 0.8,
        lastModified,
        langs: ARTICLE_LANGS,
      });

      if (routes.length >= MAX_ARTICLE_ROUTES) {
        break;
      }
    }

    return routes;
  } catch (error) {
    console.warn("[Sitemap] Failed to load article routes:", error);
    return [];
  }
}

// ============================================================
// Sitemap
// ============================================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /**
   * في Vercel Preview أو Development:
   * نرجع sitemap فارغًا حتى لا تظهر روابط تجريبية في محركات البحث.
   */
  if (!isProduction) {
    return [];
  }

  const articleRoutes = await getArticleRoutes();

  const routes = dedupeRoutes([
    ...STATIC_ROUTES,
    ...articleRoutes,
  ]);

  const items: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    const langs = route.langs?.length ? route.langs : ALL_LANGS;

    const alternates = {
      languages: buildAlternates(route.path, langs),
    };

    for (const lang of langs) {
      items.push({
        url: buildUrl(lang, route.path),
        lastModified: route.lastModified ?? FALLBACK_LAST_MODIFIED,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates,
      });
    }
  }

  return items;
}