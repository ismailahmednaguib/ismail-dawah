// lib/navigation.ts
// ============================================================
// هيكل تنقّل الموقع (المصدر الوحيد للحقيقة).
// - يقرأ منه الهيدر والفوتر وصفحات المجموعات (/topic/[slug]).
// - يتحكم فيه بالكامل من لوحة التحكم: إظهار/إخفاء، تعديل الاسم (ar/en)، وتعديل الرابط.
// تُخزَّن التعديلات في إعدادات المنصة بمفتاح: navigation
//   { [nodeKey]: { visible?: boolean; ar?: string; en?: string; href?: string } }
// ============================================================

import type { Lang } from "./i18n";

export type NavNode = {
  /** معرّف ثابت (يُستخدم في الرابط /topic/{key} وفي الإعدادات) */
  key: string;
  ar: string;
  en: string;
  icon?: string;
  /** رابط بلا لغة (مثل "/quran") — إن غاب يُستخدم /topic/{key} */
  href?: string;
  desc?: { ar: string; en: string };
  /** تصنيف في قاعدة البيانات يجلب محتوى الصفحة تلقائيًا */
  taxonomy?: string;
  /** نوع المحتوى المطلوب للجلب (lesson/article/fatwa...) */
  contentType?: string;
  children?: NavNode[];
};

const n = (
  key: string,
  ar: string,
  en: string,
  icon: string,
  href?: string,
  children?: NavNode[],
  extra?: Partial<NavNode>
): NavNode => ({ key, ar, en, icon, href, children, ...extra });

// ============================================================
// الشجرة
// ============================================================

