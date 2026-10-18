import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentCard from '@/components/learn/ContentCard';
import { PageHero } from '@/components/ui';
import { getPublicList } from '@/lib/learn/public';
import { getSiteSettings } from '@/lib/content';
import { decodeParam } from '@/lib/params';
import { isValidLang, type Lang } from '@/lib/i18n';
import { buildPageControls, pageGate } from '@/lib/page-sections';
import { getReligionEntry, localized, METHODOLOGY_POINTS } from '@/lib/religions';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  return ['ar', 'en'].flatMap((lang) =>
    ['christianity', 'judaism', 'hinduism', 'buddhism', 'atheism'].map((slug) => ({ lang, slug }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang, slug: rawSlug } = await params;
  const lang = isValidLang(rawLang) ? (rawLang as Lang) : 'ar';
  const entry = getReligionEntry(decodeParam(rawSlug));
  if (!entry) return { title: 'غير موجود' };
  return {
    title: `${localized(entry.title, lang)} | الأديان والفكر`,
    description: localized(entry.summary, lang),
    alternates: { canonical: `/${lang}/religions/${entry.slug}` },
  };
}

export default async function ReligionDetailPage({ params }: PageProps) {
  const { lang: rawLang, slug: rawSlug } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  const entry = getReligionEntry(decodeParam(rawSlug));
  if (!entry) notFound();
  const settings = await getSiteSettings();
  const gate = pageGate(buildPageControls(settings), 'religions-detail', lang);
  if (!gate.pageVisible) notFound();

  const materials = (
    await Promise.all(
      ['article', 'research', 'faq'].map((type) =>
        getPublicList(lang, type, { taxonomySlug: entry.slug, taxonomyKind: 'religion', limit: 60 })
      )
    )
  ).flat().filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);

  const copy = lang === 'ar'
    ? {
        home: 'الرئيسية', back: 'الأديان والفكر', method: 'ضوابط النشر في هذا القسم',
        sourceNote: 'هذه الصفحة تعرض فقط المواد المنشورة من المكتبة الموحدة. أضف المادة من لوحة التحكم، واربطها بتصنيف هذا الموضوع، ثم مرّرها بالمراجعة قبل النشر.',
        published: 'المواد المنشورة', empty: 'لا توجد مواد منشورة لهذا الموضوع بعد.',
        emptyHint: 'يمكن لمدير المحتوى إضافة بحث أو مقال أو سؤال شائع من لوحة التحكم بعد تجهيز المصادر.',
        addQuestion: 'اسأل سؤالًا', compare: 'افتح المقارنة',
      }
    : {
        home: 'Home', back: 'Religions & Thought', method: 'Publishing standards for this topic',
        sourceNote: 'This page shows only materials published from the unified library. Add a material in the dashboard, link its topic taxonomy, and review it before publishing.',
        published: 'Published materials', empty: 'No published material for this topic yet.',
        emptyHint: 'A content manager can add a research item, article, or FAQ from the dashboard after preparing sources.',
        addQuestion: 'Ask a question', compare: 'Open comparison',
      };

  return (
    <>
      <Header lang={lang} />
      <main dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-cream-dark dark:bg-night-900">
        {gate.visible('k0') && <PageHero
          icon={entry.icon}
          title={localized(entry.title, lang)}
          subtitle={localized(entry.summary, lang)}
          crumbs={[{ label: copy.home, href: `/${lang}` }, { label: copy.back, href: `/${lang}/religions` }, { label: localized(entry.title, lang) }]}
        />}

        <div className="container-page space-y-8 py-10 md:py-14">
          {gate.visible('k1') && <section className="rounded-2xl border border-gold-200 bg-gold-50/70 p-5 text-sm leading-8 text-gold-900 dark:border-gold-900/40 dark:bg-gold-950/20 dark:text-gold-100">
            <p className="font-black">{copy.method}</p>
            <p className="mt-2">{copy.sourceNote}</p>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {METHODOLOGY_POINTS.slice(0, 4).map((point) => <li key={point.ar}>• {localized(point, lang)}</li>)}
            </ul>
          </section>}

          {gate.visible('k2') && <div className="flex flex-wrap gap-3">
            <Link href={`/${lang}/religions/comparison`} className="btn-outline">{copy.compare}</Link>
            <Link href={`/${lang}/contact`} className="btn-primary">{copy.addQuestion}</Link>
          </div>}

          {gate.visible('k3') && <section aria-labelledby="religion-materials-title">
            <h2 id="religion-materials-title" className="section-title mb-6">{copy.published}</h2>
            {materials.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {materials.map((item) => (
                  <ContentCard key={item.id} lang={lang} type={item.content_type} slug={item.slug} title={item.title} summary={item.summary} published_at={item.published_at} isFallback={item.isFallback} />
                ))}
              </div>
            ) : (
              <div className="card border-dashed p-8 text-center">
                <p className="text-lg font-black text-primary-950 dark:text-white">{copy.empty}</p>
                <p className="mt-2 text-sm leading-7 text-stone-500 dark:text-stone-300">{copy.emptyHint}</p>
              </div>
            )}
          </section>}
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
