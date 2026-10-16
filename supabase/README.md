# Supabase setup

1. نفّذ `lib/supabase/schema.sql` على مشروع Supabase جديد أو قارن الجداول مع قاعدة المشروع الحالية.
2. نفّذ ملفات `supabase/migrations` بالترتيب الزمني، ومنها:
   - `20261015_public_verified_references.sql`
   - `20261015_content_media.sql`
   - `20261015_learner_content_progress.sql`
   - `20261016_analytics_events.sql`
3. راجع سياسات RLS من لوحة Supabase بعد التنفيذ.
4. ضع `SUPABASE_SERVICE_ROLE_KEY` ومفاتيح الجلسات في بيئة الخادم فقط، ولا تستخدمها في مكونات العميل.
5. أنشئ bucket الرفع باسم `UPLOAD_BUCKET`، واترك `UPLOAD_AUTO_CREATE_BUCKET=false` في الإنتاج.
6. يعتمد حفظ تقدم التعلم على معرّف جلسة المصادقة المخصصة الحالية، ويتم الوصول إلى جدول التقدم عبر API الخادم فقط.

لا تضع أي قيمة حقيقية للمفاتيح داخل ملفات المشروع أو لقطات الشاشة أو سجلات البناء.
