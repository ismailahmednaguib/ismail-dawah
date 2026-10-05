import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  const report: Record<string, unknown> = {
    env_url: url ? "موجود ✅" : "ناقص ❌",
    env_service_key: key ? "موجود ✅" : "ناقص ❌",
    env_admin_key: process.env.ADMIN_KEY ? "موجود ✅" : "ناقص ❌",
  };

  if (!url || !key) return NextResponse.json(report);

  try {
    const supabase = createClient(url, key);

    const { error } = await supabase.from("site_content").select("id").limit(1);
    report.table_site_content = error ? "خطأ: " + error.message : "تمام ✅";

    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    report.buckets = bErr
      ? "خطأ: " + bErr.message
      : (buckets || []).map((b) => b.name).join(", ") || "مفيش buckets ❌";

    const { error: upErr } = await supabase
      .from("site_content")
      .upsert({ id: 999, data: { test: true } });
    report.write_test = upErr ? "خطأ: " + upErr.message : "تمام ✅";
    if (!upErr) await supabase.from("site_content").delete().eq("id", 999);
  } catch (e) {
    report.exception = String(e);
  }

  return NextResponse.json(report);
}