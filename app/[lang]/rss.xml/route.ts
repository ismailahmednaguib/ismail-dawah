// app/[lang]/rss.xml/route.ts
// خلاصة RSS لأحدث المحتوى المنشور لكل لغة.
import { createClient } from '@supabase/supabase-js';
import { isValidLang } from '@/lib/i18n';
import { contentUrl, encodeUrl } from '@/lib/url';

export const runtime = 'nodejs';
export const revalidate = 3600;

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ismailahmednaguib.vercel.app').replace(/\/+$/, '');

const FEED_TITLES: Record<string, { title: string; desc: string }> = {
  ar: { title: 'منصة إسماعيل أحمد نجيب — أحدث المحتوى', desc: 'دروس ومقالات وفتاوى وخطب وحديث شريف' },
  en: { title: 'Ismail Ahmed Naguib Platform — Latest', desc: 'Lessons, articles, fatwas, sermons and hadith' },
};

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) {
    return new Response('Not found', { status: 404 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('content_translations')
    .select('slug, title, summary, lang, content:content_id(content_type, published_at, status)')
    .eq('lang', lang)
    .limit(300);

  const items = ((data ?? []) as any[])
    .filter((row) => row.content?.status === 'published' && row.slug && row.title)
    .sort((a, b) => {
      const da = a.content?.published_at ? Date.parse(a.content.published_at) : 0;
      const db = b.content?.published_at ? Date.parse(b.content.published_at) : 0;
      return db - da;
    })
    .slice(0, 30);

  const meta = FEED_TITLES[lang] ?? FEED_TITLES.ar;
  const feedUrl = encodeUrl(`${BASE_URL}/${lang}/rss.xml`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(meta.title)}</title>
    <link>${esc(encodeUrl(`${BASE_URL}/${lang}`))}</link>
    <description>${esc(meta.desc)}</description>
    <language>${esc(lang)}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${esc(feedUrl)}" rel="self" type="application/rss+xml" />
${items
  .map((row) => {
    const url = contentUrl(BASE_URL, lang, row.content.content_type, row.slug);
    return `    <item>
      <title>${esc(row.title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <description>${esc(row.summary ?? '')}</description>
      ${row.content.published_at ? `<pubDate>${new Date(row.content.published_at).toUTCString()}</pubDate>` : ''}
    </item>`;
  })
  .join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
