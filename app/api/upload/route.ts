import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "site";

export async function GET() {
  return NextResponse.json({
    hasUrl: !!process.env.SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    hasAdminKey: !!process.env.ADMIN_KEY,
  });
}

export async function POST(req: Request) {
  const key = req.headers.get("x-admin-key");
  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "متغيرات البيئة ناقصة" }, { status: 500 });
  }

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
  if (isAudio ? !file.type.startsWith("audio/") : !file.type.startsWith("image/")) {
    return NextResponse.json({ error: isAudio ? "الملف لازم يكون صوتي (mp3)" : "الملف لازم يكون صورة" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || (isAudio ? "mp3" : "jpg");
  const folder = isAudio ? "audio" : "images";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buf = await file.arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: "فشل الرفع: " + error.message }, { status: 500 });

  const publicUrl = `${url}/storage/v1/object/public/${BUCKET}/${path}`;
  return NextResponse.json({ url: publicUrl });
}