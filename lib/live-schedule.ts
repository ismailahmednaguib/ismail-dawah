// قراءة الجدول الأسبوعي من إعداد نصّي يحرّره الأدمن.
// كل سطر يمثّل درسًا واحدًا بالصيغة: اليوم | الوقت | الموضوع | المكان
// نفصل التحليل عن الصفحة حتى نختبره ونمنع تسريب العربية إلى الواجهة الإنجليزية.
import type { Lang } from "./i18n";

export type WeeklyScheduleEntry = {
  day: string;
  time: string;
  topic: string;
  place: string;
};

const ARABIC_TEXT = /[\u0600-\u06FF]/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * هل الإعداد موجود أصلًا؟ نعتبر `{ ar: "", en: "" }` إعدادًا محفوظًا
 * (أي أن الأدمن مسح الجدول عمدًا) فلا نعود للجدول القديم.
 */
export function hasWeeklyScheduleSetting(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (!isRecord(value)) return false;
  return "ar" in value || "en" in value;
}

/** يقرأ نص اللغة المطلوبة من قيمة قد تكون نصًّا أو كائنًا مترجمًا. */
export function readWeeklyScheduleText(value: unknown, lang: Lang): string {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  const localized = value[lang];
  return typeof localized === "string" ? localized : "";
}

/**
 * يحلّل سطور الجدول. السطر الصالح يحتاج اليوم والموضوع على الأقل،
 * والوقت والمكان اختياريان (تظهر البطاقة الحقول المتوفرة فقط).
 */
export function parseWeeklyScheduleText(
  text: unknown,
  lang: Lang
): WeeklyScheduleEntry[] {
  if (typeof text !== "string") return [];

  const entries: WeeklyScheduleEntry[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/^\s*[-*•]\s*/, "").trim();
    if (!line || line.startsWith("#")) continue;

    const parts = line.split("|").map((part) => part.trim());
    if (parts.length < 2) continue;

    const [day = "", time = "", topic = "", place = ""] = parts;
    if (!day || !topic) continue;

    // لا نعرض أي سطر يحتوي حروفًا عربية في الواجهة الإنجليزية.
    if (lang === "en" && ARABIC_TEXT.test([day, time, topic, place].join(" "))) {
      continue;
    }

    entries.push({ day, time, topic, place });
  }

  return entries;
}

export function parseWeeklySchedule(
  value: unknown,
  lang: Lang
): WeeklyScheduleEntry[] {
  return parseWeeklyScheduleText(readWeeklyScheduleText(value, lang), lang);
}

/**
 * يحوّل الجدول القديم (مصفوفة) إلى نص قابل للتحرير في اللوحة،
 * حتى يبدأ الأدمن من بياناته الحالية بدل كتابة كل شيء من الصفر.
 */
export function legacyScheduleToText(value: unknown, lang: Lang): string {
  const items = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value[lang])
      ? value[lang]
      : null;

  if (!items) return "";

  return items
    .map((item) => {
      if (!isRecord(item)) return "";

      const read = (field: unknown): string => {
        if (typeof field === "string") {
          const text = field.trim();
          return lang === "en" && ARABIC_TEXT.test(text) ? "" : text;
        }
        if (isRecord(field)) {
          const text = cleanText(field[lang]);
          return lang === "en" && ARABIC_TEXT.test(text) ? "" : text;
        }
        return "";
      };

      const day = read(item.day);
      const time = read(item.time);
      const topic = read(item.topic);
      const place = read(item.place);

      if (!day || !topic) return "";
      return [day, time, topic, place].join(" | ");
    })
    .filter(Boolean)
    .join("\n");
}
