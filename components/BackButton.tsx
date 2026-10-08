"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({
  href,
  label,
  className = "",
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  // استخراج اللغة من المسار الحالي
  const lang = pathname.split("/")[1] === "en" ? "en" : "ar";
  const isRTL = lang === "ar";

  // النص الافتراضي حسب اللغة
  const defaultLabel = label || (lang === "ar" ? "رجوع" : "Back");

  // لو فيه رابط محدد، استخدمه — غير كده ارجع للصفحة السابقة
  const handleBack = () => {
    if (href) {
      router.push(href);
    } else if (window.history.length > 2) {
      router.back();
    } else {
      // لو مفيش تاريخ تصفح، ارجع للرئيسية
      router.push(`/${lang}`);
    }
  };

  // لو فيه href، استخدم Link — غير كده استخدم button
  if (href) {
    return (
      <Link
        href={href}
        className={`group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-primary-50 hover:text-primary-700 dark:bg-night-800 dark:text-slate-200 dark:hover:bg-night-700 dark:hover:text-primary-300 ${className}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 group-hover:-translate-x-1 ${
            isRTL ? "rotate-180" : ""
          }`}
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {defaultLabel}
      </Link>
    );
  }

  return (
    <button
      onClick={handleBack}
      className={`group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-primary-50 hover:text-primary-700 dark:bg-night-800 dark:text-slate-200 dark:hover:bg-night-700 dark:hover:text-primary-300 ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-300 group-hover:-translate-x-1 ${
          isRTL ? "rotate-180" : ""
        }`}
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {defaultLabel}
    </button>
  );
}

// ===== نسخة أصغر للاستخدام في الأماكن الضيقة =====
export function BackButtonCompact({
  href,
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const lang = pathname.split("/")[1] === "en" ? "en" : "ar";
  const isRTL = lang === "ar";

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else if (window.history.length > 2) {
      router.back();
    } else {
      router.push(`/${lang}`);
    }
  };

  return (
    <button
      onClick={handleBack}
      aria-label={lang === "ar" ? "رجوع" : "Back"}
      className={`group flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition-all duration-300 hover:bg-primary-50 hover:text-primary-700 dark:bg-night-800 dark:text-slate-300 dark:hover:bg-night-700 dark:hover:text-primary-300 ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-300 group-hover:-translate-x-0.5 ${
          isRTL ? "rotate-180" : ""
        }`}
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

// ===== نسخة شفافة للاستخدام فوق الخلفيات الملونة =====
export function BackButtonTransparent({
  href,
  label,
  className = "",
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const lang = pathname.split("/")[1] === "en" ? "en" : "ar";
  const isRTL = lang === "ar";
  const defaultLabel = label || (lang === "ar" ? "رجوع" : "Back");

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else if (window.history.length > 2) {
      router.back();
    } else {
      router.push(`/${lang}`);
    }
  };

  if (href) {
    return (
      <Link
        href={href}
        className={`group inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 ${className}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 group-hover:-translate-x-1 ${
            isRTL ? "rotate-180" : ""
          }`}
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {defaultLabel}
      </Link>
    );
  }

  return (
    <button
      onClick={handleBack}
      className={`group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-300 group-hover:-translate-x-1 ${
          isRTL ? "rotate-180" : ""
        }`}
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {defaultLabel}
    </button>
  );
}