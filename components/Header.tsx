"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Settings } from "@/lib/data";
import SearchBar from "./SearchBar";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/about", label: "عن الشيخ" },
  { href: "/lessons", label: "الدروس" },
  { href: "/articles", label: "المقالات" },
  { href: "/videos", label: "المرئيات" },
  { href: "/audio", label: "الصوتيات" },
  { href: "/gallery", label: "المعرض" },
  { href: "/schedule", label: "الجدول" },
  { href: "/contact", label: "تواصل" },
];

export default function Header({ settings }: { settings: Settings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

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
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-black/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="w-10 h-10 bg-primary text-gold rounded-full grid place-items-center font-serif text-xl font-bold">إ</span>
          <span className="hidden sm:block">
            <span className="block font-bold text-primary text-sm leading-tight">{settings.shortName}</span>
            <span className="block text-xs text-gray-500">{settings.jobTitle.split("•")[0]}</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`text-sm font-semibold transition ${pathname === l.href ? "text-gold" : "text-gray-700 hover:text-gold"}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SearchBar />
          <button onClick={toggleDark} aria-label="الوضع الليلي" className="text-xl">{dark ? "☀️" : "🌙"}</button>
          <Link href="/admin" title="لوحة التحكم" className="text-xl">⚙️</Link>
          <button className="lg:hidden text-2xl text-primary" onClick={() => setOpen(!open)} aria-label="القائمة">{open ? "✕" : "☰"}</button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden bg-cream border-t border-black/5 px-6 py-4 grid grid-cols-2 gap-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`font-semibold ${pathname === l.href ? "text-gold" : "text-gray-700"}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/admin" onClick={() => setOpen(false)} className="font-semibold text-primary">⚙️ لوحة التحكم</Link>
        </nav>
      )}
    </header>
  );
}