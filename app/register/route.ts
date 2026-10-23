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
import { isAllowedMutationOrigin } from "@/lib/security/origin";
import { getSiteSettings } from "@/lib/content";
import { sendVerificationEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import {
  EMAIL_VERIFICATION_SETTING_KEY,
  EMAIL_VERIFICATION_TTL_MS,
  buildEmailVerificationUrl,
  emailProviderConfigured,
  normalizeEmailVerificationConfig,
} from "@/lib/email-verification-config";
import { createEmailVerificationToken } from "@/lib/email-verification-token";
import { getTurnstileToken, verifyTurnstile } from "@/lib/turnstile";
import { getErrorMessage, isMissingTableError } from "@/lib/supabase-errors";

// ============================================================
// Types
// ============================================================

type RegisterBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  lang?: unknown;
  turnstileToken?: unknown;
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

/** رسالة خادمية بلغة الواجهة، حتى لا يظهر نص عربي في صفحة إنجليزية. */
function localized(lang: "ar" | "en", ar: string, en: string): string {
  return lang === "en" ? en : ar;
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
  if (!isAllowedMutationOrigin(req)) {
    return NextResponse.json(
      { ok: false, error: "الطلب مرفوض من مصدر غير موثوق." },
      { status: 403 }
    );
  }

  let lang: "ar" | "en" = "ar";

  try {
    let body: RegisterBody;

    try {
      body = (await req.json()) as RegisterBody;
    } catch {
      return badRequestResponse(
        localized(lang, "صيغة الطلب غير صحيحة.", "Invalid request body.")
      );
    }

    const name = String(body.name || "").trim().slice(0, 120);
    const email = normalizeAuthEmail(body.email);
    const password =
      typeof body.password === "string" ? body.password : "";
    lang = normalizeLang(body.lang);

    if (!name) {
      return badRequestResponse(
        localized(lang, "الاسم مطلوب.", "Name is required.")
      );
    }

    if (!email || !password) {
      return badRequestResponse(
        localized(
          lang,
          "البريد الإلكتروني وكلمة المرور مطلوبان.",
          "Email and password are required."
        )
      );
    }

    if (!isValidAuthEmail(email)) {
      return badRequestResponse(
        localized(
          lang,
          "صيغة البريد الإلكتروني غير صحيحة.",
          "Invalid email address."
        )
      );
    }

    const passwordCheck = validatePasswordStrength(password);

    if (!passwordCheck.ok) {
      return badRequestResponse(
        localized(
          lang,
          "كلمة المرور غير قوية بما يكفي.",
          "Password is not strong enough."
        )
      );
    }

    const turnstile = await verifyTurnstile(
      getTurnstileToken(body as Record<string, unknown>)
    );
    if (!turnstile.ok) {
      return badRequestResponse(
        localized(
          lang,
          "فشل التحقق الأمني. حاول مرة أخرى.",
          "Security verification failed. Please try again."
        )
      );
    }

    let client: any;

    try {
      client = createAdminClient();
    } catch (error) {
      console.error("[Register] Supabase client error:", error);
      return serverErrorResponse(
        localized(
          lang,
          "الإعدادات الخادمية غير مكتملة.",
          "Server configuration is incomplete."
        )
      );
    }

    // --------------------------------------------------------
    // Check existing email
    // --------------------------------------------------------

    const adminExisting = await queryRowByEmail(client, "admin_users", email);

    if (adminExisting.error) {
      console.error("[Register] admin_users check error:", adminExisting.error);
      return serverErrorResponse(
        localized(
          lang,
          "حدث خطأ في الخادم. حاول لاحقًا.",
          "Server error. Please try again later."
        )
      );
    }

    if (adminExisting.data) {
      return conflictResponse(
        localized(
          lang,
          "هذا البريد الإلكتروني مستخدم بالفعل.",
          "This email is already in use."
        )
      );
    }

    const userExisting = await queryRowByEmail(client, "users", email);

    if (userExisting.error) {
      console.error("[Register] users check error:", userExisting.error);
      return serverErrorResponse(
        localized(
          lang,
          "حدث خطأ في الخادم. حاول لاحقًا.",
          "Server error. Please try again later."
        )
      );
    }

    if (userExisting.data) {
      return conflictResponse(
        localized(
          lang,
          "هذا البريد الإلكتروني مسجل بالفعل.",
          "This email is already registered."
        )
      );
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
        password_hash: hashedPassword,
        salt: "",
        role: "user",
        is_active: true,
        created_at: createdAt,
      },
      {
        email,
        name,
        password: hashedPassword,
        salt: "",
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
      return serverErrorResponse(
        localized(lang, "جدول المستخدمين غير موجود.", "Users table is missing.")
      );
    }

    if (duplicate) {
      return conflictResponse(
        localized(
          lang,
          "هذا البريد الإلكتروني مسجل بالفعل.",
          "This email is already registered."
        )
      );
    }

    if (!insertSucceeded) {
      console.error("[Register] insert failed:", lastError);
      return serverErrorResponse(
        localized(lang, "تعذر إنشاء الحساب.", "Could not create the account.")
      );
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

    // --------------------------------------------------------
    // تفعيل البريد — قابل للتحكم من لوحة التحكم.
    // لا نُقفل الحساب إذا لم يُنفَّذ الترحيل أو تعطّل مزوّد البريد.
    // --------------------------------------------------------

    let verificationSent = false;

    if (inserted?.id) {
      try {
        const config = normalizeEmailVerificationConfig(
          (await getSiteSettings())[EMAIL_VERIFICATION_SETTING_KEY]
        );

        if (config.enabled && emailProviderConfigured(process.env)) {
          const { token, hash } = createEmailVerificationToken();
          const now = new Date();
          const expiresAt = new Date(now.getTime() + EMAIL_VERIFICATION_TTL_MS);

          const { error: verificationError } = await client
            .from("users")
            .update({
              email_verified: false,
              email_verified_at: null,
              email_verification_token_hash: hash,
              email_verification_expires_at: expiresAt.toISOString(),
              email_verification_sent_at: now.toISOString(),
            })
            .eq("id", inserted.id);

          if (verificationError) {
            // الترحيل غير منفّذ بعد: نُبقي الحساب مفعّلًا بدل إقفاله.
            console.warn(
              "[Register] email verification columns missing; account kept verified.",
              verificationError
            );
          } else {
            const sent = await sendVerificationEmail(
              email,
              buildEmailVerificationUrl(SITE_URL, lang, token),
              lang
            );

            if (sent.ok) {
              verificationSent = true;
            } else {
              console.error("[Register] verification email failed:", sent.error);

              // عطل مؤقت في مزوّد البريد لا يجب أن يمنع الدخول.
              await client
                .from("users")
                .update({
                  email_verified: true,
                  email_verification_token_hash: null,
                  email_verification_expires_at: null,
                })
                .eq("id", inserted.id);
            }
          }
        }
      } catch (error) {
        console.warn("[Register] verification setup skipped:", error);
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
      verificationSent,
      message: verificationSent
        ? localized(
            lang,
            "تم إنشاء الحساب. أرسلنا رابط تفعيل إلى بريدك الإلكتروني.",
            "Account created. We sent a verification link to your email."
          )
        : inserted?.id
          ? localized(
              lang,
              "تم إنشاء الحساب وتسجيل الدخول.",
              "Account created and signed in."
            )
          : localized(
              lang,
              "تم إنشاء الحساب. يرجى تسجيل الدخول.",
              "Account created. Please sign in."
            ),
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
              verificationSent,
              message: localized(
                lang,
                "تم إنشاء الحساب، لكن تعذر تسجيل الدخول تلقائيًا. سجّل دخولك يدويًا.",
                "Account created, but automatic sign-in failed. Please sign in manually."
              ),
            },
            { status: 201 }
          )
        );
      }
    }

    return withSecurityHeaders(res);
  } catch (error) {
    console.error("[Register] unexpected error:", error);
    return serverErrorResponse(
      localized(
        lang,
        "حدث خطأ في الخادم. حاول لاحقًا.",
        "Server error. Please try again later."
      )
    );
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
