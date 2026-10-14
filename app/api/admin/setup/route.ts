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

/**
 * افتراضياً: الصفحة تنشئ "أول" أدمن فقط.
 * لو عايز تضيف أدمن تاني بالتوكن، ضبط ALLOW_ADDITIONAL_ADMINS=true مؤقتاً.
 */
const ALLOW_ADDITIONAL_ADMINS =
  process.env.ALLOW_ADDITIONAL_ADMINS === "true";

/** التوكن مطلوب دائماً في الإنتاج، وفي التطوير لو اتضبط */
const TOKEN_REQUIRED = isProduction || Boolean(SETUP_TOKEN);

const WINDOW_MS = 10 * 60 * 1000; // 10 دقائق
const MAX_FAILED_TOKEN_ATTEMPTS = 5; // محاولات توكن فاشلة لكل IP
const MAX_POST_REQUESTS = 20; // إجمالي طلبات POST لكل IP

// ============================================================
// Rate limiting (in-memory)
// ملاحظة: على Vercel كل instance له ذاكرة منفصلة، فده تخفيف مش حماية كاملة.
// الحماية الحقيقية = توكن طويل عشوائي (32+ حرف) + تعطيل الصفحة بعد الاستخدام.
// ============================================================

type Counter = { count: number; resetAt: number };

const failMap = new Map<string, Counter>();
const postMap = new Map<string, Counter>();

function cleanup(map: Map<string, Counter>) {
  const now = Date.now();
  for (const [key, value] of map.entries()) {
    if (value.resetAt <= now) map.delete(key);
  }
}

/** بيرجّع عدد الثواني المتبقية لو الـ IP محظور، وإلا null */
function blockedFor(map: Map<string, Counter>, ip: string, max: number) {
  cleanup(map);
  const record = map.get(ip);
  if (record && record.count >= max) {
    return Math.max(1, Math.ceil((record.resetAt - Date.now()) / 1000));
  }
  return null;
}

