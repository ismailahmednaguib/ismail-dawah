// app/[lang]/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ============================================================
// الأنواع
// ============================================================

type Localized = {
  ar: string;
  en: string;
};

type PrivacySection = {
  id: string;
  icon: string;
  title: Localized;
  intro?: Localized;
  paragraphs: Localized[];
  bullets?: Localized[];
};

type RelatedLink = {
  id: string;
  href: string;
  icon: string;
  title: Localized;
  description: Localized;
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  quickNav: string;
  lastUpdated: string;
  introTitle: string;
  introText: string;
  sectionsTitle: string;
  relatedTitle: string;
  relatedDesc: string;
  contact: string;
  faq: string;
  about: string;
  homeLabel: string;
  noteTitle: string;
  note1: string;
  note2: string;
  verse: string;
  verseSource: string;
  sectionsCount: string;
  rightsCount: string;
  servicesCount: string;
  lastUpdateLabel: string;
  whyTrustTitle: string;
  trust1Title: string;
  trust1Desc: string;
  trust2Title: string;
  trust2Desc: string;
  trust3Title: string;
  trust3Desc: string;
  trust4Title: string;
  trust4Desc: string;
  contactPage: string;
  contactPageDesc: string;
  faqPage: string;
  faqPageDesc: string;
  aboutPage: string;
  aboutPageDesc: string;
  termsPage: string;
  termsPageDesc: string;
  rightsQuestion1: string;
  rightsAnswer1: string;
  rightsQuestion2: string;
  rightsAnswer2: string;
  rightsQuestion3: string;
  rightsAnswer3: string;
};

// ============================================================
// ثوابت
// ============================================================

