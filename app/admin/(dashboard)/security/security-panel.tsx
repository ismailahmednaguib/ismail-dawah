"use client";
// app/admin/(dashboard)/security/security-panel.tsx
// تحرير حدود المعدّل لكل نطاق — يُخزَّن في site_settings ويُطبَّق فورًا.

import { useCallback, useEffect, useState } from "react";

type ScopeConfig = { windowSeconds: number; max: number };

type ApiResponse = {
  ok?: boolean;
  error?: string;
  scopes?: { scope: string; label: string }[];
  defaults?: Record<string, ScopeConfig>;
  config?: Record<string, ScopeConfig>;
  sharedStore?: "ready" | "missing" | "unknown";
  canEdit?: boolean;
  updatedAt?: string | null;
};

const SCOPE_HINTS: Record<string, string> = {
  "admin-login": "حماية لوحة التحكم من التخمين المتكرر",
  login: "دخول عام للمستخدمين",
  register: "منع إنشاء حسابات وهمية بالجملة",
  questions: "منع إغراق صندوق الأسئلة",
  newsletter: "منع إساءة استخدام النشرة",
  "public-api": "حماية واجهة المحتوى العامة",
  assistant: "تقليل إساءة استخدام المساعد وتكلفة مزود الذكاء الاصطناعي",
  analytics: "يُطبَّق في الذاكرة (حجم مرتفع)",
  verify: "حماية مسار التحقق",
  upload: "يُطبَّق في الذاكرة داخل تقييد الرفع",
};

export default function SecurityPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scopes, setScopes] = useState<{ scope: string; label: string }[]>([]);
  const [defaults, setDefaults] = useState<Record<string, ScopeConfig>>({});
  const [config, setConfig] = useState<Record<string, ScopeConfig>>({});
  const [sharedStore, setSharedStore] = useState<string>("unknown");
  const [canEdit, setCanEdit] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/security", { cache: "no-store" });
      const data: ApiResponse = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "تعذّر تحميل الإعدادات");
      setScopes(data.scopes ?? []);
      setDefaults(data.defaults ?? {});
      setConfig(data.config ?? {});
      setSharedStore(data.sharedStore ?? "unknown");
      setCanEdit(Boolean(data.canEdit));
      setUpdatedAt(data.updatedAt ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function update(scope: string, field: keyof ScopeConfig, raw: string) {
    const value = Number(raw);
    setConfig((prev) => ({
      ...prev,
      [scope]: {
        ...prev[scope],
        windowSeconds: field === "windowSeconds" ? value : prev[scope]?.windowSeconds ?? 60,
        max: field === "max" ? value : prev[scope]?.max ?? 10,
      },
    }));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data: ApiResponse = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "تعذّر الحفظ");
      setConfig(data.config ?? config);
      setMessage("تم الحفظ — تُطبَّق الحدود الجديدة فورًا على الموقع.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
    } finally {
      setSaving(false);
    }
  }

  function resetScope(scope: string) {
    setConfig((prev) => ({ ...prev, [scope]: { ...defaults[scope] } }));
  }

  if (loading) {
    return <section className="card p-5 text-sm opacity-70">جارٍ تحميل حدود المعدّل…</section>;
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-4 dark:border-white/10">
        <div>
          <h2 className="text-base font-bold">حدود المعدّل</h2>
          <p className="text-xs opacity-70">
            المخزن:{" "}
            {sharedStore === "ready"
              ? "مشترك بين كل النسخ (Postgres) ✔"
              : sharedStore === "missing"
                ? "احتياطي في الذاكرة — نفّذ migration «20261017_security_and_review.sql»"
                : "غير معروف — يعمل الاحتياطي في الذاكرة"}
            {updatedAt ? ` · آخر تحديث: ${new Date(updatedAt).toLocaleString("ar")}` : ""}
          </p>
        </div>
        {canEdit && (
          <button type="button" className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "جارٍ الحفظ…" : "حفظ الحدود"}
          </button>
        )}
      </div>

      {message && (
        <p className="border-b border-primary-500/20 bg-primary-500/10 px-4 py-2 text-sm text-primary-700 dark:text-primary-300">
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
              <th className="p-3 text-right">النطاق</th>
              <th className="p-3 text-right">الحد الأقصى (طلب)</th>
              <th className="p-3 text-right">النافذة (ثانية)</th>
              <th className="p-3 text-right">الافتراضي</th>
              <th className="p-3 text-right">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {scopes.map(({ scope, label }) => {
              const cfg = config[scope] ?? defaults[scope] ?? { max: 10, windowSeconds: 60 };
              const def = defaults[scope];
              const changed = def && (cfg.max !== def.max || cfg.windowSeconds !== def.windowSeconds);
              return (
                <tr key={scope} className="border-t border-black/5 dark:border-white/10">
                  <td className="p-3">
                    <p className="font-bold">{label}</p>
                    <p className="text-xs opacity-60">{SCOPE_HINTS[scope] ?? scope}</p>
                  </td>
                  <td className="p-3">
                    <input
                      className="input-islamic w-24"
                      type="number"
                      min={1}
                      value={cfg.max}
                      disabled={!canEdit}
                      onChange={(e) => update(scope, "max", e.target.value)}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className="input-islamic w-28"
                      type="number"
                      min={1}
                      value={cfg.windowSeconds}
                      disabled={!canEdit}
                      onChange={(e) => update(scope, "windowSeconds", e.target.value)}
                    />
                  </td>
                  <td className="p-3 text-xs opacity-60" dir="ltr">
                    {def ? `${def.max} / ${def.windowSeconds}s` : "—"}
                  </td>
                  <td className="p-3">
                    {canEdit && changed ? (
                      <button
                        type="button"
                        className="text-xs underline"
                        onClick={() => resetScope(scope)}
                      >
                        استرجاع الافتراضي
                      </button>
                    ) : (
                      <span className="text-xs opacity-40">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!canEdit && (
        <p className="border-t border-black/5 p-4 text-xs opacity-70 dark:border-white/10">
          العرض فقط: تحتاج صلاحية «إدارة الإعدادات» (مدير عام) للتعديل.
        </p>
      )}
    </section>
  );
}
