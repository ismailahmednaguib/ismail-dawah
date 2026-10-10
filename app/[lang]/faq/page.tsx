// app/[lang]/faq/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import { faqJsonLd } from "@/lib/seo";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ============================================================
// الأنواع
// ============================================================

type FaqCategory = {
  id: string;
  ar: string;
  en: string;
  icon: string;
};

type FaqItem = {
  id: string;
  categoryId: string;
  question: { ar: string; en: string };
  answer: { ar: string; en: string };
};

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
};

// ============================================================
// الفئات
// ============================================================

const CATEGORIES: FaqCategory[] = [
  { id: "all", ar: "كل الأسئلة", en: "All Questions", icon: "📚" },
  { id: "general", ar: "عن المنصة", en: "About Platform", icon: "🌐" },
  { id: "account", ar: "الحساب والتسجيل", en: "Account & Registration", icon: "👤" },
  { id: "content", ar: "المحتوى والفتاوى", en: "Content & Fatwas", icon: "📖" },
  { id: "technical", ar: "التقنية والأداء", en: "Technical & Performance", icon: "⚙️" },
  { id: "privacy", ar: "الخصوصية والبيانات", en: "Privacy & Data", icon: "🔒" },
  { id: "dawah", ar: "الدعوة والتعاون", en: "Dawah & Collaboration", icon: "🤝" },
];

// ============================================================
// الأسئلة الشائعة
// ============================================================

