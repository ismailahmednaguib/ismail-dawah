import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminFromCookie } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const adminId = getAdminFromCookie(req.headers.get("cookie"));
    if (!adminId) return NextResponse.json({ user: null });

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return NextResponse.json({ user: null });

    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, name")
      .eq("id", adminId)
      .maybeSingle();

    if (error || !data) return NextResponse.json({ user: null });
    return NextResponse.json({ user: { ...data, role: "admin" } });
  } catch {
    return NextResponse.json({ user: null });
  }
}