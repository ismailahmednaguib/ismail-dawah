// app/sitemap.ts
import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NAV_TREE, flattenNav, navHref } from '@/lib/navigation';
import { encodeUrl } from '@/lib/url';
import { RELIGION_ENTRIES, RELIGION_RESOURCES } from '@/lib/religions';

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ismailahmednaguib.vercel.app').replace(/\/+$/, '');

export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // الصفحات الثابتة — تُشتق من هيكل التنقّل (lib/navigation) مع أولويات حسب العمق.
  const staticPages: MetadataRoute.Sitemap = [];
  const languages = ['ar', 'en'];

  // خريطة: المسار → أقل عمق في شجرة التنقّل (لحساب الأولوية).
  const pathDepth = new Map<string, number>();
  pathDepth.set('', 0);
  pathDepth.set('/search', 2);
  for (const node of flattenNav(NAV_TREE)) {
    const href = navHref(node);
    if (!href || !href.startsWith('/')) continue;
    const prev = pathDepth.get(href);
    if (prev === undefined || node.depth < prev) pathDepth.set(href, node.depth);
  }
  // صفحات الأديان والموارد معروفة برمجيًا لكنها ليست كلها روابط مستقلة في القائمة.
  for (const entry of RELIGION_ENTRIES) pathDepth.set(`/religions/${entry.slug}`, 2);
  for (const resource of RELIGION_RESOURCES) pathDepth.set(`/religions/resources/${resource.slug}`, 2);

  const priorityFor = (depth: number) => {
    if (depth === 0) return 1;
    if (depth === 1) return 0.9;
    if (depth === 2) return 0.7;
    return 0.5;
  };

  for (const lang of languages) {
    for (const [path, depth] of pathDepth) {
      staticPages.push({
        url: encodeUrl(`${BASE_URL}/${lang}${path}`),
        lastModified: new Date(),
        changeFrequency: depth === 0 ? 'daily' : depth === 1 ? 'weekly' : 'monthly',
        priority: priorityFor(depth),
        alternates: {
          languages: Object.fromEntries(
            languages.map((l) => [l, encodeUrl(`${BASE_URL}/${l}${path}`)])
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

  // أولوية أعلى للفتاوى والمقالات لأنها تتبدّل أكثر.
  const contentPriority = (type: string) => {
    if (type === 'fatwa' || type === 'article') return 0.8;
    if (type === 'lesson' || type === 'khutbah' || type === 'hadith') return 0.7;
    return 0.6;
  };

  const supportedLanguages = new Set(languages);
  const dynamicPages: MetadataRoute.Sitemap = (content ?? []).flatMap((item: any) => {
    const translations = (item.content_translations ?? []).filter((t: any) =>
      supportedLanguages.has(t.lang)
    );

    return translations.map((t: any) => ({
      url: encodeUrl(`${BASE_URL}/${t.lang}/learn/${item.content_type}/${t.slug}`),
      lastModified: new Date(item.updated_at),
      changeFrequency: 'monthly' as const,
      priority: contentPriority(item.content_type),
      alternates: {
        languages: Object.fromEntries(
          translations
            .filter((x: any) => x.slug)
            .map((x: any) => [
              x.lang,
              encodeUrl(`${BASE_URL}/${x.lang}/learn/${item.content_type}/${x.slug}`),
            ])
        ),
      },
    }));
  });

  return [...staticPages, ...dynamicPages];
}
