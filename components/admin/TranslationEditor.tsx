// components/admin/TranslationEditor.tsx
'use client';

import { useEffect, useState } from 'react';
import type { LanguageCode, TranslationRow } from '@/lib/translations/types';
import { LANGUAGES } from '@/lib/translations/types';

interface TranslationEditorProps {
  contentId: string;
  lang: LanguageCode;
  originalTitle: string;
  onClose: () => void;
  canReview: boolean;
}

export default function TranslationEditor({
  contentId,
  lang,
  originalTitle,
  onClose,
  canReview,
}: TranslationEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState<TranslationRow | null>(null);
  const [translation, setTranslation] = useState<Partial<TranslationRow>>({});

  const langInfo = LANGUAGES.find(l => l.code === lang);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // جلب الأصل والترجمة معًا
        const [origRes, transRes] = await Promise.all([
          fetch(`/api/admin/translations?action=single&content_id=${contentId}&lang=ar`, { credentials: 'include' }),
          fetch(`/api/admin/translations?action=single&content_id=${contentId}&lang=${lang}`, { credentials: 'include' }),
        ]);

        const origJson = await origRes.json();
        const transJson = await transRes.json();

        setOriginal(origJson.translation);
        setTranslation(transJson.translation ?? {
          content_id: contentId,
          lang,
          slug: '',
          title: '',
          summary: '',
          body: '',
          is_machine_translated: false,
          is_reviewed: false,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [contentId, lang]);

  const handleSave = async (markReviewed: boolean = false) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/translations', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          content_id: contentId,
          lang,
          translation: {
            ...translation,
            is_reviewed: markReviewed ? true : translation.is_reviewed,
          },
        }),
      });

      if (!res.ok) throw new Error();

      if (markReviewed) {
        await fetch('/api/admin/translations', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'mark_reviewed',
            content_id: contentId,
            lang,
          }),
        });
      }

      onClose();
    } catch {
      alert('فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setTranslation(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-3" />
          <p className="text-stone-500">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl my-8 shadow-2xl">
        {/* الرأس */}
        <div className="p-5 border-b border-stone-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary-950 dark:text-gold">
              {langInfo?.flag} ترجمة إلى {langInfo?.nativeName}
            </h2>
            <p className="text-sm text-stone-500 dark:text-gray-400 mt-1">
              الأصل: {originalTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-gray-700 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-gray-600 transition"
          >
            ✕
          </button>
        </div>

        {/* المحتوى جنبًا إلى جنب */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* العمود الأيمن: الأصل */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-700 dark:text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-600 rounded-full" />
              النص الأصلي (العربية)
            </h3>

            <div className="bg-stone-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 max-h-[500px] overflow-y-auto">
              <div>
                <label className="text-xs font-medium text-stone-500">العنوان</label>
                <p className="text-sm font-bold text-stone-800 dark:text-white mt-1">
                  {original?.title ?? '-'}
                </p>
              </div>
              {original?.summary && (
                <div>
                  <label className="text-xs font-medium text-stone-500">الملخص</label>
                  <p className="text-sm text-stone-600 dark:text-gray-300 mt-1">
                    {original.summary}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-stone-500">المحتوى</label>
                <div
                  className="text-sm text-stone-700 dark:text-gray-300 mt-1 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: original?.body ?? '<p>-</p>' }}
                />
              </div>
            </div>
          </div>

          {/* العمود الأيسر: الترجمة */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-700 dark:text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              الترجمة ({langInfo?.nativeName})
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-gray-400 mb-1">
                  الرابط (Slug)
                </label>
                <input
                  value={translation.slug ?? ''}
                  onChange={(e) => updateField('slug', e.target.value)}
                  dir="ltr"
                  className="w-full border border-stone-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-mono bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="article-title-en"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-gray-400 mb-1">
                  العنوان *
                </label>
                <input
                  value={translation.title ?? ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  dir={langInfo?.dir}
                  className="w-full border border-stone-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="Title in target language"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-gray-400 mb-1">
                  الملخص
                </label>
                <textarea
                  value={translation.summary ?? ''}
                  onChange={(e) => updateField('summary', e.target.value)}
                  dir={langInfo?.dir}
                  rows={2}
                  className="w-full border border-stone-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-gray-400 mb-1">
                  المحتوى
                </label>
                <textarea
                  value={translation.body ?? ''}
                  onChange={(e) => updateField('body', e.target.value)}
                  dir={langInfo?.dir}
                  rows={12}
                  className="w-full border border-stone-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                />
                <p className="text-xs text-stone-400 mt-1">
                  💡 يمكنك كتابة HTML مباشرة
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="machine_translated"
                  checked={translation.is_machine_translated ?? false}
                  onChange={(e) => setTranslation(prev => ({ ...prev, is_machine_translated: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500"
                />
                <label htmlFor="machine_translated" className="text-sm text-stone-600 dark:text-gray-300">
                  🤖 ترجمة آلية (تحتاج مراجعة)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* الأزرار */}
        <div className="p-5 border-t border-stone-200 dark:border-gray-700 flex flex-wrap gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 dark:border-gray-600 rounded-lg text-sm text-stone-600 dark:text-gray-300 hover:bg-stone-50 dark:hover:bg-gray-700 transition"
          >
            إلغاء
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving || !translation.title}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'جارٍ الحفظ...' : '💾 حفظ كمسودة'}
          </button>
          {canReview && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving || !translation.title}
              className="px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition disabled:opacity-50"
            >
              ✅ حفظ + اعتماد الترجمة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}