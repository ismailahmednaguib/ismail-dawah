// app/[lang]/articles/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";

export const dynamic = "force-dynamic";

// ============================================================
// الأنواع
// ============================================================

type Localized = {
  ar: string;
  en: string;
};

type Category = {
  id: string;
  ar: string;
  en: string;
  icon: string;
};

type Article = {
  id: string;
  categoryId: string;
  date: string;
  readMinutes: number;
  icon: string;
  tags: {
    ar: string[];
    en: string[];
  };
  title: Localized;
  excerpt: Localized;
  content: {
    ar: string[];
    en: string[];
  };
};

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  page?: string | string[];
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  searchPlaceholder: string;
  search: string;
  clearFilters: string;
  category: string;
  categoriesTitle: string;
  results: string;
  of: string;
  noResults: string;
  noResultsDesc: string;
  readArticle: string;
  publishedAt: string;
  readTime: string;
  tags: string;
  page: string;
  previous: string;
  next: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
  contact: string;
  fatwa: string;
  dawahGuide: string;
  hajjGuide: string;
};

// ============================================================
// الثوابت
// ============================================================

const PAGE_SIZE = 6;

// ============================================================
// التصنيفات
// ============================================================

const CATEGORIES: Category[] = [
  { id: "all", ar: "كل المقالات", en: "All Articles", icon: "📚" },
  { id: "dawah", ar: "الدعوة", en: "Dawah", icon: "🤝" },
  { id: "quran", ar: "القرآن", en: "Quran", icon: "📖" },
  { id: "fiqh", ar: "الفقه", en: "Fiqh", icon: "⚖️" },
  { id: "akhlaq", ar: "الأخلاق", en: "Ethics", icon: "🌿" },
  { id: "stories", ar: "القصص", en: "Stories", icon: "📜" },
  { id: "family", ar: "الأسرة", en: "Family", icon: "🏡" },
];

// ============================================================
// المقالات
// ============================================================

