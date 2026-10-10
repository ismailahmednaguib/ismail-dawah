// app/api/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Configuration
// ============================================================

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const RATE_WINDOW_MS = positiveNumber(
  process.env.VERIFY_RATE_WINDOW_MS,
  15 * 60 * 1000
);

const MAX_REQUESTS_PER_IP = positiveNumber(
  process.env.VERIFY_MAX_REQUESTS_PER_IP,
  20
);

/**
 * للتوافق مع الكود القديم، مسموح إرسال المفتاح في الـ query:
 *
 *   /api/verify?key=...
 *
 * لكن أمنيًا الأفضل إرساله في Header:
 *
 *   x-admin-key: ...
 *
 * بعد تحديث الواجهة، اضبط:
 *
 *   VERIFY_ALLOW_QUERY_KEY=false
 */
const ALLOW_QUERY_KEY =
  process.env.VERIFY_ALLOW_QUERY_KEY !== "false";

// ============================================================
// Types
// ============================================================

type RateRecord = {
  count: number;
  resetAt: number;
};

// ============================================================
// In-memory Rate Limiter
// ملاحظة: في الإنتاج مع Serverless يفضَّل استخدام Redis/Upstash
// ============================================================

const rateLimitStore = new Map<string, RateRecord>();

function cleanupRateLimitStore(): void {
  const now = Date.now();

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function consumeRateLimit(ip: string): {
  allowed: boolean;
  retryAfter: number;
} {
  cleanupRateLimitStore();

  const now = Date.now();
  const key = `verify:${ip}`;
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_WINDOW_MS,
    });

    return { allowed: true, retryAfter: 0 };
  }

  if (record.count >= MAX_REQUESTS_PER_IP) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;

  return { allowed: true, retryAfter: 0 };
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

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): NextResponse {
  const res = NextResponse.json(body, { status });

  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      res.headers.set(key, value);
    }
  }

  return res;
}

/**
 * مقارنة آمنة ضد timing attacks.
 * نُحوّل القيم إلى SHA-256 أولًا حتى تكون الأطوال متساوية.
 */
function safeCompare(a: string, b: string): boolean {
  try {
    const hashA = crypto.createHash("sha256").update(a, "utf8").digest();
    const hashB = crypto.createHash("sha256").update(b, "utf8").digest();

    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");

  if (!auth) {
    return null;
  }

  const parts = auth.trim().split(" ");

  if (parts.length !== 2) {
    return null;
  }

  const scheme = parts[0]?.toLowerCase();
  const token = parts[1]?.trim();

  if (scheme !== "bearer" || !token) {
    return null;
  }

  return token;
}

function extractProvidedKey(req: NextRequest): string | null {
  // 1) Header مفضل أمنيًا
  const headerKey = req.headers.get("x-admin-key")?.trim();
  if (headerKey) {
    return headerKey;
  }

  // 2) Authorization Bearer
  const bearer = getBearerToken(req);
  if (bearer) {
    return bearer;
  }

  // 3) Query للتوافق القديم فقط إذا كان مسموحًا
  if (ALLOW_QUERY_KEY) {
    const queryKey = req.nextUrl.searchParams.get("key")?.trim();
    if (queryKey) {
      return queryKey;
    }
  }

  return null;
}

// ============================================================
// GET /api/verify
// ============================================================

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    // 1) Rate Limiting
    const rate = consumeRateLimit(ip);

    if (!rate.allowed) {
      return jsonResponse(
        {
          ok: false,
          error: "عدد محاولات التحقق كثير جدًا. حاول لاحقًا.",
        },
        429,
        {
          "Retry-After": String(
            rate.retryAfter || Math.ceil(RATE_WINDOW_MS / 1000)
          ),
        }
      );
    }

    // 2) Expected key
    const expectedKey = process.env.ADMIN_KEY?.trim();

    if (!expectedKey) {
      // لا نكشف أن المفتاح غير مضبوط في البيئة
      return jsonResponse({ ok: false });
    }

    // 3) Provided key
    const providedKey = extractProvidedKey(req);

    if (!providedKey) {
      return jsonResponse({ ok: false });
    }

    // 4) Secure compare
    const ok = safeCompare(providedKey, expectedKey);

    return jsonResponse({ ok });
  } catch (error) {
    console.error("[Verify] Unexpected error:", error);

    return jsonResponse(
      {
        ok: false,
        error: "خطأ غير متوقع.",
      },
      500
    );
  }
}

// ============================================================
// HEAD /api/verify
// ============================================================

export async function HEAD(req: NextRequest) {
  const res = await GET(req);

  return new NextResponse(null, {
    status: res.status,
    headers: res.headers,
  });
}

// ============================================================
// Block other methods
// ============================================================

export async function POST() {
  return jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405,
    {
      Allow: "GET, HEAD",
    }
  );
}

export async function PUT() {
  return jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405,
    {
      Allow: "GET, HEAD",
    }
  );
}

export async function DELETE() {
  return jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405,
    {
      Allow: "GET, HEAD",
    }
  );
}

export async function PATCH() {
  return jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405,
    {
      Allow: "GET, HEAD",
    }
  );
}