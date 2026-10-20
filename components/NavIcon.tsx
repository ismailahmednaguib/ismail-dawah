// ============================================================
// NavIcon — أيقونات SVG للأبواب الرئيسية بدل الإيموجي.
// تُستخدم في بطاقات الرئيسية، وتترك احتياطيًا نصيًّا لأي باب بلا أيقونة.
// ============================================================

import type { ReactNode } from "react";

const PATHS: Record<string, ReactNode> = {
  quran: (
    <>
      <path d="M12 6.5C10.5 5.2 8.5 4.7 6 5v13c2.5-.3 4.5.2 6 1.5 1.5-1.3 3.5-1.8 6-1.5V5c-2.5-.3-4.5.2-6 1.5Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  sciences: (
    <>
      <path d="M4 6.5 12 3l8 3.5-8 3.5-8-3.5Z" />
      <path d="M4 11.5 12 15l8-3.5" />
      <path d="M4 16.5 12 20l8-3.5" />
    </>
  ),
  fatwa: (
    <>
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M7 7 4 14h6L7 7Z" />
      <path d="M17 7l-3 7h6l-3-7Z" />
      <path d="M8 21h8" />
    </>
  ),
  tools: (
    <>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-2.4 2.6-2.6Z" />
    </>
  ),
  responses: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  "non-muslim": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
    </>
  ),
};

export default function NavIcon({
  name,
  fallback,
  className = "h-7 w-7",
}: {
  name?: string;
  fallback?: string;
  className?: string;
}) {
  const icon = name ? PATHS[name] : undefined;

  if (!icon) {
    return (
      <span aria-hidden="true" className="text-3xl leading-none">
        {fallback}
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`${className} text-primary-700 dark:text-primary-300`}
    >
      {icon}
    </svg>
  );
}
