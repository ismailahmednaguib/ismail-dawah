// components/learn/ContentFilters.tsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import type { Lang } from '@/lib/i18n';

type FilterOption = { value: string; ar: string; en: string };

const CONTENT_TYPES: FilterOption[] = [
  { value: '', ar: 'الكل', en: 'All' },
  { value: 'article', ar: '📰 مقالات', en: '📰 Articles' },
  { value: 'lesson', ar: '📖 دروس', en: '📖 Lessons' },
  { value: 'course', ar: '🎓 دورات', en: '🎓 Courses' },
  { value: 'book', ar: '📚 كتب', en: '📚 Books' },
  { value: 'fatwa', ar: '⚖️ فتاوى', en: '⚖️ Fatwas' },
  { value: 'khutbah', ar: '🕌 خطب', en: '🕌 Khutbahs' },
  { value: 'audio', ar: '🎧 صوتيات', en: '🎧 Audio' },
  { value: 'video', ar: '🎬 فيديو', en: '🎬 Video' },
  { value: 'story', ar: '📜 قصص', en: '📜 Stories' },
];

const AUDIENCES: FilterOption[] = [
  { value: '', ar: 'الكل', en: 'All' },
  { value: 'muslim_general', ar: 'المسلم العام', en: 'General Muslim' },
  { value: 'muslim_new', ar: 'المسلم الجديد', en: 'New Muslim' },
  { value: 'non_muslim', ar: 'غير المسلم', en: 'Non-Muslim' },
  { value: 'student', ar: 'طالب علم', en: 'Knowledge Seeker' },
  { value: 'daee', ar: 'داعية', en: 'Dawah Worker' },
  { value: 'parent', ar: 'ولي أمر', en: 'Parent' },
  { value: 'teacher', ar: 'معلم', en: 'Teacher' },
];

const AGE_GROUPS: FilterOption[] = [
  { value: '', ar: 'الكل', en: 'All' },
  { value: 'kids', ar: '👶 أطفال', en: '👶 Kids' },
  { value: 'teens', ar: '🧑 مراهقون', en: '🧑 Teens' },
  { value: 'youth', ar: '💪 شباب', en: '💪 Youth' },
  { value: 'adults', ar: '👔 بالغون', en: '👔 Adults' },
  { value: 'seniors', ar: '👴 كبار السن', en: '👴 Seniors' },
];

const LEVELS: FilterOption[] = [
  { value: '', ar: 'الكل', en: 'All' },
  { value: 'beginner', ar: 'مبتدئ', en: 'Beginner' },
  { value: 'intermediate', ar: 'متوسط', en: 'Intermediate' },
  { value: 'advanced', ar: 'متقدم', en: 'Advanced' },
  { value: 'specialized', ar: 'متخصص', en: 'Specialized' },
];

interface FilterSelectProps {
  label: string;
  param: string;
  options: FilterOption[];
  current: string;
  lang: Lang;
}

function FilterSelect({ label, param, options, current, lang }: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(param, value);
    } else {
      params.delete(param);
    }
    params.delete('page'); // نرجع لأول صفحة عند تغيير الفلتر
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-night-700 dark:bg-night-800 dark:text-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {lang === 'ar' ? opt.ar : opt.en}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ContentFilters({ lang }: { lang: string }) {
  const currentLang: Lang = lang === 'en' ? 'en' : 'ar';
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const type = searchParams.get('type') ?? '';
  const audience = searchParams.get('audience') ?? '';
  const age = searchParams.get('age') ?? '';
  const level = searchParams.get('level') ?? '';
  const search = searchParams.get('q') ?? '';

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const hasFilters = type || audience || age || level || search;

  const clearAll = () => {
    router.push(pathname);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-night-700 dark:bg-night-800">
      {/* البحث */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={
              currentLang === 'ar'
                ? '🔍 ابحث في المكتبة الإسلامية...'
                : '🔍 Search the Islamic library...'
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-night-700 dark:bg-night-900 dark:text-white"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
            className="absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ltr:right-3 rtl:left-3"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* الفلاتر */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FilterSelect
          label={currentLang === 'ar' ? 'النوع' : 'Type'}
          param="type"
          options={CONTENT_TYPES}
          current={type}
          lang={currentLang}
        />
        <FilterSelect
          label={currentLang === 'ar' ? 'الجمهور' : 'Audience'}
          param="audience"
          options={AUDIENCES}
          current={audience}
          lang={currentLang}
        />
        <FilterSelect
          label={currentLang === 'ar' ? 'الفئة العمرية' : 'Age group'}
          param="age"
          options={AGE_GROUPS}
          current={age}
          lang={currentLang}
        />
        <FilterSelect
          label={currentLang === 'ar' ? 'المستوى' : 'Level'}
          param="level"
          options={LEVELS}
          current={level}
          lang={currentLang}
        />
      </div>

      {/* زر مسح الفلاتر */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="mt-3 text-sm text-red-500 hover:text-red-700 font-medium"
        >
          {currentLang === 'ar' ? '✕ مسح جميع الفلاتر' : '✕ Clear all filters'}
        </button>
      )}
    </div>
  );
}
