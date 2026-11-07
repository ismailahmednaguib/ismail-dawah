// app/api/download/android/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Configuration
// ============================================================

const DEFAULT_APK_URL =
  "https://fwzasbyojjxycxvuvleo.supabase.co/storage/v1/object/public/site/app/ismail-dawah.apk";

const APK_URL =
  process.env.ANDROID_APK_URL ||
  process.env.NEXT_PUBLIC_ANDROID_APK_URL ||
  DEFAULT_APK_URL;

const FILENAME = sanitizeFilename(
  process.env.ANDROID_APK_FILENAME || "ismail-dawah.apk"
);

const isProduction = process.env.NODE_ENV === "production";

/**
 * إذا أردت تحويل المستخدم مباشرة إلى رابط Supabase بدل تمرير الملف عبر السيرفر.
 * هذا هو الخيار الأفضل على Vercel للملفات الكبيرة.
 */
const REDIRECT_MODE = process.env.ANDROID_APK_REDIRECT === "true";

/**
 * حد أقصى لحجم APK بالبايت.
 * افتراضيًا 500MB.
 */
const MAX_APK_BYTES = Number(
  process.env.ANDROID_APK_MAX_BYTES || 500 * 1024 * 1024
);

/**
 *timeout للطلب الخارجي بالمللي ثانية.
 */
const FETCH_TIMEOUT_MS = Number(
  process.env.ANDROID_APK_FETCH_TIMEOUT_MS || 15000
);

/**
 * النطاقات المسموح سحب APK منها.
 * افتراضيًا supabase.co.
 *
 * مثال:
 * ANDROID_APK_ALLOWED_HOSTS=supabase.co,mycdn.com,example.com
 */
const ALLOWED_HOSTS = new Set(
  (process.env.ANDROID_APK_ALLOWED_HOSTS || "supabase.co")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)
);

if (ALLOWED_HOSTS.size === 0) {
  ALLOWED_HOSTS.add("supabase.co");
}

// ============================================================
// Rate Limiting
// ملاحظة: في الإنتاج مع Serverless يُفضَّل استخدام Redis/Upstash
// ============================================================

const RATE_WINDOW_MS = 5 * 60 * 1000; // 5 دقائق
const MAX_REQUESTS_PER_IP = 30;

type RateRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateRecord>();

function cleanupRateLimitStore() {
  const now = Date.now();

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function checkRateLimit(ip: string): boolean {
  cleanupRateLimitStore();

  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_WINDOW_MS,
    });

    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_IP) {
    return false;
  }

  record.count += 1;

  return true;
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

function sanitizeFilename(value: string): string {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 100);

  if (!cleaned) {
    return "ismail-dawah.apk";
  }

  return cleaned.toLowerCase().endsWith(".apk")
    ? cleaned
    : `${cleaned}.apk`;
}

function isPrivateOrLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    host.startsWith("172.16.") ||
    host.startsWith("172.17.") ||
    host.startsWith("172.18.") ||
    host.startsWith("172.19.") ||
    host.startsWith("172.2") ||
    host.startsWith("172.30.") ||
    host.startsWith("172.31.")
  ) {
    return true;
  }

  // IPv4 literal
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
    return true;
  }

  // IPv6 literal
  if (host.includes(":")) {
    return true;
  }

  return false;
}

