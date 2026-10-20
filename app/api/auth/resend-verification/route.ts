// app/api/auth/resend-verification/route.ts
// POST { lang } — يعيد إرسال رابط التفعيل للمستخدم المسجّل دخوله فقط.
// لا يقبل بريدًا من العميل، فلا يمكن استخدامه لإغراق بريد الآخرين.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, getUserFromCookie } from "@/lib/auth";
import { rateLimitGuard } from "@/lib/rate-limit";
import { isAllowedMutationOrigin } from "@/lib/security/origin";
import { getSiteSettings } from "@/lib/content";
import { sendVerificationEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import {
  EMAIL_VERIFICATION_RESEND_COOLDOWN_MS,
  EMAIL_VERIFICATION_SETTING_KEY,
  EMAIL_VERIFICATION_TTL_MS,
  buildEmailVerificationUrl,
  emailProviderConfigured,
  normalizeEmailVerificationConfig,
} from "@/lib/email-verification-config";
import { createEmailVerificationToken } from "@/lib/email-verification-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function idForQuery(id: string): string | number {
  if (/^\d+$/.test(id)) {
    const num = Number(id);

    if (Number.isSafeInteger(num)) {
      return num;
    }
  }

  return id;
}

function isMissingColumnError(error: unknown): boolean {
  const code = String((error as any)?.code || "");
  const message = String((error as any)?.message || error || "");

  return (
    code === "42703" ||
    /column .* does not exist/i.test(message) ||
    /Could not find the .* column/i.test(message)
  );
}

export async function POST(req: NextRequest) {
  const limited = await rateLimitGuard(req, "verify");
  if (limited) return limited;

  if (!isAllowedMutationOrigin(req)) {
    return json({ ok: false, error: "forbidden_origin" }, 403);
  }

  const user = await getUserFromCookie(req);

  if (!user || user.role !== "user") {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  let body: unknown = null;

  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const lang =
    body &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    (body as Record<string, unknown>).lang === "en"
      ? "en"
      : "ar";

  const config = normalizeEmailVerificationConfig(
    (await getSiteSettings())[EMAIL_VERIFICATION_SETTING_KEY]
  );

  if (!config.enabled) {
    return json({ ok: true, disabled: true, alreadyVerified: false });
  }

  if (!emailProviderConfigured(process.env)) {
    return json({ ok: false, error: "email_not_configured" }, 503);
  }

  let client: ReturnType<typeof createAdminClient>;

  try {
    client = createAdminClient();
  } catch (error) {
    console.error("[ResendVerification] Supabase client error:", error);
    return json({ ok: false, error: "server_error" }, 500);
  }

  const { data, error } = await client
    .from("users")
    .select("id, email, email_verified, email_verification_sent_at")
    .eq("id", idForQuery(user.id))
    .maybeSingle();

  if (error) {
    if (isMissingColumnError(error)) {
      return json({ ok: false, error: "verification_unavailable" }, 503);
    }

    console.error("[ResendVerification] query error:", error);
    return json({ ok: false, error: "server_error" }, 500);
  }

  if (!data) {
    return json({ ok: false, error: "not_found" }, 404);
  }

  if (data.email_verified !== false) {
    return json({ ok: true, alreadyVerified: true });
  }

  const lastSentAt = data.email_verification_sent_at
    ? new Date(String(data.email_verification_sent_at)).getTime()
    : 0;

  if (Number.isFinite(lastSentAt) && lastSentAt > 0) {
    const elapsed = Date.now() - lastSentAt;

    if (elapsed < EMAIL_VERIFICATION_RESEND_COOLDOWN_MS) {
      return json(
        {
          ok: false,
          error: "cooldown",
          retryAfterSeconds: Math.ceil(
            (EMAIL_VERIFICATION_RESEND_COOLDOWN_MS - elapsed) / 1000
          ),
        },
        429
      );
    }
  }

  const { token, hash } = createEmailVerificationToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EMAIL_VERIFICATION_TTL_MS);

  const { error: updateError } = await client
    .from("users")
    .update({
      email_verification_token_hash: hash,
      email_verification_expires_at: expiresAt.toISOString(),
      email_verification_sent_at: now.toISOString(),
    })
    .eq("id", data.id);

  if (updateError) {
    console.error("[ResendVerification] update error:", updateError);
    return json({ ok: false, error: "server_error" }, 500);
  }

  const sent = await sendVerificationEmail(
    String(data.email || user.email),
    buildEmailVerificationUrl(SITE_URL, lang, token),
    lang
  );

  if (!sent.ok) {
    console.error("[ResendVerification] send failed:", sent.error);
    return json({ ok: false, error: "email_failed" }, 502);
  }

  return json({ ok: true });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } }
  );
}