const FAQS: FaqItem[] = [
  // ===== عن المنصة =====
  {
    id: "what-is-platform",
    categoryId: "general",
    question: {
      ar: "ما هي منصة إسماعيل أحمد نجيب؟",
      en: "What is the Ismail Ahmed Naguib platform?",
    },
    answer: {
      ar: "منصة إسلامية دعوية شاملة تجمع القرآن الكريم، والأذكار، والفتاوى، وقصص الأنبياء، ومواقيت الصلاة، واتجاه القبلة، والمسبحة، وخطة حفظ القرآن، وأدوات الدعوة في مكان واحد، بلغتين (العربية والإنجليزية)، وبتصميم متجاوب يعمل على الموبايل والتابلت والكمبيوتر.",
      en: "A comprehensive Islamic dawah platform that brings together the Quran, adhkar, fatwas, prophets' stories, prayer times, Qibla direction, digital tasbih, Quran memorization plan, and dawah tools in one place, in two languages (Arabic and English), with a responsive design that works on mobile, tablet, and desktop.",
    },
  },
  {
    id: "why-built",
    categoryId: "general",
    question: {
      ar: "لماذا تم إنشاء هذه المنصة؟",
      en: "Why was this platform built?",
    },
    answer: {
      ar: "لأن كثير من الباحثين عن العلم الشرعي يتوهون بين مصادر مشتتة أو محتوى غير منظم. المنصة جاءت لتكون مكانًا واحدًا جامعًا: سهل، سريع، محترم لوقت المستخدم، ومدعوم بالترجمة، بحيث يخدم المسلم الجديد، وطالب العلم، والداعية، والعائلة المسلمة.",
      en: "Many seekers of Islamic knowledge get lost between scattered sources or poorly organized content. This platform was built to be one unified place: simple, fast, respectful of the user's time, and translation-ready, serving new Muslims, students of knowledge, da'ees, and Muslim families.",
    },
  },
  {
    id: "is-free",
    categoryId: "general",
    question: {
      ar: "هل استخدام المنصة مجاني؟",
      en: "Is the platform free to use?",
    },
    answer: {
      ar: "نعم، كل محتوى المنصة مجاني بالكامل، بدون اشتراك، بدون إعلانات مزاحمة، وبدون تسجيل إجباري. بعض الميزات مثل حفظ التقدم تعمل محليًا على جهازك بدون الحاجة لحساب.",
      en: "Yes, all content on the platform is completely free — no subscription, no intrusive ads, and no mandatory registration. Some features like progress tracking work locally on your device without needing an account.",
    },
  },
  {
    id: "languages",
    categoryId: "general",
    question: {
      ar: "ما اللغات المدعومة حاليًا؟",
      en: "Which languages are currently supported?",
    },
    answer: {
      ar: "حاليًا المنصة تدعم اللغتين العربية والإنجليزية، مع تخطيط لإضافة لغات أخرى مثل الفرنسية والأردية والتركية حسب الأولوية والطلب.",
      en: "Currently, the platform supports Arabic and English, with plans to add more languages such as French, Urdu, and Turkish based on priority and demand.",
    },
  },

  // ===== الحساب والتسجيل =====
  {
    id: "need-account",
    categoryId: "account",
    question: {
      ar: "هل أحتاج إلى إنشاء حساب لاستخدام المنصة؟",
      en: "Do I need an account to use the platform?",
    },
    answer: {
      ar: "لا، يمكنك تصفح كل المحتوى بدون حساب. الحساب اختياري ويفيدك في ميزات مثل: مزامنة التقدم بين الأجهزة، الاشتراك في النشرة البريدية، وحفظ الفتاوى والمقالات المفضلة.",
      en: "No, you can browse all content without an account. An account is optional and useful for features like: syncing progress across devices, subscribing to the newsletter, and saving favorite fatwas and articles.",
    },
  },
  {
    id: "how-register",
    categoryId: "account",
    question: {
      ar: "كيف أسجل حسابًا جديدًا؟",
      en: "How do I register a new account?",
    },
    answer: {
      ar: "اضغط على زر \"تسجيل\" في أعلى الصفحة، أدخل اسمك وبريدك الإلكتروني وكلمة مرور قوية، ثم أكمل عملية التحقق من بريدك الإلكتروني لو طُلب منك ذلك.",
      en: "Click the \"Register\" button at the top of the page, enter your name, email, and a strong password, then complete the email verification step if prompted.",
    },
  },
  {
    id: "forgot-password",
    categoryId: "account",
    question: {
      ar: "نسيت كلمة المرور، ماذا أفعل؟",
      en: "I forgot my password, what should I do?",
    },
    answer: {
      ar: "اضغط على \"نسيت كلمة المرور\" في صفحة تسجيل الدخول، وأدخل بريدك الإلكتروني. ستصلك رسالة تحتوي على رابط لإعادة تعيين كلمة المرور. الرابط صالح لمدة ساعة واحدة فقط.",
      en: "Click \"Forgot password\" on the login page and enter your email. You will receive a message containing a link to reset your password. The link is valid for one hour only.",
    },
  },
  {
    id: "delete-account",
    categoryId: "account",
    question: {
      ar: "هل يمكنني حذف حسابي؟",
      en: "Can I delete my account?",
    },
    answer: {
      ar: "نعم، يمكنك طلب حذف حسابك وجميع بياناتك المرتبطة به عبر صفحة \"تواصل معنا\". نعالج طلبات الحذف خلال مدة قصيرة، ونحذف البيانات نهائيًا من قواعد البيانات.",
      en: "Yes, you can request deletion of your account and all associated data through the \"Contact Us\" page. Deletion requests are processed within a short period, and data is permanently removed from our databases.",
    },
  },

  // ===== المحتوى والفتاوى =====
  {
    id: "fatwa-source",
    categoryId: "content",
    question: {
      ar: "من أين تأتي الفتاوى المعروضة؟",
      en: "Where do the displayed fatwas come from?",
    },
    answer: {
      ar: "الفتاوى المعروضة في القسم التوعوي هي إجابات مختصرة مبنية على القرآن والسنة وفهم السلف الصالح، وهي للتوعية العامة. في النوازل والمسائل الدقيقة، يجب مراجعة أهل العلم المختصين أو الجهات الرسمية للإفتاء في بلدك.",
      en: "The fatwas shown in the awareness section are concise answers based on the Quran, Sunnah, and the understanding of the Salaf. They are for general awareness. For unusual or detailed matters, you must consult qualified scholars or official fatwa authorities in your country.",
    },
  },
  {
    id: "quran-source",
    categoryId: "content",
    question: {
      ar: "ما مصدر نص القرآن الكريم والتلاوات الصوتية؟",
      en: "What is the source of the Quran text and audio recitations?",
    },
    answer: {
      ar: "نص القرآن معروض بالرسم العثماني، والتلاوات الصوتية تأتي من مصادر عامة موثوقة مثل AlQuran Cloud. نسعى دائمًا لتوفير نسخ محلية أوفلاين لتحسين الأداء والاستقرار.",
      en: "The Quran text is displayed in Uthmani script, and audio recitations come from reliable public sources such as AlQuran Cloud. We are continuously working to provide offline local copies for better performance and stability.",
    },
  },
  {
    id: "suggest-content",
    categoryId: "content",
    question: {
      ar: "هل يمكنني اقتراح محتوى أو سؤال؟",
      en: "Can I suggest content or ask a question?",
    },
    answer: {
      ar: "بالتأكيد. نرحب بكل الاقتراحات والأسئلة عبر صفحة \"تواصل معنا\". نراجع الرسائل دوريًا، ونحاول إضافة ما يفيد المستخدمين مع الالتزام بالمنهج الشرعي الصحيح.",
      en: "Absolutely. We welcome all suggestions and questions through the \"Contact Us\" page. Messages are reviewed periodically, and we try to add what benefits users while adhering to the correct Islamic methodology.",
    },
  },
  {
    id: "report-error",
    categoryId: "content",
    question: {
      ar: "وجدت خطأً في المحتوى، كيف أبلغ عنه؟",
      en: "I found an error in the content, how do I report it?",
    },
    answer: {
      ar: "نقدّر جدًا بلاغات التصحيح. أرسل لنا عبر صفحة \"تواصل معنا\" مع ذكر: اسم الصفحة، رابط الخطأ، ووصف المشكلة. نراجع البلاغ ونصححه في أقرب وقت.",
      en: "We greatly appreciate correction reports. Send us a message through the \"Contact Us\" page including: the page name, the error link, and a description of the issue. We review and fix it as soon as possible.",
    },
  },

  // ===== التقنية والأداء =====
  {
    id: "offline",
    categoryId: "technical",
    question: {
      ar: "هل تعمل المنصة بدون إنترنت؟",
      en: "Does the platform work offline?",
    },
    answer: {
      ar: "نعم، المنصة مبنية كتطبيق ويب تقدمي (PWA). بعد أول زيارة، يتم تخزين الصفحات والمحتوى الأساسي محليًا، فيمكنك تصفح الأذكار والفتاوى والقصص بدون اتصال. القرآن الصوتي يحتاج اتصالًا في النسخة الحالية.",
      en: "Yes, the platform is built as a Progressive Web App (PWA). After the first visit, pages and core content are cached locally, so you can browse adhkar, fatwas, and stories offline. Audio Quran still requires a connection in the current version.",
    },
  },
  {
    id: "install-app",
    categoryId: "technical",
    question: {
      ar: "كيف أثبّت المنصة كتطبيق على هاتفي؟",
      en: "How do I install the platform as an app on my phone?",
    },
    answer: {
      ar: "افتح الموقع في متصفح Chrome على أندرويد أو Safari على iOS، ثم اختر \"إضافة إلى الشاشة الرئيسية\" أو \"Install App\". سيظهر أيقونة المنصة بين تطبيقاتك وتفتح بملء الشاشة.",
      en: "Open the site in Chrome on Android or Safari on iOS, then choose \"Add to Home Screen\" or \"Install App\". The platform icon will appear among your apps and open in full screen.",
    },
  },
  {
    id: "dark-mode",
    categoryId: "technical",
    question: {
      ar: "كيف أفعّل الوضع الليلي؟",
      en: "How do I enable dark mode?",
    },
    answer: {
      ar: "اضغط على أيقونة الشمس/القمر في الهيدر. المنصة تحفظ اختيارك محليًا، وتتبع أيضًا تفضيل نظام تشغيلك تلقائيًا عند أول زيارة.",
      en: "Click the sun/moon icon in the header. The platform saves your choice locally and also follows your operating system preference automatically on first visit.",
    },
  },
  {
    id: "slow-site",
    categoryId: "technical",
    question: {
      ar: "الموقع بطيء عندي، ماذا أفعل؟",
      en: "The site is slow for me, what should I do?",
    },
    answer: {
      ar: "جرب الآتي: حدّث الصفحة، امسح كاش المتصفح، تأكد من جودة الاتصال، أو افتح الموقع في نافذة تصفح خاص. المنصة محسّنة للسرعة، لكن بعض الموارد الخارجية مثل التلاوات الصوتية تعتمد على اتصالك.",
      en: "Try the following: refresh the page, clear browser cache, check your connection quality, or open the site in a private window. The platform is optimized for speed, but some external resources like audio recitations depend on your connection.",
    },
  },

  // ===== الخصوصية والبيانات =====
  {
    id: "data-collected",
    categoryId: "privacy",
    question: {
      ar: "ما البيانات التي تجمعها المنصة عني؟",
      en: "What data does the platform collect about me?",
    },
    answer: {
      ar: "نجمع الحد الأدنى فقط: إذا أنشأت حسابًا، نخزن اسمك وبريدك. التقدم في الأذكار والمسبحة والخطة يُحفظ محليًا على جهازك ولا يُرسل إلينا. نستخدم تحليلات مبسطة لعدد الزيارات بدون ربطها بهويتك.",
      en: "We collect the minimum only: if you create an account, we store your name and email. Progress in adhkar, tasbih, and memorization plan is saved locally on your device and is not sent to us. We use simple analytics for visit counts without linking them to your identity.",
    },
  },
  {
    id: "cookies",
    categoryId: "privacy",
    question: {
      ar: "هل تستخدمون ملفات تعريف الارتباط (Cookies)؟",
      en: "Do you use cookies?",
    },
    answer: {
      ar: "نعم، نستخدم cookies ضرورية فقط لحفظ الجلسة وتفضيلات اللغة والوضع الليلي. لا نستخدم cookies إعلانية ولا نتتبعك عبر مواقع أخرى.",
      en: "Yes, we use only essential cookies to store session, language preference, and dark mode. We do not use advertising cookies and do not track you across other websites.",
    },
  },
  {
    id: "third-party",
    categoryId: "privacy",
    question: {
      ar: "هل تشاركون بياناتي مع أطراف ثالثة؟",
      en: "Do you share my data with third parties?",
    },
    answer: {
      ar: "لا نبيع بياناتك ولا نشاركها مع جهات إعلانية. قد نستخدم خدمات موثوقة مثل Supabase للتخزين وVercel للاستضافة وResend للإيميلات، وهذه الجهات ملتزمة بحماية البيانات وفق سياساتها.",
      en: "We do not sell your data or share it with advertisers. We may use trusted services such as Supabase for storage, Vercel for hosting, and Resend for emails, and these providers are committed to data protection under their policies.",
    },
  },
  {
    id: "children",
    categoryId: "privacy",
    question: {
      ar: "هل المنصة مناسبة للأطفال؟",
      en: "Is the platform suitable for children?",
    },
    answer: {
      ar: "المحتوى العام مناسب لجميع الأعمار. لكننا لا نجمع بيانات الأطفال عمدًا، وننصح أولياء الأمور بمتابعة استخدام أبنائهم لأي موقع، بما في ذلك هذا الموقع.",
      en: "The general content is suitable for all ages. However, we do not intentionally collect children's data, and we advise parents to supervise their children's use of any website, including this one.",
    },
  },

  // ===== الدعوة والتعاون =====
  {
    id: "use-content",
    categoryId: "dawah",
    question: {
      ar: "هل يمكنني استخدام محتوى المنصة في الدعوة؟",
      en: "Can I use the platform's content for dawah?",
    },
    answer: {
      ar: "نعم، نرحب جدًا بنشر المحتوى في سبيل الله. يُرجى فقط ذكر المصدر ووضع رابط المنصة عند الاقتباس، وعدم تعديل المعنى بحيث يخرج عن السياق الشرعي الصحيح.",
      en: "Yes, we warmly encourage sharing the content for the sake of Allah. Please only mention the source and include a link to the platform when quoting, and do not alter the meaning so that it leaves the correct Islamic context.",
    },
  },
  {
    id: "collaborate",
    categoryId: "dawah",
    question: {
      ar: "أنا داعية/مؤسسة، كيف أتعاون معكم؟",
      en: "I am a da'ee/institution, how can I collaborate?",
    },
    answer: {
      ar: "يسعدنا التعاون مع الدعاة والمؤسسات الدعوية في: إنتاج المحتوى، الترجمة، مراجعة الفتاوى، أو نشر الخطب والدروس. راسلنا عبر صفحة \"تواصل معنا\" مع نبذة عن جهة التعاون المقترح.",
      en: "We are pleased to collaborate with da'ees and dawah institutions in: content production, translation, fatwa review, or publishing sermons and lessons. Contact us through the \"Contact Us\" page with a brief about the proposed collaboration.",
    },
  },
  {
    id: "donate",
    categoryId: "dawah",
    question: {
      ar: "هل يمكنني التبرع لدعم المنصة؟",
      en: "Can I donate to support the platform?",
    },
    answer: {
      ar: "المنصة حاليًا تعمل بدون تبرعات، لكن ندعو الله أن يبارك في الجهود. لو أضفنا آلية دعم مستقبلًا، سنعلن عنها في الموقع ووسائل التواصل الرسمية.",
      en: "The platform currently operates without donations, but we ask Allah to bless all efforts. If we add a support mechanism in the future, we will announce it on the website and official social media.",
    },
  },
  {
    id: "translate",
    categoryId: "dawah",
    question: {
      ar: "أريد الترجمة إلى لغتي، كيف أساعد؟",
      en: "I want to translate into my language, how can I help?",
    },
    answer: {
      ar: "نرحب بالمتطوعين للترجمة. راسلنا عبر صفحة \"تواصل معنا\" مع ذكر: لغتك، مستوى إتقانك للعربية أو الإنجليزية، وعيّنة من ترجمتك السابقة إن وجدت. سنراجع ونضيفك لفريق الترجمة.",
      en: "We welcome volunteer translators. Contact us through the \"Contact Us\" page mentioning: your language, your proficiency level in Arabic or English, and a sample of your previous translation if available. We will review and add you to the translation team.",
    },
  },
];

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    home: string;
    description: string;
    searchPlaceholder: string;
    search: string;
    clearSearch: string;
    results: string;
    of: string;
    noResults: string;
    noResultsDesc: string;
    categoriesTitle: string;
    questionLabel: string;
    answerLabel: string;
    stillHaveQuestions: string;
    stillHaveQuestionsDesc: string;
    contactUs: string;
    note: string;
    verse: string;
    verseSource: string;
    totalQuestions: string;
    totalCategories: string;
    languages: string;
    alwaysUpdated: string;
    relatedTitle: string;
    aboutPage: string;
    aboutPageDesc: string;
    contactPage: string;
    contactPageDesc: string;
    privacyPage: string;
    privacyPageDesc: string;
    termsPage: string;
    termsPageDesc: string;
  }
