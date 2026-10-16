-- ============================================================
-- أحداث التحليلات (Analytics Events)
-- ------------------------------------------------------------
-- يُصلح الخطأ المتكرر في السجلات:
--   [AnalyticsTrack] Supabase insert error: Could not find the table 'public.analytics_events'
-- نفّذ هذا الملف على قاعدة الإنتاج عبر SQL Editor في لوحة Supabase.
-- ============================================================

create table if not exists public.analytics_events (
  id bigserial primary key,
  type varchar(20) not null default 'page_view',
  event_name varchar(128) not null default 'page_view',
  page text not null default '/',
  lang varchar(10) not null default 'ar',
  referrer text,
  user_agent text,
  session_id varchar(128),
  user_id varchar(128),
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_created
  on public.analytics_events(created_at desc);

create index if not exists idx_analytics_page
  on public.analytics_events(page);

create index if not exists idx_analytics_type
  on public.analytics_events(type, created_at desc);

alter table public.analytics_events enable row level security;

-- التتبّع يأتي من المتصفح (anon)، والقراءة الإدارية تتم بمفتاح الخدمة (يتجاوز RLS).
drop policy if exists "anon can insert analytics" on public.analytics_events;
create policy "anon can insert analytics"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (true);
