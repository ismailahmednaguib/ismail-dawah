import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminFromCookie } from "@/lib/auth";

const BUCKET = "site";

export async function GET() {
  return NextResponse.json({
    hasUrl: !!process.env.SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    hasAdminKey: !!process.env.ADMIN_KEY,
  });
}

export async function POST(req: Request) {
  

const adminId = getAdminFromCookie(req.headers.get("cookie"));
if (!adminId) {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "متغيرات البيئة ناقصة" }, { status: 500 });

  const supabase = createClient(url, serviceKey);

  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (createErr) return NextResponse.json({ error: "فشل إنشاء الـ bucket: " + createErr.message }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const kind = String(form.get("kind") || "image");
  if (!file) return NextResponse.json({ error: "مفيش ملف مرفق" }, { status: 400 });

  const isAudio = kind === "audio";
  const isDoc = kind === "doc";
  const okType = isDoc ? file.type === "application/pdf" : isAudio ? file.type.startsWith("audio/") : file.type.startsWith("image/");
  if (!okType) return NextResponse.json({ error: isDoc ? "الملف لازم يكون PDF" : isAudio ? "الملف لازم يكون صوتي" : "الملف لازم يكون صورة" }, { status: 400 });

  const folder = isDoc ? "books" : isAudio ? "audio" : "images";
  const ext = file.name.split(".").pop() || (isDoc ? "pdf" : isAudio ? "mp3" : "jpg");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buf = await file.arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: "فشل الرفع: " + error.message }, { status: 500 });

  return NextResponse.json({ url: `${url}/storage/v1/object/public/${BUCKET}/${path}` });
}