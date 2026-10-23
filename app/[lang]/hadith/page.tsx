import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentCard from '@/components/learn/ContentCard';
import { getPublishedContent } from '@/lib/learn/queries';
import { isValidLang, type Lang } from '@/lib/i18n';
import { PageHero, renderDesignIcon } from '@/components/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === 'ar';

  return {
    title: isAr ? 'الحديث الشريف' : 'Hadith',
    description: isAr
      ? 'تصفح محتوى الحديث الشريف الموثق في منصة اكتشف الإسلام.'
      : 'Browse hadith content with its source and grade on the Discover Islam platform.',
  };
}

const COPY: Record<string, any> = {
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
      <main id="main-content" tabIndex={-1}
        dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
        className="site-page-shell"
      >
        <PageHero
          icon="💬"
          title={copy.title}
          subtitle={copy.subtitle}
          crumbs={[
            { label: currentLang === 'ar' ? 'الرئيسية' : 'Home', href: `/${lang}` },
            { label: copy.title },
          ]}
        />

        <div className="container-page py-8">
          <form className="mx-auto flex max-w-3xl gap-2" method="get">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={copy.searchPlaceholder}
              className="input-islamic min-w-0 flex-1"
            />
            <button
              type="submit"
              className="btn-gold"
            >
              {copy.search}
            </button>
          </form>

          <div className="card mx-auto mt-5 max-w-3xl border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-900 dark:border-primary-900/50 dark:bg-primary-950/30 dark:text-primary-100">
            <span aria-hidden="true" className="me-1 inline-flex align-middle">{renderDesignIcon("📚", 20)}</span>{copy.notice}
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
            <div className="card border-dashed px-6 py-16 text-center">
              <p aria-hidden="true" className="mb-4 inline-flex">{renderDesignIcon("📭", 48)}</p>
              <h2 className="text-xl font-semibold text-slate-700 dark:text-white">{copy.emptyTitle}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{copy.emptyHint}</p>
            </div>
          )}

          {total_pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
              {currentPage > 1 && (
                <Link href={pageHref(currentPage - 1)} className="btn-outline">
                  {copy.previous}
                </Link>
              )}
              <span className="text-sm text-slate-500 dark:text-slate-400">{currentPage} / {total_pages}</span>
              {currentPage < total_pages && (
                <Link href={pageHref(currentPage + 1)} className="btn-outline">
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

