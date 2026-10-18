import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/content';
import { rateLimitGuard } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATE_PATTERN = /^\d{2}-\d{2}-\d{4}$/;

function numberParam(value: string | null, min: number, max: number): number | null {
  if (!value || value.trim() === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) return null;
  return number;
}

function today(): string {
  const date = new Date();
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getUTCFullYear()}`;
}

function reply(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': status === 200 ? 'public, s-maxage=900, stale-while-revalidate=3600' : 'no-store',
    },
  });
}

export async function GET(request: NextRequest) {
  const settings = await getSiteSettings();
  if (settings.publicApiEnabled !== true) return reply({ ok: false, error: 'الواجهة العامة غير مفعلة.' }, 404);

  const limited = await rateLimitGuard(request, 'public-api', { message: 'عدد طلبات الواجهة كبير جدًا. حاول لاحقًا.' });
  if (limited) return limited;

  const params = request.nextUrl.searchParams;
  const latitude = numberParam(params.get('latitude') ?? params.get('lat'), -90, 90);
  const longitude = numberParam(params.get('longitude') ?? params.get('lon'), -180, 180);
  const method = Math.trunc(numberParam(params.get('method'), 0, 23) ?? 3);
  const rawDate = params.get('date') || today();

  if (latitude === null || longitude === null || !DATE_PATTERN.test(rawDate)) {
    return reply({ ok: false, error: 'أرسل latitude وlongitude صالحين، والتاريخ بصيغة DD-MM-YYYY.' }, 400);
  }

  const url = `https://api.aladhan.com/v1/timings/${rawDate}?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&method=${method}`;

  try {
    const response = await fetch(url, { next: { revalidate: 900 } });
    if (!response.ok) return reply({ ok: false, error: 'تعذر تحميل المواقيت من المصدر.' }, 502);
    const payload = await response.json().catch(() => null) as {
      code?: number;
      data?: { timings?: Record<string, string>; date?: unknown; meta?: unknown };
    } | null;

    if (payload?.code !== 200 || !payload.data?.timings) {
      return reply({ ok: false, error: 'استجابة المصدر غير صالحة.' }, 502);
    }

    return reply({
      ok: true,
      source: 'AlAdhan',
      date: payload.data.date ?? rawDate,
      timings: payload.data.timings,
      meta: payload.data.meta ?? null,
    });
  } catch (error) {
    console.error('[PublicPrayerTimesAPI]', error);
    return reply({ ok: false, error: 'تعذر تحميل المواقيت حاليًا.' }, 502);
  }
}
