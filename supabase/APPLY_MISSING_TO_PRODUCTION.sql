-- ============================================================================
-- إصلاح الناقص في قاعدة الإنتاج (تطبيق غير مُتلِف — آمن للتشغيل المتكرر)
-- ============================================================================
-- السبب: جداول النظام الموحّد موجودة في الإنتاج، لكن بعض العناصر لم تُطبَّق:
--   • سياسة القراءة العامة على content_translations (تسبب فراغ /learn و/fiqh و/hadith)
--   • جدول content_media (كان مفقودًا تمامًا)
--   • جدول learner_content_progress
--   • سياسة المراجع الموثّقة على content_references
--
-- الصق هذا الملف كاملًا في: Supabase Dashboard → SQL Editor → Run
-- ============================================================================

-- 0) الدالة المشتركة لتحديث updated_at (إن لم تكن موجودة)
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1) سياسة القراءة العامة للترجمات (الأهم — سبب الأقسام الفارغة)
alter table public.content_translations enable row level security;

drop policy if exists "public read translations" on public.content_translations;
create policy "public read translations"
  on public.content_translations
  for select
  using (
    exists (
      select 1
      from public.content c
      where c.id = content_translations.content_id
        and c.status = 'published'
    )
  );

-- 2) سياسة المراجع الموثّقة فقط
drop policy if exists "public read references" on public.content_references;
drop policy if exists "public read verified references" on public.content_references;
create policy "public read verified references"
  on public.content_references
  for select
  using (
    verified = true
    and exists (
      select 1
      from public.content c
      where c.id = content_references.content_id
        and c.status = 'published'
    )
  );

-- 3) جدول وسائط المحتوى (كان مفقودًا)
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

-- 4) جدول تقدّم المتعلم
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

-- ============================================================================
-- تمّ. بعد التنفيذ ستظهر بيانات /learn و/fiqh و/hadith تلقائيًا.
-- ============================================================================
