import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentCard from '@/components/learn/ContentCard';
import { getPublishedContent } from '@/lib/learn/queries';
import { isValidLang, type Lang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'الحديث الشريف | أكاديمية إسماعيل',
  description: 'تصفح محتوى الحديث الشريف الموثق في أكاديمية إسماعيل.',
};

const COPY = {
  ar: {
    title: 'الحديث الشريف',
    subtitle: 'محتوى حديثي منظم مع إظهار المصدر والدرجة عند توفرهما',
    searchPlaceholder: 'ابحث في عناوين محتوى الحديث...',
    search: 'بحث',
    results: (count: number) => `${count} نتيجة`,
    emptyTitle: 'لا يوجد محتوى حديث منشور بعد',
    emptyHint: 'سيظهر المحتوى هنا بعد مراجعته واعتماده من لوحة الإدارة.',
    notice: 'يُرجى الرجوع إلى أهل الاختصاص عند التحقق من الأحاديث وأحكامها.',
    library: 'استكشف المكتبة الإسلامية',
    previous: 'السابق',
    next: 'التالي',
  },
  en: {
    title: 'Hadith',
    subtitle: 'Organized hadith content with sources and grades when available',
    searchPlaceholder: 'Search published hadith titles...',
    search: 'Search',
    results: (count: number) => `${count} results`,
    emptyTitle: 'No published hadith content yet',
    emptyHint: 'Content will appear here after review and approval in the admin panel.',
    notice: 'Please consult qualified scholars when verifying hadith and its rulings.',
    library: 'Explore the Islamic library',
    previous: 'Previous',
    next: 'Next',
  },
} as const;

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function HadithPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const currentLang = lang as Lang;
  const copy = COPY[currentLang];
  const sp = await searchParams;
  const query = typeof sp.q === 'string' ? sp.q.trim().slice(0, 120) : '';
  const currentPage = Math.max(1, Number(sp.page) || 1);
  const { data, total, total_pages } = await getPublishedContent(lang, {
    type: 'hadith',
    search: query || undefined,
    page: currentPage,
  });

  const pageHref = (page: number) => {
    const search = new URLSearchParams();
    if (query) search.set('q', query);
    search.set('page', String(page));
    return `/${lang}/hadith?${search.toString()}`;
  };

  return (
    <>
      <Header lang={currentLang} />
      <main
        dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
        className="min-h-screen bg-slate-50 dark:bg-night-900"
      >
        <section className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 px-4 py-14 text-white">
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-3 text-5xl">💬</p>
            <h1 className="text-3xl font-bold md:text-4xl">{copy.title}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-primary-100">{copy.subtitle}</p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <form className="mx-auto flex max-w-3xl gap-2" method="get">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={copy.searchPlaceholder}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-night-700 dark:bg-night-800 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-xl bg-gold-500 px-5 py-3 font-semibold text-night-950 transition hover:bg-gold-400"
            >
              {copy.search}
            </button>
          </form>

          <div className="mx-auto mt-5 max-w-3xl rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-900 dark:border-primary-900/50 dark:bg-primary-950/30 dark:text-primary-100">
            📚 {copy.notice}
          </div>

          <div className="mb-4 mt-8 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">{copy.results(total)}</p>
            <Link href={`/${lang}/learn`} className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-300">
              {copy.library}
            </Link>
          </div>

          {data.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-night-700 dark:bg-night-800">
              <p className="mb-4 text-5xl">📭</p>
              <h2 className="text-xl font-semibold text-slate-700 dark:text-white">{copy.emptyTitle}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{copy.emptyHint}</p>
            </div>
          )}

          {total_pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
              {currentPage > 1 && (
                <Link href={pageHref(currentPage - 1)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-primary-400 dark:border-night-700 dark:bg-night-800 dark:text-slate-200">
                  {copy.previous}
                </Link>
              )}
              <span className="text-sm text-slate-500 dark:text-slate-400">{currentPage} / {total_pages}</span>
              {currentPage < total_pages && (
                <Link href={pageHref(currentPage + 1)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-primary-400 dark:border-night-700 dark:bg-night-800 dark:text-slate-200">
                  {copy.next}
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>
      <Footer lang={currentLang} />
    </>
  );
}
