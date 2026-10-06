import type { Settings, Field, Stat, Lesson, Video, Article, Book, AudioItem, Photo, ScheduleItem, Fatwa, Project, NewsItem, Place, Dhikr } from "./data";

export interface Content {
  settings: Settings;
  fields: Field[];
  lessons: Lesson[];
  videos: Video[];
  articles: Article[];
  books: Book[];
  audio: AudioItem[];
  photos: Photo[];
  schedule: ScheduleItem[];
  fatwas: Fatwa[];
  projects: Project[];
  news: NewsItem[];
  places: Place[];
  adhkar: Dhikr[];
  stats: Stat[];
  fieldTranslations?: Record<string, Record<string, { name: string; desc: string }>>;
}

export const defaultContent: Content = {
  settings: {
    ownerName: "الشيخ إسماعيل أحمد نجيب",
    shortName: "الشيخ إسماعيل",
    jobTitle: "طالب علم شرعي • داعية",
    motto: "العلم نور والدعوة أمانة",
    kicker: "بسم الله الرحمن الرحيم",
    bio: [
      "طالب علم شرعي، مهتم بنشر العلوم الشرعية بأسلوب ميسر.",
      "أسأل الله أن يجعل هذا العمل خالصًا لوجهه الكريم.",
    ],
    wa: "201000000000",
    email: "contact@example.com",
    address: "مصر",
    portraitSrc: "",
    ogImage: "",
    appUrl: "",
    liveTitle: "",
    liveUrl: "",
    meetingDay: "",
    meetingTime: "",
    meetingPlace: "",
    meetingLink: "",
    showPrayerBar: true,
    cred1: "",
    cred2: "",
    interests: [],
  },
  fields: [
    { id: 1, slug: "aqeedah", name: "العقيدة", icon: "🕌", desc: "التوحيد وأركان الإيمان والرد على الشبهات العقدية" },
    { id: 2, slug: "fiqh", name: "الفقه", icon: "📖", desc: "العبادات والمعاملات والأحوال الشخصية" },
    { id: 3, slug: "usul", name: "أصول الفقه", icon: "⚖️", desc: "القواعد التي يُبنى عليها الاستنباط" },
    { id: 4, slug: "hadith", name: "الحديث وعلومه", icon: "📜", desc: "المتن والسند ومصطلح الحديث" },
    { id: 5, slug: "tafsir", name: "التفسير", icon: "📗", desc: "تدبُّر القرآن وبيان معانيه" },
    { id: 6, slug: "quran-sciences", name: "علوم القرآن", icon: "🕋", desc: "أسباب النزول والناسخ والمنسوخ" },
    { id: 7, slug: "seerah", name: "السيرة النبوية", icon: "🌙", desc: "حياة النبي ﷺ ودروسها العملية" },
    { id: 8, slug: "history", name: "التاريخ الإسلامي", icon: "🏛️", desc: "من الخلفاء الراشدين إلى العصر الحديث" },
    { id: 9, slug: "comparative", name: "مقارنة الأديان", icon: "🤝", desc: "دراسة الأديان والحوار والرد على الشبهات" },
    { id: 10, slug: "akhlaq", name: "الأخلاق والرقائق", icon: "💎", desc: "تزكية النفس ورقائق القلوب" },
    { id: 11, slug: "dawah", name: "الدعوة وأصولها", icon: "📣", desc: "فقه الدعوة ووسائلها المعاصرة" },
    { id: 12, slug: "arabic", name: "اللغة العربية", icon: "✍️", desc: "النحو والصرف والبلاغة لخدمة النصوص" },
    { id: 13, slug: "tajweed", name: "التجويد والقراءات", icon: "🎙️", desc: "حُسن تلاوة كتاب الله" },
    { id: 14, slug: "economics", name: "الاقتصاد الإسلامي", icon: "💰", desc: "المعاملات المالية المعاصرة" },
    { id: 15, slug: "faraaid", name: "الفرائض والمواريث", icon: "🧮", desc: "قسمة التركات وفق الكتاب والسنة" },
    { id: 16, slug: "family", name: "ركن الأسرة", icon: "👨‍👩‍👧", desc: "تربية وأزواج وبيوت مسلمة" },
    { id: 17, slug: "youth", name: "ركن الشباب", icon: "🌱", desc: "قضايا معاصرة بلسان شاب" },
  ],
  lessons: [],
  videos: [],
  articles: [],
  books: [],
  audio: [],
  photos: [],
  schedule: [],
  fatwas: [],
  projects: [],
  news: [],
  places: [],
  adhkar: [],
  stats: [],
  fieldTranslations: {},
};

export async function getContent(): Promise<Content> {
  try {
    const r = await fetch("/api/content", { cache: "no-store" });
    const j = await r.json();
    if (j?.content) return { ...defaultContent, ...j.content };
    return defaultContent;
  } catch {
    return defaultContent;
  }
}