-- ============================================================
-- 20261024 — اشتراكات إشعارات الويب (push subscriptions)
-- ------------------------------------------------------------
-- الجدول كان مذكورًا في قوائم RLS لكنه غير موجود في قاعدة الإنتاج،
-- لذلك كان مسار إرسال الإشعارات يعيد خطأ «الجدول غير موجود».
--
-- user_id نصّي عمدًا: المشروع يدعم مستخدمًا مخصصًا بمعرّف رقمي
-- وSupabase Auth بمعرّف UUID، ولا نريد مفتاحًا خارجيًّا يفشل الحفظ.
--
-- الجدول خاص: يحتوي endpoint ومفاتيح تشفير الإشعارات. RLS مفعّل
-- بلا سياسات، وسُحبت صلاحيات anon/authenticated. كل قراءة/كتابة
-- تتم بمفتاح الخدمة من مسار الإدارة فقط.
--
-- التنفيذ يدوي في SQL Editor بلوحة Supabase.
-- ============================================================

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  active boolean not null default true,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_active
  on public.push_subscriptions (active, updated_at desc);

alter table public.push_subscriptions enable row level security;
revoke all on table public.push_subscriptions from anon, authenticated;

drop trigger if exists set_push_subscriptions_updated_at
  on public.push_subscriptions;
create trigger set_push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row execute function public.update_updated_at_column();

comment on table public.push_subscriptions is
  'اشتراكات Web Push — خاصة، تُقرأ بمفتاح الخدمة فقط.';

-- تحقّق سريع بعد التنفيذ:
-- select relrowsecurity from pg_class
-- where oid = 'public.push_subscriptions'::regclass;
