"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("✅ Service Worker registered:", reg.scope);
            
            // طلب إذن الإشعارات
            if ("Notification" in window && Notification.permission === "default") {
              setTimeout(() => {
                Notification.requestPermission();
              }, 5000);
            }
          })
          .catch((err) => console.error("❌ SW registration failed:", err));
      });
    }
  }, []);

  return null;
}