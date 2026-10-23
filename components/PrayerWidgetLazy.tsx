"use client";

// نُبقي كارت الصلاة ظاهرًا في HTML الأولي، ونؤجل كود الودجت وطلب المواقيت
// إلى وقت خمول المتصفح حتى لا ينافس الهيرو والمحتوى الأولي على الخيط الرئيسي.

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";

const UI = {
  ar: {
    next: "الصلاة القادمة",
    loading: "جارٍ تحميل المواقيت…",
    times: "المواقيت كاملة",
    qibla: "اتجاه القبلة",
  },
  en: {
    next: "Next prayer",
    loading: "Loading prayer times…",
    times: "All prayer times",
    qibla: "Qibla direction",
  },
} as const;

type PrayerWidgetComponent = (props: { lang: Lang }) => ReactNode;

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number }
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function PrayerWidgetPlaceholder({ lang }: { lang: Lang }) {
  const ui = UI[lang];
  const isRTL = lang === "ar";

  return (
    <section className="container-page -mt-6 pb-2" dir={isRTL ? "rtl" : "ltr"}>
      <div
        className="card relative overflow-hidden border-primary-200/70 bg-gradient-to-br from-white via-cream-dark to-primary-50/50 p-5 shadow-lg dark:border-primary-900/40 dark:from-night-800 dark:via-night-900 dark:to-primary-950/30 md:p-6"
        aria-busy="true"
      >
        <div
          aria-hidden="true"
          className="absolute inset-y-0 start-0 w-1.5 bg-gradient-to-b from-gold-400 via-primary-500 to-primary-700"
        />

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>

            <div className="min-w-0">
              <p className="text-xs font-bold text-primary-700 dark:text-primary-300">
                {ui.next}
              </p>
              <p className="mt-1 text-sm opacity-70">{ui.loading}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <a
              href={`/${lang}/prayer-times`}
              className="btn-outline px-3 py-1.5 text-xs"
            >
              {ui.times}
            </a>
            <a
              href={`/${lang}/qibla`}
              className="btn-primary px-3 py-1.5 text-xs"
            >
              {ui.qibla}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PrayerWidgetLazy({ lang, style }: { lang: Lang; style?: CSSProperties }) {
  const [Widget, setWidget] = useState<PrayerWidgetComponent | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const loadWidget = () => {
      void import("@/components/PrayerWidget").then((module) => {
        if (!cancelled) setWidget(() => module.default as PrayerWidgetComponent);
      });
    };

    const idleWindow = window as IdleWindow;
    if (typeof idleWindow.requestIdleCallback === "function") {
      idleId = idleWindow.requestIdleCallback(loadWidget, { timeout: 1800 });
    } else {
      timeoutId = window.setTimeout(loadWidget, 700);
    }

    return () => {
      cancelled = true;
      if (idleId !== null && typeof idleWindow.cancelIdleCallback === "function") {
        idleWindow.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, []);

  return Widget ? <div style={style}><Widget lang={lang} /></div> : <div style={style}><PrayerWidgetPlaceholder lang={lang} /></div>;
}
