import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { languages, defaultLang } from '@/lib/i18n';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/.well-known') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  const hasLang = languages.some(l => pathname.startsWith(`/${l.code}/`) || pathname === `/${l.code}`);
  if (hasLang) return NextResponse.next();
  
  const saved = req.cookies.get('lang')?.value || defaultLang;
  const newPath = pathname === '/' ? `/${saved}` : `/${saved}${pathname}`;
  return NextResponse.redirect(new URL(newPath, req.url));
}

export const config = {
  matcher: '/((?!api|_next|favicon|manifest|sw|\\.well-known|.*\\..*).*)',
};