"use client";

import { useEffect, useState } from "react";

type BookmarkData = {
  id: string;
  title: string;
  url: string;
  type: string;
  icon: string;
  addedAt: string;
};

export default function BookmarkButton({
  title,
  type,
  icon,
}: {
  title: string;
  type: string;
  icon: string;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const url = typeof window !== "undefined" ? window.location.pathname : "";
  const id = url;

  useEffect(() => {
    const saved = localStorage.getItem("bookmarks");
    if (saved) {
      const bookmarks: BookmarkData[] = JSON.parse(saved);
      setIsBookmarked(bookmarks.some(b => b.id === id));
    }
  }, [id]);

  const toggle = () => {
    const saved = localStorage.getItem("bookmarks");
    const bookmarks: BookmarkData[] = saved ? JSON.parse(saved) : [];

    if (isBookmarked) {
      const updated = bookmarks.filter(b => b.id !== id);
      localStorage.setItem("bookmarks", JSON.stringify(updated));
      setIsBookmarked(false);
    } else {
      bookmarks.unshift({
        id,
        title,
        url,
        type,
        icon,
        addedAt: new Date().toISOString(),
      });
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-20 left-4 w-14 h-14 rounded-full shadow-xl grid place-items-center text-2xl z-40 transition ${
        isBookmarked
          ? "bg-gold text-gray-900"
          : "bg-white dark:bg-gray-800 text-gray-500 hover:text-gold"
      }`}
      title={isBookmarked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
    >
      {isBookmarked ? "⭐" : "☆"}
    </button>
  );
}