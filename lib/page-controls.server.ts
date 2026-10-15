// lib/page-controls.server.ts
// قراءة إعدادات الأقسام/الظهور من قاعدة البيانات (للاستخدام في Server Components فقط).
import { getSiteSettings } from "./content";
import {
  buildPageControls,
  pageGate,
  type PageControls,
  type SectionGate,
} from "./page-sections";
import type { Lang } from "./i18n";

/** كل إعدادات التحكم في الأقسام والصفحات. */
export async function getPageControls(): Promise<PageControls> {
  try {
    const settings = await getSiteSettings();
    return buildPageControls((settings || {}) as Record<string, unknown>);
  } catch {
    return buildPageControls({});
  }
}

/** بوابة الأقسام لصفحة محدّدة. */
export async function getSectionGate(pageKey: string, lang: Lang): Promise<SectionGate> {
  const controls = await getPageControls();
  return pageGate(controls, pageKey, lang);
}
