import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getUserIdFromCookie(cookieHeader: string | null): { userId: number; role: string } | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/user_session=([^;]+)/);
  if (!match) return null;
  try {
    const data = JSON.parse(Buffer.from(match[1], "base64").toString());
    return { userId: data.userId, role: data.role };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const session = getUserIdFromCookie(req.headers.get("cookie"));
    if (!session || session.role !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return NextResponse.json({ error: "db not configured" }, { status: 500 });

    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("user_questions")
      .select("*")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ questions: data || [] });
  } catch {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getUserIdFromCookie(req.headers.get("cookie"));
    if (!session || session.role !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

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
      .insert({ user_id: session.userId, question: question.trim(), status: "pending" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, question: data });
  } catch {
    return NextResponse.json({ error: "خطأ في إرسال السؤال" }, { status: 500 });
  }
}