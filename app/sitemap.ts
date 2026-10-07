import { MetadataRoute } from "next";
import { languages } from "@/lib/i18n";
import { fields } from "@/lib/data";

const BASE = "https://ismailahmednaguib.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // الصفحات الأساسية
  const mainPages = [
    "", "/about", "/contact", "/fatwa", "/live", "/projects", "/news",
    "/map", "/adhkar", "/doubts", "/learn", "/search", "/fields", "/tools"
  ];

  // الأدوات الإسلامية
  const toolPages = [
    "/quran", "/prayer-times", "/qibla", "/calendar", "/khatm-dua",
    "/zakat", "/inheritance", "/daily-wird"
  ];

  // الصفحات الدعوية الجديدة
  const dawahPages = [
    "/dawah-guide", "/prophets-stories", "/atheism-response",
    "/youth-issues", "/khutab", "/quran-memorization",
    "/ruqyah", "/hajj-guide", "/women-fatwas",
    "/prayer-guide", "/embrace-islam"
  ];

  const allPages = [...mainPages, ...toolPages, ...dawahPages];

  // كل الصفحات في كل اللغات
  for (const lang of languages) {
    for (const page of allPages) {
      entries.push({
        url: `${BASE}/${lang.code}${page}`,
        lastModified: now,
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1.0 : page.startsWith("/quran") ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            languages.map(l => [l.code, `${BASE}/${l.code}${page}`])
          ),
        },
      });
    }

    // صفحات العلوم
    for (const field of fields) {
      entries.push({
        url: `${BASE}/${lang.code}/fields/${field.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            languages.map(l => [l.code, `${BASE}/${l.code}/fields/${field.slug}`])
          ),
        },
      });
    }
  }

  return entries;
}