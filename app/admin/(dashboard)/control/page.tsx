'use client';

/**
 * ISMAIL DAWAH - UNIFIED ADMIN CONTROL PANEL
 * صفحة التحكم الموحدة التي تجمع كل الصلاحيات في مكان واحد.
 * كل تغيير يُحفظ يُطبَّق فورًا على الواجهة الأمامية.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  PAGES,
  mergeSectionsConfig,
  mergeTitlesConfig,
  mergePagesVisibility,
} from '@/lib/page-sections';

type TabId =
  | 'dashboard'
  | 'settings'
  | 'sections'
  | 'content'
  | 'taxonomies'
  | 'translations'
  | 'review'
  | 'questions'
  | 'notifications'
  | 'users'
  | 'audit';

interface TabItem {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'لوحة المعلومات', icon: '▦' },
  { id: 'settings', label: 'إعدادات المنصة', icon: '⚙' },
  { id: 'sections', label: 'الأقسام والظهور', icon: '👁' },
  { id: 'content', label: 'إدارة المحتوى', icon: '✎' },
  { id: 'taxonomies', label: 'التصنيفات', icon: '⌘' },
  { id: 'translations', label: 'الترجمات', icon: '文' },
  { id: 'review', label: 'المراجعة العلمية', icon: '✓' },
  { id: 'questions', label: 'أسئلة الزوار', icon: '?' },
  { id: 'notifications', label: 'الإشعارات والنشرة', icon: '♢' },
  { id: 'users', label: 'المستخدمون والأدوار', icon: '♙' },
  { id: 'audit', label: 'سجل التدقيق', icon: '≡' },
];

function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  return fetch(input, { ...init, headers, credentials: 'include' });
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `خطأ HTTP ${res.status}`);
  }
  return res.json();
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-black text-primary-950">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
    </div>
  );
}

const STATUS_MAP: Record<string, { className: string; label: string }> = {
  published: { className: 'bg-green-100 text-green-800', label: 'منشور' },
  draft: { className: 'bg-slate-100 text-slate-600', label: 'مسودة' },
  in_review: { className: 'bg-gold-100 text-gold-800', label: 'تحت المراجعة' },
  archived: { className: 'bg-slate-200 text-slate-500', label: 'مؤرشف' },
  rejected: { className: 'bg-red-100 text-red-800', label: 'مرفوض' },
  pending: { className: 'bg-gold-100 text-gold-800', label: 'معلق' },
  approved: { className: 'bg-green-100 text-green-800', label: 'مُعتمد' },
  changes_requested: { className: 'bg-red-100 text-red-800', label: 'تعديلات مطلوبة' },
};

function StatusBadge({ status }: { status?: string }) {
  const info = status ? STATUS_MAP[status] : { className: 'bg-cream-100 text-stone-500', label: '—' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${info.className}`}>
      {info.label}
    </span>
  );
}

// ============================================================
// تبويب لوحة المعلومات
// ============================================================

async function fetchStats() {
  const [s, a] = await Promise.all([
    apiFetch('/api/stats', { cache: 'no-store' }).then(handleResponse),
    apiFetch('/api/stats/advanced', { cache: 'no-store' }).then(handleResponse),
  ]);
  return { stats: s, advanced: a };
}

function DashboardTab() {
  const [data, setData] = useState<{ stats: any; advanced: any } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchStats();
      setData(d);
    } catch (e) {
      console.error('[DashboardTab]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-stone-400">جارٍ التحميل…</div>;
  }
  if (!data) {
    return <div className="p-4 text-red-600 font-bold">تعذر تحميل البيانات</div>;
  }

  const { stats, advanced } = data;
  const content = stats?.content ?? {};
  const totalContent = Object.values(content).reduce(
    (sum: number, v: any) => sum + (Number(v) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <SectionHeader title="نظرة عامة على المنصة" subtitle="إحصائيات مباشرة من قاعدة البيانات" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-primary-700">إجمالي المحتوى</p>
          <p className="mt-2 text-3xl font-black text-primary-950">{totalContent}</p>
          <p className="mt-1 text-xs text-stone-500">كل المواد المنشورة والمضافة</p>
        </div>
        <div className="rounded-2xl border border-gold-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-gold-700">المستخدمون</p>
          <p className="mt-2 text-3xl font-black text-gold-900">{stats?.users?.total ?? 0}</p>
          <p className="mt-1 text-xs text-stone-500">الحسابات المسجلة في المنصة</p>
        </div>
        <div className="rounded-2xl border border-cream-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-primary-700">أسئلة معلقة</p>
          <p className="mt-2 text-3xl font-black text-primary-950">{stats?.questions?.pending ?? 0}</p>
          <p className="mt-1 text-xs text-stone-500">تحتاج ردًا أو متابعة</p>
        </div>
        <div className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-primary-700">مراجعات معلقة</p>
          <p className="mt-2 text-3xl font-black text-primary-950">{stats?.review?.pending ?? 0}</p>
          <p className="mt-1 text-xs text-stone-500">تنتظر اعتماد المراجع</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm">
          <SectionHeader title="توزيع المحتوى حسب النوع" />
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 animate-pulse rounded-xl bg-cream-100" />
              ))}
            </div>
          ) : Object.entries(content).length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-4">لا يوجد محتوى بعد.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(content)
                .sort((a, b) => Number(b[1]) - Number(a[1]))
                .slice(0, 6)
                .map(([key, val]) => {
                  const v = Number(val) || 0;
                  return (
                    <div key={key} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-primary-800 font-bold">{key}</span>
                      <span className="font-black text-primary-700">{v}</span>
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-cream-100">
                        <div
                          className="h-full rounded-full bg-primary-600"
                          style={{ width: `${Math.min(100, (v / Math.max(1, totalContent)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-primary-800 bg-primary-950 p-5 text-white shadow-sm">
          <SectionHeader title="حالة النظام" subtitle="تطبيقات التغييرات فورية عند الحفظ" />
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-primary-100">قاعدة البيانات</span>
              <span className="flex items-center gap-1 text-green-400 font-bold">متصل ✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary-100">اللوحات الفرعية</span>
              <span className="flex items-center gap-1 text-primary-100 font-bold">موحّدة</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary-100">حفظ فوري</span>
              <span className="flex items-center gap-1 text-green-400 font-bold">مفعل ✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// تبويب الإعدادات العامة (يُطبَّق فور الحفظ)
// ============================================================

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'boolean' | 'url' | 'color';
  ar?: boolean;
  en?: boolean;
}

const FIELDS: FieldDef[] = [
  { key: 'ownerName', label: 'اسم المنصة', type: 'text' },
  { key: 'shortName', label: 'الاسم المختصر', type: 'text' },
  { key: 'jobTitle', label: 'الوظيفة / المسمى', type: 'text' },
  { key: 'motto', label: 'الشعار (Meta)', type: 'text', ar: true, en: true },
  { key: 'homeTitle', label: 'عنوان الصفحة الرئيسية', type: 'text', ar: true, en: true },
  { key: 'homeSubtitle', label: 'وصف الصفحة الرئيسية', type: 'textarea', ar: true, en: true },
  { key: 'homeCta1', label: 'زر الاتصال الرئيسي 1', type: 'text', ar: true, en: true },
  { key: 'homeCta2', label: 'زر الاتصال الرئيسي 2', type: 'text', ar: true, en: true },
  { key: 'email', label: 'البريد الإلكتروني', type: 'text' },
  { key: 'wa', label: 'رقم واتساب', type: 'text' },
  { key: 'address', label: 'العنوان', type: 'text' },
  { key: 'cred1', label: 'الشهادة العلمية 1', type: 'text' },
  { key: 'cred2', label: 'الشهادة العلمية 2', type: 'text' },
  { key: 'facebookUrl', label: 'رابط فيسبوك', type: 'url' },
  { key: 'youtubeUrl', label: 'رابط يوتيوب', type: 'url' },
  { key: 'telegramUrl', label: 'رابط تيليجرام', type: 'url' },
  { key: 'twitterUrl', label: 'رابط إكس (تويتر)', type: 'url' },
  { key: 'instagramUrl', label: 'رابط إنستغرام', type: 'url' },
  { key: 'liveUrl', label: 'رابط البث المباشر', type: 'url' },
  { key: 'liveTitle', label: 'عنوان البث المباشر', type: 'text', ar: true, en: true },
  { key: 'meetingDay', label: 'يوم المجلس الأسبوعي', type: 'text', ar: true, en: true },
  { key: 'meetingTime', label: 'وقت المجلس', type: 'text', ar: true, en: true },
  { key: 'meetingPlace', label: 'مكان المجلس', type: 'text', ar: true, en: true },
  { key: 'meetingLink', label: 'رابط مكان المجلس/خريطة', type: 'url' },
  { key: 'ogImage', label: 'صورة المشاركة (OG)', type: 'text' },
  { key: 'showPrayerBar', label: 'إظهار شريط مواقيت الصلاة', type: 'boolean' },
];

function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    const res = await apiFetch('/api/admin/settings', { cache: 'no-store' }).then(handleResponse);
    setSettings(res.settings ?? {});
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      });
      setMessage({ type: 'success', text: 'تم حفظ الإعدادات وتطبيقها على الموقع فورًا.' });
      void load();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'فشل حفظ الإعدادات.' });
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const setField = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="إعدادات المنصة"
        subtitle="كل تعديل يُحفظ يُطبَّق فورًا على الواجهة الأمامية"
      />
      {message && (
        <div
          className={`rounded-xl p-4 text-sm font-bold ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        {FIELDS.map((f) => {
          const val = settings[f.key];
          const isLocalized = f.ar || f.en;
          const curObj = typeof val === 'object' && val !== null ? val : {};
          const displayVal = isLocalized ? (curObj.ar ?? curObj.en ?? '') : (val ?? '');

          return (
            <div key={f.key} className="rounded-2xl border border-cream-200 bg-white p-4 shadow-sm">
              <label className="mb-2 block text-xs font-bold text-primary-700 uppercase tracking-wider">
                {f.label}
              </label>
              {isLocalized ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {['ar', 'en'].map((lang) => (
                    <div key={lang} className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase">
                        {lang === 'ar' ? 'عربي' : 'إنجليزي'}
                      </span>
                      <input
                        value={curObj[lang] ?? ''}
                        onChange={(e) =>
                          setField(f.key, { ...curObj, [lang]: e.target.value })
                        }
                        className="input-islamic w-full text-sm"
                        placeholder={lang}
                      />
                    </div>
                  ))}
                </div>
              ) : f.type === 'boolean' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!val}
                    onChange={(e) => setField(f.key, e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-stone-600">{val ? 'مفعل' : 'غير مفعل'}</span>
                </div>
              ) : (
                <input
                  type={f.type}
                  value={displayVal}
                  onChange={(e) => setField(f.key, e.target.value)}
                  className="input-islamic w-full text-sm"
                  placeholder={f.label}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="pt-4">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-700 px-6 py-3 text-white font-black shadow-lg hover:bg-primary-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'جارٍ الحفظ…' : 'حفظ الإعدادات وتطبيقها فورًا'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// تبويب الأقسام والظهور (إظهار/إخفاء كل قسم في كل صفحة)
// ============================================================

function SectionsTab() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [openPage, setOpenPage] = useState<string>('home');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/settings', { cache: 'no-store' }).then(handleResponse);
      setSettings(res.settings ?? {});
    } catch (e) {
      console.error('[SectionsTab]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sections = useMemo(() => mergeSectionsConfig(settings.pageSections), [settings.pageSections]);
  const titles = useMemo(() => mergeTitlesConfig(settings.sectionTitles), [settings.sectionTitles]);
  const pages = useMemo(() => mergePagesVisibility(settings.hiddenPages), [settings.hiddenPages]);

  const commitSections = useCallback(
    (next: Record<string, Record<string, boolean>>) => {
      setSettings((prev) => ({ ...prev, pageSections: next }));
    },
    []
  );

  const toggleSection = useCallback(
    (pageKey: string, secKey: string) => {
      const current = mergeSectionsConfig(settings.pageSections);
      const isVisible = current[pageKey]?.[secKey] !== false;
      commitSections({ ...current, [pageKey]: { ...current[pageKey], [secKey]: !isVisible } });
    },
    [settings.pageSections, commitSections]
  );

  const setAllSections = useCallback(
    (pageKey: string, visible: boolean) => {
      const current = mergeSectionsConfig(settings.pageSections);
      const pageDef = PAGES.find((p) => p[0] === pageKey);
      const next: Record<string, boolean> = { ...current[pageKey] };
      for (const [secKey] of pageDef?.[4] ?? []) next[secKey] = visible;
      commitSections({ ...current, [pageKey]: next });
    },
    [settings.pageSections, commitSections]
  );

  const setTitle = useCallback(
    (pageKey: string, secKey: string, lang: 'ar' | 'en', value: string) => {
      setSettings((prev) => {
        const current = mergeTitlesConfig(prev.sectionTitles);
        const pageT = current[pageKey] || {};
        const sec = pageT[secKey] || {};
        return {
          ...prev,
          sectionTitles: {
            ...current,
            [pageKey]: { ...pageT, [secKey]: { ...sec, [lang]: value } },
          },
        };
      });
    },
    []
  );

  const togglePage = useCallback(
    (pageKey: string) => {
      setSettings((prev) => {
        const current = mergePagesVisibility(prev.hiddenPages);
        return { ...prev, hiddenPages: { ...current, [pageKey]: current[pageKey] === false } };
      });
    },
    []
  );

  const save = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      });
      setMessage({ type: 'success', text: 'تم الحفظ، وطُبّقت الأقسام على الموقع فورًا.' });
      void load();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'فشل حفظ الأقسام.' });
    } finally {
      setSaving(false);
    }
  }, [settings, load]);

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-stone-400">جارٍ التحميل…</div>;
  }

  const filteredPages = PAGES.filter(([key, , ar, en]) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return key.toLowerCase().includes(q) || ar.includes(query.trim()) || en.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="الأقسام والظهور"
        subtitle="أظهر أو أخفِ أي صفحة وأي قسم داخل الصفحات، وعدّل عناوين الأقسام — يُطبَّق فورًا"
      />

      {message && (
        <div
          className={`rounded-xl p-4 text-sm font-bold ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن صفحة…"
          className="input-islamic w-full max-w-xs text-sm"
        />
        <span className="text-xs font-bold text-stone-500">
          {filteredPages.length} صفحة · {PAGES.length} إجماليًا
        </span>
      </div>

      <div className="space-y-3">
        {filteredPages.map(([pageKey, path, ar, en, pageSections]) => {
          const pageVisible = pages[pageKey] !== false;
          const isOpen = openPage === pageKey;
          const visibleCount = pageSections.filter(
            ([secKey]) => sections[pageKey]?.[secKey] !== false
          ).length;

          return (
            <div
              key={pageKey}
              className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => setOpenPage(isOpen ? '' : pageKey)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-start"
                >
                  <span className="text-lg">{isOpen ? '▾' : '▸'}</span>
                  <div className="min-w-0">
                    <p className="truncate font-black text-primary-900">{ar}</p>
                    <p className="truncate text-xs text-stone-500">
                      <span dir="ltr">{path}</span> · {visibleCount}/{pageSections.length} قسم ظاهر
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAllSections(pageKey, true)}
                  className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800 hover:bg-green-100"
                >
                  إظهار كل الأقسام
                </button>
                <button
                  type="button"
                  onClick={() => setAllSections(pageKey, false)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  إخفاء كل الأقسام
                </button>
                <label
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold ${
                    pageVisible ? 'bg-primary-50 text-primary-800' : 'bg-red-50 text-red-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={pageVisible}
                    onChange={() => togglePage(pageKey)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  {pageVisible ? 'الصفحة ظاهرة' : 'الصفحة مخفية'}
                </label>
              </div>

              {isOpen && (
                <div className="divide-y divide-cream-100 border-t border-cream-100">
                  {pageSections.map(([secKey, secAr, secEn]) => {
                    const isVisible = sections[pageKey]?.[secKey] !== false;
                    const titleAr = titles[pageKey]?.[secKey]?.ar ?? '';
                    const titleEn = titles[pageKey]?.[secKey]?.en ?? '';

                    return (
                      <div
                        key={secKey}
                        className={`grid gap-3 p-4 md:grid-cols-[220px_1fr] ${
                          isVisible ? '' : 'bg-cream-50/60'
                        }`}
                      >
                        <label className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => toggleSection(pageKey, secKey)}
                            className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span>
                            <span
                              className={`block text-sm font-bold ${
                                isVisible ? 'text-primary-900' : 'text-stone-400 line-through'
                              }`}
                            >
                              {secAr}
                            </span>
                            <span className="block text-[11px] text-stone-400">{secEn}</span>
                          </span>
                        </label>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            value={titleAr}
                            onChange={(e) => setTitle(pageKey, secKey, 'ar', e.target.value)}
                            placeholder={`عنوان عربي (${secAr})`}
                            className="input-islamic w-full text-xs"
                          />
                          <input
                            value={titleEn}
                            onChange={(e) => setTitle(pageKey, secKey, 'en', e.target.value)}
                            placeholder={`English title (${secEn})`}
                            className="input-islamic w-full text-xs"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 z-10">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-700 px-6 py-3 font-black text-white shadow-lg transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'جارٍ الحفظ…' : 'حفظ الأقسام وتطبيقها فورًا'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// تبويب إدارة المحتوى (CRUD كامل)
// ============================================================

interface ContentItem {
  id: string;
  content_type: string;
  status: string;
  title: string | null;
  slug: string | null;
  lang: string | null;
  views: number;
}

function ContentTab() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/content', location.origin);
      if (filterType) url.searchParams.set('type', filterType);
      const res = await apiFetch(url.toString(), { cache: 'no-store' }).then(handleResponse);
      setItems(res.data ?? []);
    } catch (e) {
      console.error('[ContentTab]', e);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    void load();
  }, [load, filterType]);

  const updateStatus = useCallback(async (id: string, status: string) => {
    try {
      await apiFetch(`/api/admin/content/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      void load();
    } catch (e: any) {
      alert(e.message || 'فشل تحديث الحالة');
    }
  }, [load]);

  const removeItem = useCallback(async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;
    try {
      await apiFetch(`/api/admin/content/${id}`, { method: 'DELETE' });
      void load();
    } catch (e: any) {
      alert(e.message || 'فشل الحذف');
    }
  }, []);

  const types = useMemo(() => [...new Set(items.map((i) => i.content_type))], [items]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <SectionHeader
          title="إدارة المحتوى"
          subtitle="إنشاء، تعديل، نشر، أرشفة، وحذف كل المواد"
        />
        <Link
          href="/admin/content/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-black text-white hover:bg-primary-800 transition"
        >
          + محتوى جديد
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${!filterType ? 'bg-primary-100 text-primary-800' : 'bg-cream-100 text-stone-600'}`}
        >
          الكل
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${filterType === t ? 'bg-primary-100 text-primary-800' : 'bg-cream-100 text-stone-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-stone-400">
         جارٍ التحميل…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 p-12 text-center text-sm text-stone-500">
          لا يوجد محتوى مطابق.
        </div>
      ) : (
        <div className="rounded-2xl border border-cream-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary-50 text-primary-800">
              <tr>
                <th className="px-4 py-3 font-bold">العنوان</th>
                <th className="px-4 py-3 font-bold">النوع</th>
                <th className="px-4 py-3 font-bold">اللغة</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3 font-bold">المشاهدات</th>
                <th className="px-4 py-3 font-bold text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-cream-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-bold text-primary-900 truncate max-w-[200px]">
                      {item.title ?? '(بدون عنوان)'}
                    </div>
                    <div className="text-xs text-stone-400">{item.slug ?? '-'}</div>
                  </td>
                  <td className="px-4 py-3">{item.content_type}</td>
                  <td className="px-4 py-3">{item.lang ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-center">{Number(item.views) || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          updateStatus(
                            item.id,
                            item.status === 'published' ? 'archived' : 'published'
                          )
                        }
                        className="p-2 rounded-lg text-sm font-bold transition text-primary-700 hover:bg-primary-50"
                        title={item.status === 'published' ? 'أرشفة' : 'نشر'}
                      >
                        {item.status === 'published' ? '📦' : '📢'}
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 rounded-lg text-sm font-bold transition text-red-600 hover:bg-red-50"
                        title="حذف"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// تبويب التصنيفات
// ============================================================

function TaxonomiesTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kindFilter, setKindFilter] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/taxonomies', location.origin);
      if (kindFilter) url.searchParams.set('kind', kindFilter);
      const res = await apiFetch(url.toString(), { cache: 'no-store' }).then(handleResponse);
      setItems(res.data ?? []);
    } catch (e) {
      console.error('[TaxonomiesTab]', e);
    } finally {
      setLoading(false);
    }
  }, [kindFilter]);

  useEffect(() => {
    void load();
  }, [load, kindFilter]);

  const add = useCallback(async (formData: FormData) => {
    try {
      await apiFetch('/api/admin/taxonomies', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          kind: formData.get('kind'),
          lang: formData.get('lang'),
          slug: formData.get('slug') || '',
          icon: formData.get('icon') || '',
          color: formData.get('color') || '',
        }),
      }).then(handleResponse);
      void load();
    } catch (e: any) {
      alert(e.message || 'فشل إضافة التصنيف');
    }
  }, [load]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="إدارة التصنيفات"
        subtitle="التخصصات، الجمهور، المستويات، المذاهب، وغيرها"
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setKindFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${!kindFilter ? 'bg-primary-100 text-primary-800' : 'bg-cream-100 text-stone-600'}`}
        >
          الكل
        </button>
        {['field', 'audience', 'age_group', 'level', 'madhhab', 'ref_kind'].map(
          (k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${kindFilter === k ? 'bg-primary-100 text-primary-800' : 'bg-cream-100 text-stone-600'}`}
            >
              {k}
            </button>
          )
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add(new FormData(e.target as HTMLFormElement));
        }}
        className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm"
      >
        <div className="space-y-3">
          <label className="block text-xs font-bold text-primary-700 uppercase">
            اسم التصنيف
          </label>
          <input name="name" required className="input-islamic w-full" placeholder="مثال: عقيدة" />
          <label className="block text-xs font-bold text-primary-700 uppercase">
            النوع (kind)
          </label>
          <input name="kind" required className="input-islamic w-full" placeholder="field" />
          <label className="block text-xs font-bold text-primary-700 uppercase">
            اللغة
          </label>
          <select name="lang" className="input-islamic w-full">
            <option value="ar">عربي</option>
            <option value="en">إنجليزي</option>
          </select>
          <label className="block text-xs font-bold text-primary-700 uppercase">
            الرابط المختصر (slug)
          </label>
          <input name="slug" className="input-islamic w-full" placeholder="aqeedah" />
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs font-bold text-primary-700 uppercase">
              أيقونة
            </label>
            <input name="icon" className="input-islamic w-full" placeholder="🕌" />
            <label className="block text-xs font-bold text-primary-700 uppercase">
              لون
            </label>
            <input name="color" className="input-islamic w-full" placeholder="#0e7490" />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-black text-white hover:bg-primary-800 transition"
          >
            إضافة التصنيف
          </button>
        </div>
      </form>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-stone-400">
         جارٍ التحميل…
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-stone-500 text-center py-4">لا توجد تصنيفات.</p>
      ) : (
        <div className="rounded-2xl border border-cream-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary-50 text-primary-800">
              <tr>
                <th className="px-4 py-3 font-bold">الاسم</th>
                <th className="px-4 py-3 font-bold">النوع</th>
                <th className="px-4 py-3 font-bold">اللغة</th>
                <th className="px-4 py-3 font-bold">الرابط</th>
                <th className="px-4 py-3 font-bold">الترتيب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-cream-50 transition">
                  <td className="px-4 py-3 font-bold text-primary-900">{item.name}</td>
                  <td className="px-4 py-3">{item.kind}</td>
                  <td className="px-4 py-3">{item.lang}</td>
                  <td className="px-4 py-3 text-xs text-stone-500">{item.slug}</td>
                  <td className="px-4 py-3 text-center">{item.sort_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// تبويب الترجمات (موجز)
// ============================================================

function TranslationsTab() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="إدارة الترجمات"
        subtitle="تعديل النصوص المترجمة لكل صفحة ومحتوى"
      />
      <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 p-12 text-center text-sm text-stone-500">
        يمكن إدارة الترجمات من خلال تعديل محتوى كل عنصر بشكل فردي، أو عبر صفحة الترجمات في اللوحة الجانبية.
      </div>
    </div>
  );
}

// ============================================================
// تبويب المراجعة العلمية
// ============================================================

function ReviewTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/review', { cache: 'no-store' }).then(handleResponse);
      setItems(res.data ?? []);
    } catch (e) {
      console.error('[ReviewTab]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = useCallback(
    async (itemId: string, contentId: string, action: 'approve' | 'reject', notes: string) => {
      try {
        await apiFetch('/api/admin/review', {
          method: 'POST',
          body: JSON.stringify({ item_id: itemId, content_id: contentId, action, notes }),
        }).then(handleResponse);
        void load();
      } catch (e: any) {
        alert(e.message || 'فشل تنفيذ المراجعة');
      }
    },
    []
  );

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-stone-400">جارٍ التحميل…</div>;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="المراجعة العلمية"
        subtitle="اعتماد أو رفض المحتوى الذي ينتظر المراجعة من قبل مراجع علمي"
      />
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 p-12 text-center text-sm text-stone-500">
          لا يوجد محتوى تحت المراجعة حاليًا.
        </div>
      ) : (
        <div className="rounded-2xl border border-cream-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary-50 text-primary-800">
              <tr>
                <th className="px-4 py-3 font-bold">العنوان</th>
                <th className="px-4 py-3 font-bold">النوع</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3 font-bold text-right">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-cream-50 transition">
                  <td className="px-4 py-3 font-bold text-primary-900 truncate max-w-[180px]">
                    {item.content_title ?? '(بدون عنوان)'}
                  </td>
                  <td className="px-4 py-3">{item.content_type}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => decide(item.id, item.content_id, 'approve', '')}
                        className="px-3 py-1.5 rounded-lg bg-green-50 text-green-800 text-xs font-bold hover:bg-green-100 transition"
                      >
                        اعتماد
                      </button>
                      <button
                        onClick={() => {
                          const notes = window.prompt('أسباب الرفض:');
                          if (notes !== null) {
                            void decide(item.id, item.content_id, 'reject', notes);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-800 text-xs font-bold hover:bg-red-100 transition"
                      >
                        رفض
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// تبويبات موجزة (تُربط بالصفحات الفرعية القائمة)
// ============================================================

function SimpleTab({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-6">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 p-12 text-center text-sm text-stone-500">
        تُدار هذه الأقسام عبر الصفحة المقابلة في القائمة الجانبية للوحة التحكم.
      </div>
    </div>
  );
}

// ============================================================
// المكون الرئيسي
// ============================================================

const TAB_COMPONENTS: Record<TabId, () => React.ReactElement> = {
  dashboard: DashboardTab,
  settings: SettingsTab,
  sections: SectionsTab,
  content: ContentTab,
  taxonomies: TaxonomiesTab,
  translations: TranslationsTab,
  review: ReviewTab,
  questions: () => <SimpleTab title="أسئلة الزوار" subtitle="إدارة واستجابة لأسئلة الزوار من خلال النموذج على الموقع" />,
  notifications: () => <SimpleTab title="الإشعارات والنشرة البريدية" subtitle="إرسال إشعارات للمشتركين وإدارة قائمة النشرة" />,
  users: () => <SimpleTab title="المستخدمون والأدوار" subtitle="إدارة الحسابات وترقية الأدوار" />,
  audit: () => <SimpleTab title="سجل التدقيق" subtitle="سجل كل التغييرات التي جرت على المنصة ومن قام بها" />,
};

export default function AdminControlPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const initialTab = TABS.find((t) => pathname === `/admin/control?tab=${t.id}`)?.id ?? 'dashboard';

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-primary-950">لوحة التحكم الموحدة</h1>
          <p className="mt-1 text-sm text-stone-500">
            تحكم في كل صغيرة وكبيرة من المنصة، وتُطبَّق التغييرات فور الحفظ.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/content/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-black text-white hover:bg-primary-800 transition"
          >
            + محتوى جديد
          </Link>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                void router.push(`/admin/control?tab=${tab.id}`);
              }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${active ? 'bg-primary-700 text-white shadow-lg' : 'bg-cream-100 text-primary-800 hover:bg-primary-50'}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-cream-200 bg-white p-6 md:p-8 shadow-sm min-h-[60vh]">
        {(() => {
          const Comp = TAB_COMPONENTS[activeTab] ?? DashboardTab;
          return <Comp />;
        })()}
      </div>
    </div>
  );
}
