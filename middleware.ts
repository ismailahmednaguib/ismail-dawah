import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { languages, defaultLang } from '@/lib/i18n';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // المسارات اللي مش محتاجة redirect
  const skipRedirect = [
    '/api',
    '/admin',
    '/setup-admin',
    '/_next',
    '/favicon',
    '/manifest',
    '/sw.js',
    '/.well-known',
    '/icon',
    '/apple',
    '/sitemap.xml',
    '/robots.txt',
  ];
  
  // لو المسار في قائمة الاستثناءات، كمّل
  if (skipRedirect.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // لو المسار فيه امتداد ملف (image, css, js)، كمّل
  if (pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // لو المسار فيه لغة بالفعل، كمّل
  const hasLang = languages.some(l => pathname.startsWith(`/${l.code}/`) || pathname === `/${l.code}`);
  if (hasLang) return NextResponse.next();
  
  // غير كده، اعمل redirect للغة الافتراضية
  const saved = req.cookies.get('lang')?.value || defaultLang;
  const newPath = pathname === '/' ? `/${saved}` : `/${saved}${pathname}`;
  return NextResponse.redirect(new URL(newPath, req.url));
}

export const config = {
  matcher: '/((?!api|_next|favicon|manifest|sw|\\.well-known|icon|apple|sitemap|robots|.*\\..*).*)',
};