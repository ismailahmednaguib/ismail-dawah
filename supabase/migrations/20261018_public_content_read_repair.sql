-- 20261018 — إصلاح قراءة المحتوى العام بعد تشديد RLS
-- ------------------------------------------------------------
-- يجب أن يقرأ الزائر المنشور فقط، دون أي صلاحية كتابة أو قراءة للمسودات.

grant select on table
  public.content,
  public.content_translations,
  public.taxonomies,
  public.content_terms,
  public.content_references
to anon, authenticated;

-- بعض السياسات القديمة على جداول المحتوى تفحص user_roles مباشرةً، فيرفض
-- Postgres طلب anon بخطأ 42501 حتى مع وجود سياسة قراءة عامة، لأنه يقيّم
-- كل السياسات. نحذف هذه السياسات وحدها؛ قراءة الإدارة تستخدم مفتاح الخدمة
-- وتتجاوز RLS أصلًا، فلا حاجة لسياسة إدارية على هذه الجداول.
do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'content',
        'content_translations',
        'taxonomies',
        'content_terms',
        'content_references'
      )
      and (
        coalesce(qual, '') ilike '%user_roles%'
        or coalesce(with_check, '') ilike '%user_roles%'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      p.policyname, p.schemaname, p.tablename
    );
    raise notice 'حُذفت سياسة قديمة تعتمد على user_roles: %.%', p.tablename, p.policyname;
  end loop;
end $$;

alter table public.content enable row level security;
drop policy if exists "public read published" on public.content;
create policy "public read published"
  on public.content
  for select
  using (status = 'published');

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

alter table public.taxonomies enable row level security;
drop policy if exists "public read taxonomies" on public.taxonomies;
create policy "public read taxonomies"
  on public.taxonomies
  for select
  using (true);

alter table public.content_terms enable row level security;
drop policy if exists "public read terms" on public.content_terms;
create policy "public read terms"
  on public.content_terms
  for select
  using (
    exists (
      select 1
      from public.content c
      where c.id = content_terms.content_id
        and c.status = 'published'
    )
  );

alter table public.content_references enable row level security;
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
