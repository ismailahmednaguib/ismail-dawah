"use client";

// ============================================================
// بوابة الأقسام للصفحات التي تعمل في المتصفح (Client Components).
// تقرأ إعدادات إظهار/إخفاء الأقسام من /api/site-settings وتُرجع
// نفس واجهة SectionGate المستخدمة في الصفحات الخادمية.
// ============================================================

import { useEffect, useState } from "react";
import {
  buildPageControls,
  pageGate,
  type SectionGate,
} from "@/lib/page-sections";
import type { Lang } from "@/lib/i18n";

type Settings = Record<string, unknown>;

let cachedSettings: Settings | null = null;
let pending: Promise<Settings> | null = null;

function loadSettings(): Promise<Settings> {
  if (cachedSettings) return Promise.resolve(cachedSettings);
  if (!pending) {
    pending = fetch("/api/site-settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { settings: {} }))
      .then((data) => {
        const settings = (data?.settings ?? {}) as Settings;
        cachedSettings = settings;
        return settings;
      })
      .catch(() => ({} as Settings));
  }
  return pending;
}

const FALLBACK_GATE = pageGate(buildPageControls({}), "home", "ar");

/** بوابة أقسام لصفحة معيّنة في مكوّن يعمل من المتصفح. */
export function usePageGate(pageKey: string, lang: Lang): SectionGate {
  const [settings, setSettings] = useState<Settings | null>(cachedSettings);

  useEffect(() => {
    let active = true;
    loadSettings().then((value) => {
      if (active) setSettings(value);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!settings) return FALLBACK_GATE;
  return pageGate(buildPageControls(settings), pageKey, lang);
}

export default usePageGate;
