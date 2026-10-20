-- 20261020_email_verification.sql
-- تفعيل البريد الإلكتروني للحسابات المخصصة (public.users).
-- آمن للتشغيل أكثر من مرة. الحسابات الحالية تُعتبر مفعّلة تلقائيًا (default true)
-- حتى لا يُقفل أي مستخدم قائم عند تطبيق الترحيل.

alter table public.users
  add column if not exists email_verified boolean not null default true,
  add column if not exists email_verified_at timestamptz,
  add column if not exists email_verification_token_hash text,
  add column if not exists email_verification_expires_at timestamptz,
  add column if not exists email_verification_sent_at timestamptz;

-- البحث بالرمز يجب أن يكون فوريًا، والرمز المخزّن (تجزئة) فريد على الأكثر.
create unique index if not exists users_email_verification_token_hash_idx
  on public.users (email_verification_token_hash)
  where email_verification_token_hash is not null;

-- تنظيف الرموز المنتهية عند إعادة التشغيل (لا يمسّ حالة التفعيل).
update public.users
set email_verification_token_hash = null,
    email_verification_expires_at = null
where email_verification_expires_at is not null
  and email_verification_expires_at < now();

comment on column public.users.email_verified is
  'هل تأكّد بريد المستخدم؟ الحسابات القديمة true، والجديدة false عند إرسال رابط التفعيل.';
comment on column public.users.email_verification_token_hash is
  'تجزئة SHA-256 لرمز التفعيل، لا الرمز نفسه. تُمسح بعد الاستخدام.';
