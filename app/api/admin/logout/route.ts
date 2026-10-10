// app/api/admin/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";

// ============================================================
// Configuration
// ============================================================

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.JWT_SECRET ||
  "dev-fallback-change-me-in-production-32chars-min!!";

const isProduction = process.env.NODE_ENV === "production";

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

/**
 * التحقق من CSRF عبر Origin / Referer
 */
function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";

  if (!isProduction) {
    return true;
  }

  if (!origin) {
    return false;
  }

  try {
    const url = new URL(origin);

    const allowedHosts = [
      ...ALLOWED_ORIGINS,
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, ""),
    ].filter(Boolean) as string[];

    return allowedHosts.some((host) => url.hostname.endsWith(host));
  } catch {
    return false;
  }
}

/**
 * قراءة الـ session والتحقق من توقيعه
 */
function readSession(token: string): {
  valid: boolean;
  payload?: {
    userId?: string;
    email?: string;
    role?: string;
    jti?: string;
    exp?: number;
  };
} {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return { valid: false };
    }

    const [header, body, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return { valid: false };
    }

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf-8")
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }

    return {
      valid: true,
      payload,
    };
  } catch {
    return { valid: false };
  }
}

/**
 * تسجيل عملية الخروج في Audit Log
 */
async function logLogout(params: {
  userId?: string;
  email?: string;
  ip: string;
  userAgent: string;
  sessionId?: string;
  success: boolean;
  reason?: string;
}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    return;
  }

  try {
    const supabase = createClient(url, key);

    await supabase.from("admin_login_attempts").insert({
      email: params.email || "unknown",
      ip: params.ip,
      user_agent: params.userAgent,
      success: params.success,
      failure_reason: params.success
        ? `logout${params.reason ? ":" + params.reason : ""}`
        : `logout_failed:${params.reason || "unknown"}`,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[AdminLogout] Failed to write audit log:", err);
  }
}

/**
 * إنشاء response موحد لمسح كل cookies الخاصة بالدخول
 */
function createLogoutResponse(message: string, status = 200) {
  const res = NextResponse.json(
    {
      ok: status < 400,
      message,
    },
    { status }
  );

  const cookiesToClear = [
    "admin_session",
    "session",
    "auth_token",
    "user_session",
  ];

  for (const cookieName of cookiesToClear) {
    res.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });
  }

  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return res;
}

// ============================================================
// Main Handler
// ============================================================

async function handleLogout(req: NextRequest) {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);

  const sessionCookie = req.cookies.get("admin_session");

  // CSRF check للـ POST فقط
  if (req.method === "POST" && !validateOrigin(req)) {
    await logLogout({
      ip,
      userAgent,
      success: false,
      reason: "csrf_failed",
    });

    return NextResponse.json(
      {
        ok: false,
        error: "طلب غير مصرح به",
      },
      { status: 403 }
    );
  }

  // لا يوجد session
  if (!sessionCookie?.value) {
    await logLogout({
      ip,
      userAgent,
      success: true,
      reason: "no_session",
    });

    return createLogoutResponse("تم تسجيل الخروج بنجاح");
  }

  const session = readSession(sessionCookie.value);

  if (session.valid && session.payload) {
    await logLogout({
      userId: session.payload.userId,
      email: session.payload.email,
      sessionId: session.payload.jti,
      ip,
      userAgent,
      success: true,
    });
  } else {
    await logLogout({
      ip,
      userAgent,
      success: true,
      reason: "invalid_session",
    });
  }

  return createLogoutResponse("تم تسجيل الخروج بنجاح");
}

// ============================================================
// Route Handlers
// ============================================================

export async function POST(req: NextRequest) {
  try {
    return await handleLogout(req);
  } catch (err) {
    console.error("[AdminLogout] Unexpected error:", err);

    // حتى في حالة الخطأ، امسح الـ cookies للأمان
    return createLogoutResponse("تم تسجيل الخروج", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    return await handleLogout(req);
  } catch (err) {
    console.error("[AdminLogout] Unexpected error:", err);
    return createLogoutResponse("تم تسجيل الخروج", 500);
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405,
      headers: {
        Allow: "GET, POST",
      },
    }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405,
      headers: {
        Allow: "GET, POST",
      },
    }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405,
      headers: {
        Allow: "GET, POST",
      },
    }
  );
}