const LAST_UPDATED_ISO = "2026-10-09";

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<Lang, UILang> = {
  ar: {
    title: "سياسة الخصوصية",
    subtitle: "كيف نتعامل مع بياناتك عند استخدام المنصة",
    home: "الرئيسية",
    description:
      "صفحة سياسة الخصوصية لمنصة إسماعيل أحمد نجيب الدعوية. توضح هذه الصفحة البيانات التي قد تُجمع، وكيفية استخدامها، والحفظ المحلي، والخدمات الخارجية، وحقوق المستخدم.",
    quickNav: "تنقل سريع",
    lastUpdated: "آخر تحديث",
    introTitle: "مقدمة",
    introText:
      "نحترم خصوصية المستخدم، ونسعى إلى جمع أقل قدر ممكن من البيانات، وتشغيل معظم أدوات التقدم محليًا على الجهاز ما دام ذلك ممكنًا.",
    sectionsTitle: "بنود السياسة",
    relatedTitle: "روابط ذات صلة",
    relatedDesc: "صفحات قد تساعدك على فهم المنصة وطريقة التواصل معنا.",
    contact: "تواصل معنا",
    faq: "الأسئلة الشائعة",
    about: "من نحن",
    homeLabel: "الرئيسية",
    noteTitle: "ملاحظة",
    note1:
      "قد تُحدَّث هذه السياسة من وقت لآخر حسب تغييرات المنصة أو الخدمات المستخدمة.",
    note2:
      "إذا كانت لديك حالة خاصة تتعلق بالبيانات أو الحساب، يُرجى التواصل معنا عبر صفحة تواصل معنا.",
    verse: "﴿ إِنَّا عَرَضْنَا الْأَمَانَةَ عَلَى السَّمَاوَاتِ وَالْأَرْضِ وَالْجِبَالِ فَأَبَيْنَ أَن يَحْمِلْنَهَا ﴾",
    verseSource: "سورة الأحزاب — الآية 72",
    sectionsCount: "أقسام",
    rightsCount: "حقوق",
    servicesCount: "خدمات خارجية",
    lastUpdateLabel: "آخر تحديث",
    whyTrustTitle: "لماذا تثق بنا؟",
    trust1Title: "الحد الأدنى من البيانات",
    trust1Desc: "نجمع فقط ما نحتاجه لتشغيل الخدمة، ولا نطلب أكثر من ذلك.",
    trust2Title: "حفظ محلي أولاً",
    trust2Desc: "معظم التقدم والأدوات تُحفظ على جهازك، ولا تُرسل إلى خوادمنا.",
    trust3Title: "بدون إعلانات",
    trust3Desc: "لا نبيع بياناتك، ولا نستخدم شبكات إعلانية تتتبعك عبر المواقع.",
    trust4Title: "شفافية كاملة",
    trust4Desc: "نوضح كل خدمة خارجية نستخدمها ولماذا، مع روابط لسياساتها.",
    contactPage: "تواصل معنا",
    contactPageDesc: "للاستفسار عن الخصوصية أو طلب حذف بيانات.",
    faqPage: "الأسئلة الشائعة",
    faqPageDesc: "إجابات سريعة عن البيانات والحسابات.",
    aboutPage: "من نحن",
    aboutPageDesc: "تعرّف على المنصة ورسالتها وقيمها.",
    termsPage: "الشروط والأحكام",
    termsPageDesc: "قواعد استخدام المنصة.",
    rightsQuestion1: "هل يمكنني حذف حسابي وبياناتي؟",
    rightsAnswer1: "نعم، يمكنك طلب حذف حسابك وجميع بياناتك المرتبطة عبر صفحة التواصل، ونعالج الطلب خلال مدة معقولة.",
    rightsQuestion2: "هل تستخدمون الكوكيز للتتبع الإعلاني؟",
    rightsAnswer2: "لا، نستخدم فقط الكوكيز الضرورية لتشغيل الخدمة (الجلسة، اللغة، الوضع الليلي)، ولا نستخدم كوكيز إعلانية.",
    rightsQuestion3: "هل تشاركون بياناتي مع جهات أخرى؟",
    rightsAnswer3: "لا نبيع بياناتك ولا نشاركها مع جهات إعلانية. قد نستخدم خدمات موثوقة للاستضافة أو البريد ملتزمة بحماية البيانات.",
  },
  en: {
    title: "Privacy Policy",
    subtitle: "How we handle your data when using the platform",
    home: "Home",
    description:
      "Privacy policy page for the Ismail Ahmed Naguib Dawah Platform. It explains what data may be collected, how it is used, local storage, external services, and user rights.",
    quickNav: "Quick navigation",
    lastUpdated: "Last updated",
    introTitle: "Introduction",
    introText:
      "We respect user privacy and aim to collect the minimum necessary data, while keeping most progress tools local on the device whenever possible.",
    sectionsTitle: "Policy Sections",
    relatedTitle: "Related links",
    relatedDesc: "Pages that may help you understand the platform and contact us.",
    contact: "Contact Us",
    faq: "FAQ",
    about: "About",
    homeLabel: "Home",
    noteTitle: "Notice",
    note1:
      "This policy may be updated from time to time according to platform or service changes.",
    note2:
      "If you have a special case regarding data or an account, please contact us through the Contact Us page.",
    verse: "\"Indeed, We offered the Trust upon the heavens and the earth and the mountains, and they declined to bear it.\"",
    verseSource: "Surah Al-Ahzab — Verse 72",
    sectionsCount: "Sections",
    rightsCount: "Rights",
    servicesCount: "External Services",
    lastUpdateLabel: "Last Update",
    whyTrustTitle: "Why Trust Us?",
    trust1Title: "Minimal Data Collection",
    trust1Desc: "We collect only what's needed to run the service, nothing more.",
    trust2Title: "Local Storage First",
    trust2Desc: "Most progress and tools are saved on your device, not sent to our servers.",
    trust3Title: "No Ads",
    trust3Desc: "We don't sell your data or use ad networks that track you across sites.",
    trust4Title: "Full Transparency",
    trust4Desc: "We disclose every external service we use and why, with links to their policies.",
    contactPage: "Contact Us",
    contactPageDesc: "For privacy inquiries or data deletion requests.",
    faqPage: "FAQ",
    faqPageDesc: "Quick answers about data and accounts.",
    aboutPage: "About Us",
    aboutPageDesc: "Learn about the platform, mission, and values.",
    termsPage: "Terms & Conditions",
    termsPageDesc: "Platform usage rules.",
    rightsQuestion1: "Can I delete my account and data?",
    rightsAnswer1: "Yes, you can request deletion of your account and all associated data via the contact page, and we process the request within a reasonable period.",
    rightsQuestion2: "Do you use cookies for ad tracking?",
    rightsAnswer2: "No, we only use essential cookies for service operation (session, language, dark mode), and we don't use advertising cookies.",
    rightsQuestion3: "Do you share my data with other parties?",
    rightsAnswer3: "We don't sell your data or share it with advertisers. We may use trusted services for hosting or email that are committed to data protection.",
  },
};

