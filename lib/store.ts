// lib/store.ts
// التحقق من رابط متجر Google Play قبل عرضه للزوار.
// لا يُقبل إلا رابط https رسمي لصفحة تطبيق، حتى لا يتحول الرابط إلى تحويل خارجي.

const PLAY_HOST = 'play.google.com';
const PLAY_PATH = '/store/apps/details';
const MAX_URL_LENGTH = 600;

function normalizeCandidate(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, MAX_URL_LENGTH);
}

export function isPlayStoreUrl(value: unknown): boolean {
  const raw = normalizeCandidate(value);
  if (!raw) return false;

  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return false;
    if (url.hostname !== PLAY_HOST) return false;
    if (url.pathname !== PLAY_PATH) return false;
    const id = url.searchParams.get('id');
    return Boolean(id && /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/.test(id));
  } catch {
    return false;
  }
}

/**
 * أول رابط صالح من المصادر المعطاة (إعدادات اللوحة أولًا، ثم متغير البيئة).
 * يعيد نصًا فارغًا إن لم يوجد رابط صالح.
 */
export function resolvePlayStoreUrl(...candidates: unknown[]): string {
  for (const candidate of candidates) {
    const raw = normalizeCandidate(candidate);
    if (isPlayStoreUrl(raw)) return raw;
  }
  return '';
}
