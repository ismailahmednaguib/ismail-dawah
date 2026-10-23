// =====================================================
// ISMAIL ACADEMY - UNIFIED CONTENT TYPES
// المرحلة الأولى: أنواع البيانات الموحدة
// =====================================================

// ===== الأنواع الأساسية =====
export type ContentType =
  | 'article'
  | 'lesson'
  | 'course'
  | 'course_lesson'
  | 'book'
  | 'research'
  | 'fatwa'
  | 'khutbah'
  | 'audio'
  | 'video'
  | 'hadith'
  | 'duaa'
  | 'story'
  | 'faq'
  | 'event'
  | 'page'
  | 'profile';

export type ContentStatus =
  | 'draft'
  | 'in_review'
  | 'scheduled'
  | 'published'
  | 'archived'
  | 'rejected';

export type Audience =
  | 'non_muslim'
  | 'muslim_new'
  | 'muslim_general'
  | 'student'
  | 'scholar'
  | 'daee'
  | 'parent'
  | 'teacher';

export type AgeGroup = 'kids' | 'teens' | 'youth' | 'adults' | 'seniors' | 'all';

export type EduLevel = 'beginner' | 'intermediate' | 'advanced' | 'specialized';

export type Madhhab =
  | 'hanafi'
  | 'maliki'
  | 'shafii'
  | 'hanbali'
  | 'zahiri'
  | 'jafari'
  | 'general';

export type AppRole =
  | 'super_admin'
  | 'admin'
  | 'editor'
  | 'scholar_reviewer'
  | 'translator'
  | 'contributor';

// ===== واجهات البيانات =====
export interface Content {
  id: string;
  content_type: ContentType;
  status: ContentStatus;
  lang_original: string;
  audience: Audience[];
  age_groups: AgeGroup[];
  levels: EduLevel[];
  madhhabs: Madhhab[];
  parent_id: string | null;
  sort_order: number;
  author_id: string | null;
  reviewer_id: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  expires_at: string | null;
  views: number;
  bookmark_count: number;
  needs_scholar_review: boolean;
  is_sensitive: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ContentTranslation {
  id: string;
  content_id: string;
  lang: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  body_plain: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  is_machine_translated: boolean;
  is_reviewed: boolean;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export type RefKind =
  | 'quran'
  | 'hadith'
  | 'athar'
  | 'scholar_quote'
  | 'fiqh_rule'
  | 'book'
  | 'fatwa_source'
  | 'other';

export type HadithGrade = 'sahih' | 'hasan' | 'daif' | 'mawdu' | 'unknown';

export interface ContentReferenceRow {
  id: string;
  content_id: string;
  kind: RefKind;
  surah: number | null;
  ayah_from: number | null;
  ayah_to: number | null;
  hadith_text: string | null;
  narrator: string | null;
  hadith_book: string | null;
  hadith_number: number | null;
  hadith_grade: HadithGrade | null;
  graded_by: string | null;
  scholar_name: string | null;
  scholar_death: string | null;
  book_title: string | null;
  volume_page: string | null;
  quote_text: string | null;
  note: string | null;
  verified: boolean;
  verified_by: string | null;
  sort_order: number;
}

export interface Taxonomy {
  id: string;
  kind: string;
  parent_id: string | null;
  lang: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface UserRole {
  user_id: string;
  roles: AppRole[];
  full_name: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
}

// ===== المحتوى الكامل للعرض =====
export interface ContentMedia {
  id: string;
  url: string;
  type: 'image' | 'pdf' | 'audio' | 'video';
  storage_path?: string | null;
  title?: string | null;
  alt_text?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  duration_seconds?: number | null;
  sort_order?: number;
  created_at?: string;
}

export interface LearnerContentProgress {
  user_id?: string;
  content_id: string;
  last_position_seconds: number;
  completed_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ContentWithDetails extends Content {
  translation: ContentTranslation;
  available_langs: string[];
  references: ContentReferenceRow[];
  terms: Taxonomy[];
  author_name?: string | null;
  reviewer_name?: string | null;
  media: ContentMedia[];
}

// ===== فلاتر البحث والتصفية =====
export interface ContentFilters {
  type?: ContentType;
  audience?: Audience;
  age_group?: AgeGroup;
  level?: EduLevel;
  madhhab?: Madhhab;
  lang?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

// ===== النتائج =====
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