// ============================================================
// أقسام السياسة
// ============================================================

const SECTIONS: PrivacySection[] = [
  {
    id: "data-collection",
    icon: "🧾",
    title: {
      ar: "البيانات التي قد نجمعها",
      en: "Data We May Collect",
    },
    intro: {
      ar: "نجمع الحد الأدنى من البيانات حسب الخدمة المستخدمة.",
      en: "We collect the minimum data needed according to the service used.",
    },
    paragraphs: [
      {
        ar: "عند استخدام نموذج التواصل، قد نحتاج إلى اسمك وبريدك الإلكتروني ورسالتك حتى نتمكن من الرد عليك.",
        en: "When using the contact form, we may need your name, email address, and message so we can reply to you.",
      },
      {
        ar: "إذا أنشأت حسابًا في المستقبل، قد نخزن بيانات أساسية مثل الاسم والبريد الإلكتروني ومعرّف الحساب.",
        en: "If you create an account in the future, we may store basic data such as name, email address, and account identifier.",
      },
      {
        ar: "قد تُجمع بيانات تقنية محدودة مثل نوع المتصفح أو الجهاز أو صفحات الخطأ، وذلك لتحسين الأداء والأمان.",
        en: "Limited technical data such as browser type, device, or error pages may be collected to improve performance and security.",
      },
    ],
    bullets: [
      { ar: "الاسم عند التواصل أو التسجيل.", en: "Name when contacting or registering." },
      { ar: "البريد الإلكتروني للرد أو استعادة الحساب.", en: "Email address for replies or account recovery." },
      { ar: "محتوى الرسالة أو السؤال.", en: "Message or question content." },
      { ar: "بيانات تقنية مبسطة للأمان والتحسين.", en: "Simplified technical data for security and improvement." },
    ],
  },
  {
    id: "data-use",
    icon: "🎯",
    title: { ar: "كيف نستخدم البيانات", en: "How We Use Data" },
    paragraphs: [
      {
        ar: "نستخدم البيانات للرد على استفساراتك، وتحسين تجربة الاستخدام، وحماية المنصة من الإساءة أو الاستخدام الآلي.",
        en: "We use data to respond to your inquiries, improve user experience, and protect the platform from abuse or automated misuse.",
      },
      {
        ar: "لا نبيع بياناتك الشخصية، ولا نشاركها مع جهات إعلانية.",
        en: "We do not sell your personal data, nor do we share it with advertising entities.",
      },
      {
        ar: "قد نستخدم بيانات مجمعة وغير شخصية لفهم عدد الزيارات وتحسين المحتوى.",
        en: "We may use aggregated, non-personal data to understand visits and improve content.",
      },
    ],
    bullets: [
      { ar: "الرد على الرسائل والأسئلة.", en: "Replying to messages and questions." },
      { ar: "تحسين الصفحات والأداء.", en: "Improving pages and performance." },
      { ar: "حماية المنصة من السبام.", en: "Protecting the platform from spam." },
      { ar: "إرسال إشعارات فقط إذا طلبت ذلك أو سمحت به.", en: "Sending notifications only if requested or permitted." },
    ],
  },
  {
    id: "cookies-storage",
    icon: "🍪",
    title: { ar: "الكوكيز والتخزين المحلي", en: "Cookies and Local Storage" },
    intro: {
      ar: "معظم أدوات التقدم في المنصة تُحفظ محليًا على جهازك.",
      en: "Most progress tools in the platform are saved locally on your device.",
    },
    paragraphs: [
      {
        ar: "نستخدم التخزين المحلي لحفظ تفضيلات مثل اللغة والوضع الليلي، وأيضًا بعض أدوات التقدم مثل المسبحة وخطة الحفظ والورد اليومي.",
        en: "We use local storage to save preferences such as language and dark mode, and also some progress tools such as tasbih, memorization plan, and daily wird.",
      },
      {
        ar: "هذه البيانات تبقى على جهازك، ولا تُرسل إلينا تلقائيًا.",
        en: "This data remains on your device and is not automatically sent to us.",
      },
      {
        ar: "يمكنك مسح التخزين المحلي أو الكوكيز من إعدادات المتصفح في أي وقت.",
        en: "You can clear local storage or cookies from browser settings at any time.",
      },
    ],
    bullets: [
      { ar: "تفضيل اللغة.", en: "Language preference." },
      { ar: "الوضع الليلي.", en: "Dark mode." },
      { ar: "تقدم الحفظ أو المسبحة أو الورد.", en: "Memorization, tasbih, or wird progress." },
      { ar: "إعدادات بسيطة لتحسين التجربة.", en: "Simple settings to improve experience." },
    ],
  },
  {
    id: "third-parties",
    icon: "🔗",
    title: { ar: "الخدمات الخارجية", en: "Third-Party Services" },
    paragraphs: [
      {
        ar: "قد تعتمد المنصة على خدمات خارجية موثوقة للاستضافة أو قواعد البيانات أو إرسال البريد أو واجهات القرآن والصلاة.",
        en: "The platform may rely on trusted external services for hosting, databases, email delivery, or Quran and prayer APIs.",
      },
      {
        ar: "هذه الخدمات قد تعالج بيانات وفق سياساتها الخاصة، ونحن نختار ما يناسب الحد الأدنى من الخصوصية والأمان.",
        en: "These services may process data according to their own policies, and we choose options compatible with minimum privacy and security.",
      },
      {
        ar: "لا نتحكم في سياسات الأطراف الثالثة، لذلك ننصح بمراجعة سياسات الخصوصية الخاصة بها.",
        en: "We do not control third-party policies, so we recommend reviewing their privacy policies.",
      },
    ],
    bullets: [
      { ar: "Vercel للاستضافة.", en: "Vercel for hosting." },
      { ar: "Supabase للتخزين أو المصادقة عند الحاجة.", en: "Supabase for storage or authentication when needed." },
      { ar: "Resend لإرسال رسائل التواصل.", en: "Resend for sending contact messages." },
      { ar: "واجهات عامة مثل Aladhan أو Quran APIs.", en: "Public APIs such as Aladhan or Quran APIs." },
    ],
  },
  {
    id: "retention",
    icon: "🗂️",
    title: { ar: "مدة الاحتفاظ بالبيانات", en: "Data Retention" },
    paragraphs: [
      {
        ar: "نحتفظ برسائل التواصل لمدة معقولة تسمح بالرد والمتابعة، ثم قد نحذفها أو نخزنها بشكل آمن حسب الحاجة.",
        en: "We keep contact messages for a reasonable period allowing reply and follow-up, then they may be deleted or securely stored as needed.",
      },
      {
        ar: "البيانات المحفوظة محليًا تبقى على جهازك حتى تمسحها أو تمسح بيانات المتصفح.",
        en: "Locally stored data remains on your device until you clear it or clear browser data.",
      },
      {
        ar: "إذا طلبت حذف حسابك أو بياناتك، نبذل الجهد المناسب لتنفيذ الطلب في مدة معقولة.",
        en: "If you request deletion of your account or data, we make reasonable effort to fulfill the request within a fair period.",
      },
    ],
  },
  {
    id: "security",
    icon: "🛡️",
    title: { ar: "أمان البيانات", en: "Data Security" },
    paragraphs: [
      {
        ar: "نحاول تطبيق إجراءات معقولة لحماية البيانات، مثل تقليل الصلاحيات، واستخدام خدمات ذات سمعة جيدة، وحماية النماذج من الاستخدام الآلي.",
        en: "We try to apply reasonable measures to protect data, such as minimizing permissions, using reputable services, and protecting forms from automated abuse.",
      },
      {
        ar: "لا يوجد نظام رقمي آمن بنسبة مطلقة، لذلك نوصي بعدم مشاركة كلمات مرور أو بيانات حساسة عبر نموذج التواصل.",
        en: "No digital system is absolutely secure, so we recommend not sharing passwords or sensitive data through the contact form.",
      },
    ],
    bullets: [
      { ar: "تشفير النقل عبر HTTPS عند الاستضافة.", en: "Transport encryption via HTTPS when hosted." },
      { ar: "حماية النماذج من البوتات.", en: "Form protection against bots." },
      { ar: "تقليل البيانات المجمعة.", en: "Minimizing collected data." },
      { ar: "مراجعة الأخطاء الأمنية دوريًا.", en: "Periodic review of security issues." },
    ],
  },
  {
    id: "children",
    icon: "🧒",
    title: { ar: "خصوصية الأطفال", en: "Children's Privacy" },
    paragraphs: [
      {
        ar: "المحتوى العام مناسب لجميع الأعمار، لكننا لا نجمع بيانات الأطفال عمدًا.",
        en: "General content is suitable for all ages, but we do not intentionally collect children's data.",
      },
      {
        ar: "ينبغي على أولياء الأمور متابعة استخدام الأبناء لأي موقع، بما في ذلك هذه المنصة.",
        en: "Parents should supervise children's use of any website, including this platform.",
      },
      {
        ar: "إذا كنت ولي أمر ووجدت أن طفلك أرسل بيانات شخصية، تواصل معنا وسنحاول معالجة الموقف.",
        en: "If you are a parent and find that your child sent personal data, contact us and we will try to address the situation.",
      },
    ],
  },
  {
    id: "rights",
    icon: "⚖️",
    title: { ar: "حقوقك", en: "Your Rights" },
    intro: {
      ar: "نحترم حقوق المستخدم حسب النظام المعمول به.",
      en: "We respect user rights according to applicable law.",
    },
    paragraphs: [
      {
        ar: "يمكنك طلب الوصول إلى بياناتك الشخصية التي نحتفظ بها، أو تصحيحها، أو حذفها، أو تقييد معالجتها.",
        en: "You may request access to your personal data we hold, correction, deletion, or restriction of processing.",
      },
      {
        ar: "يمكنك أيضًا سحب الموافقة على أي إشعارات أو تواصل تسويقي إن وُجد.",
        en: "You may also withdraw consent for any notifications or marketing communication if present.",
      },
      {
        ar: "لتنفيذ طلبك، استخدم صفحة تواصل معنا ووضح نوع الطلب.",
        en: "To submit a request, use the Contact Us page and specify the type of request.",
      },
    ],
    bullets: [
      { ar: "حق الوصول.", en: "Right to access." },
      { ar: "حق التصحيح.", en: "Right to rectification." },
      { ar: "حق الحذف.", en: "Right to deletion." },
      { ar: "حق الاعتراض أو تقييد المعالجة.", en: "Right to object or restrict processing." },
    ],
  },
  {
    id: "changes",
    icon: "🔄",
    title: { ar: "تغييرات السياسة", en: "Policy Changes" },
    paragraphs: [
      {
        ar: "قد نحدّث سياسة الخصوصية عند إضافة ميزات جديدة أو تغيير خدمات خارجية أو تحسين الأمان.",
        en: "We may update the privacy policy when adding new features, changing external services, or improving security.",
      },
      {
        ar: "سيتم تحديث تاريخ آخر تعديل في هذه الصفحة.",
        en: "The last update date on this page will be revised.",
      },
      {
        ar: "ننصح بمراجعة الصفحة بشكل دوري إذا كنت تستخدم ميزات الحساب أو التواصل.",
        en: "We recommend reviewing this page periodically if you use account or contact features.",
      },
    ],
  },
  {
    id: "contact-data",
    icon: "📬",
    title: { ar: "التواصل بخصوص الخصوصية", en: "Privacy Contact" },
    paragraphs: [
      {
        ar: "إذا كانت لديك أسئلة حول الخصوصية، أو طلب حذف بيانات، أو ملاحظة أمنية، يرجى التواصل معنا.",
        en: "If you have privacy questions, a data deletion request, or a security note, please contact us.",
      },
      {
        ar: "سنحاول الرد في أقرب وقت ممكن، مع الحفاظ على سرية الطلب.",
        en: "We will try to reply as soon as possible while keeping the request confidential.",
      },
    ],
  },
];

