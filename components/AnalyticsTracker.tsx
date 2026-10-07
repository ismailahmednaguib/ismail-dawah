"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const lang = pathname.split("/")[1] || "ar";
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: pathname,
        lang,
        referrer: document.referrer,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}