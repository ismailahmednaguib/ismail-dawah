-- لا تعرض المراجع الشرعية غير المعتمدة للزوار.
drop policy if exists "public read references" on public.content_references;

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
