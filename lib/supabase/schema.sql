-- =====================================================
-- ISMAIL ACADEMY - UNIFIED CONTENT SCHEMA
-- المرحلة الأولى: البنية الأساسية
-- =====================================================

-- 1. الأنواع (Enums)
create type content_type as enum (
  'article', 'lesson', 'course', 'course_lesson', 'book', 'research',
  'fatwa', 'khutbah', 'audio', 'video', 'hadith', 'duaa', 'story',
  'faq', 'event', 'page', 'profile'
);

create type content_status as enum (
  'draft', 'in_review', 'published', 'archived', 'rejected'
);

create type audience_type as enum (
  'non_muslim', 'muslim_new', 'muslim_general', 'student',
  'scholar', 'daee', 'parent', 'teacher'
);

create type age_group as enum (
  'kids', 'teens', 'youth', 'adults', 'seniors', 'all'
);

create type edu_level as enum (
  'beginner', 'intermediate', 'advanced', 'specialized'
);

create type madhhab as enum (
  'hanafi', 'maliki', 'shafii', 'hanbali', 'zahiri', 'jafari', 'general'
);

create type ref_kind as enum (
  'quran', 'hadith', 'athar', 'scholar_quote', 'fiqh_rule', 'book', 'fatwa_source', 'other'
);

create type hadith_grade as enum (
  'sahih', 'hasan', 'daif', 'mawdu', 'unknown'
);

create type app_role as enum (
  'super_admin', 'admin', 'editor', 'scholar_reviewer', 'translator', 'contributor'
);

-- 2. جدول المحتوى الرئيسي
create table content (
  id uuid primary key default gen_random_uuid(),
  content_type content_type not null,
  status content_status not null default 'draft',
  lang_original varchar(8) not null default 'ar',
  audience audience_type[] not null default '{muslim_general}',
  age_groups age_group[] not null default '{all}',
  levels edu_level[] not null default '{beginner}',
  madhhabs madhhab[] not null default '{general}',
  parent_id uuid references content(id) on delete set null,
  sort_order int not null default 0,
  author_id uuid references auth.users(id),
  reviewer_id uuid references auth.users(id),
  published_at timestamptz,
  expires_at timestamptz,
  views int not null default 0,
  bookmark_count int not null default 0,
  needs_scholar_review boolean not null default false,
  is_sensitive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index idx_content_type_status on content(content_type, status);
create index idx_content_audience on content using gin(audience);
create index idx_content_age on content using gin(age_groups);
create index idx_content_parent on content(parent_id, sort_order);
create index idx_content_published on content(status, published_at desc);

-- 3. الترجمات
create table content_translations (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content(id) on delete cascade,
  lang varchar(8) not null,
  slug varchar(255) not null,
  title text not null,
  summary text,
  body text,
  body_plain text,
  meta_title varchar(160),
  meta_description varchar(300),
  og_image_url text,
  is_machine_translated boolean not null default false,
  is_reviewed boolean not null default false,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_id, lang),
  unique (lang, slug)
);

create index idx_translation_search on content_translations
  using gin(to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body_plain,'')));
create index idx_translation_lang_slug on content_translations(lang, slug);
create index idx_translation_content on content_translations(content_id);

-- 4. التصنيفات والوسوم
create table taxonomies (
  id uuid primary key default gen_random_uuid(),
  kind varchar(30) not null,
  parent_id uuid references taxonomies(id) on delete cascade,
  lang varchar(8) not null default 'ar',
  name text not null,
  slug varchar(200) not null,
  icon varchar(20),
  color varchar(20),
  sort_order int not null default 0,
  unique (kind, lang, slug)
);

create table content_terms (
  content_id uuid not null references content(id) on delete cascade,
  taxonomy_id uuid not null references taxonomies(id) on delete cascade,
  primary key (content_id, taxonomy_id)
);

create index idx_terms_taxonomy on content_terms(taxonomy_id);

-- 5. التوثيق الشرعي
create table content_references (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content(id) on delete cascade,
  kind ref_kind not null,
  surah smallint check (surah between 1 and 114),
  ayah_from smallint,
  ayah_to smallint,
  hadith_text text,
  narrator text,
  hadith_book varchar(80),
  hadith_number int,
  hadith_grade hadith_grade,
  graded_by text,
  scholar_name text,
  scholar_death varchar(20),
  book_title text,
  volume_page varchar(60),
  quote_text text,
  note text,
  verified boolean not null default false,
  verified_by uuid references auth.users(id),
  sort_order int not null default 0
);

create index idx_ref_content on content_references(content_id);
create index idx_ref_quran on content_references(surah, ayah_from) where kind = 'quran';

