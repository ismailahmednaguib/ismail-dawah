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
import ConstrainedAssistant from '@/components/assistant/ConstrainedAssistant';
import { getSiteSettings } from '@/lib/content';
import { normalizeAssistantConfig } from '@/lib/assistant-core';

const COPY: Record<Lang, { title: string; subtitle: string; meta: string }> = {
  ar: {
    title: 'البحث الموحد',
    subtitle: 'ابحث في أسماء السور ومعانيها، الأحاديث، المقالات، الفتاوى، والدروس',
    meta: 'ابحث في أسماء السور ومعانيها والأحاديث والمقالات والفتاوى والدروس الإسلامية',
  },
  en: {
    title: 'Unified Search',
    subtitle: 'Search surah names and meanings, hadith, articles, fatwas, and lessons',
    meta: 'Search surah names and meanings, hadith, articles, fatwas, and Islamic lessons',
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
    title: copy.title,
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
  const settings = await getSiteSettings();
  const assistant = normalizeAssistantConfig(settings.assistant);
  const assistantEnabled = assistant.enabled && Boolean(process.env.AI_ASSISTANT_API_KEY);

  return (
    <>
      <Header lang={currentLang} />
      <main id="main-content" tabIndex={-1}
        dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
        className="site-page-shell"
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

        <div className="container-page py-8">
          <div className="mx-auto max-w-4xl">
            <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-primary-50 dark:bg-night-800" />}>
              <SearchAdvanced lang={currentLang} />
            </Suspense>
            <ConstrainedAssistant lang={currentLang} enabled={assistantEnabled} />
          </div>
        </div>
      </main>
      <Footer lang={currentLang} />
    </>
  );
}

