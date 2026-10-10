// app/[lang]/quran-memorization/MemorizationPlan.tsx
"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ============================================================
// Types
// ============================================================

type Lang = "ar" | "en";

type Surah = {
  n: number;
  ar: string;
  en: string;
  a: number;
};

type Progress = Record<number, number>;

type StoredState = {
  progress: Progress;
  dailyGoal: number;
  streak: number;
  lastActionDate: string | null;
  updatedAt: string;
};

type Message = {
  type: "success" | "error";
  text: string;
} | null;

type MemorizationPlanProps = {
  lang?: Lang | string;
  [key: string]: unknown;
};

// ============================================================
// Constants
// ============================================================

const STORAGE_KEY = "ismail-quran-memorization-v1";

const SURAHS: Surah[] = [
  { n: 1, ar: "الفاتحة", en: "Al-Fatihah", a: 7 },
  { n: 2, ar: "البقرة", en: "Al-Baqarah", a: 286 },
  { n: 3, ar: "آل عمران", en: "Ali 'Imran", a: 200 },
  { n: 4, ar: "النساء", en: "An-Nisa", a: 176 },
  { n: 5, ar: "المائدة", en: "Al-Ma'idah", a: 120 },
  { n: 6, ar: "الأنعام", en: "Al-An'am", a: 165 },
  { n: 7, ar: "الأعراف", en: "Al-A'raf", a: 206 },
  { n: 8, ar: "الأنفال", en: "Al-Anfal", a: 75 },
  { n: 9, ar: "التوبة", en: "At-Tawbah", a: 129 },
  { n: 10, ar: "يونس", en: "Yunus", a: 109 },
  { n: 11, ar: "هود", en: "Hud", a: 123 },
  { n: 12, ar: "يوسف", en: "Yusuf", a: 111 },
  { n: 13, ar: "الرعد", en: "Ar-Ra'd", a: 43 },
  { n: 14, ar: "إبراهيم", en: "Ibrahim", a: 52 },
  { n: 15, ar: "الحجر", en: "Al-Hijr", a: 99 },
  { n: 16, ar: "النحل", en: "An-Nahl", a: 128 },
  { n: 17, ar: "الإسراء", en: "Al-Isra", a: 111 },
  { n: 18, ar: "الكهف", en: "Al-Kahf", a: 110 },
  { n: 19, ar: "مريم", en: "Maryam", a: 98 },
  { n: 20, ar: "طه", en: "Ta-Ha", a: 135 },
  { n: 21, ar: "الأنبياء", en: "Al-Anbiya", a: 112 },
  { n: 22, ar: "الحج", en: "Al-Hajj", a: 78 },
  { n: 23, ar: "المؤمنون", en: "Al-Mu'minun", a: 118 },
  { n: 24, ar: "النور", en: "An-Nur", a: 64 },
  { n: 25, ar: "الفرقان", en: "Al-Furqan", a: 77 },
  { n: 26, ar: "الشعراء", en: "Ash-Shu'ara", a: 227 },
  { n: 27, ar: "النمل", en: "An-Naml", a: 93 },
  { n: 28, ar: "القصص", en: "Al-Qasas", a: 88 },
  { n: 29, ar: "العنكبوت", en: "Al-Ankabut", a: 69 },
  { n: 30, ar: "الروم", en: "Ar-Rum", a: 60 },
  { n: 31, ar: "لقمان", en: "Luqman", a: 34 },
  { n: 32, ar: "السجدة", en: "As-Sajdah", a: 30 },
  { n: 33, ar: "الأحزاب", en: "Al-Ahzab", a: 73 },
  { n: 34, ar: "سبأ", en: "Saba", a: 54 },
  { n: 35, ar: "فاطر", en: "Fatir", a: 45 },
  { n: 36, ar: "يس", en: "Ya-Sin", a: 83 },
  { n: 37, ar: "الصافات", en: "As-Saffat", a: 182 },
  { n: 38, ar: "ص", en: "Sad", a: 88 },
  { n: 39, ar: "الزمر", en: "Az-Zumar", a: 75 },
  { n: 40, ar: "غافر", en: "Ghafir", a: 85 },
  { n: 41, ar: "فصلت", en: "Fussilat", a: 54 },
  { n: 42, ar: "الشورى", en: "Ash-Shura", a: 53 },
  { n: 43, ar: "الزخرف", en: "Az-Zukhruf", a: 89 },
  { n: 44, ar: "الدخان", en: "Ad-Dukhan", a: 59 },
  { n: 45, ar: "الجاثية", en: "Al-Jathiyah", a: 37 },
  { n: 46, ar: "الأحقاف", en: "Al-Ahqaf", a: 35 },
  { n: 47, ar: "محمد", en: "Muhammad", a: 38 },
  { n: 48, ar: "الفتح", en: "Al-Fath", a: 29 },
  { n: 49, ar: "الحجرات", en: "Al-Hujurat", a: 18 },
  { n: 50, ar: "ق", en: "Qaf", a: 45 },
  { n: 51, ar: "الذاريات", en: "Adh-Dhariyat", a: 60 },
  { n: 52, ar: "الطور", en: "At-Tur", a: 49 },
  { n: 53, ar: "النجم", en: "An-Najm", a: 62 },
  { n: 54, ar: "القمر", en: "Al-Qamar", a: 55 },
  { n: 55, ar: "الرحمن", en: "Ar-Rahman", a: 78 },
  { n: 56, ar: "الواقعة", en: "Al-Waqi'ah", a: 96 },
  { n: 57, ar: "الحديد", en: "Al-Hadid", a: 29 },
  { n: 58, ar: "المجادلة", en: "Al-Mujadila", a: 22 },
  { n: 59, ar: "الحشر", en: "Al-Hashr", a: 24 },
  { n: 60, ar: "الممتحنة", en: "Al-Mumtahanah", a: 13 },
  { n: 61, ar: "الصف", en: "As-Saff", a: 14 },
  { n: 62, ar: "الجمعة", en: "Al-Jumu'ah", a: 11 },
  { n: 63, ar: "المنافقون", en: "Al-Munafiqun", a: 11 },
  { n: 64, ar: "التغابن", en: "At-Taghabun", a: 18 },
  { n: 65, ar: "الطلاق", en: "At-Talaq", a: 12 },
  { n: 66, ar: "التحريم", en: "At-Tahrim", a: 12 },
  { n: 67, ar: "الملك", en: "Al-Mulk", a: 30 },
  { n: 68, ar: "القلم", en: "Al-Qalam", a: 52 },
  { n: 69, ar: "الحاقة", en: "Al-Haqqah", a: 52 },
  { n: 70, ar: "المعارج", en: "Al-Ma'arij", a: 44 },
  { n: 71, ar: "نوح", en: "Nuh", a: 28 },
  { n: 72, ar: "الجن", en: "Al-Jinn", a: 28 },
  { n: 73, ar: "المزمل", en: "Al-Muzzammil", a: 20 },
  { n: 74, ar: "المدثر", en: "Al-Muddaththir", a: 56 },
  { n: 75, ar: "القيامة", en: "Al-Qiyamah", a: 40 },
  { n: 76, ar: "الإنسان", en: "Al-Insan", a: 31 },
  { n: 77, ar: "المرسلات", en: "Al-Mursalat", a: 50 },
  { n: 78, ar: "النبأ", en: "An-Naba", a: 40 },
  { n: 79, ar: "النازعات", en: "An-Nazi'at", a: 46 },
  { n: 80, ar: "عبس", en: "Abasa", a: 42 },
  { n: 81, ar: "التكوير", en: "At-Takwir", a: 29 },
  { n: 82, ar: "الانفطار", en: "Al-Infitar", a: 19 },
  { n: 83, ar: "المطففين", en: "Al-Mutaffifin", a: 36 },
  { n: 84, ar: "الانشقاق", en: "Al-Inshiqaq", a: 25 },
  { n: 85, ar: "البروج", en: "Al-Buruj", a: 22 },
  { n: 86, ar: "الطارق", en: "At-Tariq", a: 17 },
  { n: 87, ar: "الأعلى", en: "Al-A'la", a: 19 },
  { n: 88, ar: "الغاشية", en: "Al-Ghashiyah", a: 26 },
  { n: 89, ar: "الفجر", en: "Al-Fajr", a: 30 },
  { n: 90, ar: "البلد", en: "Al-Balad", a: 20 },
  { n: 91, ar: "الشمس", en: "Ash-Shams", a: 15 },
  { n: 92, ar: "الليل", en: "Al-Layl", a: 21 },
  { n: 93, ar: "الضحى", en: "Ad-Duha", a: 11 },
  { n: 94, ar: "الشرح", en: "Ash-Sharh", a: 8 },
  { n: 95, ar: "التين", en: "At-Tin", a: 8 },
  { n: 96, ar: "العلق", en: "Al-Alaq", a: 19 },
  { n: 97, ar: "القدر", en: "Al-Qadr", a: 5 },
  { n: 98, ar: "البينة", en: "Al-Bayyinah", a: 8 },
  { n: 99, ar: "الزلزلة", en: "Az-Zalzalah", a: 8 },
  { n: 100, ar: "العاديات", en: "Al-Adiyat", a: 11 },
  { n: 101, ar: "القارعة", en: "Al-Qari'ah", a: 11 },
  { n: 102, ar: "التكاثر", en: "At-Takathur", a: 8 },
  { n: 103, ar: "العصر", en: "Al-Asr", a: 3 },
  { n: 104, ar: "الهمزة", en: "Al-Humazah", a: 9 },
  { n: 105, ar: "الفيل", en: "Al-Fil", a: 5 },
  { n: 106, ar: "قريش", en: "Quraysh", a: 4 },
  { n: 107, ar: "الماعون", en: "Al-Ma'un", a: 7 },
  { n: 108, ar: "الكوثر", en: "Al-Kawthar", a: 3 },
  { n: 109, ar: "الكافرون", en: "Al-Kafirun", a: 6 },
  { n: 110, ar: "النصر", en: "An-Nasr", a: 3 },
  { n: 111, ar: "المسد", en: "Al-Masad", a: 5 },
  { n: 112, ar: "الإخلاص", en: "Al-Ikhlas", a: 4 },
  { n: 113, ar: "الفلق", en: "Al-Falaq", a: 5 },
  { n: 114, ar: "الناس", en: "An-Nas", a: 6 },
];

