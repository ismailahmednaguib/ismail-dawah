// app/[lang]/learn/page.tsx
import { Suspense } from 'react';
import { getPublishedContent } from '@/lib/learn/queries';
import ContentCard from '@/components/learn/ContentCard';
import ContentFilters from '@/components/learn/ContentFilters';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المكتبة الإسلامية | أكاديمية إسماعيل',
  description: 'تصفح المقالات والدروس والكتب والفتاوى الإسلامية',
};

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LearnPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  const sp = await searchParams;

  const { data, total, total_pages } = await getPublishedContent(lang, {
    type: sp.type as any,
    audience: sp.audience as any,
    age_group: sp.age as any,
    level: sp.level as any,
    search: sp.q,
    page: Number(sp.page) || 1,
  });

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-cream-50 dark:bg-gray-900">
      {/* الهيدر */}
      <div className="bg-emerald-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            📚 المكتبة الإسلامية
          </h1>
          <p className="text-emerald-200 text-lg">
            كل ما تحتاجه من علم شرعي في مكان واحد
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* الفلاتر */}
        <Suspense fallback={<div className="h-32 animate-pulse bg-stone-100 rounded-xl" />}>
          <ContentFilters lang={lang} />
        </Suspense>

        {/* عدد النتائج */}
        <div className="mt-6 mb-4 flex items-center justify-between">
          <p className="text-sm text-stone-500 dark:text-gray-400">
            {total > 0 ? `${total} نتيجة` : 'لا توجد نتائج'}
          </p>
        </div>

        {/* شبكة المحتوى */}
        {data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.map((item) => (
              <ContentCard
                key={item.id}
                lang={lang}
                type={item.content_type}
                slug={item.slug}
                title={item.title}
                summary={item.summary}
                published_at={item.published_at}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-xl text-stone-500 dark:text-gray-400">
              لا يوجد محتوى مطابق للفلاتر المحددة
            </p>
            <p className="text-sm text-stone-400 mt-2">
              جرب تغيير الفلاتر أو البحث بكلمات مختلفة
            </p>
          </div>
        )}

        {/* الترقيم */}
        {total_pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: total_pages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`?page=${p}`}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  p === (Number(sp.page) || 1)
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white dark:bg-gray-800 text-stone-600 dark:text-gray-300 border border-stone-200 dark:border-gray-700 hover:bg-emerald-50'
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}