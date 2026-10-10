// app/robots.ts
import type { MetadataRoute } from "next";

// ============================================================
// إعدادات الموقع
// ============================================================

/**
 * على Vercel يُفضَّل ضبط:
 * NEXT_PUBLIC_SITE_URL=https://ismailahmednaguib.vercel.app
 *
 * ولو المتغير غير موجود، سيستخدم VERCEL_URL أو الرابط الاحتياطي.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://ismailahmednaguib.vercel.app")
).replace(/\/+$/, "");

/**
 * إذا كان النشر على Vercel:
 * - production: اسمح بالفهرسة
 * - preview / development: امنع الفهرسة تمامًا
 *
 * أما محليًا بدون VERCEL_ENV، نسمح حتى تستطيع اختبار الموقع طبيعيًا.
 */
const VERCEL_ENV = process.env.VERCEL_ENV;
const isProduction = VERCEL_ENV === "production" || VERCEL_ENV === undefined;

// ============================================================
// المسارات الخاصة التي لا يجب فهرستها
// ============================================================

const PRIVATE_PATHS = [
  // API
  "/api",
  "/api/",

  // Admin
  "/admin",
  "/admin/",
  "/ar/admin",
  "/ar/admin/",
  "/en/admin",
  "/en/admin/",

  // Auth
  "/login",
  "/login/",
  "/register",
  "/register/",
  "/logout",
  "/logout/",
  "/setup",
  "/setup/",

  "/ar/login",
  "/ar/login/",
  "/ar/register",
  "/ar/register/",
  "/ar/logout",
  "/ar/logout/",
  "/ar/setup",
  "/ar/setup/",

  "/en/login",
  "/en/login/",
  "/en/register",
  "/en/register/",
  "/en/logout",
  "/en/logout/",
  "/en/setup",
  "/en/setup/",
];

// ============================================================
// Robots
// ============================================================

export default function robots(): MetadataRoute.Robots {
  /**
   * في بيئات Vercel Preview أو Development:
   * امنع كل الزواحف من فهرسة الموقع.
   */
  if (!isProduction) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  /**
   * في الإنتاج:
   * اسمح بفهرسة الموقع العام، مع منع المسارات الخاصة.
   */
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}