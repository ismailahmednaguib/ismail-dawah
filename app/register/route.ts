// app/api/register/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  hashPasswordCombinedAsync,
  normalizeAuthEmail,
  isValidAuthEmail,
  validatePasswordStrength,
  setUserSessionCookies,
  type Role,
} from "@/lib/auth";

// ============================================================
// Types
// ============================================================

type RegisterBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  lang?: unknown;
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

function isDuplicateError(error: unknown): boolean {
  const message = getErrorMessage(error);

  return (
    /duplicate key value violates unique constraint/i.test(message) ||
    /unique constraint/i.test(message) ||
    /23505/.test(message)
  );
}

function isMissingColumnError(error: unknown, column: string): boolean {
  const message = getErrorMessage(error);

  return (
    new RegExp(column, "i").test(message) &&
    (/column.*does not exist/i.test(message) ||
      /Could not find the column/i.test(message) ||
      /schema.*does not exist/i.test(message))
  );
}

function isAnyMissingColumnError(error: unknown): boolean {
  const columns = [
    "name",
    "full_name",
    "password",
    "password_hash",
    "hashed_password",
    "salt",
    "role",
    "is_active",
    "created_at",
    "updated_at",
  ];

  return columns.some((column) => isMissingColumnError(error, column));
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

function publicUser(row: any, role: Role): PublicUser {
  return {
    id: String(row?.id ?? ""),
    email: String(row?.email ?? ""),
    name:
      getStringValue(row, ["name", "full_name", "display_name"]) ?? null,
    role,
  };
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

function conflictResponse(message: string): NextResponse {
  return withSecurityHeaders(
    NextResponse.json(
      {
        ok: false,
        error: "conflict",
        message,
      },
      { status: 409 }
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
// POST /api/register
// ============================================================

export async function POST(req: NextRequest) {
  try {
    let body: RegisterBody;

    try {
      body = (await req.json()) as RegisterBody;
    } catch {
      return badRequestResponse("صيغة الطلب غير صحيحة.");
    }

    const name = String(body.name || "").trim().slice(0, 120);
    const email = normalizeAuthEmail(body.email);
    const password =
      typeof body.password === "string" ? body.password : "";
    const lang = normalizeLang(body.lang);

    if (!name) {
      return badRequestResponse("الاسم مطلوب.");
    }

    if (!email || !password) {
      return badRequestResponse("البريد الإلكتروني وكلمة المرور مطلوبان.");
    }

    if (!isValidAuthEmail(email)) {
      return badRequestResponse("صيغة البريد الإلكتروني غير صحيحة.");
    }

    const passwordCheck = validatePasswordStrength(password);

    if (!passwordCheck.ok) {
      return badRequestResponse("كلمة المرور غير قوية بما يكفي.");
    }

    let client: any;

    try {
      client = createAdminClient();
    } catch (error) {
      console.error("[Register] Supabase client error:", error);
      return serverErrorResponse("الإعدادات الخادمية غير مكتملة.");
    }

    // --------------------------------------------------------
    // Check existing email
    // --------------------------------------------------------

    const adminExisting = await queryRowByEmail(client, "admin_users", email);

    if (adminExisting.error) {
      console.error("[Register] admin_users check error:", adminExisting.error);
      return serverErrorResponse();
    }

    if (adminExisting.data) {
      return conflictResponse("هذا البريد الإلكتروني مستخدم بالفعل.");
    }

    const userExisting = await queryRowByEmail(client, "users", email);

    if (userExisting.error) {
      console.error("[Register] users check error:", userExisting.error);
      return serverErrorResponse();
    }

    if (userExisting.data) {
      return conflictResponse("هذا البريد الإلكتروني مسجل بالفعل.");
    }

    // --------------------------------------------------------
    // Hash password
    // --------------------------------------------------------

    const hashedPassword = await hashPasswordCombinedAsync(password);
    const createdAt = new Date().toISOString();

    // --------------------------------------------------------
    // Insert with flexible payloads
    // --------------------------------------------------------

    const payloads: Record<string, any>[] = [
      {
        email,
        name,
        password: hashedPassword,
        role: "user",
        is_active: true,
        created_at: createdAt,
      },
      {
        email,
        name,
        password_hash: hashedPassword,
        role: "user",
        is_active: true,
        created_at: createdAt,
      },
      {
        email,
        name,
        password: hashedPassword,
        role: "user",
        created_at: createdAt,
      },
      {
        email,
        name,
        password_hash: hashedPassword,
        role: "user",
        created_at: createdAt,
      },
      {
        email,
        name,
        password: hashedPassword,
        is_active: true,
        created_at: createdAt,
      },
      {
        email,
        name,
        password_hash: hashedPassword,
        is_active: true,
        created_at: createdAt,
      },
      {
        email,
        password: hashedPassword,
        role: "user",
        is_active: true,
        created_at: createdAt,
      },
      {
        email,
        password_hash: hashedPassword,
        role: "user",
        is_active: true,
        created_at: createdAt,
      },
      {
        email,
        name,
        password: hashedPassword,
        role: "user",
        is_active: true,
      },
      {
        email,
        name,
        password_hash: hashedPassword,
        role: "user",
        is_active: true,
      },
      {
        email,
        name,
        password: hashedPassword,
        role: "user",
      },
      {
        email,
        name,
        password_hash: hashedPassword,
        role: "user",
      },
      {
        email,
        password: hashedPassword,
        role: "user",
      },
      {
        email,
        password_hash: hashedPassword,
        role: "user",
      },
      {
        email,
        name,
        password: hashedPassword,
      },
      {
        email,
        name,
        password_hash: hashedPassword,
      },
      {
        email,
        password: hashedPassword,
      },
      {
        email,
        password_hash: hashedPassword,
      },
    ];

    let inserted: any = null;
    let insertSucceeded = false;
    let duplicate = false;
    let tableMissing = false;
    let lastError: any = null;

    for (const payload of payloads) {
      const result = (await client.from("users").insert(payload)) as any;
      lastError = result.error;

      if (!result.error) {
        insertSucceeded = true;
        inserted = Array.isArray(result.data) ? result.data[0] : result.data;
        break;
      }

      if (isMissingTableError(result.error)) {
        tableMissing = true;
        break;
      }

      if (isDuplicateError(result.error)) {
        duplicate = true;
        break;
      }

      if (isAnyMissingColumnError(result.error)) {
        continue;
      }

      // Other errors: try simpler payload.
    }

    if (tableMissing) {
      console.error("[Register] users table missing:", lastError);
      return serverErrorResponse("جدول المستخدمين غير موجود.");
    }

    if (duplicate) {
      return conflictResponse("هذا البريد الإلكتروني مسجل بالفعل.");
    }

    if (!insertSucceeded) {
      console.error("[Register] insert failed:", lastError);
      return serverErrorResponse("تعذر إنشاء الحساب.");
    }

    // --------------------------------------------------------
    // Ensure we have inserted row/id
    // --------------------------------------------------------

    if (!inserted?.id) {
      const refreshed = await queryRowByEmail(client, "users", email);

      if (refreshed.data) {
        inserted = refreshed.data;
      }
    }

    const role: Role = "user";

    const res = NextResponse.json({
      ok: true,
      role,
      redirect: inserted?.id
        ? getRedirectForRole(role, lang)
        : `/${lang}/login`,
      user: inserted
        ? publicUser(inserted, role)
        : {
            id: "",
            email,
            name,
            role,
          },
      message: inserted?.id
        ? "تم إنشاء الحساب وتسجيل الدخول."
        : "تم إنشاء الحساب. يرجى تسجيل الدخول.",
    });

    if (inserted?.id) {
      try {
        setUserSessionCookies(res, String(inserted.id), {
          email,
        });
      } catch (error) {
        console.error("[Register] set cookies error:", error);

        return withSecurityHeaders(
          NextResponse.json(
            {
              ok: true,
              role,
              redirect: `/${lang}/login`,
              user: publicUser(inserted, role),
              message:
                "تم إنشاء الحساب، لكن تعذر تسجيل الدخول تلقائيًا. سجّل دخولك يدويًا.",
            },
            { status: 201 }
          )
        );
      }
    }

    return withSecurityHeaders(res);
  } catch (error) {
    console.error("[Register] unexpected error:", error);
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