// ============================================================
// روابط ذات صلة
// ============================================================

const RELATED_LINKS: RelatedLink[] = [
  {
    id: "contact",
    href: "/contact",
    icon: "📬",
    title: { ar: "تواصل معنا", en: "Contact Us" },
    description: {
      ar: "لإرسال سؤال أو طلب خاص بالخصوصية.",
      en: "To send a question or privacy-related request.",
    },
  },
  {
    id: "faq",
    href: "/faq",
    icon: "❓",
    title: { ar: "الأسئلة الشائعة", en: "FAQ" },
    description: {
      ar: "إجابات سريعة عن استخدام المنصة والبيانات.",
      en: "Quick answers about platform use and data.",
    },
  },
  {
    id: "about",
    href: "/about",
    icon: "ℹ️",
    title: { ar: "من نحن", en: "About" },
    description: {
      ar: "تعرّف على المنصة ورسالتها وقيمها.",
      en: "Learn about the platform, mission, and values.",
    },
  },
  {
    id: "home",
    href: "",
    icon: "🏠",
    title: { ar: "الرئيسية", en: "Home" },
    description: {
      ar: "العودة إلى الصفحة الرئيسية للمنصة.",
      en: "Return to the platform homepage.",
    },
  },
];

// ============================================================
// دوال مساعدة
// ============================================================

