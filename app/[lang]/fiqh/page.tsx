import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentCard from '@/components/learn/ContentCard';
import { getPublishedContent } from '@/lib/learn/queries';
import { isValidLang, type Lang } from '@/lib/i18n';
import type { Madhhab } from '@/lib/types/content';
import { PageHero, renderDesignIcon } from '@/components/ui';

export const dynamic = 'force-dynamic';

const MADHABS: { value: Madhhab; ar: string; en: string }[] = [
  { value: 'general', ar: 'عام', en: 'General' },
  { value: 'hanafi', ar: 'حنفي', en: 'Hanafi' },
  { value: 'maliki', ar: 'مالكي', en: 'Maliki' },
  { value: 'shafii', ar: 'شافعي', en: 'Shafi’i' },
  { value: 'hanbali', ar: 'حنبلي', en: 'Hanbali' },
  { value: 'zahiri', ar: 'ظاهري', en: 'Zahiri' },
  { value: 'jafari', ar: 'جعفري', en: 'Ja’fari' },
];

const COPY: Record<string, any> = {
  ar: {
    title: 'الفقه والفتاوى',
    subtitle: 'محتوى فقهي منشور بعد المراجعة العلمية، مع توضيح المذهب عند توفره.',
    searchPlaceholder: 'ابحث في عناوين الفتاوى...',
    search: 'بحث',
    madhhab: 'المذهب',
    all: 'كل المذاهب',
    results: (count: number) => `${count} نتيجة`,
    emptyTitle: 'لا توجد فتاوى منشورة مطابقة',
    emptyHint: 'سيظهر المحتوى هنا بعد إنشائه ومراجعته واعتماده من لوحة الإدارة.',
    notice: 'هذه الصفحة للتعلم العام وليست بديلًا عن سؤال عالم مؤهل في النوازل الخاصة.',
    library: 'العودة إلى المكتبة',
  },
  en: {
    title: 'Fiqh and Fatwas',
    subtitle: 'Reviewed fiqh content with the madhhab shown when available.',
    searchPlaceholder: 'Search fatwa titles...',
    search: 'Search',
    madhhab: 'Madhhab',
    all: 'All madhhabs',
    results: (count: number) => `${count} results`,
    emptyTitle: 'No matching published fatwas',
    emptyHint: 'Content will appear after it is created, reviewed, and approved in the admin panel.',
    notice: 'This page is for general learning; consult a qualified scholar for personal cases.',
    library: 'Back to library',
  },
} as const;

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string; madhhab?: string }>;
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

export default async function FiqhPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  const currentLang = lang as Lang;
  const copy = COPY[currentLang];
  const sp = await searchParams;
  const query = typeof sp.q === 'string' ? sp.q.trim().slice(0, 120) : '';
  const selectedMadhhab = MADHABS.some((item) => item.value === sp.madhhab)
    ? (sp.madhhab as Madhhab)
    : undefined;
  const { data, total } = await getPublishedContent(lang, {
    type: 'fatwa',
    madhhab: selectedMadhhab,
    search: query || undefined,
    page: 1,
    per_page: 24,
  });

  const linkForMadhhab = (madhhab?: Madhhab) => {
    const search = new URLSearchParams();
    if (query) search.set('q', query);
    if (madhhab) search.set('madhhab', madhhab);
    const suffix = search.toString();
    return `/${lang}/fiqh${suffix ? `?${suffix}` : ''}`;
  };

  return (
    <>
      <Header lang={currentLang} />
      <main id="main-content" tabIndex={-1} dir={currentLang === 'ar' ? 'rtl' : 'ltr'} className="site-page-shell">
        <PageHero
          icon="⚖️"
          title={copy.title}
          subtitle={copy.subtitle}
          crumbs={[
            { label: currentLang === 'ar' ? 'الرئيسية' : 'Home', href: `/${lang}` },
            { label: copy.title },
          ]}
        />

        <div className="container-page py-8">
          <form className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row" method="get">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={copy.searchPlaceholder}
              className="input-islamic min-w-0 flex-1"
            />
            {selectedMadhhab && <input type="hidden" name="madhhab" value={selectedMadhhab} />}
            <button type="submit" className="btn-gold">
              {copy.search}
            </button>
          </form>

          <div className="card mx-auto mt-5 max-w-3xl border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-900 shadow-sm dark:border-primary-900/50 dark:bg-primary-950/30 dark:text-primary-100">
            <span aria-hidden="true" className="me-1 inline-flex align-middle">{renderDesignIcon("🧭", 18)}</span>{copy.notice}
          </div>

          <div className="card mt-8 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 dark:text-white">{copy.madhhab}</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">{copy.results(total)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={linkForMadhhab()} className={!selectedMadhhab ? 'badge-primary bg-primary-700 text-white' : 'badge-primary'}>
                {copy.all}
              </Link>
              {MADHABS.map((item) => (
                <Link key={item.value} href={linkForMadhhab(item.value)} className={selectedMadhhab === item.value ? 'badge-primary bg-primary-700 text-white' : 'badge-primary'}>
                  {currentLang === 'ar' ? item.ar : item.en}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6">
            {data.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((item) => (
                  <ContentCard key={item.id} lang={lang} type={item.content_type} slug={item.slug} title={item.title} summary={item.summary} published_at={item.published_at} />
                ))}
              </div>
            ) : (
              <div className="card border-dashed px-6 py-16 text-center">
                <p aria-hidden="true" className="mb-4 inline-flex">{renderDesignIcon("📭", 48)}</p>
                <h2 className="text-xl font-semibold text-slate-700 dark:text-white">{copy.emptyTitle}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{copy.emptyHint}</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link href={`/${lang}/learn`} className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-300">{copy.library}</Link>
          </div>
        </div>
      </main>
      <Footer lang={currentLang} />
    </>
  );
}

