"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { type Lang, type AllLang } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/i18n/config";

const CLIENT_LANGUAGES = LANGUAGES.filter((l) => l.enabled);

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // استخراج اللغة الحالية من المسار (ar/en للمسار، ولغة واجهة من localStorage إن وُجدت)
  const segments = pathname.split("/");
  const routeLang = segments[1] === "en" ? "en" : "ar";

  const [uiLang, setUiLang] = useState<Lang | AllLang>(() => {
    if (typeof window === "undefined") return "ar";
    const saved = localStorage.getItem("ismail-ui-lang");
    return saved && CLIENT_LANGUAGES.some((l) => l.code === saved)
      ? (saved as Lang)
      : "ar";
  });

  const switchLanguage = (code: string) => {
    const target = code as Lang;
    setUiLang(target);
    localStorage.setItem("ismail-ui-lang", code);
    setIsOpen(false);
  };

  // تبديل المسار بين ar/en فقط (المحتوى التفصيلي يدعم ar/en حالياً)
  const switchRouteLang = () => {
    const targetRouteLang = routeLang === "ar" ? "en" : "ar";
    const restOfPath = segments.slice(2).join("/");
    router.push(`/${targetRouteLang}${restOfPath ? `/${restOfPath}` : ""}`);
  };

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-sm transition-all duration-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 text-slate-700 dark:text-slate-200"
        aria-label="تغيير لغة الواجهة"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 group-hover:rotate-12"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="hidden sm:inline">
          {CLIENT_LANGUAGES.find((l) => l.code === uiLang)?.nativeName || uiLang}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M7 17l9.2-9.2M17 17V7.8H7.8" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-cream-200 bg-white shadow-xl z-50 py-2">
          <div className="px-4 py-2 text-xs font-bold text-primary-700 uppercase tracking-wider">
            لغة الواجهة
          </div>
          <div className="py-1">
            {CLIENT_LANGUAGES.map((lang) => {
              const active = uiLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${
                    active
                      ? "bg-primary-50 text-primary-800 font-black"
                      : "text-stone-600 hover:bg-cream-100 hover:text-primary-700"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.nativeName}</span>
                  {active && (
                    <span className="ml-auto text-xs font-bold text-primary-700">
                      فعال
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="border-t border-cream-100 mt-2 pt-2 px-4">
            <button
              onClick={switchRouteLang}
              className="w-full flex items-center justify-between px-2 py-2 text-sm text-primary-700 hover:bg-primary-50 rounded-xl transition"
            >
              <span>تغيير مسار الصفحة ({routeLang === "ar" ? "إنجليزية" : "عربية"})</span>
              <span className="text-xs">{routeLang === "ar" ? "en" : "ar"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// نسخة مدمجة للهيدر
export function LanguageSwitcherCompact() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/");
  const routeLang = segments[1] === "en" ? "en" : "ar";

  const [uiLang, setUiLang] = useState<Lang | AllLang>(() => {
    if (typeof window === "undefined") return "ar";
    const saved = localStorage.getItem("ismail-ui-lang");
    return saved && CLIENT_LANGUAGES.some((l) => l.code === saved)
      ? (saved as Lang)
      : "ar";
  });

  const switchLanguage = (code: string) => {
    setUiLang(code as Lang);
    localStorage.setItem("ismail-ui-lang", code);
  };

  const switchRouteLang = () => {
    const targetRouteLang = routeLang === "ar" ? "en" : "ar";
    const restOfPath = segments.slice(2).join("/");
    router.push(`/${targetRouteLang}${restOfPath ? `/${restOfPath}` : ""}`);
  };

  return (
    <div className="relative group">
      <button
        onClick={() => switchRouteLang()}
        className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-slate-600 dark:text-slate-300"
        aria-label="تغيير مسار الصفحة"
      >
        {routeLang === "ar" ? "EN" : "ع"}
      </button>

      <button
        onClick={() => {}}
        className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-slate-600 dark:text-slate-300 group-focus-within:outline-none"
        aria-label="قائمة اللغات"
      >
        {CLIENT_LANGUAGES.find((l) => l.code === uiLang)?.flag || "🌐"}
      </button>

      {/* قائمة لغات واجهة المستخدم (منبثقة عند التمرير أو النقر) */}
      <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-cream-200 bg-white shadow-xl z-50 py-2 opacity-0 translate-y-2 pointer-events-none group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto transition-all">
        <div className="px-4 py-2 text-xs font-bold text-primary-700 uppercase tracking-wider">
          واجهة المستخدم
        </div>
        <div className="py-1">
          {CLIENT_LANGUAGES.map((lang) => {
            const active = uiLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition ${
                  active
                    ? "bg-primary-50 text-primary-800 font-black"
                    : "text-stone-600 hover:bg-cream-100 hover:text-primary-700"
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.nativeName}</span>
                {active && (
                  <span className="ml-auto text-xs font-bold text-primary-700">
                    فعال
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
