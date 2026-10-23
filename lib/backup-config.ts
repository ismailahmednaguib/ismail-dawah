// lib/backup-config.ts
// منطق نقي لإعداد النسخ الاحتياطي: التطبيع، أسماء الملفات، وسياسة الاحتفاظ.
// بلا استيرادات — قابل للاختبار بمُشغّل Node المدمج.

/** مفتاح الإعداد في `site_settings`. */
export const BACKUP_SETTING_KEY = "backup";

/** اسم الحاوية الافتراضي في Supabase Storage (خاصة). */
export const DEFAULT_BACKUP_BUCKET = "backups";

export type BackupConfig = {
  /** إن كان false يتوقف الـ cron اليومي، ويبقى التشغيل اليدوي متاحًا. */
  enabled: boolean;
  /** عدد الأيام التي تُحفظ فيها النسخ. */
  retentionDays: number;
  /** سقف عدد النسخ المحفوظة، حتى لو كانت داخل المدة. */
  maxFiles: number;
};

export const DEFAULT_BACKUP_CONFIG: BackupConfig = {
  enabled: false,
  retentionDays: 14,
  maxFiles: 30,
};

function integerInRange(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

/** يطبّع قيمة الإعداد القادمة من قاعدة البيانات أو من اللوحة. */
export function normalizeBackupConfig(value: unknown): BackupConfig {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return {
    enabled:
      typeof source.enabled === "boolean"
        ? source.enabled
        : DEFAULT_BACKUP_CONFIG.enabled,
    retentionDays: integerInRange(
      source.retentionDays,
      DEFAULT_BACKUP_CONFIG.retentionDays,
      1,
      365
    ),
    maxFiles: integerInRange(
      source.maxFiles,
      DEFAULT_BACKUP_CONFIG.maxFiles,
      1,
      365
    ),
  };
}

/** مسار النسخة اليومية: daily/2026-10-23T12-34-56Z.json */
export function buildBackupPath(now: Date = new Date()): string {
  const iso = now.toISOString().slice(0, 19).replace(/:/g, "-");
  return `daily/${iso}Z.json`;
}

const BACKUP_NAME_PATTERN =
  /^daily\/(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})Z\.json$/;

/** يستخرج تاريخ النسخة من اسمها؛ يعيد null للأسماء غير المتوقعة. */
export function parseBackupDate(name: string): Date | null {
  const match = BACKUP_NAME_PATTERN.exec(name);
  if (!match) return null;

  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )
  );

  return Number.isFinite(date.getTime()) ? date : null;
}

/**
 * يحدد النسخ التي يجب حذفها.
 * - يحتفظ بأحدث `maxFiles` نسخة دائمًا.
 * - ويحذف ما تجاوز `retentionDays` حتى لو كان داخل السقف.
 * - يتجاهل أي اسم لا يطابق نمط النسخة اليومية (لا يحذف مجلدات أخرى).
 */
export function selectExpiredBackupNames(
  names: string[],
  now: Date,
  retentionDays: number,
  maxFiles: number
): string[] {
  const safeRetention = Math.max(1, Math.trunc(retentionDays));
  const safeMaxFiles = Math.max(1, Math.trunc(maxFiles));
  const cutoff = now.getTime() - safeRetention * 24 * 60 * 60 * 1000;

  const dated = names
    .map((name) => ({ name, date: parseBackupDate(name) }))
    .filter((entry): entry is { name: string; date: Date } => entry.date !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return dated
    .filter((entry, index) => index >= safeMaxFiles || entry.date.getTime() < cutoff)
    .map((entry) => entry.name);
}