export const NAV_TREE: NavNode[] = [
  n("home", "الرئيسية", "Home", "🏠", ""),

  n("live", "البث المباشر", "Live Stream", "📡", "/live", undefined, { desc: { ar: "بث مباشر للدروس والمجالس العلمية", en: "Live lessons and study circles" } }),

  n("sciences", "علوم الدين", "Islamic Sciences", "📚", "/fields", [
    n("aqeedah", "العقيدة وأصول الدين", "Creed & Fundamentals", "🕌", undefined, [
      n("tawhid", "التوحيد وأركان الإيمان", "Tawhid & Pillars of Faith", "☪️", "/fields/tawhid", undefined, { taxonomy: "tawhid" }),
      n("names-attributes", "الأسماء والصفات", "Names & Attributes", "✨", "/fields/names-attributes", undefined, { taxonomy: "names-attributes" }),
      n("qadar", "القدر والبعث والجزاء", "Divine Decree & Hereafter", "🌌", "/fields/qadar", undefined, { taxonomy: "qadar" }),
      n("nubuwwah", "النبوّة والرسالات", "Prophethood & Messages", "📜"),
      n("sects", "الفرق والمذاهب (بيان لا تكفير)", "Sects & Schools", "🏛️", "/fields/sects", undefined, { taxonomy: "sects" }),
    ]),
    n("quran-sciences", "القرآن وعلومه", "Quran & Its Sciences", "📖", undefined, [
      n("mushaf", "المصحف الكامل (تفسير وتجويد وقراءة)", "Full Quran (Tafsir/Tajweed)", "📖", "/quran"),
      n("asbab-nuzul", "أسباب النزول", "Reasons of Revelation", "📅", "/fields/asbab-nuzul", undefined, { taxonomy: "asbab-nuzul" }),
      n("nasikh", "الناسخ والمنسوخ", "Abrogation", "🔀"),
      n("ijaz", "الإعجاز القرآني", "Quranic Inimitability", "🌟"),
      n("hifz", "حفظ القرآن وتتبع التقدم", "Memorization & Progress", "💾", "/quran-memorization"),
    ]),
    n("hadith-sciences", "الحديث وعلومه", "Hadith & Its Sciences", "💬", "/hadith", [
      n("six-books", "الكتب الستة", "The Six Books", "📕", "/fields/six-books", undefined, { taxonomy: "six-books" }),
      n("mustalah", "مصطلح الحديث", "Hadith Terminology", "🔍", "/fields/mustalah", undefined, { taxonomy: "mustalah" }),
      n("takhrij", "التخريج والدراية", "Takhrīj & Study", "🔎"),
      n("shuruh", "شرح الأحاديث المختارة", "Selected Hadith Commentary", "📖", "/hadith"),
    ]),
    n("fiqh", "الفقه وأصوله", "Fiqh & Its Principles", "⚖️", "/fiqh", [
      n("ibadat", "العبادات (طهارة، صلاة، زكاة، صيام، حج)", "Worship", "🕋", "/fields/ibadat", undefined, { taxonomy: "ibadat" }),
      n("prayer-guide", "دليل الصلاة", "Prayer Guide", "🕌", "/prayer-guide"),
      n("hajj-guide", "دليل الحج", "Hajj Guide", "🕋", "/hajj-guide"),
      n("muamalat", "المعاملات والاقتصاد الإسلامي", "Transactions & Economics", "💰", "/fields/muamalat", undefined, { taxonomy: "muamalat" }),
      n("family", "الأسرة والمواريث", "Family & Inheritance", "👨‍👩‍👧", "/fields/family", undefined, { taxonomy: "family" }),
      n("jinayat", "الجنايات والحدود", "Criminal Law", "🚧"),
      n("usul-fiqh", "أصول الفقه والقواعد الفقهية", "Jurisprudence Principles", "📐", "/fields/usul-fiqh", undefined, { taxonomy: "usul-fiqh" }),
      n("comparative-fiqh", "الفقه المقارن والمذاهب", "Comparative Fiqh", "⚖️", "/fields/comparative-fiqh", undefined, { taxonomy: "comparative-fiqh" }),
    ]),
    n("seerah", "السيرة والتاريخ", "Seerah & History", "📜", undefined, [
      n("seerah-nabawiyah", "السيرة النبوية", "Prophetic Biography", "🌙", "/fields/seerah-nabawiyah", undefined, { taxonomy: "seerah-nabawiyah" }),
      n("khulafa", "الخلفاء الراشدون", "Rightly Guided Caliphs", "🕌", "/fields/khulafa", undefined, { taxonomy: "khulafa" }),
      n("ahl-bayt", "أهل البيت والصحابة", "Ahl al-Bayt & Companions", "👥"),
      n("islamic-history", "التاريخ الإسلامي", "Islamic History", "📜", "/fields/islamic-history", undefined, { taxonomy: "islamic-history" }),
      n("tarajim", "تراجم العلماء", "Scholars' Biographies", "📖", "/prophets-stories"),
    ]),
    n("tazkiyah", "التزكية والأخلاق", "Purification & Ethics", "🌿", undefined, [
      n("raqaiq", "الرقائق وتهذيب النفوس", "Spiritual Refinement", "🌿", "/fields/tazkiyah-nafs", undefined, { taxonomy: "tazkiyah-nafs" }),
      n("akhlaq", "الأخلاق والآداب", "Ethics & Manners", "🤲", "/fields/akhlaq", undefined, { taxonomy: "akhlaq" }),
      n("adhkar-duaa", "الأذكار والدعاء والرقية", "Adhkar, Dua & Ruqyah", "🤲", "/adhkar"),
      n("ruqyah", "الرقية الشرعية", "Ruqyah", "🛡️", "/ruqyah"),
      n("ibadat-amaliyah", "العبادات العملية", "Practical Worship", "🛠️", "/topic/ibadat-amaliyah"),
    ]),
    n("dawah-sciences", "الدعوة والخطابة", "Dawah & Oratory", "📢", undefined, [
      n("dawah-manhaj", "منهج الدعوة إلى الله", "Dawah Methodology", "📢", "/fields/dawah-manhaj", undefined, { taxonomy: "dawah-manhaj" }),
      n("hiwar", "مهارات الحوار والمناظرة", "Dialogue & Debate Skills", "🤝", "/dawah-guide"),
      n("khutab", "الخطب والمحاضرات", "Khutbahs & Lectures", "🎤", "/khutab"),
      n("majalis", "إدارة المجالس الدعوية", "Managing Dawah Circles", "🗂️"),
    ]),
    n("library", "المكتبة العلمية", "Knowledge Library", "📚", "/learn"),
  ], { desc: { ar: "موسوعة علوم الدين: عقيدة، قرآن، حديث، فقه، سيرة، تزكية، ودعوة", en: "Encyclopedia of Islamic sciences" } }),

  n("non-muslim", "بوابة غير المسلمين", "Non-Muslim Portal", "🌍", "/dawah", [
    n("what-is-islam", "ما هو الإسلام؟", "What is Islam?", "🕌"),
    n("who-is-muhammad", "من هو محمد ﷺ؟", "Who is Muhammad ﷺ?", "🌟"),
    n("quran-intro", "القرآن الكريم (مقدمة)", "The Quran (Intro)", "📖", "/quran"),
    n("women-in-islam", "المرأة في الإسلام", "Women in Islam", "👩"),
    n("jihad-terrorism", "الجهاد والإرهاب (الرد على الشبهة)", "Jihad & Terrorism", "🛡️"),
    n("equality-freedom", "الحرية والمساواة في الإسلام", "Equality & Freedom in Islam", "⚖️"),
    n("convert-guide", "دليل اعتناق الإسلام خطوة بخطوة", "How to Embrace Islam", "🤲", "/embrace-islam"),
    n("comparative-religion", "مقارنة الأديان", "Comparative Religion", "📚", "/fields/comparative-religion", undefined, { taxonomy: "comparative-religion" }),
    n("non-muslim-faq", "أسئلة شائعة من غير المسلمين", "FAQ from Non-Muslims", "❓", "/faq"),
    n("ask-daee", "تواصل مع داعية / اطرح سؤالًا", "Ask a Daee", "💬", "/contact"),
  ], { desc: { ar: "تعريف مبسّط بالإسلام لمن يبحث عنه", en: "A simple introduction to Islam" } }),

  n("responses", "مركز الردود على الشبهات والتيارات", "Responses Center", "🛡️", "/responses", [
    n("doubts-quran", "شبهات حول القرآن", "Doubts about the Quran", "📖", "/doubts"),
    n("doubts-sunnah", "شبهات حول السنة", "Doubts about the Sunnah", "💬", "/doubts"),
    n("doubts-aqeedah", "شبهات حول العقيدة", "Doubts about Creed", "🕌", "/doubts"),
    n("doubts-women", "شبهات حول المرأة والأسرة", "Doubts about Women & Family", "👩", "/women-fatwas"),
    n("doubts-jihad", "شبهات حول الجهاد والقتال", "Doubts about Jihad", "🛡️", "/doubts"),
    n("doubts-science", "شبهات حول العلم والدين", "Doubts about Science & Religion", "🔬", "/doubts"),
    n("atheism-response", "الرد على الإلحاد واللاأدرية", "Answering Atheism", "🚫", "/atheism-response", undefined, { taxonomy: "atheism" }),
    n("secularism-response", "الرد على العلمانية والليبرالية", "Answering Secularism", "⚖️", "/fields/secularism", undefined, { taxonomy: "secularism" }),
    n("feminism-response", "الرد على النسوية من منظور إسلامي", "Answering Feminism", "👩", "/fields/women-responses", undefined, { taxonomy: "women-responses" }),
    n("missionary-response", "الرد على التبشير والاستشراق", "Answering Missionary Work", "📖", "/fields/missionary", undefined, { taxonomy: "missionary" }),
    n("response-card", "نموذج بطاقة الرد", "Response Card Format", "🗂️", "/responses"),
  ], { desc: { ar: "ردود علمية منهجية على الشبهات والتيارات الفكرية", en: "Scholarly responses to doubts and ideologies" } }),

  n("tools", "الأدوات الإسلامية", "Islamic Tools", "🛠️", undefined, [
    n("prayer-times", "مواقيت الصلاة", "Prayer Times", "🕒", "/prayer-times"),
    n("qibla", "اتجاه القبلة", "Qibla Direction", "🧭", "/qibla"),
    n("adhkar", "الأذكار اليومية", "Daily Adhkar", "🤲", "/adhkar"),
    n("tasbih", "المسبحة الرقمية", "Digital Tasbih", "📿", "/tasbih"),
    n("zakat", "حاسبة الزكاة", "Zakat Calculator", "💰", "/zakat"),
    n("inheritance", "حاسبة الميراث", "Inheritance Calculator", "🧮", "/inheritance"),
    n("calendar-hijri", "التقويم الهجري والميلادي", "Hijri Calendar", "📅", "/calendar"),
    n("hifz-plan", "خطة حفظ القرآن", "Quran Memorization Plan", "💾", "/quran-memorization"),
    n("wird", "الورد اليومي", "Daily Wird", "📖", "/daily-wird"),
  ], { desc: { ar: "أدوات عملية تعين المسلم في عبادته ويومه", en: "Practical tools for daily worship" } }),

  n("fatwa", "الفتاوى والأسئلة الشرعية", "Fatwas & Rulings", "❓", "/fatwa", [
    n("fatwa-general", "فتاوى عامة", "General Fatwas", "⚖️", "/fatwa"),
    n("fatwa-women", "فتاوى النساء", "Women's Fatwas", "👩", "/women-fatwas"),
    n("fatwa-youth", "فتاوى الشباب", "Youth Fatwas", "🧑", "/youth-issues"),
    n("fatwa-ask", "إرسال سؤال جديد", "Submit a Question", "✉️", "/contact"),
    n("fatwa-review", "مراجعة علمية للفتاوى", "Scholarly Review", "🔍", "/contact"),
  ], { desc: { ar: "فتاوى وأجوبة شرعية موثوقة", en: "Reliable religious rulings" } }),

  n("articles", "المقالات والمدونة", "Articles & Blog", "📖", "/articles", [
    n("articles-dawah", "مقالات دعوية", "Dawah Articles", "📢", "/articles"),
    n("articles-aqeedah", "مقالات عقائدية", "Creed Articles", "🕌", "/articles"),
    n("articles-akhlaq", "مقالات أخلاقية", "Ethics Articles", "🌿", "/articles"),
    n("articles-archive", "أرشيف المقالات", "Articles Archive", "🗄️", "/articles"),
  ], { desc: { ar: "مقالات متنوعة في الدعوة والعقيدة والأخلاق", en: "Articles on dawah, creed and ethics" } }),

  n("calendar", "التقويم والأحداث", "Calendar & Events", "📅", "/calendar", [
    n("events", "الأحداث الإسلامية", "Islamic Events", "📅", "/calendar"),
    n("jumuah", "الخطب والجمعة", "Khutbahs & Friday", "🕌", "/khutab"),
    n("weekly-majalis", "المجالس الأسبوعية", "Weekly Circles", "🗓️", "/calendar"),
  ], { desc: { ar: "الأحداث والخطب والمجالس", en: "Events, khutbahs and circles" } }),

  n("account", "حساب المستخدم", "User Account", "👤", "/account", [
    n("bookmarks", "الإشارات المرجعية", "Bookmarks", "🔖", "/bookmarks"),
    n("progress", "تقدّم الحفظ والتعلّم", "Learning Progress", "📈", "/account"),
    n("notifications", "الإشعارات", "Notifications", "🔔", "/account"),
    n("settings", "الإعدادات", "Settings", "⚙️", "/account"),
  ], { desc: { ar: "إشاراتك المرجعية وتقدّمك وإشعاراتك وإعداداتك", en: "Bookmarks, progress, notifications and settings" } }),

  n("about", "عن المنصة", "About", "ℹ️", "/about", [
    n("about-sheikh", "عن الشيخ", "About the Sheikh", "👤", "/about"),
    n("certificates", "الشهادات العلمية", "Academic Credentials", "🎓", "/about"),
    n("contact", "تواصل معنا", "Contact Us", "✉️", "/contact"),
    n("faq", "الأسئلة الشائعة", "FAQ", "❓", "/faq"),
    n("privacy-terms", "الخصوصية والشروط", "Privacy & Terms", "📄", "/privacy"),
    n("download-app", "تحميل التطبيق", "Download App", "📥", "/download"),
  ], { desc: { ar: "تعرّف على الشيخ والمنصة، وتواصل معنا، وأسئلة شائعة", en: "About the sheikh, contact us and the FAQ" } }),

  n("app", "التطبيق", "The App", "📱", "/download", [
    n("apk", "تحميل APK", "Download APK", "📥", "/download"),
    n("push-notifications", "إشعارات الجوال", "Mobile Notifications", "🔔", "/download"),
    n("offline", "وضع عدم الاتصال", "Offline Mode", "📴", "/download"),
  ], { desc: { ar: "حمّل التطبيق واستخدمه في أي وقت بدون إنترنت", en: "Download the app and use it offline" } }),
];

