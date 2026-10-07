import { createClient } from "@supabase/supabase-js";

export async function subscribeEmail(email: string, name: string = "") {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("db not configured");

  const supabase = createClient(url, key);

  // التحقق من عدم وجود الإيميل مسبقاً
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (existing) {
    return { ok: true, message: "أنت مشترك بالفعل" };
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({
      email: email.toLowerCase(),
      name: name || null,
      subscribed_at: new Date().toISOString(),
      active: true,
    });

  if (error) throw error;
  return { ok: true, message: "تم الاشتراك بنجاح" };
}

export async function getSubscribers() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return [];

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .eq("active", true)
    .order("subscribed_at", { ascending: false });

  return data || [];
}