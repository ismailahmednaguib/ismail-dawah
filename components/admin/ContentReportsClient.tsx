'use client';

import { useCallback, useEffect, useState } from 'react';

type ReportStatus = 'new' | 'triaged' | 'resolved' | 'ignored';
type Report = {
  id: string;
  page_url: string;
  page_title: string;
  description: string;
  email: string | null;
  lang: 'ar' | 'en';
  status: ReportStatus;
  resolution_note: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<ReportStatus, string> = { new: 'جديد', triaged: 'قيد المعالجة', resolved: 'تم التصحيح', ignored: 'غير معتمد' };

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function ContentReportsClient() {
  const [status, setStatus] = useState<ReportStatus>('new');
  const [reports, setReports] = useState<Report[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/content-reports?status=${status}`, { credentials: 'include', cache: 'no-store' });
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; error?: string; reports?: Report[] };
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || 'تعذر تحميل البلاغات.');
      const items = payload.reports || [];
      setReports(items);
      setNotes((current) => Object.fromEntries(items.map((item) => [item.id, current[item.id] ?? item.resolution_note ?? ''])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل البلاغات.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  async function update(report: Report, nextStatus: ReportStatus) {
    setSaving(report.id);
    setError('');
    try {
      const response = await fetch('/api/admin/content-reports', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: report.id, status: nextStatus, resolution_note: notes[report.id] || '' }),
      });
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || 'تعذر تحديث البلاغ.');
      setReports((current) => current.filter((item) => item.id !== report.id));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'تعذر تحديث البلاغ.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="mt-10 space-y-4" aria-labelledby="content-reports-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="content-reports-title" className="text-xl font-black text-primary-950 dark:text-white">بلاغات أخطاء المحتوى</h2>
          <p className="mt-1 text-sm text-stone-500">بلاغات خاصة يرسلها الزوار من صفحات القراءة، مع رابط الصفحة ووصف المشكلة.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABELS) as ReportStatus[]).map((value) => (
            <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-xl px-3 py-2 text-xs font-bold ${status === value ? 'bg-primary-800 text-white' : 'border border-cream-300 bg-white text-primary-900'}`}>
              {STATUS_LABELS[value]}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      {loading ? <div className="admin-card h-32 animate-pulse" /> : reports.length === 0 ? <div className="admin-card border-dashed p-8 text-center text-sm text-stone-500">لا توجد بلاغات في هذا القسم.</div> : (
        <div className="space-y-4">
          {reports.map((report) => (
            <article key={report.id} className="admin-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                <span>{report.lang === 'ar' ? 'عربي' : 'English'} · {formatDate(report.created_at)}</span>
                {report.email && <a href={`mailto:${report.email}`} className="text-primary-700 hover:underline" dir="ltr">{report.email}</a>}
              </div>
              <h3 className="mt-3 font-black text-primary-950 dark:text-white">{report.page_title}</h3>
              <a href={report.page_url} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-primary-700 underline dark:text-primary-300" dir="ltr">{report.page_url}</a>
              <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-primary-950 dark:text-white">{report.description}</p>
              <textarea value={notes[report.id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [report.id]: event.target.value }))} rows={2} maxLength={2000} placeholder="ملاحظة المعالجة (اختياري)" className="input-islamic mt-4" />
              <div className="mt-3 flex flex-wrap gap-2">
                {status === 'new' && <button type="button" onClick={() => void update(report, 'triaged')} disabled={saving === report.id} className="btn-outline disabled:opacity-60">بدء المعالجة</button>}
                {(status === 'new' || status === 'triaged') && <button type="button" onClick={() => void update(report, 'resolved')} disabled={saving === report.id} className="btn-primary disabled:opacity-60">تم التصحيح</button>}
                {(status === 'new' || status === 'triaged') && <button type="button" onClick={() => void update(report, 'ignored')} disabled={saving === report.id} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-60">غير معتمد</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
