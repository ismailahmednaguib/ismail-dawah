"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { AdminSession } from "@/lib/admin/session";
import AuditClient from "@/components/admin/AuditClient";
import NewsletterSubscribersClient from "@/components/admin/NewsletterSubscribersClient";
import NotificationsClient from "@/components/admin/NotificationsClient";
import QuestionsClient from "@/components/admin/QuestionsClient";
import TranslationsClient from "@/components/admin/TranslationsClient";
import UsersClient from "@/components/admin/UsersClient";
import MediaLibraryClient from "@/components/admin/MediaLibraryClient";
import { DEFAULT_TOOL_SETTINGS, normalizeToolSettings, type ToolKey } from "@/lib/tool-settings";

type SessionState =
  | { status: "loading"; session: null; error: "" }
  | { status: "ready"; session: AdminSession; error: "" }
  | { status: "error"; session: null; error: string };

function SectionShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-primary-950">{title}</h2>
        <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

const TOOL_LABELS: Record<ToolKey, string> = {
  quran: "القرآن الكريم ومصادره",
  prayer: "مواقيت الصلاة",
  qibla: "القبلة",
  adhkar: "الأذكار",
  tasbih: "المسبحة",
  zakat: "الزكاة",
  inheritance: "الميراث",
  calendar: "التقويم الهجري",
  memorization: "خطة حفظ القرآن",
  dailyWird: "الورد اليومي",
};

