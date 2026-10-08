"use client";

import { useEffect, useState } from "react";

const SW_URL = "/sw.js";

interface UpdateState {
  updateAvailable: boolean;
  waitingWorker: ServiceWorker | null;
}

export default function SWRegister() {
  const [update, setUpdate] = useState<UpdateState>({
    updateAvailable: false,
    waitingWorker: null,
  });

  useEffect(() => {
    // بنسجل الـ SW بس لو المتصفح بيدعمه والصفحة آمنة (HTTPS أو localhost)
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register(SW_URL, {
          scope: "/",
        });

        // ===== فحص التحديثات فور التسجيل =====
        checkForUpdate(registration);

        // ===== فحص دوري كل ساعة =====
        const interval = setInterval(() => {
          if (registration) {
            registration.update().catch(console.error);
          }
        }, 60 * 60 * 1000);

        // ===== لما يكون فيه SW جديد مستني التفعيل =====
        registration.addEventListener("updatefound", () => {
          const newWorker = registration?.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller // فيه نسخة قديمة شغالة
            ) {
              setUpdate({ updateAvailable: true, waitingWorker: newWorker });
            }
          });
        });

        // ===== لو كان فيه SW مستني من زيارة سابقة =====
        if (registration.waiting && navigator.serviceWorker.controller) {
          setUpdate({
            updateAvailable: true,
            waitingWorker: registration.waiting,
          });
        }

        return () => clearInterval(interval);
      } catch (error) {
        // التسجيل فشل — مش هنكسر التطبيق
        console.error("SW registration failed:", error);
      }
    };

    // ===== ننتظر لما الصفحة تخلص تحميل عشان ما نبوظش الأداء =====
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  // ===== تفعيل التحديث الجديد =====
  const applyUpdate = () => {
    if (!update.waitingWorker) return;

    // بنقول للـ SW الجديد: ابدأ اشتغل دلوقتي
    update.waitingWorker.postMessage({ type: "SKIP_WAITING" });

    // بنعمل ريلود عشان الصفحة الجديدة تشتغل
    window.location.reload();
  };

  // لو مفيش تحديث، مش بنعرض حاجة
  if (!update.updateAvailable) {
    return null;
  }

  // ===== إشعار التحديث =====
  return (
    <div
      dir="rtl"
      className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 animate-slide-up"
    >
      <div className="glass flex items-center gap-3 rounded-2xl border border-primary-200 px-5 py-3 shadow-xl dark:border-primary-700">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </span>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          نسخة جديدة من الموقع متاحة
        </p>
        <button
          onClick={applyUpdate}
          className="rounded-xl bg-gradient-to-l from-primary-500 to-primary-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
        >
          تحديث الآن
        </button>
      </div>
    </div>
  );
}