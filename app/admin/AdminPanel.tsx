"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type ContentStats = Record<string, number>;

type DashboardStats = {
  ok?: boolean;
  content?: ContentStats;
  users?: { total?: number };
  questions?: { total?: number; pending?: number; answered?: number };
  review?: { pending?: number };
  languages?: number;
  meta?: { dbConfigured?: boolean; generatedAt?: string; warnings?: string[] };
};

type AdvancedStats = {
  ok?: boolean;
  todayViews?: number;
  subscribers?: number;
  topPages?: Array<{ page?: string; count?: number }>;
  topLanguages?: Array<{ lang?: string; count?: number }>;
};

const EMPTY_STATS: DashboardStats = {
  content: {},
  users: { total: 0 },
  questions: { total: 0, pending: 0, answered: 0 },
  languages: 0,
};

const CONTENT_LABELS: Record<string, string> = {
  fields: "العلوم والمجالات",
  lessons: "الدروس",
  videos: "الفيديوهات",
  articles: "المقالات",
  books: "الكتب",
  audio: "الصوتيات",
  photos: "الصور",
  fatwas: "الفتاوى",
  doubts: "الأسئلة والشبهات",
  courses: "الدورات",
  research: "الأبحاث",
  hadith: "الأحاديث",
  stories: "القصص",
  faq: "الأسئلة الشائعة",
  events: "الفعاليات",
  projects: "المشاريع",
  news: "الأخبار",
  places: "الأماكن",
  adhkar: "الأذكار",
};

const QUICK_ACTIONS = [
  {
    href: "/admin/content/new",
    icon: "＋",
    title: "إضافة محتوى",
    description: "أنشئ درسًا أو مقالًا أو مادة جديدة",
    tone: "gold",
  },
  {
    href: "/admin/content",
    icon: "▤",
    title: "إدارة المحتوى",
    description: "راجع المواد وعدّل حالتها ونشرها",
    tone: "primary",
  },
  {
    href: "/admin/review",
    icon: "⌁",
    title: "المراجعة العلمية",
    description: "تابع المحتوى الذي ينتظر الاعتماد",
    tone: "primary",
  },
  {
    href: "/admin/users",
    icon: "♙",
    title: "ترقية مستخدم",
    description: "امنح مستخدمًا دور مدير من صفحة الأدوار",
    tone: "gold",
  },
] as const;

function formatNumber(value: number | undefined): string {
  return new Intl.NumberFormat("ar-EG").format(Math.max(0, Number(value) || 0));
}

function StatCard({
  label,
  value,
  icon,
  hint,
  accent,
}: {
  label: string;
  value: number | undefined;
  icon: string;
  hint: string;
  accent: "primary" | "gold" | "dark";
}) {
  const accentClasses = {
    primary: "bg-primary-50 text-primary-700 border-primary-100",
    gold: "bg-gold-50 text-gold-700 border-gold-200",
    dark: "bg-primary-950 text-gold-300 border-primary-900",
  } as const;

  return (
    <article className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-primary-800">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-primary-950">
            {formatNumber(value)}
          </p>
          <p className="mt-1 text-xs text-stone-500">{hint}</p>
        </div>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-xl ${accentClasses[accent]}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
    </article>
  );
}