// ============================================================
// الإعدادات القابلة للتحكم
// ============================================================

export interface NavNodeOverride {
  visible?: boolean;
  ar?: string;
  en?: string;
  href?: string;
}

/** مفتاح خاص لتخزين ترتيب العقد المخصّص (مصفوفة مفاتيح). */
export const NAV_ORDER_KEY = "__order";

export type NavigationConfig = Record<string, NavNodeOverride | string[]>;

/** نسخة مسطّحة من الشجرة (كل العقد). */
export type FlatNavNode = NavNode & { parentKey: string | null; depth: number };

export function flattenNav(tree: NavNode[] = NAV_TREE): FlatNavNode[] {
  const out: FlatNavNode[] = [];
  const walk = (nodes: NavNode[], parentKey: string | null, depth: number) => {
    for (const node of nodes) {
      out.push({ ...node, parentKey, depth });
      if (node.children?.length) walk(node.children, node.key, depth + 1);
    }
  };
  walk(tree, null, 0);
  return out;
}

export function findNavNode(key: string): NavNode | undefined {
  return flattenNav().find((node) => node.key === key);
}

/** مسار عقدة من الجذر إليها (لخبز الخبز في الصفحة). */
export function navBreadcrumb(key: string): NavNode[] {
  const chain: NavNode[] = [];
  const walk = (nodes: NavNode[]): boolean => {
    for (const node of nodes) {
      chain.push(node);
      if (node.key === key) return true;
      if (node.children?.length && walk(node.children)) return true;
      chain.pop();
    }
    return false;
  };
  return walk(NAV_TREE) ? chain : [];
}

