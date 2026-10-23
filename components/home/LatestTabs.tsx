"use client";

// ============================================================
// أحدث المحتوى — تبويبات بدل سبع قوائم متتابعة.
// تقلل طول الرئيسية وتُبقي كل الأنواع على بُعد نقرة واحدة.
//
// الملاحظة الأدائية: البطاقات تُرسم على الخادم وتُمرَّر كـ children،
// فلا تُضمَّن في حزمة العميل ولا تُهيَّأ (hydrate) مع كل بطاقة.
// هذا المكوّن يدير التبويبات وإظهار/إخفاء الألواح فقط.
// ============================================================

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type LatestTab = {
  key: string;
  title: string;
};

export default function LatestTabs({
  tabs,
  lang,
  children,
}: {
  tabs: LatestTab[];
  lang: "ar" | "en";
  children: ReactNode;
}) {
  const [active, setActive] = useState(() => tabs[0]?.key ?? "");
  const panelsRef = useRef<HTMLDivElement>(null);
  const isRTL = lang === "ar";
  const currentKey = tabs.some((tab) => tab.key === active)
    ? active
    : tabs[0]?.key ?? "";

  // لا نُعيد رسم الألواح (وهي عقد خادم) عند تبديل التبويب؛
  // نُحدّث خاصية hidden مباشرة، فيبقى DOM كما رسمه الخادم.
  useEffect(() => {
    const root = panelsRef.current;
    if (!root) return;

    root.querySelectorAll<HTMLElement>("[data-latest-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.latestPanel !== currentKey;
    });
  }, [currentKey]);

  if (tabs.length === 0) return null;

  function focusTab(key: string) {
    setActive(key);
    requestAnimationFrame(() => {
      document.getElementById(`latest-tab-${key}`)?.focus();
    });
  }

  function handleTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.key === currentKey);

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const forward =
        event.key === "ArrowRight" ? (isRTL ? -1 : 1) : isRTL ? 1 : -1;
      const next = tabs[(index + forward + tabs.length) % tabs.length];
      if (next) focusTab(next.key);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      if (tabs[0]) focusTab(tabs[0].key);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const last = tabs[tabs.length - 1];
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
        {tabs.map((tab) => {
          const selected = tab.key === currentKey;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`latest-tab-${tab.key}`}
              aria-selected={selected}
              aria-controls={`latest-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.key)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                selected
                  ? "border-primary-700 bg-primary-700 text-white shadow-sm dark:border-primary-500 dark:bg-primary-700"
                  : "border-black/10 bg-white/70 text-slate-700 hover:border-primary-400 hover:text-primary-700 dark:border-white/15 dark:bg-night-800/70 dark:text-slate-200 dark:hover:text-primary-200"
              }`}
            >
              {tab.title}
            </button>
          );
        })}
      </div>

      <div ref={panelsRef}>{children}</div>
    </div>
  );
}
