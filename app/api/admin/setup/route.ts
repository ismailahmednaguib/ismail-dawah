import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "كل الحقول مطلوبة" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "كلمة المرور لازم تكون 8 حروف على الأقل" }, { status: 400 });
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return NextResponse.json({ error: "db not configured" }, { status: 500 });

    const supabase = createClient(url, key);

    // التحقق من عدم وجود آدمن بالفعل
    const { data: existing } = await supabase
      .from("admin_users")
      .select("id")
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "حساب الآدمن موجود بالفعل" }, { status: 409 });
    }

    const { hash, salt } = hashPassword(password);

    const { error } = await supabase
      .from("admin_users")
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: hash,
        salt,
        name: name.trim(),
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "خطأ في إنشاء الحساب" }, { status: 500 });
  }
}