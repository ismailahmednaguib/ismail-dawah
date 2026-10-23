// lib/scheduled-publishing.ts
// منطق نقي لجدولة النشر: تطبيع الموعد والتحقق من استحقاقه.
// بلا استيرادات — قابل للاختبار بمُشغّل Node المدمج.

/** أقل مهلة مسموحة بين الآن وموعد الجدولة (دقيقة). */
export const SCHEDULE_MIN_LEAD_MS = 60_000;

/**
 * يحوّل قيمة `scheduled_at` القادمة من الواجهة إلى ISO UTC.
 * يرفض القيم غير الصالحة أو الماضية أو القريبة جدًّا.
 */
export function normalizeScheduledAt(
  value: unknown,
  now: Date = new Date()
): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('حدّد تاريخ ووقت النشر.');
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    throw new Error('تاريخ الجدولة غير صالح.');
  }

  if (date.getTime() < now.getTime() + SCHEDULE_MIN_LEAD_MS) {
    throw new Error('موعد الجدولة يجب أن يكون بعد دقيقة على الأقل من الآن.');
  }

  return date.toISOString();
}

/** هل حان وقت نشر هذا الموعد؟ */
export function isScheduledDue(
  value: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (typeof value !== 'string' || !value.trim()) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() <= now.getTime();
}
