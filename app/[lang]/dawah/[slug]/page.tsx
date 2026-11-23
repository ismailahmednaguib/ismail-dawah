import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { PageHero } from '@/components/ui';
import { isValidLang, languages, type Lang } from '@/lib/i18n';
import { getDawahPortalPage, getDawahPortalSlugs } from '@/lib/dawah-portal';
import { SITE_NAME, SITE_NAME_EN } from '@/lib/site';
import AskMuslimForm from '@/components/dawah/AskMuslimForm';

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export function generateStaticParams() {
  return languages.flatMap((lang) => getDawahPortalSlugs().map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isValidLang(lang)) return {};
  const page = getDawahPortalPage(slug);
  if (!page) return {};
  const current = lang as Lang;
  const title = page.title[current];
  const description = page.summary[current];
  return {
    title,
    description,
    alternates: {
      canonical: `/${current}/dawah/${slug}`,
      languages: {
        ar: `/ar/dawah/${slug}`,
        en: `/en/dawah/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      siteName: current === 'ar' ? SITE_NAME : SITE_NAME_EN,
      type: 'article',
      url: `/${current}/dawah/${slug}`,
      images: [{ url: `/og/og-${current}.png`, alt: title }],
    },
  };
}

export default async function DawahPortalPage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isValidLang(lang)) notFound();
  const current = lang as Lang;
  const page = getDawahPortalPage(slug);
  if (!page) notFound();

  const title = page.title[current];
  const summary = page.summary[current];
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ismailahmednaguib.vercel.app').replace(/\/+$/, '');
  const pageUrl = `${siteUrl}/${current}/dawah/${slug}`;
  const jsonLd = {
    '@type': 'Article',
    '@id': pageUrl,
    headline: title,
    description: summary,
    url: pageUrl,
    inLanguage: current,
    isAccessibleForFree: true,
    publisher: {
      '@type': 'Organization',
      name: current === 'ar' ? SITE_NAME : SITE_NAME_EN,
      url: siteUrl,
    },
  };
  const breadcrumbJsonLd = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: current === 'ar' ? 'الرئيسية' : 'Home', item: `${siteUrl}/${current}` },
      { '@type': 'ListItem', position: 2, name: current === 'ar' ? 'بوابة غير المسلمين' : 'Non-Muslim Portal', item: `${siteUrl}/${current}/dawah` },
      { '@type': 'ListItem', position: 3, name: title, item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd data={[jsonLd, breadcrumbJsonLd]} />
      <Header lang={current} />
      <main id="main-content" tabIndex={-1} dir={current === 'ar' ? 'rtl' : 'ltr'} className="site-page-shell">
        <PageHero
          badge={current === 'ar' ? 'بوابة غير المسلمين' : 'Non-Muslim Portal'}
          title={title}
          subtitle={summary}
          crumbs={[
            { label: current === 'ar' ? 'الرئيسية' : 'Home', href: `/${current}` },
            { label: current === 'ar' ? 'بوابة غير المسلمين' : 'Non-Muslim Portal', href: `/${current}/dawah` },
            { label: title },
          ]}
        />

        <article className="container-page max-w-4xl py-10 md:py-14">
          <p className="mb-10 text-lg leading-loose text-slate-700 dark:text-slate-200">{page.intro[current]}</p>

          <div className="space-y-8">
            {page.sections[current].map((section) => (
              <section key={section.heading}>
                <h2 className="mb-3 text-2xl font-black text-primary-950 dark:text-white">{section.heading}</h2>
                <p className="leading-loose text-slate-700 dark:text-slate-200">{section.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-12 border-t border-primary-100 pt-8 dark:border-night-700" aria-labelledby="dawah-references-title">
            <h2 id="dawah-references-title" className="mb-4 text-xl font-black text-primary-950 dark:text-white">
              {current === 'ar' ? 'مراجع للقراءة' : 'References for further reading'}
            </h2>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {page.references[current].map((reference) => (
                <li key={reference.label}>
                  {reference.href ? (
                    <Link href={`/${current}${reference.href}`} className="font-semibold text-primary-700 underline-offset-4 hover:underline dark:text-primary-300">
                      {reference.label}
                    </Link>
                  ) : reference.label}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={`/${current}/contact?subject=${encodeURIComponent(title)}&page=${encodeURIComponent(`/${current}/dawah/${slug}`)}`} className="btn-primary">
              {current === 'ar' ? 'اسأل أو صحّح معلومة' : 'Ask or report an issue'}
            </Link>
            <Link href={`/${current}/dawah`} className="btn-outline">
              {current === 'ar' ? 'العودة إلى البوابة' : 'Back to the portal'}
            </Link>
          </div>

          {page.related.length > 0 && (
            <section className="mt-12 border-t border-primary-100 pt-8 dark:border-night-700" aria-labelledby="dawah-related-title">
              <h2 id="dawah-related-title" className="mb-4 text-xl font-black text-primary-950 dark:text-white">
                {current === 'ar' ? 'صفحات ذات صلة' : 'Related pages'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {page.related.map((relatedSlug) => {
                  const related = getDawahPortalPage(relatedSlug);
                  if (!related) return null;
                  return (
                    <Link key={relatedSlug} href={`/${current}/dawah/${relatedSlug}`} className="rounded-full border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-800 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-200 dark:hover:bg-primary-950/30">
                      {related.title[current]}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {slug === 'ask-muslim' && <AskMuslimForm lang={current} pageSlug={slug} />}
        </article>
      </main>
      <Footer lang={current} />
    </>
  );
}
