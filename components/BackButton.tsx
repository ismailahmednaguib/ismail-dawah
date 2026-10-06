"use client";

import Link from "next/link";

export default function BackButton({ href = "/", label }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-primary dark:text-white hover:text-gold font-bold text-sm mb-6 transition group"
    >
      <span className="grid place-items-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gold/40 group-hover:border-gold shadow-sm transition">→</span>
      {label}
    </Link>
  );
}