# سجل سطح الإدارة والموقع

> تقرير آلي ثابت؛ لا يتصل بقاعدة البيانات ولا يستبدل اختبار الطرف إلى الطرف.
> تاريخ التوليد: 2026-10-23T20:55:13.597Z

## الملخص

- المسارات العامة: **57**
- مسارات الإدارة: **19**
- واجهات API: **73**
- مفاتيح إعدادات اللوحة المكتشفة: **33**
- العناصر المفحوصة: **6781**
- العناصر الثابتة التي تحتاج قرار ربط/استثناء: **0**
- توزيع الحالات: `admin-ui` = **951** · `api-contract` = **540** · `catalogued` = **2946** · `curated-reference` = **1634** · `immutable-reference` = **710**

## المسارات

| النوع | المسار | الملف | Metadata/مصدر إضافي |
|---|---|---|---|
| public | `/{lang}` | `app/[lang]/page.tsx` | metadata |
| public | `/{lang}/about` | `app/[lang]/about/page.tsx` | metadata |
| public | `/{lang}/account` | `app/[lang]/account/page.tsx` | metadata |
| public | `/{lang}/adhkar` | `app/[lang]/adhkar/page.tsx` | metadata |
| public | `/{lang}/articles` | `app/[lang]/articles/page.tsx` | metadata |
| public | `/{lang}/atheism-response` | `app/[lang]/atheism-response/page.tsx` | metadata |
| public | `/{lang}/bookmarks` | `app/[lang]/bookmarks/page.tsx` | يحتاج فحص metadata |
| public | `/{lang}/calendar` | `app/[lang]/calendar/page.tsx` | metadata |
| public | `/{lang}/contact` | `app/[lang]/contact/page.tsx` | metadata |
| public | `/{lang}/daily-wird` | `app/[lang]/daily-wird/page.tsx` | metadata |
| public | `/{lang}/dawah` | `app/[lang]/dawah/page.tsx` | metadata |
| public | `/{lang}/dawah-guide` | `app/[lang]/dawah-guide/page.tsx` | metadata |
| public | `/{lang}/dawah/path` | `app/[lang]/dawah/path/page.tsx` | metadata |
| public | `/{lang}/doubts` | `app/[lang]/doubts/page.tsx` | metadata |
| public | `/{lang}/download` | `app/[lang]/download/page.tsx` | metadata |
| public | `/{lang}/embrace-islam` | `app/[lang]/embrace-islam/page.tsx` | metadata |
| public | `/{lang}/faq` | `app/[lang]/faq/page.tsx` | metadata |
| public | `/{lang}/fatwa` | `app/[lang]/fatwa/page.tsx` | metadata |
| public | `/{lang}/fields` | `app/[lang]/fields/page.tsx` | metadata |
| public | `/{lang}/fields/{slug}` | `app/[lang]/fields/[slug]/page.tsx` | metadata |
| public | `/{lang}/fiqh` | `app/[lang]/fiqh/page.tsx` | metadata |
| public | `/{lang}/forgot-password` | `app/[lang]/forgot-password/page.tsx` | يحتاج فحص metadata |
| public | `/{lang}/hadith` | `app/[lang]/hadith/page.tsx` | metadata |
| public | `/{lang}/hajj-guide` | `app/[lang]/hajj-guide/page.tsx` | metadata |
| public | `/{lang}/inheritance` | `app/[lang]/inheritance/page.tsx` | metadata |
| public | `/{lang}/khutab` | `app/[lang]/khutab/page.tsx` | يحتاج فحص metadata |
| public | `/{lang}/learn` | `app/[lang]/learn/page.tsx` | metadata |
| public | `/{lang}/learn/{type}/{slug}` | `app/[lang]/learn/[type]/[slug]/page.tsx` | metadata |
| public | `/{lang}/live` | `app/[lang]/live/page.tsx` | metadata |
| public | `/{lang}/login` | `app/[lang]/login/page.tsx` | metadata |
| api | `/{lang}/manifest.webmanifest` | `app/[lang]/manifest.webmanifest/route.ts` | يحتاج فحص metadata |
| public | `/{lang}/prayer-guide` | `app/[lang]/prayer-guide/page.tsx` | metadata |
| public | `/{lang}/prayer-times` | `app/[lang]/prayer-times/page.tsx` | metadata |
| public | `/{lang}/privacy` | `app/[lang]/privacy/page.tsx` | metadata |
| public | `/{lang}/prophets-stories` | `app/[lang]/prophets-stories/page.tsx` | metadata |
| public | `/{lang}/qibla` | `app/[lang]/qibla/page.tsx` | metadata |
| public | `/{lang}/quran` | `app/[lang]/quran/page.tsx` | metadata |
| public | `/{lang}/quran-memorization` | `app/[lang]/quran-memorization/page.tsx` | metadata |
| public | `/{lang}/quran/{id}` | `app/[lang]/quran/[id]/page.tsx` | metadata |
| public | `/{lang}/register` | `app/[lang]/register/page.tsx` | يحتاج فحص metadata |
| public | `/{lang}/religions` | `app/[lang]/religions/page.tsx` | metadata |
| public | `/{lang}/religions/{slug}` | `app/[lang]/religions/[slug]/page.tsx` | metadata |
| public | `/{lang}/religions/comparison` | `app/[lang]/religions/comparison/page.tsx` | metadata |
| public | `/{lang}/religions/methodology` | `app/[lang]/religions/methodology/page.tsx` | metadata |
| public | `/{lang}/religions/resources/{slug}` | `app/[lang]/religions/resources/[slug]/page.tsx` | metadata |
| public | `/{lang}/reset-password` | `app/[lang]/reset-password/page.tsx` | يحتاج فحص metadata |
| public | `/{lang}/responses` | `app/[lang]/responses/page.tsx` | metadata |
| api | `/{lang}/rss.xml` | `app/[lang]/rss.xml/route.ts` | يحتاج فحص metadata |
| public | `/{lang}/ruqyah` | `app/[lang]/ruqyah/page.tsx` | metadata |
| public | `/{lang}/search` | `app/[lang]/search/page.tsx` | metadata |
| public | `/{lang}/tasbih` | `app/[lang]/tasbih/page.tsx` | metadata |
| public | `/{lang}/terms` | `app/[lang]/terms/page.tsx` | metadata |
| public | `/{lang}/topic/{slug}` | `app/[lang]/topic/[slug]/page.tsx` | metadata |
| public | `/{lang}/verify-email` | `app/[lang]/verify-email/page.tsx` | يحتاج فحص metadata |
| public | `/{lang}/women-fatwas` | `app/[lang]/women-fatwas/page.tsx` | يحتاج فحص metadata |
| public | `/{lang}/youth-issues` | `app/[lang]/youth-issues/page.tsx` | metadata |
| public | `/{lang}/zakat` | `app/[lang]/zakat/page.tsx` | metadata |
| admin | `/admin` | `app/admin/page.tsx` | يحتاج فحص metadata |
| admin | `/admin/analytics` | `app/admin/(dashboard)/analytics/page.tsx` | metadata |
| admin | `/admin/audit` | `app/admin/(dashboard)/audit/page.tsx` | metadata |
| admin | `/admin/backup` | `app/admin/(dashboard)/backup/page.tsx` | metadata |
| admin | `/admin/content` | `app/admin/(dashboard)/content/page.tsx` | metadata |
| admin | `/admin/content/{id}` | `app/admin/(dashboard)/content/[id]/page.tsx` | metadata |
| admin | `/admin/content/new` | `app/admin/(dashboard)/content/new/page.tsx` | metadata |
| admin | `/admin/control` | `app/admin/(dashboard)/control/page.tsx` | يحتاج فحص metadata |
| admin | `/admin/login` | `app/admin/login/page.tsx` | يحتاج فحص metadata |
| admin | `/admin/newsletter` | `app/admin/(dashboard)/newsletter/page.tsx` | metadata |
| admin | `/admin/notifications` | `app/admin/(dashboard)/notifications/page.tsx` | metadata |
| admin | `/admin/quality` | `app/admin/(dashboard)/quality/page.tsx` | metadata |
| admin | `/admin/questions` | `app/admin/(dashboard)/questions/page.tsx` | metadata |
| admin | `/admin/review` | `app/admin/(dashboard)/review/page.tsx` | metadata |
| admin | `/admin/security` | `app/admin/(dashboard)/security/page.tsx` | metadata |
| admin | `/admin/settings` | `app/admin/(dashboard)/settings/page.tsx` | metadata |
| admin | `/admin/taxonomies` | `app/admin/(dashboard)/taxonomies/page.tsx` | metadata |
| admin | `/admin/translations` | `app/admin/(dashboard)/translations/page.tsx` | metadata |
| admin | `/admin/users` | `app/admin/(dashboard)/users/page.tsx` | metadata |
| api | `/api/admin/audit` | `app/api/admin/audit/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/backup` | `app/api/admin/backup/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/backup/run` | `app/api/admin/backup/run/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/content` | `app/api/admin/content/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/content/{id}` | `app/api/admin/content/[id]/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/content/{id}/media` | `app/api/admin/content/[id]/media/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/content/{id}/media/{mediaId}` | `app/api/admin/content/[id]/media/[mediaId]/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/content/{id}/references` | `app/api/admin/content/[id]/references/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/content/{id}/references/{referenceId}` | `app/api/admin/content/[id]/references/[referenceId]/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/content/{id}/revisions` | `app/api/admin/content/[id]/revisions/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/content/{id}/revisions/{revisionId}` | `app/api/admin/content/[id]/revisions/[revisionId]/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/content/{id}/terms` | `app/api/admin/content/[id]/terms/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/control-surface` | `app/api/admin/control-surface/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/dawah-assignments` | `app/api/admin/dawah-assignments/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/dawah-journey` | `app/api/admin/dawah-journey/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/email/test` | `app/api/admin/email/test/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/export` | `app/api/admin/export/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/login` | `app/api/admin/login/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/logout` | `app/api/admin/logout/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/me` | `app/api/admin/me/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/media` | `app/api/admin/media/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/mfa` | `app/api/admin/mfa/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/mfa/verify` | `app/api/admin/mfa/verify/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/newsletter` | `app/api/admin/newsletter/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/quality` | `app/api/admin/quality/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/review` | `app/api/admin/review/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/security` | `app/api/admin/security/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/session` | `app/api/admin/session/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/settings` | `app/api/admin/settings/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/setup` | `app/api/admin/setup/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/taxonomies` | `app/api/admin/taxonomies/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/translations` | `app/api/admin/translations/route.ts` | يحتاج فحص metadata |
| api | `/api/admin/users` | `app/api/admin/users/route.ts` | يحتاج فحص metadata |
| api | `/api/analytics/track` | `app/api/analytics/track/route.ts` | يحتاج فحص metadata |
| api | `/api/assistant` | `app/api/assistant/route.ts` | يحتاج فحص metadata |
| api | `/api/auth/change-password` | `app/api/auth/change-password/route.ts` | يحتاج فحص metadata |
| api | `/api/auth/forgot-password` | `app/api/auth/forgot-password/route.ts` | يحتاج فحص metadata |
| api | `/api/auth/resend-verification` | `app/api/auth/resend-verification/route.ts` | يحتاج فحص metadata |
| api | `/api/auth/reset-password` | `app/api/auth/reset-password/route.ts` | يحتاج فحص metadata |
| api | `/api/auth/verify-email` | `app/api/auth/verify-email/route.ts` | يحتاج فحص metadata |
| api | `/api/content` | `app/api/content/route.ts` | يحتاج فحص metadata |
| api | `/api/content/translate` | `app/api/content/translate/route.ts` | يحتاج فحص metadata |
| api | `/api/cron/backup` | `app/api/cron/backup/route.ts` | يحتاج فحص metadata |
| api | `/api/cron/dawah-journey` | `app/api/cron/dawah-journey/route.ts` | يحتاج فحص metadata |
| api | `/api/cron/publish` | `app/api/cron/publish/route.ts` | يحتاج فحص metadata |
| api | `/api/dawah/journey/subscribe` | `app/api/dawah/journey/subscribe/route.ts` | يحتاج فحص metadata |
| api | `/api/dawah/journey/unsubscribe` | `app/api/dawah/journey/unsubscribe/route.ts` | يحتاج فحص metadata |
| api | `/api/debug` | `app/api/debug/route.ts` | يحتاج فحص metadata |
| api | `/api/download/android` | `app/api/download/android/route.ts` | يحتاج فحص metadata |
| api | `/api/learn/progress` | `app/api/learn/progress/route.ts` | يحتاج فحص metadata |
| api | `/api/library` | `app/api/library/route.ts` | يحتاج فحص metadata |
| api | `/api/login` | `app/api/login/route.ts` | يحتاج فحص metadata |
| api | `/api/logout` | `app/api/logout/route.ts` | يحتاج فحص metadata |
| api | `/api/me` | `app/api/me/route.ts` | يحتاج فحص metadata |
| api | `/api/newsletter/subscribe` | `app/api/newsletter/subscribe/route.ts` | يحتاج فحص metadata |
| api | `/api/notifications/send` | `app/api/notifications/send/route.ts` | يحتاج فحص metadata |
| api | `/api/notifications/subscribe` | `app/api/notifications/subscribe/route.ts` | يحتاج فحص metadata |
| api | `/api/og` | `app/api/og/route.ts` | يحتاج فحص metadata |
| api | `/api/public/content` | `app/api/public/content/route.ts` | يحتاج فحص metadata |
| api | `/api/public/prayer-times` | `app/api/public/prayer-times/route.ts` | يحتاج فحص metadata |
| api | `/api/questions` | `app/api/questions/route.ts` | يحتاج فحص metadata |
| api | `/api/questions/admin` | `app/api/questions/admin/route.ts` | يحتاج فحص metadata |
| api | `/api/register` | `app/api/register/route.ts` | يحتاج فحص metadata |
| api | `/api/search` | `app/api/search/route.ts` | يحتاج فحص metadata |
| api | `/api/site-settings` | `app/api/site-settings/route.ts` | يحتاج فحص metadata |
| api | `/api/stats` | `app/api/stats/route.ts` | يحتاج فحص metadata |
| api | `/api/stats/advanced` | `app/api/stats/advanced/route.ts` | يحتاج فحص metadata |
| api | `/api/upload` | `app/api/upload/route.ts` | يحتاج فحص metadata |
| api | `/api/verify` | `app/api/verify/route.ts` | يحتاج فحص metadata |
| api | `/manifest.webmanifest` | `app/manifest.webmanifest/route.ts` | يحتاج فحص metadata |
| public | `/page.tsx` | `app/page.tsx` | يحتاج فحص metadata |
| api | `/register` | `app/register/route.ts` | يحتاج فحص metadata |
| public | `/setup-admin` | `app/setup-admin/page.tsx` | يحتاج فحص metadata |

## مفاتيح الإعدادات

- `address` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `assistant` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `bio` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `cred1` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `cred2` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `dawahJourney` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `editorPicks` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `email` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `emailVerification` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `homeHeroText` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `homeKicker` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `interests` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `jobTitle` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `liveUrl` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `meetingLink` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `metaTitle` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `motto` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `ogImage` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `ownerName` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `passwordChange` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `passwordReset` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `playStoreUrl` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `portraitSrc` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `prayerTools` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `publicApiEnabled` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `questions` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `redirects` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `shortName` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `showPrayerBar` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `theme` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `tools` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `wa` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`
- `weeklySchedule` — مصدره الحالي: `components/admin/SiteSettingsClient.tsx`

## العناصر الثابتة التي تحتاج ربطًا أو استثناءً موثقًا

| المفتاح | الصفحة | النوع | الملف:السطر | القيمة المختصرة | مفتاح الإدارة | الحالة |
|---|---|---|---|---|---|---|

## طريقة الاستخدام

```bash
npm run audit:control-surface
```

كل عنصر غير مرتبط يحتاج إما إلى مفتاح إعداد/محتوى واختبار طرف إلى طرف، أو استثناء موثق يوضح أنه ثابت لأسباب أمنية أو شرعية أو حسابية.
