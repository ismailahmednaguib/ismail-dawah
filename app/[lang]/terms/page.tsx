// app/[lang]/terms/page.tsx
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

type TermsSection = {
  id: string;
  icon: string;
  title: Localized;
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
  noteTitle: string;
  note1: string;
  note2: string;
  verse: string;
  verseSource: string;
  hadith: string;
  hadithSource: string;
  sectionsCount: string;
  languagesCount: string;
  lastUpdateLabel: string;
  freeAlways: string;
  ctaTitle: string;
  ctaDesc: string;
};

// ============================================================
// ثوابت
// ============================================================

const LAST_UPDATED_ISO = "2026-10-09";

const PLATFORM_NAME: Localized = {
  ar: "منصة إسماعيل أحمد نجيب",
  en: "Ismail Ahmed Naguib Platform",
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<Lang, UILang> = {
  ar: {
    title: "الشروط والأحكام",
    subtitle: "قواعد استخدام منصة إسماعيل أحمد نجيب الدعوية",
    home: "الرئيسية",
    description:
      "صفحة الشروط والأحكام لمنصة إسماعيل أحمد نجيب الدعوية. توضح هذه الصفحة قواعد استخدام المنصة، وحقوق المحتوى، والتنبيهات الشرعية، والمسؤوليات، وسياسة التغييرات.",
    quickNav: "تنقل سريع",
    lastUpdated: "آخر تحديث",
    introTitle: "مقدمة",
    introText:
      "تنظم هذه الشروط استخدام منصة إسماعيل أحمد نجيب الدعوية. الهدف هو حماية المستخدم، والحفاظ على جودة المحتوى، وضمان استخدام المنصة في إطار نافع ومنضبط.",
    sectionsTitle: "بنود الشروط",
    relatedTitle: "روابط ذات صلة",
    relatedDesc: "صفحات تساعدك على فهم المنصة وطريقة التواصل معنا.",
    contact: "تواصل معنا",
    faq: "الأسئلة الشائعة",
    about: "من نحن",
    noteTitle: "ملاحظة",
    note1:
      "قد تُحدَّث هذه الشروط من وقت لآخر حسب تطوير المنصة أو تغيير الخدمات المستخدمة.",
    note2:
      "استمرارك في استخدام المنصة بعد نشر التعديلات يعني قبولك للنسخة المحدثة من الشروط.",
    verse: "﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ ﴾",
    verseSource: "سورة المائدة — الآية 1",
    hadith: "الْمُسْلِمُونَ عَلَى شُرُوطِهِمْ",
    hadithSource: "رواه أبو داود والحاكم وصححه",
    sectionsCount: "بند",
    languagesCount: "لغتان",
    lastUpdateLabel: "آخر تحديث",
    freeAlways: "مجاني دائماً",
    ctaTitle: "هل عندك سؤال عن الشروط؟",
    ctaDesc:
      "نرحب بملاحظاتك واستفساراتك، ونحاول توضيح أي بند يحتاج إلى شرح.",
  },
  en: {
    title: "Terms and Conditions",
    subtitle: "Rules for using the Ismail Ahmed Naguib Dawah Platform",
    home: "Home",
    description:
      "Terms and conditions page for the Ismail Ahmed Naguib Dawah Platform. It explains usage rules, content rights, religious notices, responsibilities, and change policy.",
    quickNav: "Quick navigation",
    lastUpdated: "Last updated",
    introTitle: "Introduction",
    introText:
      "These terms govern the use of the Ismail Ahmed Naguib Dawah Platform. The goal is to protect users, maintain content quality, and ensure the platform is used in a beneficial and disciplined manner.",
    sectionsTitle: "Terms Sections",
    relatedTitle: "Related links",
    relatedDesc: "Pages that help you understand the platform and contact us.",
    contact: "Contact Us",
    faq: "FAQ",
    about: "About",
    noteTitle: "Notice",
    note1:
      "These terms may be updated from time to time according to platform development or service changes.",
    note2:
      "Continued use of the platform after changes are published means acceptance of the updated terms.",
    verse: "\"O you who have believed, fulfill [all] contracts.\"",
    verseSource: "Surah Al-Ma'idah — Verse 1",
    hadith: "Muslims are bound by their conditions.",
    hadithSource: "Narrated by Abu Dawud and Al-Hakim",
    sectionsCount: "Sections",
    languagesCount: "Languages",
    lastUpdateLabel: "Last Update",
    freeAlways: "Always Free",
    ctaTitle: "Have a question about the terms?",
    ctaDesc:
      "We welcome your feedback and questions, and we try to clarify any provision that needs explanation.",
  },
};

// ============================================================
// بنود الشروط
// ============================================================

const SECTIONS: TermsSection[] = [
  {
    id: "acceptance",
    icon: "📜",
    title: { ar: "قبول الشروط", en: "Acceptance of Terms" },
    paragraphs: [
      {
        ar: "باستخدامك لهذه المنصة، فإنك تقر بأنك قد قرأت هذه الشروط وفهمتها، وتوافق على الالتزام بها.",
        en: "By using this platform, you acknowledge that you have read and understood these terms and agree to comply with them.",
      },
      {
        ar: "إذا كنت لا توافق على أي بند من بنود هذه الشروط، فيُرجى عدم استخدام المنصة.",
        en: "If you do not agree with any provision of these terms, please do not use the platform.",
      },
    ],
  },
  {
    id: "platform-use",
    icon: "🌐",
    title: { ar: "استخدام المنصة", en: "Use of the Platform" },
    paragraphs: [
      {
        ar: "تُقدَّم المنصة لأغراض تعليمية ودعوية وإعلامية نابعة من المحتوى الإسلامي العام. ويحق للمشرف عليها تطوير الأقسام أو تعديلها أو إيقافها في أي وقت.",
        en: "The platform is provided for educational, dawah, and general Islamic media purposes. The administrator reserves the right to develop, modify, or discontinue sections at any time.",
      },
      {
        ar: "يُسمح باستخدام المحتوى الشخصي والقراءة والاستماع والتصفح، مع الالتزام بعدم إساءة استخدام الخدمة أو تعطيلها.",
        en: "Personal use, reading, listening, and browsing are permitted, provided that the service is not abused or disrupted.",
      },
    ],
    bullets: [
      { ar: "استخدم المنصة بطريقة مشروعة ونافعة.", en: "Use the platform in a lawful and beneficial manner." },
      { ar: "لا تحاول اختراق الموقع أو اختبار ثغراته بدون إذن.", en: "Do not attempt to hack the site or test vulnerabilities without permission." },
      { ar: "لا تستخدم أدوات آلية تسبب حملًا غير طبيعي على الخوادم.", en: "Do not use automated tools that cause abnormal load on servers." },
    ],
  },
  {
    id: "acceptable-use",
    icon: "✅",
    title: { ar: "الاستخدام المقبول", en: "Acceptable Use" },
    paragraphs: [
      {
        ar: "نرحب باستخدام المنصة للتعلم، والتذكير، ونشر الخير، وإعداد المواد الدعوية البسيطة، بشرط ذكر المصدر والالتزام بأمانة النقل.",
        en: "We encourage using the platform for learning, reminder, spreading good, and preparing simple dawah materials, provided the source is mentioned and transmission remains trustworthy.",
      },
      {
        ar: "يجب أن يكون الاستخدام متوافقًا مع تعاليم الإسلام، والآداب العامة، والأنظمة المعمول بها في بلد المستخدم.",
        en: "Use must comply with Islamic teachings, public ethics, and applicable laws in the user's country.",
      },
    ],
    bullets: [
      { ar: "يُسمح بالاقتباس مع ذكر المصدر.", en: "Quoting is allowed with attribution." },
      { ar: "يُسمح بمشاركة الروابط المفيدة.", en: "Sharing useful links is allowed." },
      { ar: "يُسمح باستخدام المحتوى في التعليم الشخصي أو الأسري.", en: "Using content for personal or family education is allowed." },
    ],
  },
  {
    id: "content-rights",
    icon: "✍️",
    title: { ar: "المحتوى وحقوق النشر", en: "Content and Copyright" },
    paragraphs: [
      {
        ar: "المحتوى الأصلي في المنصة مملوك للمشرف أو مرخص له به، ولا يعني توفره للاستخدام العام أنه يجوز نسخه تجاريًا أو إدعاؤه كملكية شخصية.",
        en: "Original content on the platform is owned by the administrator or licensed to it. Its public availability does not permit commercial copying or claiming it as personal ownership.",
      },
      {
        ar: "النصوص القرآنية والأحاديث والمراجع ملك لأهلها، ويجب احترام سياقها ومصادرها عند النقل.",
        en: "Quranic texts, hadiths, and references belong to their authorities, and their context and sources must be respected when transmitting them.",
      },
    ],
    bullets: [
      { ar: "لا تُزل إشارة المصدر عند النشر.", en: "Do not remove source attribution when publishing." },
      { ar: "لا تُحرّف النصوص عن معناها الشرعي.", en: "Do not distort texts from their Islamic meaning." },
      { ar: "لا تبع المحتوى الأصلي مباشرة أو ضمن حزمة مدفوعة بدون إذن.", en: "Do not sell original content directly or within a paid package without permission." },
    ],
  },
  {
    id: "religious-notice",
    icon: "⚖️",
    title: { ar: "تنبيه شرعي ومعلوماتي", en: "Religious and Informational Notice" },
    paragraphs: [
      {
        ar: "المحتوى المنشور في المنصة هو للتوعية العامة والتبسيط التعليمي، ولا يُعد فتوى رسمية في النوازل أو المسائل الدقيقة.",
        en: "Content published on the platform is for general awareness and educational simplification, and is not an official fatwa for unusual or detailed matters.",
      },
      {
        ar: "في مسائل الدين الدقيقة، أو الطب، أو القانون، أو الأسرة، أو المعاملات المالية المعقدة، يجب مراجعة أهل العلم أو الجهات المختصة.",
        en: "In precise religious matters, medicine, law, family issues, or complex financial transactions, qualified scholars or competent authorities must be consulted.",
      },
    ],
    bullets: [
      { ar: "لا تعتمد على صفحة واحدة في حكم شرعي شامل.", en: "Do not rely on a single page for a comprehensive religious ruling." },
      { ar: "راجع الفتاوى مع سياق السؤال وحال المستفتي.", en: "Review fatwas together with the question context and the asker's condition." },
      { ar: "المحتوى الطبي لا يغني عن الطبيب.", en: "Medical-related content does not replace a doctor." },
    ],
  },
  {
    id: "accounts",
    icon: "👤",
    title: { ar: "الحسابات والتسجيل", en: "Accounts and Registration" },
    paragraphs: [
      {
        ar: "المنصة الحالية تتيح تصفح معظم المحتوى بدون حساب. وإذا أُضيفت ميزات حساب مستقبلًا، فيجب تقديم بيانات صحيحة والاحتفاظ ببيانات الدخول بأمان.",
        en: "The current platform allows browsing most content without an account. If account features are added in the future, accurate information must be provided and login credentials kept secure.",
      },
      {
        ar: "أنت مسؤول عن النشاط الذي يتم عبر حسابك إذا وُجد، ويجب إبلاغنا عن أي استخدام غير مصرح به.",
        en: "You are responsible for activity under your account, if any, and must notify us of unauthorized use.",
      },
    ],
  },
  {
    id: "user-submissions",
    icon: "💬",
    title: { ar: "ما ترسله إلينا", en: "What You Send Us" },
    paragraphs: [
      {
        ar: "عند إرسال سؤال أو ملاحظة أو اقتراح عبر نموذج التواصل، فإنك تمنحنا حق استخدام هذه المعلومات لتحسين المحتوى أو الرد عليك، مع عدم نشر بياناتك الشخصية بدون سبب مشروع.",
        en: "When sending a question, note, or suggestion through the contact form, you grant us the right to use that information to improve content or reply to you, without publishing your personal data without a lawful reason.",
      },
      {
        ar: "يُرجى عدم إرسال بيانات حساسة مثل كلمات المرور أو معلومات مالية أو طبية خاصة عبر النموذج.",
        en: "Please do not send sensitive data such as passwords, financial information, or private medical details through the form.",
      },
    ],
  },
  {
    id: "external-services",
    icon: "🔗",
    title: { ar: "الروابط والخدمات الخارجية", en: "External Links and Services" },
    paragraphs: [
      {
        ar: "قد تحتوي المنصة على روابط خارجية أو تعتمد على خدمات خارجية مثل الاستضافة، أو قواعد البيانات، أو واجهات القرآن، أو مواقيت الصلاة، أو إرسال البريد.",
        en: "The platform may contain external links or rely on external services such as hosting, databases, Quran APIs, prayer-time APIs, or email delivery.",
      },
      {
        ar: "نحن لا نتحكم في محتوى الأطراف الثالثة ولا في سياساتها، لذا يُنصح بمراجعة شروطها وسياساتها الخاصة.",
        en: "We do not control third-party content or policies, so reviewing their own terms and policies is recommended.",
      },
    ],
  },
  {
    id: "privacy-link",
    icon: "🔒",
    title: { ar: "العلاقة بسياسة الخصوصية", en: "Relationship with Privacy Policy" },
    paragraphs: [
      {
        ar: "تكمّل هذه الشروط سياسة الخصوصية. فبينما تنظم الشروط طريقة الاستخدام، توضح سياسة الخصوصية كيفية التعامل مع البيانات.",
        en: "These terms complement the privacy policy. While terms govern usage, the privacy policy explains how data is handled.",
      },
      {
        ar: "معظم أدوات التقدم مثل المسبحة وخطة الحفظ والورد اليومي تُحفظ محليًا على جهاز المستخدم ما دام ذلك ممكنًا.",
        en: "Most progress tools such as tasbih, memorization plan, and daily wird are stored locally on the user's device whenever possible.",
      },
    ],
  },
  {
    id: "prohibited-use",
    icon: "🚫",
    title: { ar: "الاستخدامات الممنوعة", en: "Prohibited Uses" },
    paragraphs: [
      {
        ar: "يُمنع استخدام المنصة في أي غرض مخالف للشريعة أو النظام أو الآداب العامة.",
        en: "Using the platform for any purpose contrary to Sharia, law, or public ethics is prohibited.",
      },
    ],
    bullets: [
      { ar: "نشر الفتاوى بغير أهلية أو تحريف النصوص.", en: "Issuing fatwas without qualification or distorting texts." },
      { ar: "السبام أو الرسائل الجماعية المضللة.", en: "Spam or misleading mass messages." },
      { ar: "انتحال شخصية المشرف أو الجهات الرسمية.", en: "Impersonating the administrator or official entities." },
      { ar: "تنزيل المحتوى بكميات كبيرة لأغراض تجارية غير مصرح بها.", en: "Bulk downloading content for unauthorized commercial purposes." },
      { ar: "إيذاء المستخدمين أو التحرش أو نشر الكراهية.", en: "Harming users, harassment, or spreading hatred." },
      { ar: "إدخال برمجيات خبيثة أو محاولة تعطيل الخدمة.", en: "Introducing malicious software or attempting to disrupt the service." },
    ],
  },
  {
    id: "availability",
    icon: "🛠️",
    title: { ar: "توفر الخدمة والتغييرات", en: "Service Availability and Changes" },
    paragraphs: [
      {
        ar: "نبذل الجهد للحفاظ على استمرار المنصة وتحديثها، لكن لا نضمن أن الخدمة ستكون متاحة دائمًا بدون انقطاع أو خطأ.",
        en: "We strive to keep the platform available and updated, but we do not guarantee that the service will always be uninterrupted or error-free.",
      },
      {
        ar: "قد نضيف أقسامًا، أو نعدل تصميمًا، أو نوقف ميزة مؤقتًا أو دائمًا حسب المصلحة.",
        en: "We may add sections, modify design, or temporarily or permanently discontinue a feature according to benefit.",
      },
    ],
  },
  {
    id: "termination",
    icon: "⏹️",
    title: { ar: "إنهاء الاستخدام", en: "Termination of Use" },
    paragraphs: [
      {
        ar: "يحق للمشرف تقييد أو إيقاف الوصول إلى المنصة في حال ثبوت إساءة استخدام واضحة، أو مخالفة جوهرية لهذه الشروط.",
        en: "The administrator may restrict or suspend access to the platform if clear misuse or a material violation of these terms is established.",
      },
      {
        ar: "يمكن للمستخدم التوقف عن استخدام المنصة في أي وقت.",
        en: "The user may stop using the platform at any time.",
      },
    ],
  },
  {
    id: "changes",
    icon: "🔄",
    title: { ar: "تعديل الشروط", en: "Changes to Terms" },
    paragraphs: [
      {
        ar: "قد نحدّث هذه الشروط عند إضافة ميزات جديدة، أو تغيير خدمات خارجية، أو تحسين الحماية، أو تصحيح صياغة.",
        en: "We may update these terms when adding new features, changing external services, improving protection, or correcting wording.",
      },
      {
        ar: "سيتم تحديث تاريخ آخر تعديل في أعلى هذه الصفحة.",
        en: "The last update date at the top of this page will be revised.",
      },
    ],
  },
  {
    id: "law",
    icon: "🏛️",
    title: { ar: "القانون والنزاعات", en: "Law and Disputes" },
    paragraphs: [
      {
        ar: "يخضع استخدام المنصة للقوانين والأنظمة المعمول بها، مع مراعاة طبيعة المحتوى الدعوي والتعليمي.",
        en: "Use of the platform is subject to applicable laws and regulations, considering the dawah and educational nature of the content.",
      },
      {
        ar: "في حال وجود ملاحظة أو نزاع، نفضل الحل الودي عبر التواصل، ثم عبر القنوات النظامية إن لزم.",
        en: "In case of a concern or dispute, amicable resolution through contact is preferred, then legal channels if necessary.",
      },
    ],
  },
  {
    id: "contact",
    icon: "📬",
    title: { ar: "التواصل بخصوص الشروط", en: "Contact Regarding Terms" },
    paragraphs: [
      {
        ar: "إذا كان لديك سؤال حول بند من هذه الشروط، أو أردت إذنًا لاستخدام معين، يرجى التواصل معنا عبر صفحة تواصل معنا.",
        en: "If you have a question about any provision of these terms or need permission for a specific use, please contact us through the Contact Us page.",
      },
      {
        ar: "نسعى للرد في أقرب وقت ممكن، مع الحفاظ على احترام المستخدم وخصوصيته.",
        en: "We aim to reply as soon as possible while respecting the user and their privacy.",
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
      ar: "لإرسال سؤال أو طلب بخصوص الشروط.",
      en: "To send a question or request regarding the terms.",
    },
  },
  {
    id: "privacy",
    href: "/privacy",
    icon: "🔐",
    title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    description: {
      ar: "كيف نتعامل مع بياناتك عند استخدام المنصة.",
      en: "How we handle your data when using the platform.",
    },
  },
  {
    id: "faq",
    href: "/faq",
    icon: "❓",
    title: { ar: "الأسئلة الشائعة", en: "FAQ" },
    description: {
      ar: "إجابات سريعة عن استخدام المنصة.",
      en: "Quick answers about using the platform.",
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
      canonical: `/${l}/terms`,
      languages: {
        ar: "/ar/terms",
        en: "/en/terms",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/terms`,
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

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: ui.title,
        description: ui.description,
        inLanguage: l,
        url: `/${l}/terms`,
        dateModified: LAST_UPDATED_ISO,
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: isRTL ? "هل المحتوى مجاني؟" : "Is the content free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isRTL
                ? "نعم، جميع محتوى المنصة مجاني بالكامل، ولا توجد اشتراكات أو مدفوعات."
                : "Yes, all platform content is completely free, with no subscriptions or payments.",
            },
          },
          {
            "@type": "Question",
            name: isRTL ? "هل يمكنني استخدام المحتوى في الدعوة؟" : "Can I use the content for dawah?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isRTL
                ? "نعم، يُسمح باستخدام المحتوى للدعوة والتعليم مع ذكر المصدر وعدم تحريف النصوص عن معناها الشرعي."
                : "Yes, content may be used for dawah and education with source attribution and without distorting texts from their Islamic meaning.",
            },
          },
          {
            "@type": "Question",
            name: isRTL ? "كيف أبلغ عن مخالفة؟" : "How do I report a violation?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isRTL
                ? "يمكنك التواصل معنا عبر صفحة التواصل ووصف المخالفة بوضوح، وسنعالج البلاغ في أقرب وقت."
                : "You can contact us through the contact page and clearly describe the violation, and we will handle the report as soon as possible.",
            },
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
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">
              📜 {isRTL ? PLATFORM_NAME.ar : PLATFORM_NAME.en}
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

            {/* حديث شريف */}
            <div className="mt-4 rounded-2xl border border-primary-200 bg-primary-50/60 p-4 backdrop-blur-sm dark:border-primary-800 dark:bg-primary-950/20">
              <p
                className="mb-1 text-base font-black text-primary-700 md:text-lg dark:text-primary-300"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                «{ui.hadith}»
              </p>
              <p className="text-xs text-primary-600 dark:text-primary-400">
                📜 {ui.hadithSource}
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
          <StatCard icon="🌍" label={ui.languagesCount} value={2} color="gold" />
          <StatCard
            icon="📅"
            label={ui.lastUpdateLabel}
            value={formatDate(LAST_UPDATED_ISO, l)}
            color="primary"
            isSmall
          />
          <StatCard icon="✨" label={ui.freeAlways} value="100%" color="gold" />
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

        {/* ===== بنود الشروط ===== */}
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
        <div className="card mb-8 p-6 md:p-8">
          <h2
            className="mb-2 text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.relatedTitle}
          </h2>

          <p className="mb-6 leading-relaxed text-slate-500 dark:text-slate-400">
            {ui.relatedDesc}
          </p>

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

        {/* ===== CTA ===== */}
        <div className="card relative mb-8 overflow-hidden p-8 text-center md:p-10">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <h2
            className="mb-3 text-2xl font-black text-slate-900 md:text-3xl dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.ctaTitle}
          </h2>

          <p className="mx-auto mb-7 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">
            {ui.ctaDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={`/${l}/contact`} className="btn-primary">
              {ui.contact}
            </Link>
            <Link href={`/${l}/faq`} className="btn-outline">
              {ui.faq}
            </Link>
            <Link href={`/${l}/about`} className="btn-outline">
              {ui.about}
            </Link>
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