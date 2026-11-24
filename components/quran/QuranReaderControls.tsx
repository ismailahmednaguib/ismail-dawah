"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

type ReaderTheme = "plain" | "cream" | "night";

type ReaderSettings = {
  fontSize: number;
  theme: ReaderTheme;
};

const STORAGE_KEY = "discover-islam-quran-reader-settings";
const DEFAULT_SETTINGS: ReaderSettings = { fontSize: 30, theme: "plain" };

const THEMES: Record<ReaderTheme, { ar: string; en: string; className: string }> = {
  plain: {
    ar: "هادئ",
    en: "Calm",
    className: "bg-white dark:bg-night-900",
  },
  cream: {
    ar: "ورقي",
    en: "Paper",
    className: "bg-amber-50 dark:bg-amber-950/20",
  },
  night: {
    ar: "ليلي",
    en: "Night",
    className: "quran-reader-night bg-slate-900 text-slate-100",
  },
};

function normalizeSettings(value: unknown): ReaderSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_SETTINGS;
  }

  const item = value as Record<string, unknown>;
  const fontSize = Number(item.fontSize);
  const theme = item.theme;

  return {
    fontSize: Number.isFinite(fontSize)
      ? Math.min(40, Math.max(24, Math.round(fontSize)))
      : DEFAULT_SETTINGS.fontSize,
    theme: theme === "plain" || theme === "cream" || theme === "night"
      ? theme
      : DEFAULT_SETTINGS.theme,
  };
}

export default function QuranReaderControls({
  lang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  const isArabic = lang === "ar";
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings(normalizeSettings(JSON.parse(raw)));
    } catch {
      // Keep the accessible defaults when browser storage is unavailable.
    } finally {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Reading remains fully usable if storage is disabled or full.
    }
  }, [mounted, settings]);

  const updateSettings = (patch: Partial<ReaderSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  const readerStyle = {
    "--quran-reader-font-size": `${settings.fontSize}px`,
  } as CSSProperties;

  return (
    <section aria-label={isArabic ? "إعدادات قراءة القرآن" : "Quran reading settings"}>
      <div className="card mb-4 flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">
            {isArabic ? "حجم الخط" : "Text size"}
          </span>
          <button
            type="button"
            onClick={() => updateSettings({ fontSize: Math.max(24, settings.fontSize - 2) })}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg font-black hover:border-primary-400 hover:bg-primary-50 dark:border-night-700 dark:hover:bg-primary-950/30"
            aria-label={isArabic ? "تصغير الخط" : "Decrease text size"}
          >
            −
          </button>
          <span className="min-w-10 text-center text-sm font-bold text-primary-700 dark:text-primary-300" aria-live="polite">
            {settings.fontSize}
          </span>
          <button
            type="button"
            onClick={() => updateSettings({ fontSize: Math.min(40, settings.fontSize + 2) })}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg font-black hover:border-primary-400 hover:bg-primary-50 dark:border-night-700 dark:hover:bg-primary-950/30"
            aria-label={isArabic ? "تكبير الخط" : "Increase text size"}
          >
            +
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={isArabic ? "خلفية القراءة" : "Reading background"}>
          {Object.entries(THEMES).map(([key, theme]) => {
            const themeKey = key as ReaderTheme;
            const active = settings.theme === themeKey;
            return (
              <button
                key={themeKey}
                type="button"
                onClick={() => updateSettings({ theme: themeKey })}
                aria-pressed={active}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  active
                    ? "bg-primary-700 text-white"
                    : "border border-slate-200 text-slate-600 hover:border-primary-300 dark:border-night-700 dark:text-slate-300"
                }`}
              >
                {isArabic ? theme.ar : theme.en}
              </button>
            );
          })}
        </div>

        <span className="ms-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
          {isArabic ? "تُحفظ الإعدادات على هذا الجهاز" : "Settings are saved on this device"}
        </span>
      </div>

      <div
        className={`rounded-3xl p-2 transition-colors sm:p-4 ${THEMES[settings.theme].className}`}
        style={readerStyle}
      >
        {children}
      </div>
    </section>
  );
}
