// components/admin/ContentEditClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import type { ContentStatus } from '@/lib/types/content';

type TranslationSummary = {
  title?: string | null;
  slug?: string | null;
};

type ContentReferenceSummary = {
  id: string;
  kind: string;
  surah?: number | null;
  ayah_from?: number | null;
  hadith_book?: string | null;
  book_title?: string | null;
  scholar_name?: string | null;
  verified?: boolean;
};

type EditableContent = {
  id: string;
  status: ContentStatus;
  content_type?: string;
  needs_scholar_review?: boolean;
  is_sensitive?: boolean;
  content_translations?: TranslationSummary[];
  content_references?: ContentReferenceSummary[];
};

export default function ContentEditClient({ content }: { content: EditableContent }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const translation = content.content_translations?.[0];
  const requiresReview = Boolean(
    content.needs_scholar_review ||
      content.is_sensitive ||
      content.content_type === 'fatwa'
  );

  const changeStatus = async (status: ContentStatus) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/content/${content.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'فشل تغيير حالة المحتوى');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل تغيير حالة المحتوى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* بطاقة الحالة */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-primary-950">
              {translation?.title ?? '(بدون عنوان)'}
            </h2>
            <p className="text-sm text-stone-500 mt-1" dir="ltr">
              /{translation?.slug}
            </p>
          </div>
          <StatusBadge status={content.status} />
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* أزرار تغيير الحالة */}
        <div className="flex flex-wrap gap-2">
          {content.status === 'draft' && requiresReview && (
            <button
              onClick={() => changeStatus('in_review')}
              disabled={loading}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              📨 إرسال للمراجعة العلمية
            </button>
          )}
          {content.status === 'draft' && !requiresReview && (
            <button
              onClick={() => changeStatus('published')}
              disabled={loading}
              className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              ✅ نشر
            </button>
          )}
          {content.status === 'published' && (
            <button
              onClick={() => changeStatus('archived')}
              disabled={loading}
              className="bg-stone-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              📦 أرشفة
            </button>
          )}
          {content.status === 'archived' && (
            <button
              onClick={() => changeStatus('published')}
              disabled={loading}
              className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              ✅ إعادة النشر
            </button>
          )}
        </div>
      </div>

      {/* مراجع شرعية */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="font-medium text-stone-700 mb-3">
          📚 التوثيق الشرعي ({content.content_references?.length ?? 0})
        </h3>
        {(content.content_references ?? []).length === 0 ? (
          <p className="text-sm text-stone-400">
            لا توجد مراجع موثقة بعد. أضف آيات وأحاديث ومصادر لدعم المحتوى.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(content.content_references ?? []).map((ref) => (
              <li key={ref.id} className="flex items-center gap-2">
                <span>
                  {ref.kind === 'quran' ? '📖' : ref.kind === 'hadith' ? '💬' : '📚'}
                </span>
                <span className="text-stone-700">
                  {ref.kind === 'quran'
                    ? `سورة ${ref.surah}، آية ${ref.ayah_from}`
                    : ref.hadith_book ?? ref.book_title ?? ref.scholar_name}
                </span>
                {ref.verified && (
                  <span className="text-primary-600 text-xs">✓ موثق</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href="/admin/content"
        className="inline-block text-sm text-primary-700 hover:underline"
      >
        → العودة إلى قائمة المحتوى
      </Link>
    </div>
  );
}
