"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Settings } from "@/lib/data";

export default function Header({ settings }: { settings: Settings }) {
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
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-10 h-10 bg-primary text-gold rounded-full grid place-items-center font-serif text-xl font-bold">إ</span>
          <span>
            <span className="block font-bold text-primary text-sm leading-tight">{settings.shortName}</span>
            <span className="block text-xs text-gray-500">{settings.jobTitle.split("•")[0]}</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={toggleDark} aria-label="الوضع الليلي" className="text-xl">{dark ? "☀️" : "🌙"}</button>
        </div>
      </div>
    </header>
  );
}