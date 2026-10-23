-- ============================================================
-- 20261023 — سجل نسخ المحتوى (content revisions)
-- ------------------------------------------------------------
-- كل حفظ لتعديلات المحتوى يخزّن نسخة من الحقول القابلة للتعديل
-- قبل الكتابة، لتتيح استعادة سابقة من صفحة تعديل المحتوى.
--
-- الجدول خاص: يحتوي مسودات ومحتوى غير منشور. RLS مفعّل بلا
-- سياسات، وسُحبت صلاحيات anon/authenticated. كل قراءة/كتابة
-- تتم بمفتاح الخدمة من مسارات الإدارة فقط.
--
-- التنفيذ يدوي في SQL Editor بلوحة Supabase. حتى تُنفَّذ الهجرة
-- يعمل حفظ المحتوى طبيعيًّا، وتظهر في الواجهة رسالة «السجل غير مفعّل».
-- ============================================================

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content(id) on delete cascade,
  snapshot jsonb not null,
  reason varchar(20) not null default 'update'
    check (reason in ('update', 'restore')),
  -- معرّف الأدمن نصّي: قد يكون UUID (Supabase Auth) أو رقمًا (admin_users القديم).
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists idx_content_revisions_content
  on public.content_revisions (content_id, created_at desc);

alter table public.content_revisions enable row level security;
revoke all on table public.content_revisions from anon, authenticated;

comment on table public.content_revisions is
  'نسخ المحتوى قبل التعديل — خاصة، تُقرأ بمفتاح الخدمة فقط، ويُحتفظ بأحدث ٥٠ نسخة لكل مادة.';

-- تحقّق سريع بعد التنفيذ:
-- select relrowsecurity from pg_class
-- where oid = 'public.content_revisions'::regclass;
