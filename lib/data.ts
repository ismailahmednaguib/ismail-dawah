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
  interests: ["العقيدة الإسلامية", "فقه العبادات", "السيرة النبوية", "مقارنة الأديان", "تفسير القرآن", "قضايا الشباب"],
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
  { id: 1, title: "سلسلة: أركان الإيمان الستة", category: "عقيدة", date: "2024", link: "", desc: "شرح مُيسَّر لأركان الإيمان بأدلتها من الكتاب والسنة." },
  { id: 2, title: "فقه الطهارة والصلاة للمبتدئين", category: "فقه", date: "2024", link: "", desc: "دورة عملية تشرح أحكام الطهارة والصلاة خطوة بخطوة." },
  { id: 3, title: "السيرة النبوية: دروس وعبر", category: "سيرة", date: "2023", link: "", desc: "رحلة في حياة النبي ﷺ نستخرج منها الدروس العملية." },
];

export const videos: Video[] = [
  { id: 1, title: "كلمة: لماذا خُلقنا؟", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", desc: "كلمة قصيرة عن حقيقة العبودية لله وأثرها في سعادة الإنسان." },
];

export const schedule: ScheduleItem[] = [
  { id: 1, day: "السبت", time: "بعد صلاة المغرب", topic: "شرح كتاب التوحيد", place: "مسجد النور" },
  { id: 2, day: "الاثنين", time: "بعد صلاة العشاء", topic: "فقه السيرة النبوية", place: "المسجد الكبير" },
];

export const articles: Article[] = [
  {
    id: 1,
    title: "إلى الله.. ثم إلى الناس",
    date: "15 يناير 2024",
    excerpt: "منهج الداعية الصادق أن يكون قلبه معلَّقًا بالله قبل أن يكون لسانه معلَّقًا بالناس.",
    body: "منهج الداعية الصادق أن يكون قلبه معلَّقًا بالله قبل أن يكون لسانه معلَّقًا بالناس.\n\nفمن طلب ما عند الله بما عند الناس، انقطع عن الناس وعن الله، ومن طلب ما عند الناس بما عند الله، لم يزدد من الله إلا بعدًا.\n\nوالدعوة رسالة قبل أن تكون وظيفة، وأمانة قبل أن تكون مكانة.",
  },
];

export const audio: AudioItem[] = [];
export const photos: Photo[] = [];