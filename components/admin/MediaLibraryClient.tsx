'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type MediaItem = {
  id: string;
  content_id: string;
  type: 'image' | 'pdf' | 'audio' | 'video';
  url: string;
  title: string | null;
  alt_text: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

const LABELS: Record<MediaItem['type'], string> = {
  image: 'صورة',
  pdf: 'PDF',
  audio: 'صوت',
  video: 'فيديو',
};

function formatSize(value: number | null): string {
  if (!value || value < 1) return '—';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryClient() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState<Record<string, { title: string; alt_text: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = type ? `?type=${encodeURIComponent(type)}` : '';
      const response = await fetch(`/api/admin/media${query}`, { credentials: 'include', cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'تعذر تحميل مكتبة الوسائط.');
      const nextItems = Array.isArray(payload.data) ? payload.data as MediaItem[] : [];
      setItems(nextItems);
      setDrafts(Object.fromEntries(nextItems.map((item) => [item.id, { title: item.title || '', alt_text: item.alt_text || '' }])));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'تعذر تحميل مكتبة الوسائط.');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (item: MediaItem) => {
    if (!window.confirm('حذف الوسيط من المادة؟')) return;
    try {
      const response = await fetch(`/api/admin/content/${encodeURIComponent(item.content_id)}/media/${encodeURIComponent(item.id)}`, { method: 'DELETE', credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'تعذر حذف الوسيط.');
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'تعذر حذف الوسيط.');
    }
  };

  const setDraft = (id: string, field: 'title' | 'alt_text', value: string) => {
    setDrafts((current) => ({
      ...current,
      [id]: { ...(current[id] || { title: '', alt_text: '' }), [field]: value },
    }));
  };

  const saveMeta = async (item: MediaItem) => {
    const draft = drafts[item.id] || { title: '', alt_text: '' };
    setSavingId(item.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/content/${encodeURIComponent(item.content_id)}/media/${encodeURIComponent(item.id)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draft.title, alt_text: draft.alt_text }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'تعذر حفظ بيانات الوسيط.');
      const updated = payload.media as Partial<MediaItem> | undefined;
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, ...updated } : entry));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'تعذر حفظ بيانات الوسيط.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-stone-500">كل ملف مرتبط بمادة منشورة أو مسودة، ويمكن فتح المادة المالكة قبل الحذف.</p>
        </div>
        <select value={type} onChange={(event) => setType(event.target.value)} className="input-islamic w-auto min-w-40">
          <option value="">كل الأنواع</option>
          <option value="image">صور</option>
          <option value="audio">صوت</option>
          <option value="video">فيديو</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">{error}</div> : null}
      {loading ? <div className="py-16 text-center text-sm text-stone-500">جارٍ تحميل المكتبة…</div> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 p-12 text-center text-sm text-stone-500">لا توجد وسائط مرتبطة حاليًا.</div> : (
        <div className="overflow-x-auto rounded-2xl border border-cream-200">
          <table className="w-full min-w-[780px] text-right text-sm">
            <thead className="bg-cream-50 text-primary-800"><tr><th className="p-3">النوع</th><th className="p-3">الملف</th><th className="p-3">النص البديل</th><th className="p-3">الحجم</th><th className="p-3">الإجراءات</th></tr></thead>
            <tbody className="divide-y divide-cream-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-cream-50">
                  <td className="p-3"><span className="badge-primary">{LABELS[item.type]}</span></td>
                  <td className="max-w-[260px] p-3"><a href={item.url} target="_blank" rel="noreferrer" className="block truncate font-mono text-xs text-primary-700 underline" dir="ltr">{item.title || item.url}</a><span className="mt-1 block truncate text-[11px] text-stone-400" dir="ltr">{item.mime_type || '—'}</span></td>
                  <td className="min-w-[280px] p-3">
                    <div className="space-y-2">
                      <input aria-label="عنوان الوسيط" value={drafts[item.id]?.title ?? item.title ?? ''} onChange={(event) => setDraft(item.id, 'title', event.target.value)} className="input-islamic w-full text-xs" placeholder="عنوان اختياري" />
                      <input aria-label="النص البديل للوسيط" value={drafts[item.id]?.alt_text ?? item.alt_text ?? ''} onChange={(event) => setDraft(item.id, 'alt_text', event.target.value)} className="input-islamic w-full text-xs" placeholder="النص البديل للصورة أو وصف الملف" />
                    </div>
                  </td>
                  <td className="p-3 text-xs" dir="ltr">{formatSize(item.size_bytes)}</td>
                  <td className="p-3"><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => void saveMeta(item)} disabled={savingId === item.id} className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-800 hover:bg-primary-100 disabled:opacity-60">{savingId === item.id ? 'جارٍ الحفظ…' : 'حفظ البيانات'}</button><Link href={`/admin/content/${encodeURIComponent(item.content_id)}`} className="rounded-lg bg-cream-100 px-3 py-1.5 text-xs font-bold text-primary-800 hover:bg-cream-200">فتح المادة</Link><button type="button" onClick={() => void remove(item)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-800 hover:bg-red-100">حذف</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

