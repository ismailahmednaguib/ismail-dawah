"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { t, languages, type Lang } from "@/lib/i18n";

export default function Header({ lang }: { lang?: Lang }) {
  const params = useParams();
  const L = (lang || params?.lang || "ar") as Lang;
  const tr = t(L);
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => setLoggedIn(!!j.user))
      .catch(() => {});
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/95 dark:bg-gray-900/95 backdrop-blur border-b border-black/5 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* اللوجو */}
        <Link href={`/${L}`} className="flex items-center gap-2">
          <span className="w-10 h-10 bg-primary text-gold rounded-full grid place-items-center font-serif text-xl font-bold">إ</span>
          <span className="font-serif font-bold text-primary dark:text-gold hidden sm:block">الشيخ إسماعيل</span>
        </Link>

        {/* الروابط - ديسكتوب */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href={`/${L}`} className="px-3 py-2 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:text-gold transition">
            {tr.home}
          </Link>
          <Link href={`/${L}/about`} className="px-3 py-2 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:text-gold transition">
            {tr.about}
          </Link>
          <Link href={`/${L}/contact`} className="px-3 py-2 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:text-gold transition">
            {tr.contact}
          </Link>
          <Link
            href={`/${L}/account`}
            className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
              loggedIn
                ? "bg-gold/20 text-gold border border-gold/40"
                : "bg-primary/10 text-primary dark:text-gold hover:bg-primary/20"
            }`}
          >
            👤 {loggedIn ? tr.account : tr.login}
          </Link>
        </nav>

        {/* الأزرار */}
        <div className="flex items-center gap-2">
          {/* اختيار اللغة */}
          <select
            value={L}
            onChange={(e) => {
              const newLang = e.target.value;
              window.location.href = window.location.pathname.replace(`/${L}`, `/${newLang}`);
            }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm font-bold text-gray-600 dark:text-gray-300 focus:border-gold focus:outline-none cursor-pointer"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>

          {/* الوضع الليلي */}
          <button
            onClick={toggleDark}
            className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 grid place-items-center text-lg hover:border-gold transition"
            aria-label="الوضع الليلي"
          >
            {dark ? "☀️" : "🌙"}
          </button>

          {/* زرار القائمة - موبايل */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 grid place-items-center text-lg"
            aria-label="القائمة"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* القائمة - موبايل */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3 space-y-1">
          <Link href={`/${L}`} onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/10">
            {tr.home}
          </Link>
          <Link href={`/${L}/about`} onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/10">
            {tr.about}
          </Link>
          <Link href={`/${L}/contact`} onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/10">
            {tr.contact}
          </Link>
          <Link
            href={`/${L}/account`}
            onClick={() => setMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-bold ${loggedIn ? "bg-gold/20 text-gold" : "bg-primary/10 text-primary dark:text-gold"}`}
          >
            👤 {loggedIn ? tr.account : tr.login}
          </Link>
        </div>
      )}
    </header>
  );
}