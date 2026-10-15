-- تقدّم المتعلم للمحتوى المنشور.
-- user_id يطابق معرّف المستخدم في نظام المصادقة المخصص للمشروع.
create table if not exists public.learner_content_progress (
  user_id text not null,
  content_id uuid not null references public.content(id) on delete cascade,
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create index if not exists idx_learner_progress_user
  on public.learner_content_progress(user_id, updated_at desc);

create index if not exists idx_learner_progress_content
  on public.learner_content_progress(content_id);

alter table public.learner_content_progress enable row level security;

drop policy if exists "no public learner progress" on public.learner_content_progress;
create policy "no public learner progress"
  on public.learner_content_progress for all
  using (false)
  with check (false);

drop trigger if exists set_learner_progress_updated_at
  on public.learner_content_progress;
create trigger set_learner_progress_updated_at
  before update on public.learner_content_progress
  for each row execute function public.update_updated_at_column();
