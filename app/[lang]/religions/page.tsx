import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageHero, renderDesignIcon } from '@/components/ui';
import { getPublicList } from '@/lib/learn/public';
import { getSiteSettings } from '@/lib/content';
import { isValidLang, type Lang } from '@/lib/i18n';
import { buildPageControls, pageGate } from '@/lib/page-sections';
import {
  localized,
  METHODOLOGY_POINTS,
  RELIGION_ENTRIES,
  RELIGION_RESOURCES,
} from '@/lib/religions';

export const dynamic = 'force-dynamic';

const COPY = {
  ar: {
    title: 'الأديان والفكر',
    subtitle: 'مساحة دعوية معرفية تقوم على الإنصاف والتوثيق والحوار بالحسنى.',
    methodology: 'منهج القسم',
    methodologyIntro: 'لا نعرض مادة مقارنة أو ردًا فكريًا إلا بعد تحديد مصدره، وسياقه، وحالة مراجعته.',
    religions: 'أديان وأفكار رئيسية',
    compare: 'المقارنة المنهجية',
    compareDesc: 'محاور ثابتة تساعد القارئ على المقارنة دون اختزال أو تعميم.',
    explore: 'استكشف القسم',
    materials: 'مادة منشورة',
    noMaterials: 'تُضاف المواد الموثقة من لوحة التحكم بعد مراجعتها.',
    inPreparation: 'قيد الإعداد والمراجعة',
    resourcesDesc: 'بوابات مرتبطة بالقسم، تُنشر مادتها بعد التوثيق والمراجعة.',
    resources: 'بوابات إضافية',
    contact: 'تواصل مع داعية',
  },
  en: {
    title: 'Religions & Thought',
    subtitle: 'A dawah and knowledge space built on fairness, sourcing, and gracious dialogue.',
    methodology: 'Our method',
    methodologyIntro: 'Every comparative or intellectual response should state its source, context, and review status.',
    religions: 'Core religions and ideas',
    compare: 'Methodical comparison',
    compareDesc: 'Stable dimensions that help readers compare without reduction or generalization.',
    explore: 'Explore section',
    materials: 'published materials',
    noMaterials: 'Sourced material is added from the dashboard after review.',
    inPreparation: 'In preparation and review',
    resourcesDesc: 'Related gateways whose material is published after sourcing and review.',
    resources: 'More resources',
    contact: 'Talk to a daee',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const current = isValidLang(lang) ? (lang as Lang) : 'ar';
  const copy = COPY[current];
  return {
    title: copy.title,
    description: copy.subtitle,
    alternates: { canonical: `/${current}/religions` },
  };
}

async function getMaterialCount(lang: Lang, slug: string): Promise<number> {
  try {
    const lists = await Promise.all(
      ['article', 'research', 'faq'].map((type) =>
        getPublicList(lang, type, { taxonomySlug: slug, taxonomyKind: 'religion', limit: 50 })
      )
    );
    return new Set(lists.flat().map((item) => item.id)).size;
  } catch {
    return 0;
  }
}

export default async function ReligionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  const currentLang = lang as Lang;
  const copy = COPY[currentLang];
  const settings = await getSiteSettings();
  const gate = pageGate(buildPageControls(settings), 'religions', currentLang);
  if (!gate.pageVisible) notFound();
  const counts = await Promise.all(RELIGION_ENTRIES.map((entry) => getMaterialCount(currentLang, entry.slug)));

  return (
    <>
      <Header lang={currentLang} />
      <main id="main-content" tabIndex={-1} dir={currentLang === 'ar' ? 'rtl' : 'ltr'} className="site-page-shell">
        {gate.visible('k0') && <PageHero
          icon="◈"
          title={copy.title}
          subtitle={copy.subtitle}
          crumbs={[{ label: currentLang === 'ar' ? 'الرئيسية' : 'Home', href: `/${currentLang}` }, { label: copy.title }]}
        />}

        <div className="container-page space-y-14 py-12 md:py-16">
          {gate.visible('k1') && <section className="card relative overflow-hidden p-6 md:p-9" aria-labelledby="religions-methodology-title">
            <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <span className="badge-gold"><span aria-hidden="true" className="me-1 inline-flex align-middle">{renderDesignIcon("✦", 16)}</span>{copy.methodology}</span>
                <h2 id="religions-methodology-title" className="mt-4 text-2xl font-black text-primary-950 dark:text-white">{copy.methodology}</h2>
                <p className="mt-3 leading-8 text-slate-600 dark:text-slate-300">{copy.methodologyIntro}</p>
                <Link href={`/${currentLang}/religions/methodology`} className="btn-primary mt-5 inline-flex">{copy.explore} ←</Link>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {METHODOLOGY_POINTS.map((point) => (
                  <li key={point.ar} className="flex items-start gap-3 rounded-2xl border border-primary-100 bg-primary-50/60 p-4 text-sm leading-7 text-primary-900 dark:border-night-700 dark:bg-night-800 dark:text-primary-100">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold-500" />
                    <span>{localized(point, currentLang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>}

          {gate.visible('k2') && <section aria-labelledby="religions-list-title">
            <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h2 id="religions-list-title" className="section-title mb-1">{copy.religions}</h2>
                <p className="section-subtitle">{copy.methodologyIntro}</p>
              </div>
              <Link href={`/${currentLang}/religions/comparison`} className="btn-outline w-fit">{copy.compare}</Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {RELIGION_ENTRIES.map((entry, index) => (
                <Link key={entry.slug} href={`/${currentLang}/religions/${entry.slug}`} className="card card-interactive group p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/40" aria-hidden="true">{renderDesignIcon(entry.icon, 30)}</span>
                    {counts[index] > 0 ? (
                      <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800 dark:bg-primary-900/50 dark:text-primary-200">
                        {counts[index]} {copy.materials}
                      </span>
                    ) : (
                      <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-bold text-gold-800 dark:bg-gold-900/40 dark:text-gold-200">
                        ⏳ {copy.inPreparation}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 text-xl font-black text-primary-950 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">{localized(entry.title, currentLang)}</h3>
                  <p className="mt-3 min-h-20 leading-7 text-slate-600 dark:text-slate-300">{localized(entry.summary, currentLang)}</p>
                  <p className="mt-4 text-xs font-bold leading-6 text-gold-700 dark:text-gold-300">{localized(entry.scope, currentLang)}</p>
                  <span className="mt-5 inline-flex text-sm font-black text-primary-700 dark:text-primary-300">{copy.explore} ←</span>
                </Link>
              ))}
            </div>
          </section>}

          {gate.visible('k3') && <section aria-labelledby="religions-resources-title">
            <div className="mb-6">
              <h2 id="religions-resources-title" className="section-title mb-1">{copy.resources}</h2>
              <p className="section-subtitle">{copy.resourcesDesc}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {RELIGION_RESOURCES.map((resource) => (
                <Link key={resource.slug} href={`/${currentLang}/religions/resources/${resource.slug}`} className="card card-interactive p-5">
                  <span aria-hidden="true">{renderDesignIcon(resource.icon, 30)}</span>
                  <h3 className="mt-3 font-black text-primary-950 dark:text-white">{localized(resource.title, currentLang)}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{localized(resource.summary, currentLang)}</p>
                </Link>
              ))}
            </div>
          </section>}

          {gate.visible('k4') && <section className="rounded-3xl bg-primary-950 p-7 text-white md:p-10">
            <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black text-gold-200">{copy.contact}</h2>
                <p className="mt-2 max-w-2xl leading-7 text-primary-100">{copy.methodologyIntro}</p>
              </div>
              <Link href={`/${currentLang}/contact`} className="btn-gold shrink-0">{copy.contact}</Link>
            </div>
          </section>}
        </div>
      </main>
      <Footer lang={currentLang} />
    </>
  );
}
