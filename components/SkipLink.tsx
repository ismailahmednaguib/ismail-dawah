"use client";

import { usePathname } from "next/navigation";

/** رابط "تخطَّ إلى المحتوى" بلغة الصفحة الحالية. */
export default function SkipLink() {
  const pathname = usePathname() ?? "/";
  const isEn = pathname.split("/")[1] === "en";

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary-700 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
    >
      {isEn ? "Skip to content" : "تخطَّ إلى المحتوى"}
    </a>
  );
}
