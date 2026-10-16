"use client";
// app/admin/(dashboard)/quality/quality-panel.tsx
// طابور مراجعة الترجمات: اعتماد أو إلغاء، مع ملخّص جودة يُحدَّث لحظيًّا.

import { useCallback, useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  content_id: string;
  lang: string;
  slug: string;
  title: string;
  body: string | null;
  is_machine_translated: boolean;
  is_reviewed: boolean;
  reviewed_at: string | null;
  updated_at: string | null;
};

type ApiResponse = {
  ok?: boolean;
  error?: string;
  filter?: string;
  counts?: { returned: number; missingBody: number; shortBody: number };
  stats?: { pending: number; machine: number; reviewed: number; total: number };
  citations?: { id: string; lang: string; slug: string; title: string; mentions: number }[];
  rows?: Row[];
  canReview?: boolean;
};

const FILTERS: { key: string; label: string }[] = [
  { key: "pending", label: "تنتظر مراجعة" },
  { key: "machine", label: "آلية كلها" },
  { key: "reviewed", label: "مُعتمَدة" },
  { key: "all", label: "الأحدث" },
];

export default function QualityPanel() {
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse>({});

  const load = useCallback(async (next: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/quality?filter=${next}`, { cache: "no-store" });
      const json: ApiResponse = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "تعذّر تحميل البيانات");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  async function review(id: string, action: "approve" | "unapprove") {
    setBusyId(id);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const json: ApiResponse = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "تعذّر التحديث");
      setMessage(action === "approve" ? "تم اعتماد الترجمة." : "تم إرجاع الترجمة للمراجعة.");
      await load(filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
    } finally {
      setBusyId(null);
    }
  }

  const stats = data.stats ?? { pending: 0, machine: 0, reviewed: 0, total: 0 };
  const counts = data.counts ?? { returned: 0, missingBody: 0, shortBody: 0 };

  const progress = useMemo(() => {
    if (!stats.total) return 0;
    return Math.round((stats.reviewed / stats.total) * 100);
  }, [stats.reviewed, stats.total]);

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm opacity-70">نسبة المراجعة البشرية</p>
            <p className="text-3xl font-bold">{progress}%</p>
            <p className="mt-1 text-xs opacity-70">
              مُعتمَدة {stats.reviewed} من {stats.total} · مترجمة آليًّا {stats.machine} · تنتظر{" "}
              {stats.pending}
            </p>
          </div>
          <div className="h-3 min-w-[200px] flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/10">
            بلا متن: {counts.missingBody}
          </span>
          <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/10">
            متن قصير (&lt; ٢٢٠ حرفًا): {counts.shortBody}
          </span>
          <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/10">
            المعروض: {counts.returned}
          </span>
        </div>
      </section>

      {(data.citations?.length ?? 0) > 0 && (
        <section className="card p-5">
          <h2 className="text-base font-bold">نصوص شرعية تحتاج تأكيد المصدر</h2>
          <p className="mt-1 text-xs opacity-70">
            هذه ترجمات وردت فيها إشارة إلى آية أو حديث؛ تأكّد أن مرجعها موثّق قبل النشر.
            الفحص الشامل: <code dir="ltr">npm run qa:citations</code>
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {data.citations?.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 border-t border-black/5 py-1.5 dark:border-white/10">
                <span className="truncate">
                  <span className="rounded bg-black/5 px-1.5 py-0.5 text-xs dark:bg-white/10">
                    {row.lang}
                  </span>{" "}
                  {row.title}
                </span>
                <span className="shrink-0 text-xs opacity-70">{row.mentions} إشارة</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-black/5 p-3 dark:border-white/10">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs ${
                filter === f.key
                  ? "bg-primary-600 text-white"
                  : "bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ms-auto text-xs opacity-60">
            {loading ? "جارٍ التحميل…" : `${data.rows?.length ?? 0} صفًّا`}
          </span>
        </div>

        {message && (
          <p className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            {message}
          </p>
        )}
        {error && (
          <p className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/5 text-xs dark:bg-white/5">
              <tr>
                <th className="p-3 text-right">العنوان</th>
                <th className="p-3 text-right">اللغة</th>
                <th className="p-3 text-right">المتن</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {!loading && (data.rows?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm opacity-70">
                    لا صفوف في هذا التصنيف — عمل ممتاز.
                  </td>
                </tr>
              )}
              {data.rows?.map((row) => {
                const bodyLength = (row.body ?? "").trim().length;
                return (
                  <tr key={row.id} className="border-t border-black/5 dark:border-white/10">
                    <td className="max-w-[280px] p-3">
                      <p className="truncate font-bold">{row.title}</p>
                      <p className="truncate font-mono text-xs opacity-50" dir="ltr">
                        {row.slug}
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-black/5 px-2 py-0.5 text-xs dark:bg-white/10">
                        {row.lang}
                      </span>
                    </td>
                    <td className="p-3 text-xs">
                      {bodyLength === 0 ? (
                        <span className="text-red-600 dark:text-red-400">فارغ</span>
                      ) : bodyLength < 220 ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          {bodyLength} حرفًا
                        </span>
                      ) : (
                        <span className="opacity-70">{bodyLength} حرفًا</span>
                      )}
                    </td>
                    <td className="p-3 text-xs">
                      {row.is_reviewed ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          ✔ مُعتمَدة
                          {row.reviewed_at
                            ? ` · ${new Date(row.reviewed_at).toLocaleDateString("ar")}`
                            : ""}
                        </span>
                      ) : row.is_machine_translated ? (
                        <span className="text-amber-600 dark:text-amber-400">آلية · بلا مراجعة</span>
                      ) : (
                        <span className="opacity-60">بشرية · بلا مراجعة</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap p-3">
                      {data.canReview ? (
                        row.is_reviewed ? (
                          <button
                            type="button"
                            className="text-xs underline disabled:opacity-40"
                            disabled={busyId === row.id}
                            onClick={() => review(row.id, "unapprove")}
                          >
                            إلغاء الاعتماد
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-primary px-3 py-1 text-xs disabled:opacity-40"
                            disabled={busyId === row.id}
                            onClick={() => review(row.id, "approve")}
                          >
                            {busyId === row.id ? "…" : "اعتماد"}
                          </button>
                        )
                      ) : (
                        <span className="text-xs opacity-40">عرض فقط</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
