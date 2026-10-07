import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) return NextResponse.json({ user: null });

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return NextResponse.json({ user: null });

    const supabase = createClient(url, key);

    // جرب admin_session الأول
    const adminMatch = cookieHeader.match(/admin_session=([^;]+)/);
    if (adminMatch) {
      try {
        const data = JSON.parse(Buffer.from(adminMatch[1], "base64").toString());
        if (data.role === "admin") {
          const { data: admin } = await supabase
            .from("admin_users")
            .select("id, email, name")
            .eq("id", data.userId)
            .maybeSingle();
          if (admin) {
            return NextResponse.json({ user: { ...admin, role: "admin" } });
          }
        }
      } catch {}
    }

    // جرب user_session
    const userMatch = cookieHeader.match(/user_session=([^;]+)/);
    if (userMatch) {
      try {
        const data = JSON.parse(Buffer.from(userMatch[1], "base64").toString());
        if (data.role === "user") {
          const { data: user } = await supabase
            .from("users")
            .select("id, email, name, lang")
            .eq("id", data.userId)
            .maybeSingle();
          if (user) {
            return NextResponse.json({ user: { ...user, role: "user" } });
          }
        }
      } catch {}
    }

    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}