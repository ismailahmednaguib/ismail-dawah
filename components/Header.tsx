"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Settings } from "@/lib/data";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/about", label: "عن الشيخ" },
  { href: "/lessons", label: "الدروس" },
  { href: "/videos", label: "المرئيات" },
  { href: "/schedule", label: "الجدول" },
  { href: "/contact", label: "تواصل" },
];

export default function Header({ settings }: { settings: Settings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`text-sm font-semibold transition ${pathname === l.href ? "text-gold" : "text-gray-700 hover:text-gold"}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/admin" title="لوحة التحكم" className="text-xl">⚙️</Link>
        </nav>

        <button className="md:hidden text-2xl text-primary" onClick={() => setOpen(!open)} aria-label="القائمة">
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="md:hidden bg-cream border-t border-black/5 px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`font-semibold ${pathname === l.href ? "text-gold" : "text-gray-700"}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/admin" onClick={() => setOpen(false)} className="font-semibold text-primary">⚙️ لوحة التحكم</Link>
        </nav>
      )}
    </header>
  );
}