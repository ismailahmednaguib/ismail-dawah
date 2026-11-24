-- 20261124 — بلاغات أخطاء المحتوى
-- تحفظ البلاغات في جدول خاص ولا تُعرض بالمفتاح العام.

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  page_url text not null check (page_url ~ '^/(ar|en)(/|$)'),
  page_title text not null check (char_length(page_title) between 1 and 240),
  description text not null check (char_length(description) between 10 and 2000),
  email text,
  lang text not null default 'ar' check (lang in ('ar', 'en')),
  status text not null default 'new' check (status in ('new', 'triaged', 'resolved', 'ignored')),
  resolution_note text,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_reports_status_created
  on public.content_reports(status, created_at desc);

alter table public.content_reports enable row level security;
revoke all on table public.content_reports from anon, authenticated;
