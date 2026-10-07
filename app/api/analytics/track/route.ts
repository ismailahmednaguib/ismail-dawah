import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { page, lang, referrer } = await req.json();

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return NextResponse.json({ ok: true });

    const supabase = createClient(url, key);

    await supabase.from("page_views").insert({
      page,
      lang,
      referrer: referrer || null,
      user_agent: req.headers.get("user-agent") || null,
      viewed_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}