-- 6. وسائط المحتوى
create table content_media (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content(id) on delete cascade,
  type varchar(20) not null check (type in ('image', 'pdf', 'audio', 'video')),
  url text not null,
  storage_path text,
  title text,
  alt_text text,
  mime_type varchar(120),
  size_bytes bigint,
  duration_seconds int,
  sort_order int not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_media_content on content_media(content_id, sort_order, created_at);

-- 6.1 تقدّم المتعلم (يدعم users الرقمي وprofiles ذي المعرّف النصي)
create table learner_content_progress (
  user_id text not null,
  content_id uuid not null references content(id) on delete cascade,
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create index idx_learner_progress_user on learner_content_progress(user_id, updated_at desc);
create index idx_learner_progress_content on learner_content_progress(content_id);

-- 6. الأدوار والصلاحيات
create table user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  roles app_role[] not null default '{contributor}',
  full_name text,
  bio text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table audit_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  action varchar(40) not null,
  table_name varchar(60) not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip inet,
  created_at timestamptz not null default now()
);

create index idx_audit_record on audit_log(table_name, record_id, created_at desc);

create table review_queue (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content(id) on delete cascade,
  submitted_by uuid references auth.users(id),
  assigned_to uuid references auth.users(id),
  status varchar(20) not null default 'pending',
  scholar_notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index idx_review_status on review_queue(status, created_at desc);

-- 7. إعدادات الموقع
create table site_settings (
  key varchar(80) not null,
  lang varchar(8) not null default 'ar',
  value jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  primary key (key, lang)
);

-- 8. سياسات الحماية (RLS)
alter table content enable row level security;
alter table content_translations enable row level security;
alter table content_references enable row level security;
alter table taxonomies enable row level security;
alter table content_terms enable row level security;
alter table user_roles enable row level security;
alter table review_queue enable row level security;
alter table site_settings enable row level security;
alter table audit_log enable row level security;
alter table content_media enable row level security;
alter table learner_content_progress enable row level security;

-- القراءة العامة: المنشور فقط
create policy "public read published" on content
  for select using (status = 'published');

create policy "public read translations" on content_translations
  for select using (
    exists (
      select 1 from content c
      where c.id = content_translations.content_id and c.status = 'published'
    )
  );

create policy "public read taxonomies" on taxonomies
  for select using (true);

create policy "public read terms" on content_terms
  for select using (
    exists (
      select 1 from content c
      where c.id = content_terms.content_id and c.status = 'published'
    )
  );

create policy "public read references" on content_references
  for select using (
    verified = true
    and
    exists (
      select 1 from content c
      where c.id = content_references.content_id and c.status = 'published'
    )
  );

create policy "public read published media" on content_media
  for select using (
    exists (
      select 1 from content c
      where c.id = content_media.content_id and c.status = 'published'
    )
  );

-- لا نعرض أدوار المستخدمين أو بياناتهم الشخصية للعامة.

-- الكتابة: المحررون فأعلى
create policy "editors write content" on content
  for all using (
    exists (
      select 1 from user_roles ur
      where ur.user_id = auth.uid()
        and ur.is_active
        and ur.roles && array['super_admin','admin','editor']::app_role[]
    )
  );

create policy "editors write translations" on content_translations
  for all using (
    exists (
      select 1 from user_roles ur
      where ur.user_id = auth.uid()
        and ur.is_active
        and ur.roles && array['super_admin','admin','editor','translator']::app_role[]
    )
  );

create policy "editors write terms" on content_terms
  for all using (
    exists (
      select 1 from user_roles ur
      where ur.user_id = auth.uid()
        and ur.is_active
        and ur.roles && array['super_admin','admin','editor']::app_role[]
    )
  );

create policy "editors write media" on content_media
  for all using (
    exists (
      select 1 from user_roles ur
      where ur.user_id = auth.uid()
        and ur.is_active
        and ur.roles && array['super_admin','admin','editor']::app_role[]
    )
  );

-- التقدم يُقرأ ويُكتب عبر API الخادم بعد التحقق من جلسة users المخصصة.
-- عدم وجود سياسة عامة مقصود حتى لا يكشف anon بيانات المتعلمين.

create policy "editors write taxonomies" on taxonomies
  for all using (
    exists (
      select 1 from user_roles ur
      where ur.user_id = auth.uid()
        and ur.is_active
        and ur.roles && array['super_admin','admin','editor']::app_role[]
    )
  );

-- المراجعة العلمية
create policy "reviewers write review" on review_queue
  for all using (
    exists (
      select 1 from user_roles ur
      where ur.user_id = auth.uid()
        and ur.is_active
        and ur.roles && array['super_admin','admin','scholar_reviewer']::app_role[]
    )
  );

-- الإعدادات: المدير العام فقط
create policy "super admin settings" on site_settings
  for all using (
    exists (
      select 1 from user_roles ur
      where ur.user_id = auth.uid()
        and 'super_admin' = any(ur.roles)
    )
  );

-- سجل التدقيق: القراءة للمديرين فقط
create policy "admins read audit" on audit_log
  for select using (
    exists (
      select 1 from user_roles ur
      where ur.user_id = auth.uid()
        and ur.is_active
        and ur.roles && array['super_admin','admin']::app_role[]
    )
  );

-- 9. تحديث التواريخ تلقائياً
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_content_updated_at
  before update on content
  for each row execute function update_updated_at_column();

create trigger set_translation_updated_at
  before update on content_translations
  for each row execute function update_updated_at_column();

create trigger set_media_updated_at
  before update on content_media
  for each row execute function update_updated_at_column();

create trigger set_learner_progress_updated_at
  before update on learner_content_progress
  for each row execute function update_updated_at_column();

-- 10. بيانات أولية: إعدادات الموقع الأساسية
insert into site_settings (key, lang, value) values
  ('site.name', 'ar', '{"value": "منصة إسماعيل أحمد نجيب"}'),
  ('site.name', 'en', '{"value": "Ismail Ahmed Naguib Platform"}'),
  ('site.description', 'ar', '{"value": "منصة إسلامية شاملة للتعلم والعبادة والدعوة"}'),
  ('site.description', 'en', '{"value": "A comprehensive Islamic platform for learning, worship, and dawah"}')
on conflict (key, lang) do nothing;