// ============================================================
// دمج إعدادات لوحة التحكم مع الشجرة الافتراضية
// ============================================================

function readOrder(cfg: NavigationConfig): string[] {
  const raw = cfg[NAV_ORDER_KEY];
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
}

/** ترتيب العقد حسب مصفوفة المفاتيح المخصّصة (والباقي يرجع لترتيبه الطبيعي). */
function sortByOrder(nodes: NavNode[], order: string[]): NavNode[] {
  if (order.length === 0) return nodes;
  const rank = new Map(order.map((key, i) => [key, i]));
  return nodes
    .map((node, i) => ({ node, i, r: rank.has(node.key) ? (rank.get(node.key) as number) : Number.POSITIVE_INFINITY }))
    .sort((a, b) => (a.r - b.r) || (a.i - b.i))
    .map((x) => x.node);
}

function mergeNode(node: NavNode, config: NavigationConfig): NavNode {
  const raw = config[node.key];
  const override = (raw && !Array.isArray(raw) ? raw : {}) as NavNodeOverride;
  const children = node.children?.map((child) => mergeNode(child, config));
  return {
    ...node,
    ar: typeof override.ar === "string" && override.ar.trim() ? override.ar.trim() : node.ar,
    en: typeof override.en === "string" && override.en.trim() ? override.en.trim() : node.en,
    href: typeof override.href === "string" && override.href.trim() ? override.href.trim() : node.href,
    children,
  };
}

