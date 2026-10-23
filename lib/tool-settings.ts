/**
 * إعدادات الأدوات الإسلامية القابلة للتحكم من لوحة الإدارة.
 *
 * القيم هنا تصف السلوك التشغيلي الآمن فقط؛ لا تُستعمل لتحرير النصوص
 * المرجعية الحساسة أو تغيير منطق الحسابات الشرعية من واجهة عامة.
 */

export type ToolKey =
  | 'quran'
  | 'prayer'
  | 'qibla'
  | 'adhkar'
  | 'tasbih'
  | 'zakat'
  | 'inheritance'
  | 'calendar'
  | 'memorization'
  | 'dailyWird';

export type ToolSourceMode = 'local' | 'external' | 'device' | 'manual';

export interface ToolSetting {
  enabled: boolean;
  sourceMode: ToolSourceMode;
  sourceLabel: string;
  fallbackMessageAr: string;
  fallbackMessageEn: string;
}

export type ToolSettings = Record<ToolKey, ToolSetting>;

const setting = (
  sourceMode: ToolSourceMode,
  sourceLabel: string,
  fallbackMessageAr: string,
  fallbackMessageEn: string,
): ToolSetting => ({
  enabled: true,
  sourceMode,
  sourceLabel,
  fallbackMessageAr,
  fallbackMessageEn,
});

export const DEFAULT_TOOL_SETTINGS: ToolSettings = {
  quran: setting(
    'external',
    'AlQuran Cloud / Islamic Network',
    'مصدر القرآن غير متاح مؤقتًا. حاول لاحقًا، ولا تُعرض صفحة ناقصة دون تنبيه.',
    'The Quran source is temporarily unavailable. Please try again later.',
  ),
  prayer: setting(
    'external',
    'AlAdhan API + إعدادات الموقع',
    'تعذر جلب المواقيت من المصدر الخارجي. جرّب تحديد الموقع يدويًا.',
    'The external prayer-times source is unavailable. Try entering a location manually.',
  ),
  qibla: setting(
    'device',
    'موقع الجهاز أو الإحداثيات اليدوية',
    'تعذر استخدام موقع الجهاز. أدخل الإحداثيات يدويًا.',
    'Device location is unavailable. Enter coordinates manually.',
  ),
  adhkar: setting(
    'local',
    'بيانات المحتوى المحلية المراجعة',
    'لا توجد أذكار منشورة حاليًا.',
    'No published adhkar are currently available.',
  ),
  tasbih: setting(
    'local',
    'بيانات الأذكار المحلية',
    'المسبحة غير متاحة مؤقتًا.',
    'The tasbih is temporarily unavailable.',
  ),
  zakat: setting(
    'manual',
    'مدخلات المستخدم ومنطق الحاسبة الموثق',
    'حاسبة الزكاة غير متاحة مؤقتًا.',
    'The zakat calculator is temporarily unavailable.',
  ),
  inheritance: setting(
    'local',
    'منطق الحاسبة المختبر محليًا',
    'حاسبة الميراث غير متاحة مؤقتًا.',
    'The inheritance calculator is temporarily unavailable.',
  ),
  calendar: setting(
    'local',
    'بيانات التقويم المحلية',
    'التقويم غير متاح مؤقتًا.',
    'The calendar is temporarily unavailable.',
  ),
  memorization: setting(
    'local',
    'قائمة السور والتقدم المحلي للمستخدم',
    'خطة الحفظ غير متاحة مؤقتًا.',
    'The memorization plan is temporarily unavailable.',
  ),
  dailyWird: setting(
    'local',
    'قوالب الورد المحلية وتخزين الجهاز',
    'الورد اليومي غير متاح مؤقتًا.',
    'The daily wird is temporarily unavailable.',
  ),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeText(value: unknown, fallback: string, max = 240): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
}

function normalizeOne(value: unknown, fallback: ToolSetting): ToolSetting {
  if (!isRecord(value)) return { ...fallback };

  const sourceMode = value.sourceMode;
  const normalizedMode: ToolSourceMode =
    sourceMode === 'local' || sourceMode === 'external' || sourceMode === 'device' || sourceMode === 'manual'
      ? sourceMode
      : fallback.sourceMode;

  return {
    enabled: typeof value.enabled === 'boolean' ? value.enabled : fallback.enabled,
    sourceMode: normalizedMode,
    sourceLabel: safeText(value.sourceLabel, fallback.sourceLabel),
    fallbackMessageAr: safeText(value.fallbackMessageAr, fallback.fallbackMessageAr),
    fallbackMessageEn: safeText(value.fallbackMessageEn, fallback.fallbackMessageEn),
  };
}

export function normalizeToolSettings(value: unknown): ToolSettings {
  const source = isRecord(value) ? value : {};
  return Object.fromEntries(
    (Object.keys(DEFAULT_TOOL_SETTINGS) as ToolKey[]).map((key) => [
      key,
      normalizeOne(source[key], DEFAULT_TOOL_SETTINGS[key]),
    ]),
  ) as ToolSettings;
}

export function isToolEnabled(value: unknown, key: ToolKey): boolean {
  return normalizeToolSettings(value)[key].enabled;
}

