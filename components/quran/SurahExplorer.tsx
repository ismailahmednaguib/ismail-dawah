"use client";

// components/quran/SurahExplorer.tsx
// ============================================================
// مستكشف السور: بحث فوري + فلترة (مكية/مدنية) + شبكة مربّعات مدمجة.
// يعمل على العميل لأن البيانات صغيرة (١١٤ سورة) والتفاعل أهم من التصفّح.
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export type SurahItem = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  ayahs: number;
  type: "makki" | "madani";
};

export type ExplorerLabels = {
  searchPlaceholder: string;
  all: string;
  meccan: string;
  medinan: string;
  ayahs: string;
  openSurah: string;
  noResults: string;
  noResultsDesc: string;
  reset: string;
  results: string;
  totalSurahs: string;
};

// ===== أدوات تطبيع النص العربي (لتسهيل البحث بلا تشكيل ولا همزات) =====

const DIACRITICS = /[\u064B-\u0652\u0670\u0640\u06D6-\u06ED]/g;

function toAsciiDigits(input: string): string {
  return input.replace(/[\u0660-\u0669]/g, (d) =>
    String(d.charCodeAt(0) - 0x0660)
  );
}

/** يزيل التشكيل ويوحّد الهمزات والألف والياء والتاء المربوطة. */
function normalize(input: string): string {
  return toAsciiDigits(input.toLowerCase())
    .replace(DIACRITICS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ىئ]/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ة/g, "ه")
    .replace(/[\u200e\u200f]/g, "")
    .trim();
}

/** تطبيع أكثر تسامحًا: يحذف «ال» و«سورة» وكل ما ليس حرفًا أو رقمًا. */
function loose(input: string): string {
  return normalize(input)
    .replace(/^سوره\s*/, "")
    .replace(/^ال/, "")
    .replace(/[^a-z0-9\u0600-\u06ff]/g, "");
}

/** يضيف «سورة» قبل الاسم إن لم تكن موجودة (بيانات المصدر قد تختلف). */
function withSurahPrefix(raw: string): string {
  const text = raw.trim();
  const head = (text.split(/\s+/)[0] ?? "").replace(DIACRITICS, "");
  return head === "سورة" ? text : `سورة ${text}`;
}

