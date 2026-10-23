// lib/turnstile.ts
// التحقق من Cloudflare Turnstile في الخادم.
//
// يُفعَّل فقط عند وجود المفتاحين معًا:
//   • NEXT_PUBLIC_TURNSTILE_SITE_KEY  (يُحمَّل في المتصفح)
//   • TURNSTILE_SECRET_KEY            (سري، لا يظهر في الحزمة)
//
// إن وُجد السرّ وحده (خطأ في الإعداد) نتجاوز التحقق بدل تعطيل النماذج كلها،
// لأن العميل لن يستطيع إرسال رمز بدون مفتاح الموقع. تُسجَّل ملاحظة مرة واحدة.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 5_000;
const MAX_TOKEN_LENGTH = 4_096;

const SECRET = (
  process.env.TURNSTILE_SECRET_KEY ||
  process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
  ""
).trim();

const SITE_KEY = (
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
  process.env.CLOUDFLARE_TURNSTILE_SITE_KEY ||
  ""
).trim();

let warnedMissingSiteKey = false;

export type TurnstileVerification = {
  ok: boolean;
  skipped: boolean;
  reason?: string;
};

/** هل التحقق الأمني مُفعَّل بالكامل؟ */
export function isTurnstileConfigured(): boolean {
  return Boolean(SECRET && SITE_KEY);
}

/** يستخرج رمز Turnstile من جسم الطلب بأكثر من اسم شائع. */
export function getTurnstileToken(
  body: Record<string, unknown> | null | undefined
): string {
  if (!body) return "";

  const candidates = [
    body.turnstileToken,
    body["cf-turnstile-response"],
    body.token,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim().slice(0, MAX_TOKEN_LENGTH);
    }
  }

  return "";
}

/**
 * يتحقق من الرمز لدى Cloudflare.
 * يعيد `skipped: true` إذا لم يُضبط المفتاحان، و`ok: false` إذا فشل التحقق.
 */
export async function verifyTurnstile(
  token: string,
  timeoutMs = VERIFY_TIMEOUT_MS
): Promise<TurnstileVerification> {
  if (!SECRET) {
    return { ok: true, skipped: true, reason: "no_secret" };
  }

  if (!SITE_KEY) {
    if (!warnedMissingSiteKey) {
      warnedMissingSiteKey = true;
      console.warn(
        "[Turnstile] TURNSTILE_SECRET_KEY مضبوط بلا NEXT_PUBLIC_TURNSTILE_SITE_KEY — تم تجاوز التحقق."
      );
    }

    return { ok: true, skipped: true, reason: "no_site_key" };
  }

  if (!token) {
    return { ok: false, skipped: false, reason: "missing_token" };
  }

  try {
    const formData = new FormData();
    formData.append("secret", SECRET);
    formData.append("response", token);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body: formData,
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(Math.max(1_000, timeoutMs)),
    });

    if (!res.ok) {
      console.warn("[Turnstile] verification HTTP error:", res.status);
      return { ok: false, skipped: false, reason: "http_error" };
    }

    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: unknown;
    };

    if (data?.success === true) {
      return { ok: true, skipped: false };
    }

    const codes = Array.isArray(data?.["error-codes"])
      ? data["error-codes"].filter((code): code is string => typeof code === "string")
      : [];

    console.warn("[Turnstile] verification rejected:", codes.join(",") || "unknown");

    return { ok: false, skipped: false, reason: "rejected" };
  } catch (error) {
    console.error("[Turnstile] verification error:", error);
    return { ok: false, skipped: false, reason: "network_error" };
  }
}
