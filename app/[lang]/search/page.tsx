// app/[lang]/search/page.tsx
import { Suspense } from 'react';
import SearchAdvanced from '@/components/SearchAdvanced';
import LanguageSEO from '@/components/LanguageSEO';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return {
    title: `${dict.nav.search} | أكاديمية إسماعيل أحمد نجيب`,
    description: 'ابحث في القرآن الكريم، الأحاديث، المقالات، الفتاوى، والدروس الإسلامية',
  };
}

export default async function SearchPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-cream-50 dark:bg-gray-900">
      <LanguageSEO path="/search" lang={lang} />

      <div className="bg-emerald-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            🔍 البحث الموحد
          </h1>
          <p className="text-emerald-200 text-lg">
            ابحث في كل محتوى المنصة: القرآن، الأحاديث، المقالات، الفتاوى، الدروس
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="animate-pulse h-96 bg-stone-100 rounded-xl" />}>
          <SearchAdvanced lang={lang} />
        </Suspense>
      </div>
    </div>
  );
}