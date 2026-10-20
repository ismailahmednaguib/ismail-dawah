// lib/supabase/public-read.ts
// عميل قراءة خادمي للبيانات العامة فقط (محتوى منشور · ترجمات · تصنيفات · آيات).
//
// لماذا مفتاح الخدمة أولًا؟
// بعض سياسات RLS الحالية على جداول المحتوى تعتمد على `user_roles` وترفض anon
// بخطأ 42501، فتتعطّل خريطة الموقع والبحث. القراءة هنا تمرّ عبر الخادم فقط،
// وكل مستدعٍ يفرض `status = 'published'` ويستخرج حقولًا عامة.
// يبقى anon بديلًا في البيئات التي لا تضبط مفتاح الخدمة (تطوير/بناء).

import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function getPublicReadClient(): SupabaseClient {
  if (cached) return cached;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();

  const key =
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env for public server read: set NEXT_PUBLIC_SUPABASE_URL and a service or anon key.'
    );
  }

  cached = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cached;
}
