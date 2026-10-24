"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { searchAyahs, type SearchableAyah } from "@/lib/quran/ayah-search";
import { SearchIcon } from "@/lib/icons";

type Props = {
  ayahs: SearchableAyah[];
  lang: Lang;
  surahPath: string;
};

const COPY = {
  ar: {
    title: "ابحث داخل آيات السورة",
    placeholder: "ابحث بكلمة أو عبارة من الآية...",
    count: (n: number) => `${n} نتيجة`,
    empty: "لا توجد آيات مطابقة في هذه السورة.",
    hint: "يُبحث داخل النص المحمّل فقط، دون طلب إضافي من المصدر.",
    ayah: "آية",
  },
  en: {
    title: "Search this surah",
    placeholder: "Search a word or phrase in the ayahs...",
    count: (n: number) => `${n} result${n === 1 ? "" : "s"}`,
    empty: "No matching ayahs were found in this surah.",
    hint: "Searches the loaded text only; no extra source request is made.",
    ayah: "Ayah",
  },
} as const;

export default function AyahSearch({ ayahs, lang, surahPath }: Props) {
  const [query, setQuery] = useState("");
  const copy = COPY[lang];
  const matches = useMemo(
    () => searchAyahs(ayahs, query, lang),
    [ayahs, lang, query],
  );

  return (
    <section
      aria-labelledby="ayah-search-title"
      className="card mt-8 border-primary-200/70 bg-white/80 p-5 dark:border-primary-800/50 dark:bg-night-900/70"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-0.5 text-primary-700 dark:text-primary-300">
          <SearchIcon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="ayah-search-title" className="text-base font-black text-slate-800 dark:text-white">
            {copy.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{copy.hint}</p>
        </div>
      </div>

      <label htmlFor="ayah-search-input" className="sr-only">
        {copy.title}
      </label>
      <div className="relative mt-4">
        <input
          id="ayah-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.placeholder}
          className="input-islamic w-full pe-4"
          dir={lang === "ar" ? "rtl" : "ltr"}
          autoComplete="off"
        />
      </div>

      {query.trim().length >= 2 && (
        <div className="mt-4" aria-live="polite">
          <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            {copy.count(matches.length)}
          </p>
          {matches.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-night-800 dark:text-slate-400">
              {copy.empty}
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {matches.map((match) => {
                const href = `${surahPath}#ayah-${match.numberInSurah}`;
                const preview = lang === "ar" ? match.text : match.translation;

                return (
                  <li key={match.numberInSurah}>
                    <Link
                      href={href}
                      className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-primary-400 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:hover:border-primary-700 dark:hover:bg-night-700"
                    >
                      <span className="text-xs font-black text-primary-700 dark:text-primary-300">
                        {copy.ayah} {match.numberInSurah}
                      </span>
                      <span
                        className={lang === "ar"
                          ? "quran-text mt-2 block text-sm leading-8 text-slate-700 dark:text-slate-200"
                          : "mt-2 block text-sm leading-6 text-slate-700 dark:text-slate-200"}
                        style={lang === "ar" ? { fontFamily: "var(--font-quran)" } : undefined}
                      >
                        {preview}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