function formatDate(iso: string, lang: Lang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLang(lang)) return {};

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/privacy`,
      languages: {
        ar: "/ar/privacy",
        en: "/en/privacy",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/privacy`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: "/icons/icon-512.png",
          width: 512,
          height: 512,
          alt: ui.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.title,
      description: ui.description,
      images: ["/icons/icon-512.png"],
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// الصفحة
// ============================================================

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: ui.title,
        description: ui.description,
        inLanguage: l,
        url: `/${l}/privacy`,
        dateModified: LAST_UPDATED_ISO,
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: ui.rightsQuestion1,
            acceptedAnswer: { "@type": "Answer", text: ui.rightsAnswer1 },
          },
          {
            "@type": "Question",
            name: ui.rightsQuestion2,
            acceptedAnswer: { "@type": "Answer", text: ui.rightsAnswer2 },
          },
          {
            "@type": "Question",
            name: ui.rightsQuestion3,
            acceptedAnswer: { "@type": "Answer", text: ui.rightsAnswer3 },
          },
        ],
      },
    ],
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${l}` },
          { label: ui.title },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden border-2 border-primary-200 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 p-8 md:p-12 dark:border-primary-800 dark:from-primary-950/30 dark:via-gray-900 dark:to-gold-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #0e7490, #d4af37)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">
              🔐 {isRTL ? "خصوصية المستخدم" : "User Privacy"}
            </span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.description}
            </p>

            {/* آية كريمة */}
            <div className="mt-8 rounded-2xl border border-gold-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
              <p
                className="mb-2 text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {ui.verse}
              </p>
              <p className="text-xs text-gold-600 dark:text-gold-400">
                {ui.verseSource}
              </p>
            </div>

            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 backdrop-blur-sm dark:bg-night-800/80 dark:text-slate-300">
              📅 {ui.lastUpdated}: {formatDate(LAST_UPDATED_ISO, l)}
            </p>
          </div>
        </div>

        {/* ===== إحصائيات ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="📋" label={ui.sectionsCount} value={SECTIONS.length} color="primary" />
          <StatCard icon="⚖️" label={ui.rightsCount} value={4} color="gold" />
          <StatCard icon="🔗" label={ui.servicesCount} value={4} color="primary" />
          <StatCard icon="📅" label={ui.lastUpdateLabel} value={formatDate(LAST_UPDATED_ISO, l)} color="gold" isSmall />
        </div>

        {/* ===== لماذا تثق بنا؟ ===== */}
        <div className="card mb-10 overflow-hidden">
          <div className="gradient-gold h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <h2
              className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🛡️ {ui.whyTrustTitle}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <TrustCard
                icon="📉"
                title={ui.trust1Title}
                description={ui.trust1Desc}
              />
              <TrustCard
                icon="💾"
                title={ui.trust2Title}
                description={ui.trust2Desc}
              />
              <TrustCard
                icon="🚫"
                title={ui.trust3Title}
                description={ui.trust3Desc}
              />
              <TrustCard
                icon="🔍"
                title={ui.trust4Title}
                description={ui.trust4Desc}
              />
            </div>
          </div>
        </div>

        {/* ===== تنقل سريع ===== */}
        <div className="card mb-8 p-6 md:p-7">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {ui.quickNav}
          </h2>

          <div className="flex flex-wrap gap-3">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
              >
                <span>{section.icon}</span>
                <span>{isRTL ? section.title.ar : section.title.en}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ===== مقدمة ===== */}
        <div className="card mb-8 p-6 md:p-8">
          <h2
            className="mb-4 text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.introTitle}
          </h2>

          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {ui.introText}
          </p>
        </div>

        {/* ===== أقسام السياسة ===== */}
        <div className="mb-10">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.sectionsTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
          </div>

          <div className="space-y-6">
            {SECTIONS.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="card relative scroll-mt-32 overflow-hidden p-6 md:p-8"
              >
                <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

                <div className="mb-5 flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                    {section.icon}
                  </span>

                  <div className="min-w-0">
                    <h3
                      className="text-2xl font-black leading-relaxed text-slate-900 dark:text-white"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {isRTL ? section.title.ar : section.title.en}
                    </h3>

                    {section.intro && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {isRTL ? section.intro.ar : section.intro.en}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {section.paragraphs.map((paragraph, index) => (
                    <p
                      key={`${section.id}-paragraph-${index}`}
                      className="leading-relaxed text-slate-600 dark:text-slate-300"
                    >
                      {isRTL ? paragraph.ar : paragraph.en}
                    </p>
                  ))}
                </div>

                {section.bullets && section.bullets.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-night-700 dark:bg-night-800/40">
                    <ul className="space-y-3">
                      {section.bullets.map((bullet, index) => (
                        <li
                          key={`${section.id}-bullet-${index}`}
                          className="flex items-start gap-3 leading-relaxed text-slate-700 dark:text-slate-200"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                          <span>{isRTL ? bullet.ar : bullet.en}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* ===== روابط ذات صلة ===== */}
        <div className="mb-10">
          <div className="mb-6 text-center">
            <h2
              className="section-title mb-0"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🔗 {ui.relatedTitle}
            </h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.relatedDesc}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {RELATED_LINKS.map((link) => (
              <Link
                key={link.id}
                href={`/${l}${link.href}`}
                className="card card-interactive group flex items-start gap-4 p-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                  {link.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                    {isRTL ? link.title.ar : link.title.en}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {isRTL ? link.description.ar : link.description.en}
                  </p>
                </div>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-1 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary-500 rtl:rotate-180 dark:text-slate-600"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* ===== ملاحظة ===== */}
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              📌
            </span>

            <div>
              <h3
                className="mb-3 text-xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.noteTitle}
              </h3>

              <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note2}</span>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/${l}/contact`} className="btn-primary">
                  {ui.contact}
                </Link>
                <Link href={`/${l}/faq`} className="btn-outline">
                  {ui.faq}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer lang={l} />
    </main>
  );
}

// ============================================================
// مكون StatCard
// ============================================================

function StatCard({
  icon,
  label,
  value,
  color,
  isSmall = false,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: "primary" | "gold";
  isSmall?: boolean;
}) {
  const colorClasses = {
    primary: "text-primary-700 dark:text-primary-300",
    gold: "text-gold-700 dark:text-gold-300",
  };

  return (
    <div className="card p-5 text-center">
      <div className="mb-2 flex justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          {icon}
        </span>
      </div>
      <p className={`${isSmall ? "text-sm" : "text-2xl"} font-black ${colorClasses[color]}`}>
        {value}
      </p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

// ============================================================
// مكون TrustCard
// ============================================================

function TrustCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-night-700 dark:bg-night-800/40">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          {icon}
        </span>
        <h3
          className="text-base font-black text-slate-900 dark:text-white"
          style={{ fontFamily: "var(--font-amiri)" }}
        >
          {title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}