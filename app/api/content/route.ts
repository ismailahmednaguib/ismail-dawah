import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { defaultContent, getContent } from "@/lib/content";

export async function GET() {
  const hasDb = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
  const content = await getContent();
  return NextResponse.json({ content, live: hasDb });
}

export async function POST(req: Request) {
  const key = req.headers.get("x-admin-key");
  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "db not configured" }, { status: 500 });
  }
  const body = await req.json();
  const supabase = createClient(url, serviceKey);
  const { error } = await supabase
    .from("site_content")
    .upsert({ id: 1, data: body.content, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}