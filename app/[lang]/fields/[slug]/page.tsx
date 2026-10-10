// app/[lang]/fields/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";

// ============================================================
// الأنواع
// ============================================================

type Field = {
  id: string;
  slug: string;
  icon: string;
  color: string;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  description: { ar: string; en: string };
  verse: { ar: string; en: string };
  verseSource: { ar: string; en: string };
  topics: { ar: string[]; en: string[] };
  books: {
    title: { ar: string; en: string };
    author: { ar: string; en: string };
  }[];
  faqs: {
    q: { ar: string; en: string };
    a: { ar: string; en: string };
  }[];
  relatedSlugs: string[];
};

type Localized = { ar: string; en: string };

// ============================================================
// البيانات الكاملة لـ 17 مجالاً
// ============================================================

const FIELDS: Field[] = [
  {
    id: "aqeedah",
    slug: "aqeedah",
    icon: "🕌",
    color: "from-indigo-500 to-indigo-600",
    title: { ar: "العقيدة", en: "Creed (Aqeedah)" },
    subtitle: { ar: "أصول الإيمان والتوحيد", en: "Foundations of Faith and Tawhid" },
    description: {
      ar: "العقيدة هي أساس الدين، وتشمل الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر خيره وشره. وهي العلم الذي يصحح به المسلم إيمانه ويبعد عن الشرك والبدع.",
      en: "Creed is the foundation of religion, encompassing belief in Allah, His angels, books, messengers, the Last Day, and divine decree. It is the science that corrects a Muslim's faith and protects from shirk and innovations.",
    },
    verse: {
      ar: "﴿ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ﴾",
      en: "\"Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining.\"",
    },
    verseSource: { ar: "سورة البقرة — الآية 255 (آية الكرسي)", en: "Surah Al-Baqarah — Verse 255 (Ayat al-Kursi)" },
    topics: {
      ar: ["التوحيد وأنواعه", "أسماء الله الحسنى وصفاته", "الإيمان بالملائكة", "الإيمان بالكتب والرسل", "الإيمان باليوم الآخر", "الإيمان بالقدر"],
      en: ["Tawhid and its types", "Allah's Beautiful Names and Attributes", "Belief in Angels", "Belief in Books and Messengers", "Belief in the Last Day", "Belief in Divine Decree"],
    },
    books: [
      { title: { ar: "كتاب التوحيد", en: "Book of Tawhid" }, author: { ar: "محمد بن عبد الوهاب", en: "Muhammad ibn Abdul-Wahhab" } },
      { title: { ar: "العقيدة الواسطية", en: "Al-Aqeedah Al-Wasitiyyah" }, author: { ar: "ابن تيمية", en: "Ibn Taymiyyah" } },
      { title: { ar: "شرح الطحاوية", en: "Sharh al-Tahawiyyah" }, author: { ar: "ابن أبي العز", en: "Ibn Abi al-Izz" } },
    ],
    faqs: [
      {
        q: { ar: "ما الفرق بين التوحيد والاعتقاد؟", en: "What is the difference between tawhid and aqeedah?" },
        a: { ar: "التوحيد جزء من العقيدة، وهو إفراد الله بالعبادة والربوبية والأسماء والصفات. والعقيدة تشمل التوحيد والإيمان بأركان الإيمان الستة وغيرها من الأصول.", en: "Tawhid is part of aqeedah - it is singling out Allah in worship, lordship, and names/attributes. Aqeedah includes tawhid, belief in the six pillars of faith, and other fundamentals." },
      },
      {
        q: { ar: "هل يجوز دراسة العقيدة بدون معلم؟", en: "Can I study aqeedah without a teacher?" },
        a: { ar: "يمكن البدء بالكتب المبسطة المعتمدة، لكن يُفضل مصاحبة عالم أو طالب علم لضبط الفهم وتجنب الشبهات.", en: "You can start with simplified authentic books, but it's best to study with a scholar or student of knowledge to ensure correct understanding." },
      },
    ],
    relatedSlugs: ["hadith", "tafsir", "atheism"],
  },
  {
    id: "fiqh",
    slug: "fiqh",
    icon: "⚖️",
    color: "from-emerald-500 to-emerald-600",
    title: { ar: "الفقه", en: "Jurisprudence (Fiqh)" },
    subtitle: { ar: "الأحكام الشرعية العملية", en: "Practical Islamic Rulings" },
    description: {
      ar: "الفقه هو العلم بالأحكام الشرعية العملية المكتسب من أدلتها التفصيلية. يشمل العبادات والمعاملات والأحوال الشخصية، وهو ما يحتاجه المسلم في حياته اليومية.",
      en: "Fiqh is the knowledge of practical Islamic rulings derived from detailed evidence. It covers worship, transactions, and personal status - what Muslims need in daily life.",
    },
    verse: { ar: "﴿ يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ ﴾", en: "\"Allah intends for you ease and does not intend for you hardship.\"" },
    verseSource: { ar: "سورة البقرة — الآية 185", en: "Surah Al-Baqarah — Verse 185" },
    topics: {
      ar: ["فقه العبادات", "فقه المعاملات", "فقه الأسرة", "فقه الجنايات", "فقه الحدود", "القواعد الفقهية"],
      en: ["Worship Jurisprudence", "Transaction Jurisprudence", "Family Jurisprudence", "Criminal Jurisprudence", "Penal Jurisprudence", "Legal Maxims"],
    },
    books: [
      { title: { ar: "فقه السنة", en: "Fiqh al-Sunnah" }, author: { ar: "سيد سابق", en: "Sayyid Sabiq" } },
      { title: { ar: "المغني", en: "Al-Mughni" }, author: { ar: "ابن قدامة", en: "Ibn Qudamah" } },
      { title: { ar: "المجموع", en: "Al-Majmu'" }, author: { ar: "النووي", en: "An-Nawawi" } },
    ],
    faqs: [
      {
        q: { ar: "ما الفرق بين الفقه والشريعة؟", en: "What is the difference between fiqh and shariah?" },
        a: { ar: "الشريعة هي الوحي الإلهي (القرآن والسنة)، أما الفقه فهو فهم العلماء واستنباطهم للأحكام من هذه الأدلة، لذلك تعددت المذاهب الفقهية.", en: "Shariah is the divine revelation (Quran and Sunnah), while fiqh is the scholars' understanding and derivation of rulings from these evidences, which is why multiple schools exist." },
      },
    ],
    relatedSlugs: ["family", "transactions", "aqeedah"],
  },
  {
    id: "tafsir",
    slug: "tafsir",
    icon: "📖",
    color: "from-green-500 to-green-600",
    title: { ar: "التفسير", en: "Exegesis (Tafsir)" },
    subtitle: { ar: "فهم معاني القرآن الكريم", en: "Understanding the Meanings of the Quran" },
    description: {
      ar: "التفسير هو العلم ببيان معاني القرآن الكريم، وشرح آياته، واستخراج أحكامه وعبره. وهو من أشرف العلوم لأنه يتعلق بكلام الله تعالى.",
      en: "Tafsir is the science of explaining the Quran's meanings, clarifying its verses, and deriving its rulings and lessons. It is among the noblest sciences as it relates to Allah's speech.",
    },
    verse: { ar: "﴿ كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ ﴾", en: "\"A blessed Book which We have revealed to you that they might reflect upon its verses.\"" },
    verseSource: { ar: "سورة ص — الآية 29", en: "Surah Sad — Verse 29" },
    topics: {
      ar: ["التفسير بالمأثور", "التفسير بالرأي", "أسباب النزول", "الناسخ والمنسوخ", "المحكم والمتشابه", "إعراب القرآن"],
      en: ["Tafsir by Narration", "Tafsir by Reasoning", "Reasons for Revelation", "Abrogating and Abrogated", "Clear and Ambiguous Verses", "Quran Grammar"],
    },
    books: [
      { title: { ar: "تفسير ابن كثير", en: "Tafsir Ibn Kathir" }, author: { ar: "ابن كثير", en: "Ibn Kathir" } },
      { title: { ar: "تفسير السعدي", en: "Tafsir As-Sa'di" }, author: { ar: "عبد الرحمن السعدي", en: "Abdur-Rahman as-Sa'di" } },
      { title: { ar: "الجامع لأحكام القرآن", en: "Al-Jami' li Ahkam al-Quran" }, author: { ar: "القرطبي", en: "Al-Qurtubi" } },
    ],
    faqs: [
      {
        q: { ar: "هل أحتاج إلى معرفة العربية لفهم التفسير؟", en: "Do I need Arabic to understand tafsir?" },
        a: { ar: "الترجمات المعتمدة تكفي للمبتدئ، لكن التعمق يحتاج إلى اللغة العربية لمعرفة الدلالات والبلاغة.", en: "Authentic translations suffice for beginners, but deep study requires Arabic to understand nuances and rhetoric." },
      },
    ],
    relatedSlugs: ["quran-sciences", "aqeedah", "hadith"],
  },
  {
    id: "hadith",
    slug: "hadith",
    icon: "📜",
    color: "from-amber-500 to-amber-600",
    title: { ar: "الحديث", en: "Hadith" },
    subtitle: { ar: "السنة النبوية وعلومها", en: "The Prophetic Sunnah and Its Sciences" },
    description: {
      ar: "علم الحديث يدرس ما نُقل عن النبي ﷺ من قول أو فعل أو تقرير أو صفة، ويشمل علم الرجال والجرح والتعديل والمتن والإسناد.",
      en: "Hadith science studies what was transmitted from the Prophet ﷺ of speech, action, approval, or attributes. It includes narrator criticism, authentication, matn analysis, and chains.",
    },
    verse: { ar: "﴿ وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ وَمَا نَهَاكُمْ عَنْهُ فَانتَهُوا ﴾", en: "\"Whatever the Messenger has given you - take; and what he has forbidden you - refrain from.\"" },
    verseSource: { ar: "سورة الحشر — الآية 7", en: "Surah Al-Hashr — Verse 7" },
    topics: {
      ar: ["مصطلح الحديث", "الجرح والتعديل", "علم الرجال", "علل الحديث", "كتب الصحاح والسنن", "فقه الحديث"],
      en: ["Hadith Terminology", "Narrator Criticism", "Rijal Science", "Hidden Defects", "Books of Sahih and Sunan", "Hadith Jurisprudence"],
    },
    books: [
      { title: { ar: "صحيح البخاري", en: "Sahih Al-Bukhari" }, author: { ar: "الإمام البخاري", en: "Imam Al-Bukhari" } },
      { title: { ar: "صحيح مسلم", en: "Sahih Muslim" }, author: { ar: "الإمام مسلم", en: "Imam Muslim" } },
      { title: { ar: "نخبة الفكر", en: "Nukhbat al-Fikar" }, author: { ar: "ابن حجر", en: "Ibn Hajar" } },
    ],
    faqs: [
      {
        q: { ar: "كيف أعرف أن الحديث صحيح؟", en: "How do I know a hadith is authentic?" },
        a: { ar: "بمراجعة تخريج العلماء مثل ابن حجر والألباني، والنظر في الإسناد والمتن، والاعتماد على كتب الصحاح والسنن المعتمدة.", en: "By checking scholars' authentication like Ibn Hajar and Al-Albani, examining the chain and text, and relying on authentic books." },
      },
    ],
    relatedSlugs: ["aqeedah", "fiqh", "seerah"],
  },
  {
    id: "seerah",
    slug: "seerah",
    icon: "🌙",
    color: "from-teal-500 to-teal-600",
    title: { ar: "السيرة النبوية", en: "Prophetic Biography" },
    subtitle: { ar: "حياة خير البشر ﷺ", en: "The Life of the Best of Creation ﷺ" },
    description: {
      ar: "السيرة النبوية دراسة لحياة النبي محمد ﷺ من مولده إلى وفاته، بما فيها من غزوات وأحداث وشمائل، لاستخلاص الدروس والعبر.",
      en: "Seerah studies the life of Prophet Muhammad ﷺ from birth to death, including battles, events, and character traits, to extract lessons.",
    },
    verse: { ar: "﴿ لَّقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ ﴾", en: "\"There has certainly been for you in the Messenger of Allah an excellent pattern.\"" },
    verseSource: { ar: "سورة الأحزاب — الآية 21", en: "Surah Al-Ahzab — Verse 21" },
    topics: {
      ar: ["المولد والنشأة", "البعثة والدعوة في مكة", "الهجرة إلى المدينة", "الغزوات والسرايا", "حجة الوداع", "شمائله وأخلاقه"],
      en: ["Birth and Upbringing", "Prophethood and Call in Mecca", "Migration to Medina", "Battles and Expeditions", "Farewell Hajj", "His Character and Traits"],
    },
    books: [
      { title: { ar: "الرحيق المختوم", en: "The Sealed Nectar" }, author: { ar: "المباركفوري", en: "Al-Mubarakpuri" } },
      { title: { ar: "السيرة النبوية", en: "The Prophetic Biography" }, author: { ar: "ابن هشام", en: "Ibn Hisham" } },
      { title: { ar: "فقه السيرة", en: "Fiqh as-Seerah" }, author: { ar: "البوطي", en: "Al-Buti" } },
    ],
    faqs: [
      {
        q: { ar: "ما الفرق بين السيرة والحديث؟", en: "What's the difference between seerah and hadith?" },
        a: { ar: "السيرة تتناول حياة النبي ﷺ الزمنية وأحداثها، والحديث يدرس أقواله وأفعاله وتقريراته كأدلة شرعية.", en: "Seerah covers the Prophet's ﷺ chronological life and events, while hadith studies his statements and actions as legal evidences." },
      },
    ],
    relatedSlugs: ["history", "hadith", "dawah"],
  },
  {
    id: "dawah",
    slug: "dawah",
    icon: "📢",
    color: "from-primary-500 to-primary-600",
    title: { ar: "الدعوة", en: "Dawah" },
    subtitle: { ar: "الدعوة إلى الله بحكمة وموعظة حسنة", en: "Calling to Allah with Wisdom" },
    description: {
      ar: "الدعوة إلى الله هي مهمة الأنبياء وورثتهم، وتشمل البلاغ والبيان والحجة والموعظة الحسنة بأساليب متنوعة تراعي أحوال المدعوين.",
      en: "Dawah to Allah is the mission of prophets and their inheritors, including conveying, clarifying, arguing, and advising with wisdom, considering the states of those being called.",
    },
    verse: { ar: "﴿ ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ ﴾", en: "\"Invite to the way of your Lord with wisdom and good instruction.\"" },
    verseSource: { ar: "سورة النحل — الآية 125", en: "Surah An-Nahl — Verse 125" },
    topics: {
      ar: ["أصول الدعوة", "مهارات الداعية", "فقه الدعوة", "الدعوة في العصر الرقمي", "الدعوة لغير المسلمين", "الدعوة في الأقليات"],
      en: ["Dawah Principles", "Da'ee Skills", "Dawah Jurisprudence", "Digital Dawah", "Dawah to Non-Muslims", "Dawah in Minorities"],
    },
    books: [
      { title: { ar: "الدعوة إلى الله", en: "Calling to Allah" }, author: { ar: "عبد العزيز آل الشيخ", en: "Abdul-Aziz Al Sheikh" } },
      { title: { ar: "فن الدعوة", en: "The Art of Dawah" }, author: { ar: "محمد قطب", en: "Muhammad Qutb" } },
      { title: { ar: "منهج الأنبياء في الدعوة", en: "Prophetic Method in Dawah" }, author: { ar: "عائض القرني", en: "A'id al-Qarni" } },
    ],
    faqs: [
      {
        q: { ar: "هل الدعوة واجبة على كل مسلم؟", en: "Is dawah obligatory on every Muslim?" },
        a: { ar: "الدعوة بالمعروف واجب كفائي، لكن كل مسلم مطالب بنشر الخير حسب قدرته وعلمه.", en: "Dawah with goodness is a collective obligation, but every Muslim is expected to spread goodness according to their ability and knowledge." },
      },
    ],
    relatedSlugs: ["ethics", "atheism", "contemporary"],
  },
  {
    id: "history",
    slug: "history",
    icon: "🏛️",
    color: "from-stone-500 to-stone-600",
    title: { ar: "التاريخ الإسلامي", en: "Islamic History" },
    subtitle: { ar: "تاريخ الأمة وحضارتها", en: "History of the Ummah and Its Civilization" },
    description: {
      ar: "دراسة تاريخ الأمة الإسلامية من الخلافة الراشدة إلى العصر الحديث، بما فيها من إنجازات وسقوط ودروس، للاستفادة منها في الحاضر.",
      en: "Studying Islamic history from the Rightly Guided Caliphate to the modern era, including achievements, falls, and lessons for the present.",
    },
    verse: { ar: "﴿ فَاعْتَبِرُوا يَا أُولِي الْأَبْصَارِ ﴾", en: "\"So take warning, O people of vision.\"" },
    verseSource: { ar: "سورة الحشر — الآية 2", en: "Surah Al-Hashr — Verse 2" },
    topics: {
      ar: ["الخلفاء الراشدون", "الدولة الأموية", "الدولة العباسية", "الأندلس", "الدولة العثمانية", "العصر الحديث"],
      en: ["Rightly Guided Caliphs", "Umayyad Caliphate", "Abbasid Caliphate", "Andalusia", "Ottoman Empire", "Modern Era"],
    },
    books: [
      { title: { ar: "تاريخ الطبري", en: "History of al-Tabari" }, author: { ar: "ابن جرير الطبري", en: "Ibn Jarir al-Tabari" } },
      { title: { ar: "البداية والنهاية", en: "Al-Bidayah wa al-Nihayah" }, author: { ar: "ابن كثير", en: "Ibn Kathir" } },
      { title: { ar: "قصص الأنبياء", en: "Stories of the Prophets" }, author: { ar: "ابن كثير", en: "Ibn Kathir" } },
    ],
    faqs: [
      {
        q: { ar: "لماذا ندرس التاريخ الإسلامي؟", en: "Why study Islamic history?" },
        a: { ar: "للتأسي بالصالحين، وتجنب أخطاء السابقين، وفهم واقعنا، واستلهام الحلول من تجارب الأمة.", en: "To follow the righteous, avoid past mistakes, understand our reality, and draw solutions from the Ummah's experiences." },
      },
    ],
    relatedSlugs: ["seerah", "thought", "politics"],
  },
  {
    id: "ethics",
    slug: "ethics",
    icon: "💫",
    color: "from-cyan-500 to-cyan-600",
    title: { ar: "الأخلاق", en: "Ethics" },
    subtitle: { ar: "تزكية النفس والسلوك", en: "Self-Purification and Conduct" },
    description: {
      ar: "الأخلاق الإسلامية جوهر الرسالة، وتشمل الصدق والأمانة والرحمة والصبر والتواضع، وهي معيار كمال الإيمان.",
      en: "Islamic ethics are the essence of the message, including truthfulness, trustworthiness, mercy, patience, and humility - the measure of perfect faith.",
    },
    verse: { ar: "﴿ وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ ﴾", en: "\"And indeed, you are of a great moral character.\"" },
    verseSource: { ar: "سورة القلم — الآية 4", en: "Surah Al-Qalam — Verse 4" },
    topics: {
      ar: ["تزكية النفس", "الآداب الاجتماعية", "أخلاق المسلم مع ربه", "أخلاق المسلم مع الناس", "الرقائق والمواعظ", "الأمراض القلبية"],
      en: ["Self-Purification", "Social Etiquette", "Ethics with One's Lord", "Ethics with People", "Heart-Softening Narrations", "Diseases of the Heart"],
    },
    books: [
      { title: { ar: "إحياء علوم الدين", en: "Revival of Religious Sciences" }, author: { ar: "الغزالي", en: "Al-Ghazali" } },
      { title: { ar: "الترغيب والترهيب", en: "Encouragement and Warning" }, author: { ar: "المنذري", en: "Al-Mundhiri" } },
      { title: { ar: "رياض الصالحين", en: "Gardens of the Righteous" }, author: { ar: "النووي", en: "An-Nawawi" } },
    ],
    faqs: [
      {
        q: { ar: "هل الأخلاق جزء من الإيمان؟", en: "Are ethics part of faith?" },
        a: { ar: "نعم، الأخلاق من صميم الإيمان. قال ﷺ: «أكمل المؤمنين إيماناً أحسنهم خلقاً».", en: "Yes, ethics are core to faith. The Prophet ﷺ said: 'The most complete believers in faith are those best in character.'" },
      },
    ],
    relatedSlugs: ["family", "dawah", "seerah"],
  },
  {
    id: "family",
    slug: "family",
    icon: "👨‍👩‍👧‍👦",
    color: "from-pink-500 to-pink-600",
    title: { ar: "الأسرة", en: "Family" },
    subtitle: { ar: "أحكام الزواج والتربية والأسرة", en: "Marriage, Parenting, and Family" },
    description: {
      ar: "الأسرة لبنة المجتمع الأولى، ويشمل هذا المجال أحكام الزواج والطلاق والحضانة وتربية الأبناء وحقوق الزوجين.",
      en: "The family is the first building block of society. This field covers marriage, divorce, custody, parenting, and spousal rights.",
    },
    verse: { ar: "﴿ وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا ﴾", en: "\"And of His signs is that He created for you from yourselves mates that you may find tranquility in them.\"" },
    verseSource: { ar: "سورة الروم — الآية 21", en: "Surah Ar-Rum — Verse 21" },
    topics: {
      ar: ["اختيار الزوج والزوجة", "حقوق الزوجين", "تربية الأبناء", "الطلاق وأحكامه", "النفقة والحضانة", "العلاقات الأسرية"],
      en: ["Choosing a Spouse", "Spousal Rights", "Parenting", "Divorce and Its Rulings", "Maintenance and Custody", "Family Relationships"],
    },
    books: [
      { title: { ar: "تحفة الأحوذي", en: "Tuhfat al-Ahwadhi" }, author: { ar: "المباركفوري", en: "Al-Mubarakpuri" } },
      { title: { ar: "تربية الأولاد في الإسلام", en: "Raising Children in Islam" }, author: { ar: "محمد جميل زينو", en: "Muhammad Jamil Zino" } },
      { title: { ar: "الأسرة المسلمة", en: "The Muslim Family" }, author: { ar: "حسن أيوب", en: "Hassan Ayyub" } },
    ],
    faqs: [
      {
        q: { ar: "ما أهم شروط اختيار الزوجة؟", en: "What are the key criteria for choosing a wife?" },
        a: { ar: "الدين والخلق هما الأهم، لقوله ﷺ: «تنكح المرأة لأربع... فاظفر بذات الدين تربت يداك».", en: "Religion and character are most important. The Prophet ﷺ said: 'A woman is married for four reasons... so choose the one with religion.'" },
      },
    ],
    relatedSlugs: ["fiqh", "women", "youth"],
  },
  {
    id: "youth",
    slug: "youth",
    icon: "🌱",
    color: "from-lime-500 to-lime-600",
    title: { ar: "الشباب", en: "Youth" },
    subtitle: { ar: "قضايا وهموم وحلول", en: "Issues, Concerns, and Solutions" },
    description: {
      ar: "الشباب عماد الأمة ومستقبلها، ويواجهون تحديات فريدة في العصر الحديث من هوية وعلاقات وتعليم وعمل، وهذا المجال يقدم رؤية إسلامية لهذه القضايا.",
      en: "Youth are the backbone and future of the Ummah, facing unique modern challenges of identity, relationships, education, and work. This field offers an Islamic vision for these issues.",
    },
    verse: { ar: "﴿ إِنَّهُمْ فِتْيَةٌ آمَنُوا بِرَبِّهِمْ وَزِدْنَاهُمْ هُدًى ﴾", en: "\"Indeed, they were youths who believed in their Lord, and We increased them in guidance.\"" },
    verseSource: { ar: "سورة الكهف — الآية 13", en: "Surah Al-Kahf — Verse 13" },
    topics: {
      ar: ["الهوية والانتماء", "العلاقات والصداقة", "التعليم والدراسة", "العمل والمستقبل", "التحديات الرقمية", "الصحة النفسية"],
      en: ["Identity and Belonging", "Relationships and Friendship", "Education and Studies", "Work and Future", "Digital Challenges", "Mental Health"],
    },
    books: [
      { title: { ar: "شباب الصحابة", en: "Youth of the Companions" }, author: { ar: "محمد علي قطب", en: "Muhammad Ali Qutb" } },
      { title: { ar: "الشباب بين الماضي والحاضر", en: "Youth: Past and Present" }, author: { ar: "محمد قطب", en: "Muhammad Qutb" } },
      { title: { ar: "مشكلات الشباب", en: "Youth Problems" }, author: { ar: "علي الطنطاوي", en: "Ali al-Tantawi" } },
    ],
    faqs: [
      {
        q: { ar: "كيف أتعامل مع ضغط الأقران؟", en: "How do I handle peer pressure?" },
        a: { ar: "بالثقة بالهوية الإسلامية، واختيار الصحبة الصالحة، والتدرج في قول 'لا' لما يخالف الشرع مع اللين والحكمة.", en: "By being confident in Islamic identity, choosing righteous companions, and gradually saying 'no' to what contradicts shariah with gentleness and wisdom." },
      },
    ],
    relatedSlugs: ["family", "ethics", "contemporary"],
  },
  {
    id: "women",
    slug: "women",
    icon: "🧕",
    color: "from-rose-500 to-rose-600",
    title: { ar: "المرأة", en: "Women" },
    subtitle: { ar: "قضايا المرأة المسلمة وأحكامها", en: "Issues of the Muslim Woman" },
    description: {
      ar: "المرأة نصف المجتمع ومربية الأجيال، وهذا المجال يناقش قضاياها الفقهية والأسرية والاجتماعية والدعوية بخصوصية واهتمام.",
      en: "Women are half of society and the educators of generations. This field discusses their fiqh, family, social, and dawah issues with care and privacy.",
    },
    verse: { ar: "﴿ وَلَهُنَّ مِثْلُ الَّذِي عَلَيْهِنَّ بِالْمَعْرُوفِ ﴾", en: "\"And they (women) have rights similar to those (of men) upon them in a fair manner.\"" },
    verseSource: { ar: "سورة البقرة — الآية 228", en: "Surah Al-Baqarah — Verse 228" },
    topics: {
      ar: ["أحكام الطهارة والصلاة", "الحجاب واللباس", "العمل والدراسة", "الزواج والأمومة", "الدعوة النسائية", "النساء في التاريخ الإسلامي"],
      en: ["Purification and Prayer Rulings", "Hijab and Clothing", "Work and Study", "Marriage and Motherhood", "Women's Dawah", "Women in Islamic History"],
    },
    books: [
      { title: { ar: "فتاوى المرأة المسلمة", en: "Fatwas of the Muslim Woman" }, author: { ar: "محمد صالح المنجد", en: "Muhammad Al-Munajjid" } },
      { title: { ar: "نساء حول الرسول", en: "Women Around the Messenger" }, author: { ar: "محمد علي قطب", en: "Muhammad Ali Qutb" } },
      { title: { ar: "المرأة في الإسلام", en: "Women in Islam" }, author: { ar: "عائض القرني", en: "A'id al-Qarni" } },
    ],
    faqs: [
      {
        q: { ar: "هل يمكن للمرأة العمل في الإسلام؟", en: "Can women work in Islam?" },
        a: { ar: "نعم، بضوابط شرعية كالحجاب وعدم الاختلاط المحرم، وكون العمل لا يتعارض مع واجباتها الأسرية.", en: "Yes, with Islamic conditions like hijab, avoiding unlawful mixing, and work not conflicting with family duties." },
      },
    ],
    relatedSlugs: ["family", "fiqh", "ethics"],
  },
  {
    id: "contemporary",
    slug: "contemporary",
    icon: "🌍",
    color: "from-blue-500 to-blue-600",
    title: { ar: "القضايا المعاصرة", en: "Contemporary Issues" },
    subtitle: { ar: "النوازل والمستجدات الفقهية", en: "Modern Issues and New Fiqh Matters" },
    description: {
      ar: "قضايا مستجدة لم تكن في عصر النبوة تحتاج إلى اجتهاد فقهي مبني على الأصول، مثل العملات الرقمية والتبرع بالأعضاء والذكاء الاصطناعي.",
      en: "New issues that did not exist in the Prophetic era require ijtihad based on principles, such as cryptocurrencies, organ donation, and AI.",
    },
    verse: { ar: "﴿ وَمَا كَانَ لِمُؤْمِنٍ وَلَا مُؤْمِنَةٍ إِذَا قَضَى اللَّهُ وَرَسُولُهُ أَمْرًا أَن يَكُونَ لَهُمُ الْخِيَرَةُ ﴾", en: "\"It is not for a believing man or a believing woman, when Allah and His Messenger have decided a matter, that they should have any choice.\"" },
    verseSource: { ar: "سورة الأحزاب — الآية 36", en: "Surah Al-Ahzab — Verse 36" },
    topics: {
      ar: ["العملات الرقمية", "الطب والتبرع بالأعضاء", "الذكاء الاصطناعي", "وسائل التواصل", "الأقليات المسلمة", "القضايا البيئية"],
      en: ["Cryptocurrencies", "Medicine and Organ Donation", "Artificial Intelligence", "Social Media", "Muslim Minorities", "Environmental Issues"],
    },
    books: [
      { title: { ar: "فقه النوازل", en: "Fiqh of New Issues" }, author: { ar: "البوطي", en: "Al-Buti" } },
      { title: { ar: "قضايا فقهية معاصرة", en: "Contemporary Fiqh Issues" }, author: { ar: "وهبة الزحيلي", en: "Wahbah al-Zuhayli" } },
      { title: { ar: "فتاوى معاصرة", en: "Modern Fatwas" }, author: { ar: "القرضاوي", en: "Al-Qaradawi" } },
    ],
    faqs: [
      {
        q: { ar: "هل العملات الرقمية حلال؟", en: "Are cryptocurrencies halal?" },
        a: { ar: "الأمر مختلف فيه بين العلماء، ويعتمد على نوع العملة والاستخدام. استشر العلماء المختصين في كل حالة.", en: "Scholars differ, depending on the type of currency and use. Consult specialized scholars for each case." },
      },
    ],
    relatedSlugs: ["fiqh", "thought", "politics"],
  },
  {
    id: "quran-sciences",
    slug: "quran-sciences",
    icon: "📚",
    color: "from-emerald-500 to-teal-600",
    title: { ar: "علوم القرآن", en: "Quranic Sciences" },
    subtitle: { ar: "العلوم المتعلقة بالقرآن الكريم", en: "Sciences Related to the Noble Quran" },
    description: {
      ar: "علوم القرآن تشمل علوم النزول والجمع والرسم والإعجاز والقراءات وأسباب النزول والمكي والمدني وغيرها.",
      en: "Quranic sciences include revelation, compilation, script, inimitability, recitations, reasons for revelation, Meccan/Medinan classification, and more.",
    },
    verse: { ar: "﴿ إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ ﴾", en: "\"Indeed, it is We who sent down the Qur'an and indeed, We will be its guardian.\"" },
    verseSource: { ar: "سورة الحجر — الآية 9", en: "Surah Al-Hijr — Verse 9" },
    topics: {
      ar: ["نزول القرآن وجمعه", "رسم المصحف", "القراءات", "الإعجاز القرآني", "المكي والمدني", "أسباب النزول"],
      en: ["Revelation and Compilation", "Mushaf Script", "Recitations", "Quranic Miraculousness", "Meccan and Medinan", "Reasons for Revelation"],
    },
    books: [
      { title: { ar: "الإتقان في علوم القرآن", en: "Al-Itqan fi Ulum al-Quran" }, author: { ar: "السيوطي", en: "As-Suyuti" } },
      { title: { ar: "البرهان في علوم القرآن", en: "Al-Burhan fi Ulum al-Quran" }, author: { ar: "الزركشي", en: "Az-Zarkashi" } },
      { title: { ar: "مباحث في علوم القرآن", en: "Topics in Quranic Sciences" }, author: { ar: "مناع القطان", en: "Manna' Al-Qattan" } },
    ],
    faqs: [
      {
        q: { ar: "هل القرآن محفوظ فعلاً؟", en: "Is the Quran truly preserved?" },
        a: { ar: "نعم، حفظه الله تعالى بنفسه، ونقل بالتواتر جيلاً بعد جيل، وأجمع العلماء على سلامته من التحريف.", en: "Yes, Allah preserved it Himself, transmitted by mass narration generation after generation, and scholars unanimously agree it is free from distortion." },
      },
    ],
    relatedSlugs: ["tafsir", "hadith", "aqeedah"],
  },
  {
    id: "comparison",
    slug: "comparison",
    icon: "🔍",
    color: "from-violet-500 to-violet-600",
    title: { ar: "الأديان المقارنة", en: "Comparative Religion" },
    subtitle: { ar: "دراسة الأديان الأخرى ومقارنتها بالإسلام", en: "Studying Other Religions vs. Islam" },
    description: {
      ar: "علم يدرس الأديان السماوية والوضعية، ويقارنها بالإسلام بمنهجية علمية، لإظهار محاسن الإسلام وتميزه، والرد على الطعون.",
      en: "A science that studies heavenly and man-made religions and compares them to Islam methodologically, to show Islam's merits and respond to criticisms.",
    },
    verse: { ar: "﴿ لَكُمْ دِينُكُمْ وَلِيَ دِينِ ﴾", en: "\"For you is your religion, and for me is my religion.\"" },
    verseSource: { ar: "سورة الكافرون — الآية 6", en: "Surah Al-Kafirun — Verse 6" },
    topics: {
      ar: ["اليهودية", "المسيحية", "الهندوسية", "البوذية", "الأديان الوضعية", "الحوار بين الأديان"],
      en: ["Judaism", "Christianity", "Hinduism", "Buddhism", "Man-Made Religions", "Interfaith Dialogue"],
    },
    books: [
      { title: { ar: "هداية الحيارى", en: "Guidance of the Perplexed" }, author: { ar: "ابن القيم", en: "Ibn al-Qayyim" } },
      { title: { ar: "إظهار الحق", en: "Izhar al-Haqq" }, author: { ar: "رحمة الله الكيرانوي", en: "Rahmatullah Kairanawi" } },
      { title: { ar: "الأديان والمذاهب المعاصرة", en: "Contemporary Religions and Sects" }, author: { ar: "أحمد الشلبي", en: "Ahmad al-Shalabi" } },
    ],
    faqs: [
      {
        q: { ar: "هل يصح دراسة الأديان الأخرى؟", en: "Is it permissible to study other religions?" },
        a: { ar: "نعم، لأهل العلم الراسخين للرد على الطعون والدعوة إلى الإسلام، أما العامة فقد تشوش عليهم.", en: "Yes, for firmly grounded scholars to respond to criticisms and make dawah, but ordinary people may be confused by it." },
      },
    ],
    relatedSlugs: ["atheism", "dawah", "aqeedah"],
  },
  {
    id: "atheism",
    slug: "atheism",
    icon: "🧠",
    color: "from-red-500 to-red-600",
    title: { ar: "الإلحاد والشبهات", en: "Atheism & Doubts" },
    subtitle: { ar: "الرد على الإلحاد والشبهات المعاصرة", en: "Responding to Atheism and Modern Doubts" },
    description: {
      ar: "مجال متخصص في الرد على الشبهات الإلحادية والعلمانية والفلسفية التي تنتشر في العصر الحديث، بأدلة عقلية ونقلية.",
      en: "A specialized field responding to atheist, secular, and philosophical doubts spread in the modern era with rational and textual evidences.",
    },
    verse: { ar: "﴿ أَمْ خُلِقُوا مِنْ غَيْرِ شَيْءٍ أَمْ هُمُ الْخَالِقُونَ ﴾", en: "\"Or were they created by nothing, or were they the creators of themselves?\"" },
    verseSource: { ar: "سورة الطور — الآية 35", en: "Surah At-Tur — Verse 35" },
    topics: {
      ar: ["وجود الله", "مشكلة الشر", "الإلحاد العلمي", "الإلحاد الأخلاقي", "العلمانية", "التنوير والحداثة"],
      en: ["Existence of God", "Problem of Evil", "Scientific Atheism", "Moral Atheism", "Secularism", "Enlightenment and Modernity"],
    },
    books: [
      { title: { ar: "دعائم الإيمان", en: "Pillars of Faith" }, author: { ar: "عبد الرحمن حبنكة الميداني", en: "Abdurrahman Habannaka" } },
      { title: { ar: "الرد على الملاحدة", en: "Reply to Atheists" }, author: { ar: "ماجد عرسان الكيلاني", en: "Majed Arsan al-Kilani" } },
      { title: { ar: "صراع مع الملاحدة", en: "Struggle with Atheists" }, author: { ar: "عبد الرحمن حبنكة الميداني", en: "Abdurrahman Habannaka" } },
    ],
    faqs: [
      {
        q: { ar: "هل العلم يناقض الإيمان؟", en: "Does science contradict faith?" },
        a: { ar: "العلم الحقيقي لا يناقض الإيمان، بل كثير من العلماء ازدادوا إيماناً بالعلم. التناقض المزعوم يأتي من سوء الفهم.", en: "True science does not contradict faith; many scientists increased in faith through science. The alleged contradiction comes from misunderstanding." },
      },
    ],
    relatedSlugs: ["aqeedah", "dawah", "thought"],
  },
  {
    id: "thought",
    slug: "thought",
    icon: "💡",
    color: "from-yellow-500 to-yellow-600",
    title: { ar: "الفكر الإسلامي", en: "Islamic Thought" },
    subtitle: { ar: "التيارات الفكرية والمذاهب", en: "Intellectual Currents and Schools" },
    description: {
      ar: "دراسة التيارات الفكرية الإسلامية المعاصرة، والمذاهب الفكرية، والإشكاليات المطروحة على الساحة، مع تقييمها من منظور إسلامي أصيل.",
      en: "Studying contemporary Islamic intellectual currents, schools of thought, and issues on the scene, with evaluation from an authentic Islamic perspective.",
    },
    verse: { ar: "﴿ قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ ﴾", en: "\"Say: Are those who know equal to those who do not know?\"" },
    verseSource: { ar: "سورة الزمر — الآية 9", en: "Surah Az-Zumar — Verse 9" },
    topics: {
      ar: ["الإسلام السياسي", "الإسلام الليبرالي", "التجديد الديني", "التصوف", "السلفية", "الفكر الإسلامي الحديث"],
      en: ["Political Islam", "Liberal Islam", "Religious Renewal", "Sufism", "Salafism", "Modern Islamic Thought"],
    },
    books: [
      { title: { ar: "شبهات حول الإسلام", en: "Doubts about Islam" }, author: { ar: "محمد قطب", en: "Muhammad Qutb" } },
      { title: { ar: "مستقبل الإسلام", en: "The Future of Islam" }, author: { ar: "مالك بن نبي", en: "Malik Bennabi" } },
      { title: { ar: "كيف نفهم الإسلام", en: "How to Understand Islam" }, author: { ar: "سيد قطب", en: "Sayyid Qutb" } },
    ],
    faqs: [
      {
        q: { ar: "هل كل التيارات الإسلامية صحيحة؟", en: "Are all Islamic currents correct?" },
        a: { ar: "لا، يجب عرض الأفكار على الكتاب والسنة بفهم السلف الصالح، وما خالفهما يُردّ.", en: "No, ideas must be presented to the Quran and Sunnah as understood by the pious predecessors, and whatever contradicts them is rejected." },
      },
    ],
    relatedSlugs: ["atheism", "contemporary", "politics"],
  },
  {
    id: "politics",
    slug: "politics",
    icon: "🏛️",
    color: "from-slate-500 to-slate-600",
    title: { ar: "السياسة الشرعية", en: "Islamic Politics" },
    subtitle: { ar: "أحكام الحكم والإمارة", en: "Rulings of Governance and Leadership" },
    description: {
      ar: "السياسة الشرعية هي إدارة شؤون الأمة بما يحقق المصالح ويدرأ المفاسد وفق أحكام الشريعة، وتشمل أحكام الحاكم والمحكوم والعلاقات الدولية.",
      en: "Islamic politics is managing the affairs of the Ummah to achieve benefits and ward off harms according to shariah rulings, including governor-governed relations and international relations.",
    },
    verse: { ar: "﴿ وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ ﴾", en: "\"And whose affair is [determined by] consultation among themselves.\"" },
    verseSource: { ar: "سورة الشورى — الآية 38", en: "Surah Ash-Shura — Verse 38" },
    topics: {
      ar: ["أحكام الإمامة", "الشورى", "العلاقات الدولية", "الجهاد", "البيعة والطاعة", "الدولة الإسلامية"],
      en: ["Rulings of Leadership", "Consultation", "International Relations", "Jihad", "Allegiance and Obedience", "Islamic State"],
    },
    books: [
      { title: { ar: "الأحكام السلطانية", en: "Al-Ahkam As-Sultaniyyah" }, author: { ar: "الماوردي", en: "Al-Mawardi" } },
      { title: { ar: "السياسة الشرعية", en: "Islamic Politics" }, author: { ar: "ابن تيمية", en: "Ibn Taymiyyah" } },
      { title: { ar: "أصول النظام السياسي", en: "Foundations of Political System" }, author: { ar: "محمد ضياء الدين الرايس", en: "Muhammad Dia' ad-Din ar-Rayyis" } },
    ],
    faqs: [
      {
        q: { ar: "ما حكم طاعة الحاكم؟", en: "What is the ruling on obeying the ruler?" },
        a: { ar: "الطاعة في المعروف واجبة، ولا طاعة لمخلوق في معصية الخالق.", en: "Obedience in goodness is obligatory, and there is no obedience to creation in disobeying the Creator." },
      },
    ],
    relatedSlugs: ["history", "contemporary", "fiqh"],
  },
];

