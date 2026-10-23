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
  /**
   * قيمة تتغيّر بعد كل إرسال لتوليد تحقق جديد.
   * رمز Turnstile يُستهلك مرة واحدة، فلا يُعاد استخدامه.
   */
  resetKey?: number;
};

const SITE_KEY = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim();

export default function TurnstileWidget({
  lang,
  onToken,
  className,
  resetKey = 0,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const onTokenRef = useRef(onToken);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  // عند تركيب عنصر جديد بعد تحميل السكربت مسبقًا (نموذجان في الصفحة نفسها،
  // أو إعادة تركيب) لا يُستدعى onReady مرة أخرى. نلتقط الجاهزية مباشرة.
  useEffect(() => {
    if (typeof window !== "undefined" && window.turnstile) {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!SITE_KEY || !ready || !containerRef.current || !window.turnstile) {
      return;
    }

    const container = containerRef.current;
    container.replaceChildren();
    setFailed(false);

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    const emitToken = (token: string | null) => {
      if (generationRef.current === generation) {
        onTokenRef.current(token);
      }
    };

    try {
      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: SITE_KEY,
        language: lang === "ar" ? "ar" : "en",
        theme: "auto",
        callback: (token: string) => emitToken(token),
        "expired-callback": () => emitToken(null),
        "error-callback": () => {
          if (generationRef.current === generation) {
            setFailed(true);
          }
          emitToken(null);
        },
      });
    } catch (error) {
      console.error("[Turnstile] render error:", error);
      setFailed(true);
      emitToken(null);
    }

    return () => {
      // أي callback متأخر من ودجت قديم لا يملك حق تعديل الرمز الحالي.
      if (generationRef.current === generation) {
        generationRef.current += 1;
      }

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
  }, [lang, ready, resetKey]);

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
        onLoad={() => setReady(true)}
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
