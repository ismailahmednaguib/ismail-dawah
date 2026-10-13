// components/SearchAdvanced.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  slug?: string;
  summary?: string;
  url: string;
  published_at?: string;
  views?: number;
}

const TYPE_ICONS: Record<string, string> = {
  article: '📰', lesson: '📖', course: '🎓', book: '📚',
  fatwa: '⚖️', khutbah: '🕌', audio: '🎧', video: '🎬',
  hadith: '💬', duaa: '🤲', story: '📜', research: '🔬',
  quran_verse: '📖',
};

export default function SearchAdvanced({ lang }: { lang: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') ?? '');

  const doSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('q', query);
      qs.set('lang', lang);
      if (typeFilter) qs.set('type', typeFilter);

      const res = await fetch(`/api/search?${qs}`);
      const json = await res.json();
      setResults(json.data ?? []);
      setTotal(json.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [query, lang, typeFilter]);

  // بحث فوري مع تأخير
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) doSearch();
    }, 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <div className="space-y-6">
      {/* شريط البحث */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 ابحث في القرآن، الأحاديث، المقالات، الفتاوى..."
          className="w-full border-2 border-stone-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-lg bg-white dark:bg-gray-800 focus:border-gold focus:outline-none shadow-sm"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        />
        {loading && (
          <div className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gold border-t-transparent" />
          </div>
        )}
      </div>

      {/* فلاتر النوع */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            !typeFilter ? 'bg-emerald-700 text-white' : 'bg-stone-100 dark:bg-gray-700 text-stone-600 dark:text-gray-300'
          }`}
        >
          الكل
        </button>
        {Object.entries(TYPE_ICONS).map(([type, icon]) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type === 'quran_verse' ? 'quran' : type)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              typeFilter === type ? 'bg-emerald-700 text-white' : 'bg-stone-100 dark:bg-gray-700 text-stone-600 dark:text-gray-300'
            }`}
          >
            {icon} {type}
          </button>
        ))}
      </div>

      {/* النتائج */}
      {query.length >= 2 && (
        <div>
          <p className="text-sm text-stone-500 dark:text-gray-400 mb-4">
            {total > 0 ? `${total} نتيجة` : 'لا توجد نتائج'}
          </p>

          {results.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-stone-500 dark:text-gray-400">
                لم نعثر على نتائج لـ "{query}"
              </p>
              <p className="text-sm text-stone-400 mt-2">
                جرب كلمات مختلفة أو تحقق من الإملاء
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <a
                  key={result.id}
                  href={result.url}
                  className="block bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-gold/50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{TYPE_ICONS[result.type] ?? '📄'}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-emerald-950 dark:text-white truncate">
                        {result.title}
                      </h3>
                      {result.summary && (
                        <p className="text-sm text-stone-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {result.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                        {result.published_at && (
                          <span>📅 {new Date(result.published_at).toLocaleDateString('ar-EG')}</span>
                        )}
                        {result.views && <span>👁️ {result.views}</span>}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}