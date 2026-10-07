import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword } from "@/lib/auth";

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
    const cleanEmail = email.toLowerCase().trim();

    // أولاً: حاول تلقى الحساب في admin_users
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (adminUser) {
      const valid = verifyPassword(password, adminUser.password_hash, adminUser.salt);
      if (!valid) {
        return NextResponse.json({ error: "الإيميل أو كلمة المرور غلط" }, { status: 401 });
      }

      // أنشئ session خاص بالآدمن
      const sessionData = JSON.stringify({ userId: adminUser.id, role: "admin" });
      const session = Buffer.from(sessionData).toString("base64");

      const res = NextResponse.json({
        ok: true,
        user: { id: adminUser.id, email: adminUser.email, name: adminUser.name, role: "admin" },
      });
      res.cookies.set("admin_session", session, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      // نضيف cookie للـ auth/me عشان يشتغل
      res.cookies.set("user_session", session, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return res;
    }

    // ثانياً: دور في users (الحسابات العادية)
    const { data: regularUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (error || !regularUser) {
      return NextResponse.json({ error: "الإيميل أو كلمة المرور غلط" }, { status: 401 });
    }

    const valid = verifyPassword(password, regularUser.password_hash, regularUser.salt);
    if (!valid) {
      return NextResponse.json({ error: "الإيميل أو كلمة المرور غلط" }, { status: 401 });
    }

    // أنشئ session للمستخدم العادي
    const sessionData = JSON.stringify({ userId: regularUser.id, role: "user" });
    const session = Buffer.from(sessionData).toString("base64");

    const res = NextResponse.json({
      ok: true,
      user: { id: regularUser.id, email: regularUser.email, name: regularUser.name, role: "user" },
    });
    res.cookies.set("user_session", session, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "خطأ في الدخول" }, { status: 500 });
  }
}