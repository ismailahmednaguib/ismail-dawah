import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/content';
import { askConstrainedAssistant } from '@/lib/assistant';
import { normalizeAssistantConfig } from '@/lib/assistant-core';
import { rateLimitGuard } from '@/lib/rate-limit';
import { getTurnstileToken, verifyTurnstile } from '@/lib/turnstile';
import type { Lang } from '@/lib/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 12_000;

function messageFor(lang: Lang, code: string): string {
  const arabic = lang === 'ar';
  if (code === 'question_too_short') return arabic ? 'اكتب سؤالًا أوضح من حرفين.' : 'Please enter a question longer than two characters.';
  if (code === 'assistant_provider_missing') return arabic ? 'المساعد غير مهيأ حاليًا.' : 'The assistant provider is not configured yet.';
  if (code === 'turnstile_failed') return arabic ? 'فشل التحقق الأمني. حاول مرة أخرى.' : 'Security verification failed. Please try again.';
  return arabic ? 'تعذر تشغيل المساعد حاليًا. حاول لاحقًا.' : 'The assistant is temporarily unavailable. Please try again later.';
}

export async function POST(request: NextRequest) {
  const limited = await rateLimitGuard(request, 'assistant', {
    message: 'عدد أسئلة المساعد كبير جدًا. حاول لاحقًا.',
  });
  if (limited) return limited;

  const settings = await getSiteSettings();
  const config = normalizeAssistantConfig(settings.assistant);
  const lang: Lang = request.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'ar';

  if (config.enabled !== true) {
    return NextResponse.json({ ok: false, error: messageFor(lang, 'disabled') }, { status: 404 });
  }
  if (!process.env.AI_ASSISTANT_API_KEY?.trim()) {
    return NextResponse.json({ ok: false, error: messageFor(lang, 'assistant_provider_missing') }, { status: 503 });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: messageFor(lang, 'invalid') }, { status: 413 });
  }

  const body = await request.json().catch(() => null) as { question?: unknown } | null;
  if (!body || typeof body.question !== 'string') {
    return NextResponse.json({ ok: false, error: messageFor(lang, 'question_too_short') }, { status: 400 });
  }

  const turnstile = await verifyTurnstile(
    getTurnstileToken(body as Record<string, unknown>)
  );
  if (!turnstile.ok) {
    return NextResponse.json(
      { ok: false, error: messageFor(lang, 'turnstile_failed') },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const result = await askConstrainedAssistant(body.question, lang, config);
    return NextResponse.json({ ok: true, ...result }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'assistant_failed';
    const status = code === 'question_too_short' ? 400 : code === 'assistant_provider_missing' ? 503 : 502;
    return NextResponse.json({ ok: false, error: messageFor(lang, code) }, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
