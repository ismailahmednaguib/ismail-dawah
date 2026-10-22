// قراءة إعداد نصّي مترجم من `site_settings` بشكل موحّد.
// القيمة قد تكون:
//   - كائنًا مترجمًا `{ ar, en }` (الصيغة الحديثة)
//   - نصًّا مفردًا (الصيغة القديمة أو إعداد غير مترجم)
// ونمنع تسريب نص عربي إلى الواجهة الإنجليزية.
import type { Lang } from "./i18n";

export function readSettingText(
  value: unknown,
  lang: Lang,
  fallback: string
): string {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const localized = (value as Record<string, unknown>)[lang];
    if (typeof localized === "string" && localized.trim()) {
      return localized.trim();
    }
  }

  if (typeof value === "string" && value.trim()) {
    const text = value.trim();
    if (lang === "en" && /[\u0600-\u06FF]/.test(text)) {
      return fallback;
    }
    return text;
  }

  return fallback;
}
