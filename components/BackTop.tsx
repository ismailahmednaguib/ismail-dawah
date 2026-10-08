"use client";

import { useEffect, useState } from "react";

export default function BackTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setVisible(scrollTop > 400);
      setProgress(Math.min(scrollPercent, 100));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  // محيط الدائرة = 2 × π × نصف القطر (18)
  const circumference = 2 * Math.PI * 18;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      aria-label="العودة للأعلى"
      className="fixed bottom-6 end-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 animate-fade-in"
      style={{
        background: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
        boxShadow: "0 8px 30px -6px rgba(6, 182, 212, 0.5)",
      }}
    >
      {/* شريط التقدم الدائري */}
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 40 40"
      >
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="#d4af37"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-150"
        />
      </svg>

      {/* السهم */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}