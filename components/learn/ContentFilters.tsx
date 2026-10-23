'use client';

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type FormEvent,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Lang } from '@/lib/i18n';
import { CloseIcon, SearchIcon } from '@/lib/icons';

type FilterOption = { value: string; ar: string; en: string };

const CONTENT_TYPES: FilterOption[] = [
  { value: '', ar: 'الكل', en: 'All' },
  { value: 'article', ar: 'مقالات', en: 'Articles' },
  { value: 'lesson', ar: 'دروس', en: 'Lessons' },
  { value: 'course', ar: 'دورات', en: 'Courses' },
  { value: 'book', ar: 'كتب', en: 'Books' },
  { value: 'fatwa', ar: 'فتاوى', en: 'Fatwas' },
  { value: 'khutbah', ar: 'خطب', en: 'Khutbahs' },
  { value: 'audio', ar: 'صوتيات', en: 'Audio' },
  { value: 'video', ar: 'فيديو', en: 'Video' },
  { value: 'hadith', ar: 'أحاديث', en: 'Hadith' },
  { value: 'duaa', ar: 'أدعية', en: 'Duaa' },
  { value: 'story', ar: 'قصص', en: 'Stories' },
  { value: 'research', ar: 'أبحاث', en: 'Research' },
  { value: 'faq', ar: 'أسئلة شائعة', en: 'FAQ' },
  { value: 'event', ar: 'فعاليات', en: 'Events' },
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
  { value: 'kids', ar: 'أطفال', en: 'Kids' },
  { value: 'teens', ar: 'مراهقون', en: 'Teens' },
  { value: 'youth', ar: 'شباب', en: 'Youth' },
  { value: 'adults', ar: 'بالغون', en: 'Adults' },
  { value: 'seniors', ar: 'كبار السن', en: 'Seniors' },
];

const LEVELS: FilterOption[] = [
  { value: '', ar: 'الكل', en: 'All' },
  { value: 'beginner', ar: 'مبتدئ', en: 'Beginner' },
  { value: 'intermediate', ar: 'متوسط', en: 'Intermediate' },
  { value: 'advanced', ar: 'متقدم', en: 'Advanced' },
  { value: 'specialized', ar: 'متخصص', en: 'Specialized' },
];

const MADHHABS: FilterOption[] = [
  { value: '', ar: 'الكل', en: 'All' },
  { value: 'general', ar: 'عام', en: 'General' },
  { value: 'hanafi', ar: 'حنفي', en: 'Hanafi' },
  { value: 'maliki', ar: 'مالكي', en: 'Maliki' },
  { value: 'shafii', ar: 'شافعي', en: 'Shafi’i' },
  { value: 'hanbali', ar: 'حنبلي', en: 'Hanbali' },
  { value: 'zahiri', ar: 'ظاهري', en: 'Zahiri' },
  { value: 'jafari', ar: 'جعفري', en: 'Ja’fari' },
];

interface FilterSelectProps {
  label: string;
  param: string;
  options: FilterOption[];
  current: string;
  lang: Lang;
}

function FilterSelect({
  label,
  param,
  options,
  current,
  lang,
}: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectId = useId();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    params.delete('page');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={selectId}
        className="text-xs font-semibold text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>
      <select
        id={selectId}
        value={current}
        onChange={(event) => handleChange(event.target.value)}
        className="input-islamic py-2 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {lang === 'ar' ? option.ar : option.en}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ContentFilters({ lang }: { lang: Lang }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentLang = lang;

  const type = searchParams.get('type') ?? '';
  const audience = searchParams.get('audience') ?? '';
  const age = searchParams.get('age') ?? '';
  const level = searchParams.get('level') ?? '';
  const madhhab = searchParams.get('madhhab') ?? '';
  const search = searchParams.get('q') ?? '';
  const [searchText, setSearchText] = useState(search);

  useEffect(() => {
    setSearchText(search);
  }, [search]);

  const handleSearch = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      const value = searchText.trim().slice(0, 120);
      if (value) params.set('q', value);
      else params.delete('q');
      params.delete('page');
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams, searchText]
  );

  const hasFilters = Boolean(type || audience || age || level || madhhab || search);

  const clearAll = () => router.push(pathname);

  return (
    <div className="card p-5">
      <form onSubmit={handleSearch} className="mb-5 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-primary-500" size={18} aria-hidden="true" />
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={
              currentLang === 'ar'
                ? 'ابحث في المكتبة الإسلامية...'
                : 'Search the Islamic library...'
            }
            className="input-islamic w-full py-2.5 ps-10"
            dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
            aria-label={currentLang === 'ar' ? 'البحث في المكتبة' : 'Search library'}
          />
        </div>
        <button type="submit" className="btn-primary whitespace-nowrap">
          {currentLang === 'ar' ? 'بحث' : 'Search'}
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <FilterSelect label={currentLang === 'ar' ? 'النوع' : 'Type'} param="type" options={CONTENT_TYPES} current={type} lang={currentLang} />
        <FilterSelect label={currentLang === 'ar' ? 'الجمهور' : 'Audience'} param="audience" options={AUDIENCES} current={audience} lang={currentLang} />
        <FilterSelect label={currentLang === 'ar' ? 'الفئة العمرية' : 'Age group'} param="age" options={AGE_GROUPS} current={age} lang={currentLang} />
        <FilterSelect label={currentLang === 'ar' ? 'المستوى' : 'Level'} param="level" options={LEVELS} current={level} lang={currentLang} />
        <FilterSelect label={currentLang === 'ar' ? 'المذهب' : 'Madhhab'} param="madhhab" options={MADHHABS} current={madhhab} lang={currentLang} />
      </div>

      {hasFilters && (
        <button type="button" onClick={clearAll} className="btn-ghost mt-3 px-0 text-primary-700 dark:text-primary-300">
          <span className="inline-flex items-center gap-1.5">
            <CloseIcon size={15} aria-hidden="true" />
            {currentLang === 'ar' ? 'مسح جميع الفلاتر' : 'Clear all filters'}
          </span>
        </button>
      )}
    </div>
  );
}
