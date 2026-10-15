// lib/page-sections.ts
// ============================================================
// سجلّ أقسام الصفحات + إخفاء/إظهار صفحات كاملة.
// ملف آمن للاستخدام في Server و Client Components (بلا اعتماد على الشبكة).
// تُقرأ القيم المحفوظة من إعدادات المنصة:
//   pageSections  -> { [pageKey]: { [sectionKey]: boolean } }
//   sectionTitles -> { [pageKey]: { [sectionKey]: { ar, en } } }
//   hiddenPages   -> { [pageKey]: boolean }
// ============================================================

import type { Lang } from "./i18n";

export type SectionTuple = [key: string, ar: string, en: string];
export type PageTuple = [
  key: string,
  path: string,
  ar: string,
  en: string,
  sections: SectionTuple[],
];

const S = (key: string, ar: string, en: string): SectionTuple => [key, ar, en];

// ============================================================
// السجلّ الكامل
// ============================================================

export const PAGES: PageTuple[] = [
  [
    "home",
    "/",
    "الرئيسية",
    "Home",
    [
      S("hero", "الترويسة", "Hero"),
      S("quickTools", "الأدوات السريعة", "Quick Tools"),
      S("paths", "مسارات الزائر", "Visitor Paths"),
      S("learn", "قسم تعلّم", "Learn Section"),
      S("responses", "العلوم والردود", "Knowledge & Responses"),
      S("verse", "آية اليوم", "Verse of the Day"),
      S("dawah", "قسم الدعوة", "Dawah Section"),
      S("portal", "بوابة غير المسلمين", "Non-Muslim Portal"),
      S("latest", "أحدث ما نُشر", "Latest Published"),
      S("newsletter", "النشرة البريدية", "Newsletter"),
      S("download", "تطبيق أندرويد", "Android App"),
      S("cta", "الدعوة الختامية", "Final CTA"),
    ],
  ],
  ["quran", "/quran", "القرآن الكريم", "Holy Quran", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة", "Introduction"),
    S("search", "البحث والفلترة", "Search & Filter"),
    S("list", "قائمة السور", "Surah List"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("note", "ملاحظة", "Notice"),
  ]],
  ["quran-surah", "/quran", "صفحة السورة", "Surah Page", [
    S("hero", "ترويسة السورة", "Surah Hero"),
    S("reciter", "اختيار القارئ", "Reciter Picker"),
    S("player", "المشغّل الصوتي", "Audio Player"),
    S("ayahs", "الآيات", "Ayahs"),
    S("nav", "التنقل بين السور", "Surah Navigation"),
  ]],
  ["hadith", "/hadith", "الحديث", "Hadith", [
    S("hero", "الترويسة", "Hero"),
    S("content", "قائمة الأحاديث", "Hadith List"),
    S("related", "صفحات ذات صلة", "Related Pages"),
  ]],
  ["adhkar", "/adhkar", "الأذكار", "Adhkar", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("features", "مميزات الصفحة", "Features"),
    S("content", "الأذكار", "Adhkar Content"),
  ]],
  ["prayer-times", "/prayer-times", "مواقيت الصلاة", "Prayer Times", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة والمميزات", "Intro & Features"),
    S("content", "المواقيت التفاعلية", "Interactive Times"),
    S("related", "صفحات ذات صلة", "Related Pages"),
  ]],
  ["qibla", "/qibla", "اتجاه القبلة", "Qibla", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة", "Introduction"),
    S("content", "المحتوى التفاعلي", "Interactive Content"),
    S("related", "صفحات ذات صلة", "Related Pages"),
  ]],
  ["tasbih", "/tasbih", "المسبحة", "Tasbih", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة", "Introduction"),
    S("content", "المسبحة التفاعلية", "Interactive Tasbih"),
    S("virtues", "فضائل التسبيح", "Virtues"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("tips", "نصائح", "Tips"),
  ]],
  ["calendar", "/calendar", "التقويم الهجري", "Hijri Calendar", [
    S("hero", "المناسبة القادمة", "Next Occasion"),
    S("today", "بطاقة اليوم", "Today Card"),
    S("stats", "الإحصائيات", "Stats"),
    S("upcoming", "المناسبات القادمة", "Upcoming Events"),
    S("all", "كل المناسبات", "All Events"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("note", "تنبيه", "Notice"),
  ]],
  ["fatwa", "/fatwa", "الفتاوى", "Fatwas", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("search", "البحث والفلترة", "Search & Filter"),
    S("categories", "التصنيفات السريعة", "Quick Categories"),
    S("featured", "فتاوى مميزة", "Featured Fatwas"),
    S("list", "قائمة الفتاوى", "Fatwa List"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("note", "تنبيه", "Notice"),
  ]],
  ["women-fatwas", "/women-fatwas", "فتاوى المرأة", "Women's Fatwas", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("why", "لماذا فتاوى خاصة", "Why Special"),
    S("search", "البحث", "Search"),
    S("filters", "الفلاتر", "Filters"),
    S("list", "قائمة الفتاوى", "Fatwa List"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("notes", "تنبيهات فقهية", "Fiqh Notes"),
  ]],
  ["articles", "/articles", "المقالات", "Articles", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("featured", "مقالات مميزة", "Featured Articles"),
    S("search", "البحث والفلترة", "Search & Filter"),
    S("categories", "التصنيفات السريعة", "Quick Categories"),
    S("list", "قائمة المقالات", "Articles List"),
    S("note", "تنبيه", "Notice"),
    S("quickLinks", "روابط سريعة", "Quick Links"),
  ]],
  ["doubts", "/doubts", "الشبهات والردود", "Doubts", [
    S("header", "الترويسة", "Header"),
    S("quickNav", "تنقل سريع", "Quick Nav"),
    S("rules", "قواعد التعامل", "Handling Rules"),
    S("list", "شبهات وإجابات", "Doubts & Answers"),
    S("note", "تنبيه منهجي", "Methodology Notice"),
    S("links", "روابط مفيدة", "Useful Links"),
  ]],
  ["responses", "/responses", "مركز الردود", "Responses Center", [
    S("hero", "الترويسة", "Hero"),
    S("intro", "نبذة عن المركز", "About the Center"),
    S("categories", "التصنيفات", "Categories"),
    S("featured", "الردود المميزة", "Featured Responses"),
  ]],
  ["atheism-response", "/atheism-response", "الرد على الإلحاد", "Atheism Response", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة المنهجية", "Methodology Intro"),
    S("quickNav", "تنقل سريع", "Quick Nav"),
    S("foundations", "أسس الرد", "Foundations"),
    S("qa", "الأسئلة والشبهات", "Questions & Doubts"),
    S("note", "تنبيه منهجي", "Notice"),
    S("related", "صفحات ذات صلة", "Related Pages"),
  ]],
  ["prophets-stories", "/prophets-stories", "قصص الأنبياء", "Prophets Stories", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة", "Introduction"),
    S("search", "البحث", "Search"),
    S("quickNav", "تنقل سريع", "Quick Nav"),
    S("list", "القصص", "Stories"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("note", "ملاحظة", "Notice"),
  ]],
  ["inheritance", "/inheritance", "المواريث", "Inheritance", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("form", "النموذج", "Form"),
    S("results", "النتائج", "Results"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("notes", "ملاحظات فقهية", "Fiqh Notes"),
  ]],
  ["learn", "/learn", "تعلّم", "Learn", [
    S("hero", "الترويسة", "Hero"),
    S("content", "المحتوى", "Content"),
    S("related", "صفحات ذات صلة", "Related Pages"),
  ]],
  ["fiqh", "/fiqh", "الفقه", "Fiqh", [
    S("hero", "الترويسة", "Hero"),
    S("content", "المحتوى", "Content"),
    S("related", "صفحات ذات صلة", "Related Pages"),
  ]],
  ["dawah", "/dawah", "بوابة غير المسلمين", "Non-Muslim Portal", [
    S("hero", "الترويسة", "Hero"),
    S("intro", "المقدمة والأقسام", "Intro & Sections"),
    S("faq", "الأسئلة الشائعة", "FAQ"),
  ]],
  ["dawah-guide", "/dawah-guide", "دليل الدعوة", "Dawah Guide", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة", "Introduction"),
    S("quickNav", "تنقل سريع", "Quick Nav"),
    S("principles", "أصول الدعوة", "Principles"),
    S("steps", "خطوات عملية", "Practical Steps"),
    S("skills", "مهارات الداعية", "Skills"),
    S("mistakes", "أخطاء شائعة", "Common Mistakes"),
    S("checklist", "قائمة تحضير", "Checklist"),
    S("note", "تنبيه مهم", "Notice"),
    S("related", "صفحات ذات صلة", "Related Pages"),
  ]],
  ["fields", "/fields", "المجالات الدعوية", "Dawah Fields", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة", "Introduction"),
    S("gridTitle", "عنوان الشبكة", "Grid Title"),
    S("grid", "شبكة المجالات", "Fields Grid"),
    S("related", "صفحات ذات صلة", "Related Pages"),
  ]],
  ["field", "/fields", "صفحة مجال", "Field Page", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("content", "محتوى مرتبط", "Related Content"),
    S("related", "مجالات ذات صلة", "Related Fields"),
    S("nav", "التنقل بين المجالات", "Field Navigation"),
    S("cta", "العودة", "Back CTA"),
  ]],
  ["projects", "/projects", "المشاريع", "Projects", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة", "Introduction"),
    S("projects", "المشاريع", "Projects"),
    S("why", "لماذا تساهم", "Why Contribute"),
    S("verse", "آية كريمة", "Verse"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("notes", "تنبيهات", "Notices"),
  ]],
  ["map", "/map", "الخريطة الدعوية", "Dawah Map", [
    S("hero", "الترويسة", "Hero"),
    S("content", "المحتوى الرئيسي", "Main Content"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("notes", "تنبيهات مهمة", "Important Notices"),
  ]],
  ["khutab", "/khutab", "الخطب", "Khutbahs", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("filters", "الفلاتر", "Filters"),
    S("list", "قائمة الخطب", "Khutbah List"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("note", "تنبيه مهم", "Notice"),
  ]],
  ["news", "/news", "الأخبار", "News", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("content", "المحتوى الرئيسي", "Main Content"),
    S("newsletter", "النشرة البريدية", "Newsletter"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("note", "تنبيه", "Notice"),
  ]],
  ["embrace-islam", "/embrace-islam", "اعتناق الإسلام", "Embrace Islam", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("shahada", "قسم الشهادتين", "Shahada"),
    S("steps", "خطوات البدء", "Starting Steps"),
    S("faq", "الأسئلة الشائعة", "FAQ"),
    S("resources", "موارد مساعدة", "Resources"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("note", "تنبيه مهم", "Notice"),
  ]],
  ["youth-issues", "/youth-issues", "قضايا الشباب", "Youth Issues", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة", "Introduction"),
    S("issues", "القضايا والحلول", "Issues & Solutions"),
    S("message", "رسالة للشباب", "Message"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("notes", "تنبيهات", "Notices"),
  ]],
  ["khatm-dua", "/khatm-dua", "ختم الدعاء", "Khatm Dua", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة", "Introduction"),
    S("steps", "الخطوات", "Steps"),
    S("table", "الجدول", "Table"),
    S("duas", "الأدعية", "Duas"),
    S("etiquette", "آداب الدعاء", "Etiquette"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("note", "تنبيه", "Notice"),
  ]],
  ["live", "/live", "البث المباشر", "Live", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("stream", "البث المباشر", "Live Stream"),
    S("council", "المجلس الأسبوعي", "Weekly Council"),
    S("schedule", "جدول الدروس", "Weekly Schedule"),
    S("hadith", "حديث شريف", "Hadith"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("note", "تنبيه مهم", "Notice"),
  ]],
  ["daily-wird", "/daily-wird", "الورد اليومي", "Daily Wird", [
    S("hero", "الترويسة", "Hero"),
    S("content", "الورد الأسبوعي", "Weekly Wird"),
  ]],
  ["quran-memorization", "/quran-memorization", "حفظ القرآن", "Quran Memorization", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة", "Introduction"),
    S("virtues", "فضائل الحفظ", "Virtues"),
    S("plan", "الخطة التفاعلية", "Interactive Plan"),
    S("method", "منهج الحفظ", "Method"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("notes", "تنبيهات", "Notices"),
  ]],
  ["prayer-guide", "/prayer-guide", "دليل الصلاة", "Prayer Guide", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("prayers", "الصلوات الخمس", "Five Prayers"),
    S("steps", "خطوات الصلاة", "Prayer Steps"),
    S("conditions", "الشروط والمبطلات", "Conditions"),
    S("verse", "آية الصلاة", "Verse"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("notes", "تنبيهات مهمة", "Important Notices"),
  ]],
  ["hajj-guide", "/hajj-guide", "دليل الحج", "Hajj Guide", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة", "Introduction"),
    S("quickNav", "تنقل سريع", "Quick Nav"),
    S("hajjSteps", "خطوات الحج", "Hajj Steps"),
    S("umrahSteps", "خطوات العمرة", "Umrah Steps"),
    S("duas", "الأدعية", "Duas"),
    S("mistakes", "الأخطاء الشائعة", "Common Mistakes"),
    S("checklist", "قائمة التحضير", "Checklist"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("note", "تنبيه مهم", "Notice"),
  ]],
  ["zakat", "/zakat", "الزكاة", "Zakat", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "المقدمة", "Introduction"),
    S("form", "نموذج الحساب", "Calculator Form"),
    S("results", "النتائج", "Results"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("notes", "ملاحظات فقهية", "Fiqh Notes"),
  ]],
  ["ruqyah", "/ruqyah", "الرقية الشرعية", "Ruqyah", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("intro", "شروط الرقية", "Conditions"),
    S("search", "البحث", "Search"),
    S("list", "الأقسام", "Sections"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("note", "ملاحظة", "Notice"),
    S("warning", "تنبيه", "Warning"),
  ]],
  ["faq", "/faq", "الأسئلة الشائعة", "FAQ", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("search", "بطاقة البحث", "Search"),
    S("categories", "الفئات", "Categories"),
    S("results", "عدد النتائج", "Results Count"),
    S("list", "الأسئلة", "Questions"),
    S("related", "صفحات ذات صلة", "Related Pages"),
    S("cta", "تواصل معنا", "Contact CTA"),
    S("note", "ملاحظة", "Notice"),
  ]],
  ["search", "/search", "البحث", "Search", [
    S("hero", "الترويسة", "Hero"),
    S("content", "النتائج", "Results"),
  ]],
  ["about", "/about", "من نحن", "About", [
    S("header", "الترويسة", "Header"),
    S("stats", "الإحصائيات", "Stats"),
    S("quickNav", "تنقل سريع", "Quick Nav"),
    S("about", "عن المنصة", "About"),
    S("mission", "الرسالة والرؤية", "Mission & Vision"),
    S("values", "القيم", "Values"),
    S("supervisor", "المشرف", "Supervisor"),
    S("methodology", "منهج المحتوى", "Content Methodology"),
    S("sections", "أقسام المنصة", "Platform Sections"),
    S("privacy", "الخصوصية", "Privacy"),
    S("cta", "دعوة للتواصل", "CTA"),
    S("note", "ملاحظة", "Notice"),
  ]],
  ["contact", "/contact", "تواصل معنا", "Contact", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("form", "نموذج التواصل", "Contact Form"),
    S("sidebar", "العمود الجانبي", "Sidebar"),
    S("faq", "الأسئلة الشائعة", "FAQ"),
    S("note", "ملاحظة", "Notice"),
  ]],
  ["privacy", "/privacy", "سياسة الخصوصية", "Privacy Policy", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("trust", "لماذا تثق بنا", "Why Trust Us"),
    S("quickNav", "تنقل سريع", "Quick Nav"),
    S("intro", "المقدمة", "Introduction"),
    S("sections", "أقسام السياسة", "Policy Sections"),
    S("related", "روابط ذات صلة", "Related Links"),
    S("note", "ملاحظة", "Notice"),
  ]],
  ["terms", "/terms", "الشروط والأحكام", "Terms", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("quickNav", "تنقل سريع", "Quick Nav"),
    S("intro", "المقدمة", "Introduction"),
    S("sections", "بنود الشروط", "Terms Sections"),
    S("related", "روابط ذات صلة", "Related Links"),
    S("cta", "دعوة للتواصل", "CTA"),
    S("note", "ملاحظة", "Notice"),
  ]],
  ["account", "/account", "حسابي", "Account", [
    S("header", "الترويسة", "Header"),
    S("cards", "بطاقات الحساب", "Account Cards"),
    S("why", "لماذا تنشئ حسابًا", "Why Register"),
    S("how", "كيف يعمل النظام", "How It Works"),
    S("faq", "الأسئلة الشائعة", "FAQ"),
    S("note", "ملاحظة", "Notice"),
  ]],
  ["register", "/register", "التسجيل", "Register", [
    S("hero", "الترويسة", "Hero"),
    S("form", "نموذج التسجيل", "Register Form"),
    S("sidebar", "العمود الجانبي", "Sidebar"),
    S("related", "صفحات ذات صلة", "Related Pages"),
  ]],
  ["login", "/login", "تسجيل الدخول", "Login", [
    S("hero", "الترويسة", "Hero"),
    S("form", "نموذج الدخول", "Login Form"),
  ]],
  ["bookmarks", "/bookmarks", "المفضلة", "Bookmarks", [
    S("hero", "الترويسة", "Hero"),
    S("stats", "الإحصائيات", "Stats"),
    S("controls", "أدوات التحكم", "Controls"),
    S("list", "قائمة المفضلة", "Bookmarks List"),
    S("note", "ملاحظة", "Notice"),
  ]],
  ["download", "/download", "تحميل التطبيق", "Download", [
    S("header", "الترويسة", "Header"),
    S("cards", "بطاقات المعلومات", "Info Cards"),
    S("steps", "خطوات التثبيت", "Install Steps"),
    S("features", "مميزات التطبيق", "App Features"),
    S("notes", "ملاحظات مهمة", "Important Notes"),
    S("faq", "الأسئلة الشائعة", "FAQ"),
    S("back", "زر العودة", "Back Button"),
  ]],
];

