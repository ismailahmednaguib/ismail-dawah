export interface Settings {
  ownerName: string; shortName: string; jobTitle: string; kicker: string; motto: string;
  bio: string[]; cred1: string; cred2: string; interests: string[];
  wa: string; email: string; address: string; portraitSrc: string; ogImage: string;
  showPrayerBar: boolean;
  liveUrl: string; liveTitle: string; meetingDay: string; meetingTime: string; meetingPlace: string; meetingLink: string;
  appUrl: string;
  // التحكم في نصوص الصفحة الرئيسية
  homeKicker?: string;
  homeHeroText?: string;
  // التحكم في ألوان الموقع
  primaryColor?: string;
  goldColor?: string;
  creamColor?: string;
  // التحكم في الفوتر
  footerText?: string;
  copyrightText?: string;
  // التحكم في صفحات المحتوى
  doubtsIntro?: string;
  learnIntro?: string;
  prayerGuideIntro?: string;
  embraceIslamIntro?: string;
  aboutIntro?: string;
  contactIntro?: string;
  // روابط السوشيال ميديا
  facebookUrl?: string;
  youtubeUrl?: string;
  telegramUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
}
export interface Field { id: number; slug: string; name: string; icon: string; desc: string; }
export interface Stat { num: string; label: string; }
export interface Lesson { id: number; title: string; category: string; date: string; link: string; desc: string; field: string; t?: Record<string, { title?: string; desc?: string }>; }
export interface Video { id: number; title: string; url: string; desc: string; field: string; t?: Record<string, { title?: string; desc?: string }>; }
export interface Article { id: number; title: string; date: string; excerpt: string; body: string; field: string; t?: Record<string, { title?: string; excerpt?: string; body?: string }>; }
export interface Book { id: number; title: string; field: string; url: string; desc: string; t?: Record<string, { title?: string; desc?: string }>; }
export interface AudioItem { id: number; title: string; url: string; desc: string; field: string; t?: Record<string, { title?: string; desc?: string }>; }
export interface Photo { id: number; url: string; caption: string; field: string; }
export interface ScheduleItem { id: number; day: string; time: string; topic: string; place: string; }
export interface Fatwa { id: number; q: string; a: string; t?: Record<string, { q?: string; a?: string }>; }
export interface Project { id: number; title: string; desc: string; goal: string; t?: Record<string, { title?: string; desc?: string }>; }
export interface NewsItem { id: number; title: string; date: string; body: string; t?: Record<string, { title?: string; body?: string }>; }
export interface Place { id: number; name: string; area: string; note: string; }
export interface Dhikr { id: number; category: string; text: string; repeat: number; }
export interface Doubt { id: number; category: string; q: string; a: string; t?: Record<string, { q?: string; a?: string }>; }
export interface LearnStep { id: number; order: number; title: string; desc: string; field: string; t?: Record<string, { title?: string; desc?: string }>; }

export const settings: Settings = {
  ownerName: "فضيلة الشيخ إسماعيل أحمد نجيب",
  shortName: "الشيخ إسماعيل",
  jobTitle: "داعية إسلامي • باحث في مقارنة الأديان",
  kicker: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  motto: "«أَدْعُو إِلَى اللَّهِ عَلَىٰ بَصِيرَةٍ»",
  bio: [
    "خريج كلية الدعوة الإسلامية بجامعة الأزهر الشريف، وباحث دراسات عُليا في تخصص مقارنة الأديان.",
    "أسعى لنشر العلم الشرعي الصحيح بأسلوب ميسَّر، يجمع بين أصالة المنهج الأزهري الوسطي وفهم واقع الناس وقضاياهم.",
  ],
  cred1: "ليسانس كلية الدعوة الإسلامية — الأزهر الشريف",
  cred2: "دراسات عُليا — تخصص مقارنة الأديان",
  interests: ["العقيدة الإسلامية", "فقه العبادات", "السيرة النبوية", "مقارنة الأديان"],
  wa: "201000000000",
  email: "example@email.com",
  address: "جمهورية مصر العربية",
  portraitSrc: "",
  ogImage: "",
  showPrayerBar: true,
  liveUrl: "",
  liveTitle: "البث المباشر للمجلس الأسبوعي",
  meetingDay: "الخميس",
  meetingTime: "بعد صلاة العشاء",
  meetingPlace: "مسجد النور — قاعة المحاضرات",
  meetingLink: "",
  appUrl: "",
  homeKicker: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  homeHeroText: "العلم نور والدعوة أمانة",
  primaryColor: "#0b2e22",
  goldColor: "#c9a227",
  creamColor: "#f5f1e8",
  footerText: "العلم نور والدعوة أمانة",
  copyrightText: "جميع الحقوق محفوظة",
  doubtsIntro: "ردود علمية على الشبهات المثارة حول الإسلام",
  learnIntro: "خطة مرتبة لطالب العلم من البداية",
  prayerGuideIntro: "دليل مبسط خطوة بخطوة لتعلم الصلاة",
  embraceIslamIntro: "مرحبًا بك في رحلتك نحو الهداية",
  aboutIntro: "تعرف على الشيخ وسيرته العلمية",
  contactIntro: "تواصل معنا عبر الوسائل التالية",
  facebookUrl: "",
  youtubeUrl: "",
  telegramUrl: "",
  twitterUrl: "",
  instagramUrl: "",
};

