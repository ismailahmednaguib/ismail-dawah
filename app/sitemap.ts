// app/sitemap.ts
import type { MetadataRoute } from "next";

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
}

// ============================================================
// الإعدادات
// ============================================================

const LANGS: Lang[] = ["ar", "en"];

/**
 * ضع رابط موقعك النهائي هنا في بيئة الإنتاج.
 *
 * على Vercel أضف Variable:
 * NEXT_PUBLIC_SITE_URL=https://yourdomain.com
 *
 * لو مش موجود، هيستخدم الرابط الاحتياطي ده.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ismailahmednaguib.vercel.app"
).replace(/\/+$/, "");

/**
 * آخر تحديث للموقع.
 * لو حدّثت صفحات كثيرة، ممكن تغيّر التاريخ ده.
 */
const LAST_MODIFIED = new Date("2026-10-09T00:00:00.000Z");

// ============================================================
// الصفحات المراد إدراجها في sitemap
// ============================================================

const ROUTES: SitemapRoute[] = [
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
    path: "/search",
    changeFrequency: "yearly",
    priority: 0.4,
  },
];

// ============================================================
// دوال مساعدة
// ============================================================

function buildUrl(lang: Lang, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath === "/") {
    return `${SITE_URL}/${lang}`;
  }

  return `${SITE_URL}/${lang}${normalizedPath}`;
}

function buildLanguageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const lang of LANGS) {
    languages[lang] = buildUrl(lang, path);
  }

  return languages;
}

// ============================================================
// Sitemap
// ============================================================

export default function sitemap(): MetadataRoute.Sitemap {
  const items: MetadataRoute.Sitemap = [];

  for (const route of ROUTES) {
    const alternates = {
      languages: buildLanguageAlternates(route.path),
    };

    for (const lang of LANGS) {
      items.push({
        url: buildUrl(lang, route.path),
        lastModified: LAST_MODIFIED,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates,
      });
    }
  }

  return items;
}