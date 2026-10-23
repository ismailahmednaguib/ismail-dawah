// أدوات التحقق من اشتراكات Web Push — مشتركة بين مسار الحفظ والاختبارات.

export const MAX_PUSH_ENDPOINT_LENGTH = 2_048;
export const MAX_PUSH_KEY_LENGTH = 512;

export type NormalizedPushSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

function isBase64Url(value: string): boolean {
  return (
    value.length >= 8 &&
    value.length <= MAX_PUSH_KEY_LENGTH &&
    /^[A-Za-z0-9_-]+$/.test(value)
  );
}

export function normalizePushEndpoint(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const endpoint = value.trim();
  if (!endpoint || endpoint.length > MAX_PUSH_ENDPOINT_LENGTH) return null;

  try {
    const parsed = new URL(endpoint);
    if (
      parsed.protocol !== "https:" ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return endpoint;
}

export function normalizePushSubscription(
  value: unknown
): NormalizedPushSubscription | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const input = value as {
    endpoint?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
  };

  const endpoint = normalizePushEndpoint(input.endpoint);
  const p256dh = typeof input.keys?.p256dh === "string" ? input.keys.p256dh.trim() : "";
  const auth = typeof input.keys?.auth === "string" ? input.keys.auth.trim() : "";

  if (!endpoint || !isBase64Url(p256dh) || !isBase64Url(auth)) {
    return null;
  }

  return { endpoint, p256dh, auth };
}
