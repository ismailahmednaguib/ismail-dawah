"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);

  // استخراج اللغة الحالية من المسار
  const segments = pathname.split("/");
  const currentLang = segments[1] === "en" ? "en" : "ar";
  const targetLang = currentLang === "ar" ? "en" : "ar";

  // بناء المسار الجديد مع الحفاظ على الصفحة الحالية
  const getTargetPath = () => {
    const restOfPath = segments.slice(2).join("/");
    return `/${targetLang}${restOfPath ? `/${restOfPath}` : ""}`;
  };

  const switchLanguage = () => {
    if (isSwitching) return;
    setIsSwitching(true);
    
    const targetPath = getTargetPath();
    router.push(targetPath);
    
    // إعادة تعيين الحالة بعد التنقل
    setTimeout(() => setIsSwitching(false), 500);
  };

  return (
    <button
      onClick={switchLanguage}
      disabled={isSwitching}
      className={`
        group relative flex items-center gap-2 rounded-xl px-4 py-2.5
        font-semibold text-sm transition-all duration-300
        ${isSwitching 
          ? "opacity-60 cursor-wait" 
          : "hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300"
        }
        text-slate-700 dark:text-slate-200
      `}
      aria-label={currentLang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {/* أيقونة اللغة */}
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

      {/* نص اللغة */}
      <span className="hidden sm:inline">
        {currentLang === "ar" ? "English" : "العربية"}
      </span>

      {/* سهم صغير */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className={`transition-transform duration-300 ${isSwitching ? "animate-spin" : ""}`}
      >
        <path d="M7 17l9.2-9.2M17 17V7.8H7.8" />
      </svg>

      {/* مؤشر التحميل */}
      {isSwitching && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </span>
      )}
    </button>
  );
}

// نسخة مدمجة للاستخدام في الهيدر
export function LanguageSwitcherCompact() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);

  const segments = pathname.split("/");
  const currentLang = segments[1] === "en" ? "en" : "ar";
  const targetLang = currentLang === "ar" ? "en" : "ar";

  const getTargetPath = () => {
    const restOfPath = segments.slice(2).join("/");
    return `/${targetLang}${restOfPath ? `/${restOfPath}` : ""}`;
  };

  const switchLanguage = () => {
    if (isSwitching) return;
    setIsSwitching(true);
    router.push(getTargetPath());
    setTimeout(() => setIsSwitching(false), 500);
  };

  return (
    <button
      onClick={switchLanguage}
      disabled={isSwitching}
      className={`
        flex h-10 w-10 items-center justify-center rounded-xl
        transition-all duration-300
        ${isSwitching 
          ? "opacity-60 cursor-wait" 
          : "hover:bg-primary-50 dark:hover:bg-primary-900/30"
        }
        text-slate-600 dark:text-slate-300
      `}
      aria-label={currentLang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {isSwitching ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      ) : (
        <span className="text-sm font-bold">
          {currentLang === "ar" ? "EN" : "ع"}
        </span>
      )}
    </button>
  );
}