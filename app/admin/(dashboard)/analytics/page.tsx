// app/admin/(dashboard)/analytics/page.tsx
// تحليلات المنصة: زيارة/صفحة/لغة/جلسة، محسوبة مباشرةً من analytics_events.
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'التحليلات | لوحة التحكم',
};

const RANGES: { key: string; label: string; days: number }[] = [
  { key: '7', label: '٧ أيام', days: 7 },
  { key: '30', label: '٣٠ يومًا', days: 30 },
  { key: '90', label: '٩٠ يومًا', days: 90 },
];

const MAX_ROWS = 20_000;

type EventRow = {
  page: string | null;
  lang: string | null;
  session_id: string | null;
  type: string | null;
  created_at: string;
};

function topEntries(map: Map<string, number>, limit: number) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (!can(session.roles, 'audit.read')) redirect('/admin');

  const sp = await searchParams;
  const range = RANGES.find((r) => r.key === sp.range) ?? RANGES[0];

  const since = new Date(Date.now() - range.days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await getSupabaseAdmin()
    .from('analytics_events')
    .select('page, lang, session_id, type, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(MAX_ROWS);

  const rows = (error ? [] : (data ?? [])) as EventRow[];

  const pages = new Map<string, number>();
  const langs = new Map<string, number>();
  const sessions = new Set<string>();
  const days = new Map<string, number>();

  for (const row of rows) {
    const page = row.page || '/';
    pages.set(page, (pages.get(page) ?? 0) + 1);
    const lang = row.lang || 'ar';
    langs.set(lang, (langs.get(lang) ?? 0) + 1);
    if (row.session_id) sessions.add(row.session_id);
    const day = (row.created_at || '').slice(0, 10);
    if (day) days.set(day, (days.get(day) ?? 0) + 1);
  }

  const dailySeries = [...days.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const maxDaily = dailySeries.reduce((max, [, count]) => Math.max(max, count), 1);
  const topPages = topEntries(pages, 20);
  const topLangs = topEntries(langs, 5);

  const totals = {
    views: rows.length,
    sessions: sessions.size,
    pages: pages.size,
  };

  const avgPerSession = totals.sessions ? Math.round(totals.views / totals.sessions) : 0;

  return (
    <div className="space-y-6">
      <header className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h1 className="text-xl font-bold">▲ تحليلات المنصة</h1>
          <p className="mt-1 text-sm opacity-80">
            آخر {range.label} — {error ? "تعذّر قراءة الجدول" : `${totals.views} حدثًا`}
          </p>
        </div>
        <nav className="flex gap-2 text-xs">
          {RANGES.map((r) => (
            <a
              key={r.key}
              href={`/admin/analytics?range=${r.key}`}
              className={`rounded-full px-3 py-1 ${
                r.key === range.key
                  ? 'bg-primary-700 text-white'
                  : 'bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20'
              }`}
            >
              {r.label}
            </a>
          ))}
        </nav>
      </header>

      {error && (
        <section className="card p-5 text-sm text-amber-700 dark:text-amber-300">
          تعذّر قراءة <code dir="ltr">analytics_events</code>: نفّذ migration التحليلات على قاعدة
          الإنتاج.
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs opacity-70">مشاهدات الصفحات</p>
          <p className="mt-1 text-2xl font-bold">{totals.views.toLocaleString('ar')}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs opacity-70">جلسات مستقلة</p>
          <p className="mt-1 text-2xl font-bold">{totals.sessions.toLocaleString('ar')}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs opacity-70">متوسط الصفحات لكل جلسة</p>
          <p className="mt-1 text-2xl font-bold">{avgPerSession.toLocaleString('ar')}</p>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-bold">التوزيع اليومي</h2>
        {dailySeries.length === 0 ? (
          <p className="mt-2 text-sm opacity-70">لا بيانات في هذه المدة.</p>
        ) : (
          <div className="mt-4 flex h-40 items-end gap-1 overflow-x-auto">
            {dailySeries.map(([day, count]) => (
              <div key={day} className="flex min-w-[10px] flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-[var(--primary)] opacity-80"
                  style={{ height: `${Math.max((count / maxDaily) * 100, 2)}%` }}
                  title={`${day}: ${count}`}
                />
                <span className="hidden text-[9px] opacity-50 sm:block">{day.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card overflow-hidden">
          <h2 className="border-b border-black/5 p-4 text-base font-bold dark:border-white/10">
            أكثر الصفحات زيارة
          </h2>
          <ul className="divide-y divide-black/5 text-sm dark:divide-white/10">
            {topPages.length === 0 && <li className="p-4 text-sm opacity-70">لا بيانات.</li>}
            {topPages.map(([page, count]) => (
              <li key={page} className="flex items-center justify-between gap-3 p-3">
                <span className="truncate font-mono text-xs" dir="ltr">
                  {page}
                </span>
                <span className="shrink-0 text-xs opacity-70">{count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card overflow-hidden">
          <h2 className="border-b border-black/5 p-4 text-base font-bold dark:border-white/10">
            توزيع اللغات
          </h2>
          <ul className="divide-y divide-black/5 text-sm dark:divide-white/10">
            {topLangs.length === 0 && <li className="p-4 text-sm opacity-70">لا بيانات.</li>}
            {topLangs.map(([lang, count]) => {
              const pct = totals.views ? Math.round((count / totals.views) * 100) : 0;
              return (
                <li key={lang} className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{lang === 'ar' ? 'العربية' : lang === 'en' ? 'الإنجليزية' : lang}</span>
                    <span className="text-xs opacity-70">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {totals.views >= MAX_ROWS && (
        <p className="text-xs opacity-60">
          ملاحظة: الأرقام محسوبة على أول {MAX_ROWS.toLocaleString('ar')} حدث في المدة المحدّدة.
        </p>
      )}
    </div>
  );
}
