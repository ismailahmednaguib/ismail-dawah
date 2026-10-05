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
}

export interface Stat { num: string; label: string; }
export interface Lesson { id: number; title: string; category: string; date: string; link: string; desc: string; }
export interface Video { id: number; title: string; url: string; desc: string; }
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
  interests: ["العقيدة الإسلامية", "فقه العبادات", "السيرة النبوية", "مقارنة الأديان", "تفسير القرآن", "قضايا الشباب"],
  wa: "201000000000",
  email: "example@email.com",
  address: "جمهورية مصر العربية",
  portraitSrc: "",
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
  { id: 4, title: "مدخل إلى علم مقارنة الأديان", category: "مقارنة أديان", date: "2023", link: "", desc: "تأصيل لمنهج أهل السنة في دراسة الأديان والحوار معها." },
  { id: 5, title: "تدبُّر سورة الفاتحة", category: "تفسير", date: "2023", link: "", desc: "وقفات تدبرية مع أعظم سور القرآن وكنوزها." },
  { id: 6, title: "الأخلاق في زمن الفتن", category: "أخلاق", date: "2022", link: "", desc: "كيف يحافظ المسلم على خُلُقه وثباته في زمن الشبهات." },
];

export const videos: Video[] = [
  { id: 1, title: "كلمة: لماذا خُلقنا؟", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", desc: "كلمة قصيرة عن حقيقة العبودية لله وأثرها في سعادة الإنسان." },
  { id: 2, title: "مدخل إلى علم مقارنة الأديان", url: "", desc: "حلقة تعريفية بأهمية هذا العلم ومناهج العلماء فيه." },
  { id: 3, title: "كيف نستقبل مواسم الطاعات؟", url: "", desc: "نصائح عملية للاستعداد الروحي والعملي لمواسم الخير." },
];

export const schedule: ScheduleItem[] = [
  { id: 1, day: "السبت", time: "بعد صلاة المغرب", topic: "شرح كتاب التوحيد", place: "مسجد النور" },
  { id: 2, day: "الاثنين", time: "بعد صلاة العشاء", topic: "فقه السيرة النبوية", place: "المسجد الكبير" },
  { id: 3, day: "الخميس", time: "بعد صلاة العصر", topic: "جلسات مقارنة الأديان والحوار", place: "مركز الدعوة الإسلامي" },
];