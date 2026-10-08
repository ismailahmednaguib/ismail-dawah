import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLang, isValidLang } from '@/lib/i18n';

/**
 * امتدادات الملفات الثابتة اللي مش محتاجة لغة
 */
const STATIC_FILE_RE =
  /\.(ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|eot|otf|mp3|mp4|webm|pdf|txt|xml|webmanifest|json|js|css|map|md|html)$/i;

/**
 * مسارات مش محتاجة لغة في أولها
 */
const NO_LANG_PREFIXES = ['/api', '/admin', '/setup-admin', '/_next'];

/**
 * مسارات ثابتة بالظبط
 */
const NO_LANG_EXACT = new Set([
  '/sw.js',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/google0ae699754d97c303.html',
]);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1) ملفات ثابتة → كمّل من غير توجيه
  if (STATIC_FILE_RE.test(pathname)) {
    return NextResponse.next();
  }

  // 2) مسارات ثابتة بالظبط
  if (NO_LANG_EXACT.has(pathname)) {
    return NextResponse.next();
  }

  // 3) مسارات بتبدأ بـ /api أو /admin أو /_next
  for (const prefix of NO_LANG_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return NextResponse.next();
    }
  }

  // 4) الجذر "/" → حوّله للغة الافتراضية
  if (pathname === '/' || pathname === '') {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLang}`;
    return NextResponse.redirect(url);
  }

  // 5) شيل الـ "/" الزيادة في الآخر لو موجود عشان نتحقق صح
  const normalized = pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  // 6) استخرج أول جزء من الـ مسار
  const firstSegment = normalized.split('/')[1] ?? '';

  // 7) لو أول جزء لغة صالحة → كمّل عادي
  if (isValidLang(firstSegment)) {
    return NextResponse.next();
  }

  // 8) غير كده → ده مسار من غير لغة، أضف اللغة الافتراضية
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLang}${normalized}`;
  url.search = search; // حافظ على الـ query params
  return NextResponse.redirect(url);
}

export const config = {
  // بنخلي الـ middleware يشتغل على كل حاجة ما عدا ملفات _next والـ favicon
  // والباقي بيتفلتر داخل الـ middleware نفسه
  matcher: ['/((?!_next/|favicon.ico).*)'],
};