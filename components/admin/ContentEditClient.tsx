// components/admin/ContentEditClient.tsx
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import ContentTermsEditor from '@/components/admin/ContentTermsEditor';
import ContentMediaEditor from '@/components/admin/ContentMediaEditor';
import ContentRevisions from '@/components/admin/ContentRevisions';
import { renderDesignIcon } from '@/components/ui';
import { sanitizeRichTextHtml } from '@/lib/content-safety';
import type {
  AgeGroup,
  Audience,
  ContentType,
  ContentStatus,
  ContentMedia,
  EduLevel,
  Madhhab,
} from '@/lib/types/content';

type TranslationSummary = {
  id?: string;
  lang?: string | null;
  title?: string | null;
  slug?: string | null;
  summary?: string | null;
  body?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
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
  updated_at?: string;
  scheduled_at?: string | null;
  content_type?: ContentType;
  audience?: Audience[];
  age_groups?: AgeGroup[];
  levels?: EduLevel[];
  madhhabs?: Madhhab[];
  needs_scholar_review?: boolean;
  is_sensitive?: boolean;
  content_translations?: TranslationSummary[];
  content_references?: ContentReferenceSummary[];
  content_media?: ContentMedia[];
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

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'non_muslim', label: 'غير المسلم' },
  { value: 'muslim_new', label: 'المسلم الجديد' },
  { value: 'muslim_general', label: 'المسلم العام' },
  { value: 'student', label: 'طالب العلم' },
  { value: 'scholar', label: 'العالم' },
  { value: 'daee', label: 'الداعية' },
  { value: 'parent', label: 'الوالد/الوالدة' },
  { value: 'teacher', label: 'المعلم' },
];

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'article', label: 'مقال' },
  { value: 'lesson', label: 'درس' },
  { value: 'course', label: 'دورة' },
  { value: 'course_lesson', label: 'درس داخل دورة' },
  { value: 'book', label: 'كتاب' },
  { value: 'research', label: 'بحث' },
  { value: 'fatwa', label: 'فتوى' },
  { value: 'khutbah', label: 'خطبة' },
  { value: 'audio', label: 'صوتيات' },
  { value: 'video', label: 'فيديو' },
  { value: 'hadith', label: 'حديث' },
  { value: 'duaa', label: 'دعاء' },
  { value: 'story', label: 'قصة' },
  { value: 'faq', label: 'أسئلة شائعة' },
  { value: 'event', label: 'فعالية' },
  { value: 'page', label: 'صفحة' },
  { value: 'profile', label: 'ملف تعريفي' },
];

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: 'kids', label: 'أطفال' },
  { value: 'teens', label: 'ناشئة' },
  { value: 'youth', label: 'شباب' },
  { value: 'adults', label: 'بالغون' },
  { value: 'seniors', label: 'كبار السن' },
  { value: 'all', label: 'الجميع' },
];

const LEVELS: { value: EduLevel; label: string }[] = [
  { value: 'beginner', label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'متقدم' },
  { value: 'specialized', label: 'متخصص' },
];

const MADHHABS: { value: Madhhab; label: string }[] = [
  { value: 'general', label: 'عام / لا يختص بمذهب' },
  { value: 'hanafi', label: 'حنفي' },
  { value: 'maliki', label: 'مالكي' },
  { value: 'shafii', label: 'شافعي' },
  { value: 'hanbali', label: 'حنبلي' },
  { value: 'zahiri', label: 'ظاهري' },
  { value: 'jafari', label: 'جعفري' },
];

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

