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
  [
    "quran",
    "/quran",
    "القرآن الكريم",
    "Holy Quran",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات", "Stats"),
      S("k2", "مقدمة", "Introduction"),
      S("k3", "البحث والفلترة", "Search & Filter"),
      S("k4", "قائمة السور", "Surah List"),
      S("k5", "صفحات ذات صلة", "Related Pages"),
      S("k6", "ملاحظة", "Notice"),
    ],
  ],
  [
    "quran-surah",
    "/quran",
    "صفحة السورة",
    "Surah Page",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "اختيار القارئ", "Reciter"),
      S("k2", "المشغل المركزي", "Player"),
      S("k3", "البسملة", "Basmala"),
      S("k4", "الآيات", "Ayahs"),
      S("k5", "التنقل بين السور", "Surah Navigation"),
    ],
  ],
  [
    "hadith",
    "/hadith",
    "الحديث",
    "Hadith",
    [

    ],
  ],
  [
    "adhkar",
    "/adhkar",
    "الأذكار",
    "Adhkar",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مميزات الصفحة", "Features"),
    ],
  ],
  [
    "prayer-times",
    "/prayer-times",
    "مواقيت الصلاة",
    "Prayer Times",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "المحتوى التفاعلي", "Interactive Content"),
      S("k2", "صفحات ذات صلة", "Related Pages"),
    ],
  ],
  [
    "qibla",
    "/qibla",
    "اتجاه القبلة",
    "Qibla",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مقدمة", "Introduction"),
    ],
  ],
  [
    "tasbih",
    "/tasbih",
    "المسبحة",
    "Tasbih",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مقدمة", "Introduction"),
      S("k3", "صفحات ذات صلة", "Related Pages"),
      S("k4", "نصائح", "Tips"),
    ],
  ],
  [
    "calendar",
    "/calendar",
    "التقويم الهجري",
    "Hijri Calendar",
    [
      S("k0", "Hero: المناسبة القادمة", "Hero: Next Occasion"),
      S("k1", "بطاقة اليوم", "Today Card"),
      S("k2", "إحصائيات سريعة", "Stats"),
      S("k3", "المناسبات القادمة", "Upcoming"),
      S("k4", "كل المناسبات", "All Events"),
      S("k5", "صفحات ذات صلة", "Related Pages"),
      S("k6", "تنبيه", "Notice"),
    ],
  ],
  [
    "fatwa",
    "/fatwa",
    "الفتاوى",
    "Fatwas",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "بطاقة البحث والفلترة", "Search & Filter"),
      S("k3", "التصنيفات السريعة", "Quick Categories"),
      S("k4", "فتاوى مميزة (عند عدم وجود فلترة)", "Featured Fatwas"),
      S("k5", "عدد النتائج", "Results Count"),
      S("k6", "صفحات ذات صلة", "Related Pages"),
      S("k7", "تنبيه", "Notice"),
    ],
  ],
  [
    "women-fatwas",
    "/women-fatwas",
    "فتاوى المرأة",
    "Women's Fatwas",
    [

    ],
  ],
  [
    "articles",
    "/articles",
    "المقالات",
    "Articles",
    [
      S("k0", "Hero", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مقالات مميزة", "Featured Articles"),
      S("k3", "البحث والفلترة", "Search & Filter"),
      S("k4", "التصنيفات السريعة", "Quick Categories"),
      S("k5", "عدد النتائج", "Results Count"),
      S("k6", "المقالات", "Articles"),
      S("k7", "تنبيه", "Notice"),
      S("k8", "روابط سريعة", ""),
    ],
  ],
  [
    "doubts",
    "/doubts",
    "الشبهات",
    "Doubts",
    [
      S("k0", "ترويسة", "Header"),
      S("k1", "تنقل سريع", "Quick Nav"),
      S("k2", "قواعد في التعامل مع الشبهات", ""),
      S("k3", "شبهات وإجابات", ""),
      S("k4", "تنبيه منهجي", "Methodology Notice"),
      S("k5", "روابط مفيدة", ""),
    ],
  ],
  [
    "responses",
    "/responses",
    "مركز الردود",
    "Responses Center",
    [

    ],
  ],
  [
    "atheism-response",
    "/atheism-response",
    "الرد على الإلحاد",
    "Atheism Response",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مقدمة منهجية", "Methodology"),
      S("k3", "تنقل سريع", "Quick Nav"),
      S("k4", "أسس الرد", ""),
      S("k5", "الأسئلة والشبهات", ""),
      S("k6", "تنبيه منهجي", "Methodology Notice"),
      S("k7", "صفحات ذات صلة", "Related Pages"),
    ],
  ],
  [
    "prophets-stories",
    "/prophets-stories",
    "قصص الأنبياء",
    "Prophets Stories",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مقدمة", "Introduction"),
      S("k3", "البحث", "Search"),
      S("k4", "تنقل سريع", "Quick Nav"),
      S("k5", "عدد النتائج", "Results Count"),
      S("k6", "صفحات ذات صلة", "Related Pages"),
      S("k7", "ملاحظة", "Notice"),
    ],
  ],
  [
    "inheritance",
    "/inheritance",
    "المواريث",
    "Inheritance",
    [
      S("k0", "العملة وقيمة التركة", ""),
      S("k1", "جنس المتوفى والزوج", ""),
      S("k2", "الأب والأم", ""),
      S("k3", "الأبناء والبنات", ""),
      S("k4", "تنبيهات", "Notices"),
      S("k5", "جدول القسمة", ""),
    ],
  ],
  [
    "learn",
    "/learn",
    "تعلّم",
    "Learn",
    [

    ],
  ],
  [
    "fiqh",
    "/fiqh",
    "الفقه",
    "Fiqh",
    [

    ],
  ],
  [
    "dawah",
    "/dawah",
    "بوابة غير المسلمين",
    "Non-Muslim Portal",
    [

    ],
  ],
  [
    "dawah-guide",
    "/dawah-guide",
    "دليل الدعوة",
    "Dawah Guide",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مقدمة", "Introduction"),
      S("k3", "تنقل سريع", "Quick Nav"),
      S("k4", "أصول الدعوة", "Principles"),
      S("k5", "خطوات عملية", "Practical Steps"),
      S("k6", "مهارات الداعية", "Skills"),
      S("k7", "أخطاء شائعة", "Common Mistakes"),
      S("k8", "قائمة تحضير", "Checklist"),
      S("k9", "تنبيه مهم", "Notice"),
      S("k10", "صفحات ذات صلة", "Related Pages"),
    ],
  ],
  [
    "fields",
    "/fields",
    "المجالات الدعوية",
    "Dawah Fields",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مقدمة", "Introduction"),
      S("k3", "عنوان الشبكة", "Grid Title"),
      S("k4", "شبكة المجالات", "Fields Grid"),
      S("k5", "صفحات ذات صلة", "Related Pages"),
    ],
  ],
  [
    "field",
    "/fields",
    "صفحة مجال",
    "Field Page",
    [
      S("k0", "Hero مخصص", "Hero"),
      S("k1", "إحصائيات", "Stats"),
      S("k2", "محتوى مرتبط", "Related Content"),
      S("k3", "مجالات ذات صلة", "Related Fields"),
      S("k4", "التنقل بين المجالات", "Field Navigation"),
      S("k5", "CTA العودة", "Back CTA"),
    ],
  ],
  [
    "projects",
    "/projects",
    "المشاريع",
    "Projects",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مقدمة", "Introduction"),
      S("k3", "المشاريع", "Projects"),
      S("k4", "لماذا تساهم", "Why Contribute"),
      S("k5", "آية كريمة", "Verse"),
      S("k6", "صفحات ذات صلة", "Related Pages"),
      S("k7", "تنبيهات", "Notices"),
    ],
  ],
  [
    "map",
    "/map",
    "الخريطة الدعوية",
    "Dawah Map",
    [

    ],
  ],
  [
    "khutab",
    "/khutab",
    "الخطب",
    "Khutbahs",
    [

    ],
  ],
  [
    "news",
    "/news",
    "الأخبار",
    "News",
    [

    ],
  ],
  [
    "embrace-islam",
    "/embrace-islam",
    "اعتناق الإسلام",
    "Embrace Islam",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "قسم الشهادتين", ""),
      S("k3", "خطوات البدء", ""),
      S("k4", "الأسئلة الشائعة", "FAQ"),
      S("k5", "موارد مساعدة", ""),
      S("k6", "صفحات ذات صلة", "Related Pages"),
      S("k7", "تنبيه مهم", "Notice"),
    ],
  ],
  [
    "youth-issues",
    "/youth-issues",
    "قضايا الشباب",
    "Youth Issues",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات", "Stats"),
      S("k2", "مقدمة", "Introduction"),
      S("k3", "القضايا والحلول", ""),
      S("k4", "رسالة للشباب", ""),
      S("k5", "صفحات ذات صلة", "Related Pages"),
      S("k6", "تنبيهات", "Notices"),
    ],
  ],
  [
    "khatm-dua",
    "/khatm-dua",
    "ختم الدعاء",
    "Khatm Dua",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مقدمة", "Introduction"),
      S("k3", "الخطوات", "Steps"),
      S("k4", "الجدول", "Table"),
      S("k5", "الأدعية", "Duas"),
      S("k6", "آداب الدعاء", "Etiquette"),
      S("k7", "صفحات ذات صلة", "Related Pages"),
      S("k8", "تنبيه", "Notice"),
    ],
  ],
  [
    "live",
    "/live",
    "البث المباشر",
    "Live",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "البث المباشر", ""),
      S("k3", "المجلس الأسبوعي", ""),
      S("k4", "جدول الدروس الأسبوعي", ""),
      S("k5", "حديث شريف", ""),
      S("k6", "صفحات ذات صلة", "Related Pages"),
      S("k7", "تنبيه مهم", "Notice"),
    ],
  ],
  [
    "daily-wird",
    "/daily-wird",
    "الورد اليومي",
    "Daily Wird",
    [
      S("k0", "Hero محسّن", "Hero"),
    ],
  ],
  [
    "quran-memorization",
    "/quran-memorization",
    "حفظ القرآن",
    "Quran Memorization",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مقدمة", "Introduction"),
      S("k3", "فضائل حفظ القرآن", ""),
      S("k4", "الخطة التفاعلية", ""),
      S("k5", "منهج الحفظ", ""),
      S("k6", "صفحات ذات صلة", "Related Pages"),
      S("k7", "تنبيهات", "Notices"),
    ],
  ],
  [
    "prayer-guide",
    "/prayer-guide",
    "دليل الصلاة",
    "Prayer Guide",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "الصلوات الخمس", "Five Prayers"),
      S("k3", "خطوات الصلاة", "Prayer Steps"),
      S("k4", "شروط ومبطلات الصلاة", "Conditions"),
      S("k5", "آية الصلاة", "Verse"),
      S("k6", "صفحات ذات صلة", "Related Pages"),
      S("k7", "تنبيهات مهمة", "Important Notices"),
    ],
  ],
  [
    "hajj-guide",
    "/hajj-guide",
    "دليل الحج",
    "Hajj Guide",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مقدمة", "Introduction"),
      S("k3", "تنقل سريع", "Quick Nav"),
      S("k4", "خطوات الحج", "Hajj Steps"),
      S("k5", "خطوات العمرة", "Umrah Steps"),
      S("k6", "الأدعية", "Duas"),
      S("k7", "الأخطاء الشائعة", "Common Mistakes"),
      S("k8", "checklist", "Checklist"),
      S("k9", "صفحات ذات صلة", "Related Pages"),
      S("k10", "تنبيه مهم", "Notice"),
    ],
  ],
  [
    "zakat",
    "/zakat",
    "الزكاة",
    "Zakat",
    [
      S("k0", "العملة وأساس النصاب", ""),
      S("k1", "الأصول الأساسية", ""),
      S("k2", "الذهب والفضة", ""),
      S("k3", "الديون والمستحقات", ""),
      S("k4", "الزراعة", ""),
      S("k5", "بطاقة النتيجة الرئيسية", ""),
      S("k6", "زكاة المحصول", ""),
      S("k7", "التنبيهات", ""),
    ],
  ],
  [
    "ruqyah",
    "/ruqyah",
    "الرقية الشرعية",
    "Ruqyah",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "مقدمة: شروط الرقية", "Conditions"),
      S("k3", "بطاقة البحث", "Search"),
      S("k4", "عدد النتائج", "Results Count"),
      S("k5", "صفحات ذات صلة", "Related Pages"),
      S("k6", "ملاحظة", "Notice"),
      S("k7", "تنبيه", "Notice"),
    ],
  ],
  [
    "faq",
    "/faq",
    "الأسئلة الشائعة",
    "FAQ",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "بطاقة البحث", "Search"),
      S("k3", "الفئات", ""),
      S("k4", "عدد النتائج", "Results Count"),
      S("k5", "صفحات ذات صلة", "Related Pages"),
      S("k6", "CTA التواصل", "Contact CTA"),
      S("k7", "ملاحظة", "Notice"),
    ],
  ],
  [
    "search",
    "/search",
    "البحث",
    "Search",
    [

    ],
  ],
  [
    "about",
    "/about",
    "من نحن",
    "About",
    [
      S("k0", "ترويسة", "Header"),
      S("k1", "إحصائيات سريعة", "Stats"),
      S("k2", "تنقل سريع", "Quick Nav"),
      S("k3", "عن المنصة", "About"),
      S("k4", "القيم", "Values"),
      S("k5", "المشرف", "Supervisor"),
      S("k6", "منهج المحتوى", "Methodology"),
      S("k7", "أقسام المنصة", "Sections"),
      S("k8", "الخصوصية", "Privacy"),
      S("k9", "CTA", "CTA"),
      S("k10", "ملاحظة", "Notice"),
    ],
  ],
  [
    "contact",
    "/contact",
    "تواصل معنا",
    "Contact",
    [
      S("k0", "رسالة النجاح/الخطأ", ""),
      S("k1", "Hero محسّن", "Hero"),
      S("k2", "إحصائيات سريعة", "Stats"),
      S("k3", "الشبكة الرئيسية", ""),
      S("k4", "الأسئلة الشائعة", "FAQ"),
      S("k5", "ملاحظة", "Notice"),
    ],
  ],
  [
    "privacy",
    "/privacy",
    "سياسة الخصوصية",
    "Privacy Policy",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات", "Stats"),
      S("k2", "لماذا تثق بنا؟", "Why Trust Us"),
      S("k3", "تنقل سريع", "Quick Nav"),
      S("k4", "مقدمة", "Introduction"),
      S("k5", "أقسام السياسة", "Privacy Sections"),
      S("k6", "روابط ذات صلة", "Related Links"),
      S("k7", "ملاحظة", "Notice"),
    ],
  ],
  [
    "terms",
    "/terms",
    "الشروط والأحكام",
    "Terms",
    [
      S("k0", "Hero محسّن", "Hero"),
      S("k1", "إحصائيات", "Stats"),
      S("k2", "تنقل سريع", "Quick Nav"),
      S("k3", "مقدمة", "Introduction"),
      S("k4", "بنود الشروط", "Terms Sections"),
      S("k5", "روابط ذات صلة", "Related Links"),
      S("k6", "CTA", "CTA"),
      S("k7", "ملاحظة", "Notice"),
    ],
  ],
  [
    "account",
    "/account",
    "حسابي",
    "Account",
    [
      S("k0", "ترويسة", "Header"),
      S("k1", "بطاقات الحساب الرئيسية", "Account Cards"),
      S("k2", "لماذا تنشئ حساباً؟", "Why Register"),
      S("k3", "كيف يعمل النظام؟", "How It Works"),
      S("k4", "الأسئلة الشائعة", "FAQ"),
      S("k5", "ملاحظة", "Notice"),
    ],
  ],
  [
    "register",
    "/register",
    "التسجيل",
    "Register",
    [

    ],
  ],
  [
    "login",
    "/login",
    "تسجيل الدخول",
    "Login",
    [

    ],
  ],
  [
    "bookmarks",
    "/bookmarks",
    "المفضلة",
    "Bookmarks",
    [

    ],
  ],
  [
    "download",
    "/download",
    "تحميل التطبيق",
    "Download",
    [
      S("k0", "الترويسة", "Header"),
      S("k1", "بطاقات المعلومات + زر التحميل", "Info & Download"),
      S("k2", "خطوات التثبيت", "Install Steps"),
      S("k3", "مميزات التطبيق", "App Features"),
      S("k4", "ملاحظات مهمة", "Important Notes"),
      S("k5", "الأسئلة الشائعة", "FAQ"),
      S("k6", "زر العودة", "Back"),
    ],
  ],
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
