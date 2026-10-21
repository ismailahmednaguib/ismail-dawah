// components/admin/TranslationsClient.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { AdminSession } from '@/lib/admin/session';
import type { ContentTranslationMatrix, TranslationStats, LanguageCode } from '@/lib/translations/types';
import { LANGUAGES } from '@/lib/translations/types';
import TranslationEditor from '@/components/admin/TranslationEditor';

const STATUS_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
  not_started: { label: 'لم تبدأ', icon: '⬜', className: 'bg-stone-100 text-stone-500' },
  machine_translated: { label: 'ترجمة آلية', icon: '🤖', className: 'bg-orange-100 text-orange-700' },
  in_progress: { label: 'قيد الترجمة', icon: '✍️', className: 'bg-primary-100 text-primary-700' },
  reviewed: { label: 'تمت المراجعة', icon: '✓', className: 'bg-primary-100 text-primary-700' },
  published: { label: 'منشور', icon: '📢', className: 'bg-primary-100 text-primary-700' },
};

const TYPE_LABELS: Record<string, string> = {
  article: 'مقال',
  lesson: 'درس',
  course: 'دورة',
  book: 'كتاب',
  fatwa: 'فتوى',
  khutbah: 'خطبة',
  hadith: 'حديث',
  duaa: 'دعاء',
  story: 'قصة',
  research: 'بحث',
};

export default function TranslationsClient({ session }: { session: AdminSession }) {
  const [matrix, setMatrix] = useState<ContentTranslationMatrix[]>([]);
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [editingContent, setEditingContent] = useState<{
    contentId: string;
    lang: LanguageCode;
    originalTitle: string;
  } | null>(null);

  const enabledLangs = LANGUAGES.filter(l => l.enabled);

  const loadMatrix = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      if (search) qs.set('search', search);

      const res = await fetch(`/api/admin/translations?${qs}`, { credentials: 'include' });
      const json = await res.json();
      setMatrix(json.data ?? []);
      setTotalPages(json.total_pages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/translations?action=stats', { credentials: 'include' });
      const json = await res.json();
      setStats(json);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCopyOriginal = async (contentId: string, targetLang: LanguageCode) => {
    try {
      const res = await fetch('/api/admin/translations', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'copy_original',
          content_id: contentId,
          target_lang: targetLang,
        }),
      });
      if (!res.ok) throw new Error();
      loadMatrix();
      loadStats();
    } catch {
      alert('فشل النسخ');
    }
  };

  return (
    <div className="space-y-6">
      {/* الإحصائيات */}
      {stats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-5">
          <h3 className="font-bold text-primary-950 dark:text-gold mb-4">
            📊 إحصائيات الترجمات ({stats.total_content} محتوى منشور)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {enabledLangs.map(lang => {
              const langStats = stats.by_language[lang.code];
              if (!langStats) return null;
              return (
                <div key={lang.code} className="bg-stone-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium text-sm">{lang.nativeName}</span>
                  </div>
                  <div className="w-full bg-stone-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                    <div
                      className="bg-primary-700 h-2 rounded-full transition-all"
                      style={{ width: `${langStats.coverage_percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-500 dark:text-gray-400">
                    {langStats.translated}/{stats.total_content} ({langStats.coverage_percent}%)
                  </p>
                  {langStats.machine_translated > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      🤖 {langStats.machine_translated} ترجمة آلية
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* البحث */}
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="🔍 ابحث عن محتوى..."
          className="flex-1 border border-stone-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>

      {/* مصفوفة الترجمات */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-stone-500 dark:text-gray-400 border-b border-stone-200 dark:border-gray-700">
                <th className="px-4 py-3 font-medium min-w-[200px]">المحتوى</th>
                <th className="px-4 py-3 font-medium">النوع</th>
                {enabledLangs.map(lang => (
                  <th key={lang.code} className="px-3 py-3 font-medium text-center">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="block text-xs">{lang.code.toUpperCase()}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2 + enabledLangs.length} className="px-4 py-8 text-center text-stone-400">
                    جارٍ التحميل...
                  </td>
                </tr>
              ) : matrix.length === 0 ? (
                <tr>
                  <td colSpan={2 + enabledLangs.length} className="px-4 py-8 text-center text-stone-400">
                    لا يوجد محتوى
                  </td>
                </tr>
              ) : (
                matrix.map(item => (
                  <tr key={item.content_id} className="border-b border-stone-100 dark:border-gray-700 hover:bg-stone-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-primary-950 dark:text-white truncate max-w-[250px]">
                        {item.original_title}
                      </p>
                      <p className="text-xs text-stone-400">
                        اللغة الأصلية: {item.original_lang.toUpperCase()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-stone-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {TYPE_LABELS[item.content_type] ?? item.content_type}
                      </span>
                    </td>
                    {enabledLangs.map(lang => {
                      const t = item.translations[lang.code];
                      const statusCfg = STATUS_CONFIG[t?.status ?? 'not_started'];
                      const isOriginal = item.original_lang === lang.code;

                      return (
                        <td key={lang.code} className="px-3 py-3 text-center">
                          {isOriginal ? (
                            <span className="inline-block text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                              🏠 الأصل
                            </span>
                          ) : t?.exists ? (
                            <button
                              onClick={() => setEditingContent({
                                contentId: item.content_id,
                                lang: lang.code as LanguageCode,
                                originalTitle: item.original_title,
                              })}
                              className={`inline-block text-xs px-2 py-1 rounded-full ${statusCfg.className} hover:opacity-80 transition`}
                              title={t.title}
                            >
                              {statusCfg.icon} {statusCfg.label}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCopyOriginal(item.content_id, lang.code as LanguageCode)}
                              className="inline-block text-xs bg-stone-100 dark:bg-gray-700 text-stone-500 dark:text-gray-400 px-2 py-1 rounded-full hover:bg-primary-100 hover:text-primary-700 transition"
                              title="نسخ الأصل كنقطة بداية"
                            >
                              ➕ ابدأ الترجمة
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* الترقيم */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 dark:border-gray-700 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
            >
              السابق
            </button>
            <span className="text-sm text-stone-600 dark:text-gray-300">
              صفحة {page} من {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* محرر الترجمة */}
      {editingContent && (
        <TranslationEditor
          contentId={editingContent.contentId}
          lang={editingContent.lang}
          originalTitle={editingContent.originalTitle}
          onClose={() => {
            setEditingContent(null);
            loadMatrix();
            loadStats();
          }}
          canReview={session.roles.some(r => ['super_admin', 'admin', 'scholar_reviewer'].includes(r))}
        />
      )}
    </div>
  );
}