const SURAH_BY_N = new Map(SURAHS.map((s) => [s.n, s]));
const TOTAL_AYAHS = SURAHS.reduce((sum, s) => sum + s.a, 0);

// ============================================================
// UI Text
// ============================================================

type ComponentUI = {
  title: string;
  description: string;
  selectSurah: string;
  dailyGoal: string;
  goalHint: string;
  quickAdd: string;
  addOne: string;
  addFive: string;
  addTen: string;
  addGoal: string;
  subtractOne: string;
  resetSurah: string;
  resetAll: string;
  export: string;
  import: string;
  totalMemorized: string;
  totalProgress: string;
  surahProgress: string;
  remaining: string;
  streak: string;
  lastUpdate: string;
  note: string;
  imported: string;
  exported: string;
  importFailed: string;
  exportFailed: string;
  resetSurahDone: string;
  resetAllDone: string;
  confirmResetSurah: string;
  confirmResetAll: string;
  loading: string;
};

const UI: Record<Lang, ComponentUI> = {
  ar: {
    title: "الخطة التفاعلية لحفظ القرآن",
    description:
      "اختر السورة وحدد هدفك اليومي وسجّل تقدمك. يُحفظ كل شيء محليًا على جهازك.",
    selectSurah: "اختر السورة",
    dailyGoal: "الهدف اليومي (آية)",
    goalHint: "يمكنك ضبط الهدف من 1 إلى 50 آية.",
    quickAdd: "إضافة سريعة",
    addOne: "+1",
    addFive: "+5",
    addTen: "+10",
    addGoal: "+ الهدف",
    subtractOne: "-1",
    resetSurah: "تصفير السورة",
    resetAll: "تصفير الكل",
    export: "تصدير JSON",
    import: "استيراد JSON",
    totalMemorized: "إجمالي المحفوظ",
    totalProgress: "نسبة الحفظ الكلية",
    surahProgress: "تقدم السورة",
    remaining: "المتبقي في السورة",
    streak: "أيام متتالية",
    lastUpdate: "آخر تحديث",
    note:
      "بياناتك لا تُرفع إلى السيرفر؛ تُحفظ في localStorage فقط. اعمل نسخة احتياطية بالتصدير دوريًا.",
    imported: "تم استيراد التقدم بنجاح",
    exported: "تم تنزيل نسخة احتياطية",
    importFailed: "ملف الاستيراد غير صالح",
    exportFailed: "تعذر تصدير البيانات",
    resetSurahDone: "تم تصفير تقدم السورة",
    resetAllDone: "تم حذف كل تقدم الحفظ",
    confirmResetSurah: "هل تريد تصفير تقدم هذه السورة؟",
    confirmResetAll:
      "هل تريد حذف كل تقدم الحفظ؟ لا يمكن التراجع.",
    loading: "جاري تحميل تقدمك...",
  },
  en: {
    title: "Interactive Quran Memorization Plan",
    description:
      "Choose a surah, set your daily goal, and record your progress. Everything is saved locally on your device.",
    selectSurah: "Choose surah",
    dailyGoal: "Daily goal (ayahs)",
    goalHint: "You can set the goal from 1 to 50 ayahs.",
    quickAdd: "Quick add",
    addOne: "+1",
    addFive: "+5",
    addTen: "+10",
    addGoal: "+ Goal",
    subtractOne: "-1",
    resetSurah: "Reset surah",
    resetAll: "Reset all",
    export: "Export JSON",
    import: "Import JSON",
    totalMemorized: "Total memorized",
    totalProgress: "Overall progress",
    surahProgress: "Surah progress",
    remaining: "Remaining in surah",
    streak: "Day streak",
    lastUpdate: "Last update",
    note:
      "Your data is not uploaded to the server; it is stored only in localStorage. Export periodically for backup.",
    imported: "Progress imported successfully",
    exported: "Backup downloaded",
    importFailed: "Invalid import file",
    exportFailed: "Could not export data",
    resetSurahDone: "Surah progress reset",
    resetAllDone: "All memorization progress deleted",
    confirmResetSurah: "Do you want to reset this surah progress?",
    confirmResetAll:
      "Do you want to delete all memorization progress? This cannot be undone.",
    loading: "Loading your progress...",
  },
};