export const fields: Field[] = [
  { id: 1, slug: "aqeedah", name: "العقيدة", icon: "🕌", desc: "التوحيد وأركان الإيمان والرد على الشبهات العقدية" },
  { id: 2, slug: "fiqh", name: "الفقه", icon: "⚖️", desc: "العبادات والمعاملات والأحوال الشخصية" },
  { id: 3, slug: "usul", name: "أصول الفقه", icon: "📜", desc: "القواعد التي يُبنى عليها الاستنباط" },
  { id: 4, slug: "hadith", name: "الحديث وعلومه", icon: "📿", desc: "المتن والسند ومصطلح الحديث" },
  { id: 5, slug: "tafsir", name: "التفسير", icon: "📖", desc: "تدبُّر القرآن وبيان معانيه" },
  { id: 6, slug: "quran-sciences", name: "علوم القرآن", icon: "🌟", desc: "أسباب النزول والناسخ والمنسوخ" },
  { id: 7, slug: "seerah", name: "السيرة النبوية", icon: "🌙", desc: "حياة النبي ﷺ ودروسها العملية" },
  { id: 8, slug: "history", name: "التاريخ الإسلامي", icon: "🏛️", desc: "من الخلفاء الراشدين إلى العصر الحديث" },
  { id: 9, slug: "comparative", name: "مقارنة الأديان", icon: "⚔️", desc: "دراسة الأديان والحوار والرد على الشبهات" },
  { id: 10, slug: "akhlaq", name: "الأخلاق والرقائق", icon: "💎", desc: "تزكية النفس ورقائق القلوب" },
  { id: 11, slug: "dawah", name: "الدعوة وأصولها", icon: "📢", desc: "فقه الدعوة ووسائلها المعاصرة" },
  { id: 12, slug: "arabic", name: "اللغة العربية", icon: "✒️", desc: "النحو والصرف والبلاغة لخدمة النصوص" },
  { id: 13, slug: "tajweed", name: "التجويد والقراءات", icon: "🎙️", desc: "حُسن تلاوة كتاب الله" },
  { id: 14, slug: "economics", name: "الاقتصاد الإسلامي", icon: "💰", desc: "المعاملات المالية المعاصرة" },
  { id: 15, slug: "faraaid", name: "الفرائض والمواريث", icon: "🧮", desc: "قسمة التركات وفق الكتاب والسنة" },
  { id: 16, slug: "family", name: "ركن الأسرة", icon: "👨‍👩‍👧", desc: "تربية وأزواج وبيوت مسلمة" },
  { id: 17, slug: "youth", name: "ركن الشباب", icon: "🧑", desc: "قضايا معاصرة بلسان شاب" },
];

export const stats: Stat[] = [
  { num: "+10", label: "سنوات في الدعوة" },
  { num: "+250", label: "درساً مسجَّلاً" },
  { num: "+15", label: "دورة علمية" },
];

export const lessons: Lesson[] = [
  { id: 1, title: "سلسلة: أركان الإيمان الستة", category: "عقيدة", date: "2024", link: "", desc: "شرح مُيسَّر لأركان الإيمان بأدلتها.", field: "aqeedah" },
  { id: 2, title: "فقه الطهارة والصلاة", category: "فقه", date: "2024", link: "", desc: "دورة عملية خطوة بخطوة.", field: "fiqh" },
];

export const videos: Video[] = [
  { id: 1, title: "كلمة: لماذا خُلقنا؟", url: "", desc: "كلمة قصيرة عن حقيقة العبودية لله.", field: "aqeedah" },
];

