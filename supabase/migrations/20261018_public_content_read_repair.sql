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
