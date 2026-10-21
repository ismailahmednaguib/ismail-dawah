"use client";

// ============================================================
// أحدث المحتوى — تبويبات بدل سبع قوائم متتابعة.
// تقلل طول الرئيسية وتُبقي كل الأنواع على بُعد نقرة واحدة.
// ============================================================

import { useMemo, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import ContentCard from "@/components/learn/ContentCard";
import type { PublicItem } from "@/lib/learn/public";
import type { Lang } from "@/lib/i18n";

export type LatestTab = {
  key: string;
  title: string;
  href: string;
  items: PublicItem[];
};

export default function LatestTabs({
  rows,
  lang,
  viewAll,
}: {
  rows: LatestTab[];
  lang: Lang;
  viewAll: string;
}) {
  const available = useMemo(() => rows.filter((row) => row.items.length > 0), [rows]);
  const [active, setActive] = useState(() => available[0]?.key ?? "");
  const current = available.find((row) => row.key === active) ?? available[0];

  if (!current) return null;

  const isRTL = lang === "ar";

  function focusTab(key: string) {
    setActive(key);
    requestAnimationFrame(() => {
      document.getElementById(`latest-tab-${key}`)?.focus();
    });
  }

  function handleTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = available.findIndex((row) => row.key === current.key);

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const forward =
        event.key === "ArrowRight" ? (isRTL ? -1 : 1) : isRTL ? 1 : -1;
      const next = available[(index + forward + available.length) % available.length];
      if (next) focusTab(next.key);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      if (available[0]) focusTab(available[0].key);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const last = available[available.length - 1];
      if (last) focusTab(last.key);
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={isRTL ? "أحدث المحتوى" : "Latest content"}
        aria-orientation="horizontal"
        onKeyDown={handleTabListKeyDown}
        className="mb-6 flex flex-wrap justify-center gap-2"
      >
        {available.map((row) => {
          const selected = row.key === current.key;
          return (
            <button
              key={row.key}
              type="button"
              role="tab"
              id={`latest-tab-${row.key}`}
              aria-selected={selected}
              aria-controls={`latest-panel-${row.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(row.key)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                selected
                  ? "border-primary-700 bg-primary-700 text-white shadow-sm dark:border-primary-500 dark:bg-primary-600"
                  : "border-black/10 bg-white/70 text-slate-700 hover:border-primary-400 hover:text-primary-700 dark:border-white/15 dark:bg-night-800/70 dark:text-slate-200 dark:hover:text-primary-200"
              }`}
            >
              {row.title}
            </button>
          );
        })}
      </div>

      {available.map((row) => {
        const selected = row.key === current.key;

        return (
          <div
            key={row.key}
            role="tabpanel"
            id={`latest-panel-${row.key}`}
            aria-labelledby={`latest-tab-${row.key}`}
            data-latest-panel="true"
            hidden={!selected}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3
                className="text-xl font-black text-slate-900 dark:text-white md:text-2xl"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {row.title}
              </h3>
              <Link
                href={row.href}
                className="shrink-0 text-sm font-bold text-primary-700 transition-colors hover:text-primary-500 dark:text-primary-300"
              >
                {viewAll}
                <span aria-hidden="true" className="mx-1">
                  {isRTL ? "←" : "→"}
                </span>
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {row.items.map((item) => (
                <ContentCard
                  key={item.id}
                  lang={lang}
                  type={item.content_type}
                  slug={item.slug}
                  title={item.title}
                  summary={item.summary}
                  published_at={item.published_at}
                  isFallback={item.isFallback}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