/** يطبّق الإعدادات المخزّنة على الشجرة ويحذف العقد المخفية (مع أبنائها) ويرتّبها. */
export function applyNavigationConfig(
  config: NavigationConfig | unknown,
  tree: NavNode[] = NAV_TREE
): NavNode[] {
  const cfg: NavigationConfig =
    config && typeof config === "object" && !Array.isArray(config)
      ? (config as NavigationConfig)
      : {};
  const order = readOrder(cfg);

  const walk = (nodes: NavNode[]): NavNode[] => {
    const out: NavNode[] = [];
    for (const node of nodes) {
      if (!Array.isArray(cfg[node.key]) && (cfg[node.key] as NavNodeOverride | undefined)?.visible === false) continue;
      const merged = mergeNode(node, cfg);
      if (merged.children) {
        merged.children = walk(merged.children);
      }
      out.push(merged);
    }
    return sortByOrder(out, order);
  };

  return walk(tree);
}

/** الرابط الفعلي لعقدة (بإضافة البادئة اللغوية لاحقًا في المكوّن). */
export function navHref(node: NavNode): string {
  if (node.href !== undefined && node.href !== null) return node.href;
  return `/topic/${node.key}`;
}

/** اسم العقدة حسب اللغة. */
export function navLabel(node: NavNode, lang: Lang): string {
  return lang === "ar" ? node.ar : node.en;
}
