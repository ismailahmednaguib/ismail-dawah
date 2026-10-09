// app/[lang]/adhkar/adhkar-content.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { ADHKAR, toArabicNumeral, type Dhikr } from "@/lib/data";
import type { Lang } from "@/lib/i18n";

const STORAGE_KEY = "dawah_adhkar_progress_v1";

const UI: Record<
  Lang,
  {
    resetCategory: string;
    completed: string;
    remaining: string;
    progress: string;
    tapToCount: string;
    source: string;
    virtue: string;
    reset: string;
    allDone: string;
    todaysProgress: string;
    of: string;
    done: string;
    notStarted: string;
  }
> = {
  ar: {
    resetCategory: "تصفير القسم",
    completed: "مكتمل",
    remaining: "متبقي",
    progress: "تقدمك",
    tapToCount: "اضغط على الذكر للعد",
    source: "المصدر",
    virtue: "الفضل",
    reset: "إعادة",
    allDone: "أتممت هذا القسم 🎉",
    todaysProgress: "إنجاز اليوم",
    of: "من",
    done: "تم",
    notStarted: "لم تبدأ بعد",
  },
  en: {
    resetCategory: "Reset section",
    completed: "Completed",
    remaining: "Remaining",
    progress: "Your progress",
    tapToCount: "Tap the dhikr to count",
    source: "Source",
    virtue: "Virtue",
    reset: "Reset",
    allDone: "You completed this section 🎉",
    todaysProgress: "Today's progress",
    of: "of",
    done: "Done",
    notStarted: "Not started yet",
  },
};

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatNumber(value: number, lang: Lang): string {
  return lang === "ar" ? toArabicNumeral(value) : String(value);
}

