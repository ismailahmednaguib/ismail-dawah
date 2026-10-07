import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const key = req.headers.get("x-admin-key");
  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const sk = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !sk) return NextResponse.json({ error: "db not configured" }, { status: 500 });

  const supabase = createClient(url, sk);
  const { data, error } = await supabase
    .from("user_questions")
    .select("*, users(name, email)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ questions: data || [] });
}

export async function POST(req: Request) {
  const key = req.headers.get("x-admin-key");
  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id, answer } = await req.json();
  if (!id || !answer) {
    return NextResponse.json({ error: "missing data" }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const sk = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !sk) return NextResponse.json({ error: "db not configured" }, { status: 500 });

  const supabase = createClient(url, sk);
  const { error } = await supabase
    .from("user_questions")
    .update({ answer, status: "answered", answered_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}