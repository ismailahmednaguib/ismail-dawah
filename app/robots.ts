// app/robots.ts
import type { MetadataRoute } from "next";

// ============================================================
// إعدادات الموقع
// ============================================================

/**
 * رابط الموقع الأساسي.
 *
 * على Vercel يُفضل إضافة Variable:
 * NEXT_PUBLIC_SITE_URL=https://ismailahmednaguib.vercel.app
 *
 * ولو المتغير مش موجود، هيستخدم الرابط الاحتياطي ده.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://ismailahmednaguib.vercel.app"
).replace(/\/+$/, "");

// ============================================================
// Robots
// ============================================================

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}