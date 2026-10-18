import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageHero } from '@/components/ui';
import { getSiteSettings } from '@/lib/content';
import { isValidLang, type Lang } from '@/lib/i18n';
import { buildPageControls, pageGate } from '@/lib/page-sections';
import { localized, METHODOLOGY_POINTS } from '@/lib/religions';

export const dynamic = 'force-dynamic';

const COPY = {
  ar: {
    title: 'منهج الأديان والفكر',
    subtitle: 'قواعد تحريرية واضحة قبل نشر أي مادة مقارنة أو رد فكري.',
    intro: 'القسم لا يهدف إلى السخرية من أحد أو اختزال أتباع دين في صورة واحدة. الغرض هو الفهم الدقيق، ثم عرض التصور الإسلامي بأمانة ورفق.',
    review: 'المراجعة',
    reviewText: 'المادة الحساسة تمر بالمراجعة العلمية من لوحة التحكم، ولا تُعرض للعامة قبل اعتمادها وإضافة مراجعها.',
    back: 'العودة إلى القسم',
  },
  en: {
    title: 'Religions & Thought Method',
    subtitle: 'Clear editorial rules for comparative and intellectual material.',
    intro: 'This section is not built on ridicule or reducing people to stereotypes. It aims for accurate understanding and an honest, gracious presentation of the Islamic view.',
    review: 'Review',
    reviewText: 'Sensitive material goes through scholarly review in the dashboard and is not shown publicly until approved with references.',
    back: 'Back to the section',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const current = isValidLang(lang) ? (lang as Lang) : 'ar';
  return { title: `${COPY[current].title} | منصة إسماعيل أحمد نجيب`, description: COPY[current].subtitle };
}

export default async function ReligionsMethodologyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  const current = lang as Lang;
  const copy = COPY[current];
  const settings = await getSiteSettings();
  const gate = pageGate(buildPageControls(settings), 'religions-methodology', current);
  if (!gate.pageVisible) notFound();

  return (
    <>
      <Header lang={current} />
      <main dir={current === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-cream-dark dark:bg-night-900">
        {gate.visible('k0') && <PageHero icon="📜" title={copy.title} subtitle={copy.subtitle} crumbs={[{ label: current === 'ar' ? 'الرئيسية' : 'Home', href: `/${current}` }, { label: copy.title }]} />}
        <div className="container-page max-w-5xl space-y-8 py-10 md:py-14">
          {gate.visible('k1') && <section className="card p-6 md:p-9">
            <p className="text-lg leading-9 text-slate-700 dark:text-slate-200">{copy.intro}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {METHODOLOGY_POINTS.map((point, index) => (
                <article key={point.ar} className="rounded-2xl border border-primary-100 bg-primary-50/60 p-5 dark:border-night-700 dark:bg-night-800">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-sm font-black text-white">{index + 1}</span>
                  <h2 className="mt-4 font-black leading-7 text-primary-950 dark:text-white">{localized(point, current)}</h2>
                </article>
              ))}
            </div>
          </section>}
          {gate.visible('k2') && <section className="rounded-2xl border border-gold-200 bg-gold-50/70 p-6 dark:border-gold-900/40 dark:bg-gold-950/20">
            <h2 className="text-xl font-black text-gold-900 dark:text-gold-100">{copy.review}</h2>
            <p className="mt-3 leading-8 text-gold-900 dark:text-gold-100">{copy.reviewText}</p>
          </section>}
          <Link href={`/${current}/religions`} className="btn-primary inline-flex">{copy.back} ←</Link>
        </div>
      </main>
      <Footer lang={current} />
    </>
  );
}