export default function AdminPanel({
  canManageSettings = false,
  canManageNotifications = false,
}: {
  canManageSettings?: boolean;
  canManageNotifications?: boolean;
}) {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [advanced, setAdvanced] = useState<AdvancedStats>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    setError("");
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsResponse, advancedResponse] = await Promise.all([
        fetch("/api/stats", { credentials: "include", cache: "no-store" }),
        fetch("/api/stats/advanced", {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (statsResponse.status === 401 || statsResponse.status === 403) {
        window.location.href = "/ar/login";
        return;
      }

      const nextStats = (await statsResponse.json().catch(() => ({}))) as DashboardStats;
      const nextAdvanced = (await advancedResponse.json().catch(() => ({}))) as AdvancedStats;

      if (!statsResponse.ok || nextStats?.ok === false) {
        throw new Error("تعذر تحميل إحصائيات اللوحة.");
      }

      setStats(nextStats);
      if (advancedResponse.ok && nextAdvanced?.ok !== false) {
        setAdvanced(nextAdvanced);
      }
    } catch (loadError) {
      console.error("[AdminPanel] dashboard load error:", loadError);
      setError("تعذر تحميل بعض البيانات الآن. جرّب تحديث اللوحة.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const contentEntries = useMemo(
    () =>
      Object.entries(stats.content ?? {})
        .map(([key, value]) => ({
          key,
          label: CONTENT_LABELS[key] ?? key,
          value: Number(value) || 0,
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value),
    [stats.content]
  );

  const totalContent = Object.values(stats.content ?? {}).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0
  );
  const maxContent = Math.max(1, ...contentEntries.map((item) => item.value));
  const databaseReady = stats.meta?.dbConfigured !== false;
  const quickActions = [
    ...QUICK_ACTIONS,
    ...(canManageNotifications
      ? [
          {
            href: "/admin/notifications",
            icon: "♢",
            title: "إرسال إشعار",
            description: "نبّه المشتركين بآخر التحديثات",
            tone: "primary" as const,
          },
          {
            href: "/admin/newsletter",
            icon: "✉",
            title: "مشتركو النشرة",
            description: "راجع القائمة وأدر حالات الاشتراك",
            tone: "primary" as const,
          },
        ]
      : []),
    ...(canManageSettings
      ? [{
          href: "/admin/settings",
          icon: "⚙",
          title: "إعدادات المنصة",
          description: "تحكم في الهوية والتواصل والبث والعرض",
          tone: "primary" as const,
        }]
      : []),
  ];

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-primary-950 p-6 text-white shadow-card-lg md:p-8">
        <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-primary-700/30 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-300/30 bg-gold-300/10 px-3 py-1 text-xs font-bold text-gold-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold-300" />
              مركز إدارة الأكاديمية
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              لوحة التحكم
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-primary-100 md:text-base">
              نظرة سريعة على المحتوى والمستخدمين وحالة المنصة، مع وصول مباشر لأهم المهام.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
          >
            <span className={refreshing ? "animate-spin" : ""}>↻</span>
            {refreshing ? "جارٍ التحديث" : "تحديث البيانات"}
          </button>
        </div>
      </section>

      {!databaseReady ? (
        <div className="flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-900">
          <span className="text-xl" aria-hidden="true">⚠</span>
          <div>
            <p className="font-black">قاعدة البيانات غير متصلة بالكامل</p>
            <p className="mt-1 leading-6">أضف متغيرات Supabase وشغّل migrations حتى تظهر بيانات المستخدمين والمحتوى.</p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span>{error}</span>
          <button type="button" onClick={() => void loadDashboard(true)} className="font-black underline">
            إعادة المحاولة
          </button>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="ملخص الإحصائيات">
        <StatCard label="إجمالي المحتوى" value={totalContent} icon="▦" hint="كل المواد المنشورة والمضافة" accent="primary" />
        <StatCard label="المستخدمون" value={stats.users?.total} icon="♙" hint="الحسابات المسجلة في المنصة" accent="gold" />
        <Link href="/admin/questions" className="block rounded-2xl transition hover:-translate-y-0.5 hover:shadow-card">
          <StatCard label="أسئلة معلقة" value={stats.questions?.pending} icon="?" hint="تحتاج ردًا أو متابعة" accent="dark" />
        </Link>
        <Link href="/admin/review" className="block rounded-2xl transition hover:-translate-y-0.5 hover:shadow-card">
          <StatCard label="مراجعات معلقة" value={stats.review?.pending} icon="✓" hint="تنتظر اعتماد المراجع" accent="primary" />
        </Link>
        <StatCard label="زيارات اليوم" value={advanced.todayViews} icon="◉" hint="حسب سجل زيارات الموقع" accent="primary" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-primary-950">توزيع المحتوى</h2>
              <p className="mt-1 text-sm text-stone-500">أكثر الأقسام نشاطًا داخل المنصة</p>
            </div>
            <Link href="/admin/content" className="text-sm font-black text-primary-700 hover:text-primary-900 hover:underline">
              إدارة المحتوى
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4" aria-label="جارٍ تحميل الإحصائيات">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-8 animate-pulse rounded-xl bg-cream-100" />)}
            </div>
          ) : contentEntries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-cream-300 bg-cream-50 p-8 text-center text-sm text-stone-500">
              لا يوجد محتوى لعرضه بعد.
            </div>
          ) : (
            <div className="space-y-4">
              {contentEntries.slice(0, 8).map((item) => (
                <div key={item.key}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold text-primary-900">{item.label}</span>
                    <span className="font-black text-primary-700">{formatNumber(item.value)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-cream-100">
                    <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${Math.max(6, (item.value / maxContent) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-black text-primary-950">مؤشرات المنصة</h2>
          <p className="mt-1 text-sm text-stone-500">بيانات مختصرة تساعدك في المتابعة</p>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3">
              <span className="text-sm font-bold text-primary-800">اللغات المتاحة</span>
              <strong className="text-primary-950">{formatNumber(stats.languages)}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gold-50 px-4 py-3">
              <span className="text-sm font-bold text-gold-800">المشتركون</span>
              <strong className="text-gold-950">{formatNumber(advanced.subscribers)}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-cream-100 px-4 py-3">
              <span className="text-sm font-bold text-primary-800">إجمالي الأسئلة</span>
              <strong className="text-primary-950">{formatNumber(stats.questions?.total)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-primary-950">الوصول السريع</h2>
            <p className="mt-1 text-sm text-stone-500">ابدأ المهمة التي تريدها مباشرة</p>
          </div>
          <Link href="/admin/users" className="hidden text-sm font-black text-primary-700 hover:underline sm:block">
            إدارة الأدوار
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-2xl border border-cream-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-card"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-2xl font-black transition group-hover:scale-105 ${action.tone === "gold" ? "bg-gold-100 text-gold-800" : "bg-primary-100 text-primary-800"}`}>
                {action.icon}
              </span>
              <h3 className="mt-4 font-black text-primary-950">{action.title}</h3>
              <p className="mt-1 text-sm leading-6 text-stone-500">{action.description}</p>
              <span className="mt-4 inline-flex text-xs font-black text-primary-700">فتح القسم ←</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-primary-950">الصفحات الأكثر زيارة</h2>
              <p className="mt-1 text-xs text-stone-500">آخر 7 أيام</p>
            </div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">تحليلات</span>
          </div>
          {advanced.topPages?.length ? (
            <div className="space-y-3">
              {advanced.topPages.slice(0, 5).map((page, index) => (
                <div key={`${page.page}-${index}`} className="flex items-center gap-3 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-xs font-black text-primary-800">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-primary-800" dir="ltr">{page.page || "—"}</span>
                  <strong className="text-primary-950">{formatNumber(page.count)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-cream-50 p-5 text-center text-sm text-stone-500">ستظهر البيانات بعد تسجيل زيارات الموقع.</p>
          )}
        </div>

        <div className="rounded-2xl border border-primary-800 bg-primary-950 p-5 text-white shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/20 text-xl text-gold-300">✦</span>
            <div>
              <h2 className="font-black text-gold-200">خطوة إدارية مهمة</h2>
              <p className="mt-2 text-sm leading-7 text-primary-100">
                لترقية حساب موجود إلى مدير، افتح إدارة المستخدمين ثم فعّل دور «مدير» للحساب المطلوب. الصلاحية لا تظهر إلا للأدمن المصرّح له.
              </p>
              <Link href="/admin/users" className="mt-4 inline-flex rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-black text-primary-950 transition hover:bg-gold-400">
                فتح إدارة المستخدمين
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
