// app/api/admin/email/test/route.ts
// حالة مزوّد البريد + إرسال رسالة تجريبية من لوحة التحكم.

import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, type AdminSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/permissions";
import { rateLimitGuard } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { getEmailProviderStatus } from "@/lib/email-provider-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AuthResult = { session: AdminSession } | { response: NextResponse };

async function authorize(): Promise<AuthResult> {
  const session = await getAdminSession();

  if (!session) {
    return {
      response: NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (!can(session.roles, "settings.manage")) {
    return {
      response: NextResponse.json(
        { ok: false, error: "forbidden" },
        { status: 403 }
      ),
    };
  }

  return { session };
}

function noStore(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function GET() {
  const auth = await authorize();
  if ("response" in auth) return auth.response;

  return noStore({
    ok: true,
    ...getEmailProviderStatus(process.env),
    adminEmail: auth.session.email,
  });
}

export async function POST(req: NextRequest) {
  const auth = await authorize();
  if ("response" in auth) return auth.response;

  const limited = await rateLimitGuard(req, "verify", {
    identities: [auth.session.userId],
  });
  if (limited) return limited;

  let body: unknown = null;

  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const source =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};

  const requestedTo =
    typeof source.to === "string" ? source.to.trim().slice(0, 254) : "";
  const to = requestedTo || auth.session.email;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return noStore({ ok: false, error: "invalid_email" }, 400);
  }

  const status = getEmailProviderStatus(process.env);

  if (!status.configured) {
    return noStore(
      { ok: false, error: "email_provider_not_configured" },
      503
    );
  }

  const providerLabel = status.kind === "smtp" ? "SMTP" : "Resend";
  const fromLabel = status.from || "غير محدد";
  const safeTo = escapeHtml(to);
  const safeProvider = escapeHtml(providerLabel);
  const safeFrom = escapeHtml(fromLabel);

  const result = await sendEmail({
    to,
    subject: "بريد تجريبي من لوحة تحكم المنصة",
    html: `
      <div dir="rtl" style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;line-height:1.9;color:#0f172a">
        <h2 style="margin:0 0 12px">اختبار إعداد البريد</h2>
        <p>إذا وصلتك هذه الرسالة فمزوّد البريد يعمل بنجاح.</p>
        <p style="color:#64748b;font-size:13px;margin-top:20px">
          المزوّد: ${safeProvider} · من: ${safeFrom} · إلى: ${safeTo}
        </p>
      </div>
    `,
    text: `اختبار إعداد البريد\nإذا وصلتك هذه الرسالة فمزوّد البريد يعمل بنجاح.\nالمزوّد: ${providerLabel} · من: ${fromLabel} · إلى: ${to}`,
    type: "admin_notification",
  });

  if (!result.ok) {
    return noStore(
      {
        ok: false,
        error: result.error || "email_send_failed",
        provider: status.kind,
      },
      502
    );
  }

  return noStore({
    ok: true,
    provider: status.kind,
    to,
  });
}
