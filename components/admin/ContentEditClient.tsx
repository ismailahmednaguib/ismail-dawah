// components/admin/ContentEditClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import ContentTermsEditor from '@/components/admin/ContentTermsEditor';
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
  hadith_number?: number | null;
  hadith_grade?: string | null;
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

type ReferenceKind =
  | 'quran'
  | 'hadith'
  | 'athar'
  | 'scholar_quote'
  | 'fiqh_rule'
  | 'book'
  | 'fatwa_source'
  | 'other';

export default function ContentEditClient({
  content,
  canEdit,
  canReview,
}: {
  content: EditableContent;
  canEdit: boolean;
  canReview: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [references, setReferences] = useState(content.content_references ?? []);
  const [referenceSaving, setReferenceSaving] = useState(false);
  const [referenceError, setReferenceError] = useState('');
  const [referenceKind, setReferenceKind] = useState<ReferenceKind>('quran');
  const [surah, setSurah] = useState('');
  const [ayahFrom, setAyahFrom] = useState('');
  const [ayahTo, setAyahTo] = useState('');
  const [hadithBook, setHadithBook] = useState('');
  const [hadithNumber, setHadithNumber] = useState('');
  const [hadithGrade, setHadithGrade] = useState('unknown');
  const [scholarName, setScholarName] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [note, setNote] = useState('');
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

  const addReference = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) return;

    setReferenceSaving(true);
    setReferenceError('');
    try {
      const res = await fetch(`/api/admin/content/${content.id}/references`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: referenceKind,
          surah,
          ayah_from: ayahFrom,
          ayah_to: ayahTo,
          hadith_book: hadithBook,
          hadith_number: hadithNumber,
          hadith_grade: hadithGrade,
          scholar_name: scholarName,
          book_title: bookTitle,
          quote_text: quoteText,
          note,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'فشل إضافة المرجع');

      setReferences((current) => [...current, json.reference]);
      setSurah('');
      setAyahFrom('');
      setAyahTo('');
      setHadithBook('');
      setHadithNumber('');
      setHadithGrade('unknown');
      setScholarName('');
      setBookTitle('');
      setQuoteText('');
      setNote('');
    } catch (err: unknown) {
      setReferenceError(err instanceof Error ? err.message : 'فشل إضافة المرجع');
    } finally {
      setReferenceSaving(false);
    }
  };

  const updateReferenceVerification = async (reference: ContentReferenceSummary) => {
    if (!canReview) return;

    setReferenceError('');
    try {
      const res = await fetch(
        `/api/admin/content/${content.id}/references/${reference.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verified: !reference.verified }),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'فشل تحديث توثيق المرجع');
      setReferences((current) =>
        current.map((item) => (item.id === reference.id ? json.reference : item))
      );
    } catch (err: unknown) {
      setReferenceError(err instanceof Error ? err.message : 'فشل تحديث توثيق المرجع');
    }
  };

  const removeReference = async (referenceId: string) => {
    if (!canEdit || !window.confirm('هل تريد حذف هذا المرجع؟')) return;

    setReferenceError('');
    try {
      const res = await fetch(
        `/api/admin/content/${content.id}/references/${referenceId}`,
        { method: 'DELETE' }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'فشل حذف المرجع');
      setReferences((current) => current.filter((item) => item.id !== referenceId));
    } catch (err: unknown) {
      setReferenceError(err instanceof Error ? err.message : 'فشل حذف المرجع');
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
          📚 التوثيق الشرعي ({references.length})
        </h3>

        {canEdit && (
          <form onSubmit={addReference} className="mb-5 rounded-lg bg-stone-50 p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-stone-700">
                نوع المرجع
                <select
                  value={referenceKind}
                  onChange={(event) => setReferenceKind(event.target.value as ReferenceKind)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
                >
                  <option value="quran">📖 قرآن</option>
                  <option value="hadith">💬 حديث</option>
                  <option value="scholar_quote">📕 قول عالم</option>
                  <option value="book">📚 كتاب</option>
                  <option value="fiqh_rule">⚖️ قاعدة فقهية</option>
                  <option value="fatwa_source">🧾 مصدر فتوى</option>
                  <option value="athar">🗂️ أثر</option>
                  <option value="other">🔖 آخر</option>
                </select>
              </label>

              {referenceKind === 'quran' && (
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-sm text-stone-700">
                    السورة
                    <input
                      type="number"
                      min="1"
                      max="114"
                      value={surah}
                      onChange={(event) => setSurah(event.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-2"
                    />
                  </label>
                  <label className="text-sm text-stone-700">
                    من آية
                    <input
                      type="number"
                      min="1"
                      value={ayahFrom}
                      onChange={(event) => setAyahFrom(event.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-2"
                    />
                  </label>
                  <label className="text-sm text-stone-700">
                    إلى آية
                    <input
                      type="number"
                      min="1"
                      value={ayahTo}
                      onChange={(event) => setAyahTo(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-2"
                    />
                  </label>
                </div>
              )}

              {referenceKind === 'hadith' && (
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    value={hadithBook}
                    onChange={(event) => setHadithBook(event.target.value)}
                    placeholder="اسم الكتاب"
                    className="rounded-lg border border-stone-300 px-3 py-2"
                  />
                  <input
                    type="number"
                    min="1"
                    value={hadithNumber}
                    onChange={(event) => setHadithNumber(event.target.value)}
                    placeholder="رقم الحديث"
                    className="rounded-lg border border-stone-300 px-3 py-2"
                  />
                  <select
                    value={hadithGrade}
                    onChange={(event) => setHadithGrade(event.target.value)}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-2"
                  >
                    <option value="unknown">الدرجة غير محددة</option>
                    <option value="sahih">صحيح</option>
                    <option value="hasan">حسن</option>
                    <option value="daif">ضعيف</option>
                    <option value="mawdu">موضوع</option>
                  </select>
                </div>
              )}

              {(referenceKind === 'scholar_quote' || referenceKind === 'book' || referenceKind === 'fatwa_source') && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={scholarName}
                    onChange={(event) => setScholarName(event.target.value)}
                    placeholder="اسم العالم (اختياري)"
                    className="rounded-lg border border-stone-300 px-3 py-2"
                  />
                  <input
                    value={bookTitle}
                    onChange={(event) => setBookTitle(event.target.value)}
                    placeholder="اسم الكتاب أو المصدر"
                    className="rounded-lg border border-stone-300 px-3 py-2"
                  />
                </div>
              )}
            </div>

            <textarea
              value={quoteText}
              onChange={(event) => setQuoteText(event.target.value)}
              placeholder="نص الاقتباس (اختياري)"
              rows={2}
              className="w-full rounded-lg border border-stone-300 px-3 py-2"
            />
            <div className="flex flex-wrap gap-2">
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="ملاحظة للمراجع (اختياري)"
                className="min-w-[240px] flex-1 rounded-lg border border-stone-300 px-3 py-2"
              />
              <button
                type="submit"
                disabled={referenceSaving}
                className="rounded-lg bg-primary-700 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {referenceSaving ? 'جارٍ الإضافة...' : 'إضافة المرجع'}
              </button>
            </div>
          </form>
        )}

        {referenceError && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {referenceError}
          </p>
        )}

        {references.length === 0 ? (
          <p className="text-sm text-stone-400">
            لا توجد مراجع موثقة بعد. أضف آيات وأحاديث ومصادر لدعم المحتوى.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {references.map((ref) => (
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
                <span className="mr-auto flex gap-2">
                  {canReview && (
                    <button
                      type="button"
                      onClick={() => updateReferenceVerification(ref)}
                      className="text-xs text-primary-700 hover:underline"
                    >
                      {ref.verified ? 'إلغاء التوثيق' : 'اعتماد'}
                    </button>
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => removeReference(ref.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      حذف
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ContentTermsEditor contentId={content.id} canEdit={canEdit} />

      <Link
        href="/admin/content"
        className="inline-block text-sm text-primary-700 hover:underline"
      >
        → العودة إلى قائمة المحتوى
      </Link>
    </div>
  );
}
