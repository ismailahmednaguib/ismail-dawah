// app/[lang]/learn/[type]/[slug]/page.tsx
import { getContentWithFallback } from '@/lib/learn/queries';
import ReferenceDisplay from '@/components/learn/ReferenceDisplay';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import ContentProgressControl from '@/components/learn/ContentProgressControl';
import { isValidLang, type Lang } from '@/lib/i18n';
import { sanitizeRichTextHtml } from '@/lib/content-safety';
import { decodeParam } from '@/lib/params';
import { SITE_NAME, SITE_NAME_EN } from '@/lib/site';

/**
 * الصور المخزَّنة في Supabase قابلة للتحسين عبر next/image؛ أما الروابط الخارجية
 * التي يكتبها المحرّر فتُعرض بوسم img عادي (لا يُتحقّق من نطاقها).
 */
function isOptimizableImage(url: string): boolean {
  try {
    return new URL(url).host.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

interface PageProps {
  params: Promise<{ lang: string; type: string; slug: string }>;
}

interface TermSummary {
  id: string;
  icon?: string | null;
  name: string;
}

interface MediaSummary {
  id: string;
  type: 'image' | 'pdf' | 'audio' | 'video';
  url: string;
  title?: string | null;
  alt_text?: string | null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, type: rawType, slug: rawSlug } = await params;
  const type = decodeParam(rawType);
  const slug = decodeParam(rawSlug);
  const content = await getContentWithFallback(lang, type, slug);

  if (!content) return { title: lang === 'ar' ? 'غير موجود' : 'Not found' };

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || 'https://ismailahmednaguib.vercel.app'
  ).replace(/\/+$/, '');
  const canonicalSlug = content.canonicalSlug ?? slug;
  const encodedType = encodeURIComponent(type);
  const encodedSlug = encodeURIComponent(canonicalSlug);
  const path = `/${lang}/learn/${encodedType}/${encodedSlug}`;
  const title = content.translation.title;
  const description = content.translation.summary?.slice(0, 160) ?? '';
  const media = (content.media ?? []) as MediaSummary[];
  const imageUrl = media.find((item) => item.type === 'image' && item.url)?.url;
  const dynamicOgImage = `${siteUrl}/api/og?lang=${encodeURIComponent(lang)}&type=${encodeURIComponent(type)}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`;
  const ogImage = imageUrl
    ? /^https?:\/\//i.test(imageUrl)
      ? imageUrl
      : `${siteUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    : dynamicOgImage;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}${path}`,
      ...(content.isTranslated === false
        ? {}
        : {
            languages: {
              ar: `${siteUrl}/ar/learn/${encodedType}/${encodedSlug}`,
              en: `${siteUrl}/en/learn/${encodedType}/${encodedSlug}`,
              "x-default": `${siteUrl}/ar/learn/${encodedType}/${encodedSlug}`,
            },
          }),
    },
    // لا نُفهرس الصفحات التي تعرض المحتوى بلغته الأصلية (تفاديًا لتكرار المحتوى).
    ...(content.isTranslated === false ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${siteUrl}${path}`,
      siteName: lang === 'ar' ? SITE_NAME : SITE_NAME_EN,
      locale: lang === 'ar' ? 'ar_EG' : 'en_US',
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function LearnContentPage({ params }: PageProps) {
  const { lang, type: rawType, slug: rawSlug } = await params;
  const type = decodeParam(rawType);
  const slug = decodeParam(rawSlug);
  if (!isValidLang(lang)) notFound();

  const currentLang = lang as Lang;
  const content = await getContentWithFallback(lang, type, slug);

  if (!content) notFound();

  const canonicalSlug = content.canonicalSlug ?? slug;
  if (canonicalSlug !== slug) {
    permanentRedirect(`/${lang}/learn/${encodeURIComponent(type)}/${encodeURIComponent(canonicalSlug)}`);
  }

  const t = content.translation;
  const safeBody = sanitizeRichTextHtml(t.body);
  const media = (content.media ?? []) as MediaSummary[];
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || 'https://ismailahmednaguib.vercel.app'
  ).replace(/\/+$/, '');
  const pageUrl = `${siteUrl}/${lang}/learn/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`;
  const schemaType =
    content.content_type === 'course'
      ? 'Course'
      : content.content_type === 'video'
        ? 'VideoObject'
        : content.content_type === 'lesson' || content.content_type === 'course_lesson'
          ? 'LearningResource'
          : 'Article';
  const jsonLd = {
    '@type': schemaType,
    '@id': pageUrl,
    name: t.title,
    headline: t.title,
    description: t.summary || t.body_plain?.slice(0, 300) || '',
    url: pageUrl,
    inLanguage: currentLang,
    isAccessibleForFree: true,
    datePublished: content.published_at || undefined,
    dateModified: content.updated_at || undefined,
    publisher: {
      '@type': 'Organization',
      name: currentLang === 'ar' ? SITE_NAME : SITE_NAME_EN,
      url: siteUrl,
    },
    ...(schemaType === 'Course'
      ? {
          provider: {
            '@type': 'Organization',
            name: currentLang === 'ar' ? SITE_NAME : SITE_NAME_EN,
          },
        }
      : {}),
  };
  const breadcrumbJsonLd = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: currentLang === 'ar' ? 'المكتبة' : 'Library',
        item: `${siteUrl}/${lang}/learn`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[jsonLd, breadcrumbJsonLd]} />
      <Header lang={currentLang} />
      <main id="main-content" tabIndex={-1} dir={currentLang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 pt-16 dark:bg-night-900 md:pt-20">
      {/* شريط علوي */}
      <div className="bg-primary-900 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/${lang}/learn`}
            className="text-primary-300 hover:text-white text-sm transition-colors"
          >
            {currentLang === 'ar' ? '→ العودة إلى المكتبة' : '← Back to library'}
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

          {content.isTranslated === false && (
            <div className="mt-4 rounded-2xl border border-gold-200 bg-gold-50/70 p-4 text-sm leading-relaxed text-gold-800 dark:border-gold-900/30 dark:bg-gold-950/20 dark:text-gold-200">
              {currentLang === 'ar'
                ? 'هذا المحتوى متاح حاليًا باللغة العربية فقط، والعمل جارٍ على ترجمته.'
                : 'This content is currently available in Arabic only; its translation is in progress.'}{' '}
              {content.translationLang && content.translationLang !== currentLang && (
                <Link
                  href={`/${content.translationLang}/learn/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`}
                  className="font-bold underline"
                >
                  {currentLang === 'ar' ? 'اقرأه باللغة الأصلية' : 'Read the original'}
                </Link>
              )}
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-stone-500 dark:text-gray-400">
            {content.published_at && (
              <span>📅 {new Date(content.published_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
            )}
            {content.views > 0 && (
              <span>
                👁️ {content.views} {currentLang === 'ar' ? 'مشاهدة' : 'views'}
              </span>
            )}
            {content.reviewer_id && (
              <span className="rounded-full bg-primary-50 px-3 py-1 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">
                ✓ {currentLang === 'ar' ? 'اعتمده' : 'Reviewed by'} {content.reviewerName || (currentLang === 'ar' ? 'مراجع علمي' : 'a scholar reviewer')}
              </span>
            )}
            {(content.reviewed_at || content.reviewer_id) && (
              <span>
                🗓️ {currentLang === 'ar' ? 'آخر مراجعة' : 'Last review'}: {new Date(content.reviewed_at || content.updated_at).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US')}
              </span>
            )}
          </div>
        </header>

        {/* التصنيفات */}
        {content.terms?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {content.terms.map((term: TermSummary) => (
              <span
                key={term.id}
                className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
              >
                {term.icon} {term.name}
              </span>
            ))}
          </div>
        )}

        <ContentProgressControl contentId={content.id} lang={currentLang} />

        {/* المحتوى */}
        <div
          className="prose max-w-none dark:prose-invert prose-headings:text-primary-950 dark:prose-headings:text-white prose-a:text-primary-700 dark:prose-a:text-primary-300"
          dangerouslySetInnerHTML={{ __html: safeBody }}
        />

        {media.length > 0 && (
          <section className="mt-10 space-y-4 border-t border-primary-100 pt-8 dark:border-night-700" aria-labelledby="content-media-title">
            <h2 id="content-media-title" className="text-xl font-bold text-primary-950 dark:text-white">
              {currentLang === 'ar' ? 'الوسائط المرتبطة' : 'Related media'}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {media.map((item) => (
                <div key={item.id} className="card overflow-hidden p-4">
                  {item.type === 'image' && (
                    isOptimizableImage(item.url) ? (
                      <Image
                        src={item.url}
                        alt={item.alt_text || item.title || ''}
                        width={1200}
                        height={800}
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="h-auto w-full rounded-xl object-cover"
                      />
                    ) : (
                      // روابط الوسائط الخارجية لا يمكن إضافتها كلها إلى remotePatterns؛ تُعرض بعد تنظيف URL من الخادم.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.alt_text || item.title || ''} className="h-auto w-full rounded-xl object-cover" loading="lazy" decoding="async" />
                    )
                  )}
                  {item.type === 'audio' && <audio controls preload="metadata" className="w-full" src={item.url} />}
                  {item.type === 'video' && <video controls preload="metadata" className="w-full rounded-xl" src={item.url} />}
                  {item.type === 'pdf' && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="btn-outline w-full justify-center">
                      📄 {currentLang === 'ar' ? 'فتح ملف PDF' : 'Open PDF'}
                    </a>
                  )}
                  {item.title && <p className="mt-3 text-sm font-semibold text-primary-900 dark:text-primary-100">{item.title}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* المراجع الشرعية */}
        <ReferenceDisplay references={content.references} lang={currentLang} />
      </article>
      </main>
      <Footer lang={currentLang} />
    </>
  );
}
