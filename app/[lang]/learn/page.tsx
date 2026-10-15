// app/[lang]/learn/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPublishedContent } from '@/lib/learn/queries';
import ContentCard from '@/components/learn/ContentCard';
import ContentFilters from '@/components/learn/ContentFilters';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { isValidLang, type Lang } from '@/lib/i18n';
import type { AgeGroup, Audience, ContentType, EduLevel } from '@/lib/types/content';

export const metadata: Metadata = {
  title: 'المكتبة الإسلامية | أكاديمية إسماعيل',
  description: 'تصفح المقالات والدروس والكتب والفتاوى الإسلامية',
};

const COPY = {
  ar: {
    title: 'المكتبة الإسلامية',
    subtitle: 'كل ما تحتاجه من علم شرعي في مكان واحد',
    results: (count: number) => (count > 0 ? `${count} نتيجة` : 'لا توجد نتائج'),
    emptyTitle: 'لا يوجد محتوى مطابق للفلاتر المحددة',
    emptyHint: 'جرب تغيير الفلاتر أو البحث بكلمات مختلفة',
  },
  en: {
    title: 'Islamic Library',
    subtitle: 'Islamic knowledge organized in one place',
    results: (count: number) => (count > 0 ? `${count} results` : 'No results'),
    emptyTitle: 'No content matches the selected filters',
    emptyHint: 'Try changing the filters or searching for different words',
  },
} as const;

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LearnPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  const sp = await searchParams;
  if (!isValidLang(lang)) notFound();

  const currentLang = lang as Lang;
  const copy = COPY[currentLang];
  const currentPage = Number(sp.page) || 1;

  const { data, total, total_pages } = await getPublishedContent(lang, {
    type: sp.type as ContentType | undefined,
    audience: sp.audience as Audience | undefined,
    age_group: sp.age as AgeGroup | undefined,
    level: sp.level as EduLevel | undefined,
    search: sp.q,
    page: currentPage,
  });

  const pageHref = (page: number) => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(sp)) {
      if (key !== 'page' && value) params.set(key, value);
    }

    params.set('page', String(page));
    return `?${params.toString()}`;
  };

  return (
    <>
      <Header lang={currentLang} />
      <main
        dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
        className="min-h-screen bg-slate-50 dark:bg-night-900"
      >
      {/* الهيدر */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 px-4 py-12 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            📚 {copy.title}
          </h1>
          <p className="text-primary-100 text-lg">
            {copy.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* الفلاتر */}
        <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-primary-50" />}>
          <ContentFilters lang={lang} />
        </Suspense>

        {/* عدد النتائج */}
        <div className="mt-6 mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {copy.results(total)}
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
            <p className="text-xl text-slate-500 dark:text-slate-400">
              {copy.emptyTitle}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {copy.emptyHint}
            </p>
          </div>
        )}

        {/* الترقيم */}
        {total_pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: total_pages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={pageHref(p)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  p === currentPage
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-night-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-night-700 hover:bg-primary-50'
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
      </main>
      <Footer lang={currentLang} />
    </>
  );
}
