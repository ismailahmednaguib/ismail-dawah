'use client';

import { useCallback, useEffect, useState } from 'react';

type Subscriber = {
  id?: string;
  email?: string;
  lang?: string;
  day_index?: number;
  next_send_at?: string;
  active?: boolean;
  completed_at?: string | null;
};

function formatDate(value?: string | null): string {
  if (!value) return '—';
  try { return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); } catch { return value; }
}

export default function DawahJourneySubscribersClient() {
  const [status, setStatus] = useState('active');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/dawah-journey?status=${status}&q=${encodeURIComponent(search)}`, { credentials: 'include', cache: 'no-store' });
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; error?: string; configured?: boolean; subscribers?: Subscriber[] };
      if (!response.ok || payload.ok === false) throw new Error(payload.error || 'تعذر تحميل مشتركي الرحلة.');
      setRows(payload.subscribers || []);
      setConfigured(payload.configured !== false);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل مشتركي الرحلة.');
    } finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { void load(); }, [load]);

  async function update(email: string, payload: { active?: boolean; reset?: boolean }) {
    setUpdating(email);
    setError('');
    try {
      const response = await fetch('/api/admin/dawah-journey', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, ...payload }) });
      const result = await response.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (!response.ok || result.ok === false) throw new Error(result.error || 'تعذر التحديث.');
      await load();
    } catch (updateError) { setError(updateError instanceof Error ? updateError.message : 'تعذر التحديث.'); }
    finally { setUpdating(null); }
  }

  return (
    <section className="admin-card p-5">
      <div className="mb-4">
        <h2 className="text-lg font-black text-primary-950">رحلة غير المسلمين — المشتركون</h2>
        <p className="mt-1 text-sm leading-6 text-stone-500">أوقف الاشتراك أو أعد المشترك إلى اليوم الأول. لا تُرسل الرسائل إلا إذا فُعّلت الرحلة وضُبطت خدمة البريد.</p>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالبريد الإلكتروني" className="input-islamic" dir="ltr" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="input-islamic"><option value="active">النشطون</option><option value="inactive">الموقوفون</option><option value="all">الكل</option></select>
        <button type="button" onClick={() => void load()} className="btn-primary">تحديث</button>
      </div>
      {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {!configured && <p className="mb-4 rounded-xl border border-gold-200 bg-gold-50 p-3 text-sm text-gold-900">نفّذ migration الرحلة في Supabase لعرض المشتركين.</p>}
      {loading ? <div className="h-32 animate-pulse rounded-xl bg-cream-100" /> : rows.length === 0 ? <p className="rounded-xl bg-cream-50 p-8 text-center text-sm text-stone-500">لا توجد نتائج.</p> : (
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-right text-sm"><thead><tr className="border-b border-cream-200 text-xs text-stone-500"><th className="pb-3">البريد</th><th className="pb-3">اللغة</th><th className="pb-3">اليوم</th><th className="pb-3">الرسالة التالية</th><th className="pb-3">الحالة</th><th className="pb-3">إجراء</th></tr></thead><tbody>{rows.map((row) => { const email = row.email || ''; const active = row.active !== false; return <tr key={row.id || email} className="border-b border-cream-100 last:border-0"><td className="py-3 font-bold text-primary-900" dir="ltr">{email}</td><td className="py-3">{row.lang || 'ar'}</td><td className="py-3">{row.completed_at ? 'مكتملة' : `${row.day_index || 1} / 7`}</td><td className="py-3 text-stone-600">{formatDate(row.next_send_at)}</td><td className="py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${active ? 'bg-primary-50 text-primary-700' : 'bg-stone-100 text-stone-600'}`}>{active ? 'نشط' : 'موقوف'}</span></td><td className="py-3"><div className="flex gap-3"><button type="button" disabled={updating === email} onClick={() => void update(email, { active: !active })} className="font-bold text-primary-700 underline disabled:opacity-50">{active ? 'إيقاف' : 'تفعيل'}</button>{!active && <button type="button" disabled={updating === email} onClick={() => void update(email, { reset: true })} className="font-bold text-gold-700 underline disabled:opacity-50">إعادة</button>}</div></td></tr>; })}</tbody></table></div>
      )}
    </section>
  );
}