function validateApkUrl(
  urlString: string
): { ok: true; url: URL } | { ok: false; reason: string } {
  try {
    const url = new URL(urlString);

    if (isProduction && url.protocol !== "https:") {
      return { ok: false, reason: "https_required" };
    }

    if (!isProduction && url.protocol !== "https:" && url.protocol !== "http:") {
      return { ok: false, reason: "invalid_protocol" };
    }

    const hostname = url.hostname.toLowerCase();

    if (isPrivateOrLocalHostname(hostname)) {
      return { ok: false, reason: "private_host_not_allowed" };
    }

    const allowed = Array.from(ALLOWED_HOSTS).some((allowedHost) => {
      return (
        hostname === allowedHost || hostname.endsWith(`.${allowedHost}`)
      );
    });

    if (!allowed) {
      return { ok: false, reason: "host_not_allowed" };
    }

    if (!url.pathname.toLowerCase().endsWith(".apk")) {
      return { ok: false, reason: "not_apk_file" };
    }

    return { ok: true, url };
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
}

function securityHeaders(): Headers {
  const headers = new Headers();

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Cache-Control", "no-store");

  return headers;
}

function textResponse(
  message: string,
  status: number,
  extraHeaders?: Headers
): NextResponse {
  const headers = extraHeaders || securityHeaders();

  headers.set("Content-Type", "text/plain; charset=utf-8");

  return new NextResponse(message, {
    status,
    headers,
  });
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================
const MAX_UPSTREAM_REDIRECTS = 3;

async function fetchValidatedApk(url: URL, init: RequestInit): Promise<Response> {
  let current = url;
  for (let attempt = 0; attempt <= MAX_UPSTREAM_REDIRECTS; attempt += 1) {
    const response = await fetchWithTimeout(current.toString(), { ...init, redirect: "manual" });
    if (response.status < 300 || response.status >= 400) return response;
    const location = response.headers.get("location");
    if (!location) return response;
    const next = validateApkUrl(new URL(location, current).toString());
    if (!next.ok) throw new Error("unsafe_apk_redirect_" + next.reason);
    current = next.url;
  }
  throw new Error("too_many_apk_redirects");
}
// GET /api/download/android
// ============================================================

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    // 1) Rate Limiting
    if (!checkRateLimit(ip)) {
      return textResponse(
        "Too many download requests. Please try again later.",
        429
      );
    }

    // 2) Validate APK URL
    const validation = validateApkUrl(APK_URL);

    if (!validation.ok) {
      console.error("[AndroidDownload] Invalid APK URL:", validation.reason);

      return textResponse(
        "APK download is temporarily unavailable.",
        500
      );
    }

    const apkUrl = validation.url.toString();

    // 3) Redirect mode — recommended for Vercel / large files
    if (REDIRECT_MODE) {
      const headers = securityHeaders();
      headers.set("Cache-Control", "no-store");

      return NextResponse.redirect(apkUrl, {
        status: 302,
        headers,
      });
    }

    // 4) Prepare upstream request
    const upstreamHeaders = new Headers();

    const rangeHeader = req.headers.get("range");

    if (rangeHeader) {
      upstreamHeaders.set("range", rangeHeader);
    }

    // منع ضغط المحتوى حتى لا يتغير Content-Length
    upstreamHeaders.set("accept-encoding", "identity");

    let upstream: Response;

    try {
      upstream = await fetchValidatedApk(validation.url, {
        method: "GET",
        headers: upstreamHeaders,
        cache: "no-store",

      });
    } catch (error) {
      console.error("[AndroidDownload] Fetch error:", error);

      return textResponse(
        "APK download failed.",
        502
      );
    }

    // 5) Handle upstream errors
    if (upstream.status === 404) {
      return textResponse("APK file not found.", 404);
    }

    if (upstream.status === 416) {
      return textResponse("Requested range not satisfiable.", 416);
    }

    if (!upstream.ok) {
      console.error(
        "[AndroidDownload] Upstream error:",
        upstream.status,
        upstream.statusText
      );

      return textResponse(
        "APK download is temporarily unavailable.",
        502
      );
    }

    if (!upstream.body) {
      return textResponse("Empty APK response.", 502);
    }

    // 6) Check content length if available
    const contentLengthHeader = upstream.headers.get("content-length");
    const contentLength = contentLengthHeader
      ? Number(contentLengthHeader)
      : null;

    if (
      contentLength !== null &&
      Number.isFinite(contentLength) &&
      contentLength > MAX_APK_BYTES
    ) {
      return textResponse("APK file is too large.", 413);
    }

    // 7) Build download headers
    const headers = new Headers();

    headers.set("Content-Type", "application/vnd.android.package-archive");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${FILENAME}"`
    );
    headers.set("Accept-Ranges", "bytes");

    if (contentLengthHeader) {
      headers.set("Content-Length", contentLengthHeader);
    }

    const contentRange = upstream.headers.get("content-range");
    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    const etag = upstream.headers.get("etag");
    if (etag) {
      headers.set("ETag", etag);
    }

    const lastModified = upstream.headers.get("last-modified");
    if (lastModified) {
      headers.set("Last-Modified", lastModified);
    }

    headers.set(
      "Cache-Control",
      "public, max-age=60, must-revalidate"
    );

    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "no-referrer");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error("[AndroidDownload] Unexpected error:", error);

    return textResponse("APK download failed.", 500);
  }
}

// ============================================================
// HEAD /api/download/android
// ============================================================

export async function HEAD(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    if (!checkRateLimit(ip)) {
      return new NextResponse(null, {
        status: 429,
        headers: securityHeaders(),
      });
    }

    const validation = validateApkUrl(APK_URL);

    if (!validation.ok) {
      return new NextResponse(null, {
        status: 500,
        headers: securityHeaders(),
      });
    }

    if (REDIRECT_MODE) {
      return new NextResponse(null, {
        status: 302,
        headers: {
          Location: validation.url.toString(),
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "no-referrer",
        },
      });
    }

    const upstreamHeaders = new Headers();
    upstreamHeaders.set("accept-encoding", "identity");

    const rangeHeader = req.headers.get("range");
    if (rangeHeader) {
      upstreamHeaders.set("range", rangeHeader);
    }

    let upstream: Response;

    try {
      upstream = await fetchValidatedApk(validation.url, {
        method: "HEAD",
        headers: upstreamHeaders,
        cache: "no-store",

      });
    } catch {
      return new NextResponse(null, {
        status: 502,
        headers: securityHeaders(),
      });
    }

    const headers = new Headers();

    headers.set("Content-Type", "application/vnd.android.package-archive");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${FILENAME}"`
    );
    headers.set("Accept-Ranges", "bytes");

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    const contentRange = upstream.headers.get("content-range");
    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    const etag = upstream.headers.get("etag");
    if (etag) {
      headers.set("ETag", etag);
    }

    const lastModified = upstream.headers.get("last-modified");
    if (lastModified) {
      headers.set("Last-Modified", lastModified);
    }

    headers.set("Cache-Control", "public, max-age=60, must-revalidate");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "no-referrer");

    return new NextResponse(null, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error("[AndroidDownload] HEAD error:", error);

    return new NextResponse(null, {
      status: 500,
      headers: securityHeaders(),
    });
  }
}

// ============================================================
// Block other methods
// ============================================================

export async function POST() {
  return textResponse("Method not allowed", 405);
}

export async function PUT() {
  return textResponse("Method not allowed", 405);
}

export async function DELETE() {
  return textResponse("Method not allowed", 405);
}

export async function PATCH() {
  return textResponse("Method not allowed", 405);
}