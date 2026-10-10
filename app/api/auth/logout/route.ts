// app/api/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Configuration
// ============================================================

const isProduction = process.env.NODE_ENV === "production";

const COOKIES_TO_CLEAR = [
  "user_session",
  "admin_session",
];

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

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

function getUserAgent(req: NextRequest): string {
  return req.headers.get("user-agent") || "unknown";
}

function getSiteHost(): string | null {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    return null;
  }

  try {
    return new URL(siteUrl).hostname;
  } catch {
    return null;
  }
}

/**
 * CSRF Protection
 * في الإنتاج: نطلب Origin أو Referer مطابق للنطاق المسموح.
 * في التطوير: نسمح بكل الطلبات لتسهيل الاختبار.
 */
function isAllowedOrigin(req: NextRequest): boolean {
  if (!isProduction) {
    return true;
  }

  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");

  const candidate = originHeader || refererHeader;

  if (!candidate) {
    return false;
  }

  try {
    const url = new URL(candidate);
    const hostname = url.hostname;

    const siteHost = getSiteHost();

    const allowedHosts = [
      siteHost,
      ...ALLOWED_ORIGINS,
    ].filter(Boolean) as string[];

    return allowedHosts.some((host) => {
      return hostname === host || hostname.endsWith(`.${host}`);
    });
  } catch {
    return false;
  }
}

function getSessionSecret(role: "user" | "admin"): string {
  if (role === "admin") {
    return (
      process.env.ADMIN_SESSION_SECRET ||
      process.env.APP_SESSION_SECRET ||
      process.env.JWT_SECRET ||
      ""
    );
  }

  return (
    process.env.USER_SESSION_SECRET ||
    process.env.APP_SESSION_SECRET ||
    process.env.JWT_SECRET ||
    ""
  );
}

/**
 * قراءة الجلسة الموقّعة فقط لاستخراج بيانات التسجيل.
 * لا نمنع Logout لو الجلسة تالفة، بل نمسح الـ Cookie على أي حال.
 */
function parseSignedSession(
  token: string | undefined,
  secret: string
): {
  userId?: string;
  email?: string;
  role?: string;
  jti?: string;
} | null {
  if (!token || !secret) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const [header, body, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf-8")
    );

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
    };
  } catch {
    return null;
  }
}

function deleteCookie(
  res: NextResponse,
  name: string
): void {
  res.cookies.set(name, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
}

async function logLogout(params: {
  role?: string | null;
  email?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  ip: string;
  userAgent: string;
  reason?: string;
}): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    return;
  }

  try {
    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });

    await supabase.from("auth_logout_events").insert({
      role: params.role ?? null,
      email: params.email ?? null,
      user_id: params.userId ?? null,
      session_id: params.sessionId ?? null,
      ip: params.ip,
      user_agent: params.userAgent,
      reason: params.reason ?? "logout",
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Logout] Failed to write audit log:", error);
  }
}

// ============================================================
// POST /api/logout
// ============================================================

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    // 1) CSRF Check
    if (!isAllowedOrigin(req)) {
      return NextResponse.json(
        {
          ok: false,
          error: "طلب غير مصرح به",
        },
        { status: 403 }
      );
    }

    // 2) استخراج بيانات الجلسة للتسجيل فقط
    const userCookie = req.cookies.get("user_session")?.value;
    const adminCookie = req.cookies.get("admin_session")?.value;

    const userSecret = getSessionSecret("user");
    const adminSecret = getSessionSecret("admin");

    const userSession = parseSignedSession(userCookie, userSecret);
    const adminSession = parseSignedSession(adminCookie, adminSecret);

    const sessionForLog = adminSession || userSession;

    // 3) مسح كل Cookies الخاصة بالدخول
    const res = NextResponse.json(
      {
        ok: true,
        message: "تم تسجيل الخروج بنجاح",
      },
      { status: 200 }
    );

    for (const cookieName of COOKIES_TO_CLEAR) {
      deleteCookie(res, cookieName);
    }

    // 4) Security headers
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // 5) Audit Log اختياري
    await logLogout({
      role: sessionForLog?.role ?? null,
      email: sessionForLog?.email ?? null,
      userId: sessionForLog?.userId ?? null,
      sessionId: sessionForLog?.jti ?? null,
      ip,
      userAgent,
      reason: sessionForLog ? "logout" : "logout_no_valid_session",
    });

    return res;
  } catch (error) {
    console.error("[Logout] Unexpected error:", error);

    // حتى لو حدث خطأ، نمسح الـ Cookies للأمان
    const res = NextResponse.json(
      {
        ok: true,
        message: "تم تسجيل الخروج",
      },
      { status: 200 }
    );

    for (const cookieName of COOKIES_TO_CLEAR) {
      deleteCookie(res, cookieName);
    }

    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");

    return res;
  }
}

// ============================================================
// GET: Method Not Allowed
// ============================================================

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: "Method not allowed",
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
      },
    }
  );
}