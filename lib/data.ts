export interface Settings {
  ownerName: string;
  shortName: string;
  jobTitle: string;
  kicker: string;
  motto: string;
  bio: string[];
  cred1: string;
  cred2: string;
  interests: string[];
  wa: string;
  email: string;
  address: string;
  portraitSrc: string;
  showPrayerBar: boolean;
}

export interface Field { id: number; slug: string; name: string; icon: string; desc: string; }
export interface Stat { num: string; label: string; }
export interface Lesson { id: number; title: string; category: string; date: string; link: string; desc: string; field: string; }
export interface Video { id: number; title: string; url: string; desc: string; field: string; }
export interface Article { id: number; title: string; date: string; excerpt: string; body: string; field: string; }
export interface Book { id: number; title: string; field: string; url: string; desc: string; }
export interface AudioItem { id: number; title: string; url: string; desc: string; field: string; }
export interface Photo { id: number; url: string; caption: string; field: string; }
export interface ScheduleItem { id: number; day: string; time: string; topic: string; place: string; }

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
  showPrayerBar: true,
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