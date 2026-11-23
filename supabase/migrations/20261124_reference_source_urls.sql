-- 20261124 — روابط المصادر الشرعية
-- نفّذ هذا الملف يدويًا في Supabase SQL Editor قبل اعتماد روابط جديدة.

alter table public.content_references
  add column if not exists source_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.content_references'::regclass
      and conname = 'content_references_source_url_check'
  ) then
    alter table public.content_references
      add constraint content_references_source_url_check
      check (source_url is null or source_url ~* '^https?://');
  end if;
end $$;
