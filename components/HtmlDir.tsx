"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function HtmlDir() {
  const pathname = usePathname();

  useEffect(() => {
    // 1️⃣ استخراج اللغة من أول جزء في الرابط
    // مثال: /ar/quran  →  ar
    // مثال: /en/adhkar →  en
    const segment = pathname.split("/")[1];
    const isEnglish = segment === "en";
    // أي مسار آخر (مثل /admin) يبقى عربيًا افتراضيًا.
    const lang = isEnglish ? "en" : "ar";

    // 2️⃣ ضبط الاتجاه واللغة على مستوى الصفحة كلها
    document.documentElement.dir = isEnglish ? "ltr" : "rtl";
    document.documentElement.lang = lang;

    // 3️⃣ تطبيق الوضع الليلي المحفوظ
    // لو المستخدم اختار الوضع الليلي قبل كده، أو نظامه بيستخدمه افتراضياً
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      if (saved === "dark" || (!saved && prefersDark)) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // لو الـ localStorage مش متاح (مثلاً في وضع التصفح الخاص)
      // مش هنكسر الصفحة، بس مش هنحفظ التفضيل
    }
  }, [pathname]);

  // المكوّن ده مش بيرسم أي حاجة في الصفحة
  // هو بس بيشتغل في الخلفية عشان يظبط الـ dir والـ theme
  return null;
}