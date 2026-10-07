import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { languages, defaultLang } from '@/lib/i18n';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Security Headers
  const response = NextResponse.next();
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  // المسارات اللي مش محتاجة redirect
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/setup-admin') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname.includes('.')
  ) {
    return response;
  }
  
  // لو المسار فيه لغة بالفعل، كمّل
  const hasLang = languages.some(l => pathname.startsWith(`/${l.code}/`) || pathname === `/${l.code}`);
  if (hasLang) return response;
  
  // غير كده، اعمل redirect للغة الافتراضية
  const saved = req.cookies.get('lang')?.value || defaultLang;
  const newPath = pathname === '/' ? `/${saved}` : `/${saved}${pathname}`;
  return NextResponse.redirect(new URL(newPath, req.url));
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon|manifest|sw\\.js|\\.well-known|.*\\..*|admin|setup-admin).*)',
  ],
};