// ============================================================
// Helpers
// ============================================================

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
}

function todayKey(): string {
  return dateKey(new Date());
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
}

function formatNumber(value: number, lang: Lang): string {
  try {
    return value.toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
  } catch {
    return String(value);
  }
}

function formatDateTime(iso: string, lang: Lang): string {
  try {
    return new Date(iso).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function sanitizeProgress(raw: unknown): Progress {
  const out: Progress = {};

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return out;
  }

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const n = Number(key);

    if (!Number.isInteger(n) || n < 1 || n > 114) {
      continue;
    }

    const surah = SURAH_BY_N.get(n);

    if (!surah) {
      continue;
    }

    const v = Math.floor(Number(value));

    if (!Number.isFinite(v)) {
      continue;
    }

    out[n] = clamp(v, 0, surah.a);
  }

  return out;
}

function sanitizeState(raw: unknown): StoredState | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const obj = raw as Record<string, unknown>;

  const progress = sanitizeProgress(obj.progress);

  const dailyGoal = clamp(
    Math.floor(Number(obj.dailyGoal)) || 5,
    1,
    50
  );

  const streak = Math.max(0, Math.floor(Number(obj.streak)) || 0);

  const lastActionDate =
    typeof obj.lastActionDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(obj.lastActionDate)
      ? obj.lastActionDate
      : null;

  const updatedAt =
    typeof obj.updatedAt === "string"
      ? obj.updatedAt
      : new Date().toISOString();

  return {
    progress,
    dailyGoal,
    streak,
    lastActionDate,
    updatedAt,
  };
}

