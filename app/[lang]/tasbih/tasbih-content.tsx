// app/[lang]/tasbih/tasbih-content.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TASBIH_PHRASES, toArabicNumeral, type TasbihPhrase } from "@/lib/data";
import type { Lang } from "@/lib/i18n";

const STORAGE_KEY = "dawah_tasbih_state_v1";

type SavedState = {
  date: string;
  selectedId: string;
  counts: Record<string, number>;
  totalToday: number;
  lifetime: number;
};

const UI: Record<
  Lang,
  {
    chooseDhikr: string;
    tapToCount: string;
    current: string;
    target: string;
    today: string;
    lifetime: string;
    resetDhikr: string;
    resetToday: string;
    completed: string;
    progress: string;
    virtue: string;
    note: string;
    of: string;
    notHydrated: string;
  }
> = {
  ar: {
    chooseDhikr: "اختر الذكر",
    tapToCount: "اضغط على الدائرة للعد",
    current: "الحالي",
    target: "الهدف",
    today: "مسابيح اليوم",
    lifetime: "الإجمالي الكلي",
    resetDhikr: "تصفير الذكر",
    resetToday: "تصفير اليوم",
    completed: "اكتمل العدد",
    progress: "التقدم",
    virtue: "الفضل",
    note: "💡 تقدمك يُحفظ على جهازك فقط، ويبدأ يوم جديد تلقائيًا مع تغيير التاريخ.",
    of: "من",
    notHydrated: "جارٍ التحميل...",
  },
  en: {
    chooseDhikr: "Choose Dhikr",
    tapToCount: "Tap the circle to count",
    current: "Current",
    target: "Target",
    today: "Today's Tasbih",
    lifetime: "Lifetime Total",
    resetDhikr: "Reset Dhikr",
    resetToday: "Reset Today",
    completed: "Completed",
    progress: "Progress",
    virtue: "Virtue",
    note: "💡 Your progress is saved only on your device, and a new day starts automatically when the date changes.",
    of: "of",
    notHydrated: "Loading...",
  },
};

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatNumber(value: number, lang: Lang): string {
  return lang === "ar" ? toArabicNumeral(value) : String(value);
}

function phraseLabel(phrase: TasbihPhrase, lang: Lang): string {
  return lang === "ar" ? phrase.arabicText : phrase.englishText;
}