export const articles: Article[] = [];
export const books: Book[] = [];
export const audio: AudioItem[] = [];
export const photos: Photo[] = [];

export const schedule: ScheduleItem[] = [
  { id: 1, day: "السبت", time: "بعد صلاة المغرب", topic: "شرح كتاب التوحيد", place: "مسجد النور" },
];

export const fatwas: Fatwa[] = [
  { id: 1, q: "هل يجوز الدعاء بغير العربية في الصلاة؟", a: "الدعاء بغير العربية خارج الصلاة جائز عند الحاجة، وأما داخل الصلاة فالأحوط الاقتصار على المأثور بالعربية لمن قدر عليها، والله تعالى يعلم قصد الداعي قبل لسانه." },
  { id: 2, q: "كيف أحافظ على صلاة الفجر في جماعة؟", a: "النوم المبكر، وترك المنبهات ليلًا، ونية صادقة قبل النوم مع دعاء: «اللهم أعني على ذكرك وشكرك»، واتخاذ صاحب صالح يوقظك، وأهم من ذلك: صدق اللجاء إلى الله أن يثبتك." },
];

export const projects: Project[] = [
  { id: 1, title: "طباعة وتوزيع جزء عمّ", desc: "توزيع 1000 نسخة على طلاب الكتاتيب والمساجد في القرى.", goal: "50,000 جنيه" },
  { id: 2, title: "تجهيز قاعة الدروس الدعوية", desc: "فرش وتجهيز قاعة تتسع لـ 200 طالب علم بمركز الدعوة.", goal: "120,000 جنيه" },
];

export const news: NewsItem[] = [
  { id: 1, title: "انطلاق دورة شرح العقيدة الطحاوية", date: "1 مارس 2025", body: "بحمد الله انطلقت دورة شرح العقيدة الطحاوية بمركز الدعوة، بحضور أكثر من 150 طالبًا، وتستمر كل خميس بعد العشاء." },
  { id: 2, title: "مشاركة في مؤتمر حوار الأديان بالقاهرة", date: "12 فبراير 2025", body: "شارك الشيخ في مؤتمر حوار الأديان بورقة بحثية بعنوان: «منهج الأزهر في الحوار — أصالة وانفتاح»." },
];

export const places: Place[] = [
  { id: 1, name: "مسجد النور", area: "وسط المدينة", note: "درس السبت بعد المغرب — شرح كتاب التوحيد" },
  { id: 2, name: "المسجد الكبير", area: "الحي الغربي", note: "درس الاثنين بعد العشاء — فقه السيرة" },
];

export const adhkar: Dhikr[] = [
  { id: 1, category: "أذكار الصباح", text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ.", repeat: 1 },
  { id: 2, category: "أذكار الصباح", text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.", repeat: 3 },
  { id: 3, category: "أذكار المساء", text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ.", repeat: 1 },
  { id: 4, category: "أذكار المساء", text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", repeat: 3 },
];

export const doubts: Doubt[] = [
  { id: 1, category: "العقيدة", q: "لماذا خلقنا الله إذا كان يعلم من سيطيعه ومن سيعصيه؟", a: "علم الله السابق لا يُبطل الاختيار، فالله يعلم لكن العبد يختار ويحاسب على اختياره." },
  { id: 2, category: "القرآن", q: "هل القرآن محرَّف كما يُشاع؟", a: "القرآن محفوظ بحفظ الله: «إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ»." },
  { id: 3, category: "المرأة", q: "هل الإسلام يظلم المرأة؟", a: "الإسلام كرَّم المرأة وجعل لها ذمة مالية مستقلة، وحق التعليم والعمل." },
];

export const learnSteps: LearnStep[] = [
  { id: 1, order: 1, title: "ابدأ بالعقيدة الصحيحة", desc: "تعلم أركان الإيمان والتوحيد قبل كل شيء.", field: "aqeedah" },
  { id: 2, order: 2, title: "تعلم أحكام الطهارة والصلاة", desc: "حتى تعبد الله على بصيرة.", field: "fiqh" },
  { id: 3, order: 3, title: "اقرأ القرآن بتدبر", desc: "ورد يومي مع فهم المعاني.", field: "tafsir" },
  { id: 4, order: 4, title: "تعلم السيرة النبوية", desc: "لتقتدي بالنبي ﷺ في حياتك.", field: "seerah" },
  { id: 5, order: 5, title: "زكِّ نفسك بالأخلاق", desc: "العلم بلا عمل كالشجرة بلا ثمر.", field: "akhlaq" },
];