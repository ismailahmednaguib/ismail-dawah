"use client";

import { useEffect, useState } from "react";

export default function BackTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="العودة للأعلى"
      className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-gold text-primary text-xl font-black shadow-xl hover:scale-110 transition"
    >
      ↑
    </button>
  );
}