/** يحوّل ISO إلى قيمة حقل datetime-local بالتوقيت المحلي. */
function toDateTimeLocal(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';

  const pad = (part: number) => String(part).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatScheduledUtc(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';

  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date);
}

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
  const [contentSaving, setContentSaving] = useState(false);
  const [contentSaved, setContentSaved] = useState(false);
  const [contentError, setContentError] = useState('');
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
  const translation =
    content.content_translations?.find((item) => item.lang === 'ar') ??
    content.content_translations?.[0];
  const [title, setTitle] = useState(translation?.title ?? '');
  const [slug, setSlug] = useState(translation?.slug ?? '');
  const [summary, setSummary] = useState(translation?.summary ?? '');
  const [body, setBody] = useState(translation?.body ?? '');
  const [metaTitle, setMetaTitle] = useState(translation?.meta_title ?? '');
  const [metaDescription, setMetaDescription] = useState(
    translation?.meta_description ?? ''
  );
  const [contentType, setContentType] = useState<ContentType>(
    content.content_type ?? 'article'
  );
  const [audience, setAudience] = useState<Audience[]>(
    content.audience?.length ? content.audience : ['muslim_general']
  );
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>(
    content.age_groups?.length ? content.age_groups : ['all']
  );
  const [levels, setLevels] = useState<EduLevel[]>(
    content.levels?.length ? content.levels : ['beginner']
  );
  const [madhhabs, setMadhhabs] = useState<Madhhab[]>(
    content.madhhabs?.length ? content.madhhabs : ['general']
  );
  const [needsScholarReview, setNeedsScholarReview] = useState(
    Boolean(content.needs_scholar_review)
  );
  const [isSensitive, setIsSensitive] = useState(Boolean(content.is_sensitive));
  const [scheduleAt, setScheduleAt] = useState('');
  const requiresReview = Boolean(
    content.needs_scholar_review ||
      content.is_sensitive ||
      content.content_type === 'fatwa' ||
      content.content_type === 'hadith' ||
      content.content_type === 'khutbah'
  );

  useEffect(() => {
    setScheduleAt(toDateTimeLocal(content.scheduled_at));
  }, [content.scheduled_at]);

  const saveContent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) return;

    setContentSaving(true);
    setContentSaved(false);
    setContentError('');
    try {
      const res = await fetch(`/api/admin/content/${content.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: contentType,
          audience,
          age_groups: ageGroups,
          levels,
          madhhabs,
          needs_scholar_review: needsScholarReview,
          is_sensitive: isSensitive,
          translation: {
            id: translation?.id,
            lang: translation?.lang ?? 'ar',
            title,
            slug,
            summary,
            body: sanitizeRichTextHtml(body),
            meta_title: metaTitle,
            meta_description: metaDescription,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'فشل حفظ المحتوى');
      setContentSaved(true);
      router.refresh();
    } catch (err: unknown) {
      setContentError(err instanceof Error ? err.message : 'فشل حفظ المحتوى');
    } finally {
      setContentSaving(false);
    }
  };

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
      setScheduleAt('');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل تغيير حالة المحتوى');
    } finally {
      setLoading(false);
    }
  };

  const scheduleContent = async () => {
    if (!canEdit) return;

    const date = new Date(scheduleAt);

    if (!scheduleAt || !Number.isFinite(date.getTime())) {
      setError('حدّد تاريخ ووقت النشر أولًا.');
      return;
    }

    if (date.getTime() < Date.now() + 60_000) {
      setError('موعد الجدولة يجب أن يكون بعد دقيقة على الأقل من الآن.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/content/${content.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'scheduled',
          scheduled_at: date.toISOString(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'فشل جدولة النشر');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل جدولة النشر');
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
          {canEdit && content.status === 'draft' && requiresReview && (
            <button
              onClick={() => changeStatus('in_review')}
              disabled={loading}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              📨 إرسال للمراجعة العلمية
            </button>
          )}
          {canEdit && content.status === 'draft' && !requiresReview && (
            <button
              onClick={() => changeStatus('published')}
              disabled={loading}
              className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              ✓ نشر
            </button>
          )}
          {canEdit && content.status === 'published' && (
            <button
              onClick={() => changeStatus('archived')}
              disabled={loading}
              className="bg-stone-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              📦 أرشفة
            </button>
          )}
          {canEdit && content.status === 'archived' && (
            <button
              onClick={() => changeStatus('published')}
              disabled={loading}
              className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              ✓ إعادة النشر
            </button>
          )}
        </div>
      </div>

      {/* جدولة النشر */}
      {canEdit && (content.status === 'draft' || content.status === 'scheduled') && (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h3 className="text-lg font-bold text-primary-950">جدولة النشر</h3>

          {content.status === 'scheduled' && content.scheduled_at && (
            <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900">
              مجدول حاليًا: {formatScheduledUtc(content.scheduled_at)} (UTC)
            </p>
          )}

          {requiresReview ? (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              هذا المحتوى يحتاج اعتمادًا علميًّا. أرسله إلى المراجعة العلمية؛
              وعند اعتماده يُنشر مباشرة، فلا حاجة لجدولته.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-stone-500">
                يبقى المحتوى مخفيًّا عن الزوار حتى يحين الموعد. التوقيت المعروض
                بتوقيت جهازك، ويُخزَّن بتوقيت UTC.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex-1 text-sm font-medium text-primary-950">
                  تاريخ ووقت النشر
                  <input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(event) => setScheduleAt(event.target.value)}
                    disabled={!canEdit || loading}
                    className="input-islamic mt-1"
                    dir="ltr"
                  />
                </label>

                <button
                  type="button"
                  onClick={scheduleContent}
                  disabled={loading || !scheduleAt}
                  className="rounded-lg bg-sky-700 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {content.status === 'scheduled'
                    ? 'تحديث الجدولة'
                    : 'جدولة النشر'}
                </button>
              </div>
            </>
          )}

          {content.status === 'scheduled' && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => changeStatus('published')}
                disabled={loading}
                className="rounded-lg bg-primary-700 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                ✓ نشر الآن
              </button>
              <button
                type="button"
                onClick={() => changeStatus('draft')}
                disabled={loading}
                className="rounded-lg bg-stone-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                إلغاء الجدولة
              </button>
            </div>
          )}
        </div>
      )}

      {/* بيانات المحتوى */}
      <form onSubmit={saveContent} className="card space-y-5">
        <div>
          <h3 className="text-lg font-bold text-primary-950">بيانات المحتوى</h3>
          <p className="mt-1 text-sm text-primary-700/70">
            عدّل النسخة العربية والتصنيفات. المحتوى الحساس يعود للمراجعة العلمية بعد الحفظ.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-primary-950">
            العنوان
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={!canEdit}
              required
              maxLength={240}
              className="input-islamic mt-1"
            />
          </label>
          <label className="text-sm font-medium text-primary-950">
            الرابط المختصر
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              disabled={!canEdit}
              required
              maxLength={255}
              dir="ltr"
              className="input-islamic mt-1 text-left"
            />
          </label>
          <label className="text-sm font-medium text-primary-950">
            نوع المحتوى
            <select
              value={contentType}
              onChange={(event) => setContentType(event.target.value as ContentType)}
              disabled={!canEdit}
              className="input-islamic mt-1"
            >
              {CONTENT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium text-primary-950">
          الملخص
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            disabled={!canEdit}
            maxLength={2000}
            rows={3}
            className="input-islamic mt-1"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-primary-950">
            عنوان محركات البحث
            <input
              value={metaTitle}
              onChange={(event) => setMetaTitle(event.target.value)}
              disabled={!canEdit}
              maxLength={240}
              className="input-islamic mt-1"
            />
          </label>
          <label className="text-sm font-medium text-primary-950">
            وصف محركات البحث
            <input
              value={metaDescription}
              onChange={(event) => setMetaDescription(event.target.value)}
              disabled={!canEdit}
              maxLength={320}
              className="input-islamic mt-1"
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-primary-950">
          نص المحتوى
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            disabled={!canEdit}
            rows={12}
            className="input-islamic mt-1 font-mono text-sm"
            placeholder="يمكن استخدام HTML بسيط مثل الفقرات والعناوين والقوائم."
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-primary-950">الجمهور</legend>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((item) => {
                const selected = audience.includes(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={!canEdit}
                    onClick={() =>
                      setAudience((current) => {
                        const next = toggleValue(current, item.value);
                        return next.length ? next : current;
                      })
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      selected
                        ? 'border-primary-700 bg-primary-700 text-white'
                        : 'border-primary-200 bg-white text-primary-800 hover:border-primary-500'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-primary-950">الفئة العمرية</legend>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map((item) => {
                const selected = ageGroups.includes(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={!canEdit}
                    onClick={() =>
                      setAgeGroups((current) => {
                        const next = toggleValue(current, item.value);
                        return next.length ? next : current;
                      })
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      selected
                        ? 'border-gold-500 bg-gold-500 text-night-950'
                        : 'border-primary-200 bg-white text-primary-800 hover:border-primary-500'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-primary-950">المستوى العلمي</legend>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((item) => {
              const selected = levels.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  disabled={!canEdit}
                  onClick={() =>
                    setLevels((current) => {
                      const next = toggleValue(current, item.value);
                      return next.length ? next : current;
                    })
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    selected
                      ? 'border-primary-700 bg-primary-700 text-white'
                      : 'border-primary-200 bg-white text-primary-800 hover:border-primary-500'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-primary-950">المذهب الفقهي</legend>
          <div className="flex flex-wrap gap-2">
            {MADHHABS.map((item) => {
              const selected = madhhabs.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  disabled={!canEdit}
                  onClick={() =>
                    setMadhhabs((current) => {
                      const next = toggleValue(current, item.value);
                      return next.length ? next : current;
                    })
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    selected
                      ? 'border-primary-700 bg-primary-700 text-white'
                      : 'border-primary-200 bg-white text-primary-800 hover:border-primary-500'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-3 rounded-xl border border-primary-100 bg-primary-50/60 p-4 sm:grid-cols-2">
          <label className="flex items-start gap-3 text-sm text-primary-900">
            <input
              type="checkbox"
              checked={needsScholarReview}
              onChange={(event) => setNeedsScholarReview(event.target.checked)}
              disabled={!canEdit}
              className="mt-1 accent-primary-700"
            />
            <span>
              <span className="block font-medium">يحتاج مراجعة علمية</span>
              <span className="mt-1 block text-xs text-primary-700/70">
                لا يمكن نشره مباشرة حتى يعتمده المراجع المختص.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-primary-900">
            <input
              type="checkbox"
              checked={isSensitive}
              onChange={(event) => setIsSensitive(event.target.checked)}
              disabled={!canEdit}
              className="mt-1 accent-primary-700"
            />
            <span>
              <span className="block font-medium">محتوى حساس</span>
              <span className="mt-1 block text-xs text-primary-700/70">
                الفتاوى والمحتوى الحساس يمرّان بالمراجعة قبل النشر.
              </span>
            </span>
          </label>
        </div>

        {contentError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{contentError}</p>
        )}
        {contentSaved && (
          <p className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-800">
            تم حفظ التعديلات بنجاح.
          </p>
        )}
        {canEdit && (
          <button type="submit" disabled={contentSaving} className="btn-primary">
            {contentSaving ? 'جارٍ الحفظ...' : 'حفظ بيانات المحتوى'}
          </button>
        )}
      </form>

      <ContentMediaEditor
        contentId={content.id}
        initialMedia={content.content_media}
        canEdit={canEdit}
      />

      {/* مراجع شرعية */}
      <div className="card">
        <h3 className="font-medium text-stone-700 mb-3">
          <span aria-hidden="true" className="me-1 inline-flex align-middle">{renderDesignIcon("📚", 18)}</span>التوثيق الشرعي ({references.length})
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
                  {renderDesignIcon(ref.kind === 'quran' ? '📖' : ref.kind === 'hadith' ? '💬' : '📚', 16)}
                </span>
                <span className="text-stone-700">
                  {ref.kind === 'quran'
                    ? `سورة ${ref.surah}، آية ${ref.ayah_from}`
                    : ref.hadith_book ?? ref.book_title ?? ref.scholar_name}
                </span>
                {ref.verified && (
                  <span className="text-primary-700 text-xs">✓ موثق</span>
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
                      className="text-xs text-red-700 hover:underline"
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

      <ContentRevisions
        key={content.updated_at ?? content.id}
        contentId={content.id}
        canRestore={canEdit}
      />

      <Link
        href="/admin/content"
        className="inline-block text-sm text-primary-700 hover:underline"
      >
        → العودة إلى قائمة المحتوى
      </Link>
    </div>
  );
}
