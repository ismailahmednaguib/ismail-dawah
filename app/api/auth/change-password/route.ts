// app/api/auth/change-password/route.ts
// POST { currentPassword, newPassword } — تغيير كلمة المرور للمستخدم المسجّل.
// يتطلب الجلسة الحالية وكلمة المرور الحالية، ويُبطل كل الجلسات بعد النجاح.

import { NextRequest, NextResponse } from "next/server";
import {
  bumpAuthVersion,
  createAdminClient,
  getServerUser,
  hashPasswordCombinedAsync,
  validatePasswordStrength,
  verifyPassword,
} from "@/lib/auth";
import { rateLimitGuard } from "@/lib/rate-limit";
import { isAllowedMutationOrigin } from "@/lib/security/origin";
import { getSiteSettings } from "@/lib/content";
import {
  PASSWORD_CHANGE_SETTING_KEY,
  normalizePasswordChangeConfig,
} from "@/lib/password-change-config";

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

function pickString(row: unknown, keys: string[]): string | null {
  if (!row || typeof row !== "object") return null;
  const source = row as Record<string, unknown>;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  const limited = await rateLimitGuard(req, "verify");
  if (limited) return limited;

  if (!isAllowedMutationOrigin(req)) {
    return json({ ok: false, error: "forbidden_origin" }, 403);
  }

  let user: Awaited<ReturnType<typeof getServerUser>> = null;

  try {
    user = await getServerUser();
  } catch (error) {
    console.error("[ChangePassword] session error:", error);
    return json({ ok: false, error: "server_error" }, 500);
  }

  if (!user) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const config = normalizePasswordChangeConfig(
    (await getSiteSettings())[PASSWORD_CHANGE_SETTING_KEY]
  );

  if (!config.enabled) {
    return json({ ok: false, error: "password_change_disabled" }, 503);
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

  const currentPassword = source.currentPassword;
  const newPassword = source.newPassword;

  if (typeof currentPassword !== "string" || !currentPassword) {
    return json({ ok: false, error: "invalid_current_password" }, 400);
  }

  if (typeof newPassword !== "string" || !newPassword) {
    return json({ ok: false, error: "weak_password" }, 400);
  }

  if (currentPassword === newPassword) {
    return json({ ok: false, error: "same_password" }, 400);
  }

  const strength = validatePasswordStrength(newPassword);

  if (!strength.ok) {
    return json({ ok: false, error: strength.error || "weak_password" }, 400);
  }

  let client: ReturnType<typeof createAdminClient>;

  try {
    client = createAdminClient();
  } catch (error) {
    console.error("[ChangePassword] Supabase client error:", error);
    return json({ ok: false, error: "server_error" }, 500);
  }

  const queryId = /^\d+$/.test(String(user.id)) ? Number(user.id) : user.id;

  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("id", queryId)
    .maybeSingle();

  if (error) {
    console.error("[ChangePassword] lookup error:", error);
    return json({ ok: false, error: "server_error" }, 500);
  }

  if (!data) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  if ((data as Record<string, unknown>).is_active === false) {
    return json({ ok: false, error: "inactive_account" }, 403);
  }

  const row = data as Record<string, unknown>;
  const storedHash = pickString(row, [
    "password_hash",
    "password",
    "hashed_password",
    "crypt",
  ]);
  const storedSalt = pickString(row, ["salt"]);

  if (!storedHash) {
    return json({ ok: false, error: "password_not_set" }, 400);
  }

  const validCurrent = await verifyPassword(
    currentPassword,
    storedHash,
    storedSalt || undefined
  );

  if (!validCurrent) {
    return json({ ok: false, error: "invalid_current_password" }, 400);
  }

  const combined = await hashPasswordCombinedAsync(newPassword);
  const update: Record<string, unknown> = {};

  for (const column of ["password_hash", "password", "hashed_password", "crypt"]) {
    if (column in row) update[column] = combined;
  }

  if (!("password_hash" in row) && !("password" in row) && !("hashed_password" in row) && !("crypt" in row)) {
    console.error("[ChangePassword] users table has no password column.");
    return json({ ok: false, error: "server_error" }, 500);
  }

  // تجنّب بقاء ملح قديم مع صيغة salt:hash المركّبة.
  // عمود salt في المخطط الحالي NOT NULL، لذا نستخدم سلسلة فارغة لا null.
  if ("salt" in row) update.salt = "";

  // تغيير كلمة المرور يُلغي أي رابط استعادة معلّق.
  if ("password_reset_token_hash" in row) {
    update.password_reset_token_hash = null;
    update.password_reset_expires_at = null;
  }

  const { error: updateError } = await client
    .from("users")
    .update(update)
    .eq("id", queryId);

  if (updateError) {
    console.error("[ChangePassword] update error:", updateError);
    return json({ ok: false, error: "server_error" }, 500);
  }

  // إبطال كل الجلسات القديمة (بما فيها الجلسة الحالية).
  await bumpAuthVersion(String(user.id), "user");

  return json({ ok: true });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } }
  );
}
