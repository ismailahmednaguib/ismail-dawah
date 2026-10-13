// app/sitemap.ts
import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ismailahmednaguib.vercel.app';
   export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // الصفحات الثابتة
  const staticPages: MetadataRoute.Sitemap = [];
  const languages = ['ar', 'en'];

  const staticPaths = [
    '',
    '/learn',
    '/search',
    '/quran',
    '/fatwa',
    '/about',
    '/contact',
    '/adhkar',
    '/tasbih',
    '/prayer-times',
    '/qibla',
    '/zakat',
    '/hajj-guide',
    '/dawah-guide',
    '/embrace-islam',
    '/atheism-response',
    '/doubts',
    '/prophets-stories',
    '/women-fatwas',
    '/youth-issues',
    '/khutab',
    '/news',
    '/articles',
    '/live',
    '/calendar',
    '/map',
    '/download',
    '/privacy',
    '/terms',
  ];

  for (const lang of languages) {
    for (const path of staticPaths) {
      staticPages.push({
        url: `${BASE_URL}/${lang}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            languages.map(l => [l, `${BASE_URL}/${l}${path}`])
          ),
        },
      });
    }
  }

  // الصفحات الديناميكية من قاعدة البيانات
  const { data: content } = await supabase
    .from('content')
    .select(`
      id,
      content_type,
      updated_at,
      content_translations ( lang, slug )
    `)
    .eq('status', 'published');

  const dynamicPages: MetadataRoute.Sitemap = (content ?? []).flatMap((item: any) => {
    return (item.content_translations ?? []).map((t: any) => ({
      url: `${BASE_URL}/${t.lang}/learn/${item.content_type}/${t.slug}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          (item.content_translations ?? [])
            .filter((x: any) => x.slug)
            .map((x: any) => [x.lang, `${BASE_URL}/${x.lang}/learn/${item.content_type}/${x.slug}`])
        ),
      },
    }));
  });

  return [...staticPages, ...dynamicPages];
}