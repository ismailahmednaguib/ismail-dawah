// components/SearchAdvanced.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Lang } from '@/lib/i18n';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  summary?: string | null;
  url: string;
  published_at?: string;
  views?: number;
}

type FilterOption = { value: string; icon?: string; ar: string; en: string };

const TYPE_OPTIONS: FilterOption[] = [
  { value: '', ar: 'الكل', en: 'All' },
  { value: 'quran', icon: '📖', ar: 'السور', en: 'Surahs' },
  { value: 'article', icon: '📰', ar: 'مقالات', en: 'Articles' },
  { value: 'lesson', icon: '📖', ar: 'دروس', en: 'Lessons' },
  { value: 'course', icon: '🎓', ar: 'دورات', en: 'Courses' },
  { value: 'book', icon: '📚', ar: 'كتب', en: 'Books' },
  { value: 'fatwa', icon: '⚖️', ar: 'فتاوى', en: 'Fatwas' },
  { value: 'khutbah', icon: '🕌', ar: 'خطب', en: 'Khutbahs' },
  { value: 'audio', icon: '🎧', ar: 'صوتيات', en: 'Audio' },
  { value: 'video', icon: '🎬', ar: 'فيديو', en: 'Video' },
  { value: 'hadith', icon: '💬', ar: 'أحاديث', en: 'Hadith' },
  { value: 'story', icon: '📜', ar: 'قصص', en: 'Stories' },
  { value: 'research', icon: '🔬', ar: 'أبحاث', en: 'Research' },
];

const AUDIENCE_OPTIONS: FilterOption[] = [
  { value: '', ar: 'كل الجمهور', en: 'All audiences' },
  { value: 'muslim_general', ar: 'المسلم العام', en: 'General Muslim' },
  { value: 'muslim_new', ar: 'المسلم الجديد', en: 'New Muslim' },
  { value: 'non_muslim', ar: 'غير المسلم', en: 'Non-Muslim' },
  { value: 'student', ar: 'طالب علم', en: 'Knowledge Seeker' },
  { value: 'daee', ar: 'داعية', en: 'Dawah Worker' },
  { value: 'parent', ar: 'ولي أمر', en: 'Parent' },
  { value: 'teacher', ar: 'معلم', en: 'Teacher' },
];

const AGE_OPTIONS: FilterOption[] = [
  { value: '', ar: 'كل الأعمار', en: 'All ages' },
  { value: 'kids', icon: '👶', ar: 'أطفال', en: 'Kids' },
  { value: 'teens', icon: '🧑', ar: 'مراهقون', en: 'Teens' },
  { value: 'youth', icon: '💪', ar: 'شباب', en: 'Youth' },
  { value: 'adults', icon: '👔', ar: 'بالغون', en: 'Adults' },
  { value: 'seniors', icon: '👴', ar: 'كبار السن', en: 'Seniors' },
];

const LEVEL_OPTIONS: FilterOption[] = [
  { value: '', ar: 'كل المستويات', en: 'All levels' },
  { value: 'beginner', ar: 'مبتدئ', en: 'Beginner' },
  { value: 'intermediate', ar: 'متوسط', en: 'Intermediate' },
  { value: 'advanced', ar: 'متقدم', en: 'Advanced' },
  { value: 'specialized', ar: 'متخصص', en: 'Specialized' },
];

const MADHHAB_OPTIONS: FilterOption[] = [
  { value: '', ar: 'كل المذاهب', en: 'All madhhabs' },
  { value: 'general', ar: 'عام', en: 'General' },
  { value: 'hanafi', ar: 'حنفي', en: 'Hanafi' },
  { value: 'maliki', ar: 'مالكي', en: 'Maliki' },
  { value: 'shafii', ar: 'شافعي', en: 'Shafi’i' },
  { value: 'hanbali', ar: 'حنبلي', en: 'Hanbali' },
  { value: 'zahiri', ar: 'ظاهري', en: 'Zahiri' },
  { value: 'jafari', ar: 'جعفري', en: 'Ja’fari' },
];

const TYPE_ICONS: Record<string, string> = {
  quran: '📖', quran_verse: '📖', article: '📰', lesson: '📖', course: '🎓',
  book: '📚', fatwa: '⚖️', khutbah: '🕌', audio: '🎧', video: '🎬',
  hadith: '💬', story: '📜', research: '🔬',
};

const COPY: Record<string, any> = {
  ar: {
    placeholder: '🔍 ابحث في أسماء السور، الأحاديث، المقالات، الفتاوى، والدروس...',
    type: 'نوع المحتوى', audience: 'الجمهور', age: 'الفئة العمرية', level: 'المستوى', madhhab: 'المذهب',
    results: (count: number) => (count > 0 ? count + ' نتيجة' : 'لا توجد نتائج'),
    noResults: (query: string) => 'لم نعثر على نتائج لـ "' + query + '"',
    tryAgain: 'جرب كلمات مختلفة أو تحقق من الإملاء',
    minQuery: 'اكتب كلمتين على الأقل لبدء البحث.', dateLocale: 'ar-EG',
  },
  en: {
    placeholder: '🔍 Search surah names, hadith, articles, fatwas, and lessons...',
    type: 'Content type', audience: 'Audience', age: 'Age group', level: 'Level', madhhab: 'Madhhab',
    results: (count: number) => (count > 0 ? count + ' results' : 'No results'),
    noResults: (query: string) => 'No results found for "' + query + '"',
    tryAgain: 'Try different words or check the spelling.',
    minQuery: 'Enter at least two characters to start searching.', dateLocale: 'en-US',
  },
} as const;

