import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSessionFromCookie } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const userId = getSessionFromCookie(req.headers.get("cookie"));
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return NextResponse.json({ error: "db not configured" }, { status: 500 });

    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("user_questions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ questions: data || [] });
  } catch {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getSessionFromCookie(req.headers.get("cookie"));
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { question } = await req.json();
    if (!question || !question.trim()) {
      return NextResponse.json({ error: "اكتب سؤالك" }, { status: 400 });
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return NextResponse.json({ error: "db not configured" }, { status: 500 });

    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("user_questions")
      .insert({ user_id: userId, question: question.trim(), status: "pending" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, question: data });
  } catch {
    return NextResponse.json({ error: "خطأ في إرسال السؤال" }, { status: 500 });
  }
}