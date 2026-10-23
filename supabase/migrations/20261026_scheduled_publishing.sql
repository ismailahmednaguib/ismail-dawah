-- ============================================================
-- 20261026 — جدولة النشر
-- ------------------------------------------------------------
-- يضيف حالة `scheduled` إلى enum حالات المحتوى، وعمود `scheduled_at`.
-- المحتوى المجدول يبقى خارج كل استعلامات النشر العامة (`status = published`)،
-- ثم ينقله `/api/cron/publish` أو النشر الكسول عند أول قراءة بعد الموعد.
--
-- لا يمنح هذا الملف أي تجاوز للمراجعة العلمية: الجدولة تمرّ بنفس
-- فحص `requiresScholarReview` و`assertVerifiedReferenceForPublish` الذي يمرّ به النشر.
--
-- التنفيذ يدوي في SQL Editor بلوحة Supabase.
-- ============================================================

alter type public.content_status
  add value if not exists 'scheduled' before 'published';

alter table public.content
  add column if not exists scheduled_at timestamptz;

create index if not exists idx_content_scheduled
  on public.content (scheduled_at);

-- تحقّق سريع بعد التنفيذ:
-- select enum_range(null::public.content_status);
-- select column_name, data_type
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'content'
--   and column_name = 'scheduled_at';
