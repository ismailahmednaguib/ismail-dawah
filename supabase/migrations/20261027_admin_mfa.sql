-- 20261027 — التحقق الثنائي للأدمن (TOTP)
-- السر لا يُخزّن بصورته الأصلية؛ التطبيق يخزّنه مشفّرًا باستخدام
-- ADMIN_MFA_ENCRYPTION_KEY (أو سر جلسة الأدمن كاحتياطي متوافق).

create table if not exists public.admin_mfa (
  admin_id text primary key,
  secret_ciphertext text not null,
  enabled boolean not null default false,
  enrolled_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.admin_mfa enable row level security;

drop policy if exists "no public access to admin mfa" on public.admin_mfa;
create policy "no public access to admin mfa"
  on public.admin_mfa
  for all
  to anon, authenticated
  using (false)
  with check (false);

create index if not exists idx_admin_mfa_enabled on public.admin_mfa(enabled);
