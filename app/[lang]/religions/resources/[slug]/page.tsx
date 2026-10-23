import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentCard from '@/components/learn/ContentCard';
import { PageHero } from '@/components/ui';
import { getSiteSettings } from '@/lib/content';
import { getPublicList } from '@/lib/learn/public';
import { decodeParam } from '@/lib/params';
import { isValidLang, type Lang } from '@/lib/i18n';
import { buildPageControls, pageGate } from '@/lib/page-sections';
import { getReligionResource, localized } from '@/lib/religions';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang, slug: rawSlug } = await params;
  const lang = isValidLang(rawLang) ? (rawLang as Lang) : 'ar';
  const resource = getReligionResource(decodeParam(rawSlug));
  const section = lang === 'ar' ? 'الأديان والفكر' : 'Religions & Thought';
  return resource
    ? {
        title: `${localized(resource.title, lang)} | ${section}`,
        description: localized(resource.summary, lang),
        alternates: { canonical: `/${lang}/religions/resources/${resource.slug}` },
      }
    : { title: lang === 'ar' ? 'غير موجود' : 'Not found' };
}

export default async function ReligionsResourcePage({ params }: PageProps) {
  const { lang: rawLang, slug: rawSlug } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  const resource = getReligionResource(decodeParam(rawSlug));
  if (!resource) notFound();
  const settings = await getSiteSettings();
  const gate = pageGate(buildPageControls(settings), 'religions-resource', lang);
  if (!gate.pageVisible) notFound();

  const materials = (
    await Promise.all(
      ['article', 'research', 'faq'].map((type) =>
        getPublicList(lang, type, { taxonomySlug: resource.slug, taxonomyKind: 'religion_resource', limit: 60 })
      )
    )
  ).flat().filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);

  const isArabic = lang === 'ar';
  const copy = isArabic
    ? {
        home: 'الرئيسية', section: 'الأديان والفكر', materials: 'المواد المنشورة', empty: 'لا توجد مواد منشورة هنا بعد.', hint: 'أضف المواد من لوحة التحكم مع تصنيفها بالمحور المناسب، ثم مرّرها بالمراجعة قبل النشر.', contact: 'تواصل مع داعية',
      }
    : {
        home: 'Home', section: 'Religions & Thought', materials: 'Published materials', empty: 'No published materials here yet.', hint: 'Add material from the dashboard, tag it with the relevant resource taxonomy, and review it before publishing.', contact: 'Talk to a daee',
      };

  return (
    <>
      <Header lang={lang} />
      <main id="main-content" tabIndex={-1} dir={isArabic ? 'rtl' : 'ltr'} className="site-page-shell">
        {gate.visible('k0') && <PageHero icon={resource.icon} title={localized(resource.title, lang)} subtitle={localized(resource.summary, lang)} crumbs={[{ label: copy.home, href: `/${lang}` }, { label: copy.section, href: `/${lang}/religions` }, { label: localized(resource.title, lang) }]} />}
        <div className="container-page space-y-8 py-10 md:py-14">
          {gate.visible('k1') && <section aria-labelledby="resource-materials-title">
            <h2 id="resource-materials-title" className="section-title mb-6">{copy.materials}</h2>
            {materials.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{materials.map((item) => <ContentCard key={item.id} lang={lang} type={item.content_type} slug={item.slug} title={item.title} summary={item.summary} published_at={item.published_at} isFallback={item.isFallback} />)}</div>
            ) : (
              <div className="card border-dashed p-8 text-center"><p className="font-black text-primary-950 dark:text-white">{copy.empty}</p><p className="mt-2 text-sm text-stone-500 dark:text-stone-300">{copy.hint}</p></div>
            )}
          </section>}
          {gate.visible('k2') && <>
            <div className="rounded-2xl border border-primary-200 bg-primary-50/70 p-5 text-sm leading-8 text-primary-900 dark:border-night-700 dark:bg-night-800 dark:text-primary-100">{copy.hint}</div>
            <Link href={`/${lang}/contact`} className="btn-primary inline-flex">{copy.contact}</Link>
          </>}
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
