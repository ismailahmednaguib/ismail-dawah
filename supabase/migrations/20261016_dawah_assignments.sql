-- توزيع طلبات الحوار والمتابعة على فريق الدعوة.
-- request_id نصّي عمدًا حتى يعمل مع إصدارات user_questions التي تستخدم uuid أو bigint.
create table if not exists public.dawah_request_assignments (
  id uuid primary key default gen_random_uuid(),
  request_id text not null unique,
  language text not null default 'ar' check (language in ('ar', 'en')),
  status text not null default 'unassigned' check (status in ('unassigned', 'assigned', 'in_progress', 'waiting', 'resolved')),
  assigned_to uuid references auth.users(id) on delete set null,
  assigned_name text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dawah_assignments_status
  on public.dawah_request_assignments(status, updated_at desc);
create index if not exists idx_dawah_assignments_assignee
  on public.dawah_request_assignments(assigned_to, updated_at desc);

alter table public.dawah_request_assignments enable row level security;
revoke all on table public.dawah_request_assignments from anon, authenticated;

create or replace function public.set_dawah_assignments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_dawah_assignments_updated_at on public.dawah_request_assignments;
create trigger set_dawah_assignments_updated_at
before update on public.dawah_request_assignments
for each row execute function public.set_dawah_assignments_updated_at();
