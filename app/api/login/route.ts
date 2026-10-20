// app/api/login/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  verifyPassword,
  setAdminSessionCookies,
  setUserSessionCookies,
  normalizeAuthEmail,
  isValidAuthEmail,
  type Role,
} from "@/lib/auth";
import { isOwnerEmail } from "@/lib/admin/owner";
import { rateLimitGuard } from "@/lib/rate-limit";

// ============================================================
// Types
// ============================================================

type LoginBody = {
  email?: unknown;
  password?: unknown;
  lang?: unknown;
  rememberMe?: unknown;
};

type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
};

// ============================================================
// Helpers
// ============================================================

function getErrorMessage(error: unknown): string {
  return String((error as any)?.message || error || "");
}

function isMissingTableError(error: unknown): boolean {
  const message = getErrorMessage(error);

  return (
    /does not exist/i.test(message) ||
    /Could not find the table/i.test(message) ||
    /relation/i.test(message) ||
    /schema/i.test(message)
  );
}

function normalizeLang(value: unknown): "ar" | "en" {
  const lang = String(value || "").trim().toLowerCase();
  return lang === "en" ? "en" : "ar";
}

function getRedirectForRole(role: Role, lang: "ar" | "en"): string {
  const base = lang === "en" ? "/en" : "/ar";

  if (role === "admin") {
    return (
      process.env.NEXT_PUBLIC_ADMIN_HOME_URL?.trim() ||
      "/admin"
    );
  }

  return (
    process.env.NEXT_PUBLIC_USER_HOME_URL?.trim() ||
    `${base}/account`
  );
}

function getStringValue(row: any, keys: string[]): string | null {
  for (const key of keys) {
    const value = row?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getPasswordParts(row: any): {
  hash: string | null;
  salt: string | null;
} {
  const hash = getStringValue(row, [
    "password_hash",
    "password",
    "hashed_password",
    "crypt",
  ]);

  const salt = getStringValue(row, ["salt"]);

  return { hash, salt };
}

function getRowRole(row: any): Role {
  const value = getStringValue(row, ["role", "user_role", "type"])?.toLowerCase();

  if (value === "admin") {
    return "admin";
  }

  return "user";
}

function isRowActive(row: any): boolean {
  if (row?.is_active === false || row?.active === false) {
    return false;
  }

  const status = String(row?.status || "").trim().toLowerCase();

  if (
    status === "inactive" ||
    status === "disabled" ||
    status === "banned" ||
    status === "suspended"
  ) {
    return false;
  }

  return true;
}

function getTokenVersion(row: any): number | undefined {
  // ملاحظة: عمود token_version قد يكون NULL للحسابات القديمة.
  // بدون القيمة الافتراضية 0 لا يحمل الرمز tv، فلا يُبطل bumpAuthVersion
  // الجلسات بعد تغيير/استعادة كلمة المرور.
  const raw =
    row?.token_version ?? row?.auth_version ?? row?.password_version ?? 0;
  const num = Number(raw);

  return Number.isFinite(num) ? num : 0;
}

function publicUser(row: any, role: Role): PublicUser {
  return {
    id: String(row?.id ?? ""),
    email: String(row?.email ?? ""),
    name:
      getStringValue(row, ["name", "full_name", "display_name"]) ?? null,
    role,
  };
}

function sessionExtras(row: any): Record<string, unknown> {
  const extras: Record<string, unknown> = {};

  const email = getStringValue(row, ["email"]);
  if (email) {
    extras.email = email;
  }

  const tv = getTokenVersion(row);
  if (typeof tv === "number") {
    extras.tv = tv;
  }

  return extras;
}

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Vary", "Cookie, Origin, Authorization");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return res;
}

function unauthorizedResponse(): NextResponse {
  return withSecurityHeaders(
    NextResponse.json(
      {
        ok: false,
        error: "invalid_credentials",
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      },
      { status: 401 }
    )
  );
}

function inactiveResponse(): NextResponse {
  return withSecurityHeaders(
    NextResponse.json(
      {
        ok: false,
        error: "inactive_account",
        message: "هذا الحساب غير مفعّل. تواصل مع المسؤول.",
      },
      { status: 403 }
    )
  );
}

function badRequestResponse(message: string): NextResponse {
  return withSecurityHeaders(
    NextResponse.json(
      {
        ok: false,
        error: "bad_request",
        message,
      },
      { status: 400 }
    )
  );
}

function serverErrorResponse(
  message = "حدث خطأ في الخادم. حاول لاحقًا."
): NextResponse {
  return withSecurityHeaders(
    NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message,
      },
      { status: 500 }
    )
  );
}

// ============================================================
// DB Lookup
// ============================================================

