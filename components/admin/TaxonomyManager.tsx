'use client';

import { useCallback, useEffect, useState } from 'react';

interface Taxonomy {
  id: string;
  kind: string;
  lang: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

const KIND_OPTIONS = [
  { value: 'topic', label: 'موضوع' },
  { value: 'category', label: 'تصنيف' },
  { value: 'tag', label: 'وسم' },
  { value: 'field', label: 'مجال' },
  { value: 'series', label: 'سلسلة' },
];

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function TaxonomyManager() {
  const [items, setItems] = useState<Taxonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [kind, setKind] = useState('topic');
  const [lang, setLang] = useState('ar');
  const [icon, setIcon] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/taxonomies?lang=ar', { credentials: 'include' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'فشل تحميل التصنيفات');
      setItems(json.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل تحميل التصنيفات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createTaxonomy = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/taxonomies', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: slug || makeSlug(name),
          kind,
          lang,
          icon,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'فشل إنشاء التصنيف');
      if (lang === 'ar') setItems((current) => [...current, json.taxonomy]);
      setName('');
      setSlug('');
      setIcon('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل إنشاء التصنيف');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={createTaxonomy} className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-primary-950">إضافة تصنيف</h2>
        <div className="grid gap-3 md:grid-cols-5">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="اسم التصنيف"
            required
            className="rounded-lg border border-stone-300 px-3 py-2 md:col-span-2"
          />
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="الرابط المختصر"
            dir="ltr"
            className="rounded-lg border border-stone-300 px-3 py-2"
          />
          <select value={kind} onChange={(event) => setKind(event.target.value)} className="rounded-lg border border-stone-300 bg-white px-3 py-2">
            {KIND_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={lang} onChange={(event) => setLang(event.target.value)} className="rounded-lg border border-stone-300 bg-white px-3 py-2">
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <input
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
            placeholder="أيقونة اختيارية"
            className="rounded-lg border border-stone-300 px-3 py-2"
          />
          <button type="submit" disabled={saving} className="rounded-lg bg-primary-700 px-5 py-2 text-sm text-white disabled:opacity-50">
            {saving ? 'جارٍ الحفظ...' : 'إضافة'}
          </button>
        </div>
      </form>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-primary-950">التصنيفات العربية</h2>
        {loading ? (
          <p className="text-sm text-stone-500">جارٍ التحميل...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-stone-500">لم تُضف تصنيفات بعد.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-center gap-2">
                  <span>{item.icon || '🏷️'}</span>
                  <strong className="text-stone-800">{item.name}</strong>
                </div>
                <p className="mt-1 text-xs text-stone-500" dir="ltr">{item.kind} · {item.slug}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
