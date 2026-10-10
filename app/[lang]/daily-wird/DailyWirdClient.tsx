// app/[lang]/daily-wird/DailyWirdClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Lang } from "@/lib/i18n";

// ============================================================
// الأنواع
// ============================================================

type WirdTask = {
  id: string;
  icon: string;
  ar: string;
  en: string;
  href?: string;
  hrefLabelAr?: string;
  hrefLabelEn?: string;
};

type WirdDay = {
  id: string;
  ar: string;
  en: string;
  icon: string;
  tasks: WirdTask[];
};

type UILang = {
  searchPlaceholder: string;
  search: string;
  clearSearch: string;
  resetProgress: string;
  results: string;
  of: string;
  noResults: string;
  noResultsDesc: string;
  weeklyProgress: string;
  dayProgress: string;
  completed: string;
  pending: string;
  open: string;
  markDone: string;
  markUndone: string;
  allDays: string;
  note: string;
  tipTitle: string;
  tips: string[];
  celebration: string;
  celebrationDesc: string;
  todayProgress: string;
  streakTitle: string;
  streakDesc: string;
  totalDone: string;
  today: string;
};

// ============================================================
// الثوابت
// ============================================================

const STORAGE_KEY = "ismail-dawah-wird-progress-v1";
const STREAK_KEY = "ismail-dawah-wird-streak-v1";

// ============================================================
// المكون الرئيسي
// ============================================================

