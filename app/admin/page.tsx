// app/admin/page.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ============================================================
// Types محلية لتجنب استيراد lib/content وهو server-only
// ============================================================

type Lang = "ar" | "en";

type Tab =
  | "settings"
  | "general"
  | "sections"
  | "appearance"
  | "live"
  | "fields"
  | "lessons"
  | "videos"
  | "articles"
  | "books"
  | "audio"
  | "photos"
  | "schedule"
  | "fatwas"
  | "projects"
  | "news"
  | "places"
  | "adhkar"
  | "translations"
  | "questions"
  | "stats"
  | "notifications";

type Coll =
  | "lessons"
  | "videos"
  | "articles"
  | "audio"
  | "photos"
  | "schedule"
  | "fields"
  | "books"
  | "fatwas"
  | "projects"
  | "news"
  | "places"
  | "adhkar";

type Toast = {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
};

type ConfirmDialog = {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
};

// ============================================================
// Languages options محلية
// ============================================================

const LANGUAGE_OPTIONS: Array<{
  code: Lang;
  name: string;
  flag: string;
}> = [
  { code: "ar", name: "العربية", flag: "🇪" },
  { code: "en", name: "English", flag: "🇺" },
];

// ============================================================
// Default field translations محلية
// ============================================================

const defaultFieldTranslations: Record<
  string,
  Partial<Record<Lang, { name: string; desc: string }>>
> = {};

// ============================================================
// Default content محلي
// ============================================================

const defaultContent: any = {
  settings: {
    ownerName: "",
    shortName: "",
    jobTitle: "",
    motto: "",
    bio: [],
    wa: "",
    email: "",
    address: "",
    cred1: "",
    cred2: "",
    interests: [],
    portraitSrc: "",
    ogImage: "",
    homeKicker: "",
    homeHeroText: "",
    primaryColor: "#0b2e22",
    goldColor: "#c9a227",
    creamColor: "#f5f1e8",
    facebookUrl: "",
    youtubeUrl: "",
    telegramUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    showPrayerBar: false,
    liveTitle: "",
    liveUrl: "",
    meetingDay: "",
    meetingTime: "",
    meetingPlace: "",
    meetingLink: "",
    appUrl: "",
    sectionConfig: {},
    visibleSections: [],
  },
  fields: [],
  lessons: [],
  videos: [],
  articles: [],
  books: [],
  audio: [],
  photos: [],
  schedule: [],
  fatwas: [],
  projects: [],
  news: [],
  places: [],
  adhkar: [],
  fieldTranslations: {},
};

// ============================================================
// Sections data
// ============================================================

const sectionsData: Record<
  string,
  { slug: string; title: string; description: string }
> = {
  fields: {
    slug: "fields",
    title: "العلوم الشرعية",
    description: "سبعة عشر علما شرعيا",
  },
  fatwa: {
    slug: "fatwa",
    title: "الفتاوى الشرعية",
    description: "إجابات فقهية",
  },
  doubts: {
    slug: "doubts",
    title: "الرد على الشبهات",
    description: "ردود علمية",
  },
  "prayer-guide": {
    slug: "prayer-guide",
    title: "تعلم الصلاة",
    description: "دليل عملي",
  },
  "embrace-islam": {
    slug: "embrace-islam",
    title: "اعتنق الإسلام",
    description: "رحلتك نحو الهداية",
  },
  "dawah-guide": {
    slug: "dawah-guide",
    title: "دليل الدعاة",
    description: "كيف تدعو إلى الله",
  },
  "prophets-stories": {
    slug: "prophets-stories",
    title: "قصص الأنبياء",
    description: "دروس وعبر",
  },
  quran: {
    slug: "quran",
    title: "المصحف الكريم",
    description: "اقرأ القرآن كاملا",
  },
  "prayer-times": {
    slug: "prayer-times",
    title: "مواقيت الصلاة",
    description: "لكل دول العالم",
  },
  qibla: {
    slug: "qibla",
    title: "تحديد القبلة",
    description: "من أي مكان",
  },
  zakat: {
    slug: "zakat",
    title: "حاسبة الزكاة",
    description: "احسب زكاتك",
  },
  "atheism-response": {
    slug: "atheism-response",
    title: "الرد على الإلحاد",
    description: "شبهات وردود",
  },
  "youth-issues": {
    slug: "youth-issues",
    title: "قضايا الشباب",
    description: "مشاكل وحلول",
  },
  khutab: {
    slug: "khutab",
    title: "مكتبة الخطب",
    description: "خطب جمعة",
  },
  "quran-memorization": {
    slug: "quran-memorization",
    title: "كيف تحفظ القرآن",
    description: "منهج عملي",
  },
  ruqyah: {
    slug: "ruqyah",
    title: "الرقية الشرعية",
    description: "آيات وأدعية",
  },
  "hajj-guide": {
    slug: "hajj-guide",
    title: "دليل الحج والعمرة",
    description: "خطوة بخطوة",
  },
  "women-fatwas": {
    slug: "women-fatwas",
    title: "فتاوى المرأة",
    description: "قضايا المرأة",
  },
};

const TABS: [Tab, string, string][] = [
  ["settings", "⚙️", "بيانات الشيخ"],
  ["general", "🎨", "الإعدادات العامة"],
  ["sections", "🎯", "الأقسام"],
  ["appearance", "🎛️", "الظهور"],
  ["live", "📡", "البث والمجلس"],
  ["fields", "🧭", "العلوم"],
  ["lessons", "📖", "الدروس"],
  ["videos", "🎬", "الفيديوهات"],
  ["articles", "✍️", "المقالات"],
  ["books", "📚", "الكتب"],
  ["audio", "🎧", "الصوتيات"],
  ["photos", "🖼️", "الصور"],
  ["schedule", "🗓️", "الجدول"],
  ["fatwas", "❓", "الفتاوى"],
  ["projects", "🤝", "المشاريع"],
  ["news", "🗞️", "الأخبار"],
  ["places", "🗺️", "الأماكن"],
  ["adhkar", "🤲", "الأذكار"],
  ["translations", "🌍", "الترجمات"],
  ["questions", "💬", "أسئلة الحسابات"],
  ["stats", "📊", "الإحصائيات"],
  ["notifications", "🔔", "إشعارات"],
];

// ============================================================
// Helpers
// ============================================================

