-- ============================================================
-- 20261017 — الأمان ودورة المراجعة
-- ------------------------------------------------------------
-- (١) حدّ المعدّل في مخزن مشترك بين كل النسخ (يُصلح خلل الحدود في الذاكرة)
-- (٢) عمود reviewed_at في الترجمات لإكمال دورة مراجعة الترجمة
--
-- نفّذ الملف على قاعدة الإنتاج عبر SQL Editor في لوحة Supabase.
-- ============================================================

-- ============================================================
-- (١) جدول حدود المعدّل + دالة ذرّية
-- ============================================================

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null
);

create index if not exists idx_rate_limits_reset on public.rate_limits(reset_at);

-- الحجب الكامل عن anon/authenticated: القراءة والكتابة بمفتاح الخدمة فقط.
alter table public.rate_limits enable row level security;

drop policy if exists "no public access to rate limits" on public.rate_limits;
create policy "no public access to rate limits"
  on public.rate_limits
  for select
  to anon, authenticated
  using (false);

-- دالة ذرّية: الاستدعاء المتزامن من نسخ متعدّدة لا يتجاوز الحدّ أبدًا.
create or replace function public.consume_rate_limit(
  p_key text,
  p_window_seconds integer,
  p_max integer
)
returns table (allowed boolean, remaining integer, retry_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_count integer;
  v_reset timestamptz;
begin
  if p_key is null or length(p_key) = 0 or p_window_seconds <= 0 or p_max <= 0 then
    raise exception 'invalid rate limit arguments';
  end if;

  insert into public.rate_limits as rl (key, count, reset_at)
  values (p_key, 1, v_now + make_interval(secs => p_window_seconds))
  on conflict (key) do update
    set count = case
          when rl.reset_at <= v_now then 1
          else rl.count + 1
        end,
        reset_at = case
          when rl.reset_at <= v_now then v_now + make_interval(secs => p_window_seconds)
          else rl.reset_at
        end
  returning rl.count, rl.reset_at into v_count, v_reset;

  allowed := v_count <= p_max;
  remaining := greatest(p_max - v_count, 0);
  retry_after := case
    when allowed then 0
    else greatest(ceil(extract(epoch from (v_reset - v_now)))::integer, 1)
  end;

  return next;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from anon, authenticated;

-- تنظيف السطور المنتهية (تُستدعى دوريًّا من التطبيق).
create or replace function public.sweep_rate_limits()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.rate_limits where reset_at < now() - interval '1 day';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.sweep_rate_limits() from anon, authenticated;

-- ============================================================
-- (٢) إكمال دورة مراجعة الترجمة
-- ============================================================

alter table public.content_translations
  add column if not exists reviewed_at timestamptz;

create index if not exists idx_content_translations_review
  on public.content_translations (is_machine_translated, is_reviewed);
