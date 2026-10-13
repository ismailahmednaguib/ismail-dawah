// components/learn/ContentFilters.tsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

const CONTENT_TYPES = [
  { value: '', label: 'الكل' },
  { value: 'article', label: '📰 مقالات' },
  { value: 'lesson', label: '📖 دروس' },
  { value: 'course', label: '🎓 دورات' },
  { value: 'book', label: '📚 كتب' },
  { value: 'fatwa', label: '⚖️ فتاوى' },
  { value: 'khutbah', label: '🕌 خطب' },
  { value: 'audio', label: '🎧 صوتيات' },
  { value: 'video', label: '🎬 فيديو' },
  { value: 'story', label: '📜 قصص' },
];

const AUDIENCES = [
  { value: '', label: 'الكل' },
  { value: 'muslim_general', label: 'المسلم العام' },
  { value: 'muslim_new', label: 'المسلم الجديد' },
  { value: 'non_muslim', label: 'غير المسلم' },
  { value: 'student', label: 'طالب علم' },
  { value: 'daee', label: 'داعية' },
];

const AGE_GROUPS = [
  { value: '', label: 'الكل' },
  { value: 'kids', label: '👶 أطفال' },
  { value: 'teens', label: '🧑 مراهقون' },
  { value: 'youth', label: '💪 شباب' },
  { value: 'adults', label: '👔 بالغون' },
  { value: 'seniors', label: '👴 كبار السن' },
];

const LEVELS = [
  { value: '', label: 'الكل' },
  { value: 'beginner', label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'متقدم' },
  { value: 'specialized', label: 'متخصص' },
];

interface FilterSelectProps {
  label: string;
  param: string;
  options: { value: string; label: string }[];
  current: string;
}

function FilterSelect({ label, param, options, current }: FilterSelectProps) {
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
      <label className="text-xs font-medium text-stone-500 dark:text-gray-400">
        {label}
      </label>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="border border-stone-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-stone-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ContentFilters({ lang }: { lang: string }) {
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-5 shadow-sm">
      {/* البحث */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="🔍 ابحث في المكتبة الإسلامية..."
            className="w-full border border-stone-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 text-sm bg-white dark:bg-gray-900 text-stone-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 ltr:right-3 rtl:left-3"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* الفلاتر */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FilterSelect label="النوع" param="type" options={CONTENT_TYPES} current={type} />
        <FilterSelect label="الجمهور" param="audience" options={AUDIENCES} current={audience} />
        <FilterSelect label="الفئة العمرية" param="age" options={AGE_GROUPS} current={age} />
        <FilterSelect label="المستوى" param="level" options={LEVELS} current={level} />
      </div>

      {/* زر مسح الفلاتر */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="mt-3 text-sm text-red-500 hover:text-red-700 font-medium"
        >
          ✕ مسح جميع الفلاتر
        </button>
      )}
    </div>
  );
}