function arr(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function obj(value: any): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function str(value: any): string {
  return value == null ? "" : String(value);
}

function sectionIcon(icon: string): string {
  switch (icon) {
    case "mosque":
      return "🕌";
    case "quran":
      return "📖";
    case "prayer":
      return "🤲";
    case "knowledge":
      return "📚";
    case "fatwa":
      return "❓";
    case "heart":
      return "❤️";
    case "star":
      return "⭐";
    case "crescent":
      return "🌙";
    case "kaaba":
      return "🕋";
    case "light":
      return "💡";
    default:
      return "✨";
  }
}

// ============================================================
// Page
// ============================================================

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const [c, setC] = useState<any>(defaultContent);
  const [tab, setTab] = useState<Tab>("settings");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [adminQuestions, setAdminQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [stats, setStats] = useState<any>(null);
  const [advancedStats, setAdvancedStats] = useState<any>(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifUrl, setNotifUrl] = useState("/ar");
  const [sectionSearch, setSectionSearch] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<ConfirmDialog>({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [selectedItems, setSelectedItems] = useState<
    Record<string, Set<number>>
  >({});

  const initialContentRef = useRef<any>(defaultContent);

  // ==========================================================
  // Toast
  // ==========================================================

  const showToast = useCallback(
    (type: Toast["type"], message: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  // ==========================================================
  // Save / Logout
  // ==========================================================

  const save = useCallback(async () => {
    showToast("info", "⏳ جاري الحفظ...");

    try {
      const r = await fetch("/api/content", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: c }),
      });

      const j = await r.json().catch(() => ({}));

      if (r.ok) {
        showToast("success", "✅ تم الحفظ — التغيير ظهر لكل الزوار فورًا");
        initialContentRef.current = c;
        setHasUnsavedChanges(false);
      } else {
        showToast("error", "❌ " + (j.error || "فشل الحفظ"));
      }
    } catch {
      showToast("error", "❌ فشل الحفظ");
    }
  }, [c, showToast]);

  const doLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }

    router.push("/ar/login");
  }, [router]);

  const logout = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog({
        show: true,
        title: "تغييرات غير محفوظة",
        message:
          "لديك تغييرات غير محفوظة. هل تريد الخروج على أي حال؟",
        onConfirm: () => {
          void doLogout();
        },
      });
    } else {
      void doLogout();
    }
  }, [doLogout, hasUnsavedChanges]);

  // ==========================================================
  // Auth check
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => r.json())
      .then(async (j) => {
        if (cancelled) return;

        if (j.user && j.user.role === "admin") {
          setAuthed(true);
          setLoading(false);

          try {
            const rc = await fetch("/api/content", {
              credentials: "include",
            });

            const jc = await rc.json().catch(() => ({}));

            if (!cancelled && rc.ok) {
              const nextContent = jc.content || defaultContent;
              setC(nextContent);
              initialContentRef.current = nextContent;
              setLive(jc.live ?? false);
            }
          } catch {
            if (!cancelled) setLive(false);
          }

          try {
            const rq = await fetch("/api/questions/admin", {
              credentials: "include",
            });

            const jq = await rq.json().catch(() => ({}));

            if (!cancelled) {
              setAdminQuestions(arr(jq.questions));
            }
          } catch {
            // ignore
          }
        } else {
          router.push("/ar/login");
        }
      })
      .catch(() => {
        if (!cancelled) router.push("/ar/login");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ==========================================================
  // Stats polling
  // ==========================================================

  useEffect(() => {
    if (!authed) return;

    let cancelled = false;

    const fetchStats = () => {
      fetch("/api/stats", { credentials: "include" })
        .then((r) => r.json())
        .then((j) => {
          if (!cancelled) setStats(j);
        })
        .catch(() => {});

      fetch("/api/stats/advanced", { credentials: "include" })
        .then((r) => r.json())
        .then((j) => {
          if (!cancelled) setAdvancedStats(j);
        })
        .catch(() => {});
    };

    fetchStats();

    const interval = setInterval(fetchStats, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [authed]);

  // ==========================================================
  // Unsaved changes
  // ==========================================================

  useEffect(() => {
    const hasChanges =
      JSON.stringify(c) !== JSON.stringify(initialContentRef.current);

    setHasUnsavedChanges(hasChanges);
  }, [c]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();

        if (hasUnsavedChanges) {
          void save();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasUnsavedChanges, save]);

  // ==========================================================
  // CRUD helpers
  // ==========================================================

  const setS = (k: string, v: any) => {
    setC((prev: any) => ({
      ...prev,
      settings: {
        ...obj(prev.settings),
        [k]: v,
      },
    }));
  };

  const upd = (coll: Coll, i: number, patch: Record<string, any>) => {
    setC((prev: any) => {
      const list = arr(prev[coll]).map((x: any, xi: number) =>
        xi === i ? { ...obj(x), ...patch } : x
      );

      return {
        ...prev,
        [coll]: list,
      };
    });
  };

  const del = (coll: Coll, i: number) => {
    setShowConfirmDialog({
      show: true,
      title: "تأكيد الحذف",
      message:
        "هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
      onConfirm: () => {
        setC((prev: any) => {
          const list = arr(prev[coll]).filter((_: any, xi: number) => xi !== i);

          return {
            ...prev,
            [coll]: list,
          };
        });

        showToast("success", "✅ تم الحذف");
      },
    });
  };

  const bulkDelete = (coll: Coll) => {
    const indices = Array.from(selectedItems[coll] || []);

    if (indices.length === 0) return;

    setShowConfirmDialog({
      show: true,
      title: "حذف متعدد",
      message: `هل أنت متأكد من حذف ${indices.length} عنصر؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: () => {
        setC((prev: any) => {
          const list = arr(prev[coll]).filter(
            (_: any, xi: number) => !indices.includes(xi)
          );

          return {
            ...prev,
            [coll]: list,
          };
        });

        setSelectedItems((prev) => ({
          ...prev,
          [coll]: new Set(),
        }));

        showToast("success", `✅ تم حذف ${indices.length} عنصر`);
      },
    });
  };

  const add = (coll: Coll, item: any) => {
    setC((prev: any) => ({
      ...prev,
      [coll]: [item, ...arr(prev[coll])],
    }));

    showToast("success", "✅ تمت الإضافة");
  };

  const answerQuestion = async (id: number) => {
    const answer = answers[id];

    if (!answer?.trim()) {
      showToast("error", "❌ اكتب الإجابة أولا");
      return;
    }

    showToast("info", "⏳ جاري إرسال الإجابة...");

    try {
      const r = await fetch("/api/questions/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, answer }),
      });

      const j = await r.json().catch(() => ({}));

      if (j.ok) {
        showToast("success", "✅ تم إرسال الإجابة");

        setAdminQuestions((prev) =>
          prev.map((q: any) =>
            q.id === id ? { ...q, answer, status: "answered" } : q
          )
        );

        setAnswers((prev) => ({ ...prev, [id]: "" }));
      } else {
        showToast("error", "❌ " + (j.error || "فشل"));
      }
    } catch {
      showToast("error", "❌ فشل إرسال الإجابة");
    }
  };

  const resizeImage = (file: File, max = 1400): Promise<File> =>
    new Promise((resolve) => {
      const reader = new FileReader();

      reader.onerror = () => resolve(file);

      reader.onload = () => {
        const img = new Image();

        img.onerror = () => resolve(file);

        img.onload = () => {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");

          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);

          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }

          canvas.toBlob(
            (b) =>
              b &&
              resolve(
                new File(
                  [b],
                  file.name.replace(/\.\w+$/, "") + ".jpg",
                  { type: "image/jpeg" }
                )
              ),
            "image/jpeg",
            0.85
          );
        };

        img.src = String(reader.result);
      };

      reader.readAsDataURL(file);
    });

  const uploadFile = async (
    file: File,
    kind: "image" | "audio" | "doc"
  ): Promise<string | null> => {
    try {
      const fd = new FormData();

      fd.append("file", kind === "image" ? await resizeImage(file) : file);
      fd.append("kind", kind);

      const r = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      const j = await r.json().catch(() => ({}));

      return j.url || null;
    } catch {
      return null;
    }
  };

  const setTranslation = (
    slug: string,
    lang: Lang,
    field: "name" | "desc",
    value: string
  ) => {
    setC((prev: any) => {
      const ft = obj(prev.fieldTranslations);
      const slugT = obj(ft[slug]);
      const langT = obj(slugT[lang]);

      return {
        ...prev,
        fieldTranslations: {
          ...ft,
          [slug]: {
            ...slugT,
            [lang]: {
              ...langT,
              [field]: value,
            },
          },
        },
      };
    });
  };

  const getTranslationValue = (
    slug: string,
    lang: Lang,
    field: "name" | "desc"
  ): string => {
    return (
      c.fieldTranslations?.[slug]?.[lang]?.[field] ??
      defaultFieldTranslations[slug]?.[lang]?.[field] ??
      ""
    );
  };

  const toggleSelect = (coll: Coll, index: number) => {
    setSelectedItems((prev) => {
      const current = prev[coll] || new Set<number>();
      const next = new Set(current);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return {
        ...prev,
        [coll]: next,
      };
    });
  };

  // ==========================================================
  // UI constants
  // ==========================================================

  const input =
    "w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:border-gold focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition";

  const label =
    "block font-bold text-xs mb-1 text-gray-600 dark:text-gray-400";

  const itemBox =
    "border-2 border-gray-100 dark:border-gray-700 rounded-lg p-4 grid gap-3 bg-white dark:bg-gray-800";

  const addBtn =
    "bg-primary text-gold py-3 rounded-lg font-bold hover:opacity-90 transition";

  const delBtn = "text-red-500 text-xs font-bold hover:underline";

  const fieldSelect = (coll: Coll, i: number, current: string) => (
    <select
      className={input}
      value={str(current)}
      onChange={(e) => upd(coll, i, { field: e.target.value })}
    >
      {arr(c.fields).map((f: any) => (
        <option key={str(f.slug)} value={str(f.slug)}>
          {str(f.icon)} {str(f.name)}
        </option>
      ))}
    </select>
  );

  // ==========================================================
  // Loading / Unauthorized
  // ==========================================================

  if (loading) {
    return (
      <div dir="rtl" className="dark">
        <Header />
        <main className="py-24 text-center text-gray-500 dark:text-gray-400 min-h-screen bg-cream-dark dark:bg-gray-900">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-lg">⏳ جاري التحقق من الصلاحيات...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!authed) return null;

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div dir="rtl" className="font-sans dark">
      <Header />

      <main className="py-12 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          {live === false && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl p-4 mb-6 text-sm flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <span>قاعدة البيانات غير متصلة. بعض الوظائف قد لا تعمل.</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-3xl text-primary dark:text-gold">
                ⚙️ لوحة التحكم الشاملة
              </h1>

              {hasUnsavedChanges && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  تغييرات غير محفوظة
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => void save()}
                disabled={!hasUnsavedChanges}
                className="bg-gold text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-gold-light transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>💾</span>
                <span>حفظ ونشر فوري</span>
                <kbd className="text-xs bg-white/20 px-2 py-1 rounded">
                  Ctrl+S
                </kbd>
              </button>

              <button
                onClick={logout}
                className="border-2 border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg font-bold text-gray-500 dark:text-gray-400 hover:border-red-400 hover:text-red-500 transition"
              >
                خروج
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {TABS.map(([id, icon, tabLabel]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${
                  tab === id
                    ? "bg-primary text-gold shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-cream-dark dark:hover:bg-gray-700"
                }`}
              >
                <span>{icon}</span>
                <span>{tabLabel}</span>
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md grid gap-4">
            {tab === "settings" && (
              <>
                <div>
                  <span className={label}>اسم الشيخ الكامل</span>
                  <input
                    className={input}
                    value={str(c.settings.ownerName)}
                    onChange={(e) => setS("ownerName", e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className={label}>الاسم المختصر</span>
                    <input
                      className={input}
                      value={str(c.settings.shortName)}
                      onChange={(e) => setS("shortName", e.target.value)}
                    />
                  </div>

                  <div>
                    <span className={label}>المسمى الوظيفي</span>
                    <input
                      className={input}
                      value={str(c.settings.jobTitle)}
                      onChange={(e) => setS("jobTitle", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <span className={label}>الشعار</span>
                  <input
                    className={input}
                    value={str(c.settings.motto)}
                    onChange={(e) => setS("motto", e.target.value)}
                  />
                </div>

                <div>
                  <span className={label}>النبذة (كل سطر فقرة)</span>
                  <textarea
                    rows={4}
                    className={input}
                    value={arr(c.settings.bio).join("\n")}
                    onChange={(e) =>
                      setS("bio", e.target.value.split("\n"))
                    }
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className={label}>واتساب (دولي بدون +)</span>
                    <input
                      className={input}
                      value={str(c.settings.wa)}
                      onChange={(e) => setS("wa", e.target.value)}
                    />
                  </div>

                  <div>
                    <span className={label}>البريد</span>
                    <input
                      className={input}
                      value={str(c.settings.email)}
                      onChange={(e) => setS("email", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <span className={label}>العنوان</span>
                  <input
                    className={input}
                    value={str(c.settings.address)}
                    onChange={(e) => setS("address", e.target.value)}
                  />
                </div>

                <div>
                  <span className={label}>الشهادة الأولى</span>
                  <input
                    className={input}
                    value={str(c.settings.cred1)}
                    onChange={(e) => setS("cred1", e.target.value)}
                  />
                </div>

                <div>
                  <span className={label}>الشهادة الثانية</span>
                  <input
                    className={input}
                    value={str(c.settings.cred2)}
                    onChange={(e) => setS("cred2", e.target.value)}
                  />
                </div>

                <div>
                  <span className={label}>الاهتمامات (كل سطر اهتمام)</span>
                  <textarea
                    rows={3}
                    className={input}
                    value={arr(c.settings.interests).join("\n")}
                    onChange={(e) =>
                      setS("interests", e.target.value.split("\n"))
                    }
                  />
                </div>

                <div>
                  <span className={label}>الصورة الشخصية</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;

                      showToast("info", "⏳ جاري الرفع...");

                      const u = await uploadFile(f, "image");

                      if (u) {
                        setS("portraitSrc", u);
                        showToast("success", "✅ تم الرفع");
                      } else {
                        showToast("error", "❌ فشل الرفع");
                      }
                    }}
                    className="text-sm"
                  />

                  {c.settings.portraitSrc && (
                    <img
                      src={str(c.settings.portraitSrc)}
                      className="w-24 h-24 object-cover rounded-lg mt-2 border-2 border-gold"
                    />
                  )}
                </div>

                <div>
                  <span className={label}>
                    صورة مشاركة الموقع (OG Image)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;

                      showToast("info", "⏳ جاري الرفع...");

                      const u = await uploadFile(f, "image");

                      if (u) {
                        setS("ogImage", u);
                        showToast("success", "✅ تم الرفع");
                      } else {
                        showToast("error", "❌ فشل الرفع");
                      }
                    }}
                    className="text-sm"
                  />

                  {c.settings.ogImage && (
                    <img
                      src={str(c.settings.ogImage)}
                      className="w-40 h-24 object-cover rounded-lg mt-2 border-2 border-gold"
                    />
                  )}
                </div>
              </>
            )}

            {tab === "general" && (
              <>
                <h2 className="font-serif text-2xl text-primary dark:text-gold border-b-2 border-gold pb-2">
                  🎨 الإعدادات العامة
                </h2>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500 p-4 rounded">
                  <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
                    🏠 الصفحة الرئيسية
                  </h3>

                  <div>
                    <span className={label}>نص البسملة فوق</span>
                    <input
                      className={input}
                      value={str(c.settings.homeKicker)}
                      onChange={(e) => setS("homeKicker", e.target.value)}
                    />
                  </div>

                  <div className="mt-2">
                    <span className={label}>نص الشعار الرئيسي</span>
                    <input
                      className={input}
                      value={str(c.settings.homeHeroText)}
                      onChange={(e) => setS("homeHeroText", e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border-r-4 border-purple-500 p-4 rounded">
                  <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2">
                    🎨 ألوان الموقع
                  </h3>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <span className={label}>اللون الأساسي</span>
                      <input
                        type="color"
                        value={str(c.settings.primaryColor || "#0b2e22")}
                        onChange={(e) =>
                          setS("primaryColor", e.target.value)
                        }
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className={label}>اللون الذهبي</span>
                      <input
                        type="color"
                        value={str(c.settings.goldColor || "#c9a227")}
                        onChange={(e) => setS("goldColor", e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className={label}>لون الخلفية</span>
                      <input
                        type="color"
                        value={str(c.settings.creamColor || "#f5f1e8")}
                        onChange={(e) => setS("creamColor", e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-r-4 border-yellow-500 p-4 rounded">
                  <h3 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">
                    🔗 السوشيال ميديا
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <span className={label}>📘 فيسبوك</span>
                      <input
                        className={input}
                        value={str(c.settings.facebookUrl)}
                        onChange={(e) =>
                          setS("facebookUrl", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <span className={label}>📺 يوتيوب</span>
                      <input
                        className={input}
                        value={str(c.settings.youtubeUrl)}
                        onChange={(e) => setS("youtubeUrl", e.target.value)}
                      />
                    </div>

                    <div>
                      <span className={label}>✈️ تيليجرام</span>
                      <input
                        className={input}
                        value={str(c.settings.telegramUrl)}
                        onChange={(e) => setS("telegramUrl", e.target.value)}
                      />
                    </div>

                    <div>
                      <span className={label}>🐦 تويتر/X</span>
                      <input
                        className={input}
                        value={str(c.settings.twitterUrl)}
                        onChange={(e) => setS("twitterUrl", e.target.value)}
                      />
                    </div>

                    <div>
                      <span className={label}>📷 إنستجرام</span>
                      <input
                        className={input}
                        value={str(c.settings.instagramUrl)}
                        onChange={(e) =>
                          setS("instagramUrl", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <button onClick={() => void save()} className={addBtn + " w-full"}>
                  💾 حفظ كل الإعدادات العامة
                </button>
              </>
            )}

            {tab === "sections" && (
              <>
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl p-6 mb-6">
                  <h2 className="font-serif text-2xl mb-2">
                    🎯 التحكم في الأقسام الظاهرة
                  </h2>
                  <p className="text-white/80 text-sm">
                    تحكم في الأقسام اللي تظهر في الصفحة الرئيسية + تخصيص
                    الأيقونات والآيات
                  </p>
                </div>

                <div className="mb-4">
                  <input
                    className={input}
                    placeholder="🔍 ابحث عن قسم..."
                    value={sectionSearch}
                    onChange={(e) => setSectionSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  {Object.keys(sectionsData)
                    .filter((slug) => {
                      const data = sectionsData[slug];

                      return (
                        data.title.includes(sectionSearch) ||
                        slug.includes(sectionSearch.toLowerCase())
                      );
                    })
                    .map((slug) => {
                      const data = sectionsData[slug];

                      const sectionConfig = obj(c.settings.sectionConfig);

                      const config = {
                        enabled: true,
                        showVerse: true,
                        showHadith: false,
                        icon: "star",
                        gradient: "from-primary to-primary/80",
                        ...obj(sectionConfig[slug]),
                      };

                      const updateConfig = (key: string, value: any) => {
                        setS("sectionConfig", {
                          ...sectionConfig,
                          [slug]: {
                            ...config,
                            [key]: value,
                          },
                        });
                      };

                      const toggleEnabled = () => {
                        const current = arr(c.settings.visibleSections);

                        if (config.enabled) {
                          setS(
                            "visibleSections",
                            current.filter((s: any) => s !== slug)
                          );
                        } else {
                          setS("visibleSections", [...current, slug]);
                        }

                        updateConfig("enabled", !config.enabled);
                      };

                      return (
                        <div
                          key={slug}
                          className={`border-2 rounded-xl p-4 transition ${
                            config.enabled
                              ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">
                                {sectionIcon(config.icon)}
                              </span>

                              <div>
                                <h3 className="font-bold text-primary dark:text-gold">
                                  {data.title}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {data.description}
                                </p>
                              </div>
                            </div>

                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(config.enabled)}
                                onChange={toggleEnabled}
                                className="w-5 h-5 accent-gold"
                              />
                              <span className="mr-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                {config.enabled ? "ظاهر" : "مخفي"}
                              </span>
                            </label>
                          </div>

                          {config.enabled && (
                            <div className="grid sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={Boolean(config.showVerse)}
                                  onChange={(e) =>
                                    updateConfig("showVerse", e.target.checked)
                                  }
                                  className="w-4 h-4 accent-gold"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  إظهار الآية
                                </span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={Boolean(config.showHadith)}
                                  onChange={(e) =>
                                    updateConfig(
                                      "showHadith",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 accent-gold"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  إظهار الحديث
                                </span>
                              </label>

                              <div>
                                <span className={label}>الأيقونة</span>
                                <select
                                  className={input}
                                  value={str(config.icon)}
                                  onChange={(e) =>
                                    updateConfig("icon", e.target.value)
                                  }
                                >
                                  <option value="mosque">🕌 مسجد</option>
                                  <option value="quran">📖 قرآن</option>
                                  <option value="prayer">🤲 صلاة</option>
                                  <option value="knowledge">📚 علم</option>
                                  <option value="fatwa">❓ فتوى</option>
                                  <option value="heart">❤️ قلب</option>
                                  <option value="star">⭐ نجمة</option>
                                  <option value="crescent">🌙 هلال</option>
                                  <option value="kaaba">🕋 كعبة</option>
                                  <option value="light">💡 نور</option>
                                </select>
                              </div>

                              <div>
                                <span className={label}>التدرج اللوني</span>
                                <select
                                  className={input}
                                  value={str(config.gradient)}
                                  onChange={(e) =>
                                    updateConfig("gradient", e.target.value)
                                  }
                                >
                                  <option value="from-emerald-600 to-emerald-700">
                                    أخضر زمردي
                                  </option>
                                  <option value="from-blue-600 to-blue-700">
                                    أزرق
                                  </option>
                                  <option value="from-purple-600 to-purple-700">
                                    بنفسجي
                                  </option>
                                  <option value="from-teal-600 to-teal-700">
                                    أزرق مخضر
                                  </option>
                                  <option value="from-rose-600 to-rose-700">
                                    وردي
                                  </option>
                                  <option value="from-amber-600 to-amber-700">
                                    كهرماني
                                  </option>
                                  <option value="from-indigo-600 to-indigo-700">
                                    نيلي
                                  </option>
                                  <option value="from-green-600 to-green-700">
                                    أخضر
                                  </option>
                                  <option value="from-cyan-600 to-cyan-700">
                                    سماوي
                                  </option>
                                  <option value="from-orange-600 to-orange-700">
                                    برتقالي
                                  </option>
                                  <option value="from-pink-600 to-pink-700">
                                    زهري
                                  </option>
                                  <option value="from-red-600 to-red-700">
                                    أحمر
                                  </option>
                                  <option value="from-violet-600 to-violet-700">
                                    بنفسجي فاتح
                                  </option>
                                  <option value="from-yellow-600 to-yellow-700">
                                    أصفر
                                  </option>
                                  <option value="from-lime-600 to-lime-700">
                                    ليموني
                                  </option>
                                  <option value="from-fuchsia-600 to-fuchsia-700">
                                    فوشيا
                                  </option>
                                  <option value="from-stone-600 to-stone-700">
                                    حجري
                                  </option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={() => void save()}
                  className={addBtn + " w-full mt-6"}
                >
                  💾 حفظ التغييرات
                </button>
              </>
            )}

            {tab === "appearance" && (
              <label className="flex items-center justify-between border-2 border-gray-100 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
                  🕌 شريط مواقيت الصلاة + التاريخ الهجري
                </span>

                <input
                  type="checkbox"
                  checked={Boolean(c.settings.showPrayerBar)}
                  onChange={(e) => setS("showPrayerBar", e.target.checked)}
                  className="w-5 h-5 accent-[#c9a227]"
                />
              </label>
            )}

            {tab === "live" && (
              <>
                <div>
                  <span className={label}>عنوان البث</span>
                  <input
                    className={input}
                    value={str(c.settings.liveTitle)}
                    onChange={(e) => setS("liveTitle", e.target.value)}
                  />
                </div>

                <div>
                  <span className={label}>رابط البث</span>
                  <input
                    className={input}
                    value={str(c.settings.liveUrl)}
                    onChange={(e) => setS("liveUrl", e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className={label}>يوم المجلس</span>
                    <input
                      className={input}
                      value={str(c.settings.meetingDay)}
                      onChange={(e) => setS("meetingDay", e.target.value)}
                    />
                  </div>

                  <div>
                    <span className={label}>وقت المجلس</span>
                    <input
                      className={input}
                      value={str(c.settings.meetingTime)}
                      onChange={(e) => setS("meetingTime", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <span className={label}>مكان المجلس</span>
                  <input
                    className={input}
                    value={str(c.settings.meetingPlace)}
                    onChange={(e) => setS("meetingPlace", e.target.value)}
                  />
                </div>

                <div>
                  <span className={label}>رابط الخريطة</span>
                  <input
                    className={input}
                    value={str(c.settings.meetingLink)}
                    onChange={(e) => setS("meetingLink", e.target.value)}
                  />
                </div>
              </>
            )}

            {tab === "fields" && (
              <>
                {arr(c.fields).map((f: any, i: number) => (
                  <div key={str(f.id) || i} className={itemBox}>
                    <div className="flex justify-between items-center">
                      <b className="text-sm text-primary dark:text-gold">
                        علم #{i + 1}
                      </b>

                      <button
                        onClick={() => del("fields", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <input
                        className={input}
                        value={str(f.name)}
                        onChange={(e) =>
                          upd("fields", i, { name: e.target.value })
                        }
                      />

                      <input
                        className={input}
                        value={str(f.slug)}
                        onChange={(e) =>
                          upd("fields", i, { slug: e.target.value })
                        }
                      />

                      <input
                        className={input}
                        value={str(f.icon)}
                        onChange={(e) =>
                          upd("fields", i, { icon: e.target.value })
                        }
                      />
                    </div>

                    <input
                      className={input}
                      value={str(f.desc)}
                      onChange={(e) =>
                        upd("fields", i, { desc: e.target.value })
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    add("fields", {
                      id: Date.now(),
                      slug: "new",
                      name: "علم جديد",
                      icon: "📚",
                      desc: "",
                    })
                  }
                  className={addBtn}
                >
                  ➕ إضافة علم
                </button>
              </>
            )}

            {tab === "lessons" && (
              <>
                {selectedItems["lessons"]?.size ? (
                  <button
                    onClick={() => bulkDelete("lessons")}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition"
                  >
                    🗑 حذف المحدد ({selectedItems["lessons"].size})
                  </button>
                ) : null}

                {arr(c.lessons).map((l: any, i: number) => (
                  <div key={str(l.id) || i} className={itemBox}>
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(
                            selectedItems["lessons"]?.has(i)
                          )}
                          onChange={() => toggleSelect("lessons", i)}
                          className="w-4 h-4 accent-red-500"
                        />

                        <b className="text-sm text-primary dark:text-gold">
                          درس #{i + 1}
                        </b>
                      </label>

                      <button
                        onClick={() => del("lessons", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>

                    <input
                      className={input}
                      value={str(l.title)}
                      onChange={(e) =>
                        upd("lessons", i, { title: e.target.value })
                      }
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className={input}
                        value={str(l.category)}
                        onChange={(e) =>
                          upd("lessons", i, { category: e.target.value })
                        }
                      />

                      {fieldSelect("lessons", i, l.field)}
                    </div>

                    <input
                      className={input}
                      value={str(l.link)}
                      onChange={(e) =>
                        upd("lessons", i, { link: e.target.value })
                      }
                    />

                    <textarea
                      rows={2}
                      className={input}
                      value={str(l.desc)}
                      onChange={(e) =>
                        upd("lessons", i, { desc: e.target.value })
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    add("lessons", {
                      id: Date.now(),
                      title: "درس جديد",
                      category: "",
                      date: String(new Date().getFullYear()),
                      link: "",
                      desc: "",
                      field: arr(c.fields)[0]?.slug || "",
                    })
                  }
                  className={addBtn}
                >
                  ➕ إضافة درس
                </button>
              </>
            )}

            {tab === "videos" && (
              <>
                {arr(c.videos).map((v: any, i: number) => (
                  <div key={str(v.id) || i} className={itemBox}>
                    <div className="flex justify-between items-center">
                      <b className="text-sm text-primary dark:text-gold">
                        فيديو #{i + 1}
                      </b>

                      <button
                        onClick={() => del("videos", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>

                    <input
                      className={input}
                      value={str(v.title)}
                      onChange={(e) =>
                        upd("videos", i, { title: e.target.value })
                      }
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className={input}
                        value={str(v.url)}
                        onChange={(e) =>
                          upd("videos", i, { url: e.target.value })
                        }
                      />

                      {fieldSelect("videos", i, v.field)}
                    </div>

                    <textarea
                      rows={2}
                      className={input}
                      value={str(v.desc)}
                      onChange={(e) =>
                        upd("videos", i, { desc: e.target.value })
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    add("videos", {
                      id: Date.now(),
                      title: "فيديو جديد",
                      url: "",
                      desc: "",
                      field: arr(c.fields)[0]?.slug || "",
                    })
                  }
                  className={addBtn}
                >
                  ➕ إضافة فيديو
                </button>
              </>
            )}

            {tab === "articles" && (
              <>
                {arr(c.articles).map((a: any, i: number) => (
                  <div key={str(a.id) || i} className={itemBox}>
                    <div className="flex justify-between items-center">
                      <b className="text-sm text-primary dark:text-gold">
                        مقال #{i + 1}
                      </b>

                      <button
                        onClick={() => del("articles", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>

                    <input
                      className={input}
                      value={str(a.title)}
                      onChange={(e) =>
                        upd("articles", i, { title: e.target.value })
                      }
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className={input}
                        value={str(a.date)}
                        onChange={(e) =>
                          upd("articles", i, { date: e.target.value })
                        }
                      />

                      {fieldSelect("articles", i, a.field)}
                    </div>

                    <textarea
                      rows={2}
                      className={input}
                      value={str(a.excerpt)}
                      onChange={(e) =>
                        upd("articles", i, { excerpt: e.target.value })
                      }
                    />

                    <textarea
                      rows={6}
                      className={input}
                      value={str(a.body)}
                      onChange={(e) =>
                        upd("articles", i, { body: e.target.value })
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    add("articles", {
                      id: Date.now(),
                      title: "مقال جديد",
                      date: new Date().toLocaleDateString("ar-EG"),
                      excerpt: "",
                      body: "",
                      field: arr(c.fields)[0]?.slug || "",
                    })
                  }
                  className={addBtn}
                >
                  ➕ كتابة مقال
                </button>
              </>
            )}

            {tab === "books" && (
              <>
                {arr(c.books).map((b: any, i: number) => (
                  <div key={str(b.id) || i} className={itemBox}>
                    <div className="flex justify-between items-center">
                      <b className="text-sm text-primary dark:text-gold">
                        كتاب #{i + 1}
                      </b>

                      <button
                        onClick={() => del("books", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>

                    <input
                      className={input}
                      value={str(b.title)}
                      onChange={(e) =>
                        upd("books", i, { title: e.target.value })
                      }
                    />

                    <div className="grid grid-cols-2 gap-3">
                      {fieldSelect("books", i, b.field)}

                      <input
                        className={input}
                        value={str(b.url)}
                        onChange={(e) =>
                          upd("books", i, { url: e.target.value })
                        }
                      />
                    </div>

                    <textarea
                      rows={2}
                      className={input}
                      value={str(b.desc)}
                      onChange={(e) =>
                        upd("books", i, { desc: e.target.value })
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    add("books", {
                      id: Date.now(),
                      title: "كتاب جديد",
                      field: arr(c.fields)[0]?.slug || "",
                      url: "",
                      desc: "",
                    })
                  }
                  className={addBtn}
                >
                  ➕ إضافة كتاب
                </button>
              </>
            )}

            {tab === "audio" && (
              <>
                {arr(c.audio).map((a: any, i: number) => (
                  <div key={str(a.id) || i} className={itemBox}>
                    <div className="flex justify-between items-center">
                      <b className="text-sm text-primary dark:text-gold">
                        مقطع #{i + 1}
                      </b>

                      <button
                        onClick={() => del("audio", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className={input}
                        value={str(a.title)}
                        onChange={(e) =>
                          upd("audio", i, { title: e.target.value })
                        }
                      />

                      {fieldSelect("audio", i, a.field)}
                    </div>

                    <textarea
                      rows={2}
                      className={input}
                      value={str(a.desc)}
                      onChange={(e) =>
                        upd("audio", i, { desc: e.target.value })
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    add("audio", {
                      id: Date.now(),
                      title: "مقطع جديد",
                      url: "",
                      desc: "",
                      field: arr(c.fields)[0]?.slug || "",
                    })
                  }
                  className={addBtn}
                >
                  ➕ إضافة مقطع
                </button>
              </>
            )}

            {tab === "photos" && (
              <>
                <div>
                  <span className={label}>رفع صور جديدة</span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);

                      if (!files.length) return;

                      showToast("info", "⏳ جاري الرفع...");

                      const items: any[] = [];

                      for (const f of files) {
                        const u = await uploadFile(f, "image");

                        if (u) {
                          items.push({
                            id: Date.now() + Math.random(),
                            url: u,
                            caption: "",
                            field: arr(c.fields)[0]?.slug || "",
                          });
                        }
                      }

                      setC((prev: any) => ({
                        ...prev,
                        photos: [...items, ...arr(prev.photos)],
                      }));

                      showToast(
                        "success",
                        `✅ تم رفع ${items.length} صورة`
                      );
                    }}
                    className="text-sm"
                  />
                </div>

                <div>
                  <span className={label}>رابط APK</span>

                  <input
                    className={input}
                    value={str(c.settings.appUrl)}
                    onChange={(e) => setS("appUrl", e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {arr(c.photos).map((p: any, i: number) => (
                    <div
                      key={str(p.id) || i}
                      className="border-2 border-gray-100 dark:border-gray-700 rounded-lg p-3 grid gap-2 bg-white dark:bg-gray-800"
                    >
                      <img
                        src={str(p.url)}
                        className="w-full h-40 object-cover rounded-lg"
                      />

                      <input
                        className={input}
                        value={str(p.caption)}
                        onChange={(e) =>
                          upd("photos", i, { caption: e.target.value })
                        }
                      />

                      {fieldSelect("photos", i, p.field)}

                      <button
                        onClick={() => del("photos", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "schedule" && (
              <>
                {arr(c.schedule).map((s: any, i: number) => (
                  <div
                    key={str(s.id) || i}
                    className={itemBox + " grid-cols-2"}
                  >
                    <div className="flex justify-between items-center col-span-2">
                      <b className="text-sm text-primary dark:text-gold">
                        موعد #{i + 1}
                      </b>

                      <button
                        onClick={() => del("schedule", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>

                    <input
                      className={input}
                      value={str(s.day)}
                      onChange={(e) =>
                        upd("schedule", i, { day: e.target.value })
                      }
                    />

                    <input
                      className={input}
                      value={str(s.time)}
                      onChange={(e) =>
                        upd("schedule", i, { time: e.target.value })
                      }
                    />

                    <input
                      className={input}
                      value={str(s.topic)}
                      onChange={(e) =>
                        upd("schedule", i, { topic: e.target.value })
                      }
                    />

                    <input
                      className={input}
                      value={str(s.place)}
                      onChange={(e) =>
                        upd("schedule", i, { place: e.target.value })
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    add("schedule", {
                      id: Date.now(),
                      day: "السبت",
                      time: "",
                      topic: "",
                      place: "",
                    })
                  }
                  className={addBtn}
                >
                  ➕ إضافة موعد
                </button>
              </>
            )}

            {tab === "fatwas" && (
              <>
                {arr(c.fatwas).map((f: any, i: number) => (
                  <div key={str(f.id) || i} className={itemBox}>
                    <div className="flex justify-between items-center">
                      <b className="text-sm text-primary dark:text-gold">
                        فتوى #{i + 1}
                      </b>

                      <button
                        onClick={() => del("fatwas", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      className={input}
                      value={str(f.q)}
                      onChange={(e) =>
                        upd("fatwas", i, { q: e.target.value })
                      }
                    />

                    <textarea
                      rows={4}
                      className={input}
                      value={str(f.a)}
                      onChange={(e) =>
                        upd("fatwas", i, { a: e.target.value })
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    add("fatwas", {
                      id: Date.now(),
                      q: "",
                      a: "",
                    })
                  }
                  className={addBtn}
                >
                  ➕ إضافة فتوى
                </button>
              </>
            )}

            {tab === "projects" && (
              <>
                {arr(c.projects).map((p: any, i: number) => (
                  <div key={str(p.id) || i} className={itemBox}>
                    <div className="flex justify-between items-center">
                      <b className="text-sm text-primary dark:text-gold">
                        مشروع #{i + 1}
                      </b>

                      <button
                        onClick={() => del("projects", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>

                    <input
                      className={input}
                      value={str(p.title)}
                      onChange={(e) =>
                        upd("projects", i, { title: e.target.value })
                      }
                    />

                    <textarea
                      rows={2}
                      className={input}
                      value={str(p.desc)}
                      onChange={(e) =>
                        upd("projects", i, { desc: e.target.value })
                      }
                    />

                    <input
                      className={input}
                      value={str(p.goal)}
                      onChange={(e) =>
                        upd("projects", i, { goal: e.target.value })
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    add("projects", {
                      id: Date.now(),
                      title: "",
                      desc: "",
                      goal: "",
                    })
                  }
                  className={addBtn}
                >
                  ➕ إضافة مشروع
                </button>
              </>
            )}

            {tab === "news" && (
              <>
                {arr(c.news).map((n: any, i: number) => (
                  <div key={str(n.id) || i} className={itemBox}>
                    <div className="flex justify-between items-center">
                      <b className="text-sm text-primary dark:text-gold">
                        خبر #{i + 1}
                      </b>

                      <button
                        onClick={() => del("news", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>

                    <input
                      className={input}
                      value={str(n.title)}
                      onChange={(e) =>
                        upd("news", i, { title: e.target.value })
                      }
                    />

                    <input
                      className={input}
                      value={str(n.date)}
                      onChange={(e) =>
                        upd("news", i, { date: e.target.value })
                      }
                    />

                    <textarea
                      rows={4}
                      className={input}
                      value={str(n.body)}
                      onChange={(e) =>
                        upd("news", i, { body: e.target.value })
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    add("news", {
                      id: Date.now(),
                      title: "",
                      date: new Date().toLocaleDateString("ar-EG"),
                      body: "",
                    })
                  }
                  className={addBtn}
                >
                  ➕ إضافة خبر
                </button>
              </>
            )}

            {tab === "places" && (
              <>
                {arr(c.places).map((p: any, i: number) => (
                  <div key={str(p.id) || i} className={itemBox}>
                    <div className="flex justify-between items-center">
                      <b className="text-sm text-primary dark:text-gold">
                        مكان #{i + 1}
                      </b>

                      <button
                        onClick={() => del("places", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className={input}
                        value={str(p.name)}
                        onChange={(e) =>
                          upd("places", i, { name: e.target.value })
                        }
                      />

                      <input
                        className={input}
                        value={str(p.area)}
                        onChange={(e) =>
                          upd("places", i, { area: e.target.value })
                        }
                      />
                    </div>

                    <input
                      className={input}
                      value={str(p.note)}
                      onChange={(e) =>
                        upd("places", i, { note: e.target.value })
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    add("places", {
                      id: Date.now(),
                      name: "",
                      area: "",
                      note: "",
                    })
                  }
                  className={addBtn}
                >
                  ➕ إضافة مكان
                </button>
              </>
            )}

            {tab === "adhkar" && (
              <>
                {arr(c.adhkar).map((a: any, i: number) => (
                  <div key={str(a.id) || i} className={itemBox}>
                    <div className="flex justify-between items-center">
                      <b className="text-sm text-primary dark:text-gold">
                        ذكر #{i + 1}
                      </b>

                      <button
                        onClick={() => del("adhkar", i)}
                        className={delBtn}
                      >
                        🗑 حذف
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className={input}
                        value={str(a.category)}
                        onChange={(e) =>
                          upd("adhkar", i, { category: e.target.value })
                        }
                      />

                      <input
                        type="number"
                        min={1}
                        className={input}
                        value={Number(a.repeat) || 1}
                        onChange={(e) =>
                          upd("adhkar", i, {
                            repeat: Number(e.target.value) || 1,
                          })
                        }
                      />
                    </div>

                    <textarea
                      rows={3}
                      className={input}
                      value={str(a.text)}
                      onChange={(e) =>
                        upd("adhkar", i, { text: e.target.value })
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    add("adhkar", {
                      id: Date.now(),
                      category: "أذكار الصباح",
                      text: "",
                      repeat: 1,
                    })
                  }
                  className={addBtn}
                >
                  ➕ إضافة ذكر
                </button>
              </>
            )}

            {tab === "translations" && (
              <>
                <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-500 p-4 rounded mb-2">
                  <h2 className="font-bold text-lg text-primary dark:text-gold mb-1">
                    🌍 إدارة الترجمات
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    تحكم في ترجمة أسماء العلوم ووصفها في كل لغة
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-sm text-primary dark:text-gold mb-2">
                    🌐 اللغات المتاحة ({LANGUAGE_OPTIONS.length}):
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((l) => (
                      <span
                        key={l.code}
                        className="bg-white dark:bg-gray-800 border border-gold/40 px-3 py-1 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300"
                      >
                        {l.flag} {l.name}
                      </span>
                    ))}
                  </div>
                </div>

                {arr(c.fields).map((f: any) => (
                  <details
                    key={str(f.id) || f.slug}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-100 dark:border-gray-600"
                  >
                    <summary className="cursor-pointer font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                      <span className="text-2xl">{str(f.icon)}</span>
                      <span className="text-primary dark:text-gold">
                        {str(f.name)}
                      </span>
                    </summary>

                    <div className="mt-4 space-y-3">
                      {LANGUAGE_OPTIONS.map((l) => (
                        <div
                          key={l.code}
                          className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{l.flag}</span>
                            <span className="font-bold text-sm text-primary dark:text-gold">
                              {l.name}
                            </span>
                          </div>

                          <div className="grid gap-2">
                            <input
                              className={input}
                              value={getTranslationValue(
                                str(f.slug),
                                l.code,
                                "name"
                              )}
                              onChange={(e) =>
                                setTranslation(
                                  str(f.slug),
                                  l.code,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="اسم العلم"
                            />

                            <input
                              className={input}
                              value={getTranslationValue(
                                str(f.slug),
                                l.code,
                                "desc"
                              )}
                              onChange={(e) =>
                                setTranslation(
                                  str(f.slug),
                                  l.code,
                                  "desc",
                                  e.target.value
                                )
                              }
                              placeholder="الوصف"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}

                <button onClick={() => void save()} className={addBtn + " w-full"}>
                  💾 حفظ الترجمات
                </button>
              </>
            )}

            {tab === "questions" && (
              <>
                <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-500 p-4 rounded mb-4">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    💬 الأسئلة الخاصة من المستخدمين المسجلين
                  </p>
                </div>

                {adminQuestions.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    لا توجد أسئلة بعد
                  </p>
                ) : (
                  adminQuestions.map((q: any) => (
                    <div key={q.id} className={itemBox}>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <b className="text-sm text-primary dark:text-gold">
                          سؤال #{q.id}
                        </b>

                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold ${
                            q.status === "answered"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {q.status === "answered"
                            ? "✅ تمت الإجابة"
                            : "⏳ في الانتظار"}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        👤 {str(q.users?.name)} — {str(q.users?.email)}
                      </p>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="font-bold text-primary dark:text-gold">
                          ❓ {str(q.question)}
                        </p>
                      </div>

                      {q.status === "answered" ? (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <p className="text-sm text-green-800 dark:text-green-300 whitespace-pre-line">
                            {str(q.answer)}
                          </p>
                        </div>
                      ) : (
                        <>
                          <textarea
                            rows={3}
                            className={input}
                            value={answers[q.id] || ""}
                            onChange={(e) =>
                              setAnswers({
                                ...answers,
                                [q.id]: e.target.value,
                              })
                            }
                            placeholder="اكتب الإجابة..."
                          />

                          <button
                            onClick={() => void answerQuestion(q.id)}
                            className="bg-gold text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gold-light transition"
                          >
                            إرسال الإجابة
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </>
            )}

            {tab === "stats" && (
              <>
                <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl p-6 mb-6">
                  <h2 className="font-serif text-2xl text-gold mb-2">
                    📊 إحصائيات متقدمة
                  </h2>

                  <p className="text-white/80 text-sm">
                    تحليل شامل لأداء الموقع
                  </p>
                </div>

                <div className="grid sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-t-4 border-blue-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      👁️ زيارات اليوم
                    </p>

                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {Number(advancedStats?.todayViews || 0)}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-t-4 border-green-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      📧 مشتركين النشرة
                    </p>

                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {Number(advancedStats?.subscribers || 0)}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-t-4 border-amber-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      ❓ أسئلة في الانتظار
                    </p>

                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {Number(stats?.questions?.pending || 0)}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-t-4 border-purple-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      👥 إجمالي المستخدمين
                    </p>

                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {Number(stats?.users?.total || 0)}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-4">
                    🔥 أكثر الصفحات زيارة (آخر 7 أيام)
                  </h3>

                  {arr(advancedStats?.topPages).length > 0 ? (
                    <div className="space-y-2">
                      {arr(advancedStats?.topPages).map(
                        (p: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-cream-dark dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 bg-gold text-gray-900 rounded-full grid place-items-center font-bold text-sm">
                                {i + 1}
                              </span>

                              <span className="font-mono text-sm text-gray-900 dark:text-white">
                                {str(p.page)}
                              </span>
                            </div>

                            <span className="bg-primary text-gold px-3 py-1 rounded-full text-sm font-bold">
                              {Number(p.count || 0)} زيارة
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      لا توجد بيانات بعد
                    </p>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-4">
                    🌍 أكثر اللغات استخداما (آخر 30 يوم)
                  </h3>

                  {arr(advancedStats?.topLanguages).length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {arr(advancedStats?.topLanguages).map(
                        (l: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-cream-dark dark:bg-gray-700 rounded-lg"
                          >
                            <span className="font-bold text-gray-900 dark:text-white">
                              {str(l.lang).toUpperCase()}
                            </span>

                            <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-sm font-bold">
                              {Number(l.count || 0)} زيارة
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      لا توجد بيانات بعد
                    </p>
                  )}
                </div>

                {stats && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h3 className="font-bold text-primary dark:text-gold text-lg mb-4">
                      📚 إحصائيات المحتوى
                    </h3>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="bg-cream-dark dark:bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          🧭 العلوم
                        </span>

                        <span className="text-xl font-bold text-gold">
                          {Number(stats.content?.fields || 0)}
                        </span>
                      </div>

                      <div className="bg-cream-dark dark:bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          📖 الدروس
                        </span>

                        <span className="text-xl font-bold text-gold">
                          {Number(stats.content?.lessons || 0)}
                        </span>
                      </div>

                      <div className="bg-cream-dark dark:bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          🎬 الفيديوهات
                        </span>

                        <span className="text-xl font-bold text-gold">
                          {Number(stats.content?.videos || 0)}
                        </span>
                      </div>

                      <div className="bg-cream-dark dark:bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          ✍️ المقالات
                        </span>

                        <span className="text-xl font-bold text-gold">
                          {Number(stats.content?.articles || 0)}
                        </span>
                      </div>

                      <div className="bg-cream-dark dark:bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          📚 الكتب
                        </span>

                        <span className="text-xl font-bold text-gold">
                          {Number(stats.content?.books || 0)}
                        </span>
                      </div>

                      <div className="bg-cream-dark dark:bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          ❓ الفتاوى
                        </span>

                        <span className="text-xl font-bold text-gold">
                          {Number(stats.content?.fatwas || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === "notifications" && (
              <>
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl p-6 mb-6">
                  <h2 className="font-serif text-2xl mb-2">
                    🔔 إرسال إشعار للمستخدمين
                  </h2>

                  <p className="text-white/80 text-sm">
                    أرسل إشعارا لكل المستخدمين عند نزول درس جديد أو فتوى مهمة
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md space-y-4">
                  <div>
                    <span className={label}>عنوان الإشعار</span>

                    <input
                      className={input}
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="مثال: درس جديد في العقيدة"
                    />
                  </div>

                  <div>
                    <span className={label}>نص الإشعار</span>

                    <textarea
                      rows={3}
                      className={input}
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      placeholder="شرح مختصر للدرس أو الفتوى..."
                    />
                  </div>

                  <div>
                    <span className={label}>رابط الصفحة (اختياري)</span>

                    <input
                      className={input}
                      value={notifUrl}
                      onChange={(e) => setNotifUrl(e.target.value)}
                      placeholder="/ar/fields/aqeedah"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      if (!notifTitle || !notifBody) {
                        showToast("error", "❌ اكتب العنوان والنص");
                        return;
                      }

                      showToast("info", "⏳ جاري إرسال الإشعار...");

                      try {
                        const r = await fetch("/api/notifications/send", {
                          method: "POST",
                          credentials: "include",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            title: notifTitle,
                            body: notifBody,
                            url: notifUrl,
                          }),
                        });

                        const j = await r.json().catch(() => ({}));

                        if (j.ok) {
                          showToast(
                            "success",
                            "✅ تم إرسال الإشعار بنجاح"
                          );

                          setNotifTitle("");
                          setNotifBody("");
                          setNotifUrl("/ar");
                        } else {
                          showToast(
                            "error",
                            "❌ " + (j.error || "فشل الإرسال")
                          );
                        }
                      } catch {
                        showToast("error", "❌ فشل إرسال الإشعار");
                      }
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    🔔 إرسال الإشعار الآن
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <div className="fixed bottom-4 left-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-bold animate-slide-up ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : toast.type === "warning"
                ? "bg-amber-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {showConfirmDialog.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-primary dark:text-gold mb-2">
              {showConfirmDialog.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {showConfirmDialog.message}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setShowConfirmDialog({
                    ...showConfirmDialog,
                    show: false,
                  })
                }
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                إلغاء
              </button>

              <button
                onClick={() => {
                  void showConfirmDialog.onConfirm();

                  setShowConfirmDialog({
                    ...showConfirmDialog,
                    show: false,
                  });
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}