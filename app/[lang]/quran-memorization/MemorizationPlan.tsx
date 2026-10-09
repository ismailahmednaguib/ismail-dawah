// app/[lang]/quran-memorization/MemorizationPlan.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { SURAHS, toArabicNumeral, type Surah } from "@/lib/data";
import type { Lang } from "@/lib/i18n";

const STORAGE_KEY = "dawah_memorization_plan_v1";

type SavedState = {
  date: string;
  selectedSurah: number;
  dailyGoal: number;
  memorized: Record<number, number>;
  reviewed: Record<number, number>;
  streak: number;
  lastActiveDate: string | null;
};

const DAILY_GOAL_OPTIONS = [1, 3, 5, 10, 20, 50];

const UI: Record<
  Lang,
  {
    chooseSurah: string;
    dailyGoal: string;
    ayahsPerDay: string;
    memorized: string;
    reviewed: string;
    markMemorized: string;
    markReviewed: string;
    resetSurah: string;
    progress: string;
    overallProgress: string;
    completedSurahs: string;
    totalAyahsMemorized: string;
    streak: string;
    days: string;
    day: string;
    surah: string;
    ayahs: string;
    of: string;
    planTitle: string;
    planDesc: string;
    tipTitle: string;
    tips: string[];
    note: string;
    loading: string;
    searchSurah: string;
    noSurahFound: string;
    estimatedFinish: string;
    daysLeft: string;
    completed: string;
    notStarted: string;
    inProgress: string;
    resetAll: string;
    confirmReset: string;
  }
> = {
  ar: {
    chooseSurah: "اختر السورة",
    dailyGoal: "الهدف اليومي",
    ayahsPerDay: "آية في اليوم",
    memorized: "المحفوظ",
    reviewed: "المراجع",
    markMemorized: "علّم كمحفوظ",
    markReviewed: "علّم كمراجع",
    resetSurah: "تصفير السورة",
    progress: "التقدم",
    overallProgress: "التقدم الكلي",
    completedSurahs: "سور مكتملة",
    totalAyahsMemorized: "إجمالي الآيات المحفوظة",
    streak: "أيام متتالية",
    days: "يوم",
    day: "يوم",
    surah: "سورة",
    ayahs: "آية",
    of: "من",
    planTitle: "خطتك اليومية",
    planDesc: "حدد سورة وهدف يومي، والتزم به إن شاء الله.",
    tipTitle: "نصائح للحفظ",
    tips: [
      "اختر وقتًا ثابتًا يوميًا للحفظ، مثل بعد الفجر.",
      "راجع المحفوظ قبل البدء في الجديد.",
      "اقطع السورة إلى مجموعات صغيرة من 3-5 آيات.",
      "استمع للتلاوة قبل الحفظ لضبط النطق.",
      "لا تنتقل لسورة جديدة حتى تتقن السابقة.",
      "اجعل لك وردًا يوميًا للمراجعة ولو آية واحدة.",
    ],
    note: "💡 تقدمك يُحفظ على جهازك فقط. حافظ على الاستمرارية ولو بآية واحدة يوميًا.",
    loading: "جارٍ التحميل...",
    searchSurah: "ابحث عن السورة...",
    noSurahFound: "لا توجد سورة مطابقة",
    estimatedFinish: "الانتهاء المتوقع",
    daysLeft: "يوم متبقي",
    completed: "مكتملة",
    notStarted: "لم تبدأ",
    inProgress: "جارية",
    resetAll: "تصفير الخطة كلها",
    confirmReset: "هل أنت متأكد من تصفير كل التقدم؟",
  },
  en: {
    chooseSurah: "Choose Surah",
    dailyGoal: "Daily Goal",
    ayahsPerDay: "ayahs per day",
    memorized: "Memorized",
    reviewed: "Reviewed",
    markMemorized: "Mark as memorized",
    markReviewed: "Mark as reviewed",
    resetSurah: "Reset surah",
    progress: "Progress",
    overallProgress: "Overall progress",
    completedSurahs: "Completed surahs",
    totalAyahsMemorized: "Total ayahs memorized",
    streak: "Day streak",
    days: "days",
    day: "day",
    surah: "Surah",
    ayahs: "ayahs",
    of: "of",
    planTitle: "Your Daily Plan",
    planDesc: "Pick a surah and a daily goal, then stay consistent, in sha Allah.",
    tipTitle: "Memorization Tips",
    tips: [
      "Choose a fixed time daily, such as after Fajr.",
      "Review what you memorized before starting new ayahs.",
      "Break the surah into small groups of 3-5 ayahs.",
      "Listen to recitation before memorizing to fix pronunciation.",
      "Do not move to a new surah until the previous one is solid.",
      "Keep a daily revision portion, even one ayah.",
    ],
    note: "💡 Your progress is saved only on your device. Stay consistent, even with one ayah a day.",
    loading: "Loading...",
    searchSurah: "Search surah...",
    noSurahFound: "No matching surah",
    estimatedFinish: "Estimated finish",
    daysLeft: "days left",
    completed: "Completed",
    notStarted: "Not started",
    inProgress: "In progress",
    resetAll: "Reset whole plan",
    confirmReset: "Are you sure you want to reset all progress?",
  },
};

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatNumber(value: number, lang: Lang): string {
  return lang === "ar" ? toArabicNumeral(value) : String(value);
}

