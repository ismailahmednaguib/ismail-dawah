// app/[lang]/adhkar/adhkar-content.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ADHKAR, toArabicNumeral, type Dhikr } from "@/lib/data";
import type { Lang } from "@/lib/i18n";

const STORAGE_KEY = "dawah_adhkar_progress_v1";
const SETTINGS_KEY = "dawah_adhkar_settings_v1";

// ============================================================
// أنواع الإعدادات
// ============================================================

type AdhkarSettings = {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoScroll: boolean;
};

const DEFAULT_SETTINGS: AdhkarSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  autoScroll: true,
};

// ============================================================
// نصوص الواجهة
// ============================================================

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
    overallProgress: string;
    sections: string;
    soundOn: string;
    soundOff: string;
    vibrationOn: string;
    vibrationOff: string;
    autoScrollOn: string;
    autoScrollOff: string;
    settings: string;
    celebration: string;
    celebrationDesc: string;
    resetConfirm: string;
    resetConfirmDesc: string;
    yes: string;
    no: string;
    next: string;
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
    allDone: "أتممت هذا الذكر 🎉",
    todaysProgress: "إنجاز اليوم",
    of: "من",
    done: "تم",
    notStarted: "لم تبدأ بعد",
    overallProgress: "تقدمك في جميع الأقسام",
    sections: "الأقسام",
    soundOn: "🔊 الصوت",
    soundOff: "🔇 الصوت",
    vibrationOn: "📳 الاهتزاز",
    vibrationOff: "📴 الاهتزاز",
    autoScrollOn: "⬇️ التمرير التلقائي",
    autoScrollOff: "⏸️ التمرير التلقائي",
    settings: "الإعدادات",
    celebration: "ما شاء الله! 🎉",
    celebrationDesc: "لقد أتممت جميع أذكار هذا القسم. تقبل الله منك.",
    resetConfirm: "هل تريد تصفير هذا الذكر؟",
    resetConfirmDesc: "سيتم إعادة العداد إلى الصفر.",
    yes: "نعم، صفّر",
    no: "إلغاء",
    next: "التالي",
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
    allDone: "You completed this dhikr 🎉",
    todaysProgress: "Today's progress",
    of: "of",
    done: "Done",
    notStarted: "Not started yet",
    overallProgress: "Your progress across all sections",
    sections: "Sections",
    soundOn: "🔊 Sound",
    soundOff: "🔇 Sound",
    vibrationOn: "📳 Vibration",
    vibrationOff: "📴 Vibration",
    autoScrollOn: "⬇️ Auto-scroll",
    autoScrollOff: "⏸️ Auto-scroll",
    settings: "Settings",
    celebration: "MashaAllah! 🎉",
    celebrationDesc: "You completed all adhkar in this section. May Allah accept it from you.",
    resetConfirm: "Reset this dhikr?",
    resetConfirmDesc: "The counter will be reset to zero.",
    yes: "Yes, reset",
    no: "Cancel",
    next: "Next",
  },
};

// ============================================================
// دوال مساعدة
// ============================================================

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatNumber(value: number, lang: Lang): string {
  return lang === "ar" ? toArabicNumeral(value) : String(value);
}

/**
 * تشغيل صوت نقر خفيف باستخدام Web Audio API
 */
function playClickSound() {
  try {
    if (typeof window === "undefined" || !window.AudioContext) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  } catch {
    // تجاهل أخطاء الصوت
  }
}

/**
 * تشغيل اهتزاز خفيف على الهواتف
 */
function triggerVibration(pattern: number | number[] = 20) {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // تجاهل
  }
}

// ============================================================
// مكون بطاقة الذكر
// ============================================================

