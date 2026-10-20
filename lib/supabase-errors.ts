// lib/supabase-errors.ts
// أدوات نقيّة لتصنيف أخطاء Supabase/PostgREST — بلا استيرادات.

/** رسالة الخطأ كنص آمن. */
export function getErrorMessage(error: unknown): string {
  return String((error as { message?: unknown })?.message || error || "");
}

/**
 * هل الخطأ يعني أن الجدول غير موجود؟
 *
 * مهم: لا تعتمد على كلمة «relation» وحدها؛ خطأ القيد NOT NULL
 * يحمل الرسالة: `null value in column "x" of relation "users"`،
 * وكان تصنيفه جدولًا مفقودًا يوقف مسار التسجيل بالكامل.
 */
export function isMissingTableError(error: unknown): boolean {
  const code = String((error as { code?: unknown })?.code || "");
  const message = getErrorMessage(error);

  return (
    code === "42P01" ||
    /Could not find the table/i.test(message) ||
    /relation .* does not exist/i.test(message) ||
    /table .* does not exist/i.test(message)
  );
}
