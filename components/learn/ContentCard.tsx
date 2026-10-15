// components/learn/ContentCard.tsx
import Link from 'next/link';

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  article:   { icon: '📰', label: 'مقال',    color: 'bg-blue-100 text-blue-800' },
  lesson:    { icon: '📖', label: 'درس',     color: 'bg-primary-100 text-primary-800' },
  course:    { icon: '🎓', label: 'دورة',    color: 'bg-purple-100 text-purple-800' },
  book:      { icon: '📚', label: 'كتاب',    color: 'bg-amber-100 text-amber-800' },
  fatwa:     { icon: '⚖️', label: 'فتوى',    color: 'bg-red-100 text-red-800' },
  khutbah:   { icon: '🕌', label: 'خطبة',    color: 'bg-primary-100 text-primary-800' },
  audio:     { icon: '🎧', label: 'صوت',     color: 'bg-indigo-100 text-indigo-800' },
  video:     { icon: '🎬', label: 'فيديو',   color: 'bg-rose-100 text-rose-800' },
  hadith:    { icon: '💬', label: 'حديث',    color: 'bg-green-100 text-green-800' },
  duaa:      { icon: '🤲', label: 'دعاء',    color: 'bg-cyan-100 text-cyan-800' },
  story:     { icon: '📜', label: 'قصة',     color: 'bg-orange-100 text-orange-800' },
  research:  { icon: '🔬', label: 'بحث',     color: 'bg-slate-100 text-slate-800' },
};

interface ContentCardProps {
  lang: string;
  type: string;
  slug: string;
  title: string;
  summary?: string | null;
  published_at?: string;
}

export default function ContentCard({
  lang,
  type,
  slug,
  title,
  summary,
  published_at,
}: ContentCardProps) {
  const cfg = TYPE_CONFIG[type] ?? { icon: '📄', label: type, color: 'bg-gray-100 text-gray-800' };
  const href = `/${lang}/learn/${type}/${slug}`;
  const date = published_at
    ? new Date(published_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')
    : '';

  return (
    <Link
      href={href}
      className="group block bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* شريط علوي ملون حسب النوع */}
      <div className={`h-1.5 ${cfg.color.split(' ')[0]}`} />

      <div className="p-5">
        {/* النوع والتاريخ */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            <span>{cfg.icon}</span>
            {cfg.label}
          </span>
          {date && (
            <time className="text-xs text-stone-400">{date}</time>
          )}
        </div>

        {/* العنوان */}
        <h3 className="text-lg font-bold text-primary-950 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2">
          {title}
        </h3>

        {/* الملخص */}
        {summary && (
          <p className="text-sm text-stone-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
            {summary}
          </p>
        )}

        {/* سهم القراءة */}
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-700 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>اقرأ المزيد</span>
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}