function DhikrCard({
  dhikr,
  count,
  lang,
  disabled,
  onIncrement,
  onReset,
}: {
  dhikr: Dhikr;
  count: number;
  lang: Lang;
  disabled: boolean;
  onIncrement: () => void;
  onReset: () => void;
}) {
  const ui = UI[lang] || UI.ar;
  const isRTL = lang === "ar";
  const done = count >= dhikr.count;
  const percent = Math.min(Math.round((count / dhikr.count) * 100), 100);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || done) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onIncrement();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled || done ? -1 : 0}
      aria-disabled={disabled || done}
      aria-label={`${dhikr.text} — ${count}/${dhikr.count}`}
      onClick={!disabled && !done ? onIncrement : undefined}
      onKeyDown={handleKeyDown}
      className={`card relative overflow-hidden p-5 transition-all duration-300 md:p-6 ${
        done
          ? "border-green-300 bg-green-50/60 dark:border-green-800/60 dark:bg-green-950/20"
          : disabled
          ? "opacity-70"
          : "card-interactive cursor-pointer"
      }`}
    >
      {/* شريط التقدم */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-night-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            done
              ? "bg-gradient-to-r from-green-400 to-green-600"
              : "bg-gradient-to-r from-primary-400 to-primary-600"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* نص الذكر */}
      <p
        className="mb-5 text-lg leading-loose text-slate-800 md:text-xl dark:text-slate-100"
        style={{ fontFamily: "var(--font-amiri)" }}
      >
        {dhikr.text}
      </p>

      {/* المصدر والفضل */}
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
        <span className="badge-primary">
          {ui.source}: {dhikr.source}
        </span>

        {dhikr.virtue && (
          <span className="badge-gold">
            {ui.virtue}: {dhikr.virtue}
          </span>
        )}
      </div>

      {/* العداد */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {disabled ? ui.notStarted : done ? ui.allDone : ui.tapToCount}
          </p>

          <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
            {formatNumber(count, lang)}{" "}
            <span className="text-slate-400 dark:text-slate-500">
              {ui.of}
            </span>{" "}
            {formatNumber(dhikr.count, lang)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {count > 0 && !disabled && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onReset();
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isRTL ? "rotate-180" : ""}
              >
                <path d="M3 12a9 9 0 1 0 9-9" />
                <path d="M3 3v6h6" />
              </svg>
              {ui.reset}
            </button>
          )}

          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-black transition-all duration-300 ${
              done
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
            }`}
          >
            {done ? "✓" : formatNumber(count, lang)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdhkarContent({ lang }: { lang: Lang }) {
  const ui = UI[lang] || UI.ar;
  const isRTL = lang === "ar";
  const categories = ADHKAR;

  const [activeId, setActiveId] = useState<string>(
    categories[0]?.id ?? "morning"
  );
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);

  // تحميل التقدم من localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw) as {
          date?: string;
          counts?: Record<string, number>;
        };

        // لو يوم جديد، نبدأ من الصفر
        if (parsed.date === getTodayKey() && parsed.counts) {
          setCounts(parsed.counts);
        } else {
          setCounts({});
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // تجاهل أخطاء القراءة
    } finally {
      setHydrated(true);
    }
  }, []);

  // حفظ التقدم
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date: getTodayKey(),
          counts,
        })
      );
    } catch {
      // تجاهل أخطاء الحفظ
    }
  }, [counts, hydrated]);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeId) ?? categories[0],
    [activeId, categories]
  );

  const getKey = useCallback(
    (categoryId: string, index: number) => `${categoryId}:${index}`,
    []
  );

  const increment = useCallback((key: string, max: number) => {
    setCounts((prev) => {
      const current = prev[key] || 0;

      if (current >= max) {
        return prev;
      }

      return {
        ...prev,
        [key]: current + 1,
      };
    });
  }, []);

  const resetDhikr = useCallback((key: string) => {
    setCounts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const resetCategory = useCallback(() => {
    setCounts((prev) => {
      const next: Record<string, number> = {};

      for (const [key, value] of Object.entries(prev)) {
        if (!key.startsWith(`${activeId}:`)) {
          next[key] = value;
        }
      }

      return next;
    });
  }, [activeId]);

  const categoryStats = useMemo(() => {
    if (!activeCategory) {
      return { done: 0, total: 0, percent: 0 };
    }

    let done = 0;
    let total = 0;

    activeCategory.adhkar.forEach((dhikr, index) => {
      const key = getKey(activeCategory.id, index);
      const current = hydrated ? counts[key] || 0 : 0;

      total += dhikr.count;
      done += Math.min(current, dhikr.count);
    });

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    return { done, total, percent };
  }, [activeCategory, counts, hydrated, getKey]);

  if (!activeCategory) {
    return null;
  }

  return (
    <section className="container-page py-10 md:py-14">
      {/* ===== التبويبات ===== */}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {categories.map((category) => {
          const isActive = category.id === activeCategory.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveId(category.id)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span>
                {lang === "ar" ? category.arabicTitle : category.englishTitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* ===== ملخص تقدم القسم ===== */}
      <div className="card mb-8 overflow-hidden">
        <div className="gradient-primary h-1.5 w-full" />

        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <h2
              className="mb-1 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {lang === "ar"
                ? activeCategory.arabicTitle
                : activeCategory.englishTitle}
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {ui.todaysProgress}:{" "}
              <span className="font-bold text-primary-600 dark:text-primary-400">
                {formatNumber(categoryStats.done, lang)}
              </span>{" "}
              {ui.of}{" "}
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {formatNumber(categoryStats.total, lang)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-40 md:w-56">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{ui.progress}</span>
                <span className="text-primary-600 dark:text-primary-400">
                  {formatNumber(categoryStats.percent, lang)}%
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-night-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-gold-400 transition-all duration-500"
                  style={{ width: `${categoryStats.percent}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={resetCategory}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isRTL ? "rotate-180" : ""}
              >
                <path d="M3 12a9 9 0 1 0 9-9" />
                <path d="M3 3v6h6" />
              </svg>
              {ui.resetCategory}
            </button>
          </div>
        </div>
      </div>

      {/* ===== الأذكار ===== */}
      <div className="grid gap-5 md:grid-cols-2">
        {activeCategory.adhkar.map((dhikr, index) => {
          const key = getKey(activeCategory.id, index);
          const count = hydrated ? counts[key] || 0 : 0;

          return (
            <DhikrCard
              key={`${activeCategory.id}-${index}`}
              dhikr={dhikr}
              count={count}
              lang={lang}
              disabled={!hydrated}
              onIncrement={() => increment(key, dhikr.count)}
              onReset={() => resetDhikr(key)}
            />
          );
        })}
      </div>

      {/* ===== تنبيه أسفل الصفحة ===== */}
      <div className="card mt-10 p-6 text-center">
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {lang === "ar"
            ? "💡 تقدمك يُحفظ على جهازك فقط، ويُصفَّر تلقائيًا مع بداية يوم جديد."
            : "💡 Your progress is saved only on your device and resets automatically at the start of a new day."}
        </p>
      </div>
    </section>
  );
}