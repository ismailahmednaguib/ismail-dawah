-- 20261021_password_reset.sql
-- استعادة كلمة المرور للحسابات المخصصة (public.users).
-- آمن للتشغيل أكثر من مرة. لا يمسّ كلمات المرور الحالية.

alter table public.users
  add column if not exists password_reset_token_hash text,
  add column if not exists password_reset_expires_at timestamptz,
  add column if not exists password_reset_requested_at timestamptz;

-- البحث بالرمز يجب أن يكون فوريًا، والرمز المخزّن (تجزئة) فريد على الأكثر.
create unique index if not exists users_password_reset_token_hash_idx
  on public.users (password_reset_token_hash)
  where password_reset_token_hash is not null;

-- تنظيف الرموز المنتهية عند إعادة التشغيل (لا يمسّ كلمة المرور).
update public.users
set password_reset_token_hash = null,
    password_reset_expires_at = null
where password_reset_expires_at is not null
  and password_reset_expires_at < now();

comment on column public.users.password_reset_token_hash is
  'تجزئة SHA-256 لرمز استعادة كلمة المرور، لا الرمز نفسه. تُمسح بعد الاستخدام.';
comment on column public.users.password_reset_expires_at is
  'صلاحية رابط الاستعادة (ساعة واحدة) — يُرفض الرمز بعدها.';
