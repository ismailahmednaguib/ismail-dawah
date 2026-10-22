// app/[lang]/rss.xml/route.ts
// خلاصة RSS لأحدث المحتوى المنشور لكل لغة.
import { isValidLang } from '@/lib/i18n';
import { getSiteSettings } from '@/lib/content';
import { readSettingText } from '@/lib/settings-text';
import { SITE_NAME, SITE_NAME_EN } from '@/lib/site';
import { getPublicReadClient } from '@/lib/supabase/public-read';
import { contentUrl, encodeUrl } from '@/lib/url';

export const runtime = 'nodejs';
export const revalidate = 3600;

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ismailahmednaguib.vercel.app').replace(/\/+$/, '');

const FEED_COPY: Record<string, { suffix: string; desc: string }> = {
  ar: { suffix: 'أحدث المحتوى', desc: 'دروس ومقالات وفتاوى وخطب وحديث شريف' },
  en: { suffix: 'Latest', desc: 'Lessons, articles, fatwas, sermons and hadith' },
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

  // قراءة خادمية موحّدة، مرتّبة على `published_at` مع فلتر النشر.
  const supabase = getPublicReadClient();

  type Translation = {
    slug: string;
    title: string;
    summary: string | null;
    lang: string;
  };
  type ContentRow = {
    content_type: string;
    published_at: string | null;
    content_translations: Translation[];
  };

  const { data } = await supabase
    .from('content')
    .select(
      'content_type, published_at, content_translations!inner(slug, title, summary, lang)'
    )
    .eq('status', 'published')
    .eq('content_translations.lang', lang)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(30);

  const items = ((data ?? []) as ContentRow[])
    .flatMap((row) => {
      const translation = (row.content_translations ?? []).find(
        (item) => item.lang === lang && item.slug && item.title
      );
      return translation ? [{ ...translation, content: row }] : [];
    })
    .slice(0, 30);

  const meta = FEED_COPY[lang] ?? FEED_COPY.ar;

  // اسم العلامة من اللوحة (`shortName` ثم `ownerName`) حتى لا يتفرّع الاسم
  // بين الواجهة والخلاصة. القراءة مُخزّنة في `getSiteSettings`.
  const settings = await getSiteSettings();
  const fallbackName = lang === 'en' ? SITE_NAME_EN : SITE_NAME;
  const brand =
    readSettingText(settings?.shortName, lang, '') ||
    readSettingText(settings?.ownerName, lang, fallbackName);
  const feedTitle = `${brand} — ${meta.suffix}`;

  const feedUrl = encodeUrl(`${BASE_URL}/${lang}/rss.xml`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(feedTitle)}</title>
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