const ARTICLES: Article[] = [
  {
    id: "dawah-basics",
    categoryId: "dawah",
    date: "2026-09-28",
    readMinutes: 6,
    icon: "🤝",
    tags: {
      ar: ["دعوة", "حكمة", "أخلاق"],
      en: ["dawah", "wisdom", "manners"],
    },
    title: {
      ar: "أساسيات الدعوة إلى الله",
      en: "Fundamentals of Calling to Allah",
    },
    excerpt: {
      ar: "الدعوة إلى الله ليست مجرد كلام، بل منهج يقوم على العلم والإخلاص والرفق وحسن الخلق.",
      en: "Dawah is not merely speech; it is a methodology built on knowledge, sincerity, gentleness, and good character.",
    },
    content: {
      ar: [
        "أول أساس في الدعوة هو الإخلاص، بأن يقصد الداعية وجه الله وهداية الخلق، لا الشهرة ولا الغلبة في الجدال. ثم يأتي العلم، فيعرف الداعية ما يدعو إليه ودليله وحدود المسألة.",
        "ومن الأسس المهمة الحكمة ومراعاة حال المدعو، فالجاهل يحتاج تعليمًا، والمحتاج يحتاج تيسيرًا، والمستفز يحتاج صبرًا. كما أن الرفق يفتح القلوب، بينما الخشونة قد تغلق أبوابًا كانت مفتوحة.",
      ],
      en: [
        "The first foundation of dawah is sincerity, intending Allah’s pleasure and the guidance of creation, not fame or winning arguments. Knowledge follows, so the caller knows what he invites to, its evidence, and the limits of the issue.",
        "Another key foundation is wisdom and considering the state of the person being invited. The ignorant needs teaching, the needy needs ease, and the provoked needs patience. Gentleness opens hearts, while harshness may close doors that were open.",
      ],
    },
  },
  {
    id: "quran-tadabbur",
    categoryId: "quran",
    date: "2026-09-21",
    readMinutes: 5,
    icon: "📖",
    tags: {
      ar: ["قرآن", "تدبر", "قلوب"],
      en: ["quran", "reflection", "hearts"],
    },
    title: {
      ar: "كيف تتدبر القرآن في حياتك اليومية؟",
      en: "How to Reflect on the Quran in Daily Life",
    },
    excerpt: {
      ar: "التدبر ليس علمًا خاصًا بالعلماء فقط، بل هو مفتاحعيش القلب مع القرآن.",
      en: "Reflection is not limited to scholars; it is a key to living the heart with the Quran.",
    },
    content: {
      ar: [
        "ابدأ بقراءة يسيرة مع معنى واضح، ثم اسأل نفسك: ماذا يريد الله مني في هذه الآية؟ لا تجعل همك إنهاء السور فقط، بل اجعل همك فهم الخطاب والتأثر به.",
        "من أعظم ثمار التدبر أن يصبح القرآن برنامج حياة: آية في الصبر عند البلاء، وآية في الرحمة مع الخلق، وآية في التوبة عند الذنب. هكذا ينزل القرآن من المصحف إلى القلب والسلوك.",
      ],
      en: [
        "Begin with a small reading alongside a clear meaning, then ask yourself: what does Allah want from me in this verse? Do not make your only concern finishing surahs; make your concern understanding the address and being affected by it.",
        "Among the greatest fruits of reflection is that the Quran becomes a life program: a verse on patience during hardship, a verse on mercy with creation, and a verse on repentance after sin. Thus the Quran descends from the mushaf into the heart and conduct.",
      ],
    },
  },
  {
    id: "fiqh-travel-prayer",
    categoryId: "fiqh",
    date: "2026-09-14",
    readMinutes: 7,
    icon: "🕌",
    tags: {
      ar: ["فقه", "صلاة", "سفر"],
      en: ["fiqh", "prayer", "travel"],
    },
    title: {
      ar: "أحكام صلاة المسافر: تيسير لا تفريط",
      en: "Rulings of Traveler’s Prayer: Ease, Not Negligence",
    },
    excerpt: {
      ar: "شرع الله للمسافر رخصًا تعينه على العبادة، لكن ينبغي فهم ضوابطها حتى لا تتحول إلى تهاون.",
      en: "Allah legislated concessions for travelers to help them worship, but their conditions should be understood so they do not become negligence.",
    },
    content: {
      ar: [
        "من أحكام السفر المشهورة: قصر الصلاة الرباعية، والجمع بين الظهر والعصر وبين المغرب والعشاء في حالات الحاجة. وهذه الرخص مبناها على التيسير ورفع الحرج.",
        "لكن ينبغي الانتباه إلى أن السفر له ضوابط، وأن بعض الناس قد يجمع بين الرخص بطريقة تخل بالمقصود الشرعي. الأصل أن تُصلى الصلاة في وقتها، والرخصة تُستعمل عند الحاجة الحقيقية.",
      ],
      en: [
        "Among well-known travel rulings are shortening the four-unit prayers and combining Dhuhr with Asr and Maghrib with Isha when needed. These concessions are based on easing hardship.",
        "However, one should note that travel has conditions, and some people may use concessions in a way that undermines the legislative purpose. The default is to pray on time, and concession is used for genuine need.",
      ],
    },
  },
  {
    id: "akhlaq-social-media",
    categoryId: "akhlaq",
    date: "2026-09-07",
    readMinutes: 4,
    icon: "💬",
    tags: {
      ar: ["أخلاق", "لسان", "تواصل"],
      en: ["ethics", "speech", "social media"],
    },
    title: {
      ar: "حفظ اللسان في عصر وسائل التواصل",
      en: "Guarding the Tongue in the Social Media Age",
    },
    excerpt: {
      ar: "الكلمة في الفضاء الرقمي أسرع انتشارًا وأشد أثرًا، لذا كان حفظ اللسان واجبًا شرعيًا وأخلاقيًا.",
      en: "Speech in the digital space spreads faster and affects more deeply, so guarding the tongue is a religious and ethical duty.",
    },
    content: {
      ar: [
        "كثير من الناس يحفظ لسانه في المجلس، لكنه يطلقه في التعليقات والمنشورات. والمؤمن الحق يراقب الله في السر والعلن، وفي الكتابة كما في الكلام.",
        "من قواعد السلامة الرقمية: لا تنشر ما لا تعلم، ولا تجادل بغضب، ولا تنقل عيوب الناس، ولا تشارك خبرًا قبل التحقق. فالكلمة قد تكون صدقة، وقد تكون سيفًا يجرى صاحبه في نار جهنم.",
      ],
      en: [
        "Many people guard their tongues in gatherings but release them in comments and posts. The true believer watches Allah in secret and openly, in writing as in speech.",
        "Rules of digital safety include: do not publish what you do not know, do not argue in anger, do not spread people’s faults, and do not share news before verification. A word may be charity, or it may be a sword whose owner slides into the Fire.",
      ],
    },
  },
  {
    id: "stories-hijrah-lessons",
    categoryId: "stories",
    date: "2026-08-31",
    readMinutes: 6,
    icon: "🐪",
    tags: {
      ar: ["هجرة", "سيرة", "دروس"],
      en: ["hijrah", "seerah", "lessons"],
    },
    title: {
      ar: "من دروس الهجرة النبوية",
      en: "Lessons from the Prophetic Migration",
    },
    excerpt: {
      ar: "الهجرة لم تكن انتقالًا جغرافيًا فقط، بل كانت مدرسة في التخطيط والتوكل والتضحية.",
      en: "The migration was not merely geographical movement; it was a school of planning, trust, and sacrifice.",
    },
    content: {
      ar: [
        "ظهر في الهجرة التوكل الحقيقي مع الأخذ بالأسباب: النبي صلى الله عليه وسلم اختار رفيقه، وخطط للطريق، واختبأ في الغار، ومع ذلك كان قلبه ممتلئًا يقينًا بقوله تعالى: لا تحزن إن الله معنا.",
        "وفيها أيضًا درس في التضحية: أبو بكر رضي الله عنه قدم ماله ووقته وراحته، والأنصار فتحوا ديارهم وقلوبهم. فالمجتمع المسلم لا يُبنى بالشعارات، بل بالبذل والاستمرار.",
      ],
      en: [
        "True trust with taking means appeared in the migration: the Prophet chose his companion, planned the route, hid in the cave, yet his heart was filled with certainty in Allah’s words: Do not grieve; indeed Allah is with us.",
        "It also teaches sacrifice: Abu Bakr offered his wealth, time, and comfort, and the Ansar opened their homes and hearts. The Muslim society is not built by slogans, but by giving and persistence.",
      ],
    },
  },
  {
    id: "family-prayer-children",
    categoryId: "family",
    date: "2026-08-24",
    readMinutes: 5,
    icon: "🏡",
    tags: {
      ar: ["أسرة", "أبناء", "صلاة"],
      en: ["family", "children", "prayer"],
    },
    title: {
      ar: "تربية الأبناء على الصلاة بالرفق لا بالترهيب",
      en: "Raising Children Upon Prayer with Gentleness, Not Fear",
    },
    excerpt: {
      ar: "الصلاة أعظم أركان الإسلام بعد الشهادتين، وتربية الأبناء عليها تحتاج حكمة وصبرًا وقدوة.",
      en: "Prayer is the greatest pillar after the testimony of faith, and raising children upon it requires wisdom, patience, and example.",
    },
    content: {
      ar: [
        "أول وسيلة في التربية هي القدوة: حين يرى الابن أباه وأم يحافظان على الصلاة في وقتها، تتشكل عنده صورة حية أن الصلاة ليست عادة اجتماعية، بل علاقة مع الله.",
        "ثم يأتي التدرج والرفق: علّمهم معنى الوضوء، وشوّقهم بالمكافأة، ولا تجعل الصلاة عقابًا. فالطفل الذي يرتبط بالصلاة بالرحمة، يكبر وهي سكينة في قلبه.",
      ],
      en: [
        "The first means of upbringing is example: when a child sees father and mother maintaining prayer on time, a living image forms that prayer is not a social habit but a relationship with Allah.",
        "Then comes gradual gentleness: teach them the meaning of wudu, encourage them with rewards, and do not make prayer a punishment. A child connected to prayer through mercy grows up finding it tranquility in the heart.",
      ],
    },
  },
  {
    id: "dawah-shubuhat",
    categoryId: "dawah",
    date: "2026-08-17",
    readMinutes: 8,
    icon: "🧠",
    tags: {
      ar: ["شبهات", "دعوة", "عقل"],
      en: ["doubts", "dawah", "reason"],
    },
    title: {
      ar: "الرد على الشبهات بمنهج حكيم",
      en: "Answering Doubts with a Wise Methodology",
    },
    excerpt: {
      ar: "الشبهة لا تُدفع بالغضب دائمًا، بل بفهم أصل السؤال، وتقديم الجواب المناسب للمستوى.",
      en: "A doubt is not always repelled by anger, but by understanding the root of the question and giving an answer suited to the level.",
    },
    content: {
      ar: [
        "كثير من الشبهات تكون مبنية على سوء فهم، أو نقل ناقص، أو قياس فاسد. لذلك يجب على الداعية أن يسأل: ما الذي فهمه هذا الشخص؟ وما الدليل الذي اعتمد عليه؟ ثم يزيل اللبس بالبيان لا بالتشهير.",
        "ومن الحكمة ألا يدخل الداعية في كل شبهة، خاصة ما لا علم له فيه. فليس كل سؤال يستحق جوابًا فوريًا، وقد يكون أفضل الرد: سأتحقق وأرد عليك، أو أحولك إلى أهل الاختصاص.",
      ],
      en: [
        "Many doubts are built on misunderstanding, incomplete transmission, or faulty analogy. Therefore, the da‘ee should ask: what did this person understand? What evidence did he rely on? Then remove confusion by clarification, not defamation.",
        "Wisdom also requires that the da‘ee not enter every doubt, especially those beyond his knowledge. Not every question deserves an immediate answer, and sometimes the best response is: I will verify and reply, or I will refer you to specialists.",
      ],
    },
  },
  {
    id: "quran-memorization-plans",
    categoryId: "quran",
    date: "2026-08-10",
    readMinutes: 6,
    icon: "🎯",
    tags: {
      ar: ["حفظ", "قرآن", "خطة"],
      en: ["memorization", "quran", "plan"],
    },
    title: {
      ar: "خطط عملية لحفظ القرآن الكريم",
      en: "Practical Plans for Memorizing the Quran",
    },
    excerpt: {
      ar: "الحفظ يحتاج خطة واضحة، ووقتًا ثابتًا، ومراجعة دائمة، لا حماسًا يبدأ وينتهي.",
      en: "Memorization needs a clear plan, fixed time, and constant revision, not enthusiasm that begins and ends.",
    },
    content: {
      ar: [
        "من أنجح الطرق: تحديد ورد يومي صغير لكن مستمر، مثل ثلاث آيات أو خمس آيات. ثم ربط الحفظ بوقت ثابت، بعد الفجر مثلًا، لأن القلبكون أصفى والذاكرة أنشط.",
        "كما أن المراجعة أهم من الحفظ الجديد في كثير من الأحيان. فاحفظ الجديد، ثم راجع القديم كل يوم، واجعل لك أسبوعًا لمراجعة ما حفظته في الشهر. هكذا يثبت القرآن بإذن الله.",
      ],
      en: [
        "Among the most successful methods is setting a small but consistent daily portion, such as three or five verses. Then attach memorization to a fixed time, for example after Fajr, because the heart is clearer and memory is more active.",
        "Revision is often more important than new memorization. Memorize the new portion, revise the old daily, and set aside a weekly review of the month’s memorization. Thus the Quran becomes firm, by Allah’s permission.",
      ],
    },
  },
  {
    id: "fiqh-zakat-purpose",
    categoryId: "fiqh",
    date: "2026-08-03",
    readMinutes: 7,
    icon: "💰",
    tags: {
      ar: ["زكاة", "فقه", "مقاصد"],
      en: ["zakat", "fiqh", "objectives"],
    },
    title: {
      ar: "الزكاة: مقاصد وأحكام",
      en: "Zakat: Objectives and Rulings",
    },
    excerpt: {
      ar: "الزكاة ليست مجرد مبلغ يُخرج، بل هي عبادة مالية تطهر النفس وتصلح المجتمع.",
      en: "Zakat is not merely an amount paid; it is financial worship that purifies the soul and repairs society.",
    },
    content: {
      ar: [
        "من مقاصد الزكاة: تطهير المال من الشح، وتطهير النفس من البخل، وتحقيق التكافل بين المسلمين. فهي تربط الغني بالفقير برباط عبادة لا رباط منّة.",
        "وأحكامها تحتاج دقة: النصاب، والحول، وأنواع الأموال، والديون، وعروض التجارة. ولهذا لا ينبغي الاكتفاء بالحاسبات الآلية في المسائل المعقدة، بل يُراجع أهل العلم.",
      ],
      en: [
        "Objectives of zakat include purifying wealth from stinginess, purifying the soul from miserliness, and achieving mutual care among Muslims. It connects rich and poor through worship, not through favors.",
        "Its rulings require precision: nisab, lunar year, types of wealth, debts, and trade goods. Therefore, automated calculators should not be relied upon in complex matters; qualified scholars should be consulted.",
      ],
    },
  },
  {
    id: "akhlaq-patience",
    categoryId: "akhlaq",
    date: "2026-07-27",
    readMinutes: 5,
    icon: "🌱",
    tags: {
      ar: ["صبر", "ابتلاء", "قلوب"],
      en: ["patience", "trial", "hearts"],
    },
    title: {
      ar: "الصبر على الابتلاء: مفتاح الطمأنينة",
      en: "Patience in Trial: The Key to Tranquility",
    },
    excerpt: {
      ar: "الابتلاء سنة الحياة، والصبر ليس جمودًا، بل هو قبول هادئ مع أخذ بالأسباب وحسن ظن بالله.",
      en: "Trial is the way of life, and patience is not rigidity; it is calm acceptance with taking means and good expectation of Allah.",
    },
    content: {
      ar: [
        "حين يفهم المسلم أن الابتلاء ليس دليل غضب دائمًا، ولا يعني أن الله نسيه، يهدأ قلبه. فالنبي صلى الله عليه وسلم كان أشد الناس بلاء، ومع ذلك كان أكثرهم صبرًا وأرجاهم أجرًا.",
        "والصبر لا يمنع الدعاء ولا العمل بالأسباب. بل المؤمن يصبر ويدعو ويعالج ويتوكل. وهذا هو الجمع بين الإيمان بالقدر والأخذ بالأسباب.",
      ],
      en: [
        "When a Muslim understands that trial is not always a sign of anger, nor does it mean Allah forgot him, his heart calms. The Prophet was among the most severely tested people, yet he was the most patient and hopeful of reward.",
        "Patience does not prevent supplication or taking means. Rather, the believer is patient, prays, seeks treatment, and relies on Allah. This combines belief in divine decree with taking means.",
      ],
    },
  },
];

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<Lang, UILang> = {
  ar: {
    title: "المقالات",
    subtitle: "مقالات دعوية وتربوية وشرعية مختارة",
    home: "الرئيسية",
    description:
      "قسم المقالات في منصة إسماعيل أحمد نجيب الدعوية. مقالات مختصرة في الدعوة والقرآن والفقه والأخلاق والقصص وتربية الأسرة.",
    searchPlaceholder: "ابحث في المقالات...",
    search: "بحث",
    clearFilters: "مسح الفلاتر",
    category: "التصنيف",
    categoriesTitle: "تصنيفات المقالات",
    results: "عدد المقالات",
    of: "من",
    noResults: "لا توجد مقالات مطابقة",
    noResultsDesc: "جرّب كلمة أخرى أو اختر تصنيفًا مختلفًا.",
    readArticle: "اقرأ المقال",
    publishedAt: "نُشر في",
    readTime: "دقائق قراءة",
    tags: "الوسوم",
    page: "صفحة",
    previous: "السابق",
    next: "التالي",
    noteTitle: "تنبيه",
    note1:
      "هذه المقالات للتوعية العامة، ولا تغني عن مراجعة أهل العلم في المسائل الدقيقة.",
    note2:
      "يُرجى نقل المحتوى مع ذكر المصدر، وعدم إخراج النصوص عن سياقها.",
    note3:
      "لو وجدت خطأً أو أردت اقتراح موضوع، راسلنا عبر صفحة تواصل معنا.",
    contact: "تواصل معنا",
    fatwa: "الفتاوى",
    dawahGuide: "دليل الدعوة",
    hajjGuide: "دليل الحج",
  },
  en: {
    title: "Articles",
    subtitle: "Selected dawah, educational, and Islamic articles",
    home: "Home",
    description:
      "Articles section of the Ismail Ahmed Naguib Dawah Platform. Concise articles on dawah, Quran, fiqh, ethics, stories, and family upbringing.",
    searchPlaceholder: "Search articles...",
    search: "Search",
    clearFilters: "Clear filters",
    category: "Category",
    categoriesTitle: "Article Categories",
    results: "Articles",
    of: "of",
    noResults: "No matching articles",
    noResultsDesc: "Try another keyword or choose a different category.",
    readArticle: "Read article",
    publishedAt: "Published on",
    readTime: "min read",
    tags: "Tags",
    page: "Page",
    previous: "Previous",
    next: "Next",
    noteTitle: "Notice",
    note1:
      "These articles are for general awareness and do not replace consulting qualified scholars in detailed matters.",
    note2:
      "Please share content with attribution and do not take texts out of context.",
    note3:
      "If you find an error or want to suggest a topic, contact us through the Contact Us page.",
    contact: "Contact Us",
    fatwa: "Fatwas",
    dawahGuide: "Dawah Guide",
    hajjGuide: "Hajj Guide",
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

function formatDate(iso: string, lang: Lang): string {
  const parsed = new Date(iso);

  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }

  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
      dateStyle: "medium",
    }).format(parsed);
  } catch {
    return parsed.toDateString();
  }
}

