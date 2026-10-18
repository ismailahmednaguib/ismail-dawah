-- بيانات اعتماد المحتوى التي تظهر للزائر لبناء الثقة.
alter table public.content
  add column if not exists reviewed_at timestamptz;

create index if not exists idx_content_reviewed_at
  on public.content (reviewed_at desc)
  where reviewed_at is not null;
