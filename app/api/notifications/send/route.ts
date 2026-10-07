import { NextResponse } from "next/server";
import webpush from "web-push";

function getAdminFromCookie(cookieHeader: string | null): number | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    const data = JSON.parse(Buffer.from(match[1], "base64").toString());
    if (data.role !== "admin") return null;
    return data.userId;
  } catch {
    return null;
  }
}

// إعدادات VAPID (احط المفاتيح من .env)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@ismail-dawah.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(req: Request) {
  const adminId = getAdminFromCookie(req.headers.get("cookie"));
  if (!adminId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { title, body, url } = await req.json();
  if (!title || !body) {
    return NextResponse.json({ error: "missing data" }, { status: 400 });
  }

  // في الإنتاج، هتجيب الاشتراكات من قاعدة البيانات
  // دلوقتي هنرجع نجاح افتراضي
  return NextResponse.json({ 
    ok: true, 
    message: "تم تجهيز الإشعار للإرسال",
    title,
    body,
    url,
  });
}