// ============================================================
// الأنواع والمساعدات
// ============================================================

export type SectionsConfig = Record<string, Record<string, boolean>>;
export type TitlesConfig = Record<string, Record<string, { ar?: string; en?: string }>>;
export type PagesVisibilityConfig = Record<string, boolean>;

const PAGE_INDEX: Record<string, PageTuple> = Object.fromEntries(
  PAGES.map((page) => [page[0], page])
);

export function getPageDef(key: string): PageTuple | undefined {
  return PAGE_INDEX[key];
}

export function defaultSectionsConfig(): SectionsConfig {
  const out: SectionsConfig = {};
  for (const [key, , , , sections] of PAGES) {
    const map: Record<string, boolean> = {};
    for (const [secKey] of sections) map[secKey] = true;
    out[key] = map;
  }
  return out;
}

export function defaultPagesVisibility(): PagesVisibilityConfig {
  const out: PagesVisibilityConfig = {};
  for (const [key] of PAGES) out[key] = true;
  return out;
}

export function mergeSectionsConfig(stored: unknown): SectionsConfig {
  const out = defaultSectionsConfig();
  if (!stored || typeof stored !== "object") return out;
  const record = stored as Record<string, unknown>;
  for (const [key, , , , sections] of PAGES) {
    const storedPage = record[key];
    if (!storedPage || typeof storedPage !== "object") continue;
    for (const [secKey] of sections) {
      const value = (storedPage as Record<string, unknown>)[secKey];
      if (typeof value === "boolean") out[key][secKey] = value;
    }
  }
  return out;
}

