-- 20261124 — أسئلة «اسأل مسلمًا» العامة
-- لا يتطلب النموذج تسجيلًا، لذلك تُخزّن الأسئلة في جدول خاص لا يقرأه الزوار.

create table if not exists public.dawah_inquiries (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 10 and 2000),
  email text,
  lang text not null default 'ar' check (lang in ('ar', 'en')),
  page_slug text,
  status text not null default 'pending' check (status in ('pending', 'answered', 'closed')),
  answer text,
  created_at timestamptz not null default now(),
  answered_at timestamptz,
  answered_by uuid references auth.users(id)
);

create index if not exists idx_dawah_inquiries_status_created
  on public.dawah_inquiries(status, created_at desc);

alter table public.dawah_inquiries enable row level security;
revoke all on table public.dawah_inquiries from anon, authenticated;
