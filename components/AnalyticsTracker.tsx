"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

// ===== إعدادات التتبع =====
const TRACK_ENDPOINT = "/api/analytics/track";
const STORAGE_KEY_OPT_OUT = "analytics_opt_out";
const STORAGE_KEY_SESSION = "analytics_session_id";

// ===== إنشاء معرف جلسة فريد =====
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  
  try {
    let sessionId = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem(STORAGE_KEY_SESSION, sessionId);
    }
    return sessionId;
  } catch {
    return "";
  }
}

// ===== التحقق من موافقة المستخدم =====
function isTrackingAllowed(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    return localStorage.getItem(STORAGE_KEY_OPT_OUT) !== "true";
  } catch {
    return true;
  }
}

// ===== إرسال البيانات للسيرفر =====
function sendToServer(payload: Record<string, unknown>): void {
  try {
    const body = JSON.stringify(payload);
    
    // sendBeacon أفضل للـ analytics لأنه:
    // 1. مش بيأثر على أداء الصفحة
    // 2. بيشتغل حتى لو المستخدم قفل الصفحة
    // 3. مش بيمنع التنقل
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(
        TRACK_ENDPOINT,
        new Blob([body], { type: "application/json" })
      );
      
      // لو sendBeacon فشل، نستخدم fetch
      if (!sent) {
        fallbackFetch(body);
      }
    } else {
      fallbackFetch(body);
    }
  } catch (error) {
    // لا نكسر التطبيق لو فشل التتبع
    if (process.env.NODE_ENV === "development") {
      console.warn("[Analytics] Tracking failed:", error);
    }
  }
}

// ===== fetch كخطة بديلة =====
function fallbackFetch(body: string): void {
  fetch(TRACK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true, // عشان يشتغل حتى لو الصفحة بتقفل
  }).catch(() => {
    // نتجاهل الأخطاء في الـ analytics
  });
}

// ===== جمع معلومات أساسية =====
function getCommonData(): Record<string, unknown> {
  return {
    timestamp: Date.now(),
    sessionId: getSessionId(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    language: typeof navigator !== "undefined" ? navigator.language : "",
    screen:
      typeof window !== "undefined"
        ? {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth,
          }
        : null,
    viewport:
      typeof window !== "undefined"
        ? {
            width: window.innerWidth,
            height: window.innerHeight,
          }
        : null,
  };
}

// ===== تتبع زيارة الصفحة =====
export function trackPageView(path: string, query?: string): void {
  if (!isTrackingAllowed()) return;
  
  const payload = {
    type: "page_view",
    path,
    query: query || "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
    ...getCommonData(),
  };

  sendToServer(payload);
}

// ===== تتبع حدث مخصص =====
// مثال: trackEvent("button_click", { button: "subscribe", location: "footer" })
export function trackEvent(
  eventName: string,
  eventData?: Record<string, unknown>
): void {
  if (!isTrackingAllowed()) return;
  
  const payload = {
    type: "event",
    event: eventName,
    data: eventData || {},
    path: typeof window !== "undefined" ? window.location.pathname : "",
    ...getCommonData(),
  };

  sendToServer(payload);
}

// ===== تتبع مدة البقاء في الصفحة =====
function useTrackTimeOnPage(path: string): void {
  useEffect(() => {
    if (!isTrackingAllowed()) return;

    const startTime = Date.now();
    let lastActivityTime = startTime;

    // تحديث وقت آخر نشاط
    const updateActivity = () => {
      lastActivityTime = Date.now();
    };

    const events: (keyof WindowEventMap)[] = [
      "click",
      "scroll",
      "keypress",
      "mousemove",
      "touchstart",
    ];

    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // إرسال مدة البقاء عند مغادرة الصفحة
    const sendTimeOnPage = () => {
      const timeSpent = lastActivityTime - startTime;
      
      // نتجاهل الزيارات الأقل من ثانية (غالباً بوتات)
      if (timeSpent > 1000) {
        sendToServer({
          type: "time_on_page",
          path,
          duration: timeSpent,
          ...getCommonData(),
        });
      }
    };

    window.addEventListener("beforeunload", sendTimeOnPage);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        sendTimeOnPage();
      }
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      window.removeEventListener("beforeunload", sendTimeOnPage);
    };
  }, [path]);
}

// ===== المكوّن الداخلي =====
function AnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // تتبع زيارة الصفحة عند تغيير المسار
  useEffect(() => {
    // نتجاهل مسارات الـ admin والـ API
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/setup-admin")
    ) {
      return;
    }

    trackPageView(pathname, searchParams.toString());
  }, [pathname, searchParams]);

  // تتبع مدة البقاء
  useTrackTimeOnPage(pathname);

  // المكوّن ده مش بيرسم أي حاجة
  return null;
}

// ===== المكوّن الرئيسي =====
export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerInner />
    </Suspense>
  );
}

// ===== دوال مساعدة للخصوصية =====

// إيقاف التتبع
export function optOutAnalytics(): void {
  try {
    localStorage.setItem(STORAGE_KEY_OPT_OUT, "true");
  } catch {
    // تجاهل الأخطاء
  }
}

// تفعيل التتبع
export function optInAnalytics(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_OPT_OUT);
  } catch {
    // تجاهل الأخطاء
  }
}

// التحقق من حالة التتبع
export function isAnalyticsOptedOut(): boolean {
  return !isTrackingAllowed();
}