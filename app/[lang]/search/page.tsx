// app/[lang]/search/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SearchAdvanced from '@/components/SearchAdvanced';
import LanguageSEO from '@/components/LanguageSEO';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { isValidLang, type Lang } from '@/lib/i18n';

const COPY = {
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

        <section className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 px-4 py-12 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-3 text-3xl font-bold md:text-4xl">🔍 {copy.title}</h1>
            <p className="text-lg text-primary-100">{copy.subtitle}</p>
          </div>
        </section>

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
