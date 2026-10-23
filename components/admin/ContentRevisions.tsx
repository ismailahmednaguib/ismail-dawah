'use client';

import { useCallback, useEffect, useState } from 'react';

type RevisionItem = {
  id: string;
  reason: string;
  created_at: string;
  created_by: string | null;
  title: string | null;
  content_type: string | null;
  status: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  in_review: 'قيد المراجعة',
  published: 'منشور',
  archived: 'مؤرشف',
  rejected: 'مرفوض',
};

const REASON_LABELS: Record<string, string> = {
  update: 'حفظ تعديل',
  restore: 'قبل الاستعادة',
};

function formatRevisionDate(value: string): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function ContentRevisions({
  contentId,
  canRestore,
}: {
  contentId: string;
  canRestore: boolean;
}) {
  const [items, setItems] = useState<RevisionItem[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/content/${contentId}/revisions`, {
        credentials: 'include',
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error ?? 'فشل تحميل سجل النسخ');
      setEnabled(json.enabled !== false);
      setItems(Array.isArray(json.data) ? json.data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل تحميل سجل النسخ');
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const restore = async (revision: RevisionItem) => {
    if (!canRestore || restoringId) return;

    const confirmed = window.confirm(
      'سيُحفظ الوضع الحالي في السجل أولًا، ثم تُستعاد بيانات المحتوى والترجمة الأساسية من هذه النسخة. ' +
        'تُلغى علامة اعتماد الترجمة، ويعود المحتوى الحسّاس أو الفتوى إلى المراجعة إن كان منشورًا. ' +
        'حالة النشر الحالية لا تُستعاد. هل تريد المتابعة؟'
    );
    if (!confirmed) return;

    setRestoringId(revision.id);
    setError('');
    try {
      const response = await fetch(
        `/api/admin/content/${contentId}/revisions/${revision.id}`,
        { method: 'POST', credentials: 'include' }
      );
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error ?? 'فشل استعادة النسخة');

      // إعادة تحميل كاملة: نموذج التعديل يهيّئ حقوله مرة واحدة من الخادم،
      // فلا يكفي router.refresh() لإظهار القيم المستعادة داخل الحقول.
      window.location.reload();
      return;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل استعادة النسخة');
    } finally {
      setRestoringId(null);
    }
  };

  if (!enabled) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="font-medium text-amber-900">🕘 سجل النسخ غير مفعّل بعد</h3>
        <p className="mt-2 text-sm text-amber-800">
          نفّذ الملف <code dir="ltr">supabase/migrations/20261023_content_revisions.sql</code> في
          SQL Editor بلوحة Supabase، ثم أعد تحميل الصفحة. الحفظ يعمل الآن، لكن دون سجل قابل
          للاستعادة.
        </p>
      </section>
    );
  }

  return (
    <section className="admin-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-medium text-stone-700">🕘 سجل النسخ</h3>
          <p className="mt-1 text-xs text-stone-500">
            نسخة قبل كل حفظ، بحد أقصى ٥٠ نسخة لهذه المادة. الاستعادة تشمل بيانات المحتوى
            والترجمة الأساسية، ولا تستعيد حالة النشر القديمة. المراجع والوسائط والتصنيفات
            تُدار من محرراتها المنفصلة.
          </p>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
          {items.length} نسخة
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-stone-500">جارٍ تحميل السجل...</p>
      ) : items.length === 0 ? (
        error ? null : (
          <p className="text-sm text-stone-500">
            لا توجد نسخ بعد. ستظهر نسخة تلقائيًّا عند أول حفظ لتعديلات المحتوى.
          </p>
        )
      ) : (
        <ul className="divide-y divide-stone-100">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-800">
                  {item.title ?? 'نسخة بلا عنوان'}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {formatRevisionDate(item.created_at)}
                  {' · '}
                  {REASON_LABELS[item.reason] ?? item.reason}
                  {item.status
                    ? ` · الحالة وقتها: ${STATUS_LABELS[item.status] ?? item.status}`
                    : ''}
                </p>
              </div>
              {canRestore && (
                <button
                  type="button"
                  onClick={() => void restore(item)}
                  disabled={restoringId !== null}
                  className="rounded-lg border border-primary-200 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50 disabled:opacity-50"
                >
                  {restoringId === item.id ? 'جارٍ الاستعادة...' : 'استعادة هذه النسخة'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </section>
  );
}
