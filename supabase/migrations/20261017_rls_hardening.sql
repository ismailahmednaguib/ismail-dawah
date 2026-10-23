-- ============================================================
-- 🚨 20261017 — تحصين RLS (أولوية أمنية عاجلة)
-- ------------------------------------------------------------
-- سبب الملف: تدقيق آلي (`npm run qa:rls`) أثبت أن المفتاح العام (anon)
-- كان يقرأ جداول خاصة على قاعدة الإنتاج، ومنها:
--   • admin_users           → كشف email + password_hash + salt لحسابات الإدارة  ← خطر حرج
--   • admin_login_attempts  → كشف بريد الإدارة ومحاولات الدخول (ip · user_agent)
--   • user_roles            → كشف الأدوار
--   • page_views            → كشف زيارات الزوار ووكلاء المستخدم والمراجع
-- وبقية الجداول الخاصة كانت قابلة للقراءة أيضًا (تُسرّب فور امتلائها).
--
-- الإصلاح: تشغيل RLS بلا أي سياسة عامة + سحب صلاحيات anon/authenticated.
-- لا يتأثّر أي مسار في التطبيق: كل قراءة خادمية تستخدم مفتاح الخدمة
-- (`getSupabaseAdmin` / `createAdminClient` / `createContentClient`) وهو يتجاوز RLS.
--
-- الجداول العامة بطبيعتها (content · content_translations · taxonomies ·
-- content_terms · content_references · content_media · site_content) لا تُلمس هنا،
-- لأن `/api/search` و`sitemap` و`rss` تقرأها بالمفتاح العام عمدًا.
--
-- نفّذ هذا الملف أولًا في SQL Editor بلوحة Supabase، ثم أعد فحص `npm run qa:rls`.
-- ============================================================

do $$
declare
  t text;
  private_tables text[] := array[
    'admin_users',
    'admin_login_attempts',
    'user_roles',
    'users',
    'audit_log',
    'activity_log',
    'page_views',
    'analytics_events',
    'site_settings',
    'review_queue',
    'content_revisions',
    'newsletter_subscribers',
    'dawah_journey_subscribers',
    'dawah_request_assignments',
    'learner_content_progress',
    'user_favorites',
    'user_questions',
    'media_library',
    'rate_limits',
    'push_subscriptions'
  ];
begin
  foreach t in array private_tables loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public'
        and table_name = t
        and table_type = 'BASE TABLE'
    ) then
      -- ١) تشغيل RLS بلا سياسات ⇒ لا يقرأ أحد غير مفتاح الخدمة
      execute format('alter table public.%I enable row level security', t);
      -- ٢) طبقة ثانية: سحب الصلاحيات الممنوحة صراحةً للزائر
      execute format('revoke all on table public.%I from anon, authenticated', t);
      raise notice 'تم تحصين الجدول: %', t;
    else
      raise notice 'متجاوَز (غير موجود): %', t;
    end if;
  end loop;
end $$;

-- ============================================================
-- تحقّق سريع بعد التنفيذ (يجب أن تكون كلها true):
-- ============================================================
-- select relname, relrowsecurity
-- from pg_class
-- where relnamespace = 'public'::regnamespace
--   and relname in ('admin_users','admin_login_attempts','user_roles','page_views',
--                   'site_settings','newsletter_subscribers','user_questions')
-- order by relname;
