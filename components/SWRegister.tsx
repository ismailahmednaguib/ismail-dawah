// components/SWRegister.tsx
"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    let updateInterval: ReturnType<typeof setInterval> | null = null;
    let active = true;

    const checkForUpdate = async (
      registration?: ServiceWorkerRegistration | null
    ) => {
      try {
        const reg =
          registration ?? (await navigator.serviceWorker.getRegistration());

        if (!reg) {
          return;
        }

        await reg.update();
      } catch (error) {
        console.warn("[SWRegister] update check failed:", error);
      }
    };

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (!active) {
          return;
        }

        await checkForUpdate(registration);

        updateInterval = setInterval(() => {
          void checkForUpdate(registration);
        }, 60 * 60 * 1000); // كل ساعة
      } catch (error) {
        console.warn("[SWRegister] registration failed:", error);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string } | undefined;

      if (data?.type === "SW_UPDATED" || data?.type === "SKIP_WAITING") {
        console.info("[SWRegister] service worker update message received");
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    void registerServiceWorker();

    return () => {
      active = false;

      if (updateInterval) {
        clearInterval(updateInterval);
      }

      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  return null;
}