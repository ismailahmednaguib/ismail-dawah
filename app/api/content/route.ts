import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getContent } from "@/lib/content";

function getAdminFromCookie(cookieHeader: string | null): number | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    const data = JSON.parse(Buffer.from(match[1], "base64").toString());
    if (data.role !== "admin" && data.type !== "admin") return null;
    return data.userId;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export async function GET() {
  const hasDb = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
  const content = await getContent();
  return NextResponse.json({ content, live: hasDb });
}

export async function POST(req: Request) {
  const adminId = getAdminFromCookie(req.headers.get("cookie"));
  if (!adminId) {
    return NextResponse.json({ error: "unauthorized - سجل دخول الآدمن أولاً" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "db not configured" }, { status: 500 });
  }

  const body = await req.json();
  if (!body.content) {
    return NextResponse.json({ error: "no content provided" }, { status: 400 });
  }

  const supabase = createClient(url, serviceKey);
  const cleanContent = JSON.parse(JSON.stringify(body.content));

  const { error } = await supabase
    .from("site_content")
    .upsert({
      id: 1,
      data: cleanContent,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Supabase save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, saved_at: new Date().toISOString() });
}