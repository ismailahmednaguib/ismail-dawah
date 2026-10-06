import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { languages, defaultLang } from '@/lib/i18n';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // تجاهل المسارات اللي مش محتاجة redirect
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple') ||
    pathname.includes('.')
  ) {
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
  matcher: '/((?!api|_next|favicon|manifest|sw|\\.well-known|icon|apple|.*\\..*).*)',
};