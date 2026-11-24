export const DAWAH_INQUIRY_RETENTION_DAYS = 90;

export function getDawahInquiryRetentionCutoff(
  now = new Date(),
  retentionDays = DAWAH_INQUIRY_RETENTION_DAYS,
): Date {
  const safeDays = Number.isFinite(retentionDays) && retentionDays > 0 ? Math.floor(retentionDays) : DAWAH_INQUIRY_RETENTION_DAYS;
  return new Date(now.getTime() - safeDays * 24 * 60 * 60 * 1000);
}