// ============================================================
// نصوص الواجهة العامة
// ============================================================

const UI: Record<Lang, {
  home: string;
  explore: string;
  topicsTitle: string;
  topicsDesc: string;
  booksTitle: string;
  booksDesc: string;
  faqTitle: string;
  relatedTitle: string;
  relatedFields: string;
  nextField: string;
  prevField: string;
  author: string;
  allFields: string;
  notFoundTitle: string;
  notFoundDesc: string;
  backToFields: string;
}> = {
  ar: {
    home: "الرئيسية",
    explore: "استكشف",
    topicsTitle: "المواضيع الرئيسية",
    topicsDesc: "أهم المواضيع التي يغطيها هذا المجال",
    booksTitle: "كتب مقترحة",
    booksDesc: "أهم المراجع في هذا المجال",
    faqTitle: "أسئلة شائعة",
    relatedTitle: "مجالات ذات صلة",
    relatedFields: "مجالات مرتبطة",
    nextField: "المجال التالي",
    prevField: "المجال السابق",
    author: "المؤلف",
    allFields: "جميع المجالات",
    notFoundTitle: "المجال غير موجود",
    notFoundDesc: "عذراً، لم نتمكن من العثور على هذا المجال.",
    backToFields: "العودة للمجالات",
  },
  en: {
    home: "Home",
    explore: "Explore",
    topicsTitle: "Main Topics",
    topicsDesc: "Key topics covered in this field",
    booksTitle: "Recommended Books",
    booksDesc: "Important references in this field",
    faqTitle: "Frequently Asked Questions",
    relatedTitle: "Related Fields",
    relatedFields: "Related fields",
    nextField: "Next Field",
    prevField: "Previous Field",
    author: "Author",
    allFields: "All Fields",
    notFoundTitle: "Field Not Found",
    notFoundDesc: "Sorry, we couldn't find this field.",
    backToFields: "Back to Fields",
  },
};

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isValidLang(lang)) return {};

  const l = lang as Lang;
  const field = FIELDS.find((f) => f.slug === slug);
  if (!field) return {};

  return {
    title: field.title[l],
    description: field.description[l],
    alternates: {
      canonical: `/${l}/fields/${slug}`,
      languages: {
        ar: `/ar/fields/${slug}`,
        en: `/en/fields/${slug}`,
      },
    },
    openGraph: {
      title: field.title[l],
      description: field.description[l],
      url: `/${l}/fields/${slug}`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "article",
      images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: field.title[l] }],
    },
    twitter: {
      card: "summary_large_image",
      title: field.title[l],
      description: field.description[l],
      images: ["/icons/icon-512.png"],
    },
  };
}