export function mergeTitlesConfig(stored: unknown): TitlesConfig {
  const out: TitlesConfig = {};
  if (!stored || typeof stored !== "object") return out;
  const record = stored as Record<string, unknown>;
  for (const [key, , , , sections] of PAGES) {
    const storedPage = record[key];
    if (!storedPage || typeof storedPage !== "object") continue;
    for (const [secKey] of sections) {
      const value = (storedPage as Record<string, unknown>)[secKey];
      if (value && typeof value === "object") {
        const ar = (value as Record<string, unknown>).ar;
        const en = (value as Record<string, unknown>).en;
        out[key] = out[key] || {};
        out[key][secKey] = {
          ar: typeof ar === "string" ? ar : undefined,
          en: typeof en === "string" ? en : undefined,
        };
      }
    }
  }
  return out;
}

export function mergePagesVisibility(stored: unknown): PagesVisibilityConfig {
  const out = defaultPagesVisibility();
  if (!stored || typeof stored !== "object") return out;
  const record = stored as Record<string, unknown>;
  for (const [key] of PAGES) {
    if (typeof record[key] === "boolean") out[key] = record[key] as boolean;
  }
  return out;
}

/** يستخرج مفتاح الصفحة من رابط (يدعم "/quran" و"/ar/quran"). */
export function pageKeyFromHref(href: string): string {
  const clean = (href || "").replace(/^\/(ar|en)(?=\/|$)/, "").replace(/^\//, "");
  const head = clean.split(/[/?#]/)[0];
  return head || "home";
}

/** هل الرابط يخصّ صفحة مخفية؟ */
export function isHrefHidden(pages: PagesVisibilityConfig, href: string): boolean {
  return pages[pageKeyFromHref(href)] === false;
}

export type PageControls = {
  sections: SectionsConfig;
  titles: TitlesConfig;
  pages: PagesVisibilityConfig;
};

export function buildPageControls(settings: Record<string, unknown>): PageControls {
  return {
    sections: mergeSectionsConfig(settings?.pageSections),
    titles: mergeTitlesConfig(settings?.sectionTitles),
    pages: mergePagesVisibility(settings?.hiddenPages),
  };
}

export type SectionGate = {
  /** هل القسم ظاهر؟ */
  visible: (sectionKey: string) => boolean;
  /** عنوان القسم بعد تعديلات اللوحة (أو النص الافتراضي). */
  title: (sectionKey: string, fallback: string, lang: Lang) => string;
  /** هل الصفحة كلها ظاهرة؟ */
  pageVisible: boolean;
};

/** يبني بوابات الأقسام لصفحة واحدة. */
export function pageGate(controls: PageControls, pageKey: string, lang: Lang): SectionGate {
  const pageSections = controls.sections[pageKey] || {};
  const pageTitles = controls.titles[pageKey] || {};
  const pagesVisibility = controls.pages[pageKey] !== false;

  return {
    pageVisible: pagesVisibility,
    visible: (sectionKey: string) => pageSections[sectionKey] !== false,
    title: (sectionKey: string, fallback: string, l: Lang) => {
      const override = pageTitles[sectionKey];
      const value = override?.[l];
      if (typeof value === "string" && value.trim()) return value.trim();
      void lang;
      return fallback;
    },
  };
}
