import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAllowedMutationOrigin } from "@/lib/security/origin";
import {
  normalizePushEndpoint,
  normalizePushSubscription,
} from "@/lib/notifications/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 20_000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_IP = 20;
const rateStore = new Map<string, { count: number; resetAt: number }>();

function env(name: string): string {
  return process.env[name]?.trim() || "";
}

const VAPID_PUBLIC_KEY =
  env("VAPID_PUBLIC_KEY") ||
  env("NEXT_PUBLIC_VAPID_PUBLIC_KEY") ||
  env("WEB_PUSH_PUBLIC_KEY");

function response(body: unknown, status = 200): NextResponse {
  const result = NextResponse.json(body, { status });
  result.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  result.headers.set("Pragma", "no-cache");
  result.headers.set("X-Content-Type-Options", "nosniff");
  return result;
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function consumeRateLimit(ip: string): boolean {
  const now = Date.now();
  for (const [key, value] of rateStore) {
    if (value.resetAt <= now) rateStore.delete(key);
  }

  const current = rateStore.get(ip);
  if (!current || current.resetAt <= now) {
    rateStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_REQUESTS_PER_IP) return false;
  current.count += 1;
  return true;
}

function createSupabaseClient() {
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_KEY") || env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function readJson(request: NextRequest): Promise<Record<string, unknown> | null> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return null;
  }

  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function GET() {
  return response({
    ok: true,
    configured: Boolean(VAPID_PUBLIC_KEY),
    publicKey: VAPID_PUBLIC_KEY || null,
  });
}

export async function POST(request: NextRequest) {
  if (!isAllowedMutationOrigin(request)) {
    return response({ ok: false, error: "origin_not_allowed" }, 403);
  }

  if (!consumeRateLimit(clientIp(request))) {
    return response(
      { ok: false, error: "عدد محاولات الاشتراك كثير جدًا. حاول لاحقًا." },
      429
    );
  }

  const body = await readJson(request);
  const subscription = normalizePushSubscription(body?.subscription ?? body);
  if (!subscription) {
    return response({ ok: false, error: "اشتراك الإشعارات غير صالح." }, 400);
  }

  if (!VAPID_PUBLIC_KEY) {
    return response({ ok: false, error: "الإشعارات غير مهيأة حاليًا." }, 503);
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    return response({ ok: false, error: "قاعدة البيانات غير مهيأة." }, 503);
  }

  const userAgent = (request.headers.get("user-agent") || "").slice(0, 512);
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      active: true,
      user_agent: userAgent || null,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("[PushSubscribe] upsert failed:", error);
    return response({ ok: false, error: "تعذر حفظ اشتراك الإشعارات." }, 503);
  }

  return response({ ok: true, subscribed: true });
}

export async function DELETE(request: NextRequest) {
  if (!isAllowedMutationOrigin(request)) {
    return response({ ok: false, error: "origin_not_allowed" }, 403);
  }

  if (!consumeRateLimit(clientIp(request))) {
    return response(
      { ok: false, error: "عدد المحاولات كثير جدًا. حاول لاحقًا." },
      429
    );
  }

  const body = await readJson(request);
  const endpoint = normalizePushEndpoint(body?.endpoint);
  if (!endpoint) {
    return response({ ok: false, error: "رابط اشتراك الإشعارات غير صالح." }, 400);
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    return response({ ok: false, error: "قاعدة البيانات غير مهيأة." }, 503);
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .update({ active: false })
    .eq("endpoint", endpoint);

  if (error) {
    console.error("[PushSubscribe] deactivate failed:", error);
    return response({ ok: false, error: "تعذر إيقاف اشتراك الإشعارات." }, 503);
  }

  return response({ ok: true, subscribed: false });
}
