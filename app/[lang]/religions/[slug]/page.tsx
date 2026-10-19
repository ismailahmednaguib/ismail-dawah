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
import {
  getReligionEntry,
  localized,
  METHODOLOGY_POINTS,
  RELIGION_PAGE_SECTIONS,
} from '@/lib/religions';

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
    title: `${localized(entry.title, lang)} | ${lang === 'ar' ? 'الأديان والفكر' : 'Religions & Thought'}`,
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
        inPreparation: 'قيد الإعداد والمراجعة',
        outlineTitle: 'ما ستجده في هذه الصفحة عند اكتمالها',
        outlineHint: 'هذا إطار عمل معلن، وليس مادة منشورة. لن يُعرض أي محتوى قبل توثيق مصدره ومراجعته.',
        reviewPolicy: 'كل مادة تُنشر هنا تحمل مصادرها وتاريخ مراجعتها واسم المراجع.',
      }
    : {
        home: 'Home', back: 'Religions & Thought', method: 'Publishing standards for this topic',
        sourceNote: 'This page shows only materials published from the unified library. Add a material in the dashboard, link its topic taxonomy, and review it before publishing.',
        published: 'Published materials', empty: 'No published material for this topic yet.',
        emptyHint: 'A content manager can add a research item, article, or FAQ from the dashboard after preparing sources.',
        addQuestion: 'Ask a question', compare: 'Open comparison',
        inPreparation: 'In preparation and review',
        outlineTitle: 'What this page will cover once complete',
        outlineHint: 'This is a published outline, not published material. Nothing appears here before its sources and review are complete.',
        reviewPolicy: 'Every published item carries its references, review date, and reviewer name.',
      };

  return (
    <>
      <Header lang={lang} />
      <main id="main-content" tabIndex={-1} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-cream-dark dark:bg-night-900">
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
              <div className="space-y-6">
                <div className="card border-dashed p-8 text-center">
                  <span className="badge-gold">⏳ {copy.inPreparation}</span>
                  <p className="mt-4 text-lg font-black text-primary-950 dark:text-white">{copy.empty}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-500 dark:text-stone-300">{copy.emptyHint}</p>
                </div>

                <div className="card p-6 md:p-8">
                  <h3 className="text-xl font-black text-primary-950 dark:text-white">{copy.outlineTitle}</h3>
                  <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">{copy.outlineHint}</p>
                  <ol className="mt-5 grid gap-3 md:grid-cols-2">
                    {RELIGION_PAGE_SECTIONS.map((section, index) => (
                      <li
                        key={section.key}
                        className="rounded-2xl border border-cream-200 bg-cream-50/70 p-4 dark:border-night-700 dark:bg-night-800"
                      >
                        <p className="flex items-center gap-2 font-black text-primary-950 dark:text-white">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs text-primary-800 dark:bg-primary-900/50 dark:text-primary-200">
                            {index + 1}
                          </span>
                          {localized(section.title, lang)}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">
                          {localized(section.hint, lang)}
                        </p>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-5 text-xs font-bold leading-6 text-gold-700 dark:text-gold-300">
                    {copy.reviewPolicy}
                  </p>
                </div>
              </div>
            )}
          </section>}
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
