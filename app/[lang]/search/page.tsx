// app/[lang]/search/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SearchAdvanced from '@/components/SearchAdvanced';
import LanguageSEO from '@/components/LanguageSEO';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { isValidLang, type Lang } from '@/lib/i18n';
import { PageHero } from '@/components/ui';

const COPY: Record<string, any> = {
  ar: {
    title: 'البحث الموحد',
    subtitle: 'ابحث في كل محتوى المنصة: القرآن، الأحاديث، المقالات، الفتاوى، والدروس',
    meta: 'ابحث في القرآن الكريم، الأحاديث، المقالات، الفتاوى، والدروس الإسلامية',
  },
  en: {
    title: 'Unified Search',
    subtitle: 'Search the platform: Quran, hadith, articles, fatwas, and lessons',
    meta: 'Search Quran, hadith, articles, fatwas, and Islamic lessons',
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLang(lang)) return {};

  const copy = COPY[lang];
  return {
    title: `${copy.title} | منصة إسماعيل أحمد نجيب`,
    description: copy.meta,
  };
}

export default async function SearchPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const currentLang = lang as Lang;
  const copy = COPY[currentLang];

  return (
    <>
      <Header lang={currentLang} />
      <main
        dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
        className="min-h-screen bg-slate-50 dark:bg-night-900"
      >
        <LanguageSEO path="/search" lang={currentLang} />

        <PageHero
          icon="🔍"
          title={copy.title}
          subtitle={copy.subtitle}
          crumbs={[
            { label: currentLang === 'ar' ? 'الرئيسية' : 'Home', href: `/${lang}` },
            { label: copy.title },
          ]}
        />

        <div className="mx-auto max-w-4xl px-4 py-8">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-primary-50 dark:bg-night-800" />}>
            <SearchAdvanced lang={currentLang} />
          </Suspense>
        </div>
      </main>
      <Footer lang={currentLang} />
    </>
  );
}

