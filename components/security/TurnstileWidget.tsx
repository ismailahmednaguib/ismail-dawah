"use client";

// components/security/TurnstileWidget.tsx
// واجهة Cloudflare Turnstile الاختيارية. لا تُعرض شيئًا إذا لم يُضبط مفتاح الموقع.
// عند وجود المفتاح: تُحمَّل السكربت مرة واحدة، ويُرسل الرمز إلى النموذج الأب.

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type Props = {
  lang: "ar" | "en";
  onToken: (token: string | null) => void;
  className?: string;
};

const SITE_KEY = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim();

export default function TurnstileWidget({ lang, onToken, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!SITE_KEY || !ready || !containerRef.current || !window.turnstile) {
      return;
    }

    const container = containerRef.current;
    container.replaceChildren();

    try {
      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: SITE_KEY,
        language: lang === "ar" ? "ar" : "en",
        theme: "auto",
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => {
          setFailed(true);
          onTokenRef.current(null);
        },
      });
    } catch (error) {
      console.error("[Turnstile] render error:", error);
      setFailed(true);
      onTokenRef.current(null);
    }

    return () => {
      const id = widgetIdRef.current;
      widgetIdRef.current = null;

      if (id && window.turnstile) {
        try {
          window.turnstile.remove(id);
        } catch {
          // قد تكون Cloudflare أزالت العنصر عند تغيير الصفحة.
        }
      }
    };
  }, [lang, ready]);

  if (!SITE_KEY) {
    return null;
  }

  return (
    <div className={className}>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => setFailed(true)}
      />

      <div ref={containerRef} />

      {failed && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {lang === "ar"
            ? "تعذّر تحميل التحقق الأمني. حدّث الصفحة أو عطّل مانع الإعلانات."
            : "Could not load the security check. Refresh the page or disable your ad blocker."}
        </p>
      )}
    </div>
  );
}
