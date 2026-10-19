// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { preferredLanguageFromHeader } from './lib/i18n/config';

const ENABLED_LANGUAGES = ['ar', 'en'];
const DEFAULT_LANGUAGE = 'ar';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // تجاهل الملفات الثابتة و API
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.') ||
    pathname === '/setup-admin' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/manifest.webmanifest'
  ) {
    return NextResponse.next();
  }

  // التحقق من وجود لغة في الرابط
  const pathnameHasLang = ENABLED_LANGUAGES.some(
    lang => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
  );

  if (!pathnameHasLang) {
    // الجذر فقط يحترم لغة المتصفح؛ بقية المسارات بلا لغة تعود للعربية.
    const preferred = preferredLanguageFromHeader(
      request.headers.get('accept-language')
    );
    const lang = pathname === '/' ? preferred : DEFAULT_LANGUAGE;
    const suffix = pathname === '/' ? '' : pathname;
    const newUrl = new URL(`/${lang}${suffix}`, request.url);
    return NextResponse.redirect(newUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|admin|setup-admin|sitemap.xml|robots.txt|manifest.webmanifest).*)',
  ],
};