function formatNumber(value: number, lang: string): string {
  if (lang !== "ar") return String(value);
  return toAsciiDigits(String(value)).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

// ===== أنماط الألوان حسب نوع النزول =====

const TONES = {
  makki: {
    line: "bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300",
    badge:
      "bg-gold-50 text-gold-700 ring-gold-200 dark:bg-gold-900/30 dark:text-gold-300 dark:ring-gold-800/60",
    text: "text-gold-600 dark:text-gold-400",
    chip: "border-gold-300 bg-gold-50 text-gold-700 dark:border-gold-800 dark:bg-gold-950/40 dark:text-gold-300",
  },
  madani: {
    line: "bg-gradient-to-r from-primary-300 via-primary-500 to-primary-300",
    badge:
      "bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-800/60",
    text: "text-primary-600 dark:text-primary-400",
    chip: "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300",
  },
} as const;

export default function SurahExplorer({
  lang,
  surahs,
  labels,
  showToolbar = true,
  showGrid = true,
}: {
  lang: string;
  surahs: SurahItem[];
  labels: ExplorerLabels;
  showToolbar?: boolean;
  showGrid?: boolean;
}) {
  const isRTL = lang === "ar";
  const [query, setQuery] = useState("");
  const [revelation, setRevelation] = useState<"all" | "makki" | "madani">("all");
  const searchRef = useRef<HTMLInputElement>(null);

  // اختصار "/" للانتقال إلى حقل البحث
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const counts = useMemo(
    () => ({
      all: surahs.length,
      makki: surahs.filter((s) => s.type === "makki").length,
      madani: surahs.filter((s) => s.type === "madani").length,
    }),
    [surahs]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query);
    const looseQuery = loose(query);
    const isNumeric = /^\d+$/.test(normalizedQuery);

    return surahs.filter((surah) => {
      if (revelation !== "all" && surah.type !== revelation) return false;
      if (!normalizedQuery) return true;

      if (isNumeric) {
        return (
          pad(surah.number) === pad(Number(normalizedQuery)) ||
          String(surah.number) === looseQuery
        );
      }

      return (
        loose(surah.name).includes(looseQuery) ||
        loose(surah.englishName).includes(looseQuery) ||
        loose(surah.englishNameTranslation).includes(looseQuery)
      );
    });
  }, [surahs, query, revelation]);

  const filters: Array<{ key: "all" | "makki" | "madani"; label: string; count: number }> = [
    { key: "all", label: labels.all, count: counts.all },
    { key: "makki", label: labels.meccan, count: counts.makki },
    { key: "madani", label: labels.medinan, count: counts.madani },
  ];

  return (
    <div>
      {/* ===== شريط البحث والفلترة ===== */}
      {showToolbar && (
        <div className="card mb-6 p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>

              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={labels.searchPlaceholder}
                aria-label={labels.searchPlaceholder}
                className="input-islamic !ps-12"
              />
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label={labels.searchPlaceholder}>
              {filters.map((option) => {
                const active = revelation === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setRevelation(option.key)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                      active
                        ? "bg-primary-600 text-white shadow-md"
                        : "border border-primary-100 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:text-primary-300"
                    }`}
                  >
                    {option.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                        active
                          ? "bg-white/25 text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-night-700 dark:text-slate-300"
                      }`}
                    >
                      {formatNumber(option.count, lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500 dark:border-night-700 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              📚 {labels.totalSurahs}:
              <span className="text-slate-800 dark:text-slate-100">
                {formatNumber(counts.all, lang)}
              </span>
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
              •
            </span>
            <span className="inline-flex items-center gap-1.5">
              🔎 {labels.results}:
              <span className="text-primary-700 dark:text-primary-300">
                {formatNumber(filtered.length, lang)}
              </span>
            </span>
            <span className="ms-auto hidden text-[11px] font-semibold text-slate-400 sm:inline">
              {isRTL ? "اضغط / للبحث السريع" : "Press / to search"}
            </span>
          </div>
        </div>
      )}

      {/* ===== شبكة السور ===== */}
      {showGrid &&
        (filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl" aria-hidden="true">
              📭
            </div>
            <h3 className="mb-2 text-xl font-black text-slate-800 dark:text-white">
              {labels.noResults}
            </h3>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              {labels.noResultsDesc}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setRevelation("all");
              }}
              className="btn-primary"
            >
              {labels.reset}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filtered.map((surah) => {
              const tone = TONES[surah.type];
              const displayName = isRTL
                ? withSurahPrefix(surah.name)
                : surah.englishName;
              const secondary = isRTL ? "" : surah.englishNameTranslation;

              return (
                <Link
                  key={surah.number}
                  href={`/${lang}/quran/${surah.number}`}
                  aria-label={`${labels.openSurah} — ${displayName}`}
                  title={`${labels.openSurah} — ${displayName}`}
                  className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-primary-100/80 bg-white px-3 pb-3 pt-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-night-700 dark:bg-night-800 dark:hover:border-primary-700"
                >
                  <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${tone.line}`} />

                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black ring-2 ring-inset transition-transform duration-200 group-hover:scale-105 ${tone.badge}`}
                  >
                    {formatNumber(surah.number, lang)}
                  </span>

                  <span
                    className="mt-0.5 line-clamp-2 min-h-[2.6rem] text-[15px] font-black leading-snug text-slate-900 transition-colors group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300"
                    style={{ fontFamily: "var(--font-quran)" }}
                  >
                    {displayName}
                  </span>

                  {secondary && (
                    <span className="line-clamp-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      {secondary}
                    </span>
                  )}

                  <span className="mt-auto inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span>
                      {formatNumber(surah.ayahs, lang)} {labels.ayahs}
                    </span>
                    <span
                      className={`rounded-full border px-1.5 py-0.5 text-[10px] font-black ${tone.chip}`}
                    >
                      {surah.type === "makki" ? labels.meccan : labels.medinan}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
    </div>
  );
}
