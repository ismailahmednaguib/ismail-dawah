// ============================================================
// فحص تغطية الترجمة الإنجليزية لحقول الإعدادات.
// ------------------------------------------------------------
// يُستخدم في لوحة التحكم لتنبيه المالك إلى الحقول التي لها قيمة
// عربية بلا قيمة إنجليزية مقابلة. المنطق نقي بلا استيرادات حتى
// يُختبر بمُشغّل Node مباشرة.
// ============================================================

export type CoverageField = {
  key: string;
  label: string;
  ar?: boolean;
  en?: boolean;
};

function nonEmptyText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * يعيد الحقول المترجمة التي تحتوي قيمة عربية غير فارغة ولا تحتوي
 * قيمة إنجليزية. الحقول غير المترجمة أو التي لا قيمة عربية لها
 * لا تُعدّ ناقصة.
 */
export function findMissingEnglishFields<T extends CoverageField>(
  fields: readonly T[],
  settings: Record<string, unknown>
): T[] {
  return fields.filter((field) => {
    if (!field.ar || !field.en) return false;

    const value = settings[field.key];
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return false;
    }

    const record = value as Record<string, unknown>;
    return (
      nonEmptyText(record.ar).length > 0 &&
      nonEmptyText(record.en).length === 0
    );
  });
}
