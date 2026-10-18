import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/content';
import { getPublicList, type PublicItem } from '@/lib/learn/public';
import { rateLimitGuard } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TYPES = ['article', 'lesson', 'book', 'research', 'fatwa', 'khutbah', 'audio', 'video', 'hadith', 'duaa', 'story', 'faq', 'event', 'page', 'profile'] as const;

function text(value: string | null, max: number): string {
  return (value || '').replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').trim().slice(0, max);
}

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': status === 200 ? 'public, s-maxage=60, stale-while-revalidate=300' : 'no-store' },
  });
}

export async function GET(request: NextRequest) {
  const settings = await getSiteSettings();
  if (settings.publicApiEnabled !== true) return response({ ok: false, error: 'واجهة المحتوى غير مفعلة.' }, 404);

  const limited = await rateLimitGuard(request, 'public-api', { message: 'عدد طلبات الواجهة كبير جدًا. حاول لاحقًا.' });
  if (limited) return limited;

  const params = request.nextUrl.searchParams;
  const lang = params.get('lang') === 'en' ? 'en' : 'ar';
  const rawType = text(params.get('type'), 30);
  const types = rawType && TYPES.includes(rawType as (typeof TYPES)[number]) ? [rawType] : [...TYPES];
  const search = text(params.get('q'), 120);
  const audience = text(params.get('audience'), 30);
  const level = text(params.get('level'), 30);
  const page = Math.min(Math.max(Number(params.get('page') || 1) || 1, 1), 50);
  const limit = Math.min(Math.max(Number(params.get('limit') || 20) || 20, 1), 50);
  const fetchLimit = Math.min(200, page * limit);

  try {
    const groups = await Promise.all(types.map((type) => getPublicList(lang, type, { limit: fetchLimit, search: search || undefined, audience: audience || undefined, level: level || undefined })));
    const items = [...new Map(groups.flat().map((item) => [item.id, item])).values()]
      .sort((a, b) => String(b.published_at || '').localeCompare(String(a.published_at || '')));
    const start = (page - 1) * limit;
    const pageItems = items.slice(start, start + limit);
    return response({
      ok: true,
      data: pageItems.map((item: PublicItem) => ({
        id: item.id,
        type: item.content_type,
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        publishedAt: item.published_at,
        language: lang,
        isFallback: item.isFallback,
        audience: item.audience,
        levels: item.levels,
        terms: item.terms.map((term) => ({ kind: term.kind, slug: term.slug, name: term.name })),
      })),
      // `getPublicList` يحمي الذاكرة بحد أقصى داخلي؛ لذلك نعلن وجود صفحة لاحقة
      // عند امتلاء الصفحة بدل ادعاء رقم إجمالي غير محسوب على مستوى قاعدة البيانات.
      meta: { page, limit, hasNext: pageItems.length === limit },
    });
  } catch (error) {
    console.error('[PublicContentAPI]', error);
    return response({ ok: false, error: 'تعذر تحميل المحتوى.' }, 500);
  }
}
