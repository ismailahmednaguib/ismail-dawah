import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageHero } from '@/components/ui';
import { getSiteSettings } from '@/lib/content';
import { getPublicList } from '@/lib/learn/public';
import { isValidLang, type Lang } from '@/lib/i18n';
import { buildPageControls, pageGate } from '@/lib/page-sections';
import { COMPARISON_DIMENSIONS, localized, RELIGION_ENTRIES } from '@/lib/religions';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const current = isValidLang(lang) ? (lang as Lang) : 'ar';
  return { title: current === 'ar' ? 'جداول المقارنة | الأديان والفكر' : 'Comparison Tables | Religions & Thought' };
}

export default async function ReligionsComparisonPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  const current = lang as Lang;
  const isArabic = current === 'ar';
  const settings = await getSiteSettings();
  const gate = pageGate(buildPageControls(settings), 'religions-comparison', current);
  if (!gate.pageVisible) notFound();

  const counts = await Promise.all(
    RELIGION_ENTRIES.map(async (entry) => {
      try {
        const [research, articles, faqs] = await Promise.all([
          getPublicList(current, 'research', { taxonomySlug: entry.slug, taxonomyKind: 'religion', limit: 50 }),
          getPublicList(current, 'article', { taxonomySlug: entry.slug, taxonomyKind: 'religion', limit: 50 }),
          getPublicList(current, 'faq', { taxonomySlug: entry.slug, taxonomyKind: 'religion', limit: 50 }),
        ]);
        return research.length + articles.length + faqs.length;
      } catch {
        return 0;
      }
    })
  );

  return (
    <>
      <Header lang={current} />
      <main dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-cream-dark dark:bg-night-900">
        {gate.visible('k0') && <PageHero
          icon="⚖️"
          title={isArabic ? 'جداول المقارنة' : 'Comparison Tables'}
          subtitle={isArabic ? 'قالب بحثي ثابت يساعد على المقارنة من خلال مصادر منشورة ومراجعة.' : 'A stable research framework for comparing published and reviewed material.'}
          crumbs={[{ label: isArabic ? 'الرئيسية' : 'Home', href: `/${current}` }, { label: isArabic ? 'الأديان والفكر' : 'Religions & Thought', href: `/${current}/religions` }, { label: isArabic ? 'المقارنة' : 'Comparison' }]}
        />}
        <div className="container-page py-10 md:py-14">
          {gate.visible('k2') && <div className="mb-8 rounded-2xl border border-gold-200 bg-gold-50/70 p-5 text-sm leading-8 text-gold-900 dark:border-gold-900/40 dark:bg-gold-950/20 dark:text-gold-100">
            {isArabic ? 'لا تُملأ الخانات باستنتاجات غير موثقة. كل محور يرتبط بمادة من المكتبة، ويظهر بعد المراجعة والاعتماد.' : 'Cells are not filled with uncited claims. Each dimension is linked to library material and appears after review and approval.'}
          </div>}
          {gate.visible('k1') && <div className="overflow-x-auto rounded-2xl border border-cream-200 bg-white shadow-sm dark:border-night-700 dark:bg-night-800">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-primary-950 text-white">
                <tr>
                  <th className="p-4 text-right">{isArabic ? 'المحور' : 'Dimension'}</th>
                  {RELIGION_ENTRIES.map((entry, index) => <th key={entry.slug} className="p-4 text-right">{entry.icon} {localized(entry.title, current)}<span className="mt-1 block text-xs font-normal text-primary-200">{counts[index]} {isArabic ? 'مادة' : 'materials'}</span></th>)}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DIMENSIONS.map((dimension) => (
                  <tr key={dimension.ar} className="border-t border-cream-200 dark:border-night-700">
                    <th className="p-4 text-right font-black text-primary-950 dark:text-white">{localized(dimension, current)}</th>
                    {RELIGION_ENTRIES.map((entry) => (
                      <td key={`${dimension.ar}-${entry.slug}`} className="p-4 text-slate-500 dark:text-slate-300">
                        <Link href={`/${current}/religions/${entry.slug}`} className="font-bold text-primary-700 hover:underline dark:text-primary-300">{isArabic ? 'فتح المصادر' : 'Open sources'} ←</Link>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        </div>
      </main>
      <Footer lang={current} />
    </>
  );
}
