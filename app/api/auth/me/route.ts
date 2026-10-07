import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSessionFromCookie } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const userId = getSessionFromCookie(req.headers.get("cookie"));
    if (!userId) return NextResponse.json({ user: null });

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return NextResponse.json({ user: null });

    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, lang")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return NextResponse.json({ user: null });
    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ user: null });
  }
}