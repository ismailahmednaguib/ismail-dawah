// lib/questions/web.ts
// قرار نقي: هل الطلب من نموذج الويب الذي يعرض Turnstile؟
// الشرط الصارم `=== true` يمنع اعتبار القيم النصية أو الرقمية طلبات ويب،
// ويُبقي عملاء API الموثوقين خارج التحقق الاختياري.

export function isWebQuestionRequest(
  payload: Record<string, unknown> | null | undefined
): boolean {
  return payload?.web === true;
}
