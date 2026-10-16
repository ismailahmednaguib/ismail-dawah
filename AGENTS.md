<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## قواعد هذا المستودع

- **بارامترات المسار الديناميكية لا تُفكّ ترميزها تلقائيًا.** في هذا الإصدار من Next.js يصل مقطع المسار كما هو في الرابط (`lesson-quran-%D8%AA%D9%81...`)، بينما `searchParams` تُفكّ ترميزها فعلًا. لذلك أي معرّف عربي مخزّن في قاعدة البيانات لن يُوجَد دون فكّ ترميز.
  - استخدم `decodeParam` / `decodeParams` من `lib/params.ts` في كل صفحة ديناميكية (`[slug]`, `[id]`, `[type]`).
  - اختبار الانحدار: `node scripts/smoke-content.mjs` بعد `npm run build && npm start` — يفحص كل مادة منشورة باللغتين (٤٣٨ رابطًا).
- الترجمة ↔ التعرّف: معرّف (slug) المحتوى **متطابق في اللغتين**، لأن مبدّل اللغة يبدّل مقطع اللغة فقط. لا تُنشئ لاحقة `-en`.
- الترجمة الإنجليزية آلية بمساعدة الذكاء الاصطناعي: تُوسم `is_machine_translated = true` و `is_reviewed = false`.
- **هرم التصنيفات**: `باب (branch) ← مجال (field) ← فرع (subbranch) ← تصنيف (category)`. نفس المعرّف قد يوجد في أكثر من نوع (مثل `aqeedah` بابًا ومجالًا)، لذلك أي ربط يُكتب بصيغة `kind:slug`. لا تعدّل `parent_id` يدويًّا: أضف السطر إلى `PARENTS` في `scripts/relink-taxonomies.mjs` ثم شغّله (معاينة ثم `--commit`) — يعرض شجرة كاملة قبل التنفيذ.
  - التجميع في صفحات `/fields/[slug]` يعمل بمعرّف المفهوم + **كل أحفاده** (`includeDescendants`)، فلا تَعتمد على وجود صفٍّ واحد.
- **قبل كل إضافة محتوى**، شغّل `npm run qa:content` (`scripts/content-qa.mjs`): يكشف الحقول الفارغة والمتون المقتطعة والحروف الدخيلة والعناوين المكرّرة. المخرجات `--json` للتصحيح الآلي. مرجع سكربتات التحقق في `ROADMAP.md` (القسمان 0.2 و0.3).

## بوّابات الجودة (لا تخالفها)

- **قبل كل رفع**: `npm run verify` (الأنواع + اختبارات الوحدة + البناء). البناء الآن **يُفشل عند أي خطأ نوع أو ESLint** — لا `ignoreBuildErrors` بعد اليوم.
- `npm run test:unit` يشغّل `tests/*.test.ts` بمُشغّل Node المدمج (Node ≥ ٢٢.٦ يجرّد الأنواع). لذلك:
  - اكتب اختبارات الوحدة **للمنطق النقي فقط** في ملفات بلا استيرادات أو باستيراد نسبي بامتداد `.ts` صريح (`import { x } from '../lib/y.ts'`).
  - لا تستخدم في الملفات المُختبَرة: `enum` · `namespace` · خصائص المعامل في المُنشئ (`constructor(private x: T)`) — كلها لا يقبلها تجريد الأنواع.
- `.github/workflows/verify.yml`: الوظيفة الثابتة تعمل دائمًا؛ وظيفة القبول (بناء + روابط + محتوى) تعمل فقط إذا كانت أسرار Supabase مضبوطة في المستودع.
- فحوصات إضافية: `qa:secrets` (تسرّب المفاتيح) · `qa:rls` (صلاحيات الجداول بالمفتاح العام) · `qa:citations` (المصادر الشرعية، `--strict` لإلزامها) · `qa:matrix` (تغطية كل باب بالأنواع).

## قاعدة البيانات وRLS (لا تخالفها)

- **كل جدول جديد يحمل بيانات شخصية أو تشغيلية يجب أن يُضاف إلى مكانين**: قائمة `private_tables` في `supabase/migrations/20261017_rls_hardening.sql`، وقائمة `PRIVATE_TABLES` في `scripts/audit-rls.mjs` (وضمن قائمة صفحة `/admin/security`).
- **لا تُطفئ RLS على جدول خاص** لتسهيل قراءة. القراءة الخادمية تستخدم مفتاح الخدمة ويتجاوز RLS أصلًا.
- الجداول العامة المعتمدة (يقرأها `/api/search` و`sitemap.xml` و`rss.xml` بالمفتاح العام عمدًا): `content` · `content_translations` · `taxonomies` · `content_terms`. لا تُقفلها بلا تعويض سياسة قراءة عامة.
- بعد أي تغيير على قاعدة البيانات: `npm run qa:rls` — يجب أن يكون ٠ «مكشوف ببيانات».
- migrations تُنفَّذ **يدويًّا** في SQL Editor بلوحة Supabase؛ لا يوجد مسار آلي لها في المستودع.

## الأمان وحدّ المعدّل

- **لا تكتب محددًا في الذاكرة فقط.** استخدم `rateLimitGuard(req, scope, { identities })` من `lib/rate-limit.ts`: يقرأ الحدود من `site_settings` (المفتاح `rate_limits`) التي يحرّرها الأدمن من `/admin/security`، ويعمل عبر كل النسخ باحتياطي في الذاكرة.
- المنطق النقي في `lib/rate-limit-core.ts` (قابل للاختبار)؛ الطبقة الخادمية في `lib/rate-limit.ts` (فيها `server-only`).
- ترويسات الأمان في `next.config.ts`. لا تُزل `X-Frame-Options` أو CSP لتسهيل مهمة؛ إن احتجت مصدرًا خارجيًّا فوسّع الترويسة بدل حذفها.
- النطاقات غير المربوطة بالمخزن المشترك (التحليلات · رفع الملفات) تعمل في الذاكرة **بقصد** لارتفاع حجمها؛ لا تنقلها بلا سبب.

## صفحات التحكم في اللوحة

- `/admin/security` — حدود المعدّل لكل نطاق + ترويسات الحماية.
- `/admin/quality` — طابور الترجمات الآلية (اعتماد/إلغاء) + فحص الحقول والمصادر. الحقول: `is_reviewed` · `reviewed_by` · `reviewed_at`.
- `/admin/analytics` — إحصاءات من `analytics_events`.
- أي ميزة جديدة يجب أن تكون **قابلة للتحكم من اللوحة**، لا مضمّنة في الكود وحدها.
- `RUNBOOK.md` هو مرجع التشغيل: الإصدار · الحوادث · النسخ الاحتياطي · الملفات الحسّاسة.


