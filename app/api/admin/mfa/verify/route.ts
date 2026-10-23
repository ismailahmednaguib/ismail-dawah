// إكمال دخول الأدمن بعد كلمة المرور باستخدام كود TOTP.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { rateLimitGuard } from '@/lib/rate-limit';
import { setAdminSessionCookies } from '@/lib/auth';
import {
  clearAdminMfaPendingCookie,
  getAdminMfaPending,
  loadAdminMfa,
  verifyAdminMfaCode,
} from '@/lib/admin/mfa';

function secure(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}

export async function POST(request: NextRequest) {
  const limited = await rateLimitGuard(request, 'admin-login');
  if (limited) return limited;

  const pending = getAdminMfaPending(request);
  if (!pending) {
    return secure(NextResponse.json({ ok: false, error: 'mfa_session_expired' }, { status: 401 }));
  }

  let body: { code?: unknown; lang?: unknown };
  try {
    body = (await request.json()) as { code?: unknown; lang?: unknown };
  } catch {
    return secure(NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 }));
  }

  const code = typeof body.code === 'string' ? body.code : '';
  if (!/^\d{6}$/.test(code.replace(/\s+/g, ''))) {
    return secure(NextResponse.json({ ok: false, error: 'invalid_code', message: 'أدخل رمزًا من ٦ أرقام.' }, { status: 400 }));
  }

  try {
    const mfa = await loadAdminMfa(pending.userId);
    if (!mfa.status.enabled || !verifyAdminMfaCode(mfa.secret, code)) {
      return secure(NextResponse.json({ ok: false, error: 'invalid_code', message: 'رمز التحقق غير صحيح أو منتهي.' }, { status: 401 }));
    }

    const lang = body.lang === 'en' ? 'en' : 'ar';
    const response = NextResponse.json({
      ok: true,
      role: 'admin',
      redirect: process.env.NEXT_PUBLIC_ADMIN_HOME_URL?.trim() || '/admin',
    });
    setAdminSessionCookies(response, pending.userId, {
      email: pending.email,
      mfa: true,
    });
    clearAdminMfaPendingCookie(response);
    void lang;
    return secure(response);
  } catch (error) {
    console.error('[Admin MFA] verify error:', error);
    return secure(NextResponse.json({ ok: false, error: 'server_error', message: 'تعذر إكمال التحقق.' }, { status: 500 }));
  }
}