function ToolsControlClient() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/settings", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as { settings?: Record<string, unknown>; error?: string };
        if (!response.ok) throw new Error(payload.error || "تعذر تحميل إعدادات الأدوات.");
        if (active) setSettings(payload.settings ?? {});
      })
      .catch((error: unknown) => active && setMessage(error instanceof Error ? error.message : "تعذر تحميل إعدادات الأدوات."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const tools = normalizeToolSettings(settings.tools);
  const setTool = (key: ToolKey, patch: Record<string, unknown>) => {
    setSettings((current) => ({
      ...current,
      tools: {
        ...tools,
        [key]: { ...tools[key], ...patch },
      },
    }));
    setMessage("");
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: { ...settings, tools: normalizeToolSettings(settings.tools) } }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "تعذر حفظ إعدادات الأدوات.");
      setMessage("تم حفظ إعدادات الأدوات وتطبيقها.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ إعدادات الأدوات.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-48 items-center justify-center text-sm text-stone-500">جارٍ تحميل إعدادات الأدوات…</div>;

  return (
    <div className="space-y-4">
      {message ? <div className="rounded-xl border border-primary-200 bg-primary-50 p-3 text-sm font-bold text-primary-800" role="status">{message}</div> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {(Object.keys(DEFAULT_TOOL_SETTINGS) as ToolKey[]).map((key) => (
          <article key={key} className="rounded-2xl border border-cream-200 bg-cream-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black text-primary-950">{TOOL_LABELS[key]}</h3>
              <label className="flex items-center gap-2 text-xs font-bold text-primary-800">
                <input type="checkbox" checked={tools[key].enabled} onChange={(event) => setTool(key, { enabled: event.target.checked })} className="h-4 w-4 accent-primary-700" />
                مفعّلة
              </label>
            </div>
            <p className="mt-2 text-xs leading-6 text-stone-500">المصدر: {tools[key].sourceLabel}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-bold text-primary-950">
                <span className="mb-2 block">نوع المصدر</span>
                <select value={tools[key].sourceMode} onChange={(event) => setTool(key, { sourceMode: event.target.value })} className="input-islamic w-full">
                  <option value="local">محلي</option>
                  <option value="external">خارجي</option>
                  <option value="device">الجهاز</option>
                  <option value="manual">يدوي</option>
                </select>
              </label>
              <label className="block text-sm font-bold text-primary-950">
                <span className="mb-2 block">اسم المصدر</span>
                <input value={tools[key].sourceLabel} onChange={(event) => setTool(key, { sourceLabel: event.target.value })} className="input-islamic w-full" />
              </label>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-bold text-primary-950">
                <span className="mb-2 block">رسالة البديل بالعربية</span>
                <textarea
                  value={tools[key].fallbackMessageAr}
                  onChange={(event) => setTool(key, { fallbackMessageAr: event.target.value })}
                  className="input-islamic min-h-20 w-full text-sm"
                  rows={3}
                />
              </label>
              <label className="block text-sm font-bold text-primary-950">
                <span className="mb-2 block">رسالة البديل بالإنجليزية</span>
                <textarea
                  value={tools[key].fallbackMessageEn}
                  onChange={(event) => setTool(key, { fallbackMessageEn: event.target.value })}
                  className="input-islamic min-h-20 w-full text-sm"
                  rows={3}
                  dir="ltr"
                />
              </label>
            </div>
          </article>
        ))}
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={() => void save()} disabled={saving} className="rounded-xl bg-primary-700 px-5 py-3 text-sm font-black text-white hover:bg-primary-800 disabled:opacity-60">
          {saving ? "جارٍ الحفظ…" : "حفظ إعدادات الأدوات"}
        </button>
      </div>
    </div>
  );
}

function ControlSurfaceAuditClient() {
  const [data, setData] = useState<{ generatedAt?: string | null; summary?: Record<string, number>; total?: number; elements?: Array<{ element_key?: string; page?: string; kind?: string; source_file?: string; line?: number; admin_key?: string | null; status?: string }> } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/admin/control-surface", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "تعذر تحميل سجل سطح الإدارة.");
        setData(payload);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "تعذر تحميل سجل سطح الإدارة."));
  }, []);

  if (error) return <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">{error}</div>;
  if (!data) return <div className="text-sm text-stone-500">جارٍ تحميل سجل الربط…</div>;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["كل العناصر", data.summary?.inventoried_elements ?? 0],
          ["غير مربوطة", data.summary?.unbound_static_elements ?? data.total ?? 0],
          ["مفاتيح الإعداد", data.summary?.settings_keys ?? 0],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-cream-200 bg-cream-50 p-4">
            <p className="text-xs font-bold text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-primary-950">{Number(value).toLocaleString("ar-EG")}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-stone-500">آخر توليد: {data.generatedAt ? new Date(data.generatedAt).toLocaleString("ar-EG") : "غير معروف"}</p>
      <div className="overflow-x-auto rounded-xl border border-cream-200">
        <table className="w-full min-w-[820px] text-right text-xs">
          <thead className="bg-cream-50 text-primary-800"><tr><th className="p-3">العنصر</th><th className="p-3">الصفحة</th><th className="p-3">الملف</th><th className="p-3">مفتاح الإدارة</th><th className="p-3">الحالة</th></tr></thead>
          <tbody className="divide-y divide-cream-100">
            {(data.elements ?? []).slice(0, 25).map((element, index) => (
              <tr key={element.element_key ?? index}><td className="p-3 font-mono" dir="ltr">{element.element_key ?? "—"}</td><td className="p-3">{element.page ?? "—"}</td><td className="p-3 font-mono" dir="ltr">{element.source_file ?? "—"}:{element.line ?? "—"}</td><td className="p-3 font-mono" dir="ltr">{element.admin_key ?? "—"}</td><td className="p-3">{element.status ?? "—"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function useAdminSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: "loading", session: null, error: "" });

  useEffect(() => {
    let active = true;

    void fetch("/api/admin/session", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          session?: AdminSession | null;
          error?: string;
        };
        if (!response.ok || !payload.session) {
          throw new Error(payload.error || "تعذر قراءة جلسة الإدارة.");
        }
        if (active) setState({ status: "ready", session: payload.session, error: "" });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: "error",
            session: null,
            error: error instanceof Error ? error.message : "تعذر قراءة جلسة الإدارة.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

function RoleAwareClient({ children }: { children: (session: AdminSession) => ReactNode }) {
  const state = useAdminSession();

  if (state.status === "loading") {
    return <div className="flex min-h-48 items-center justify-center text-sm text-stone-500">جارٍ تحميل صلاحيات الإدارة…</div>;
  }

  if (state.status === "error" || !state.session) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-800">
        {state.error || "لا توجد جلسة إدارة صالحة."}
      </div>
    );
  }

  return children(state.session);
}

export function UnifiedQuestionsTab() {
  return (
    <SectionShell title="أسئلة الزوار" subtitle="إدارة الأسئلة وتوزيعها والرد عليها من داخل لوحة التحكم الموحدة.">
      <QuestionsClient />
    </SectionShell>
  );
}

export function UnifiedNotificationsTab() {
  return (
    <SectionShell title="الإشعارات والنشرة البريدية" subtitle="إرسال إشعارات Web Push وإدارة مشتركي النشرة من المصدر نفسه.">
      <NotificationsClient />
      <NewsletterSubscribersClient />
    </SectionShell>
  );
}

export function UnifiedUsersTab() {
  return (
    <SectionShell title="المستخدمون والأدوار" subtitle="إدارة الحسابات والأدوار مع بقاء التحقق في جهة الخادم.">
      <RoleAwareClient>{(session) => <UsersClient session={session} />}</RoleAwareClient>
    </SectionShell>
  );
}

export function UnifiedTranslationsTab() {
  return (
    <SectionShell title="إدارة الترجمات" subtitle="تعديل النصوص المترجمة وتتبع حالة كل ترجمة.">
      <RoleAwareClient>{(session) => <TranslationsClient session={session} />}</RoleAwareClient>
    </SectionShell>
  );
}

export function UnifiedAuditTab() {
  return (
    <SectionShell title="سجل التدقيق" subtitle="تتبع التغييرات والإجراءات التي جرت على المنصة ومن قام بها.">
      <AuditClient />
      <div className="border-t border-cream-200 pt-6">
        <h3 className="mb-3 text-lg font-black text-primary-950">سجل ربط عناصر الموقع باللوحة</h3>
        <ControlSurfaceAuditClient />
      </div>
    </SectionShell>
  );
}

export function UnifiedToolsTab() {
  return (
    <SectionShell title="الأدوات الإسلامية" subtitle="مصدر مركزي لتشغيل الأدوات وتوثيق مصدر البيانات ورسائل البديل الآمن.">
      <ToolsControlClient />
    </SectionShell>
  );
}

export function UnifiedMediaTab() {
  return (
    <SectionShell title="مكتبة الوسائط" subtitle="عرض الملفات المرتبطة بالمحتوى ومراجعة النصوص البديلة وحذف الوسيط من مصدره.">
      <MediaLibraryClient />
    </SectionShell>
  );
}