> = {
  ar: {
    title: "الأسئلة الشائعة",
    subtitle: "إجابات مختصرة عن أكثر ما يسأل عنه الزوار",
    home: "الرئيسية",
    description:
      "صفحة الأسئلة الشائعة لمنصة إسماعيل أحمد نجيب الدعوية. تجد هنا إجابات عن المنصة، الحساب، المحتوى، التقنية، الخصوصية، والتعاون الدعوي.",
    searchPlaceholder: "ابحث في الأسئلة والإجابات...",
    search: "بحث",
    clearSearch: "مسح البحث",
    results: "عدد الأسئلة",
    of: "من",
    noResults: "لا توجد أسئلة مطابقة",
    noResultsDesc: "جرّب كلمة أخرى أو اختر فئة مختلفة، أو راسلنا مباشرة.",
    categoriesTitle: "تصنيفات الأسئلة",
    questionLabel: "السؤال",
    answerLabel: "الإجابة",
    stillHaveQuestions: "لم تجد إجابتك؟",
    stillHaveQuestionsDesc:
      "راسلنا وسنجيبك إن شاء الله في أقرب وقت ممكن.",
    contactUs: "تواصل معنا",
    note: "قد تُحدّث الإجابات دوريًا حسب المستجدات وتصحيحات أهل العلم.",
    verse: "﴿ فَاسْأَلُوا أَهْلَ الذِّكْرِ إِن كُنتُمْ لَا تَعْلَمُونَ ﴾",
    verseSource: "سورة النحل — الآية 43",
    totalQuestions: "سؤال",
    totalCategories: "تصنيف",
    languages: "لغتان",
    alwaysUpdated: "تحديث مستمر",
    relatedTitle: "صفحات ذات صلة",
    aboutPage: "من نحن",
    aboutPageDesc: "تعرّف على المنصة ورؤيتها.",
    contactPage: "تواصل معنا",
    contactPageDesc: "أرسل استفسارك مباشرة.",
    privacyPage: "سياسة الخصوصية",
    privacyPageDesc: "كيف نحمي بياناتك.",
    termsPage: "الشروط والأحكام",
    termsPageDesc: "قواعد استخدام المنصة.",
  },
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Concise answers to the most common visitor questions",
    home: "Home",
    description:
      "FAQ page for the Ismail Ahmed Naguib Dawah Platform. Find answers about the platform, account, content, technical topics, privacy, and dawah collaboration.",
    searchPlaceholder: "Search questions and answers...",
    search: "Search",
    clearSearch: "Clear search",
    results: "Questions",
    of: "of",
    noResults: "No matching questions",
    noResultsDesc: "Try another keyword, choose a different category, or contact us directly.",
    categoriesTitle: "Question Categories",
    questionLabel: "Question",
    answerLabel: "Answer",
    stillHaveQuestions: "Didn't find your answer?",
    stillHaveQuestionsDesc:
      "Contact us and we will reply, in sha Allah, as soon as possible.",
    contactUs: "Contact Us",
    note: "Answers may be updated periodically based on new developments and scholars' corrections.",
    verse: "\"So ask the people of the message if you do not know.\"",
    verseSource: "Surah An-Nahl — Verse 43",
    totalQuestions: "Questions",
    totalCategories: "Categories",
    languages: "Languages",
    alwaysUpdated: "Always Updated",
    relatedTitle: "Related Pages",
    aboutPage: "About Us",
    aboutPageDesc: "Learn about our platform and vision.",
    contactPage: "Contact Us",
    contactPageDesc: "Send your inquiry directly.",
    privacyPage: "Privacy Policy",
    privacyPageDesc: "How we protect your data.",
    termsPage: "Terms & Conditions",
    termsPageDesc: "Platform usage rules.",
  },
};