function DhikrCard({
  dhikr,
  count,
  lang,
  disabled,
  isLast,
  onIncrement,
  onReset,
}: {
  dhikr: Dhikr;
  count: number;
  lang: Lang;
  disabled: boolean;
  isLast: boolean;
  onIncrement: () => void;
  onReset: () => void;
}) {
  const ui = UI[lang] || UI.ar;
  const isRTL = lang === "ar";
  const done = count >= dhikr.count;
  const percent = Math.min(Math.round((count / dhikr.count) * 100), 100);
  const [pulsing, setPulsing] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleIncrement = useCallback(() => {
    if (disabled || done) return;
    setPulsing(true);
    onIncrement();
    setTimeout(() => setPulsing(false), 200);
  }, [disabled, done, onIncrement]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || done) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleIncrement();
    }
  };

  const handleResetClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (count === 0) return;
    setConfirmingReset(true);
  };

  const confirmReset = () => {
    onReset();
    setConfirmingReset(false);
  };

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={disabled || done ? -1 : 0}
      aria-disabled={disabled || done}
      aria-label={`${dhikr.text} — ${count}/${dhikr.count}`}
      onClick={!disabled && !done ? handleIncrement : undefined}
      onKeyDown={handleKeyDown}
      className={`card relative overflow-hidden p-5 transition-all duration-300 md:p-6 ${
        pulsing ? "scale-[1.02]" : ""
      } ${
        done
          ? "border-green-300 bg-green-50/60 dark:border-green-800/60 dark:bg-green-950/20"
          : disabled
          ? "opacity-70"
          : "card-interactive cursor-pointer active:scale-[0.98]"
      }`}
    >
      {/* رسالة الإتمام */}
      {done && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/5 backdrop-blur-[1px]">
          <span className="text-5xl">✓</span>
        </div>
      )}

      {/* شريط التقدم */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-night-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            done
              ? "bg-gradient-to-r from-green-400 to-green-600"
              : percent > 66
              ? "bg-gradient-to-r from-primary-500 to-gold-500"
              : percent > 33
              ? "bg-gradient-to-r from-primary-400 to-primary-600"
              : "bg-gradient-to-r from-primary-300 to-primary-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* نص الذكر */}
      <p
        className={`mb-5 text-lg leading-loose text-slate-800 md:text-xl dark:text-slate-100 ${
          done ? "opacity-60" : ""
        }`}
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

      {/* العداد + الأزرار */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {disabled ? ui.notStarted : done ? ui.allDone : ui.tapToCount}
          </p>

          <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
            {formatNumber(count, lang)}{" "}
            <span className="text-slate-400 dark:text-slate-500">{ui.of}</span>{" "}
            {formatNumber(dhikr.count, lang)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {count > 0 && !disabled && !confirmingReset && (
            <button
              type="button"
              onClick={handleResetClick}
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

          {confirmingReset && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={confirmReset}
                className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700"
              >
                {ui.yes}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-night-700 dark:text-slate-200"
              >
                {ui.no}
              </button>
            </div>
          )}

          <span
            className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-black transition-all duration-300 ${
              pulsing ? "scale-110" : ""
            } ${
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

// ============================================================
// المكون الرئيسي
// ============================================================

export default function AdhkarContent({ lang }: { lang: Lang }) {
  const ui = UI[lang] || UI.ar;
  const isRTL = lang === "ar";
  const categories = ADHKAR;

  const [activeId, setActiveId] = useState<string>(
    categories[0]?.id ?? "morning"
  );
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState<AdhkarSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  // تحميل التقدم من localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw) as {
          date?: string;
          counts?: Record<string, number>;
        };

        if (parsed.date === getTodayKey() && parsed.counts) {
          setCounts(parsed.counts);
        } else {
          setCounts({});
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      // تحميل الإعدادات
      const settingsRaw = localStorage.getItem(SETTINGS_KEY);
      if (settingsRaw) {
        const parsed = JSON.parse(settingsRaw) as AdhkarSettings;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
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

  // حفظ الإعدادات
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // تجاهل
    }
  }, [settings, hydrated]);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeId) ?? categories[0],
    [activeId, categories]
  );

  const getKey = useCallback(
    (categoryId: string, index: number) => `${categoryId}:${index}`,
    []
  );

  const increment = useCallback(
    (key: string, max: number) => {
      setCounts((prev) => {
        const current = prev[key] || 0;

        if (current >= max) {
          return prev;
        }

        // تشغيل الصوت والاهتزاز
        if (settings.soundEnabled) playClickSound();
        if (settings.vibrationEnabled) triggerVibration(15);

        const newValue = current + 1;

        // إذا تم إتمام الذكر
        if (newValue >= max) {
          if (settings.vibrationEnabled) {
            triggerVibration([30, 50, 30]);
          }
        }

        return {
          ...prev,
          [key]: newValue,
        };
      });
    },
    [settings]
  );

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
      return { done: 0, total: 0, percent: 0, completedCount: 0, adhkarCount: 0 };
    }

    let done = 0;
    let total = 0;
    let completedCount = 0;

    activeCategory.adhkar.forEach((dhikr, index) => {
      const key = getKey(activeCategory.id, index);
      const current = hydrated ? counts[key] || 0 : 0;

      total += dhikr.count;
      done += Math.min(current, dhikr.count);
      if (current >= dhikr.count) completedCount++;
    });

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      done,
      total,
      percent,
      completedCount,
      adhkarCount: activeCategory.adhkar.length,
    };
  }, [activeCategory, counts, hydrated, getKey]);

  // إحصائيات شاملة لكل الأقسام
  const overallStats = useMemo(() => {
    let totalDone = 0;
    let totalAll = 0;
    let completedSections = 0;

    categories.forEach((category) => {
      let catDone = 0;
      let catTotal = 0;

      category.adhkar.forEach((dhikr, index) => {
        const key = getKey(category.id, index);
        const current = hydrated ? counts[key] || 0 : 0;

        catTotal += dhikr.count;
        catDone += Math.min(current, dhikr.count);
      });

      totalDone += catDone;
      totalAll += catTotal;

      if (catTotal > 0 && catDone >= catTotal) {
        completedSections++;
      }
    });

    const percent = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

    return {
      totalDone,
      totalAll,
      percent,
      completedSections,
      totalSections: categories.length,
    };
  }, [categories, counts, hydrated, getKey]);

  // كشف إتمام القسم
  useEffect(() => {
    if (!hydrated || !activeCategory) return;

    if (
      categoryStats.completedCount === categoryStats.adhkarCount &&
      categoryStats.adhkarCount > 0
    ) {
      setCelebrating(true);
      if (settings.vibrationEnabled) {
        triggerVibration([50, 100, 50, 100, 50]);
      }
    } else {
      setCelebrating(false);
    }
  }, [categoryStats, hydrated, activeCategory, settings.vibrationEnabled]);

  const toggleSetting = (key: keyof AdhkarSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!activeCategory) {
    return null;
  }

  return (
    <section className="container-page py-10 md:py-14">
      {/* ===== إحصائيات شاملة ===== */}
      <div className="card relative mb-6 overflow-hidden">
        <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />
        <div className="p-6 md:p-7">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              📊 {ui.overallProgress}
            </h3>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-200"
            >
              ⚙️ {ui.settings}
            </button>
          </div>

          {/* شريط التقدم الشامل */}
          <div className="mb-3 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300">
              {formatNumber(overallStats.totalDone, lang)} {ui.of}{" "}
              {formatNumber(overallStats.totalAll, lang)}
            </span>
            <span className="text-gold-600 dark:text-gold-400">
              {formatNumber(overallStats.percent, lang)}%
            </span>
          </div>

          <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-night-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-400 via-gold-500 to-primary-500 transition-all duration-500"
              style={{ width: `${overallStats.percent}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatNumber(overallStats.completedSections, lang)} {ui.of}{" "}
            {formatNumber(overallStats.totalSections, lang)} {ui.sections}
            {overallStats.completedSections > 0 && " ✓"}
          </p>

          {/* الإعدادات */}
          {showSettings && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-night-700">
              <button
                type="button"
                onClick={() => toggleSetting("soundEnabled")}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  settings.soundEnabled
                    ? "bg-primary-500 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-night-800 dark:text-slate-300"
                }`}
              >
                {settings.soundEnabled ? ui.soundOn : ui.soundOff}
              </button>
              <button
                type="button"
                onClick={() => toggleSetting("vibrationEnabled")}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  settings.vibrationEnabled
                    ? "bg-primary-500 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-night-800 dark:text-slate-300"
                }`}
              >
                {settings.vibrationEnabled ? ui.vibrationOn : ui.vibrationOff}
              </button>
              <button
                type="button"
                onClick={() => toggleSetting("autoScroll")}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  settings.autoScroll
                    ? "bg-primary-500 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-night-800 dark:text-slate-300"
                }`}
              >
                {settings.autoScroll ? ui.autoScrollOn : ui.autoScrollOff}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== التبويبات ===== */}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {categories.map((category) => {
          const isActive = category.id === activeCategory.id;

          // حساب تقدم كل قسم
          let catDone = 0;
          let catTotal = 0;
          category.adhkar.forEach((dhikr, index) => {
            const key = getKey(category.id, index);
            const current = hydrated ? counts[key] || 0 : 0;
            catTotal += dhikr.count;
            catDone += Math.min(current, dhikr.count);
          });
          const catPercent = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;
          const isCatDone = catPercent === 100;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setActiveId(category.id);
                setCelebrating(false);
              }}
              className={`relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl px-5 py-3 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                  : isCatDone
                  ? "border-2 border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-300"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
              }`}
            >
              {/* شريط تقدم صغير في الأسفل */}
              {!isActive && !isCatDone && catPercent > 0 && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-200 dark:bg-night-700">
                  <div
                    className="h-full bg-primary-400"
                    style={{ width: `${catPercent}%` }}
                  />
                </div>
              )}

              <span className="text-lg">
                {isCatDone ? "✓" : category.icon}
              </span>
              <span>
                {lang === "ar" ? category.arabicTitle : category.englishTitle}
              </span>
              {catPercent > 0 && !isCatDone && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-black">
                  {catPercent}%
                </span>
              )}
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
              {" · "}
              <span className="text-green-600 dark:text-green-400">
                {formatNumber(categoryStats.completedCount, lang)}/{formatNumber(categoryStats.adhkarCount, lang)} {ui.completed}
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
                  className={`h-full rounded-full transition-all duration-500 ${
                    categoryStats.percent === 100
                      ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                      : "bg-gradient-to-r from-primary-400 via-primary-500 to-gold-400"
                  }`}
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

      {/* ===== رسالة الاحتفال ===== */}
      {celebrating && (
        <div className="card mb-8 overflow-hidden border-green-300 bg-gradient-to-br from-green-50 to-primary-50 p-8 text-center dark:border-green-800 dark:from-green-950/30 dark:to-primary-950/30">
          <div className="mb-3 text-5xl">🎉</div>
          <h3
            className="mb-2 text-2xl font-black text-green-700 dark:text-green-300"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.celebration}
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {ui.celebrationDesc}
          </p>
        </div>
      )}

      {/* ===== الأذكار ===== */}
      <div className="grid gap-5 md:grid-cols-2">
        {activeCategory.adhkar.map((dhikr, index) => {
          const key = getKey(activeCategory.id, index);
          const count = hydrated ? counts[key] || 0 : 0;
          const isLast = index === activeCategory.adhkar.length - 1;

          return (
            <DhikrCard
              key={`${activeCategory.id}-${index}`}
              dhikr={dhikr}
              count={count}
              lang={lang}
              disabled={!hydrated}
              isLast={isLast}
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
            ? "💡 تقدمك يُحفظ على جهازك فقط، ويُصفَّر تلقائيًا مع بداية يوم جديد. استخدم المسافة (Space) أو Enter للعد السريع."
            : "💡 Your progress is saved only on your device and resets automatically at the start of a new day. Use Space or Enter keys for quick counting."}
        </p>
      </div>
    </section>
  );
}