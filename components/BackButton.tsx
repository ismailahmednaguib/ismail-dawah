"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  href?: string;
  label?: string;
};

export default function BackButton({ href, label = "← العودة" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // لو فيه href محدد، روح عليه
    if (href) {
      router.push(href);
      return;
    }
    
    // لو فيه history كويس، ارجع
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    
    // غير كده، روح للرئيسية
    const lang = window.location.pathname.split("/")[1] || "ar";
    router.push(`/${lang}`);
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-300 hover:border-gold hover:text-gold transition shadow-sm mb-6"
    >
      <span className="text-lg">←</span>
      <span>{label}</span>
    </button>
  );
}