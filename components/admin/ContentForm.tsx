// components/admin/ContentForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type {
  ContentType,
  Audience,
  AgeGroup,
  EduLevel,
  Madhhab,
} from '@/lib/types/content';

const CONTENT_TYPES: { value: ContentType; label: string; icon: string }[] = [
  { value: 'article', label: 'مقال', icon: '📰' },
  { value: 'lesson', label: 'درس', icon: '📖' },
  { value: 'book', label: 'كتاب', icon: '📚' },
  { value: 'fatwa', label: 'فتوى', icon: '⚖️' },
  { value: 'khutbah', label: 'خطبة', icon: '🕌' },
  { value: 'course', label: 'دورة', icon: '🎓' },
  { value: 'story', label: 'قصة', icon: '📜' },
  { value: 'duaa', label: 'دعاء', icon: '🤲' },
  { value: 'hadith', label: 'حديث', icon: '💬' },
  { value: 'research', label: 'بحث', icon: '🔬' },
];

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'muslim_general', label: 'المسلم العام' },
  { value: 'muslim_new', label: 'المسلم الجديد' },
  { value: 'non_muslim', label: 'غير المسلم' },
  { value: 'student', label: 'طالب علم' },
  { value: 'scholar', label: 'عالِم' },
  { value: 'daee', label: 'داعية' },
  { value: 'parent', label: 'والد/والدة' },
  { value: 'teacher', label: 'معلم' },
];

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: 'all', label: 'الجميع' },
  { value: 'kids', label: 'أطفال' },
  { value: 'teens', label: 'مراهقون' },
  { value: 'youth', label: 'شباب' },
  { value: 'adults', label: 'بالغون' },
  { value: 'seniors', label: 'كبار السن' },
];

const LEVELS: { value: EduLevel; label: string }[] = [
  { value: 'beginner', label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'متقدم' },
  { value: 'specialized', label: 'متخصص' },
];

const MADHHABS: { value: Madhhab; label: string }[] = [
  { value: 'general', label: 'عام' },
  { value: 'hanafi', label: 'حنفي' },
  { value: 'maliki', label: 'مالكي' },
  { value: 'shafii', label: 'شافعي' },
  { value: 'hanbali', label: 'حنبلي' },
  { value: 'zahiri', label: 'ظاهري' },
  { value: 'jafari', label: 'جعفري' },
];

export default function ContentForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [contentType, setContentType] = useState<ContentType>('article');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<Audience[]>(['muslim_general']);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>(['all']);
  const [level, setLevel] = useState<EduLevel>('beginner');
  const [madhhabs, setMadhhabs] = useState<Madhhab[]>(['general']);
  const [needsReview, setNeedsReview] = useState(false);
  const [isSensitive, setIsSensitive] = useState(false);

  const autoSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const toggle = <T,>(arr: T[], val: T): T[] => {
    if (!arr.includes(val)) return [...arr, val];
    return arr.length === 1 ? arr : arr.filter((x) => x !== val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: contentType,
          audience,
          age_groups: ageGroups,
          levels: [level],
          madhhabs,
          needs_scholar_review: needsReview,
          is_sensitive: isSensitive,
          translation: {
            lang: 'ar',
            slug: slug || autoSlug(title),
            title,
            summary,
            body,
            body_plain: body.replace(/<[^>]+>/g, ''),
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'فشل الحفظ');

      router.push('/admin/content');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حفظ المحتوى');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* اختيار النوع */}
      <div className="card p-5">
        <label className="block text-sm font-medium text-stone-700 mb-3">
          نوع المحتوى
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CONTENT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setContentType(t.value)}
              className={`p-3 rounded-lg border text-center text-sm transition-colors ${
                contentType === t.value
                  ? 'border-primary-600 bg-primary-50 text-primary-800'
                  : 'border-primary-100 hover:border-primary-300 dark:border-night-700'
              }`}
            >
              <div className="text-xl mb-1">{t.icon}</div>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* البيانات الأساسية */}
      <div className="card space-y-4 p-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            العنوان *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-islamic"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            الرابط (Slug)
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={autoSlug(title) || 'يُولّد تلقائيًا من العنوان'}
            dir="ltr"
            className="input-islamic text-left font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            ملخص قصير
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="input-islamic"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            المحتوى
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="input-islamic"
          />
          <p className="text-xs text-stone-400 mt-1">
            💡 لاحقًا سنضيف محرر نصوص غني (TipTap) مع دعم RTL كامل
          </p>
        </div>
      </div>

      {/* التصنيف */}
      <div className="card space-y-4 p-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            الجمهور المستهدف
          </label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setAudience(toggle(audience, a.value))}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  audience.includes(a.value)
                    ? 'bg-primary-700 text-white border-primary-600'
                    : 'border-primary-200 text-slate-600 dark:border-night-700 dark:text-slate-300'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            الفئة العمرية
          </label>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setAgeGroups(toggle(ageGroups, a.value))}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  ageGroups.includes(a.value)
                    ? 'bg-gold-500 text-gray-900 border-gold-500'
                    : 'border-primary-200 text-slate-600 dark:border-night-700 dark:text-slate-300'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            المستوى العلمي
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as EduLevel)}
            className="input-islamic max-w-xs py-2 text-sm"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            المذهب أو المنهج الفقهي
          </label>
          <div className="flex flex-wrap gap-2">
            {MADHHABS.map((madhhab) => (
              <button
                key={madhhab.value}
                type="button"
                onClick={() => setMadhhabs(toggle(madhhabs, madhhab.value))}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  madhhabs.includes(madhhab.value)
                    ? 'bg-primary-700 text-white border-primary-600'
                    : 'border-primary-200 text-slate-600 dark:border-night-700 dark:text-slate-300'
                }`}
              >
                {madhhab.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-stone-400">
            اختر «عام» للمحتوى غير المرتبط بمذهب محدد.
          </p>
        </div>
      </div>

      {/* خيارات شرعية */}
      <div className="space-y-3 rounded-2xl border border-gold-200 bg-gold-50 p-5 dark:border-gold-800 dark:bg-gold-900/20">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={needsReview}
            onChange={(e) => setNeedsReview(e.target.checked)}
            className="h-4 w-4 accent-gold-600"
          />
          <span className="text-sm text-gold-900 dark:text-gold-200">
            🔍 يحتاج مراجعة علمية قبل النشر
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isSensitive}
            onChange={(e) => setIsSensitive(e.target.checked)}
            className="w-4 h-4 accent-red-600"
          />
          <span className="text-sm text-red-800">
            ⚠️ محتوى حساس (لا يُنشر إلا بموافقة مراجع علمي)
          </span>
        </label>
      </div>

      {/* رسائل وحفظ */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? 'جارٍ الحفظ...' : '💾 حفظ كمسودة'}
        </button>
        <Link
          href="/admin/content"
          className="btn-outline"
        >
          إلغاء
        </Link>
      </div>
    </form>
  );
}