async function queryRowByEmail(
  client: any,
  table: "admin_users" | "users",
  email: string
): Promise<{ data: any | null; error: any | null }> {
  try {
    const ilikeResult = (await client
      .from(table)
      .select("*")
      .ilike("email", email)
      .maybeSingle()) as any;

    if (!ilikeResult.error) {
      return { data: ilikeResult.data ?? null, error: null };
    }

    if (isMissingTableError(ilikeResult.error)) {
      return { data: null, error: null };
    }

    const eqResult = (await client
      .from(table)
      .select("*")
      .eq("email", email)
      .maybeSingle()) as any;

    if (!eqResult.error) {
      return { data: eqResult.data ?? null, error: null };
    }

    if (isMissingTableError(eqResult.error)) {
      return { data: null, error: null };
    }

    return {
      data: null,
      error: eqResult.error || ilikeResult.error,
    };
  } catch (error) {
    return { data: null, error };
  }
}

// ============================================================
// POST /api/login
// ============================================================

export async function POST(req: NextRequest) {
  const limited = await rateLimitGuard(req, "login");
  if (limited) return limited;

  try {
    let body: LoginBody;

    try {
      body = (await req.json()) as LoginBody;
    } catch {
      return badRequestResponse("صيغة الطلب غير صحيحة.");
    }

    const email = normalizeAuthEmail(body.email);
    const password =
      typeof body.password === "string" ? body.password : "";
    const lang = normalizeLang(body.lang);

    if (!email || !password) {
      return badRequestResponse("البريد الإلكتروني وكلمة المرور مطلوبان.");
    }

    if (!isValidAuthEmail(email)) {
      return badRequestResponse("صيغة البريد الإلكتروني غير صحيحة.");
    }

    let client: any;

    try {
      client = createAdminClient();
    } catch (error) {
      console.error("[Login] Supabase client error:", error);
      return serverErrorResponse("الإعدادات الخادمية غير مكتملة.");
    }

    // --------------------------------------------------------
    // 1) Try admin_users first
    // --------------------------------------------------------

    const adminQuery = await queryRowByEmail(client, "admin_users", email);

    if (adminQuery.error) {
      console.error("[Login] admin_users query error:", adminQuery.error);
      return serverErrorResponse();
    }

    if (adminQuery.data) {
      const adminRow = adminQuery.data;

      if (!isRowActive(adminRow)) {
        return inactiveResponse();
      }

      const { hash, salt } = getPasswordParts(adminRow);

      const passwordOk = await verifyPassword(
        password,
        hash || "",
        salt ?? undefined
      );

      if (!passwordOk) {
        return unauthorizedResponse();
      }

      const res = NextResponse.json({
        ok: true,
        role: "admin",
        redirect: getRedirectForRole("admin", lang),
        user: publicUser(adminRow, "admin"),
      });

      try {
        setAdminSessionCookies(
          res,
          String(adminRow.id),
          sessionExtras(adminRow)
        );
      } catch (error) {
        console.error("[Login] set admin cookies error:", error);
        return serverErrorResponse("تعذر إنشاء جلسة الأدمن.");
      }

      return withSecurityHeaders(res);
    }

    // --------------------------------------------------------
    // 2) Try users table
    // --------------------------------------------------------

    const userQuery = await queryRowByEmail(client, "users", email);

    if (userQuery.error) {
      console.error("[Login] users query error:", userQuery.error);
      return serverErrorResponse();
    }

    if (!userQuery.data) {
      return unauthorizedResponse();
    }

    const userRow = userQuery.data;

    if (!isRowActive(userRow)) {
      return inactiveResponse();
    }

    const { hash, salt } = getPasswordParts(userRow);

    const passwordOk = await verifyPassword(
      password,
      hash || "",
      salt ?? undefined
    );

    if (!passwordOk) {
      return unauthorizedResponse();
    }

    const role: Role = isOwnerEmail(email) ? "admin" : getRowRole(userRow);

    const res = NextResponse.json({
      ok: true,
      role,
      redirect: getRedirectForRole(role, lang),
      user: publicUser(userRow, role),
    });

    try {
      if (role === "admin") {
        setAdminSessionCookies(
          res,
          String(userRow.id),
          sessionExtras(userRow)
        );
      } else {
        setUserSessionCookies(
          res,
          String(userRow.id),
          sessionExtras(userRow)
        );
      }
    } catch (error) {
      console.error("[Login] set cookies error:", error);
      return serverErrorResponse("تعذر إنشاء جلسة المستخدم.");
    }

    return withSecurityHeaders(res);
  } catch (error) {
    console.error("[Login] unexpected error:", error);
    return serverErrorResponse();
  }
}

// ============================================================
// GET: Method Not Allowed
// ============================================================

export async function GET() {
  return withSecurityHeaders(
    NextResponse.json(
      {
        ok: false,
        error: "method_not_allowed",
        message: "Method not allowed",
      },
      {
        status: 405,
        headers: {
          Allow: "POST",
        },
      }
    )
  );
}
