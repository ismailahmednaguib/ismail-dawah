// components/admin/ContentForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ContentType, Audience, AgeGroup, EduLevel } from '@/lib/types/content';

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
  const [needsReview, setNeedsReview] = useState(false);
  const [isSensitive, setIsSensitive] = useState(false);

  const autoSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const toggle = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

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
      <div className="bg-white rounded-xl border border-stone-200 p-5">
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
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="text-xl mb-1">{t.icon}</div>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* البيانات الأساسية */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            العنوان *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-left font-mono text-sm"
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
            className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-xs text-stone-400 mt-1">
            💡 لاحقًا سنضيف محرر نصوص غني (TipTap) مع دعم RTL كامل
          </p>
        </div>
      </div>

      {/* التصنيف */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
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
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-stone-300 text-stone-600'
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
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'border-stone-300 text-stone-600'
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
            className="border border-stone-300 rounded-lg px-3 py-2 text-sm"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* خيارات شرعية */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={needsReview}
            onChange={(e) => setNeedsReview(e.target.checked)}
            className="w-4 h-4 accent-amber-600"
          />
          <span className="text-sm text-amber-900">
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
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'جارٍ الحفظ...' : '💾 حفظ كمسودة'}
        </button>
        <Link
          href="/admin/content"
          className="px-6 py-2.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors"
        >
          إلغاء
        </Link>
      </div>
    </form>
  );
}