export default function DailyWirdClient({
  lang,
  isRTL,
  DAYS,
  UI,
}: {
  lang: Lang;
  isRTL: boolean;
  DAYS: WirdDay[];
  UI: UILang;
}) {
  const ALL_TASK_IDS = useMemo(
    () => DAYS.flatMap((day) => day.tasks.map((task) => task.id)),
    [DAYS]
  );

  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [streak, setStreak] = useState(0);

  // ===== تحميل البيانات من localStorage =====
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { ids?: string[]; date?: string };
        const today = new Date().toISOString().slice(0, 10);
        
        // إذا كان من يوم آخر، نحفظ الإنجازات القديمة ونبدأ من جديد
        if (parsed.date !== today) {
          // حساب streak
          if (parsed.ids && parsed.ids.length > 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().slice(0, 10);
            
            const streakRaw = localStorage.getItem(STREAK_KEY);
            const streakData = streakRaw ? JSON.parse(streakRaw) : { count: 0, lastDate: "" };
            
            if (streakData.lastDate === yesterdayStr || streakData.lastDate === parsed.date) {
              setStreak(streakData.count + 1);
              localStorage.setItem(STREAK_KEY, JSON.stringify({ 
                count: streakData.count + 1, 
                lastDate: today 
              }));
            } else {
              setStreak(1);
              localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastDate: today }));
            }
          }
          setDoneIds([]);
        } else {
          setDoneIds(parsed.ids || []);
          const streakRaw = localStorage.getItem(STREAK_KEY);
          const streakData = streakRaw ? JSON.parse(streakRaw) : { count: 0 };
          setStreak(streakData.count);
        }
      } else {
        const streakRaw = localStorage.getItem(STREAK_KEY);
        const streakData = streakRaw ? JSON.parse(streakRaw) : { count: 0 };
        setStreak(streakData.count);
      }
    } catch {
      // تجاهل
    }
    setLoaded(true);
  }, []);

  // ===== حفظ البيانات في localStorage =====
  useEffect(() => {
    if (!loaded) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: doneIds, date: today }));
    } catch {
      // تجاهل
    }
  }, [doneIds, loaded]);

  // ===== فحص الاحتفال =====
  useEffect(() => {
    if (!loaded) return;
    
    const todayId = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const todayDay = DAYS.find((d) => d.id === todayId);
    
    if (todayDay) {
      const todayTasks = todayDay.tasks.map((t) => t.id);
      const allDone = todayTasks.every((id) => doneIds.includes(id));
      if (allDone && todayTasks.length > 0 && !showCelebration) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 8000);
      }
    }
  }, [doneIds, loaded, DAYS, showCelebration]);

  // ===== الدوال =====
  const toggleTask = (taskId: string) => {
    setDoneIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const resetProgress = () => {
    if (confirm(isRTL ? "هل تريد تصفير كل التقدم؟" : "Reset all progress?")) {
      setDoneIds([]);
    }
  };

  const normalize = (v: string) => v.trim().toLowerCase();
  
  const taskMatches = (task: WirdTask, q: string) => {
    if (!q) return true;
    const nq = normalize(q);
    return [task.ar, task.en, task.id].some((v) => normalize(v).includes(nq));
  };

  const formatNumber = (value: number): string => {
    if (lang === "ar") {
      const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
      return String(value)
        .split("")
        .map((d) => {
          const n = Number(d);
          return Number.isFinite(n) ? arabicNumerals[n] : d;
        })
        .join("");
    }
    return String(value);
  };

  // ===== الحسابات =====
  const daysToRender = selectedDay === "all" 
    ? DAYS 
    : DAYS.filter((d) => d.id === selectedDay);

  const filteredDays = daysToRender
    .map((day) => ({
      ...day,
      tasks: day.tasks.filter((t) => taskMatches(t, searchQuery)),
    }))
    .filter((day) => day.tasks.length > 0);

  const totalTasks = ALL_TASK_IDS.length;
  const completedTotal = doneIds.filter((id) => ALL_TASK_IDS.includes(id)).length;
  const weeklyPercent = totalTasks > 0 
    ? Math.min(Math.round((completedTotal / totalTasks) * 100), 100) 
    : 0;

  // ===== اليوم الحالي =====
  const todayId = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const todayDay = DAYS.find((d) => d.id === todayId);
  const todayTaskIds = todayDay?.tasks.map((t) => t.id) || [];
  const todayCompleted = todayTaskIds.filter((id) => doneIds.includes(id)).length;
  const todayPercent = todayTaskIds.length > 0 
    ? Math.round((todayCompleted / todayTaskIds.length) * 100) 
    : 0;

  if (!loaded) {
    return (
      <div className="container-page py-10">
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse p-6">
              <div className="mb-4 h-6 w-32 rounded bg-slate-200 dark:bg-night-700" />
              <div className="mb-2 h-4 w-full rounded bg-slate-200 dark:bg-night-700" />
              <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-night-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ===== رسالة الاحتفال ===== */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-md p-8 text-center shadow-2xl animate-scale-in">
            <div className="mb-4 text-6xl">🎉</div>
            <h2
              className="mb-3 text-3xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {UI.celebration}
            </h2>
            <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
              {UI.celebrationDesc}
            </p>
            <button
              onClick={() => setShowCelebration(false)}
              className="btn-primary"
            >
              ✓ {isRTL ? "شكراً" : "Thanks"}
            </button>
          </div>
        </div>
      )}

      <section className="container-page py-10 md:py-14">
        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon="📊"
            label={UI.weeklyProgress}
            value={`${formatNumber(weeklyPercent)}%`}
            color="primary"
          />
          <StatCard
            icon="✅"
            label={UI.totalDone}
            value={`${formatNumber(completedTotal)}/${formatNumber(totalTasks)}`}
            color="gold"
          />
          <StatCard
            icon="📅"
            label={UI.today}
            value={`${formatNumber(todayPercent)}%`}
            color="primary"
          />
          <StatCard
            icon="🔥"
            label={UI.streakTitle}
            value={formatNumber(streak)}
            color="gold"
            subtitle={isRTL ? "يوم" : "days"}
          />
        </div>

        {/* ===== بطاقة البحث ===== */}
        <div className="card mb-8 p-6 md:p-7">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <svg
                className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={UI.searchPlaceholder}
                className="input-islamic !ps-12"
                aria-label={UI.searchPlaceholder}
              />
            </div>

            <button
              onClick={() => setSearchQuery("")}
              disabled={!searchQuery}
              className="btn-outline whitespace-nowrap disabled:opacity-50"
            >
              {UI.clearSearch}
            </button>
          </div>

          {doneIds.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={resetProgress}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-900/30"
              >
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9" />
                  <path d="M3 3v6h6" />
                </svg>
                {UI.resetProgress}
              </button>
            </div>
          )}
        </div>

        {/* ===== التقدم الأسبوعي ===== */}
        <div className="card relative mb-8 overflow-hidden p-6 md:p-8">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2
                className="text-2xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {UI.weeklyProgress}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {formatNumber(completedTotal)} / {formatNumber(totalTasks)} {UI.completed}
              </p>
            </div>

            <div className="text-4xl font-black text-primary-600 md:text-5xl dark:text-primary-400">
              {formatNumber(weeklyPercent)}%
            </div>
          </div>

          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-night-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                weeklyPercent === 100
                  ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                  : "bg-gradient-to-r from-primary-400 via-primary-500 to-gold-400"
              }`}
              style={{ width: `${weeklyPercent}%` }}
            />
          </div>
        </div>

        {/* ===== تبويبات الأيام ===== */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedDay("all")}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
              selectedDay === "all"
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
            }`}
          >
            <span>🗓️</span>
            <span>{UI.allDays}</span>
          </button>

          {DAYS.map((day) => {
            const isActive = selectedDay === day.id;
            const dayTaskIds = day.tasks.map((t) => t.id);
            const dayCompleted = dayTaskIds.filter((id) => doneIds.includes(id)).length;
            const dayPercent = dayTaskIds.length > 0 
              ? Math.round((dayCompleted / dayTaskIds.length) * 100) 
              : 0;
            const isToday = day.id === todayId;

            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                    : dayPercent === 100
                    ? "border-2 border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-300"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
                }`}
              >
                {isToday && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-gold-500" />
                  </span>
                )}
                <span>{dayPercent === 100 ? "✓" : day.icon}</span>
                <span>{isRTL ? day.ar : day.en}</span>
                {dayCompleted > 0 && dayPercent < 100 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                  }`}>
                    {formatNumber(dayPercent)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ===== عدد النتائج ===== */}
        <p className="mb-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {UI.results}:{" "}
          <span className="text-primary-600 dark:text-primary-400">
            {formatNumber(filteredDays.reduce((sum, day) => sum + day.tasks.length, 0))}
          </span>{" "}
          {UI.of}{" "}
          <span className="text-slate-700 dark:text-slate-200">
            {formatNumber(totalTasks)}
          </span>
        </p>

        {/* ===== لا توجد نتائج ===== */}
        {filteredDays.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">📭</div>
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {UI.noResults}
            </h3>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {UI.noResultsDesc}
            </p>
            <button onClick={() => setSearchQuery("")} className="btn-primary">
              {UI.clearSearch}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredDays.map((day) => {
              const dayTaskIds = day.tasks.map((t) => t.id);
              const dayCompleted = dayTaskIds.filter((id) => doneIds.includes(id)).length;
              const dayPercent = dayTaskIds.length > 0
                ? Math.min(Math.round((dayCompleted / dayTaskIds.length) * 100), 100)
                : 0;
              const isToday = day.id === todayId;

              return (
                <div
                  key={day.id}
                  className={`card p-6 md:p-7 ${
                    isToday ? "ring-2 ring-gold-400 ring-offset-2 ring-offset-cream-dark dark:ring-offset-gray-900" : ""
                  }`}
                >
                  {/* رأس اليوم */}
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                        {dayPercent === 100 ? "✓" : day.icon}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2
                            className="text-2xl font-black text-slate-900 dark:text-white"
                            style={{ fontFamily: "var(--font-amiri)" }}
                          >
                            {isRTL ? day.ar : day.en}
                          </h2>
                          {isToday && (
                            <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-black text-gold-700 dark:bg-gold-900/40 dark:text-gold-300">
                              {isRTL ? "اليوم" : "Today"}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {formatNumber(dayCompleted)} / {formatNumber(day.tasks.length)} {UI.completed}
                        </p>
                      </div>
                    </div>

                    <div className="w-full md:w-56">
                      <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span>{UI.dayProgress}</span>
                        <span className="text-primary-600 dark:text-primary-400">
                          {formatNumber(dayPercent)}%
                        </span>
                      </div>

                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-night-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            dayPercent === 100
                              ? "bg-gradient-to-r from-green-400 to-green-600"
                              : "bg-gradient-to-r from-primary-400 to-gold-400"
                          }`}
                          style={{ width: `${dayPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* مهام اليوم */}
                  <div className="space-y-3">
                    {day.tasks.map((task) => {
                      const isDone = doneIds.includes(task.id);

                      return (
                        <div
                          key={task.id}
                          className={`group flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between ${
                            isDone
                              ? "border-green-200 bg-green-50/60 dark:border-green-800/40 dark:bg-green-950/20"
                              : "border-slate-200 bg-white hover:border-primary-200 dark:border-night-700 dark:bg-night-800 dark:hover:border-primary-700"
                          }`}
                        >
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="flex min-w-0 flex-1 items-start gap-3 text-start"
                            aria-label={isDone ? UI.markUndone : UI.markDone}
                          >
                            <span
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                isDone
                                  ? "border-green-500 bg-green-500 text-white scale-110"
                                  : "border-slate-300 bg-white group-hover:border-primary-500 dark:border-night-600 dark:bg-night-900"
                              }`}
                            >
                              {isDone && (
                                <svg
                                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                                  stroke="currentColor" strokeWidth="3"
                                  strokeLinecap="round" strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </span>

                            <span className="min-w-0">
                              <span
                                className={`flex items-center gap-2 text-sm font-bold leading-relaxed transition-all ${
                                  isDone
                                    ? "text-green-800 line-through decoration-green-500/60 dark:text-green-200"
                                    : "text-slate-800 dark:text-slate-100"
                                }`}
                              >
                                <span>{task.icon}</span>
                                <span>{isRTL ? task.ar : task.en}</span>
                              </span>
                            </span>
                          </button>

                          {task.href && (
                            <Link
                              href={`/${lang}${task.href}`}
                              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-bold text-primary-700 transition-all hover:bg-primary-100 active:scale-95 dark:border-primary-800/50 dark:bg-primary-950/30 dark:text-primary-300 dark:hover:bg-primary-900/40"
                            >
                              <span>{isRTL ? task.hrefLabelAr : task.hrefLabelEn}</span>
                              <svg
                                width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round"
                                className={isRTL ? "rotate-180" : ""}
                              >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== نصائح ===== */}
        <div className="card mt-10 p-6 md:p-8">
          <h2
            className="mb-5 text-xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            💡 {UI.tipTitle}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {UI.tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {formatNumber(index + 1)}
                </span>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ملاحظة ===== */}
        <div className="card mt-6 border-gold-200 bg-gold-50/60 p-5 text-center dark:border-gold-900/30 dark:bg-gold-950/15">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            💾 {UI.note}
          </p>
        </div>
      </section>
    </>
  );
}

// ============================================================
// مكون StatCard
// ============================================================

function StatCard({
  icon, label, value, color, subtitle,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: "primary" | "gold";
  subtitle?: string;
}) {
  const colorClasses = {
    primary: "text-primary-700 dark:text-primary-300",
    gold: "text-gold-700 dark:text-gold-300",
  };

  return (
    <div className="card p-5 text-center">
      <div className="mb-2 flex justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          {icon}
        </span>
      </div>
      <p className={`text-2xl font-black ${colorClasses[color]}`}>
        {value}
        {subtitle && <span className="ml-1 text-xs font-bold text-slate-500 dark:text-slate-400">{subtitle}</span>}
      </p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}