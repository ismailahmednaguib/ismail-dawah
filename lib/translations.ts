// lib/translations.ts
// ============================================================================
// نظام الترجمات الرسمي لمنصة إسماعيل أحمد نجيب
// يدعم: عربي / إنجليزي
// ============================================================================
// ملاحظات مهمة:
// 1) هذا الملف لا يستورد runtime من lib/i18n.ts لتجنب circular dependency.
// 2) الترجمة الإنجليزية مُقيَّدة بنفس مفاتيح العربية، وأي نقص يسبب خطأ TypeScript.
// 3) dالة t مرنة:
//    t("ar") => كائن الترجمات
//    t("ar", "home") => "الرئيسية"
// ============================================================================

export type TranslationLang = "ar" | "en";

export const DEFAULT_TRANSLATION_LANG: TranslationLang = "ar";

export const SUPPORTED_TRANSLATION_LANGS: readonly TranslationLang[] = [
  "ar",
  "en",
];

// ============================================================
// Helpers
// ============================================================

/**
 * تطبيع اللغة الواردة من URL أو المتصفح أو المستخدم.
 *
 * يقبل:
 * - ar
 * - en
 * - ar-EG
 * - en-US
 * - AR
 * - EN
 */
export function normalizeTranslationLang(
  lang: TranslationLang | string | null | undefined
): TranslationLang {
  const value = String(lang ?? "")
    .trim()
    .toLowerCase();

  if (!value) {
    return DEFAULT_TRANSLATION_LANG;
  }

  if (value === "ar" || value.startsWith("ar-")) {
    return "ar";
  }

  if (value === "en" || value.startsWith("en-")) {
    return "en";
  }

  return DEFAULT_TRANSLATION_LANG;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ============================================================
// 1️⃣ الترجمة العربية — المصدر الأساسي للمفاتيح
// ============================================================

const arTranslations = {
  // 🏠 التنقل الرئيسي
  home: "الرئيسية",
  about: "من نحن",
  contact: "تواصل معنا",
  faq: "الأسئلة الشائعة",
  privacy: "سياسة الخصوصية",
  terms: "الشروط والأحكام",

  // 🕌 المحتوى الإسلامي
  quran: "القرآن الكريم",
  adhkar: "الأذكار",
  prayer_times: "مواقيت الصلاة",
  qibla: "اتجاه القبلة",
  tasbih: "المسبحة الإلكترونية",
  fatwa: "الفتاوى",
  ruqyah: "الرقية الشرعية",
  daily_wird: "الورد اليومي",
  prophets_stories: "قصص الأنبياء",

  // 🛠️ الأدوات العملية
  zakat: "حاسبة الزكاة",
  inheritance: "حاسبة الميراث",
  hajj_guide: "دليل الحج والعمرة",
  dawah_guide: "دليل الدعوة",
  quran_memorization: "خطة حفظ القرآن",
  calendar: "التقويم الهجري",

  // 📚 المحتوى العلمي
  articles: "المقالات",
  atheism_response: "الرد على الإلحاد",
  doubts: "الشبهات",
  embrace_islam: "اعتناق الإسلام",
  fields: "مجالات المنصة",
  women_fatwas: "فتاوى المرأة",
  youth_issues: "قضايا الشباب",
  learn: "التعلّم",
  khatm_dua: "ختمة الدعاء",
  khutab: "الخطب",
  live: "البث المباشر",
  news: "الأخبار",
  projects: "المشاريع",

  // 👤 الحساب والمستخدم
  account: "الحساب",
  login: "تسجيل الدخول",
  register: "إنشاء حساب",
  logout: "تسجيل الخروج",
  bookmarks: "المفضلة",
  search: "بحث",
  download: "تحميل التطبيق",
  map: "خريطة الموقع",

  // 🎨 عناصر واجهة المستخدم
  read_more: "اقرأ المزيد",
  read_less: "اقرأ أقل",
  share: "مشاركة",
  save: "حفظ",
  saved: "تم الحفظ",
  remove: "إزالة",
  back: "رجوع",
  back_to_top: "العودة للأعلى",
  next: "التالي",
  previous: "السابق",
  confirm: "تأكيد",
  cancel: "إلغاء",
  close: "إغلاق",
  open: "فتح",
  edit: "تعديل",
  delete: "حذف",
  add: "إضافة",
  submit: "إرسال",
  loading: "جاري التحميل...",
  error: "حدث خطأ",
  success: "تم بنجاح",
  no_results: "لا توجد نتائج",
  view_all: "عرض الكل",
  download_now: "تحميل الآن",
  install_app: "تثبيت التطبيق",
  open_app: "فتح التطبيق",
  app_name: "منصة إسماعيل أحمد نجيب",
  app_short_name: "إسماعيل نجيب",

  // 📬 النشرة البريدية
  newsletter: "النشرة البريدية",
  newsletter_title: "اشترك في النشرة البريدية",
  newsletter_desc:
    "يصلك جديد المحتوى الدعوي والدروس والفتاوى أولًا بأول",
  email_placeholder: "بريدك الإلكتروني",
  subscribe: "اشترك",
  subscribed: "تم الاشتراك بنجاح",
  invalid_email: "بريد إلكتروني غير صحيح",

  // 🔍 البحث
  search_placeholder: "ابحث في القرآن والأذكار والفتاوى والقصص...",
  search_results: "نتائج البحث",
  search_no_results: "لم نعثر على نتائج",
  search_try_again: "جرّب كلمات أخرى",

  // 📱 التطبيق
  download_android: "تحميل تطبيق الأندرويد",
  download_pwa: "تثبيت كتطبيق ويب (PWA)",
  apk_version: "إصدار APK",
  file_size: "حجم الملف",
  features: "المميزات",
  install_instructions: "تعليمات التثبيت",

  // 🎯 عناوين أقسام الصفحة الرئيسية
  platform_title: "منصة دعوية شاملة",
  hero_title: "نورُ العلم.. بين يديك",
  hero_subtitle:
    "القرآن الكريم، السنة النبوية، الفتاوى، وأدوات الدعوة — كل ما يحتاجه المسلم في مكان واحد",
  get_started: "ابدأ الآن",
  watch_live: "البث المباشر",

  // 📊 الإحصائيات
  sections_count: "قسم ومحتوى",
  languages_count: "لغتان",
  surahs_count: "سورة",
  completely_free: "مجاني 100%",

  // 📖 أقسام الصفحة الرئيسية
  learn_guides: "تعلّم ودلائل",
  learn_subtitle: "خطوة بخطوة نحو الفهم الصحيح",
  knowledge_responses: "العلوم والردود",
  knowledge_subtitle: "دافع عن عقيدتك بالعلم والحجة",
  dawah_community: "الدعوة والمجتمع",
  dawah_subtitle: "كن داعيةً مؤثرا",

  // 🕐 الصلاة والأذكار
  next_prayer: "الصلاة القادمة",
  remaining_time: "المتبقي",
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
  hijri_date: "التاريخ الهجري",
  gregorian_date: "التاريخ الميلادي",
  use_location: "استخدم موقعي",
  manual_entry: "إدخال يدوي",
  morning_adhkar: "أذكار الصباح",
  evening_adhkar: "أذكار المساء",
  sleep_adhkar: "أذكار النوم",
  after_prayer_adhkar: "أذكار بعد الصلاة",
  progress: "تقدمك",
  reset: "تصفير القسم",
  source: "المصدر",

  // 📖 القرآن
  read_quran: "اقرأ واستمع إلى كتاب الله",
  surahs: "سورة",
  verses: "آية",
  juz: "جزء",
  pages: "صفحة",
  meccan: "مكية",
  medinan: "مدنية",
  all: "الكل",
  displayed_surahs: "عدد السور المعروضة",

  // 💰 الزكاة والميراث
  calculate: "احسب",
  total_assets: "إجمالي الأصول",
  debts: "الديون",
  net_worth: "صافي الثروة",
  nisab: "النصاب",
  zakat_due: "الزكاة المستحقة",
  heirs: "الورثة",
  inheritance_share: "نصيب الوارث",

  // 🧭 القبلة
  qibla_direction: "اتجاه القبلة",
  distance_to_mecca: "المسافة إلى مكة",
  degrees: "درجة",
  kilometers: "كم",

  // 🛡️ الرقية
  ruqyah_title: "الرقية الشرعية من القرآن والسنة",
  ruqyah_desc: "آيات وأدعية صحيحة للرقية الشرعية",

  // 🎯 عامة
  learn_more: "تعرف أكثر",
  explore: "استكشف",
  categories: "التصنيفات",
  latest: "الأحدث",
  popular: "الأكثر شعبية",
  featured: "مميز",
  author: "الكاتب",
  published_on: "نُشر في",
  reading_time: "وقت القراءة",
  minutes_read: "دقائق قراءة",
  tags: "الوسوم",
  related_articles: "مقالات ذات صلة",

  // 👨‍ لوحة الإدارة
  admin_panel: "لوحة الإدارة",
  admin_login: "دخول المشرف",
  dashboard: "لوحة التحكم",
  content_management: "إدارة المحتوى",
  users: "المستخدمون",
  settings: "الإعدادات",
  analytics: "الإحصائيات",
  logout_admin: "تسجيل خروج",

  // 🌐 Footer
  footer_about: "عن المنصة",
  footer_about_text:
    "منصة دعوية شاملة تهدف لنشر العلم الشرعي الصحيح وتيسير العبادات للمسلمين في كل مكان.",
  footer_quick_links: "روابط سريعة",
  footer_islamic_content: "المحتوى الإسلامي",
  footer_tools: "الأدوات",
  footer_contact: "تواصل معنا",
  footer_copyright: "جميع الحقوق محفوظة",
  footer_platform: "منصة إسماعيل أحمد نجيب الدعوية",

  // ⚠️ رسائل الخطأ
  page_not_found: "الصفحة غير موجودة",
  page_not_found_desc: "ربما تم نقل الصفحة أو حذفها",
  server_error: "خطأ في الخادم",
  server_error_desc: "حدث خطأ غير متوقع، يرجى المحاولة لاحقًا",
  unauthorized: "غير مصرح",
  unauthorized_desc: "يجب عليك تسجيل الدخول أولًا",
  forbidden: "ممنوع",
  forbidden_desc: "ليس لديك صلاحية للوصول إلى هذه الصفحة",
  network_error: "خطأ في الشبكة",
  network_error_desc: "تعذر الاتصال بالإنترنت",

  // 🔘 أزرار الأذكار
  click_to_count: "اضغط على الذكر للعد",
  completed: "تم إنجاز اليوم",
  of: "من",

  // 📱 PWA
  install_pwa: "ثبّت التطبيق",
  install_pwa_desc:
    "اضغط على زر المشاركة ثم \"إضافة إلى الشاشة الرئيسية\"",

  // 🎯 المجالات الدعوية
  field_aqeedah: "العقيدة",
  field_fiqh: "الفقه",
  field_tafsir: "التفسير",
  field_hadith: "الحديث",
  field_seerah: "السيرة",
  field_dawah: "الدعوة",
  field_history: "التاريخ",
  field_ethics: "الأخلاق",
  field_family: "الأسرة",
  field_youth: "الشباب",
  field_women: "المرأة",
  field_contemporary: "القضايا المعاصرة",
  field_quran: "علوم القرآن",
  field_comparison: "الأديان المقارنة",
  field_atheism: "الإلحاد والشبهات",
  field_thought: "الفكر الإسلامي",
  field_politics: "السياسة الشرعية",

  // ========================================================
  // ➕ مفاتيح إضافية مهمة للواجهة والوصولية ولوحة الأدمن
  // ========================================================

  skip_to_content: "تخطَّ إلى المحتوى",
  main_navigation: "التنقل الرئيسي",
  language: "اللغة",
  switch_language: "تبديل اللغة",
  theme: "المظهر",
  light_mode: "الوضع الفاتح",
  dark_mode: "الوضع الداكن",
  system_mode: "حسب النظام",
  menu: "القائمة",
  open_menu: "فتح القائمة",
  close_menu: "إغلاق القائمة",
  site_search: "بحث الموقع",
  advanced_search: "بحث متقدم",
  filters: "التصفية",
  clear_filters: "مسح التصفية",
  apply: "تطبيق",
  reset_filters: "إعادة ضبط التصفية",
  sort_by: "ترتيب حسب",
  newest: "الأحدث",
  oldest: "الأقدم",
  a_z: "أ–ي",
  z_a: "ي–أ",
  show_more: "عرض المزيد",
  show_less: "عرض أقل",
  expand: "توسيع",
  collapse: "طي",
  copied: "تم النسخ",
  copy_failed: "فشل النسخ",
  share_failed: "فشلت المشاركة",
  print: "طباعة",
  report_error: "الإبلاغ عن خطأ",
  feedback: "ملاحظاتك",
  send_feedback: "أرسل ملاحظاتك",
  your_name: "اسمك",
  your_email: "بريدك الإلكتروني",
  your_message: "رسالتك",
  required: "مطلوب",
  optional: "اختياري",
  yes: "نعم",
  no: "لا",
  maybe: "ربما",
  ok: "حسنًا",
  done: "تم",
  retry: "إعادة المحاولة",
  try_again: "حاول مرة أخرى",
  refresh: "تحديث",
  offline: "أنت غير متصل بالإنترنت",
  online: "متصل",
  maintenance: "جارٍ الصيانة",
  coming_soon: "قريبًا",
  under_construction: "قيد الإنشاء",
  words: "كلمة",
  last_updated: "آخر تحديث",
  created_at: "تاريخ الإنشاء",
  updated_at: "تاريخ التحديث",
  by_author: "بقلم",

  // صفحة من نحن
  about_mission: "رسالتنا",
  about_vision: "رؤيتنا",
  about_values: "قيمنا",
  about_sincerity: "الإخلاص",
  about_knowledge: "العلم",
  about_kindness: "الرفق",
  about_balance: "التوازن",
  about_service: "الخدمة",
  about_continuity: "الاستمرار",
  about_supervisor: "المشرف على المنصة",
  about_content_method: "منهج المحتوى",
  about_sections: "أقسام المنصة",
  about_privacy_simple: "الخصوصية ببساطة",
  about_join_us: "هل تريد المشاركة أو الاقتراح؟",
  about_note: "ملاحظة",

  // صفحة التواصل
  contact_title: "تواصل معنا",
  contact_subtitle: "نسعد بتواصلك واستفساراتك",
  contact_success: "تم إرسال رسالتك بنجاح",
  contact_error: "تعذر إرسال الرسالة، حاول لاحقًا",
  contact_waiting: "نراجع رسالتك وسنرد قريبًا",

  // صفحات قانونية
  privacy_title: "سياسة الخصوصية",
  terms_title: "الشروط والأحكام",

  // لوحة الأدمن — إجراءات المحتوى
  save_draft: "حفظ كمسودة",
  publish: "نشر",
  unpublish: "إلغاء النشر",
  archive: "أرشفة",
  restore: "استعادة",
  duplicate: "تكرار",
  preview: "معاينة",
  media_library: "مكتبة الوسائط",
  upload_image: "رفع صورة",
  choose_file: "اختر ملفًا",
  drag_drop: "أو اسحب الملف وأفلته هنا",
  seo_settings: "إعدادات السيو",
  social_preview: "معاينة المشاركة",
  translation_editor: "محرر الترجمة",
  add_translation: "إضافة ترجمة",
  remove_translation: "حذف الترجمة",
  language_code: "رمز اللغة",
  field_label: "التسمية",
  field_value: "القيمة",
} as const;

// ============================================================
// 2️⃣ الأنواع المشتقة من العربية
// ============================================================

export type TranslationKey = keyof typeof arTranslations;

export type TranslationDictionary = {
  [K in TranslationKey]: string;
};

// ============================================================
// 3️⃣ الترجمة الإنجليزية — مقيَّدة بنفس مفاتيح العربية
// ============================================================

const enTranslations: TranslationDictionary = {
  // 🏠 Main Navigation
  home: "Home",
  about: "About Us",
  contact: "Contact Us",
  faq: "FAQ",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",

  // 🕌 Islamic Content
  quran: "Holy Quran",
  adhkar: "Adhkar",
  prayer_times: "Prayer Times",
  qibla: "Qibla Direction",
  tasbih: "Digital Tasbih",
  fatwa: "Fatwas",
  ruqyah: "Ruqyah",
  daily_wird: "Daily Wird",
  prophets_stories: "Prophets' Stories",

  // 🛠️ Practical Tools
  zakat: "Zakat Calculator",
  inheritance: "Inheritance Calculator",
  hajj_guide: "Hajj & Umrah Guide",
  dawah_guide: "Dawah Guide",
  quran_memorization: "Quran Memorization",
  calendar: "Hijri Calendar",

  // 📚 Knowledge Content
  articles: "Articles",
  atheism_response: "Responding to Atheism",
  doubts: "Doubts",
  embrace_islam: "Embrace Islam",
  fields: "Platform Fields",
  women_fatwas: "Women's Fatwas",
  youth_issues: "Youth Issues",
  learn: "Learn",
  khatm_dua: "Khatm Dua",
  khutab: "Khutbahs",
  live: "Live Stream",
  news: "News",
  projects: "Projects",

  // 👤 User Account
  account: "Account",
  login: "Login",
  register: "Register",
  logout: "Logout",
  bookmarks: "Bookmarks",
  search: "Search",
  download: "Download App",
  map: "Site Map",

  // 🎨 UI Elements
  read_more: "Read More",
  read_less: "Read Less",
  share: "Share",
  save: "Save",
  saved: "Saved",
  remove: "Remove",
  back: "Back",
  back_to_top: "Back to Top",
  next: "Next",
  previous: "Previous",
  confirm: "Confirm",
  cancel: "Cancel",
  close: "Close",
  open: "Open",
  edit: "Edit",
  delete: "Delete",
  add: "Add",
  submit: "Submit",
  loading: "Loading...",
  error: "Error occurred",
  success: "Success",
  no_results: "No results",
  view_all: "View All",
  download_now: "Download Now",
  install_app: "Install App",
  open_app: "Open App",
  app_name: "Ismail Ahmed Naguib Platform",
  app_short_name: "Ismail Naguib",

  // 📬 Newsletter
  newsletter: "Newsletter",
  newsletter_title: "Subscribe to our Newsletter",
  newsletter_desc:
    "Get the latest Dawah content, lessons, and fatwas as soon as they are published.",
  email_placeholder: "Your email address",
  subscribe: "Subscribe",
  subscribed: "Successfully subscribed",
  invalid_email: "Invalid email address",

  // 🔍 Search
  search_placeholder: "Search Quran, Adhkar, Fatwas, Stories...",
  search_results: "Search Results",
  search_no_results: "No results found",
  search_try_again: "Try different keywords",

  // 📱 App
  download_android: "Download Android App",
  download_pwa: "Install as Web App (PWA)",
  apk_version: "APK Version",
  file_size: "File Size",
  features: "Features",
  install_instructions: "Installation Instructions",

  // 🎯 Homepage Sections
  platform_title: "Complete Dawah Platform",
  hero_title: "The Light of Knowledge.. In Your Hands",
  hero_subtitle:
    "Quran, Sunnah, Fatwas and Dawah tools — everything a Muslim needs in one place",
  get_started: "Get Started",
  watch_live: "Live Stream",

  // 📊 Stats
  sections_count: "Sections",
  languages_count: "Languages",
  surahs_count: "Surahs",
  completely_free: "100% Free",

  // 📖 Homepage Section Titles
  learn_guides: "Learn & Guides",
  learn_subtitle: "Step by step to correct understanding",
  knowledge_responses: "Knowledge & Responses",
  knowledge_subtitle: "Defend your faith with knowledge and evidence",
  dawah_community: "Dawah & Community",
  dawah_subtitle: "Be an impactful Da'ee",

  // 🕐 Prayer & Adhkar
  next_prayer: "Next Prayer",
  remaining_time: "Remaining",
  fajr: "Fajr",
  sunrise: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  hijri_date: "Hijri Date",
  gregorian_date: "Gregorian Date",
  use_location: "Use My Location",
  manual_entry: "Manual Entry",
  morning_adhkar: "Morning Adhkar",
  evening_adhkar: "Evening Adhkar",
  sleep_adhkar: "Sleep Adhkar",
  after_prayer_adhkar: "After Prayer Adhkar",
  progress: "Your Progress",
  reset: "Reset",
  source: "Source",

  // 📖 Quran
  read_quran: "Read and listen to the Book of Allah",
  surahs: "Surahs",
  verses: "Verses",
  juz: "Juz",
  pages: "Pages",
  meccan: "Meccan",
  medinan: "Medinan",
  all: "All",
  displayed_surahs: "Surahs Displayed",

  // 💰 Zakat & Inheritance
  calculate: "Calculate",
  total_assets: "Total Assets",
  debts: "Debts",
  net_worth: "Net Worth",
  nisab: "Nisab",
  zakat_due: "Zakat Due",
  heirs: "Heirs",
  inheritance_share: "Heir's Share",

  // 🧭 Qibla
  qibla_direction: "Qibla Direction",
  distance_to_mecca: "Distance to Mecca",
  degrees: "degrees",
  kilometers: "km",

  // 🛡️ Ruqyah
  ruqyah_title: "Legislated Ruqyah from Quran & Sunnah",
  ruqyah_desc: "Authentic verses and supplications for Ruqyah",

  // 🎯 General
  learn_more: "Learn More",
  explore: "Explore",
  categories: "Categories",
  latest: "Latest",
  popular: "Popular",
  featured: "Featured",
  author: "Author",
  published_on: "Published on",
  reading_time: "Reading Time",
  minutes_read: "min read",
  tags: "Tags",
  related_articles: "Related Articles",

  // 👨‍💼 Admin Panel
  admin_panel: "Admin Panel",
  admin_login: "Admin Login",
  dashboard: "Dashboard",
  content_management: "Content Management",
  users: "Users",
  settings: "Settings",
  analytics: "Analytics",
  logout_admin: "Logout",

  // 🌐 Footer
  footer_about: "About the Platform",
  footer_about_text:
    "A comprehensive Dawah platform aimed at spreading authentic Islamic knowledge and facilitating worship for Muslims everywhere.",
  footer_quick_links: "Quick Links",
  footer_islamic_content: "Islamic Content",
  footer_tools: "Tools",
  footer_contact: "Contact Us",
  footer_copyright: "All rights reserved",
  footer_platform: "Ismail Ahmed Naguib Dawah Platform",

  // ⚠️ Error Messages
  page_not_found: "Page Not Found",
  page_not_found_desc: "The page may have been moved or deleted",
  server_error: "Server Error",
  server_error_desc: "An unexpected error occurred, please try again later",
  unauthorized: "Unauthorized",
  unauthorized_desc: "You must log in first",
  forbidden: "Forbidden",
  forbidden_desc: "You don't have permission to access this page",
  network_error: "Network Error",
  network_error_desc: "Unable to connect to the internet",

  // 🔘 Adhkar Buttons
  click_to_count: "Click on the dhikr to count",
  completed: "Today's Goal Completed",
  of: "of",

  // 📱 PWA
  install_pwa: "Install App",
  install_pwa_desc:
    "Tap the share button then \"Add to Home Screen\"",

  // 🎯 Dawah Fields
  field_aqeedah: "Creed (Aqeedah)",
  field_fiqh: "Jurisprudence (Fiqh)",
  field_tafsir: "Exegesis (Tafsir)",
  field_hadith: "Hadith",
  field_seerah: "Prophetic Biography",
  field_dawah: "Dawah",
  field_history: "History",
  field_ethics: "Ethics",
  field_family: "Family",
  field_youth: "Youth",
  field_women: "Women",
  field_contemporary: "Contemporary Issues",
  field_quran: "Quranic Sciences",
  field_comparison: "Comparative Religion",
  field_atheism: "Atheism & Doubts",
  field_thought: "Islamic Thought",
  field_politics: "Islamic Politics",

  // ========================================================
  // ➕ Additional UI / Accessibility / Admin keys
  // ========================================================

  skip_to_content: "Skip to content",
  main_navigation: "Main navigation",
  language: "Language",
  switch_language: "Switch language",
  theme: "Theme",
  light_mode: "Light mode",
  dark_mode: "Dark mode",
  system_mode: "System mode",
  menu: "Menu",
  open_menu: "Open menu",
  close_menu: "Close menu",
  site_search: "Site search",
  advanced_search: "Advanced search",
  filters: "Filters",
  clear_filters: "Clear filters",
  apply: "Apply",
  reset_filters: "Reset filters",
  sort_by: "Sort by",
  newest: "Newest",
  oldest: "Oldest",
  a_z: "A–Z",
  z_a: "Z–A",
  show_more: "Show more",
  show_less: "Show less",
  expand: "Expand",
  collapse: "Collapse",
  copied: "Copied",
  copy_failed: "Copy failed",
  share_failed: "Share failed",
  print: "Print",
  report_error: "Report an issue",
  feedback: "Feedback",
  send_feedback: "Send feedback",
  your_name: "Your name",
  your_email: "Your email",
  your_message: "Your message",
  required: "Required",
  optional: "Optional",
  yes: "Yes",
  no: "No",
  maybe: "Maybe",
  ok: "OK",
  done: "Done",
  retry: "Retry",
  try_again: "Try again",
  refresh: "Refresh",
  offline: "You are offline",
  online: "Online",
  maintenance: "Under maintenance",
  coming_soon: "Coming soon",
  under_construction: "Under construction",
  words: "words",
  last_updated: "Last updated",
  created_at: "Created at",
  updated_at: "Updated at",
  by_author: "By",

  // About page
  about_mission: "Our mission",
  about_vision: "Our vision",
  about_values: "Our values",
  about_sincerity: "Sincerity",
  about_knowledge: "Knowledge",
  about_kindness: "Kindness",
  about_balance: "Balance",
  about_service: "Service",
  about_continuity: "Continuity",
  about_supervisor: "Platform supervisor",
  about_content_method: "Content methodology",
  about_sections: "Platform sections",
  about_privacy_simple: "Privacy in simple words",
  about_join_us: "Want to participate or suggest?",
  about_note: "Note",

  // Contact page
  contact_title: "Contact us",
  contact_subtitle: "We are happy to receive your messages and inquiries",
  contact_success: "Your message has been sent successfully",
  contact_error: "Could not send your message, please try later",
  contact_waiting: "We are reviewing your message and will reply soon",

  // Legal pages
  privacy_title: "Privacy Policy",
  terms_title: "Terms & Conditions",

  // Admin content actions
  save_draft: "Save as draft",
  publish: "Publish",
  unpublish: "Unpublish",
  archive: "Archive",
  restore: "Restore",
  duplicate: "Duplicate",
  preview: "Preview",
  media_library: "Media library",
  upload_image: "Upload image",
  choose_file: "Choose a file",
  drag_drop: "Or drag and drop the file here",
  seo_settings: "SEO settings",
  social_preview: "Social preview",
  translation_editor: "Translation editor",
  add_translation: "Add translation",
  remove_translation: "Remove translation",
  language_code: "Language code",
  field_label: "Label",
  field_value: "Value",
};

// ============================================================
// 4️⃣ تصدير قاموس الترجمات
// ============================================================

export const translations = {
  ar: arTranslations,
  en: enTranslations,
} as const;

// ============================================================
// 5️⃣ دالة الترجمة الرئيسية
// ============================================================

/**
 * دالة الترجمة الذكية:
 *
 * @example
 * t("ar") => { home: "الرئيسية", about: "من نحن", ... }
 * @example
 * t("ar", "home") => "الرئيسية"
 * @example
 * t("en", "home") => "Home"
 */
export function t(lang: TranslationLang | string): TranslationDictionary;
export function t(lang: TranslationLang | string, key: TranslationKey): string;
export function t(
  lang: TranslationLang | string,
  key?: TranslationKey
): string | TranslationDictionary {
  const safeLang = normalizeTranslationLang(lang);
  const dictionary = translations[safeLang] as TranslationDictionary;

  if (key === undefined) {
    return dictionary;
  }

  const value = dictionary[key] ?? translations.ar[key];

  return typeof value === "string" ? value : key;
}

// ============================================================
// 6️⃣ دوال مساعدة
// ============================================================

export const translationKeys = Object.keys(arTranslations) as TranslationKey[];

export function hasTranslation(key: string): key is TranslationKey {
  return Object.prototype.hasOwnProperty.call(arTranslations, key);
}

export function getTranslationOrDefault(
  lang: TranslationLang | string,
  key: string,
  fallback = key
): string {
  if (!hasTranslation(key)) {
    return fallback;
  }

  return t(lang, key);
}

export function getTranslations(
  lang: TranslationLang | string
): TranslationDictionary {
  return t(normalizeTranslationLang(lang));
}

/**
 * ترجمة مع استبدال placeholders.
 *
 * @example
 * tWithParams("ar", "newsletter_title", {})
 *
 * إذا كانت الترجمة:
 * "مرحبًا {name}"
 *
 * النتيجة:
 * "مرحبًا أحمد"
 */
export function tWithParams(
  lang: TranslationLang | string,
  key: TranslationKey,
  params: Record<string, string | number | null | undefined>
): string {
  let text = t(lang, key);

  for (const [paramKey, value] of Object.entries(params)) {
    const escapedKey = escapeRegExp(paramKey);
    text = text.replace(
      new RegExp(`\\{${escapedKey}\\}`, "g"),
      String(value ?? "")
    );
  }

  return text;
}

/**
 * إنشاء دالة ترجمة مرتبطة بلغة محددة.
 *
 * @example
 * const tr = createTranslator("ar");
 * tr("home"); // "الرئيسية"
 */
export function createTranslator(lang: TranslationLang | string) {
  const safeLang = normalizeTranslationLang(lang);

  return (
    key: TranslationKey,
    params?: Record<string, string | number | null | undefined>
  ): string => {
    return params
      ? tWithParams(safeLang, key, params)
      : t(safeLang, key);
  };
}

// ============================================================
// 7️⃣ دوال الحقول الديناميكية
// ============================================================

function resolveLocalizedField(
  field: unknown,
  lang: TranslationLang,
  depth: number
): string {
  if (field == null || depth > 5) {
    return "";
  }

  if (typeof field === "string") {
    return field;
  }

  if (typeof field === "number" || typeof field === "boolean") {
    return String(field);
  }

  if (typeof field === "function") {
    return "";
  }

  if (field instanceof Date) {
    return field.toISOString();
  }

  if (Array.isArray(field)) {
    return field
      .map((item) => resolveLocalizedField(item, lang, depth + 1))
      .filter(Boolean)
      .join(" ");
  }

  if (typeof field === "object") {
    const obj = field as Record<string, unknown>;

    const candidates = [
      obj[lang],
      obj.ar,
      obj.en,
      obj.default,
      obj.text,
      obj.value,
      obj.label,
      obj.name,
      obj.title,
    ];

    for (const candidate of candidates) {
      const resolved = resolveLocalizedField(candidate, lang, depth + 1);

      if (resolved) {
        return resolved;
      }
    }

    const nestedTranslations = obj.t;

    if (nestedTranslations && typeof nestedTranslations === "object") {
      const nestedObj = nestedTranslations as Record<string, unknown>;
      const nestedLangValue =
        nestedObj[lang] ?? nestedObj.ar ?? nestedObj.en;

      const resolved = resolveLocalizedField(
        nestedLangValue,
        lang,
        depth + 1
      );

      if (resolved) {
        return resolved;
      }
    }
  }

  return String(field ?? "");
}

/**
 * يستخرج النص المناسب من حقل ديناميكي.
 *
 * يدعم:
 * - نص عادي
 * - رقم / boolean
 * - مصفوفة
 * - كائن { ar, en }
 * - كائن { default, text, value, label, name, title }
 * - كائن { t: { ar: {...}, en: {...} } }
 */
export function getFieldTranslation(
  field: unknown,
  lang: TranslationLang | string
): string {
  const safeLang = normalizeTranslationLang(lang);
  return resolveLocalizedField(field, safeLang, 0);
}

// ============================================================
// 8️⃣ تسميات الحقول الافتراضية للوحة الأدمن
// ============================================================

export interface FieldLabel {
  ar: string;
  en: string;
}

export const defaultFieldTranslations: Record<string, FieldLabel> = {
  title: { ar: "العنوان", en: "Title" },
  description: { ar: "الوصف", en: "Description" },
  content: { ar: "المحتوى", en: "Content" },
  category: { ar: "التصنيف", en: "Category" },
  author: { ar: "الكاتب", en: "Author" },
  date: { ar: "التاريخ", en: "Date" },
  image: { ar: "الصورة", en: "Image" },
  url: { ar: "الرابط", en: "URL" },
  status: { ar: "الحالة", en: "Status" },
  published: { ar: "منشور", en: "Published" },
  draft: { ar: "مسودة", en: "Draft" },
  tags: { ar: "الوسوم", en: "Tags" },
  source: { ar: "المصدر", en: "Source" },
  language: { ar: "اللغة", en: "Language" },
  actions: { ar: "الإجراءات", en: "Actions" },
  createdAt: { ar: "تاريخ الإنشاء", en: "Created At" },
  updatedAt: { ar: "تاريخ التحديث", en: "Updated At" },

  // إضافات مفيدة
  id: { ar: "المعرف", en: "ID" },
  slug: { ar: "الرابط المختصر", en: "Slug" },
  type: { ar: "النوع", en: "Type" },
  views: { ar: "المشاهدات", en: "Views" },
  lang: { ar: "اللغة", en: "Language" },
  translations: { ar: "الترجمات", en: "Translations" },
  image_alt: { ar: "الوصف البديل للصورة", en: "Image alt text" },
  excerpt: { ar: "المقتطف", en: "Excerpt" },
  body: { ar: "المحتوى الكامل", en: "Body" },
  question: { ar: "السؤال", en: "Question" },
  answer: { ar: "الإجابة", en: "Answer" },
  order: { ar: "الترتيب", en: "Order" },
  featured: { ar: "مميز", en: "Featured" },
  published_at: { ar: "تاريخ النشر", en: "Published at" },
  created_at: { ar: "تاريخ الإنشاء", en: "Created at" },
  updated_at: { ar: "تاريخ التحديث", en: "Updated at" },
  author_id: { ar: "معرّف الكاتب", en: "Author ID" },
  category_id: { ar: "معرّف التصنيف", en: "Category ID" },
  meta_title: { ar: "عنوان السيو", en: "SEO title" },
  meta_description: { ar: "وصف السيو", en: "SEO description" },
  og_image: { ar: "صورة المشاركة", en: "Social image" },
  canonical: { ar: "الرابط الأساسي", en: "Canonical URL" },
  robots: { ar: "تعليمات الزواحف", en: "Robots" },
};

// ============================================================
// 9️⃣ Proxy للوصول المباشر
// ============================================================

type TranslationProxy = {
  [K in TranslationLang]: {
    [P in TranslationKey]: string;
  };
};

/**
 * Proxy اختياري:
 *
 * @example
 * tProxy.ar.home => "الرئيسية"
 * tProxy.en.home => "Home"
 */
export const tProxy = new Proxy({} as TranslationProxy, {
  get(_target, prop) {
    if (typeof prop !== "string") {
      return undefined;
    }

    const safeLang = normalizeTranslationLang(prop);

    return new Proxy({} as Record<TranslationKey, string>, {
      get(_inner, key) {
        if (typeof key !== "string") {
          return undefined;
        }

        return t(safeLang, key as TranslationKey);
      },
    });
  },
});

// ============================================================
// 🔟 Default export للتوافق والراحة
// ============================================================

const translationsApi = {
  translations,
  translationKeys,
  DEFAULT_TRANSLATION_LANG,
  SUPPORTED_TRANSLATION_LANGS,

  normalizeTranslationLang,
  t,
  tWithParams,
  tProxy,
  getTranslations,
  getTranslationOrDefault,
  hasTranslation,
  createTranslator,
  getFieldTranslation,
  defaultFieldTranslations,
};

export default translationsApi;