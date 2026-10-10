// app/[lang]/calendar/LiveCountdown.tsx
"use client";

import { useEffect, useState } from "react";

// ============================================================
// Types
// ============================================================

type Lang = "ar" | "en";

type LiveCountdownProps = {
  targetDate?: string | number | Date | null;
  lang?: Lang | string;
  title?: string;
  emptyText?: string;
  liveText?: string;
  loadingText?: string;
  className?: string;
  [key: string]: unknown;
};

// ============================================================
// Helpers
// ============================================================

const ARABIC_DIGITS = ["٠", "", "٢", "", "٤", "", "٦", "", "٨", ""];

function normalizeLang(value: Lang | string | undefined | null): Lang {
  const lang = String(value ?? "")
    .trim()
    .toLowerCase();

  if (lang === "en" || lang.startsWith("en-")) {
    return "en";
  }

  return "ar";
}

function toArabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => {
    const number = Number(digit);
    return ARABIC_DIGITS[number] ?? digit;
  });
}

function formatDigit(value: number, lang: Lang): string {
  const padded = String(value).padStart(2, "0");
  return lang === "ar" ? toArabicDigits(padded) : padded;
}

function toDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

// ============================================================
// Small UI piece
// ============================================================

function CountdownUnit({
  value,
  labelAr,
  labelEn,
  lang,
  large = false,
}: {
  value: number;
  labelAr: string;
  labelEn: string;
  lang: Lang;
  large?: boolean;
}) {
  return (
    <div
      className={`flex min-w-[72px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-night-700 dark:bg-night-800/70 ${
        large ? "min-w-[92px] px-5 py-4" : ""
      }`}
    >
      <span
        className={`font-black tabular-nums text-cyan-700 dark:text-cyan-300 ${
          large ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"
        }`}
      >
        {formatDigit(value, lang)}
      </span>

      <span className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {lang === "ar" ? labelAr : labelEn}
      </span>
    </div>
  );
}

// ============================================================
// Component
// ============================================================

export function LiveCountdown({
  targetDate,
  lang: langProp,
  title,
  emptyText,
  liveText,
  loadingText,
  className = "",
}: LiveCountdownProps) {
  const lang = normalizeLang(langProp);
  const isRTL = lang === "ar";

  const safeTarget = toDate(targetDate);

  const defaultTitle = isRTL
    ? "العد التنازلي للمناسبة القادمة"
    : "Countdown to the next occasion";

  const defaultEmpty = isRTL
    ? "لا يوجد وقت محدد حاليًا."
    : "No scheduled time available.";

  const defaultLive = isRTL
    ? "المناسبة حالية الآن"
    : "The occasion is now";

  const defaultLoading = isRTL
    ? "جاري الحساب..."
    : "Calculating...";

  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());

    update();

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, []);

  // لا يوجد تاريخ
  if (!safeTarget) {
    return (
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className={`rounded-2xl border border-slate-200 bg-white/80 p-5 text-center shadow-sm backdrop-blur dark:border-night-700 dark:bg-night-800/70 ${className}`}
      >
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {emptyText ?? defaultEmpty}
        </p>
      </section>
    );
  }

  // أول رسم على السيرفر أو قبل useEffect
  if (now === null) {
    return (
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className={`rounded-2xl border border-slate-200 bg-white/80 p-5 text-center shadow-sm backdrop-blur dark:border-night-700 dark:bg-night-800/70 ${className}`}
      >
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {loadingText ?? defaultLoading}
        </p>
      </section>
    );
  }

  const diff = safeTarget.getTime() - now;

  // انتهت المناسبة أو حالية
  if (diff <= 0) {
    return (
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className={`rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center shadow-sm backdrop-blur dark:border-emerald-900/40 dark:bg-emerald-950/20 ${className}`}
      >
        <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
          {liveText ?? defaultLive}
        </p>
      </section>
    );
  }

  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      aria-live="polite"
      aria-label={title ?? defaultTitle}
      className={`rounded-3xl border border-gold-200 bg-gradient-to-br from-white via-gold-50/40 to-cyan-50/40 p-5 shadow-lg dark:border-gold-900/30 dark:from-night-900 dark:via-gold-950/10 dark:to-cyan-950/10 ${className}`}
    >
      <p className="mb-4 text-center text-sm font-black text-slate-600 dark:text-slate-300">
        {title ?? defaultTitle}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
        {days > 0 && (
          <CountdownUnit
            value={days}
            labelAr="يوم"
            labelEn={days === 1 ? "day" : "days"}
            lang={lang}
            large
          />
        )}

        <CountdownUnit
          value={hours}
          labelAr="ساعة"
          labelEn={hours === 1 ? "hour" : "hours"}
          lang={lang}
        />

        <CountdownUnit
          value={minutes}
          labelAr="دقيقة"
          labelEn={minutes === 1 ? "minute" : "minutes"}
          lang={lang}
        />

        <CountdownUnit
          value={seconds}
          labelAr="ثانية"
          labelEn={seconds === 1 ? "second" : "seconds"}
          lang={lang}
        />
      </div>
    </section>
  );
}

export default LiveCountdown;