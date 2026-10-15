-- وسائط المحتوى المرتبطة بالمكتبة الموحدة.
create table if not exists public.content_media (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content(id) on delete cascade,
  type varchar(20) not null check (type in ('image', 'pdf', 'audio', 'video')),
  url text not null,
  storage_path text,
  title text,
  alt_text text,
  mime_type varchar(120),
  size_bytes bigint,
  duration_seconds int,
  sort_order int not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_media_content
  on public.content_media(content_id, sort_order, created_at);

alter table public.content_media enable row level security;

drop policy if exists "public read published media" on public.content_media;
create policy "public read published media"
  on public.content_media for select
  using (
    exists (
      select 1 from public.content c
      where c.id = content_media.content_id and c.status = 'published'
    )
  );

drop policy if exists "editors write media" on public.content_media;
create policy "editors write media"
  on public.content_media for all
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.is_active
        and ur.roles && array['super_admin','admin','editor']::public.app_role[]
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.is_active
        and ur.roles && array['super_admin','admin','editor']::public.app_role[]
    )
  );

drop trigger if exists set_media_updated_at on public.content_media;
create trigger set_media_updated_at
  before update on public.content_media
  for each row execute function public.update_updated_at_column();