type SelectFilter = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

export default function SearchAdvanced({ lang }: { lang: Lang }) {
  const searchParams = useSearchParams();
  const copy = COPY[lang];
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [facets, setFacets] = useState<Record<string, number>>({});
  const [error, setError] = useState(false);
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') ?? '');
  const [audienceFilter, setAudienceFilter] = useState(searchParams.get('audience') ?? '');
  const [ageFilter, setAgeFilter] = useState(searchParams.get('age') ?? '');
  const [levelFilter, setLevelFilter] = useState(searchParams.get('level') ?? '');
  const [madhhabFilter, setMadhhabFilter] = useState(searchParams.get('madhhab') ?? '');

  const doSearch = useCallback(async () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) return;

    setLoading(true);
    setError(false);

    try {
      const qs = new URLSearchParams({ q: trimmedQuery, lang, page: String(page), per_page: '20' });
      if (typeFilter) qs.set('type', typeFilter);
      if (audienceFilter) qs.set('audience', audienceFilter);
      if (ageFilter) qs.set('age', ageFilter);
      if (levelFilter) qs.set('level', levelFilter);
      if (madhhabFilter) qs.set('madhhab', madhhabFilter);

      const res = await fetch(`/api/search?${qs.toString()}`);
      if (!res.ok) throw new Error('Search request failed');

      const json = await res.json();
      setResults(json.data ?? []);
      setTotal(json.total ?? 0);
      setTotalPages(json.total_pages ?? 0);
      setFacets(json.facets ?? {});
    } catch {
      setResults([]);
      setTotal(0);
      setTotalPages(0);
      setFacets({});
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [ageFilter, audienceFilter, lang, levelFilter, madhhabFilter, page, query, typeFilter]);

  // بحث فوري مع تأخير
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        void doSearch();
      } else {
        setResults([]);
        setTotal(0);
        setTotalPages(0);
        setFacets({});
        setError(false);
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const filters: SelectFilter[] = [
    { label: copy.audience, value: audienceFilter, options: AUDIENCE_OPTIONS, onChange: changeFilter(setAudienceFilter) },
    { label: copy.age, value: ageFilter, options: AGE_OPTIONS, onChange: changeFilter(setAgeFilter) },
    { label: copy.level, value: levelFilter, options: LEVEL_OPTIONS, onChange: changeFilter(setLevelFilter) },
    { label: copy.madhhab, value: madhhabFilter, options: MADHHAB_OPTIONS, onChange: changeFilter(setMadhhabFilter) },
  ];

  const allCount = Object.values(facets).reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-6">
      {/* شريط البحث */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={copy.placeholder}
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-lg shadow-sm focus:border-primary-500 focus:outline-none dark:border-night-700 dark:bg-night-800"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        />
        {loading && (
          <div className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        )}
      </div>

      {/* فلاتر النوع */}
      <div>
        <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">{copy.type}</p>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value || 'all'}
              type="button"
              onClick={() => {
                setTypeFilter(option.value);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                typeFilter === option.value
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-primary-50 dark:bg-night-800 dark:text-slate-300 dark:hover:bg-night-700'
              }`}
            >
              {option.icon ? `${option.icon} ` : ''}
              {lang === 'ar' ? option.ar : option.en}
              {(() => {
                const count = option.value === '' ? allCount : facets[option.value] ?? 0;
                return count > 0 ? <span className="ms-1 opacity-70">({count})</span> : null;
              })()}
            </button>
          ))}
        </div>
      </div>

      {/* الفلاتر الإضافية */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filters.map((filter) => (
          <label
            key={filter.label}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-night-700 dark:bg-night-800"
          >
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{filter.label}</span>
            <select
              aria-label={filter.label}
              value={filter.value}
              onChange={(event) => filter.onChange(event.target.value)}
              className="max-w-[65%] bg-transparent text-end text-sm font-semibold text-slate-700 outline-none dark:text-slate-200"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon ? `${option.icon} ` : ''}
                  {lang === 'ar' ? option.ar : option.en}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {/* النتائج */}
      {query.trim().length >= 2 && (
        <div>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            {error
              ? lang === 'ar'
                ? 'تعذر تنفيذ البحث'
                : 'Search failed'
              : copy.results(total)}
          </p>

          {results.length === 0 && !loading && !error ? (
            <div className="py-12 text-center">
              <p className="mb-3 text-4xl">🔍</p>
              <p className="text-slate-500 dark:text-slate-400">{copy.noResults(query)}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{copy.tryAgain}</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              {lang === 'ar' ? 'حدث خطأ مؤقت. حاول مرة أخرى.' : 'A temporary error occurred. Please try again.'}
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <a
                  key={result.id}
                  href={result.url}
                  className="block rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-gold-300 hover:shadow-md dark:border-night-700 dark:bg-night-800"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{TYPE_ICONS[result.type] ?? '📄'}</span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-bold text-primary-950 dark:text-white">{result.title}</h2>
                      {result.summary && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                          {result.summary}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        {result.published_at && (
                          <span>📅 {new Date(result.published_at).toLocaleDateString(copy.dateLocale)}</span>
                        )}
                        {result.views ? <span>👁️ {result.views}</span> : null}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40 dark:border-night-700 dark:bg-night-800 dark:text-slate-300"
              >
                {lang === 'ar' ? 'السابق' : 'Previous'}
              </button>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40 dark:border-night-700 dark:bg-night-800 dark:text-slate-300"
              >
                {lang === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          )}
        </div>
      )}

      {query.trim().length < 2 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">{copy.minQuery}</p>
      )}
    </div>
  );
}