function categoryLabel(categoryId: string, lang: Lang): string {
  const category = CATEGORIES.find((item) => item.id === categoryId);

  if (!category) {
    return categoryId;
  }

  return lang === "ar" ? category.ar : category.en;
}

function categoryIcon(categoryId: string): string {
  return CATEGORIES.find((item) => item.id === categoryId)?.icon ?? "📄";
}

function articleMatches(article: Article, query: string): boolean {
  if (!query) {
    return true;
  }

  const q = normalize(query);

  const haystack = [
    article.title.ar,
    article.title.en,
    article.excerpt.ar,
    article.excerpt.en,
    ...article.tags.ar,
    ...article.tags.en,
    ...article.content.ar,
    ...article.content.en,
  ];

  return haystack.some((text) => normalize(text).includes(q));
}

function parsePage(value?: string | string[]): number {
  const raw = getFirstValue(value);
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function buildHref(
  lang: Lang,
  options: {
    q?: string;
    category?: string;
    page?: number;
  }
): string {
  const search = new URLSearchParams();

  if (options.q?.trim()) {
    search.set("q", options.q.trim());
  }

  if (options.category && options.category !== "all") {
    search.set("category", options.category);
  }

  if (options.page && options.page > 1) {
    search.set("page", String(options.page));
  }

  const queryString = search.toString();

  return `/${lang}/articles${queryString ? `?${queryString}` : ""}`;
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

  if (!isValidLang(lang)) {
    return {};
  }

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/articles`,
      languages: {
        ar: "/ar/articles",
        en: "/en/articles",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/articles`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: ui.title,
      description: ui.description,
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// الصفحة
// ============================================================

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

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

  const requestedPage = parsePage(sp.page);

  const filteredArticles = ARTICLES.filter((article) => {
    if (category !== "all" && article.categoryId !== category) {
      return false;
    }

    return articleMatches(article, q);
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredArticles.length / PAGE_SIZE)
  );

  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageArticles = filteredArticles.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const activeCategory =
    CATEGORIES.find((item) => item.id === category) ?? CATEGORIES[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    headline: ui.title,
    description: ui.description,
    inLanguage: l,
    blogPost: ARTICLES.map((article) => ({
      "@type": "BlogPosting",
      headline: isRTL ? article.title.ar : article.title.en,
      description: isRTL ? article.excerpt.ar : article.excerpt.en,
      datePublished: article.date,
      articleSection: categoryLabel(article.categoryId, l),
      keywords: [...article.tags.ar, ...article.tags.en].join(", "),
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          {
            label: ui.home,
            href: `/${l}`,
          },
          {
            label: ui.title,
          },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== ترويسة ===== */}
        <div className="card relative mb-8 overflow-hidden p-8 md:p-10">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-primary mb-5">
              ✍️ {isRTL ? "مقالات مختارة" : "Selected Articles"}
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
          </div>
        </div>

        {/* ===== البحث والفلترة ===== */}
        <div className="card mb-8 p-6 md:p-7">
          <form
            method="get"
            action={`/${l}/articles`}
            className="grid gap-4 md:grid-cols-[1fr_220px_auto]"
          >
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

            <div>
              <label className="sr-only" htmlFor="articles-category">
                {ui.category}
              </label>

              <select
                id="articles-category"
                name="category"
                defaultValue={category}
                className="input-islamic"
              >
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.icon} {isRTL ? item.ar : item.en}
                  </option>
                ))}
              </select>
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

              {q && <span className="badge-gold">“{q}”</span>}

              <Link
                href={`/${l}/articles`}
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
                {ui.clearFilters}
              </Link>
            </div>
          )}
        </div>

        {/* ===== التصنيفات السريعة ===== */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {ui.categoriesTitle}
          </h2>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => {
              const isActive = item.id === category;
              const href = buildHref(l, {
                q,
                category: item.id,
                page: 1,
              });

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
            {formatNumber(filteredArticles.length, l)}
          </span>{" "}
          {ui.of}{" "}
          <span className="text-slate-700 dark:text-slate-200">
            {formatNumber(ARTICLES.length, l)}
          </span>
        </p>

        {/* ===== لا توجد نتائج ===== */}
        {filteredArticles.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">📭</div>

            <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noResults}
            </h2>

            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {ui.noResultsDesc}
            </p>

            <Link href={`/${l}/articles`} className="btn-primary">
              {ui.clearFilters}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {pageArticles.map((article) => {
              const content = isRTL ? article.content.ar : article.content.en;
              const tags = isRTL ? article.tags.ar : article.tags.en;

              return (
                <details
                  key={article.id}
                  id={article.id}
                  className="card group scroll-mt-32 p-6 md:p-7"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span className="badge-primary">
                          {categoryIcon(article.categoryId)}{" "}
                          {categoryLabel(article.categoryId, l)}
                        </span>

                        <span>
                          {ui.publishedAt}: {formatDate(article.date, l)}
                        </span>

                        <span>
                          {formatNumber(article.readMinutes, l)}{" "}
                          {ui.readTime}
                        </span>
                      </div>

                      <h3
                        className="mb-2 text-xl font-black leading-relaxed text-slate-900 md:text-2xl dark:text-white"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {isRTL ? article.title.ar : article.title.en}
                      </h3>

                      <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                        {isRTL ? article.excerpt.ar : article.excerpt.en}
                      </p>

                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                        {ui.readArticle}

                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-300 group-open:rotate-180"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </div>

                    <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                      {article.icon}
                    </span>
                  </summary>

                  <div className="mt-5 space-y-4 border-t border-slate-100 pt-5 dark:border-night-700">
                    {content.map((paragraph, index) => (
                      <p
                        key={`${article.id}-${index}`}
                        className="leading-relaxed text-slate-600 dark:text-slate-300"
                      >
                        {paragraph}
                      </p>
                    ))}

                    <div>
                      <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                        {ui.tags}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={`${article.id}-${tag}`}
                            className="badge-gold text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}

        {/* ===== الترقيم ===== */}
        {totalPages > 1 && (
          <div className="mt-10 text-center">
            <p className="mb-4 text-sm font-bold text-slate-500 dark:text-slate-400">
              {ui.page} {formatNumber(currentPage, l)} {ui.of}{" "}
              {formatNumber(totalPages, l)}
            </p>

            <nav
              className="flex flex-wrap items-center justify-center gap-2"
              aria-label={ui.page}
            >
              {currentPage > 1 ? (
                <Link
                  href={buildHref(l, {
                    q,
                    category,
                    page: currentPage - 1,
                  })}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRTL ? "rotate-180" : ""}
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  {ui.previous}
                </Link>
              ) : (
                <span className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-400 opacity-60 dark:border-night-700 dark:bg-night-800 dark:text-slate-500">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRTL ? "rotate-180" : ""}
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  {ui.previous}
                </span>
              )}

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => {
                  const isActive = page === currentPage;
                  const href = buildHref(l, {
                    q,
                    category,
                    page,
                  });

                  if (isActive) {
                    return (
                      <span
                        key={page}
                        className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-3 text-sm font-black text-white shadow-lg shadow-primary-500/25"
                      >
                        {formatNumber(page, l)}
                      </span>
                    );
                  }

                  return (
                    <Link
                      key={page}
                      href={href}
                      className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700"
                    >
                      {formatNumber(page, l)}
                    </Link>
                  );
                }
              )}

              {currentPage < totalPages ? (
                <Link
                  href={buildHref(l, {
                    q,
                    category,
                    page: currentPage + 1,
                  })}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700"
                >
                  {ui.next}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRTL ? "rotate-180" : ""}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ) : (
                <span className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-400 opacity-60 dark:border-night-700 dark:bg-night-800 dark:text-slate-500">
                  {ui.next}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRTL ? "rotate-180" : ""}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              )}
            </nav>
          </div>
        )}

        {/* ===== تنبيه ===== */}
        <div className="card mt-10 p-6 md:p-8">
          <h2
            className="mb-5 text-xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📌 {ui.noteTitle}
          </h2>

          <ul className="space-y-3">
            {[ui.note1, ui.note2, ui.note3].map((note, index) => (
              <li
                key={`${note}-${index}`}
                className="flex items-start gap-3 leading-relaxed text-slate-600 dark:text-slate-300"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== روابط سريعة ===== */}
        <div className="card mt-8 p-6 md:p-8">
          <h2 className="mb-5 text-xl font-black text-slate-900 dark:text-white">
            {isRTL ? "روابط مفيدة" : "Useful links"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/${l}/contact`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                📬
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.contact}
                </h3>
              </div>
            </Link>

            <Link
              href={`/${l}/fatwa`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                ⚖️
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.fatwa}
                </h3>
              </div>
            </Link>

            <Link
              href={`/${l}/dawah-guide`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🤝
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.dawahGuide}
                </h3>
              </div>
            </Link>

            <Link
              href={`/${l}/hajj-guide`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🕋
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.hajjGuide}
                </h3>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}