function surahLabel(surah: Surah, lang: Lang): string {
  return lang === "ar" ? surah.arabicName : surah.englishName;
}

function calculateStreak(lastActive: string | null, today: string): number {
  if (!lastActive) return 0;

  const last = new Date(lastActive);
  const current = new Date(today);

  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // لو نفس اليوم، ما نزيدش الستريك
  if (diffDays === 0) return -1;

  // لو يوم واحد فقط، نزيد
  if (diffDays === 1) return 1;

  // لو أكتر من يوم، نبدأ من جديد
  return -2;
}

export default function MemorizationPlan({ lang }: { lang: Lang }) {
  const ui = UI[lang] || UI.ar;
  const isRTL = lang === "ar";

  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [dailyGoal, setDailyGoal] = useState<number>(5);
  const [memorized, setMemorized] = useState<Record<number, number>>({});
  const [reviewed, setReviewed] = useState<Record<number, number>>({});
  const [streak, setStreak] = useState<number>(0);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  // ===== تحميل الحالة =====
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const today = getTodayKey();

      if (!raw) {
        setHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<SavedState>;

      const validSurah =
        typeof parsed.selectedSurah === "number" &&
        SURAHS.some((s) => s.number === parsed.selectedSurah)
          ? parsed.selectedSurah
          : 1;

      const validGoal =
        typeof parsed.dailyGoal === "number" &&
        DAILY_GOAL_OPTIONS.includes(parsed.dailyGoal)
          ? parsed.dailyGoal
          : 5;

      setSelectedSurah(validSurah);
      setDailyGoal(validGoal);
      setMemorized(parsed.memorized || {});
      setReviewed(parsed.reviewed || {});

      // حساب الستريك
      const lastDate = parsed.lastActiveDate ?? null;
      const streakDelta = calculateStreak(lastDate, today);

      if (streakDelta === 1) {
        setStreak((parsed.streak ?? 0) + 1);
      } else if (streakDelta === -2) {
        setStreak(0);
      } else {
        setStreak(parsed.streak ?? 0);
      }

      setLastActiveDate(lastDate);
    } catch {
      // تجاهل أخطاء القراءة
    } finally {
      setHydrated(true);
    }
  }, []);

  // ===== حفظ الحالة =====
  useEffect(() => {
    if (!hydrated) return;

    try {
      const today = getTodayKey();
      const state: SavedState = {
        date: today,
        selectedSurah,
        dailyGoal,
        memorized,
        reviewed,
        streak,
        lastActiveDate,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // تجاهل أخطاء الحفظ
    }
  }, [
    dailyGoal,
    hydrated,
    lastActiveDate,
    memorized,
    reviewed,
    selectedSurah,
    streak,
  ]);

  const currentSurah = useMemo(
    () => SURAHS.find((s) => s.number === selectedSurah) ?? SURAHS[0],
    [selectedSurah]
  );

  const filteredSurahs = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return SURAHS;

    return SURAHS.filter(
      (surah) =>
        surah.arabicName.includes(search.trim()) ||
        surah.englishName.toLowerCase().includes(q) ||
        String(surah.number) === q
    );
  }, [search]);

  const currentMemorized = memorized[currentSurah.number] ?? 0;
  const currentReviewed = reviewed[currentSurah.number] ?? 0;
  const currentPercent = Math.min(
    Math.round((currentMemorized / currentSurah.ayahs) * 100),
    100
  );
  const isSurahComplete = currentMemorized >= currentSurah.ayahs;

  const totalMemorized = useMemo(
    () =>
      Object.values(memorized).reduce(
        (sum, value) => sum + (value ?? 0),
        0
      ),
    [memorized]
  );

  const totalAyahs = useMemo(
    () => SURAHS.reduce((sum, surah) => sum + surah.ayahs, 0),
    []
  );

  const overallPercent = useMemo(
    () => Math.min(Math.round((totalMemorized / totalAyahs) * 100), 100),
    [totalAyahs, totalMemorized]
  );

  const completedSurahs = useMemo(
    () =>
      SURAHS.filter(
        (surah) => (memorized[surah.number] ?? 0) >= surah.ayahs
      ).length,
    [memorized]
  );

  const remainingAyahsInSurah = Math.max(
    0,
    currentSurah.ayahs - currentMemorized
  );

  const estimatedDays = useMemo(() => {
    if (remainingAyahsInSurah === 0) return 0;
    return Math.ceil(remainingAyahsInSurah / dailyGoal);
  }, [dailyGoal, remainingAyahsInSurah]);

  // ===== تحديث آخر نشاط =====
  const touchActivity = useCallback(() => {
    const today = getTodayKey();

    setLastActiveDate((prev) => {
      if (prev === today) return prev;

      const delta = calculateStreak(prev, today);

      if (delta === 1) {
        setStreak((s) => s + 1);
      } else if (delta === -2) {
        setStreak(1);
      }

      return today;
    });
  }, []);

  // ===== زيادة الحفظ =====
  const incrementMemorized = useCallback(
    (amount: number) => {
      if (!hydrated) return;

      setMemorized((prev) => {
        const current = prev[currentSurah.number] ?? 0;
        const next = Math.min(current + amount, currentSurah.ayahs);

        return {
          ...prev,
          [currentSurah.number]: next,
        };
      });

      touchActivity();
    },
    [currentSurah.ayahs, currentSurah.number, hydrated, touchActivity]
  );

  // ===== زيادة المراجعة =====
  const incrementReviewed = useCallback(() => {
    if (!hydrated) return;

    setReviewed((prev) => {
      const current = prev[currentSurah.number] ?? 0;
      const next = Math.min(current + dailyGoal, currentSurah.ayahs);

      return {
        ...prev,
        [currentSurah.number]: next,
      };
    });

    touchActivity();
  }, [currentSurah.ayahs, currentSurah.number, dailyGoal, hydrated, touchActivity]);

  // ===== تصفير السورة =====
  const resetSurah = useCallback(() => {
    setMemorized((prev) => {
      const next = { ...prev };
      delete next[currentSurah.number];
      return next;
    });

    setReviewed((prev) => {
      const next = { ...prev };
      delete next[currentSurah.number];
      return next;
    });
  }, [currentSurah.number]);

  // ===== تصفير الكل =====
  const resetAll = useCallback(() => {
    const confirmed = window.confirm(ui.confirmReset);
    if (!confirmed) return;

    setMemorized({});
    setReviewed({});
    setStreak(0);
    setLastActiveDate(null);
  }, [ui.confirmReset]);

  // ===== تغيير الهدف =====
  const handleGoalChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setDailyGoal(Number(event.target.value));
    },
    []
  );

  // ===== تغيير السورة =====
  const handleSurahChange = useCallback((number: number) => {
    setSelectedSurah(number);
    setSearch("");
  }, []);

  if (!hydrated) {
    return (
      <section className="container-page py-10 md:py-14">
        <div className="card p-10 text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-night-700 dark:border-t-primary-400" />
          <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
            {ui.loading}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-10 md:py-14">
      {/* ===== بطاقة الخطة اليومية ===== */}
      <div className="card relative mb-8 overflow-hidden p-6 md:p-8">
        <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

        <div className="mb-6">
          <h2
            className="mb-2 text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.planTitle}
          </h2>

          <p className="text-slate-500 dark:text-slate-400">
            {ui.planDesc}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          {/* اختيار السورة */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
              {ui.chooseSurah}
            </label>

            <div className="relative mb-3">
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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={ui.searchSurah}
                className="input-islamic !ps-12"
                aria-label={ui.searchSurah}
              />
            </div>

            <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white dark:border-night-700 dark:bg-night-800">
              {filteredSurahs.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {ui.noSurahFound}
                </p>
              ) : (
                filteredSurahs.map((surah) => {
                  const isActive = surah.number === currentSurah.number;
                  const surahMemorized = memorized[surah.number] ?? 0;
                  const surahPercent = Math.min(
                    Math.round((surahMemorized / surah.ayahs) * 100),
                    100
                  );
                  const isComplete = surahMemorized >= surah.ayahs;

                  return (
                    <button
                      key={surah.number}
                      type="button"
                      onClick={() => handleSurahChange(surah.number)}
                      className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-start transition-all last:border-b-0 dark:border-night-700 ${
                        isActive
                          ? "bg-primary-50 dark:bg-primary-950/30"
                          : "hover:bg-slate-50 dark:hover:bg-night-700"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                          isComplete
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : isActive
                            ? "bg-primary-500 text-white"
                            : "bg-slate-100 text-slate-600 dark:bg-night-700 dark:text-slate-300"
                        }`}
                      >
                        {isComplete ? "✓" : formatNumber(surah.number, lang)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-bold ${
                            isActive
                              ? "text-primary-800 dark:text-primary-200"
                              : "text-slate-800 dark:text-slate-100"
                          }`}
                        >
                          {surahLabel(surah, lang)}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatNumber(surah.ayahs, lang)} {ui.ayahs}
                        </p>
                      </div>

                      {surahMemorized > 0 && (
                        <span className="shrink-0 text-xs font-black text-gold-600 dark:text-gold-400">
                          {formatNumber(surahPercent, lang)}%
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* الهدف اليومي */}
          <div>
            <label
              htmlFor="daily-goal"
              className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              {ui.dailyGoal}
            </label>

            <select
              id="daily-goal"
              value={dailyGoal}
              onChange={handleGoalChange}
              className="input-islamic"
            >
              {DAILY_GOAL_OPTIONS.map((goal) => (
                <option key={goal} value={goal}>
                  {formatNumber(goal, lang)} {ui.ayahsPerDay}
                </option>
              ))}
            </select>

            {estimatedDays > 0 && (
              <div className="mt-4 rounded-xl border border-primary-100 bg-primary-50/60 p-4 text-center dark:border-primary-900/40 dark:bg-primary-950/20">
                <p className="text-xs font-bold text-primary-700 dark:text-primary-300">
                  {ui.estimatedFinish}
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {formatNumber(estimatedDays, lang)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {ui.daysLeft}
                </p>
              </div>
            )}

            {isSurahComplete && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50/60 p-4 text-center dark:border-green-800/40 dark:bg-green-950/20">
                <p className="text-sm font-black text-green-700 dark:text-green-300">
                  ✓ {ui.completed}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== السورة الحالية ===== */}
      <div className="card mb-8 p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-sm font-bold text-primary-600 dark:text-primary-400">
              {ui.surah} {formatNumber(currentSurah.number, lang)}
            </p>

            <h2
              className="text-3xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {surahLabel(currentSurah, lang)}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {formatNumber(currentSurah.ayahs, lang)} {ui.ayahs} •{" "}
              {currentSurah.type === "makki"
                ? isRTL
                  ? "مكية"
                  : "Meccan"
                : isRTL
                ? "مدنية"
                : "Medinan"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => incrementMemorized(1)}
              disabled={isSurahComplete}
              className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              {ui.markMemorized}
            </button>

            <button
              type="button"
              onClick={() => incrementMemorized(dailyGoal)}
              disabled={isSurahComplete}
              className="btn-outline inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              +{formatNumber(dailyGoal, lang)}
            </button>

            <button
              type="button"
              onClick={incrementReviewed}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gold-200 bg-gold-50 px-5 py-3 text-sm font-bold text-gold-700 transition-all hover:bg-gold-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gold-800/40 dark:bg-gold-950/20 dark:text-gold-300 dark:hover:bg-gold-900/30"
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
                <path d="M1 4v6h6" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              {ui.markReviewed}
            </button>

            <button
              type="button"
              onClick={resetSurah}
              disabled={currentMemorized === 0 && currentReviewed === 0}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
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
              </svg>
              {ui.resetSurah}
            </button>
          </div>
        </div>

        {/* شريط التقدم */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span className="text-slate-600 dark:text-slate-300">
              {ui.memorized}:{" "}
              <span className="text-primary-600 dark:text-primary-400">
                {formatNumber(currentMemorized, lang)}
              </span>{" "}
              {ui.of}{" "}
              <span className="text-slate-800 dark:text-white">
                {formatNumber(currentSurah.ayahs, lang)}
              </span>
            </span>

            <span className="text-primary-600 dark:text-primary-400">
              {formatNumber(currentPercent, lang)}%
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-night-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSurahComplete
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : "bg-gradient-to-r from-primary-400 via-primary-500 to-gold-400"
              }`}
              style={{ width: `${currentPercent}%` }}
            />
          </div>
        </div>

        {/* إحصائيات السورة */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-night-700 dark:bg-night-800/50">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {ui.memorized}
            </p>
            <p className="mt-1 text-2xl font-black text-primary-600 dark:text-primary-400">
              {formatNumber(currentMemorized, lang)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-night-700 dark:bg-night-800/50">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {ui.reviewed}
            </p>
            <p className="mt-1 text-2xl font-black text-gold-600 dark:text-gold-400">
              {formatNumber(currentReviewed, lang)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-night-700 dark:bg-night-800/50">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {ui.streak}
            </p>
            <p className="mt-1 text-2xl font-black text-slate-800 dark:text-white">
              {formatNumber(streak, lang)} {ui.day}
            </p>
          </div>
        </div>
      </div>

      {/* ===== التقدم الكلي ===== */}
      <div className="card mb-8 p-6 md:p-8">
        <h2
          className="mb-6 text-xl font-black text-slate-900 dark:text-white"
          style={{ fontFamily: "var(--font-amiri)" }}
        >
          {ui.overallProgress}
        </h2>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span className="text-slate-600 dark:text-slate-300">
              {formatNumber(totalMemorized, lang)} / {formatNumber(totalAyahs, lang)}{" "}
              {ui.ayahs}
            </span>
            <span className="text-primary-600 dark:text-primary-400">
              {formatNumber(overallPercent, lang)}%
            </span>
          </div>

          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-night-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-gold-400 transition-all duration-700"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-5 text-center dark:border-primary-900/40 dark:bg-primary-950/20">
            <p className="text-xs font-bold text-primary-700 dark:text-primary-300">
              {ui.completedSurahs}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
              {formatNumber(completedSurahs, lang)}
            </p>
          </div>

          <div className="rounded-xl border border-gold-100 bg-gold-50/60 p-5 text-center dark:border-gold-800/40 dark:bg-gold-950/20">
            <p className="text-xs font-bold text-gold-700 dark:text-gold-300">
              {ui.totalAyahsMemorized}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
              {formatNumber(totalMemorized, lang)}
            </p>
          </div>

          <div className="rounded-xl border border-green-100 bg-green-50/60 p-5 text-center dark:border-green-800/40 dark:bg-green-950/20">
            <p className="text-xs font-bold text-green-700 dark:text-green-300">
              {ui.streak}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
              {formatNumber(streak, lang)}
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
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
            </svg>
            {ui.resetAll}
          </button>
        </div>
      </div>

      {/* ===== نصائح ===== */}
      <div className="card mb-8 p-6 md:p-8">
        <h2
          className="mb-5 text-xl font-black text-slate-900 dark:text-white"
          style={{ fontFamily: "var(--font-amiri)" }}
        >
          💡 {ui.tipTitle}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {ui.tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                {formatNumber(index + 1, lang)}
              </span>

              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ملاحظة ===== */}
      <div className="card p-5 text-center">
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {ui.note}
        </p>
      </div>
    </section>
  );
}