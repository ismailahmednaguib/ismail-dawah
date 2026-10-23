"use client";

import { useEffect, useState } from "react";
import { BellIcon } from "@/lib/icons";
import type { Lang } from "@/lib/i18n";

type Props = { lang: Lang };
type State = "loading" | "ready" | "subscribed" | "blocked" | "hidden" | "error";

type ConfigResponse = {
  configured?: boolean;
  publicKey?: string | null;
};

function decodeBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

export default function PushNotificationPrompt({ lang }: Props) {
  const isArabic = lang === "ar";
  const [state, setState] = useState<State>("loading");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setState("hidden");
        return;
      }

      try {
        const response = await fetch("/api/notifications/subscribe", { cache: "no-store" });
        const config = (await response.json().catch(() => ({}))) as ConfigResponse;
        if (!active || !response.ok || !config.configured || !config.publicKey) {
          if (active) setState("hidden");
          return;
        }

        setPublicKey(config.publicKey);
        if (Notification.permission === "denied") {
          setState("blocked");
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (active) setState(subscription ? "subscribed" : "ready");
      } catch {
        if (active) setState("hidden");
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  async function subscribe() {
    if (!publicKey) return;
    setBusy(true);
    setMessage("");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("blocked");
        setMessage(isArabic ? "لم يتم السماح بالإشعارات من المتصفح." : "Notifications were not allowed by the browser.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeBase64Url(publicKey),
      });

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || payload.ok === false) throw new Error(payload.error || "subscription_failed");

      setState("subscribed");
      setMessage(isArabic ? "تم تفعيل إشعارات المنصة." : "Platform notifications are enabled.");
    } catch (error) {
      console.error("[PushNotificationPrompt] subscribe failed:", error);
      setState("error");
      setMessage(isArabic ? "تعذر تفعيل الإشعارات حاليًا. حاول مرة أخرى." : "Notifications could not be enabled right now. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    setMessage("");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        setState("ready");
        return;
      }

      const response = await fetch("/api/notifications/subscribe", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      if (!response.ok) throw new Error("unsubscribe_failed");

      await subscription.unsubscribe();
      setState("ready");
      setMessage(isArabic ? "تم إيقاف إشعارات المنصة." : "Platform notifications are disabled.");
    } catch (error) {
      console.error("[PushNotificationPrompt] unsubscribe failed:", error);
      setState("error");
      setMessage(isArabic ? "تعذر إيقاف الإشعارات حاليًا." : "Notifications could not be disabled right now.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading" || state === "hidden") return null;

  const title = isArabic ? "إشعارات المنصة" : "Platform notifications";
  const description = isArabic
    ? "فعّل الإشعارات ليصلك الجديد من الدروس والمواد المنشورة."
    : "Enable notifications to receive new lessons and published content.";

  return (
    <section className="container-page pb-4" aria-live="polite">
      <div className="card flex flex-col gap-4 border-primary-200 bg-primary-50/70 p-5 md:flex-row md:items-center md:justify-between dark:border-primary-800 dark:bg-primary-950/20">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-700 text-white dark:bg-primary-500">
            <BellIcon size={22} />
          </span>
          <div>
            <h2 className="font-black text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
            {state === "blocked" ? (
              <p className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                {isArabic ? "الإشعارات محجوبة من إعدادات المتصفح." : "Notifications are blocked in the browser settings."}
              </p>
            ) : null}
            {message ? <p className="mt-2 text-xs font-bold text-primary-700 dark:text-primary-300">{message}</p> : null}
          </div>
        </div>

        {state === "subscribed" ? (
          <button type="button" onClick={() => void unsubscribe()} disabled={busy} className="btn-outline shrink-0 disabled:opacity-60">
            {busy ? "..." : isArabic ? "إيقاف الإشعارات" : "Disable notifications"}
          </button>
        ) : state !== "blocked" ? (
          <button type="button" onClick={() => void subscribe()} disabled={busy} className="btn-primary shrink-0 disabled:opacity-60">
            {busy ? "..." : isArabic ? "تفعيل الإشعارات" : "Enable notifications"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
