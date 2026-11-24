-- رحلة المسلم الجديد البريدية: 15 رسالة اختيارية موزعة على أول 30 يومًا.
create table if not exists public.new_muslim_journey_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  lang text not null default 'ar' check (lang in ('ar', 'en')),
  day_index smallint not null default 1 check (day_index between 1 and 16),
  next_send_at timestamptz not null default now(),
  active boolean not null default true,
  consent_at timestamptz not null default now(),
  last_sent_at timestamptz,
  completed_at timestamptz,
  unsubscribe_token text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_new_muslim_journey_due on public.new_muslim_journey_subscribers (next_send_at) where active = true;
alter table public.new_muslim_journey_subscribers enable row level security;
revoke all on table public.new_muslim_journey_subscribers from anon, authenticated;
create or replace function public.set_new_muslim_journey_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists set_new_muslim_journey_updated_at on public.new_muslim_journey_subscribers;
create trigger set_new_muslim_journey_updated_at before update on public.new_muslim_journey_subscribers for each row execute function public.set_new_muslim_journey_updated_at();
