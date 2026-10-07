import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const key = req.headers.get("x-admin-key");
  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { collection, id, lang, field, value } = await req.json();
  if (!collection || !id || !lang || !field) {
    return NextResponse.json({ error: "missing data" }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const sk = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !sk) return NextResponse.json({ error: "db not configured" }, { status: 500 });

  const supabase = createClient(url, sk);

  // جلب العنصر الحالي
  const { data: item, error: fetchError } = await supabase
    .from(collection)
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !item) {
    return NextResponse.json({ error: "item not found" }, { status: 404 });
  }

  // تحديث الترجمة
  const translations = item.t || {};
  translations[lang] = translations[lang] || {};
  translations[lang][field] = value;

  const { error } = await supabase
    .from(collection)
    .update({ t: translations })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}