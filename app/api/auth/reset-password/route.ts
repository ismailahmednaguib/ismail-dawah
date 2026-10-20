// app/api/auth/reset-password/route.ts
// POST { token, password } — يستهلك رمز الاستعادة مرة واحدة ويضع كلمة مرور جديدة.
// لا يعتمد على الجلسة: الرابط قد يُفتح على جهاز آخر.

import { NextRequest, NextResponse } from "next/server";
import {
  bumpAuthVersion,
  createAdminClient,
  hashPasswordCombinedAsync,
  validatePasswordStrength,
} from "@/lib/auth";
import { rateLimitGuard } from "@/lib/rate-limit";
import { isAllowedMutationOrigin } from "@/lib/security/origin";
import { isPlausiblePasswordResetToken } from "@/lib/password-reset-config";
import { hashPasswordResetToken } from "@/lib/password-reset-token";

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

  const token = source.token;
  const password = source.password;

  if (!isPlausiblePasswordResetToken(token)) {
    return json({ ok: false, error: "invalid_token" }, 400);
  }

  if (typeof password !== "string") {
    return json({ ok: false, error: "weak_password" }, 400);
  }

  const strength = validatePasswordStrength(password);

  if (!strength.ok) {
    return json({ ok: false, error: strength.error || "weak_password" }, 400);
  }

  let client: ReturnType<typeof createAdminClient>;

  try {
    client = createAdminClient();
  } catch (error) {
    console.error("[ResetPassword] Supabase client error:", error);
    return json({ ok: false, error: "server_error" }, 500);
  }

  const hash = hashPasswordResetToken(token);

  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("password_reset_token_hash", hash)
    .maybeSingle();

  if (error) {
    if (isMissingColumnError(error)) {
      console.error(
        "[ResetPassword] reset columns missing; run 20261021_password_reset.sql.",
        error
      );
      return json({ ok: false, error: "reset_unavailable" }, 503);
    }

    console.error("[ResetPassword] lookup error:", error);
    return json({ ok: false, error: "server_error" }, 500);
  }

  if (!data) {
    return json({ ok: false, error: "invalid_token" }, 400);
  }

  if (data.is_active === false) {
    return json({ ok: false, error: "inactive_account" }, 403);
  }

  const rawExpiry = data.password_reset_expires_at;
  const expiresAt = rawExpiry ? new Date(String(rawExpiry)) : null;

  if (
    expiresAt &&
    Number.isFinite(expiresAt.getTime()) &&
    expiresAt.getTime() < Date.now()
  ) {
    await client
      .from("users")
      .update({
        password_reset_token_hash: null,
        password_reset_expires_at: null,
      })
      .eq("id", data.id);

    return json({ ok: false, error: "expired_token" }, 410);
  }

  const combined = await hashPasswordCombinedAsync(password);
  const nowIso = new Date().toISOString();

  const update: Record<string, unknown> = {
    password_reset_token_hash: null,
    password_reset_expires_at: null,
    password_reset_requested_at: null,
  };

  if ("password_hash" in data) update.password_hash = combined;
  if ("password" in data) update.password = combined;
  if ("hashed_password" in data) update.hashed_password = combined;
  if ("crypt" in data) update.crypt = combined;

  if (
    !("password_hash" in data) &&
    !("password" in data) &&
    !("hashed_password" in data) &&
    !("crypt" in data)
  ) {
    console.error("[ResetPassword] users table has no password column.");
    return json({ ok: false, error: "server_error" }, 500);
  }

  // تجنّب بقاء ملح قديم مع صيغة salt:hash المركّبة.
  // عمود salt في المخطط الحالي NOT NULL، لذا نستخدم سلسلة فارغة لا null.
  if ("salt" in data) update.salt = "";

  // إعادة التعيين تثبت ملكية البريد، فنُفعّله إن كان العمود موجودًا.
  if ("email_verified" in data) {
    update.email_verified = true;
    update.email_verified_at = nowIso;
  }

  if ("email_verification_token_hash" in data) {
    update.email_verification_token_hash = null;
  }

  if ("email_verification_expires_at" in data) {
    update.email_verification_expires_at = null;
  }

  const { error: updateError } = await client
    .from("users")
    .update(update)
    .eq("id", data.id);

  if (updateError) {
    console.error("[ResetPassword] update error:", updateError);
    return json({ ok: false, error: "server_error" }, 500);
  }

  // إبطال كل الجلسات القديمة بعد تغيير كلمة المرور.
  await bumpAuthVersion(String(data.id), "user");

  return json({ ok: true });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } }
  );
}
