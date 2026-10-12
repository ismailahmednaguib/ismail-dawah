import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLang, isValidLang } from "@/lib/i18n";

/** امتدادات الملفات الثابتة اللي مش محتاجة لغة */
const STATIC_FILE_RE =
  /\.(ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|eot|otf|mp3|mp4|webm|pdf|txt|xml|webmanifest|json|js|css|map|md|html)$/i;

/** مسارات مش محتاجة لغة في أولها */
const NO_LANG_PREFIXES = [
  "/api",
  "/admin",
  "/setup-admin",
  "/_next",
  // صفحة تفاصيل المقال موجودة في app/articles/[id] خارج [lang]،
  // وكانت بتتحوّل لـ /ar/articles/ID → 404.
  // ملاحظة: /articles (القائمة) من غير id لسه بيتحوّل للغة عادي (شوف تحت).
];

/** مسارات ثابتة بالظبط */
const NO_LANG_EXACT = new Set([
  "/sw.js",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/google0ae699754d97c303.html",
]);

function isNoLangPath(pathname: string): boolean {
  if (NO_LANG_EXACT.has(pathname)) return true;

  for (const prefix of NO_LANG_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return true;
    }
  }

  // /articles/<id> فقط (مش /articles لوحدها)
  if (/^\/articles\/[^/]+\/?$/.test(pathname)) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1) ملفات ثابتة
  if (STATIC_FILE_RE.test(pathname)) {
    return NextResponse.next();
  }

  // 2) مسارات من غير لغة
  if (isNoLangPath(pathname)) {
    return NextResponse.next();
  }

  // 3) الجذر → اللغة الافتراضية
  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLang}`;
    return NextResponse.redirect(url);
  }

  // 4) شيل الـ "/" الزيادة في الآخر
  const normalized =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

  // 5) أول جزء من المسار
  const firstSegment = normalized.split("/")[1] ?? "";

  // 6) لو لغة صالحة → كمّل
  if (isValidLang(firstSegment)) {
    return NextResponse.next();
  }

  // 7) لو اللغة مكتوبة بحروف كبيرة (/AR/quran) صحّحها بدل ما تتحول لـ /ar/AR/quran
  if (isValidLang(firstSegment.toLowerCase())) {
    const url = request.nextUrl.clone();
    url.pathname = `/${firstSegment.toLowerCase()}${normalized.slice(
      firstSegment.length + 1
    )}`;
    return NextResponse.redirect(url);
  }

  // 8) مسار من غير لغة → أضف اللغة الافتراضية
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLang}${normalized}`;
  url.search = search;
  return NextResponse.redirect(url);
}

export const config = {
  // استبعاد _next و api و أي ملف فيه امتداد من الـ middleware أصلاً (أسرع)
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
};