'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface Taxonomy {
  id: string;
  kind: string;
  name: string;
  slug: string;
  icon: string | null;
}

export default function ContentTermsEditor({
  contentId,
  canEdit,
}: {
  contentId: string;
  canEdit: boolean;
}) {
  const [items, setItems] = useState<Taxonomy[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [taxonomiesResponse, termsResponse] = await Promise.all([
        fetch('/api/admin/taxonomies?lang=ar', { credentials: 'include' }),
        fetch(`/api/admin/content/${contentId}/terms`, { credentials: 'include' }),
      ]);
      const taxonomies = await taxonomiesResponse.json();
      const terms = await termsResponse.json();
      if (!taxonomiesResponse.ok) throw new Error(taxonomies.error ?? 'فشل تحميل التصنيفات');
      if (!termsResponse.ok) throw new Error(terms.error ?? 'فشل تحميل تصنيفات المحتوى');
      setItems(taxonomies.data ?? []);
      setSelected((terms.data ?? []).map((item: Taxonomy) => item.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل تحميل التصنيفات');
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!canEdit) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`/api/admin/content/${contentId}/terms`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxonomy_ids: selected }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'فشل حفظ التصنيفات');
      setMessage('تم حفظ التصنيفات');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حفظ التصنيفات');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-medium text-stone-700">🏷️ التصنيفات والوسوم</h3>
          <p className="mt-1 text-xs text-stone-500">استخدمها لتجميع القرآن والحديث والفقه والمكتبة.</p>
        </div>
        {canEdit && <Link href="/admin/taxonomies" className="text-xs text-primary-700 hover:underline">إدارة التصنيفات</Link>}
      </div>

      {loading ? (
        <p className="text-sm text-stone-500">جارٍ التحميل...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-stone-500">لا توجد تصنيفات. أنشئ أول تصنيف من صفحة الإدارة.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm hover:border-primary-300">
              <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} disabled={!canEdit} className="accent-primary-700" />
              <span>{item.icon || '🏷️'}</span>
              <span>{item.name}</span>
            </label>
          ))}
        </div>
      )}

      {canEdit && (
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={() => void save()} disabled={saving || loading} className="rounded-lg bg-primary-700 px-4 py-2 text-sm text-white disabled:opacity-50">
            {saving ? 'جارٍ الحفظ...' : 'حفظ التصنيفات'}
          </button>
          {message && <span className="text-sm text-primary-700">{message}</span>}
          {error && <span className="text-sm text-red-700">{error}</span>}
        </div>
      )}
    </section>
  );
}