export default function TasbihContent({ lang }: { lang: Lang }) {
  const ui = UI[lang] || UI.ar;
  const isRTL = lang === "ar";
  const firstPhrase = TASBIH_PHRASES[0];

  const [selectedId, setSelectedId] = useState<string>(firstPhrase?.id ?? "");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [totalToday, setTotalToday] = useState<number>(0);
  const [lifetime, setLifetime] = useState<number>(0);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // ===== تحميل الحالة من localStorage =====
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const today = getTodayKey();

      if (!raw) {
        setHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<SavedState>;

      const validSelectedId =
        parsed.selectedId &&
        TASBIH_PHRASES.some((phrase) => phrase.id === parsed.selectedId)
          ? parsed.selectedId
          : firstPhrase?.id ?? "";

      if (parsed.date === today) {
        setCounts(parsed.counts || {});
        setTotalToday(parsed.totalToday || 0);
        setLifetime(parsed.lifetime || 0);
        setSelectedId(validSelectedId);
      } else {
        // يوم جديد: نصفر اليوم ونحتفظ بالإجمالي الكلي
        setCounts({});
        setTotalToday(0);
        setLifetime(parsed.lifetime || 0);
        setSelectedId(validSelectedId);
      }
    } catch {
      // تجاهل أخطاء القراءة
    } finally {
      setHydrated(true);
    }
  }, [firstPhrase?.id]);

  // ===== حفظ الحالة =====
  useEffect(() => {
    if (!hydrated) return;

    try {
      const state: SavedState = {
        date: getTodayKey(),
        selectedId,
        counts,
        totalToday,
        lifetime,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // تجاهل أخطاء الحفظ
    }
  }, [counts, hydrated, lifetime, selectedId, totalToday]);

  const selectedPhrase = useMemo(
    () =>
      TASBIH_PHRASES.find((phrase) => phrase.id === selectedId) ??
      firstPhrase,
    [firstPhrase, selectedId]
  );

  const increment = useCallback(() => {
    if (!hydrated || !selectedPhrase) return;

    const id = selectedPhrase.id;

    setCounts((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1,
    }));

    setTotalToday((prev) => prev + 1);
    setLifetime((prev) => prev + 1);

    // اهتزاز خفيف على الموبايل لو المدعوم متاح
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // تجاهل
      }
    }
  }, [hydrated, selectedPhrase]);

  const resetCurrent = useCallback(() => {
    if (!selectedPhrase) return;

    setCounts((prev) => {
      const next = { ...prev };
      delete next[selectedPhrase.id];
      return next;
    });
  }, [selectedPhrase]);

  const resetToday = useCallback(() => {
    setCounts({});
    setTotalToday(0);
  }, []);

  if (!selectedPhrase) {
    return null;
  }

  const currentCount = counts[selectedPhrase.id] ?? 0;
  const targetCount = selectedPhrase.count;
  const percent = Math.min(Math.round((currentCount / targetCount) * 100), 100);
  const completed = currentCount >= targetCount;

  // حلقة التقدم
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <section className="container-page py-10 md:py-14">
      {/* ===== اختيار الذكر ===== */}
      <div className="card mb-8 p-6 md:p-7">
        <h2
          className="mb-5 text-xl font-black text-slate-900 dark:text-white"
          style={{ fontFamily: "var(--font-amiri)" }}
        >
          {ui.chooseDhikr}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TASBIH_PHRASES.map((phrase) => {
            const isActive = phrase.id === selectedPhrase.id;
            const phraseCount = counts[phrase.id] ?? 0;

            return (
              <button
                key={phrase.id}
                type="button"
                onClick={() => setSelectedId(phrase.id)}
                className={`group flex min-h-24 cursor-pointer flex-col items-start justify-between gap-3 rounded-2xl border p-4 text-start transition-all duration-300 ${
                  isActive
                    ? "border-primary-500 bg-primary-50 shadow-md shadow-primary-500/10 dark:border-primary-500 dark:bg-primary-950/30"
                    : "border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50/60 dark:border-night-700 dark:bg-night-800 dark:hover:border-primary-600 dark:hover:bg-night-700"
                }`}
              >
                <span
                  className={`line-clamp-2 text-sm font-bold ${
                    isActive
                      ? "text-primary-800 dark:text-primary-200"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {phraseLabel(phrase, lang)}
                </span>

                <div className="flex w-full items-center justify-between gap-2">
                  <span className="badge-primary text-xs">
                    {formatNumber(phrase.count, lang)}
                  </span>

                  {phraseCount > 0 && (
                    <span className="text-xs font-black text-gold-600 dark:text-gold-400">
                      {formatNumber(phraseCount, lang)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== العدّاد الرئيسي ===== */}
      <div className="card relative overflow-hidden p-6 md:p-10">
        <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* الدائرة */}
          <div className="flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={increment}
              disabled={!hydrated}
              aria-label={ui.tapToCount}
              className="relative flex h-64 w-64 cursor-pointer select-none items-center justify-center rounded-full border-8 border-white bg-gradient-to-br from-primary-50 via-white to-gold-50 text-primary-950 shadow-islamic transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-wait dark:border-night-800 dark:from-night-800 dark:via-night-900 dark:to-night-950 dark:text-white"
            >
              <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 200 200"
                aria-hidden="true"
              >
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-primary-100 dark:text-night-700"
                />
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="url(#tasbihGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-200"
                />
                <defs>
                  <linearGradient
                    id="tasbihGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#d4af37" />
                  </linearGradient>
                </defs>
              </svg>

              <span className="relative z-10 flex flex-col items-center">
                <span className="text-6xl font-black leading-none md:text-7xl">
                  {hydrated ? formatNumber(currentCount, lang) : "—"}
                </span>

                <span className="mt-3 text-sm font-bold text-primary-700 dark:text-primary-300">
                  {ui.of} {formatNumber(targetCount, lang)}
                </span>

                {hydrated && completed && (
                  <span className="badge-gold mt-4">
                    ✓ {ui.completed}
                  </span>
                )}

                {!hydrated && (
                  <span className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {ui.notHydrated}
                  </span>
                )}
              </span>
            </button>

            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {ui.tapToCount}
            </p>
          </div>

          {/* تفاصيل الذكر */}
          <div className="w-full max-w-xl lg:flex-1">
            <div className="mb-6">
              <p className="mb-2 text-sm font-bold text-primary-600 dark:text-primary-400">
                {ui.current}
              </p>

              <h1
                className="text-2xl font-black leading-relaxed text-slate-900 md:text-3xl dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {phraseLabel(selectedPhrase, lang)}
              </h1>
            </div>

            {selectedPhrase.virtue && (
              <div className="card mb-6 border-gold-200 bg-gold-50/60 p-5 dark:border-gold-800/40 dark:bg-gold-950/20">
                <p className="mb-1 text-xs font-black text-gold-700 dark:text-gold-400">
                  {ui.virtue}
                </p>
                <p className="leading-relaxed text-slate-700 dark:text-slate-200">
                  {selectedPhrase.virtue}
                </p>
              </div>
            )}

            {/* شريط التقدم */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{ui.progress}</span>
                <span className="text-primary-600 dark:text-primary-400">
                  {formatNumber(percent, lang)}%
                </span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-night-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-gold-400 transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={resetCurrent}
                disabled={!hydrated || currentCount === 0}
                className="btn-outline inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isRTL ? "rotate-180" : ""}
                >
                  <path d="M3 12a9 9 0 1 0 9-9" />
                  <path d="M3 3v6h6" />
                </svg>
                {ui.resetDhikr}
              </button>

              <button
                type="button"
                onClick={resetToday}
                disabled={!hydrated || totalToday === 0}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v5" />
                  <path d="M14 11v5" />
                </svg>
                {ui.resetToday}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== الإحصائيات ===== */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-6 text-center">
          <p className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">
            {ui.today}
          </p>
          <p className="text-4xl font-black text-primary-600 dark:text-primary-400">
            {hydrated ? formatNumber(totalToday, lang) : "—"}
          </p>
        </div>

        <div className="card p-6 text-center">
          <p className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">
            {ui.lifetime}
          </p>
          <p className="text-4xl font-black text-gold-600 dark:text-gold-400">
            {hydrated ? formatNumber(lifetime, lang) : "—"}
          </p>
        </div>

        <div className="card p-6 text-center">
          <p className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">
            {ui.target}
          </p>
          <p className="text-4xl font-black text-slate-800 dark:text-white">
            {formatNumber(targetCount, lang)}
          </p>
        </div>
      </div>

      {/* ===== ملاحظة ===== */}
      <div className="card mt-8 p-5 text-center">
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {ui.note}
        </p>
      </div>
    </section>
  );
}