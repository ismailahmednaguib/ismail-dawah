// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { preferredLanguageFromHeader } from './lib/i18n/config';
import { resolveManagedRedirect } from './lib/managed-redirects';

const ENABLED_LANGUAGES = ['ar', 'en'];
const DEFAULT_LANGUAGE = 'ar';

async function resolveRedirectFromPublicSettings(request: NextRequest) {
  try {
    const settingsUrl = new URL('/api/site-settings', request.url);
    const response = await fetch(settingsUrl, {
      headers: { accept: 'application/json' },
      cache: 'force-cache',
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { settings?: { redirects?: unknown } };
    return resolveManagedRedirect(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      payload.settings?.redirects
    );
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
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

  const managedRedirect = await resolveRedirectFromPublicSettings(request);
  if (managedRedirect) {
    const destination = new URL(managedRedirect.destination, request.url);
    if (destination.pathname !== pathname || destination.search !== request.nextUrl.search) {
      return NextResponse.redirect(destination, managedRedirect.statusCode);
    }
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

  const requestLanguage = pathname.startsWith('/en/') || pathname === '/en' ? 'en' : 'ar';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-site-language', requestLanguage);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|admin|setup-admin|sitemap.xml|robots.txt|manifest.webmanifest).*)',
  ],
};
layout.tsx