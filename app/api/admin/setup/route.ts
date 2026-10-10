// app/api/admin/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/auth";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Configuration
// ============================================================

const isProduction = process.env.NODE_ENV === "production";

const DISABLE_ADMIN_SETUP =
  process.env.DISABLE_ADMIN_SETUP === "true" ||
  process.env.NEXT_PUBLIC_DISABLE_ADMIN_SETUP === "true";

const SETUP_TOKEN = process.env.ADMIN_SETUP_TOKEN?.trim() || "";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;

// ============================================================
// In-memory rate limiter
// ملاحظة: في الإنتاج مع serverless يفضل استخدام Redis/Upstash
// ============================================================

type RateRecord = {
  attempts: number;
  resetAt: number;
};

const rateLimitMap = new Map<string, RateRecord>();

function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfter?: number;
} {
  cleanupRateLimit();

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, {
      attempts: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return { allowed: true };
  }

  if (record.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.attempts += 1;
  return { allowed: true };
}

// ============================================================
// Helpers
// ============================================================

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function secureJson(data: unknown, status = 200) {
  const res = NextResponse.json(data, { status });

  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return res;
}

function methodNotAllowed() {
  const res = NextResponse.json(
    {
      ok: false,
      error: "Method not allowed",
    },
    { status: 405 }
  );

  res.headers.set("Allow", "GET, POST");
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Content-Type-Options", "nosniff");

  return res;
}

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  if (bufA.length !== bufB.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function getSetupToken(
  req: NextRequest,
  bodyToken?: unknown
): string | null {
  const headerToken = req.headers.get("x-admin-setup-token");
  if (headerToken?.trim()) {
    return headerToken.trim();
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  const queryToken = req.nextUrl.searchParams.get("token");
  if (queryToken?.trim()) {
    return queryToken.trim();
  }

  if (typeof bodyToken === "string" && bodyToken.trim()) {
    return bodyToken.trim();
  }

  return null;
}

function isSetupTokenValid(token: string | null): boolean {
  if (!SETUP_TOKEN) {
    return false;
  }

  if (!token) {
    return false;
  }

  return safeCompare(token, SETUP_TOKEN);
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(
  password: string
): { valid: boolean; error?: string } {
  const minLength = isProduction ? 12 : 8;

  if (password.length < minLength) {
    return {
      valid: false,
      error: `كلمة المرور يجب ألا تقل عن ${minLength} أحرف`,
    };
  }

  if (isProduction) {
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
      return {
        valid: false,
        error: "كلمة المرور يجب أن تحتوي على حروف وأرقام",
      };
    }
  }

  return { valid: true };
}

async function checkAdminExists(): Promise<{
  exists: boolean;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();

    const { count, error } = await supabase
      .from("admin_users")
      .select("id", { count: "exact", head: true });

    if (error) {
      return {
        exists: false,
        error: error.message,
      };
    }

    return {
      exists: (count ?? 0) > 0,
    };
  } catch (err) {
    return {
      exists: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function hashPassword(
  password: string
): Promise<{
  hash: string;
  salt: string | null;
  method: "bcrypt" | "sha256";
}> {
  // الأفضل: bcryptjs
  try {
    const bcryptModule = await import("bcryptjs");
    const bcrypt = (bcryptModule as any).default ?? bcryptModule;

    const hash = await bcrypt.hash(password, 12);

    return {
      hash,
      salt: null,
      method: "bcrypt",
    };
  } catch {
    // Fallback متوافق مع login الحالي: SHA-256 + salt
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");

    return {
      hash,
      salt,
      method: "sha256",
    };
  }
}

// ============================================================
// GET: status check
// ============================================================

export async function GET(req: NextRequest) {
  try {
    if (DISABLE_ADMIN_SETUP) {
      return secureJson(
        {
          ok: false,
          setupEnabled: false,
          reason: "disabled",
        },
        403
      );
    }

    const token = getSetupToken(req);
    const tokenValid = isSetupTokenValid(token);

    const { exists: adminExists, error } = await checkAdminExists();

    if (error) {
      return secureJson(
        {
          ok: false,
          setupEnabled: false,
          error: "تعذر التحقق من حالة الإعداد",
        },
        503
      );
    }

    // إذا كان التوكن صحيحًا، أعطِ حالة كاملة للمشرف
    if (tokenValid) {
      return secureJson({
        ok: true,
        setupEnabled: true,
        adminExists,
        tokenConfigured: Boolean(SETUP_TOKEN),
      });
    }

    // في التطوير فقط:允许 bootstrap أول أدمن بدون token إذا لا يوجد أدمن
    if (!isProduction && !SETUP_TOKEN && !adminExists) {
      return secureJson({
        ok: true,
        setupEnabled: true,
        adminExists: false,
        mode: "development-bootstrap",
      });
    }

    return secureJson(
      {
        ok: false,
        setupEnabled: false,
        reason: adminExists ? "admin_exists" : "token_required",
      },
      403
    );
  } catch (err) {
    console.error("[AdminSetup] GET error:", err);

    return secureJson(
      {
        ok: false,
        error: "خطأ غير متوقع",
      },
      500
    );
  }
}

// ============================================================
// POST: create admin
// ============================================================

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    // 1) تعطيل كامل
    if (DISABLE_ADMIN_SETUP) {
      return secureJson(
        {
          ok: false,
          error: "إنشاء الأدمن معطل حاليًا",
        },
        403
      );
    }

    // 2) Rate limit
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return secureJson(
        {
          ok: false,
          error: "تم تجاوز عدد المحاولات المسموح. حاول لاحقًا.",
          retryAfter: rate.retryAfter,
        },
        429
      );
    }

    // 3) Parse body
    const body = await req.json().catch(() => ({}));

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");
    const fullName = String(
      body.fullName || body.full_name || "Administrator"
    ).trim();

    const bodyToken = body.setupToken ?? body.token;

    // 4) Validate basic input
    if (!email || !password) {
      return secureJson(
        {
          ok: false,
          error: "البريد الإلكتروني وكلمة المرور مطلوبان",
        },
        400
      );
    }

    if (!validateEmail(email)) {
      return secureJson(
        {
          ok: false,
          error: "صيغة البريد الإلكتروني غير صحيحة",
        },
        400
      );
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return secureJson(
        {
          ok: false,
          error: passwordCheck.error,
        },
        400
      );
    }

    // 5) Token policy
    const token = getSetupToken(req, bodyToken);
    const tokenValid = isSetupTokenValid(token);

    const { exists: adminExists, error: adminCheckError } =
      await checkAdminExists();

    if (adminCheckError) {
      console.error("[AdminSetup] admin exists check error:", adminCheckError);

      return secureJson(
        {
          ok: false,
          error: "تعذر التحقق من حالة الأدمن الحالي",
        },
        503
      );
    }

    // إذا لم يكن هناك SETUP_TOKEN:
    // - في الإنتاج: ممنوع تمامًا
    // - في التطوير: مسموح فقط إذا لا يوجد أدمن
    if (!SETUP_TOKEN) {
      if (isProduction) {
        return secureJson(
          {
            ok: false,
            error: "الإعداد غير مسموح في الإنتاج بدون ADMIN_SETUP_TOKEN",
          },
          403
        );
      }

      if (adminExists) {
        return secureJson(
          {
            ok: false,
            error: "يوجد أدمن بالفعل. لا يمكن إنشاء أدمن جديد بدون توكن.",
          },
          403
        );
      }
    } else {
      // إذا كان SETUP_TOKEN مضبوطًا، لازم يكون صحيحًا
      if (!tokenValid) {
        return secureJson(
          {
            ok: false,
            error: "توكن الإعداد غير صحيح",
          },
          403
        );
      }
    }

    // 6) Hash password
    const { hash, salt } = await hashPassword(password);

    // 7) Insert into admin_users
    const supabase = createAdminClient();

    const { data: createdAdmin, error: insertError } = await supabase
      .from("admin_users")
      .insert({
        email,
        name: fullName || "Administrator",
        password_hash: hash,
        salt,
        role: "admin",
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select("id, email, name, role")
      .single();

    if (insertError) {
      console.error("[AdminSetup] insert error:", insertError);

      const isDuplicate =
        insertError.code === "23505" ||
        /duplicate key value/i.test(insertError.message || "");

      if (isDuplicate) {
        return secureJson(
          {
            ok: false,
            error: "هذا البريد الإلكتروني مسجل بالفعل كأدمن",
          },
          409
        );
      }

      return secureJson(
        {
          ok: false,
          error: "فشل إنشاء حساب الأدمن",
        },
        500
      );
    }

    // 8) Optional mirror to Supabase Auth / profiles
    // لا نفشل الطلب لو هذا الجزء فشل، لأن login يعتمد على admin_users
    if (process.env.MIRROR_ADMIN_TO_SUPABASE_AUTH === "true") {
      try {
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName || "Administrator",
            role: "admin",
          },
        });
      } catch (authErr) {
        console.warn("[AdminSetup] Supabase Auth mirror failed:", authErr);
      }

      try {
        await supabase
          .from("profiles")
          .upsert(
            {
              id: createdAdmin.id,
              email,
              full_name: fullName || "Administrator",
              role: "admin",
              created_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
      } catch (profileErr) {
        console.warn("[AdminSetup] profiles mirror failed:", profileErr);
      }
    }

    console.info("[AdminSetup] Admin created successfully:", {
      email,
      ip,
    });

    return secureJson(
      {
        ok: true,
        success: true,
        userId: createdAdmin.id,
        email: createdAdmin.email,
        name: createdAdmin.name,
        role: createdAdmin.role,
      },
      201
    );
  } catch (err) {
    console.error("[AdminSetup] Unexpected error:", err);

    return secureJson(
      {
        ok: false,
        error: "فشل إنشاء الأدمن بشكل غير متوقع",
      },
      500
    );
  }
}

// ============================================================
// Block other methods
// ============================================================

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}