export function generateStaticParams() {
  return FIELDS.flatMap((field) => [
    { lang: "ar", slug: field.slug },
    { lang: "en", slug: field.slug },
  ]);
}

// ============================================================
// الصفحة
// ============================================================

export default async function FieldPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const isRTL = l === "ar";
  const ui = UI[l];

  const field = FIELDS.find((f) => f.slug === slug);
  if (!field) notFound();

  const currentIndex = FIELDS.findIndex((f) => f.slug === slug);
  const prevField = currentIndex > 0 ? FIELDS[currentIndex - 1] : null;
  const nextField = currentIndex < FIELDS.length - 1 ? FIELDS[currentIndex + 1] : null;
  const relatedFields = FIELDS.filter((f) => field.relatedSlugs.includes(f.slug));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: field.title[l],
        description: field.description[l],
        inLanguage: l,
        url: `/${l}/fields/${slug}`,
        articleSection: isRTL ? "العلوم الشرعية" : "Islamic Sciences",
        keywords: field.topics[l].join(", "),
      },
      {
        "@type": "FAQPage",
        mainEntity: field.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q[l],
          acceptedAnswer: { "@type": "Answer", text: faq.a[l] },
        })),
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
        title={field.title[l]}
        subtitle={field.subtitle[l]}
        backHref={`/${l}/fields`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${l}` },
          { label: ui.allFields, href: `/${l}/fields` },
          { label: field.title[l] },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== Hero مخصص ===== */}
        <div className={`card relative mb-8 overflow-hidden border-2 border-transparent p-8 md:p-12 bg-gradient-to-br ${field.color} text-white`}>
          <div className="absolute inset-0 bg-black/20" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 text-5xl backdrop-blur-sm shadow-2xl">
                {field.icon}
              </span>
            </div>

            <h1
              className="mb-4 text-3xl font-black leading-tight md:text-5xl"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {field.title[l]}
            </h1>

            <p className="mb-6 text-lg leading-relaxed opacity-95">
              {field.subtitle[l]}
            </p>

            <div className="inline-block rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <p
                className="mb-2 text-xl font-black md:text-2xl"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {field.verse[l]}
              </p>
              <p className="text-xs opacity-90">
                {field.verseSource[l]}
              </p>
            </div>
          </div>
        </div>

        {/* ===== الوصف ===== */}
        <div className="card mb-8 overflow-hidden">
          <div className={`gradient-primary h-1.5 w-full bg-gradient-to-r ${field.color}`} />
          <div className="p-6 md:p-8">
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-200">
              {field.description[l]}
            </p>
          </div>
        </div>

        {/* ===== إحصائيات ===== */}
        <div className="mb-10 grid grid-cols-3 gap-4">
          <StatCard icon="📚" value={field.topics[l].length} label={isRTL ? "مواضيع" : "Topics"} color={field.color} />
          <StatCard icon="📖" value={field.books.length} label={isRTL ? "كتب" : "Books"} color={field.color} />
          <StatCard icon="❓" value={field.faqs.length} label={isRTL ? "أسئلة" : "Questions"} color={field.color} />
        </div>

        {/* ===== المواضيع الرئيسية ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.topicsTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.topicsDesc}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {field.topics[l].map((topic, index) => (
              <div
                key={index}
                className="card card-interactive group relative overflow-hidden p-5"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${field.color}`} />
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${field.color} text-sm font-black text-white shadow-md`}>
                    {index + 1}
                  </span>
                  <h3
                    className="text-base font-black text-slate-900 dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {topic}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== الكتب المقترحة ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.booksTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.booksDesc}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {field.books.map((book, index) => (
              <div
                key={index}
                className="card relative overflow-hidden p-6"
              >
                <div className="gradient-gold absolute inset-x-0 top-0 h-1" />
                <div className="mb-4 flex justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-100 text-3xl dark:bg-gold-900/40">
                    📖
                  </span>
                </div>
                <h3
                  className="mb-2 text-center text-lg font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {book.title[l]}
                </h3>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  {ui.author}: {book.author[l]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== الأسئلة الشائعة ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.faqTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
          </div>

          <div className="space-y-4">
            {field.faqs.map((faq, index) => (
              <details key={index} className="card group p-6 md:p-7">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <h3
                    className="text-lg font-black leading-relaxed text-slate-900 md:text-xl dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    ❓ {faq.q[l]}
                  </h3>
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-transform duration-300 group-open:rotate-45 dark:bg-primary-900/40 dark:text-primary-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-5 border-t border-slate-100 pt-5 dark:border-night-700">
                  <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                    {faq.a[l]}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ===== مجالات ذات صلة ===== */}
        {relatedFields.length > 0 && (
          <div className="mb-12">
            <div className="mb-6 text-center">
              <h2 className="section-title mb-0">{ui.relatedTitle}</h2>
              <div className="islamic-divider my-0">
                <span className="text-xl text-gold-500">✦</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {relatedFields.map((relField) => (
                <Link
                  key={relField.id}
                  href={`/${l}/fields/${relField.slug}`}
                  className="card card-interactive group relative overflow-hidden p-6"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${relField.color}`} />
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${relField.color} text-2xl text-white shadow-md`}>
                      {relField.icon}
                    </span>
                    <h3
                      className="text-lg font-black text-slate-900 dark:text-white"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {relField.title[l]}
                    </h3>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {relField.subtitle[l]}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ===== التنقل بين المجالات ===== */}
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {prevField && (
            <Link
              href={`/${l}/fields/${prevField.slug}`}
              className="card card-interactive group flex items-center gap-4 p-5"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${prevField.color} text-2xl text-white shadow-md`}>
                {prevField.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  ← {ui.prevField}
                </p>
                <p className="truncate font-black text-slate-900 dark:text-white">
                  {prevField.title[l]}
                </p>
              </div>
            </Link>
          )}

          {nextField && (
            <Link
              href={`/${l}/fields/${nextField.slug}`}
              className="card card-interactive group flex items-center gap-4 p-5 text-end md:text-start"
            >
              <div className="min-w-0 flex-1 text-end md:text-start">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {ui.nextField} →
                </p>
                <p className="truncate font-black text-slate-900 dark:text-white">
                  {nextField.title[l]}
                </p>
              </div>
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${nextField.color} text-2xl text-white shadow-md`}>
                {nextField.icon}
              </span>
            </Link>
          )}
        </div>

        {/* ===== CTA العودة ===== */}
        <div className="text-center">
          <Link href={`/${l}/fields`} className="btn-primary inline-flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isRTL ? "rotate-180" : ""}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {ui.allFields}
          </Link>
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
  icon, value, label, color,
}: {
  icon: string;
  value: number | string;
  label: string;
  color: string;
}) {
  return (
    <div className="card p-5 text-center">
      <div className="mb-2 flex justify-center">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-2xl text-white shadow-md`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}