// ============================================================
// دوال مساعدة
// ============================================================

function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function formatNumber(value: number, lang: Lang): string {
  if (lang === "ar") {
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return String(value)
      .split("")
      .map((digit) => {
        const number = Number(digit);
        return Number.isFinite(number) ? arabicNumerals[number] : digit;
      })
      .join("");
  }
  return String(value);
}

function faqMatchesQuery(faq: FaqItem, query: string): boolean {
  if (!query) return true;
  const q = normalize(query);
  const haystack = [
    faq.question.ar,
    faq.question.en,
    faq.answer.ar,
    faq.answer.en,
  ];
  return haystack.some((text) => normalize(text).includes(q));
}

function buildFaqHref(
  lang: Lang,
  options: { q?: string; category?: string }
): string {
  const search = new URLSearchParams();
  if (options.q?.trim()) search.set("q", options.q.trim());
  if (options.category && options.category !== "all") search.set("category", options.category);
  const queryString = search.toString();
  return `/${lang}/faq${queryString ? `?${queryString}` : ""}`;
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
      canonical: `/${l}/faq`,
      languages: {
        ar: "/ar/faq",
        en: "/en/faq",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/faq`,
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

export default async function FaqPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const sp = await searchParams;
  const q = getFirstValue(sp.q).trim();
  const rawCategory = getFirstValue(sp.category);
  const category =
    rawCategory && CATEGORIES.some((item) => item.id === rawCategory)
      ? rawCategory
      : "all";

  const filteredFaqs = FAQS.filter((faq) => {
    if (category !== "all" && faq.categoryId !== category) return false;
    return faqMatchesQuery(faq, q);
  });

  const activeCategory =
    CATEGORIES.find((item) => item.id === category) ?? CATEGORIES[0];

  // JSON-LD لكل الأسئلة (مش المفلترة) عشان SEO ثابت
  const faqJsonLdData = faqJsonLd(
    FAQS.map((faq) => ({
      question: faq.question.ar,
      answer: faq.answer.ar,
    }))
  );

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      {/* ===== JSON-LD للأسئلة الشائعة ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLdData),
        }}
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
        <div className="card relative mb-8 overflow-hidden p-8 md:p-12">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">
              ❓ {isRTL ? "الأسئلة الشائعة" : "FAQ"}
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
            <div className="mt-8 rounded-2xl border border-gold-200 bg-gold-50/60 p-5 dark:border-gold-900/30 dark:bg-gold-950/15">
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
          </div>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="❓" label={ui.totalQuestions} value={FAQS.length} color="primary" />
          <StatCard icon="📂" label={ui.totalCategories} value={CATEGORIES.length - 1} color="gold" />
          <StatCard icon="🌍" label={ui.languages} value={2} color="primary" />
          <StatCard icon="🔄" label={ui.alwaysUpdated} value="✓" color="gold" />
        </div>

        {/* ===== بطاقة البحث ===== */}
        <div className="card mb-8 p-6 md:p-7">
          <form
            method="get"
            action={`/${l}/faq`}
            className="grid gap-4 md:grid-cols-[1fr_auto]"
          >
            <input
              type="hidden"
              name="category"
              value={category === "all" ? "" : category}
            />

            <div className="relative">
              <svg
                className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>

              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder={ui.searchPlaceholder}
                className="input-islamic !ps-12"
                aria-label={ui.searchPlaceholder}
              />
            </div>

            <button type="submit" className="btn-primary whitespace-nowrap">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              {ui.search}
            </button>
          </form>

          {(q || category !== "all") && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {category !== "all" && (
                <span className="badge-primary">
                  {activeCategory.icon}{" "}
                  {isRTL ? activeCategory.ar : activeCategory.en}
                </span>
              )}

              {q && <span className="badge-gold">"{q}"</span>}

              <Link
                href={`/${l}/faq`}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
                {ui.clearSearch}
              </Link>
            </div>
          )}
        </div>

        {/* ===== الفئات ===== */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {ui.categoriesTitle}
          </h2>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => {
              const isActive = item.id === category;
              const href = buildFaqHref(l, { q, category: item.id });

              return (
                <Link
                  key={item.id}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{isRTL ? item.ar : item.en}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ===== عدد النتائج ===== */}
        <p className="mb-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {ui.results}:{" "}
          <span className="text-primary-600 dark:text-primary-400">
            {formatNumber(filteredFaqs.length, l)}
          </span>{" "}
          {ui.of}{" "}
          <span className="text-slate-700 dark:text-slate-200">
            {formatNumber(FAQS.length, l)}
          </span>
        </p>

        {/* ===== لا توجد نتائج ===== */}
        {filteredFaqs.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">❓</div>

            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noResults}
            </h3>

            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {ui.noResultsDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href={`/${l}/faq`} className="btn-primary">
                {ui.clearSearch}
              </Link>

              <Link href={`/${l}/contact`} className="btn-outline">
                {ui.contactUs}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const cat = CATEGORIES.find(
                (item) => item.id === faq.categoryId
              );

              return (
                <details
                  key={faq.id}
                  id={faq.id}
                  className="card group scroll-mt-32 p-6 md:p-7"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      {cat && (
                        <span className="badge-primary mb-3">
                          {cat.icon} {isRTL ? cat.ar : cat.en}
                        </span>
                      )}

                      <h3
                        className="text-lg font-black leading-relaxed text-slate-900 md:text-xl dark:text-white"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {isRTL ? faq.question.ar : faq.question.en}
                      </h3>
                    </div>

                    <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-transform duration-300 group-open:rotate-45 dark:bg-primary-900/40 dark:text-primary-300">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                  </summary>

                  <div className="mt-5 border-t border-slate-100 pt-5 dark:border-night-700">
                    <p className="mb-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                      {ui.answerLabel}
                    </p>

                    <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                      {isRTL ? faq.answer.ar : faq.answer.en}
                    </p>
                  </div>
                </details>
              );
            })}
          </div>
        )}

        {/* ===== صفحات ذات صلة ===== */}
        <div className="mt-12">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/${l}/about`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🌐
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.aboutPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.aboutPageDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${l}/contact`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                📬
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.contactPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.contactPageDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${l}/privacy`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🔒
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.privacyPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.privacyPageDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${l}/terms`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                📜
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.termsPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.termsPageDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ===== CTA التواصل ===== */}
        <div className="card relative mt-10 overflow-hidden p-8 text-center md:p-10">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <h2
            className="mb-3 text-2xl font-black text-slate-900 md:text-3xl dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.stillHaveQuestions}
          </h2>

          <p className="mx-auto mb-6 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">
            {ui.stillHaveQuestionsDesc}
          </p>

          <Link href={`/${l}/contact`} className="btn-primary inline-flex items-center gap-2">
            {ui.contactUs}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isRTL ? "rotate-180" : ""}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ===== ملاحظة ===== */}
        <div className="card mt-6 border-gold-200 bg-gold-50/60 p-5 text-center dark:border-gold-900/30 dark:bg-gold-950/15">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            📌 {ui.note}
          </p>
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
}: {
  icon: string;
  label: string;
  value: number | string;
  color: "primary" | "gold";
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
      <p className={`text-2xl font-black ${colorClasses[color]}`}>{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}