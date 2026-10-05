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
  showArticles: boolean;
  showAudio: boolean;
  showGallery: boolean;
}

export interface Stat { num: string; label: string; }
export interface Lesson { id: number; title: string; category: string; date: string; link: string; desc: string; }
export interface Video { id: number; title: string; url: string; desc: string; }
export interface ScheduleItem { id: number; day: string; time: string; topic: string; place: string; }
export interface Article { id: number; title: string; date: string; excerpt: string; body: string; }
export interface AudioItem { id: number; title: string; url: string; desc: string; }
export interface Photo { id: number; url: string; caption: string; }

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
  showArticles: true,
  showAudio: true,
  showGallery: true,
};

export const stats: Stat[] = [
  { num: "+10", label: "سنوات في الدعوة" },
  { num: "+250", label: "درساً مسجَّلاً" },
  { num: "+15", label: "دورة علمية" },
];

export const lessons: Lesson[] = [
  { id: 1, title: "سلسلة: أركان الإيمان الستة", category: "عقيدة", date: "2024", link: "", desc: "شرح مُيسَّر لأركان الإيمان." },
  { id: 2, title: "فقه الطهارة والصلاة", category: "فقه", date: "2024", link: "", desc: "دورة عملية خطوة بخطوة." },
];

export const videos: Video[] = [
  { id: 1, title: "كلمة: لماذا خُلقنا؟", url: "", desc: "كلمة قصيرة عن حقيقة العبودية لله." },
];

export const schedule: ScheduleItem[] = [
  { id: 1, day: "السبت", time: "بعد صلاة المغرب", topic: "شرح كتاب التوحيد", place: "مسجد النور" },
];

export const articles: Article[] = [];
export const audio: AudioItem[] = [];
export const photos: Photo[] = [];