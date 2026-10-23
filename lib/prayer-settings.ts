export const PRAYER_METHOD_IDS = [3, 5, 2, 1, 8, 13] as const;

export type PrayerMethodId = (typeof PRAYER_METHOD_IDS)[number];

export type PrayerToolSettings = {
  defaultMethod: PrayerMethodId;
  defaultLatitude: number;
  defaultLongitude: number;
  defaultCityAr: string;
  defaultCityEn: string;
  defaultSoundEnabled: boolean;
  defaultAdhanEnabled: boolean;
  defaultNotifyBefore: number;
};

export const DEFAULT_PRAYER_TOOL_SETTINGS: PrayerToolSettings = {
  defaultMethod: 5,
  defaultLatitude: 30.0444,
  defaultLongitude: 31.2357,
  defaultCityAr: "القاهرة، مصر",
  defaultCityEn: "Cairo, Egypt",
  defaultSoundEnabled: true,
  defaultAdhanEnabled: false,
  defaultNotifyBefore: 10,
};

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function boundedNumber(value: unknown, fallback: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, finiteNumber(value, fallback)));
}

function safeText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function methodId(value: unknown): PrayerMethodId {
  const candidate = Number(value);
  return (PRAYER_METHOD_IDS as readonly number[]).includes(candidate)
    ? candidate as PrayerMethodId
    : DEFAULT_PRAYER_TOOL_SETTINGS.defaultMethod;
}

export function normalizePrayerToolSettings(value: unknown): PrayerToolSettings {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

  return {
    defaultMethod: methodId(record.defaultMethod),
    defaultLatitude: boundedNumber(record.defaultLatitude, DEFAULT_PRAYER_TOOL_SETTINGS.defaultLatitude, -90, 90),
    defaultLongitude: boundedNumber(record.defaultLongitude, DEFAULT_PRAYER_TOOL_SETTINGS.defaultLongitude, -180, 180),
    defaultCityAr: safeText(record.defaultCityAr, DEFAULT_PRAYER_TOOL_SETTINGS.defaultCityAr),
    defaultCityEn: safeText(record.defaultCityEn, DEFAULT_PRAYER_TOOL_SETTINGS.defaultCityEn),
    defaultSoundEnabled: typeof record.defaultSoundEnabled === "boolean"
      ? record.defaultSoundEnabled
      : DEFAULT_PRAYER_TOOL_SETTINGS.defaultSoundEnabled,
    defaultAdhanEnabled: typeof record.defaultAdhanEnabled === "boolean"
      ? record.defaultAdhanEnabled
      : DEFAULT_PRAYER_TOOL_SETTINGS.defaultAdhanEnabled,
    defaultNotifyBefore: Math.round(
      boundedNumber(record.defaultNotifyBefore, DEFAULT_PRAYER_TOOL_SETTINGS.defaultNotifyBefore, 0, 60),
    ),
  };
}