function defaultState(): StoredState {
  return {
    progress: {},
    dailyGoal: 5,
    streak: 0,
    lastActionDate: null,
    updatedAt: new Date().toISOString(),
  };
}

function loadState(): StoredState {
  if (typeof window === "undefined") {
    return defaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return defaultState();
    }

    const parsed = JSON.parse(raw);
    return sanitizeState(parsed) ?? defaultState();
  } catch {
    return defaultState();
  }
}

function saveState(state: StoredState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / privacy errors
  }
}

// ============================================================
// Component
// ============================================================

export default function MemorizationPlan({
  lang = "ar",
}: MemorizationPlanProps) {
  const L: Lang = lang === "en" ? "en" : "ar";
  const isRTL = L === "ar";
  const ui = UI[L];

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<StoredState>(defaultState);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [message, setMessage] = useState<Message>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);

  // Save whenever state changes after mount
  useEffect(() => {
    if (mounted) {
      saveState(state);
    }
  }, [state, mounted]);

  // Auto dismiss message
  useEffect(() => {
    if (!message) return;

    if (messageTimerRef.current !== null) {
      clearTimeout(messageTimerRef.current);
    }

    messageTimerRef.current = setTimeout(() => {
      setMessage(null);
    }, 3500);

    return () => {
      if (messageTimerRef.current !== null) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, [message]);

  const showMessage = useCallback(
    (type: "success" | "error", text: string) => {
      setMessage({ type, text });
    },
    []
  );

  const surah = SURAH_BY_N.get(selectedSurah) ?? SURAHS[0];

  const memorizedInSurah = clamp(
    Math.floor(state.progress[surah.n] ?? 0),
    0,
    surah.a
  );

  const remainingInSurah = surah.a - memorizedInSurah;

  const totalMemorized = useMemo(() => {
    return Object.values(state.progress).reduce((sum, value) => {
      return sum + Math.max(0, Math.floor(Number(value) || 0));
    }, 0);
  }, [state.progress]);

  const totalPercent =
    TOTAL_AYAHS > 0 ? (totalMemorized / TOTAL_AYAHS) * 100 : 0;

  const surahPercent =
    surah.a > 0 ? (memorizedInSurah / surah.a) * 100 : 0;

  const addToSurah = useCallback(
    (amount: number) => {
      setState((prev) => {
        const current = prev.progress[surah.n] ?? 0;
        const next = clamp(Math.floor(current + amount), 0, surah.a);

        if (next === current) {
          return prev;
        }

        const today = todayKey();
        let streak = prev.streak;
        let lastActionDate = prev.lastActionDate;

        const increased = amount > 0 && next > current;

        if (increased && lastActionDate !== today) {
          streak =
            lastActionDate === yesterdayKey() ? streak + 1 : 1;
          lastActionDate = today;
        }

        return {
          ...prev,
          progress: {
            ...prev.progress,
            [surah.n]: next,
          },
          streak,
          lastActionDate,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [surah.a, surah.n]
  );

  const onGoalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = clamp(
      Math.floor(Number(event.target.value) || 1),
      1,
      50
    );

    setState((prev) => ({
      ...prev,
      dailyGoal: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const resetSurahProgress = () => {
    if (!window.confirm(ui.confirmResetSurah)) return;

    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        [surah.n]: 0,
      },
      updatedAt: new Date().toISOString(),
    }));

    showMessage("success", ui.resetSurahDone);
  };

  const resetAllProgress = () => {
    if (!window.confirm(ui.confirmResetAll)) return;

    setState((prev) => ({
      progress: {},
      dailyGoal: prev.dailyGoal,
      streak: 0,
      lastActionDate: null,
      updatedAt: new Date().toISOString(),
    }));

    showMessage("success", ui.resetAllDone);
  };

  const exportData = () => {
    try {
      const payload = {
        version: 1,
        app: "ismail-quran-memorization",
        exportedAt: new Date().toISOString(),
        ...state,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `quran-memorization-${todayKey()}.json`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);

      showMessage("success", ui.exported);
    } catch {
      showMessage("error", ui.exportFailed);
    }
  };

  const onImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const next = sanitizeState(parsed);

      if (!next) {
        throw new Error("invalid_state");
      }

      setState(next);
      showMessage("success", ui.imported);
    } catch {
      showMessage("error", ui.importFailed);
    } finally {
      event.target.value = "";
    }
  };

  if (!mounted) {
    return (
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="card animate-pulse p-6 md:p-8"
        aria-busy="true"
      >
        <div className="mb-4 h-8 w-64 rounded bg-slate-200 dark:bg-night-700" />
        <div className="mb-3 h-4 w-full rounded bg-slate-200 dark:bg-night-700" />
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-night-700" />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {ui.loading}
        </p>
      </section>
    );
  }

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="card relative overflow-hidden p-6 md:p-8"
    >
      <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
          🧠 {ui.title}
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {ui.description}
        </p>
      </div>

      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-300"
              : "bg-red-50 text-red-700 dark:bg-red-950/25 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-night-700 dark:bg-night-800/50">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {ui.totalMemorized}
          </p>
          <p className="mt-1 text-2xl font-black text-cyan-700 dark:text-cyan-300">
            {formatNumber(totalMemorized, L)} / {formatNumber(TOTAL_AYAHS, L)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-night-700 dark:bg-night-800/50">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {ui.totalProgress}
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {totalPercent.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-night-700 dark:bg-night-800/50">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {ui.streak}
          </p>
          <p className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-300">
            {formatNumber(state.streak, L)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-night-700 dark:bg-night-800/50">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {ui.remaining}
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {formatNumber(remainingInSurah, L)}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="memorization-surah"
            className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            {ui.selectSurah}
          </label>

          <select
            id="memorization-surah"
            value={selectedSurah}
            onChange={(e) => setSelectedSurah(Number(e.target.value))}
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-600 dark:border-night-700 dark:bg-night-800 dark:text-white"
          >
            {SURAHS.map((s) => (
              <option key={s.n} value={s.n}>
                {s.n}. {isRTL ? s.ar : s.en} ({s.a})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="memorization-goal"
            className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            {ui.dailyGoal}
          </label>

          <input
            id="memorization-goal"
            type="number"
            min={1}
            max={50}
            value={state.dailyGoal}
            onChange={onGoalChange}
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-600 dark:border-night-700 dark:bg-night-800 dark:text-white"
          />

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {ui.goalHint}
          </p>
        </div>
      </div>

      {/* Surah progress */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-night-700 dark:bg-night-800">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {surah.n}. {isRTL ? surah.ar : surah.en}
          </h3>

          <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700 dark:bg-cyan-950/35 dark:text-cyan-300">
            {formatNumber(memorizedInSurah, L)} / {formatNumber(surah.a, L)}
          </span>
        </div>

        <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-night-700">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-cyan-600 to-emerald-500 transition-all"
            style={{ width: `${Math.min(100, surahPercent)}%` }}
          />
        </div>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {ui.surahProgress}: {surahPercent.toFixed(1)}%
        </p>
      </div>

      {/* Overall progress */}
      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/30 dark:bg-amber-950/15">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {ui.totalProgress}
          </h3>
          <span className="text-sm font-black text-amber-700 dark:text-amber-300">
            {totalPercent.toFixed(1)}%
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-white/70 dark:bg-night-800">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all"
            style={{ width: `${Math.min(100, totalPercent)}%` }}
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-black text-slate-700 dark:text-slate-200">
          {ui.quickAdd}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addToSurah(1)}
            className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-800"
          >
            {ui.addOne}
          </button>

          <button
            type="button"
            onClick={() => addToSurah(5)}
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
          >
            {ui.addFive}
          </button>

          <button
            type="button"
            onClick={() => addToSurah(10)}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            {ui.addTen}
          </button>

          <button
            type="button"
            onClick={() => addToSurah(state.dailyGoal)}
            className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700"
          >
            {ui.addGoal}
          </button>

          <button
            type="button"
            onClick={() => addToSurah(-1)}
            className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-night-700 dark:text-slate-200 dark:hover:bg-night-800"
          >
            {ui.subtractOne}
          </button>
        </div>
      </div>

      {/* Danger / backup actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={resetSurahProgress}
          className="rounded-xl border-2 border-amber-300 px-4 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-50 dark:border-amber-800/50 dark:text-amber-300 dark:hover:bg-amber-950/20"
        >
          {ui.resetSurah}
        </button>

        <button
          type="button"
          onClick={resetAllProgress}
          className="rounded-xl border-2 border-red-300 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 dark:border-red-800/50 dark:text-red-300 dark:hover:bg-red-950/20"
        >
          {ui.resetAll}
        </button>

        <button
          type="button"
          onClick={exportData}
          className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-night-700 dark:text-slate-200 dark:hover:bg-night-800"
        >
          ⬇️ {ui.export}
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-night-700 dark:text-slate-200 dark:hover:bg-night-800"
        >
          ⬆️ {ui.import}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => void onImportFile(e)}
        />
      </div>

      {/* Last update + note */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-night-700 dark:bg-night-800/50 dark:text-slate-300">
        <p className="mb-1 font-bold">
          {ui.lastUpdate}: {formatDateTime(state.updatedAt, L)}
        </p>
        <p className="leading-relaxed">{ui.note}</p>
      </div>
    </section>
  );
}