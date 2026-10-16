// app/[lang]/learn/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedContent } from '@/lib/learn/queries';
import ContentCard from '@/components/learn/ContentCard';
import ContentFilters from '@/components/learn/ContentFilters';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { isValidLang, type Lang } from '@/lib/i18n';
import { PageHero } from '@/components/ui';
import type { AgeGroup, Audience, ContentType, EduLevel, Madhhab } from '@/lib/types/content';

const COPY: Record<string, any> = {
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

const TRACKS = {
  ar: [
    { value: 'non_muslim', icon: '🌍', title: 'أتعرف على الإسلام', text: 'مدخل هادئ وواضح لمن يريد التعرف على الإسلام.' },
    { value: 'muslim_new', icon: '🌱', title: 'المسلم الجديد', text: 'خطوات عملية لبناء الأساسيات بثبات.' },
    { value: 'student', icon: '📚', title: 'طالب العلم', text: 'محتوى مرتب لمن يريد التوسع والتدرج.' },
  ],
  en: [
    { value: 'non_muslim', icon: '🌍', title: 'Discover Islam', text: 'A clear and calm starting point for learning about Islam.' },
    { value: 'muslim_new', icon: '🌱', title: 'New Muslim', text: 'Practical steps for building a strong foundation.' },
    { value: 'student', icon: '📚', title: 'Knowledge Seeker', text: 'Structured content for steady, deeper learning.' },
  ],
} as const;

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const currentLang = isValidLang(lang) ? (lang as Lang) : 'ar';
  const copy = COPY[currentLang];

  return {
    title: `${copy.title} | منصة إسماعيل أحمد نجيب`,
    description: copy.subtitle,
  };
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
    madhhab: sp.madhhab as Madhhab | undefined,
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
      <PageHero
        icon="📚"
        title={copy.title}
        subtitle={copy.subtitle}
        crumbs={[
          { label: currentLang === 'ar' ? 'الرئيسية' : 'Home', href: `/${lang}` },
          { label: copy.title },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* الفلاتر */}
        <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-primary-50" />}>
          <ContentFilters lang={currentLang} />
        </Suspense>

        <section className="mt-6" aria-labelledby="learning-tracks-title">
          <h2 id="learning-tracks-title" className="mb-3 text-lg font-bold text-primary-950 dark:text-white">
            {currentLang === 'ar' ? 'اختر مسارك' : 'Choose your path'}
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {TRACKS[currentLang].map((track) => (
              <Link
                key={track.value}
                href={`/${lang}/learn?audience=${track.value}`}
                className="card-interactive p-4"
              >
                <span className="text-2xl" aria-hidden="true">{track.icon}</span>
                <h3 className="mt-2 font-bold text-primary-950 dark:text-white">{track.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{track.text}</p>
              </Link>
            ))}
          </div>
        </section>

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

