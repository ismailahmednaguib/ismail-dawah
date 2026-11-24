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
import { PageHero, renderDesignIcon } from '@/components/ui';
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
    { value: 'non_muslim', icon: '◈', title: 'أتعرف على الإسلام', text: 'مدخل هادئ وواضح لمن يريد التعرف على الإسلام.' },
    { value: 'muslim_new', icon: '✦', title: 'المسلم الجديد', text: 'خطوات عملية لبناء الأساسيات بثبات.' },
    { value: 'student', icon: '📚', title: 'طالب العلم', text: 'محتوى مرتب لمن يريد التوسع والتدرج.' },
  ],
  en: [
    { value: 'non_muslim', icon: '◈', title: 'Discover Islam', text: 'A clear and calm starting point for learning about Islam.' },
    { value: 'muslim_new', icon: '✦', title: 'New Muslim', text: 'Practical steps for building a strong foundation.' },
    { value: 'student', icon: '📚', title: 'Knowledge Seeker', text: 'Structured content for steady, deeper learning.' },
  ],
} as const;

const LEARNING_LEVELS = {
  ar: [
    { number: '١', value: 'beginner', title: 'أساسيات الإسلام', text: 'تعرف على الإيمان والعبادات والمفاهيم الكبرى.' },
    { number: '٢', value: 'beginner', title: 'العقيدة والعبادات', text: 'ثبّت الأساس وتعلم ما تحتاجه في يومك.' },
    { number: '٣', value: 'intermediate', title: 'الفقه والحديث', text: 'انتقل إلى الفهم المنهجي والأدلة.' },
    { number: '٤', value: 'advanced', title: 'التفسير وعلوم القرآن', text: 'اقرأ بوعي وتعرف على علوم الوحي.' },
    { number: '٥', value: 'specialized', title: 'التخصص والدعوة', text: 'ابنِ مسارك في الفقه أو التعليم أو الدعوة.' },
  ],
  en: [
    { number: '1', value: 'beginner', title: 'Islamic Foundations', text: 'Learn faith, worship, and the big ideas.' },
    { number: '2', value: 'beginner', title: 'Aqeedah & Worship', text: 'Build the foundation for everyday practice.' },
    { number: '3', value: 'intermediate', title: 'Fiqh & Hadith', text: 'Move into structured study and evidence.' },
    { number: '4', value: 'advanced', title: 'Tafsir & Quran Sciences', text: 'Read with context and understand revelation.' },
    { number: '5', value: 'specialized', title: 'Specialization & Dawah', text: 'Choose a path in fiqh, teaching, or dawah.' },
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
    title: copy.title,
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
      <main id="main-content" tabIndex={-1}
        dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
        className="site-page-shell"
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

      <div className="container-page py-8">
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
                <span aria-hidden="true">{renderDesignIcon(track.icon, 26)}</span>
                <h3 className="mt-2 font-bold text-primary-950 dark:text-white">{track.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{track.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="learning-levels-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="learning-levels-title" className="text-lg font-bold text-primary-950 dark:text-white">
                {currentLang === 'ar' ? 'مسار تعليمي متدرج' : 'A gradual learning path'}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {currentLang === 'ar' ? 'ابدأ من مستواك وانتقل خطوة بخطوة.' : 'Start at your level and grow step by step.'}
              </p>
            </div>
            <span className="badge-gold">{currentLang === 'ar' ? '٥ مستويات' : '5 levels'}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {LEARNING_LEVELS[currentLang].map((level) => (
              <Link
                key={`${level.number}-${level.title}`}
                href={`/${lang}/learn?level=${level.value}`}
                className="card-interactive group p-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-lg font-black text-primary-800 dark:bg-primary-900/50 dark:text-primary-200">
                  {level.number}
                </span>
                <h3 className="mt-3 font-bold text-primary-950 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {level.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{level.text}</p>
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
          <div className="card border-dashed px-6 py-16 text-center">
            <p aria-hidden="true" className="mb-4 inline-flex">{renderDesignIcon("📭", 48)}</p>
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
                  className={`btn flex h-10 w-10 items-center justify-center rounded-lg px-0 text-sm ${
                  p === currentPage
                    ? 'bg-primary-700 text-white hover:bg-primary-800'
                    : 'btn-outline'
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

