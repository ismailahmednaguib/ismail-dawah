"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Settings } from "@/lib/data";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { t, type Lang } from "@/lib/i18n";

export default function Header({ settings, lang = "ar" }: { settings: Settings; lang?: Lang }) {
  const [dark, setDark] = useState(false);
  const tr = t(lang);

  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/95 dark:bg-gray-900/95 backdrop-blur border-b border-black/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href={`/${lang}`} className="flex items-center gap-3">
          <span className="w-10 h-10 bg-primary text-gold rounded-full grid place-items-center font-serif text-xl font-bold">إ</span>
          <span>
            <span className="block font-bold text-primary dark:text-white text-sm leading-tight">{settings.shortName}</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">{settings.jobTitle.split("•")[0]}</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/${lang}`} className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-primary dark:text-white hover:text-gold transition px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gold/30">
            🏠 {tr.home}
          </Link>
          <LanguageSwitcher current={lang} />
          <button onClick={toggleDark} aria-label="Toggle theme" className="text-xl w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-gold/30 grid place-items-center">
            {dark ? "☀️" : "🌙"}
          </button>
          {/* لينك مخفي للـ admin - يظهر بس لما تعمل hover على النقطة */}
          <Link href="/admin" title="لوحة التحكم" className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gold hover:w-6 hover:h-6 transition-all duration-300 opacity-50 hover:opacity-100"></Link>
        </div>
      </div>
    </header>
  );
}