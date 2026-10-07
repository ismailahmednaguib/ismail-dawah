import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function GET(req: Request) {
  const adminId = getAdminFromCookie(req.headers.get("cookie"));
  if (!adminId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "db not configured" }, { status: 500 });

  const supabase = createClient(url, key);

  // أكثر الصفحات زيارة (آخر 7 أيام)
  const { data: topPages } = await supabase
    .from("page_views")
    .select("page")
    .gte("viewed_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const pageCounts: Record<string, number> = {};
  (topPages || []).forEach((v) => {
    pageCounts[v.page] = (pageCounts[v.page] || 0) + 1;
  });

  const sortedPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }));

  // عدد الزوار اليوم
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayViews } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .gte("viewed_at", today.toISOString());

  // عدد المشتركين في النشرة
  const { count: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true })
    .eq("active", true);

  // أكثر اللغات استخداماً
  const { data: langViews } = await supabase
    .from("page_views")
    .select("lang")
    .gte("viewed_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const langCounts: Record<string, number> = {};
  (langViews || []).forEach((v) => {
    if (v.lang) langCounts[v.lang] = (langCounts[v.lang] || 0) + 1;
  });

  const sortedLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => ({ lang, count }));

  return NextResponse.json({
    todayViews: todayViews || 0,
    subscribers: subscribers || 0,
    topPages: sortedPages,
    topLanguages: sortedLangs,
  });
}