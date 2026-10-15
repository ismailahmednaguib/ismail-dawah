// app/[lang]/learn/[type]/[slug]/page.tsx
import { getContentBySlug } from '@/lib/learn/queries';
import ReferenceDisplay from '@/components/learn/ReferenceDisplay';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ lang: string; type: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, type, slug } = await params;
  const content = await getContentBySlug(lang, type, slug);

  if (!content) return { title: 'غير موجود' };

  return {
    title: `${content.translation.title} | أكاديمية إسماعيل`,
    description: content.translation.summary?.slice(0, 160) ?? '',
    openGraph: {
      title: content.translation.title,
      description: content.translation.summary ?? '',
      type: 'article',
    },
  };
}

export default async function LearnContentPage({ params }: PageProps) {
  const { lang, type, slug } = await params;
  const content = await getContentBySlug(lang, type, slug);

  if (!content) notFound();

  const t = content.translation;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-cream-50 dark:bg-gray-900">
      {/* شريط علوي */}
      <div className="bg-primary-900 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/${lang}/learn`}
            className="text-primary-300 hover:text-white text-sm transition-colors"
          >
            → العودة إلى المكتبة
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-10">
        {/* العنوان */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-950 dark:text-white mb-4 leading-tight">
            {t.title}
          </h1>

          {t.summary && (
            <p className="text-lg text-stone-600 dark:text-gray-400 leading-relaxed">
              {t.summary}
            </p>
          )}

          {/* معلومات إضافية */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-stone-500 dark:text-gray-400">
            {content.published_at && (
              <span>📅 {new Date(content.published_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
            )}
            {content.views > 0 && (
              <span>👁️ {content.views} مشاهدة</span>
            )}
          </div>
        </header>

        {/* التصنيفات */}
        {content.terms?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {content.terms.map((term: any) => (
              <span
                key={term.id}
                className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
              >
                {term.icon} {term.name}
              </span>
            ))}
          </div>
        )}

        {/* المحتوى */}
        <div
          className="prose prose-cyan max-w-none dark:prose-invert prose-headings:text-primary-950 dark:prose-headings:text-white"
          dangerouslySetInnerHTML={{ __html: t.body ?? '' }}
        />

        {/* المراجع الشرعية */}
        <ReferenceDisplay references={content.references} />
      </article>
    </div>
  );
}