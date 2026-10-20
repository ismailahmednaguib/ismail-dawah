"use client";

// ============================================================
// أحدث المحتوى — تبويبات بدل سبع قوائم متتابعة.
// تقلل طول الرئيسية وتُبقي كل الأنواع على بُعد نقرة واحدة.
// ============================================================

import { useMemo, useState } from "react";
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

  return (
    <div>
      <div
        role="tablist"
        aria-label={isRTL ? "أحدث المحتوى" : "Latest content"}
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

      <div
        role="tabpanel"
        id={`latest-panel-${current.key}`}
        aria-labelledby={`latest-tab-${current.key}`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3
            className="text-xl font-black text-slate-900 dark:text-white md:text-2xl"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {current.title}
          </h3>
          <Link
            href={current.href}
            className="shrink-0 text-sm font-bold text-primary-700 transition-colors hover:text-primary-500 dark:text-primary-300"
          >
            {viewAll}
            <span aria-hidden="true" className="mx-1">
              {isRTL ? "←" : "→"}
            </span>
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {current.items.map((item) => (
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
    </div>
  );
}
