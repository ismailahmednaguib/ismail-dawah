// app/api/auth/forgot-password/route.ts
// POST { email, lang } — يرسل رابط استعادة إن كان البريد مسجلًا.
// الرد عام دائمًا حتى لا يمكن معرفة البريد المسجّل (منع التعداد).

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  isValidAuthEmail,
  normalizeAuthEmail,
} from "@/lib/auth";
import { rateLimitGuard } from "@/lib/rate-limit";
import { isAllowedMutationOrigin } from "@/lib/security/origin";
import { getSiteSettings } from "@/lib/content";
import { sendPasswordResetEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import {
  PASSWORD_RESET_COOLDOWN_MS,
  PASSWORD_RESET_SETTING_KEY,
  PASSWORD_RESET_TTL_MS,
  buildPasswordResetUrl,
  normalizePasswordResetConfig,
} from "@/lib/password-reset-config";
import { emailProviderConfigured } from "@/lib/email-verification-config";
import { createPasswordResetToken } from "@/lib/password-reset-token";

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

function isMissingColumnError(error: unknown): boolean {
  const code = String((error as any)?.code || "");
  const message = String((error as any)?.message || error || "");

  return (
    code === "42703" ||
    /column .* does not exist/i.test(message) ||
    /Could not find the .* column/i.test(message)
  );
}

type LookupRow = {
  id: string | number;
  email?: string | null;
  password_reset_requested_at?: string | null;
};

async function findUserByEmail(
  client: ReturnType<typeof createAdminClient>,
  email: string
): Promise<{ data: LookupRow | null; error: unknown }> {
  const columns = "id, email, password_reset_requested_at";

  const exact = (await client
    .from("users")
    .select(columns)
    .eq("email", email)
    .maybeSingle()) as { data: LookupRow | null; error: unknown };

  if (!exact.error) {
    if (exact.data) return { data: exact.data, error: null };
  } else if (!isMissingColumnError(exact.error)) {
    return { data: null, error: exact.error };
  }

  if (exact.error) {
    // الأعمدة غير موجودة بعد (الترحيل لم يُنفَّذ). لا يُرسل شيء.
    return { data: null, error: exact.error };
  }

  // بريد قديم بحروف كبيرة: ilike ثم مطابقة دقيقة في JS لتفادي أحرف البدل.
  const loose = (await client
    .from("users")
    .select(columns)
    .ilike("email", email)
    .limit(20)) as { data: LookupRow[] | null; error: unknown };

  if (loose.error) {
    return { data: null, error: loose.error };
  }

  const match = (loose.data ?? []).find(
    (row) =>
      typeof row.email === "string" &&
      row.email.trim().toLowerCase() === email
  );

  return { data: match ?? null, error: null };
}

export async function POST(req: NextRequest) {
  const limited = await rateLimitGuard(req, "verify");
  if (limited) return limited;

  if (!isAllowedMutationOrigin(req)) {
    return json({ ok: false, error: "forbidden_origin" }, 403);
  }

  let body: unknown = null;

  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const source =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};

  const email = normalizeAuthEmail(source.email);
  const lang = source.lang === "en" ? "en" : "ar";

  if (!isValidAuthEmail(email)) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }

  const config = normalizePasswordResetConfig(
    (await getSiteSettings())[PASSWORD_RESET_SETTING_KEY]
  );

  if (!config.enabled) {
    return json({ ok: false, error: "reset_disabled" }, 503);
  }

  if (!emailProviderConfigured(process.env)) {
    return json({ ok: false, error: "email_not_configured" }, 503);
  }

  const generic = {
    ok: true,
    message:
      lang === "ar"
        ? "إذا كان البريد مسجّلًا فسيصلك رابط إعادة التعيين خلال دقائق. تحقّق من مجلد المهملات أيضًا."
        : "If the email is registered, a reset link will arrive within minutes. Check your spam folder too.",
  };

  let client: ReturnType<typeof createAdminClient>;

  try {
    client = createAdminClient();
  } catch (error) {
    console.error("[ForgotPassword] Supabase client error:", error);
    return json({ ok: false, error: "server_error" }, 500);
  }

  const lookup = await findUserByEmail(client, email);

  if (lookup.error) {
    if (!isMissingColumnError(lookup.error)) {
      console.error("[ForgotPassword] lookup error:", lookup.error);
    } else {
      console.warn(
        "[ForgotPassword] reset columns missing; run 20261021_password_reset.sql."
      );
    }

    // نُبقي الرد عامًا حتى لا نكشف وجود البريد أو حالة الخادم.
    return json(generic);
  }

  if (!lookup.data) {
    return json(generic);
  }

  const lastRequested = lookup.data.password_reset_requested_at
    ? new Date(String(lookup.data.password_reset_requested_at)).getTime()
    : 0;

  if (
    Number.isFinite(lastRequested) &&
    lastRequested > 0 &&
    Date.now() - lastRequested < PASSWORD_RESET_COOLDOWN_MS
  ) {
    return json(generic);
  }

  const { token, hash } = createPasswordResetToken();
  const now = new Date();

  const { error: updateError } = await client
    .from("users")
    .update({
      password_reset_token_hash: hash,
      password_reset_expires_at: new Date(
        now.getTime() + PASSWORD_RESET_TTL_MS
      ).toISOString(),
      password_reset_requested_at: now.toISOString(),
    })
    .eq("id", lookup.data.id);

  if (updateError) {
    if (!isMissingColumnError(updateError)) {
      console.error("[ForgotPassword] update error:", updateError);
    }

    return json(generic);
  }

  const sent = await sendPasswordResetEmail(
    email,
    buildPasswordResetUrl(SITE_URL, lang, token),
    lang
  );

  if (!sent.ok) {
    console.error("[ForgotPassword] send failed:", sent.error);
  }

  return json(generic);
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } }
  );
}
