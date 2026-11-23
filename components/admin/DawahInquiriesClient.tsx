'use client';

import { useCallback, useEffect, useState } from 'react';

type Inquiry = {
  id: string;
  question: string;
  email: string | null;
  lang: 'ar' | 'en';
  page_slug: string | null;
  status: 'pending' | 'answered' | 'closed';
  answer: string | null;
  created_at: string;
};

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function DawahInquiriesClient() {
  const [status, setStatus] = useState<'pending' | 'answered' | 'closed'>('pending');
  const [items, setItems] = useState<Inquiry[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/dawah-inquiries?status=${status}`, { credentials: 'include', cache: 'no-store' });
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; error?: string; inquiries?: Inquiry[] };
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || 'تعذر تحميل أسئلة البوابة.');
      const next = payload.inquiries || [];
      setItems(next);
      setDrafts((current) => {
        const result = { ...current };
        next.forEach((item) => { if (!(item.id in result)) result[item.id] = item.answer || ''; });
        return result;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل الأسئلة.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  async function save(item: Inquiry) {
    const answer = (drafts[item.id] || '').trim();
    if (!answer) {
      setError('اكتب الإجابة قبل الحفظ.');
      return;
    }
    setSaving(item.id);
    setError('');
    try {
      const response = await fetch('/api/admin/dawah-inquiries', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, answer }),
      });
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; error?: string; inquiry?: Inquiry };
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || 'تعذر حفظ الإجابة.');
      setItems((current) => status === 'pending' ? current.filter((row) => row.id !== item.id) : current.map((row) => row.id === item.id ? { ...row, answer, status: 'answered' } : row));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'تعذر حفظ الإجابة.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="mt-8 space-y-4" aria-labelledby="dawah-inquiries-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="dawah-inquiries-title" className="text-xl font-black text-primary-950 dark:text-white">أسئلة بوابة غير المسلمين</h2>
          <p className="mt-1 text-sm text-stone-500">أسئلة عامة أُرسلت بدون اشتراط تسجيل أو بريد.</p>
        </div>
        <div className="flex gap-2">
          {(['pending', 'answered', 'closed'] as const).map((value) => (
            <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-xl px-3 py-2 text-xs font-bold ${status === value ? 'bg-primary-800 text-white' : 'border border-cream-300 bg-white text-primary-900'}`}>
              {value === 'pending' ? 'معلقة' : value === 'answered' ? 'تمت الإجابة' : 'مغلقة'}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      {loading ? <div className="admin-card h-32 animate-pulse" /> : items.length === 0 ? <div className="admin-card border-dashed p-8 text-center text-sm text-stone-500">لا توجد أسئلة في هذا القسم.</div> : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="admin-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                <span>{item.lang === 'ar' ? 'عربي' : 'English'} · {formatDate(item.created_at)}</span>
                {item.email && <a href={`mailto:${item.email}`} className="text-primary-700 hover:underline" dir="ltr">{item.email}</a>}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-base font-bold leading-8 text-primary-950 dark:text-white">{item.question}</p>
              {item.page_slug && <p className="mt-2 text-xs text-stone-400">المسار: {item.page_slug}</p>}
              <textarea value={drafts[item.id] || ''} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))} rows={4} maxLength={10000} placeholder="اكتب إجابة واضحة ومراجعة علميًا..." className="input-islamic mt-4" />
              <button type="button" onClick={() => void save(item)} disabled={saving === item.id} className="btn-primary mt-3 disabled:opacity-60">{saving === item.id ? 'جارٍ الحفظ...' : 'حفظ ونشر الإجابة'}</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