function hit(map: Map<string, Counter>, ip: string) {
  const now = Date.now();
  const record = map.get(ip);

  if (!record || record.resetAt <= now) {
    map.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    record.count += 1;
  }
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

function secureJson(data: unknown, status = 200, retryAfter?: number) {
  const res = NextResponse.json(data, { status });

  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");

  if (retryAfter) {
    res.headers.set("Retry-After", String(retryAfter));
  }

  return res;
}

function methodNotAllowed() {
  const res = secureJson({ ok: false, error: "Method not allowed" }, 405);
  res.headers.set("Allow", "GET, POST");
  return res;
}

function tooMany(retryAfter: number) {
  return secureJson(
    {
      ok: false,
      reason: "rate_limited",
      error: "تم تجاوز عدد المحاولات المسموح. حاول لاحقًا.",
      retryAfter,
    },
    429,
    retryAfter
  );
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  if (bufA.length !== bufB.length) return false;

  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * التوكن من الـ headers أو الـ body فقط.
 * شلنا ?token= من الـ query string لأنه بيتسجل في اللوجز وتاريخ المتصفح.
 */
function getSetupToken(req: NextRequest, bodyToken?: unknown): string | null {
  const headerToken = req.headers.get("x-admin-setup-token");
  if (headerToken?.trim()) return headerToken.trim();

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  if (typeof bodyToken === "string" && bodyToken.trim()) {
    return bodyToken.trim();
  }

  return null;
}

function isSetupTokenValid(token: string | null): boolean {
  if (!SETUP_TOKEN || !token) return false;
  return safeCompare(token, SETUP_TOKEN);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  const minLength = isProduction ? 12 : 8;

  if (password.length < minLength) {
    return {
      valid: false,
      error: `كلمة المرور يجب ألا تقل عن ${minLength} أحرف`,
    };
  }

  if (password.length > 128) {
    return { valid: false, error: "كلمة المرور طويلة جدًا" };
  }

  if (isProduction) {
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return {
        valid: false,
        error: "كلمة المرور يجب أن تحتوي على حروف وأرقام",
      };
    }
  }

  return { valid: true };
}

async function checkAdminExists(): Promise<{ exists: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { count, error } = await supabase
      .from("admin_users")
      .select("id", { count: "exact", head: true });

    if (error) return { exists: false, error: error.message };

    return { exists: (count ?? 0) > 0 };
  } catch (err) {
    return {
      exists: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function hashPassword(
  password: string
): Promise<{ hash: string; salt: string | null }> {
  try {
    const bcryptModule = await import("bcryptjs");
    const bcrypt = (bcryptModule as any).default ?? bcryptModule;

    return { hash: await bcrypt.hash(password, 12), salt: null };
  } catch (err) {
    // في الإنتاج ممنوع ننزل لتشفير أضعف بصمت
    if (isProduction) {
      throw err;
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");

    return { hash, salt };
  }
}

// ============================================================
// GET: status check
// لا نكشف أي معلومة (وجود أدمن من عدمه) إلا بعد التحقق من التوكن
// ============================================================

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    if (DISABLE_ADMIN_SETUP) {
      return secureJson({ ok: false, setupEnabled: false, reason: "disabled" }, 403);
    }

    if (TOKEN_REQUIRED) {
      if (!SETUP_TOKEN) {
        // في الإنتاج بدون ADMIN_SETUP_TOKEN → الإعداد مقفول تماماً
        return secureJson(
          {
            ok: false,
            setupEnabled: false,
            reason: "disabled",
            error: "الإعداد غير متاح (ADMIN_SETUP_TOKEN غير مضبوط).",
          },
          403
        );
      }

      const token = getSetupToken(req);

      if (!token) {
        return secureJson(
          { ok: false, setupEnabled: false, reason: "token_required" },
          403
        );
      }

      // الـ GET مع توكن كان ممكن يُستخدم لتخمين التوكن بدون حد — دلوقتي بيتحسب
      const blocked = blockedFor(failMap, ip, MAX_FAILED_TOKEN_ATTEMPTS);
      if (blocked) return tooMany(blocked);

      if (!isSetupTokenValid(token)) {
        hit(failMap, ip);
        return secureJson(
          {
            ok: false,
            setupEnabled: false,
            reason: "token_required",
            error: "توكن الإعداد غير صحيح",
          },
          403
        );
      }
    }

    const { exists, error } = await checkAdminExists();

    if (error) {
      return secureJson(
        { ok: false, setupEnabled: false, error: "تعذر التحقق من حالة الإعداد" },
        503
      );
    }

    if (exists && !ALLOW_ADDITIONAL_ADMINS) {
      return secureJson(
        {
          ok: false,
          setupEnabled: false,
          reason: "admin_exists",
          error: "يوجد حساب أدمن بالفعل. لا يمكن استخدام صفحة الإعداد.",
        },
        403
      );
    }

    return secureJson({
      ok: true,
      setupEnabled: true,
      adminExists: exists,
      mode: TOKEN_REQUIRED ? "token" : "development-bootstrap",
    });
  } catch (err) {
    console.error("[AdminSetup] GET error:", err);
    return secureJson({ ok: false, error: "خطأ غير متوقع" }, 500);
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
        { ok: false, reason: "disabled", error: "إنشاء الأدمن معطل حاليًا" },
        403
      );
    }

    // 2) Rate limits
    const postBlocked = blockedFor(postMap, ip, MAX_POST_REQUESTS);
    if (postBlocked) return tooMany(postBlocked);

    const failBlocked = blockedFor(failMap, ip, MAX_FAILED_TOKEN_ATTEMPTS);
    if (failBlocked) return tooMany(failBlocked);

    hit(postMap, ip);

    // 3) Parse body
    const body = await req.json().catch(() => ({}));

    // 4) التوكن أولاً (قبل أي فحص تاني)
    if (TOKEN_REQUIRED) {
      if (!SETUP_TOKEN) {
        return secureJson(
          {
            ok: false,
            reason: "disabled",
            error: "الإعداد غير متاح (ADMIN_SETUP_TOKEN غير مضبوط).",
          },
          403
        );
      }

      const token = getSetupToken(req, body.setupToken ?? body.token);

      if (!isSetupTokenValid(token)) {
        hit(failMap, ip);
        return secureJson(
          { ok: false, reason: "token_required", error: "توكن الإعداد غير صحيح" },
          403
        );
      }
    }

    // 5) يوجد أدمن بالفعل؟
    const { exists, error: adminCheckError } = await checkAdminExists();

    if (adminCheckError) {
      console.error("[AdminSetup] admin exists check error:", adminCheckError);
      return secureJson(
        { ok: false, error: "تعذر التحقق من حالة الأدمن الحالي" },
        503
      );
    }

    if (exists && !ALLOW_ADDITIONAL_ADMINS) {
      return secureJson(
        {
          ok: false,
          reason: "admin_exists",
          error: "يوجد أدمن بالفعل. لا يمكن إنشاء أدمن جديد من هذه الصفحة.",
        },
        403
      );
    }

    // 6) Validate input
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const fullName = String(body.fullName || body.full_name || "Administrator")
      .trim()
      .slice(0, 80);

    if (!email || !password) {
      return secureJson(
        { ok: false, error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        400
      );
    }

    if (!validateEmail(email)) {
      return secureJson(
        { ok: false, error: "صيغة البريد الإلكتروني غير صحيحة" },
        400
      );
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return secureJson({ ok: false, error: passwordCheck.error }, 400);
    }

    // 7) Hash + insert
    const { hash, salt } = await hashPassword(password);

    const supabase = createAdminClient();

    const createdAt = new Date().toISOString();
    const modernInsert = await supabase
      .from("admin_users")
      .insert({
        email,
        name: fullName || "Administrator",
        password_hash: hash,
        salt,
        role: "admin",
        is_active: true,
        created_at: createdAt,
      })
      .select("id, email, name")
      .single();

    let createdAdmin = modernInsert.data;
    let insertError = modernInsert.error;

    // دعم جدول admin_users القديم الموجود قبل إضافة role و is_active.
    if (
      insertError &&
      /(column|schema).*does not exist|Could not find the column/i.test(
        String(insertError.message || "")
      )
    ) {
      const legacyInsert = await supabase
        .from("admin_users")
        .insert({
          email,
          name: fullName || "Administrator",
          password_hash: hash,
          salt,
          created_at: createdAt,
        })
        .select("id, email, name")
        .single();

      createdAdmin = legacyInsert.data;
      insertError = legacyInsert.error;
    }

    if (insertError || !createdAdmin) {
      console.error("[AdminSetup] insert error:", insertError);

      const isDuplicate =
        insertError?.code === "23505" ||
        /duplicate key value/i.test(insertError?.message || "");

      if (isDuplicate) {
        return secureJson(
          { ok: false, error: "هذا البريد الإلكتروني مسجل بالفعل كأدمن" },
          409
        );
      }

      return secureJson({ ok: false, error: "فشل إنشاء حساب الأدمن" }, 500);
    }

    // 8) Optional mirror (لا يفشل الطلب لو فشل)
    if (process.env.MIRROR_ADMIN_TO_SUPABASE_AUTH === "true") {
      try {
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role: "admin" },
        });
      } catch (authErr) {
        console.warn("[AdminSetup] Supabase Auth mirror failed:", authErr);
      }

      try {
        await supabase.from("profiles").upsert(
          {
            id: createdAdmin.id,
            email,
            full_name: fullName,
            role: "admin",
            created_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch (profileErr) {
        console.warn("[AdminSetup] profiles mirror failed:", profileErr);
      }
    }

    failMap.delete(ip);

    console.info("[AdminSetup] Admin created:", { email, ip });

    return secureJson(
      {
        ok: true,
        success: true,
        userId: createdAdmin.id,
        email: createdAdmin.email,
        name: createdAdmin.name,
        role: "admin",
      },
      201
    );
  } catch (err) {
    console.error("[AdminSetup] Unexpected error:", err);
    return secureJson({ ok: false, error: "فشل إنشاء الأدمن بشكل غير متوقع" }, 500);
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
