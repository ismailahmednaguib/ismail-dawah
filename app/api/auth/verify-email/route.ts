// app/api/auth/verify-email/route.ts
// POST { token } — يستهلك رمز التفعيل مرة واحدة ويثبّت الحساب.
// لا يعتمد على الجلسة: الرابط قد يُفتح على جهاز آخر.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/auth";
import { rateLimitGuard } from "@/lib/rate-limit";
import { isAllowedMutationOrigin } from "@/lib/security/origin";
import {
  isPlausibleVerificationToken,
} from "@/lib/email-verification-config";
import { hashEmailVerificationToken } from "@/lib/email-verification-token";

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
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  const token =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>).token
      : null;

  if (!isPlausibleVerificationToken(token)) {
    return json({ ok: false, error: "invalid_token" }, 400);
  }

  let client: ReturnType<typeof createAdminClient>;

  try {
    client = createAdminClient();
  } catch (error) {
    console.error("[VerifyEmail] Supabase client error:", error);
    return json({ ok: false, error: "server_error" }, 500);
  }

  const hash = hashEmailVerificationToken(token);

  const { data, error } = await client
    .from("users")
    .select("id, email_verified, email_verification_expires_at")
    .eq("email_verification_token_hash", hash)
    .maybeSingle();

  if (error) {
    if (isMissingColumnError(error)) {
      console.error("[VerifyEmail] verification columns missing:", error);
      return json({ ok: false, error: "verification_unavailable" }, 503);
    }

    console.error("[VerifyEmail] query error:", error);
    return json({ ok: false, error: "server_error" }, 500);
  }

  if (!data) {
    return json({ ok: false, error: "invalid_token" }, 400);
  }

  if (data.email_verified === true) {
    return json({ ok: true, alreadyVerified: true });
  }

  const rawExpiry = data.email_verification_expires_at;
  const expiresAt = rawExpiry ? new Date(String(rawExpiry)) : null;

  if (
    expiresAt &&
    Number.isFinite(expiresAt.getTime()) &&
    expiresAt.getTime() < Date.now()
  ) {
    // رمز منتهٍ: نظّفه حتى لا يبقى صالحًا في أي مسار آخر.
    await client
      .from("users")
      .update({
        email_verification_token_hash: null,
        email_verification_expires_at: null,
      })
      .eq("id", data.id);

    return json({ ok: false, error: "expired_token" }, 410);
  }

  const { error: updateError } = await client
    .from("users")
    .update({
      email_verified: true,
      email_verified_at: new Date().toISOString(),
      email_verification_token_hash: null,
      email_verification_expires_at: null,
    })
    .eq("id", data.id);

  if (updateError) {
    console.error("[VerifyEmail] update error:", updateError);
    return json({ ok: false, error: "server_error" }, 500);
  }

  return json({ ok: true });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } }
  );
}
