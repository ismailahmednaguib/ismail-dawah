import Link from 'next/link';

type ContentTypeConfig = {
  icon: string;
  ar: string;
  en: string;
  accent: string;
  badge: 'badge-primary' | 'badge-gold';
};

const TYPE_CONFIG: Record<string, ContentTypeConfig> = {
  article: { icon: '📰', ar: 'مقال', en: 'Article', accent: 'bg-primary-500', badge: 'badge-primary' },
  lesson: { icon: '📖', ar: 'درس', en: 'Lesson', accent: 'bg-primary-600', badge: 'badge-primary' },
  course: { icon: '🎓', ar: 'دورة', en: 'Course', accent: 'bg-gold-500', badge: 'badge-gold' },
  book: { icon: '📚', ar: 'كتاب', en: 'Book', accent: 'bg-gold-600', badge: 'badge-gold' },
  fatwa: { icon: '⚖️', ar: 'فتوى', en: 'Fatwa', accent: 'bg-primary-700', badge: 'badge-primary' },
  khutbah: { icon: '🕌', ar: 'خطبة', en: 'Khutbah', accent: 'bg-primary-800', badge: 'badge-primary' },
  audio: { icon: '🎧', ar: 'صوت', en: 'Audio', accent: 'bg-primary-500', badge: 'badge-primary' },
  video: { icon: '🎬', ar: 'فيديو', en: 'Video', accent: 'bg-primary-600', badge: 'badge-primary' },
  hadith: { icon: '💬', ar: 'حديث', en: 'Hadith', accent: 'bg-primary-700', badge: 'badge-primary' },
  duaa: { icon: '🤲', ar: 'دعاء', en: 'Duaa', accent: 'bg-gold-500', badge: 'badge-gold' },
  story: { icon: '📜', ar: 'قصة', en: 'Story', accent: 'bg-gold-600', badge: 'badge-gold' },
  research: { icon: '🔬', ar: 'بحث', en: 'Research', accent: 'bg-primary-800', badge: 'badge-primary' },
};

interface ContentCardProps {
  lang: string;
  type: string;
  slug: string;
  title: string;
  summary?: string | null;
  published_at?: string | null;
}

export default function ContentCard({
  lang,
  type,
  slug,
  title,
  summary,
  published_at,
}: ContentCardProps) {
  const config = TYPE_CONFIG[type] ?? {
    icon: '📄',
    ar: 'محتوى',
    en: 'Content',
    accent: 'bg-primary-500',
    badge: 'badge-primary' as const,
  };
  const isArabic = lang === 'ar';
  const href = `/${lang}/learn/${type}/${slug}`;
  const date = published_at
    ? new Date(published_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')
    : '';

  return (
    <Link
      href={href}
      className="group card-interactive block"
      aria-label={`${title} — ${isArabic ? config.ar : config.en}`}
    >
      <div className={`h-1.5 ${config.accent}`} aria-hidden="true" />

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className={config.badge}>
            <span aria-hidden="true">{config.icon}</span>
            {isArabic ? config.ar : config.en}
          </span>
          {date && (
            <time className="text-xs text-slate-500 dark:text-slate-400">
              {date}
            </time>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-primary-950 transition-colors group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
          {title}
        </h3>

        {summary && (
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {summary}
          </p>
        )}

        <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary-700 transition-colors group-hover:text-primary-500 dark:text-primary-300">
          <span>{isArabic ? 'اقرأ المزيد' : 'Read more'}</span>
          <svg
            className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
