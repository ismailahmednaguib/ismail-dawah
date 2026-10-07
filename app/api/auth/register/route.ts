import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "كل الحقول مطلوبة" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "كلمة المرور لازم تكون 6 حروف على الأقل" }, { status: 400 });
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return NextResponse.json({ error: "db not configured" }, { status: 500 });

    const supabase = createClient(url, key);

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "الإيميل ده مسجل بالفعل" }, { status: 409 });
    }

    const { hash, salt } = hashPassword(password);

    const { data, error } = await supabase
      .from("users")
      .insert({ email: email.toLowerCase().trim(), password_hash: hash, salt, name: name.trim() })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const session = createSession(data.id);
    const res = NextResponse.json({
      ok: true,
      user: { id: data.id, email: data.email, name: data.name },
    });
    res.cookies.set("session", session, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "خطأ في التسجيل" }, { status: 500 });
  }
}