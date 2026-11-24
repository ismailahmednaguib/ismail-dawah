import Link from 'next/link';

import { formatPublishDate } from '@/lib/date-format';
import type { IconComponent } from '@/lib/icons';
import {
  BookOpenIcon,
  BookmarkIcon,
  DuaHandsIcon,
  FileTextIcon,
  GlobeIcon,
  HeadphonesIcon,
  HelpCircleIcon,
  MosqueIcon,
  ShieldIcon,
  VideoIcon,
} from '@/lib/icons';

type ContentTypeConfig = {
  icon: IconComponent;
  ar: string;
  en: string;
  accent: string;
  badge: 'badge-primary' | 'badge-gold';
};

const TYPE_CONFIG: Record<string, ContentTypeConfig> = {
  article: { icon: FileTextIcon, ar: 'مقال', en: 'Article', accent: 'bg-primary-500', badge: 'badge-primary' },
  lesson: { icon: BookOpenIcon, ar: 'درس', en: 'Lesson', accent: 'bg-primary-700', badge: 'badge-primary' },
  course: { icon: BookmarkIcon, ar: 'دورة', en: 'Course', accent: 'bg-gold-500', badge: 'badge-gold' },
  book: { icon: BookOpenIcon, ar: 'كتاب', en: 'Book', accent: 'bg-gold-600', badge: 'badge-gold' },
  fatwa: { icon: ShieldIcon, ar: 'فتوى', en: 'Fatwa', accent: 'bg-primary-700', badge: 'badge-primary' },
  khutbah: { icon: MosqueIcon, ar: 'خطبة', en: 'Khutbah', accent: 'bg-primary-800', badge: 'badge-primary' },
  audio: { icon: HeadphonesIcon, ar: 'صوت', en: 'Audio', accent: 'bg-primary-500', badge: 'badge-primary' },
  video: { icon: VideoIcon, ar: 'فيديو', en: 'Video', accent: 'bg-primary-700', badge: 'badge-primary' },
  hadith: { icon: BookOpenIcon, ar: 'حديث', en: 'Hadith', accent: 'bg-primary-700', badge: 'badge-primary' },
  faq: { icon: HelpCircleIcon, ar: 'سؤال', en: 'FAQ', accent: 'bg-primary-700', badge: 'badge-primary' },
  duaa: { icon: DuaHandsIcon, ar: 'دعاء', en: 'Duaa', accent: 'bg-gold-500', badge: 'badge-gold' },
  story: { icon: BookOpenIcon, ar: 'قصة', en: 'Story', accent: 'bg-gold-600', badge: 'badge-gold' },
  research: { icon: FileTextIcon, ar: 'بحث', en: 'Research', accent: 'bg-primary-800', badge: 'badge-primary' },
};

interface ContentCardProps {
  lang: string;
  type: string;
  slug: string;
  title: string;
  summary?: string | null;
  published_at?: string | null;
  /** هل عُرضت الترجمة البديلة (العربية) لعدم توفر ترجمة اللغة المطلوبة؟ */
  isFallback?: boolean;
  sourceLabel?: string | null;
}

export default function ContentCard({
  lang,
  type,
  slug,
  title,
  summary,
  published_at,
  isFallback = false,
  sourceLabel,
}: ContentCardProps) {
  const config = TYPE_CONFIG[type] ?? {
    icon: FileTextIcon,
    ar: 'محتوى',
    en: 'Content',
    accent: 'bg-primary-500',
    badge: 'badge-primary' as const,
  };
  const TypeIcon = config.icon;
  const isArabic = lang === 'ar';
  // المعرّفات العربية قد تحتوي `؟` أو `%` أو مسافات؛ الترميز يمنع
  // تفسيرها كجزء من الاستعلام أو كمرساة عند بناء رابط البطاقة.
  const href = `/${lang}/learn/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`;
  const date = published_at ? formatPublishDate(published_at, isArabic) : '';

  return (
    <Link
      href={href}
      className="group card-interactive block overflow-hidden"
    >
      <div className={`relative flex h-24 items-end justify-between overflow-hidden bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600 p-4 ${config.accent}`} aria-hidden="true">
        <div className="absolute -end-5 -top-8 h-28 w-28 rounded-full border border-white/20" />
        <div className="absolute -bottom-12 -start-4 h-24 w-24 rounded-full border border-white/15" />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur-sm">
          <TypeIcon size={23} />
        </span>
        <span className="relative rounded-full border border-white/20 bg-black/10 px-2.5 py-1 text-[10px] font-black tracking-wide text-white/90 backdrop-blur-sm">
          {isArabic ? "مادة منتقاة" : "Curated resource"}
        </span>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className={`${config.badge} inline-flex items-center gap-1.5`}>
            <TypeIcon size={15} aria-hidden="true" />
            {isArabic ? config.ar : config.en}
          </span>
          {date && (
            <time
              dateTime={published_at ?? undefined}
              className="text-xs text-slate-500 dark:text-slate-400"
            >
              {date}
            </time>
          )}
        </div>

        {title && (
          <h2 className="mb-2 line-clamp-2 text-lg font-bold text-primary-950 transition-colors group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
            {title}
          </h2>
        )}

        {isFallback && (
          <span
            className="mb-2 inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold text-gold-800 dark:bg-gold-900/30 dark:text-gold-300"
            title={isArabic ? "لا توجد ترجمة كاملة لهذا المحتوى" : "No full translation for this content"}
          >
            <GlobeIcon size={13} aria-hidden="true" />
            {isArabic ? "ترجمة ناقصة" : "Arabic only"}
          </span>
        )}

        {summary && (
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {summary}
          </p>
        )}

        {sourceLabel && (
          <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {sourceLabel}
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
