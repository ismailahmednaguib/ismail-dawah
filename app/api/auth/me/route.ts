// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Configuration
// ============================================================

const isProduction = process.env.NODE_ENV === "production";

/**
 * السماح مؤقتًا بالجلسات القديمة غير الموقّعة (Base64 فقط).
 *
 * ⚠️ مهم:
 * - لا تفعّلها في الإنتاج إلا أثناء الترحيل.
 * - بعد أن يسجّل الجميع الدخول من جديد، اضبطها على false أو احذف المتغير.
 */
const ALLOW_LEGACY_SESSIONS =
  process.env.ALLOW_LEGACY_SESSIONS === "true";

type Role = "admin" | "user";

type SessionPayload = {
  userId?: string;
  email?: string;
  role?: string;
  exp?: number;
  jti?: string;
};

type PublicAdmin = {
  id: string;
  email: string;
  name: string | null;
  role: "admin";
};

type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  lang?: string | null;
  role: "user";
};

// ============================================================
// Helpers
// ============================================================

function getSecret(role: Role): string {
  const appSecret = process.env.APP_SESSION_SECRET;
  const jwtSecret = process.env.JWT_SECRET;

  if (role === "admin") {
    return (
      process.env.ADMIN_SESSION_SECRET ||
      appSecret ||
      jwtSecret ||
      ""
    );
  }

  return (
    process.env.USER_SESSION_SECRET ||
    appSecret ||
    jwtSecret ||
    ""
  );
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * التحقق من الجلسة الموقّعة:
 * header.body.signature
 */
function parseSignedSession(
  token: string | undefined,
  secret: string
): SessionPayload | null {
  if (!token || !secret) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [header, body, signature] = parts;

  if (!header || !body || !signature) {
    return null;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (!safeEqual(signature, expectedSignature)) {
      return null;
    }

    const headerJson = JSON.parse(
      Buffer.from(header, "base64url").toString("utf-8")
    );

    if (headerJson?.alg !== "HS256") {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf-8")
    ) as SessionPayload;

    if (
      typeof payload.exp === "number" &&
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * دعم مؤقت للجلسات القديمة:
 * Base64 فقط بدون توقيع.
 */
function parseLegacySession(
  token: string | undefined
): SessionPayload | null {
  if (!ALLOW_LEGACY_SESSIONS || !token) {
    return null;
  }

  // الجلسات القديمة كانت بدون نقاط.
  // إذا كان فيها نقاط فهي جلسة موقّعة تالفة، لا نعتبرها legacy.
  if (token.includes(".")) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8")
    ) as SessionPayload;

    if (!decoded.userId || !decoded.role) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

function resolveSession(
  token: string | undefined,
  role: Role
): SessionPayload | null {
  if (!token) {
    return null;
  }

  const secret = getSecret(role);

  const signed = parseSignedSession(token, secret);

  if (signed) {
    return signed;
  }

  return parseLegacySession(token);
}

function jsonResponse(body: unknown, status = 200): NextResponse {
  const res = NextResponse.json(body, { status });

  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Vary", "Cookie, Authorization");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return res;
}

function emptyUserResponse(): NextResponse {
  return jsonResponse({ user: null });
}

function methodNotAllowed(): NextResponse {
  const res = NextResponse.json(
    {
      user: null,
      error: "Method not allowed",
    },
    { status: 405 }
  );

  res.headers.set("Allow", "GET");
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Content-Type-Options", "nosniff");

  return res;
}

// ============================================================
// Supabase helpers
// ============================================================

async function fetchAdminById(
  supabase: any,
  id: string
): Promise<PublicAdmin | null> {
  try {
    const primary = await supabase
      .from("admin_users")
      .select("id, email, name, is_active")
      .eq("id", id)
      .maybeSingle();

    if (!primary.error) {
      if (!primary.data) {
        return null;
      }

      if (primary.data.is_active === false) {
        return null;
      }

      return {
        id: primary.data.id,
        email: primary.data.email,
        name: primary.data.name ?? null,
        role: "admin",
      };
    }

    const message = String(primary.error?.message || "");

    // لو عمود is_active غير موجود بعد، أعد المحاولة بدونه.
    if (/is_active/i.test(message)) {
      const secondary = await supabase
        .from("admin_users")
        .select("id, email, name")
        .eq("id", id)
        .maybeSingle();

      if (!secondary.error && secondary.data) {
        return {
          id: secondary.data.id,
          email: secondary.data.email,
          name: secondary.data.name ?? null,
          role: "admin",
        };
      }

      return null;
    }

    // لو الجدول غير موجود، اعتبر أنه لا يوجد أدمن.
    if (
      /does not exist/i.test(message) ||
      /Could not find the table/i.test(message) ||
      /relation/i.test(message)
    ) {
      return null;
    }

    console.error("[AuthMe] admin_users query error:", primary.error);
    return null;
  } catch (error) {
    console.error("[AuthMe] Unexpected admin fetch error:", error);
    return null;
  }
}

async function fetchUserById(
  supabase: any,
  id: string
): Promise<PublicUser | null> {
  try {
    const primary = await supabase
      .from("users")
      .select("id, email, name, lang, is_active")
      .eq("id", id)
      .maybeSingle();

    if (!primary.error) {
      if (!primary.data) {
        return null;
      }

      if (primary.data.is_active === false) {
        return null;
      }

      return {
        id: primary.data.id,
        email: primary.data.email,
        name: primary.data.name ?? null,
        lang: primary.data.lang ?? null,
        role: "user",
      };
    }

    const message = String(primary.error?.message || "");

    // لو عمود is_active غير موجود.
    if (/is_active/i.test(message)) {
      const secondary = await supabase
        .from("users")
        .select("id, email, name, lang")
        .eq("id", id)
        .maybeSingle();

      if (!secondary.error && secondary.data) {
        return {
          id: secondary.data.id,
          email: secondary.data.email,
          name: secondary.data.name ?? null,
          lang: secondary.data.lang ?? null,
          role: "user",
        };
      }

      return null;
    }

    // لو عمود lang غير موجود.
    if (/lang/i.test(message)) {
      const secondary = await supabase
        .from("users")
        .select("id, email, name")
        .eq("id", id)
        .maybeSingle();

      if (!secondary.error && secondary.data) {
        return {
          id: secondary.data.id,
          email: secondary.data.email,
          name: secondary.data.name ?? null,
          role: "user",
        };
      }

      return null;
    }

    // لو الجدول غير موجود.
    if (
      /does not exist/i.test(message) ||
      /Could not find the table/i.test(message) ||
      /relation/i.test(message)
    ) {
      return null;
    }

    console.error("[AuthMe] users query error:", primary.error);
    return null;
  } catch (error) {
    console.error("[AuthMe] Unexpected user fetch error:", error);
    return null;
  }
}

// ============================================================
// GET /api/auth/me
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const adminToken = req.cookies.get("admin_session")?.value;
    const userToken = req.cookies.get("user_session")?.value;

    if (!adminToken && !userToken) {
      return emptyUserResponse();
    }

    const adminPayload = resolveSession(adminToken, "admin");
    const userPayload = resolveSession(userToken, "user");

    const canTryAdmin =
      Boolean(adminPayload?.userId) && adminPayload?.role === "admin";

    const canTryUserSession =
      Boolean(userPayload?.userId) &&
      (userPayload?.role === "admin" || userPayload?.role === "user");

    if (!canTryAdmin && !canTryUserSession) {
      return emptyUserResponse();
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("[AuthMe] Supabase is not configured.");
      return emptyUserResponse();
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    // 1) جرّب admin_session أولًا
    if (canTryAdmin && adminPayload?.userId) {
      const admin = await fetchAdminById(supabase, adminPayload.userId);

      if (admin) {
        return jsonResponse({ user: admin });
      }
    }

    // 2) جرّب user_session
    // قد يكون الأدمن قد سجّل الدخول ووضع أيضًا user_session بدور admin.
    if (canTryUserSession && userPayload?.userId) {
      if (userPayload.role === "admin") {
        const admin = await fetchAdminById(supabase, userPayload.userId);

        if (admin) {
          return jsonResponse({ user: admin });
        }
      }

      if (userPayload.role === "user") {
        const user = await fetchUserById(supabase, userPayload.userId);

        if (user) {
          return jsonResponse({ user });
        }
      }
    }

    return emptyUserResponse();
  } catch (error) {
    console.error("[AuthMe] Unexpected error:", error);
    return emptyUserResponse();
  }
}

// ============================================================
// Block other methods
// ============================================================

export async function POST() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}