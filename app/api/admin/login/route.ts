import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "الإيميل وكلمة المرور مطلوبين" }, { status: 400 });
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return NextResponse.json({ error: "db not configured" }, { status: 500 });

    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "الإيميل أو كلمة المرور غلط" }, { status: 401 });
    }

    const valid = verifyPassword(password, data.password_hash, data.salt);
    if (!valid) {
      return NextResponse.json({ error: "الإيميل أو كلمة المرور غلط" }, { status: 401 });
    }

    // إنشاء session مع علامة admin
    const sessionData = JSON.stringify({ userId: data.id, role: "admin" });
    const session = Buffer.from(sessionData).toString("base64");

    const res = NextResponse.json({
      ok: true,
      user: { id: data.id, email: data.email, name: data.name, role: "admin" },
    });
    res.cookies.set("admin_session", session, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // أسبوع
      path: "/",
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "خطأ في الدخول" }, { status: 500 });
  }
}