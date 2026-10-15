"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';

type Subscriber = {
  id?: string | number;
  email?: string;
  name?: string | null;
  lang?: string | null;
  active?: boolean | null;
  subscribed_at?: string | null;
};

function formatDate(value?: string | null): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function NewsletterSubscribersClient() {
  const [status, setStatus] = useState('active');
  const [search, setSearch] = useState('');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/newsletter?status=${status}&q=${encodeURIComponent(search)}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; subscribers?: Subscriber[] };
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/ar/login';
        return;
      }
      if (!response.ok || payload.ok === false) throw new Error(payload.error || 'تعذر تحميل المشتركين.');
      setSubscribers(payload.subscribers || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل المشتركين.');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeCount = useMemo(() => subscribers.filter((item) => item.active !== false).length, [subscribers]);

  async function toggleSubscriber(item: Subscriber) {
    const email = item.email?.trim();
    if (!email) return;
    setUpdating(email);
    setError('');
    try {
      const response = await fetch('/api/admin/newsletter', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, active: item.active === false }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || payload.ok === false) throw new Error(payload.error || 'تعذر تحديث المشترك.');
      await load();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'تعذر تحديث المشترك.');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالبريد الإلكتروني" className="rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" dir="ltr" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm font-bold text-primary-900 outline-none focus:border-primary-500">
          <option value="active">النشطون</option>
          <option value="inactive">الموقوفون</option>
          <option value="all">الكل</option>
        </select>
        <button type="button" onClick={() => void load()} className="rounded-xl bg-primary-700 px-5 py-3 text-sm font-black text-white hover:bg-primary-800">تحديث</button>
      </div>

      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
      <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><p className="text-sm font-bold text-primary-800">المشتركون المعروضون</p><strong className="mt-1 block text-3xl font-black text-primary-950">{activeCount}</strong></div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">حتى 500 مشترك</span>
        </div>
        {loading ? <div className="h-40 animate-pulse rounded-xl bg-cream-100" /> : subscribers.length === 0 ? <p className="rounded-xl bg-cream-50 p-8 text-center text-sm text-stone-500">لا توجد نتائج.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead><tr className="border-b border-cream-200 text-xs text-stone-500"><th className="pb-3 font-bold">البريد</th><th className="pb-3 font-bold">الاسم</th><th className="pb-3 font-bold">اللغة</th><th className="pb-3 font-bold">تاريخ الاشتراك</th><th className="pb-3 font-bold">الحالة</th><th className="pb-3 font-bold">إجراء</th></tr></thead>
              <tbody>{subscribers.map((item) => {
                const email = item.email || '';
                const active = item.active !== false;
                return <tr key={`${email}-${item.id ?? item.subscribed_at ?? ''}`} className="border-b border-cream-100 last:border-0"><td className="py-4 font-bold text-primary-900" dir="ltr">{email}</td><td className="py-4 text-stone-600">{item.name || '—'}</td><td className="py-4 text-stone-600">{item.lang || 'ar'}</td><td className="py-4 text-stone-600">{formatDate(item.subscribed_at)}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? 'bg-primary-50 text-primary-700' : 'bg-stone-100 text-stone-600'}`}>{active ? 'نشط' : 'موقوف'}</span></td><td className="py-4"><button type="button" onClick={() => void toggleSubscriber(item)} disabled={updating === email} className="font-bold text-primary-700 underline disabled:opacity-50">{updating === email ? '...' : active ? 'إيقاف' : 'تفعيل'}</button></td></tr>;
              })}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
