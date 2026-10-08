"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BookmarkItem {
  id: string;
  title: string;
  href: string;
  type: string;
}

interface BookmarkButtonProps {
  item: BookmarkItem;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function BookmarkButton({
  item,
  size = "md",
  showLabel = false,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const STORAGE_KEY = "dawah_bookmarks";

  // تحميل حالة الحفظ من الـ localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const bookmarks: BookmarkItem[] = JSON.parse(stored);
        setIsBookmarked(bookmarks.some((b) => b.id === item.id));
      }
    } catch (error) {
      console.error("Error reading bookmarks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [item.id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let bookmarks: BookmarkItem[] = stored ? JSON.parse(stored) : [];

      if (isBookmarked) {
        // إزالة من المحفوظات
        bookmarks = bookmarks.filter((b) => b.id !== item.id);
        setIsBookmarked(false);
      } else {
        // إضافة للمحفوظات
        bookmarks.push({
          ...item,
          id: item.id,
        });
        setIsBookmarked(true);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error("Error saving bookmark:", error);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  if (isLoading) {
    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-xl bg-slate-100 dark:bg-night-800 animate-pulse`}
      />
    );
  }

  return (
    <button
      onClick={toggleBookmark}
      className={`
        ${sizeClasses[size]} 
        group relative flex items-center justify-center rounded-xl
        transition-all duration-300
        ${
          isBookmarked
            ? "bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 shadow-gold"
            : "bg-slate-100 dark:bg-night-800 text-slate-400 dark:text-slate-500 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400"
        }
      `}
      title={isBookmarked ? "إزالة من المحفوظات" : "حفظ في المحفوظات"}
    >
      <svg
        width={iconSize[size]}
        height={iconSize[size]}
        viewBox="0 0 24 24"
        fill={isBookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-300 ${
          isBookmarked ? "scale-110" : "group-hover:scale-110"
        }`}
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>

      {/* Tooltip */}
      <span
        className={`
          absolute -top-10 left-1/2 -translate-x-1/2
          whitespace-nowrap rounded-lg px-3 py-1.5
          text-xs font-medium
          bg-slate-900 text-white dark:bg-white dark:text-slate-900
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none
        `}
      >
        {isBookmarked ? "محفوظ ✓" : "حفظ"}
      </span>

      {/* Ripple effect */}
      {isBookmarked && (
        <span className="absolute inset-0 rounded-xl animate-ping bg-gold-400/20 pointer-events-none" />
      )}
    </button>
  );
}

// مكوّن مساعد لعرض عدد المحفوظات
export function BookmarkCount({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const stored = localStorage.getItem("dawah_bookmarks");
        if (stored) {
          setCount(JSON.parse(stored).length);
        }
      } catch {}
    };

    updateCount();

    // الاستماع لتغييرات الـ storage
    window.addEventListener("storage", updateCount);

    return () => window.removeEventListener("storage", updateCount);
  }, []);

  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-gold-500 px-2 py-0.5 text-xs font-bold text-white ${className}`}>
      {count}
    </span>
  );
}

// مكوّن رابط لصفحة المحفوظات
export function BookmarkLink({ lang }: { lang: string }) {
  return (
    <Link
      href={`/${lang}/bookmarks`}
      className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      <span className="hidden sm:inline">المحفوظات</span>
      <BookmarkCount />
    </Link>
  );
}