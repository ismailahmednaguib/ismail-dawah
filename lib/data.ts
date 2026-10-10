// lib/data.ts
// البيانات الثابتة للمنصة

// ============================================================
// 🧱 أدوات الأمان والبحث
// ============================================================

/**
 * تجميد عميق للكائنات والمصفوفات لمنع التعديل غير المقصود.
 */
function deepFreeze(value: unknown): void {
  if (value === null || typeof value !== "object") {
    return;
  }

  const obj = value as object;

  if (Object.isFrozen(obj)) {
    return;
  }

  Object.freeze(obj);

  for (const child of Object.values(obj)) {
    deepFreeze(child);
  }
}

/**
 * يجمّد القيمة ويعيدها بنفس النوع للحفاظ على التوافق مع الأنواع القديمة.
 */
function freezeAs<T>(value: T): T {
  deepFreeze(value);
  return value;
}

/**
 * تطبيع النص العربي للبحث:
 * - إزالة التشكيل
 * - توحيد الألف والهمزات
 * - توحيد الياء والتاء المربوطة
 * - إزالة التطويل
 * - تحويل الإنجليزية إلى small
 */
export function normalizeArabic(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/\uFEFF/g, "")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0711]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * تحويل الأرقام إلى أرقام عربية.
 */
export function toArabicNumeral(num: number | string): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  return String(num)
    .split("")
    .map((digit) => (/[0-9]/.test(digit) ? arabicNumerals[Number(digit)] : digit))
    .join("");
}

/**
 * تحويل الأرقام العربية إلى إنجليزية.
 */
export function toEnglishNumeral(num: number | string): string {
  const map: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  return String(num)
    .split("")
    .map((digit) => map[digit] ?? digit)
    .join("");
}

// ============================================================
// 📖 بيانات السور القرآنية (114 سورة)
// ============================================================

export interface Surah {
  number: number;
  arabicName: string;
  englishName: string;
  ayahs: number;
  type: "makki" | "madani";
}

export const SURAHS: Surah[] = freezeAs([
  { number: 1, arabicName: "الفاتحة", englishName: "Al-Fatiha", ayahs: 7, type: "makki" },
  { number: 2, arabicName: "البقرة", englishName: "Al-Baqarah", ayahs: 286, type: "madani" },
  { number: 3, arabicName: "آل عمران", englishName: "Ali 'Imran", ayahs: 200, type: "madani" },
  { number: 4, arabicName: "النساء", englishName: "An-Nisa", ayahs: 176, type: "madani" },
  { number: 5, arabicName: "المائدة", englishName: "Al-Ma'idah", ayahs: 120, type: "madani" },
  { number: 6, arabicName: "الأنعام", englishName: "Al-An'am", ayahs: 165, type: "makki" },
  { number: 7, arabicName: "الأعراف", englishName: "Al-A'raf", ayahs: 206, type: "makki" },
  { number: 8, arabicName: "الأنفال", englishName: "Al-Anfal", ayahs: 75, type: "madani" },
  { number: 9, arabicName: "التوبة", englishName: "At-Tawbah", ayahs: 129, type: "madani" },
  { number: 10, arabicName: "يونس", englishName: "Yunus", ayahs: 109, type: "makki" },
  { number: 11, arabicName: "هود", englishName: "Hud", ayahs: 123, type: "makki" },
  { number: 12, arabicName: "يوسف", englishName: "Yusuf", ayahs: 111, type: "makki" },
  { number: 13, arabicName: "الرعد", englishName: "Ar-Ra'd", ayahs: 43, type: "madani" },
  { number: 14, arabicName: "إبراهيم", englishName: "Ibrahim", ayahs: 52, type: "makki" },
  { number: 15, arabicName: "الحجر", englishName: "Al-Hijr", ayahs: 99, type: "makki" },
  { number: 16, arabicName: "النحل", englishName: "An-Nahl", ayahs: 128, type: "makki" },
  { number: 17, arabicName: "الإسراء", englishName: "Al-Isra", ayahs: 111, type: "makki" },
  { number: 18, arabicName: "الكهف", englishName: "Al-Kahf", ayahs: 110, type: "makki" },
  { number: 19, arabicName: "مريم", englishName: "Maryam", ayahs: 98, type: "makki" },
  { number: 20, arabicName: "طه", englishName: "Taha", ayahs: 135, type: "makki" },
  { number: 21, arabicName: "الأنبياء", englishName: "Al-Anbiya", ayahs: 112, type: "makki" },
  { number: 22, arabicName: "الحج", englishName: "Al-Hajj", ayahs: 78, type: "madani" },
  { number: 23, arabicName: "المؤمنون", englishName: "Al-Mu'minun", ayahs: 118, type: "makki" },
  { number: 24, arabicName: "النور", englishName: "An-Nur", ayahs: 64, type: "madani" },
  { number: 25, arabicName: "الفرقان", englishName: "Al-Furqan", ayahs: 77, type: "makki" },
  { number: 26, arabicName: "الشعراء", englishName: "Ash-Shu'ara", ayahs: 227, type: "makki" },
  { number: 27, arabicName: "النمل", englishName: "An-Naml", ayahs: 93, type: "makki" },
  { number: 28, arabicName: "القصص", englishName: "Al-Qasas", ayahs: 88, type: "makki" },
  { number: 29, arabicName: "العنكبوت", englishName: "Al-'Ankabut", ayahs: 69, type: "makki" },
  { number: 30, arabicName: "الروم", englishName: "Ar-Rum", ayahs: 60, type: "makki" },
  { number: 31, arabicName: "لقمان", englishName: "Luqman", ayahs: 34, type: "makki" },
  { number: 32, arabicName: "السجدة", englishName: "As-Sajdah", ayahs: 30, type: "makki" },
  { number: 33, arabicName: "الأحزاب", englishName: "Al-Ahzab", ayahs: 73, type: "madani" },
  { number: 34, arabicName: "سبأ", englishName: "Saba", ayahs: 54, type: "makki" },
  { number: 35, arabicName: "فاطر", englishName: "Fatir", ayahs: 45, type: "makki" },
  { number: 36, arabicName: "يس", englishName: "Ya-Sin", ayahs: 83, type: "makki" },
  { number: 37, arabicName: "الصافات", englishName: "As-Saffat", ayahs: 182, type: "makki" },
  { number: 38, arabicName: "ص", englishName: "Sad", ayahs: 88, type: "makki" },
  { number: 39, arabicName: "الزمر", englishName: "Az-Zumar", ayahs: 75, type: "makki" },
  { number: 40, arabicName: "غافر", englishName: "Ghafir", ayahs: 85, type: "makki" },
  { number: 41, arabicName: "فصلت", englishName: "Fussilat", ayahs: 54, type: "makki" },
  { number: 42, arabicName: "الشورى", englishName: "Ash-Shuraa", ayahs: 53, type: "makki" },
  { number: 43, arabicName: "الزخرف", englishName: "Az-Zukhruf", ayahs: 89, type: "makki" },
  { number: 44, arabicName: "الدخان", englishName: "Ad-Dukhan", ayahs: 59, type: "makki" },
  { number: 45, arabicName: "الجاثية", englishName: "Al-Jathiyah", ayahs: 37, type: "makki" },
  { number: 46, arabicName: "الأحقاف", englishName: "Al-Ahqaf", ayahs: 35, type: "makki" },
  { number: 47, arabicName: "محمد", englishName: "Muhammad", ayahs: 38, type: "madani" },
  { number: 48, arabicName: "الفتح", englishName: "Al-Fath", ayahs: 29, type: "madani" },
  { number: 49, arabicName: "الحجرات", englishName: "Al-Hujurat", ayahs: 18, type: "madani" },
  { number: 50, arabicName: "ق", englishName: "Qaf", ayahs: 45, type: "makki" },
  { number: 51, arabicName: "الذاريات", englishName: "Adh-Dhariyat", ayahs: 60, type: "makki" },
  { number: 52, arabicName: "الطور", englishName: "At-Tur", ayahs: 49, type: "makki" },
  { number: 53, arabicName: "النجم", englishName: "An-Najm", ayahs: 62, type: "makki" },
  { number: 54, arabicName: "القمر", englishName: "Al-Qamar", ayahs: 55, type: "makki" },
  { number: 55, arabicName: "الرحمن", englishName: "Ar-Rahman", ayahs: 78, type: "madani" },
  { number: 56, arabicName: "الواقعة", englishName: "Al-Waqi'ah", ayahs: 96, type: "makki" },
  { number: 57, arabicName: "الحديد", englishName: "Al-Hadid", ayahs: 29, type: "madani" },
  { number: 58, arabicName: "المجادلة", englishName: "Al-Mujadila", ayahs: 22, type: "madani" },
  { number: 59, arabicName: "الحشر", englishName: "Al-Hashr", ayahs: 24, type: "madani" },
  { number: 60, arabicName: "الممتحنة", englishName: "Al-Mumtahanah", ayahs: 13, type: "madani" },
  { number: 61, arabicName: "الصف", englishName: "As-Saf", ayahs: 14, type: "madani" },
  { number: 62, arabicName: "الجمعة", englishName: "Al-Jumu'ah", ayahs: 11, type: "madani" },
  { number: 63, arabicName: "المنافقون", englishName: "Al-Munafiqun", ayahs: 11, type: "madani" },
  { number: 64, arabicName: "التغابن", englishName: "At-Taghabun", ayahs: 18, type: "madani" },
  { number: 65, arabicName: "الطلاق", englishName: "At-Talaq", ayahs: 12, type: "madani" },
  { number: 66, arabicName: "التحريم", englishName: "At-Tahrim", ayahs: 12, type: "madani" },
  { number: 67, arabicName: "الملك", englishName: "Al-Mulk", ayahs: 30, type: "makki" },
  { number: 68, arabicName: "القلم", englishName: "Al-Qalam", ayahs: 52, type: "makki" },
  { number: 69, arabicName: "الحاقة", englishName: "Al-Haqqah", ayahs: 52, type: "makki" },
  { number: 70, arabicName: "المعارج", englishName: "Al-Ma'arij", ayahs: 44, type: "makki" },
  { number: 71, arabicName: "نوح", englishName: "Nuh", ayahs: 28, type: "makki" },
  { number: 72, arabicName: "الجن", englishName: "Al-Jinn", ayahs: 28, type: "makki" },
  { number: 73, arabicName: "المزمل", englishName: "Al-Muzzammil", ayahs: 20, type: "makki" },
  { number: 74, arabicName: "المدثر", englishName: "Al-Muddaththir", ayahs: 56, type: "makki" },
  { number: 75, arabicName: "القيامة", englishName: "Al-Qiyamah", ayahs: 40, type: "makki" },
  { number: 76, arabicName: "الإنسان", englishName: "Al-Insan", ayahs: 31, type: "madani" },
  { number: 77, arabicName: "المرسلات", englishName: "Al-Mursalat", ayahs: 50, type: "makki" },
  { number: 78, arabicName: "النبأ", englishName: "An-Naba", ayahs: 40, type: "makki" },
  { number: 79, arabicName: "النازعات", englishName: "An-Nazi'at", ayahs: 46, type: "makki" },
  { number: 80, arabicName: "عبس", englishName: "'Abasa", ayahs: 42, type: "makki" },
  { number: 81, arabicName: "التكوير", englishName: "At-Takwir", ayahs: 29, type: "makki" },
  { number: 82, arabicName: "الانفطار", englishName: "Al-Infitar", ayahs: 19, type: "makki" },
  { number: 83, arabicName: "المطففين", englishName: "Al-Mutaffifin", ayahs: 36, type: "makki" },
  { number: 84, arabicName: "الانشقاق", englishName: "Al-Inshiqaq", ayahs: 25, type: "makki" },
  { number: 85, arabicName: "البروج", englishName: "Al-Buruj", ayahs: 22, type: "makki" },
  { number: 86, arabicName: "الطارق", englishName: "At-Tariq", ayahs: 17, type: "makki" },
  { number: 87, arabicName: "الأعلى", englishName: "Al-A'la", ayahs: 19, type: "makki" },
  { number: 88, arabicName: "الغاشية", englishName: "Al-Ghashiyah", ayahs: 26, type: "makki" },
  { number: 89, arabicName: "الفجر", englishName: "Al-Fajr", ayahs: 30, type: "makki" },
  { number: 90, arabicName: "البلد", englishName: "Al-Balad", ayahs: 20, type: "makki" },
  { number: 91, arabicName: "الشمس", englishName: "Ash-Shams", ayahs: 15, type: "makki" },
  { number: 92, arabicName: "الليل", englishName: "Al-Layl", ayahs: 21, type: "makki" },
  { number: 93, arabicName: "الضحى", englishName: "Ad-Duhaa", ayahs: 11, type: "makki" },
  { number: 94, arabicName: "الشرح", englishName: "Ash-Sharh", ayahs: 8, type: "makki" },
  { number: 95, arabicName: "التين", englishName: "At-Tin", ayahs: 8, type: "makki" },
  { number: 96, arabicName: "العلق", englishName: "Al-'Alaq", ayahs: 19, type: "makki" },
  { number: 97, arabicName: "القدر", englishName: "Al-Qadr", ayahs: 5, type: "makki" },
  { number: 98, arabicName: "البينة", englishName: "Al-Bayyinah", ayahs: 8, type: "madani" },
  { number: 99, arabicName: "الزلزلة", englishName: "Az-Zalzalah", ayahs: 8, type: "madani" },
  { number: 100, arabicName: "العاديات", englishName: "Al-'Adiyat", ayahs: 11, type: "makki" },
  { number: 101, arabicName: "القارعة", englishName: "Al-Qari'ah", ayahs: 11, type: "makki" },
  { number: 102, arabicName: "التكاثر", englishName: "At-Takathur", ayahs: 8, type: "makki" },
  { number: 103, arabicName: "العصر", englishName: "Al-'Asr", ayahs: 3, type: "makki" },
  { number: 104, arabicName: "الهمزة", englishName: "Al-Humazah", ayahs: 9, type: "makki" },
  { number: 105, arabicName: "الفيل", englishName: "Al-Fil", ayahs: 5, type: "makki" },
  { number: 106, arabicName: "قريش", englishName: "Quraysh", ayahs: 4, type: "makki" },
  { number: 107, arabicName: "الماعون", englishName: "Al-Ma'un", ayahs: 7, type: "makki" },
  { number: 108, arabicName: "الكوثر", englishName: "Al-Kawthar", ayahs: 3, type: "makki" },
  { number: 109, arabicName: "الكافرون", englishName: "Al-Kafirun", ayahs: 6, type: "makki" },
  { number: 110, arabicName: "النصر", englishName: "An-Nasr", ayahs: 3, type: "madani" },
  { number: 111, arabicName: "المسد", englishName: "Al-Masad", ayahs: 5, type: "makki" },
  { number: 112, arabicName: "الإخلاص", englishName: "Al-Ikhlas", ayahs: 4, type: "makki" },
  { number: 113, arabicName: "الفلق", englishName: "Al-Falaq", ayahs: 5, type: "makki" },
  { number: 114, arabicName: "الناس", englishName: "An-Nas", ayahs: 6, type: "makki" },
]);

// ============================================================
// 🤲 بيانات الأذكار
// ============================================================

export interface Dhikr {
  text: string;
  count: number;
  source: string;
  virtue?: string;
}

export interface DhikrCategory {
  id: string;
  arabicTitle: string;
  englishTitle: string;
  icon: string;
  adhkar: Dhikr[];
}

export const ADHKAR: DhikrCategory[] = freezeAs([
  {
    id: "morning",
    arabicTitle: "أذكار الصباح",
    englishTitle: "Morning Adhkar",
    icon: "🌅",
    adhkar: [
      {
        text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيءٍ قَدِيرٌ",
        count: 1,
        source: "رواه مسلم",
      },
      {
        text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
        count: 1,
        source: "رواه الترمذي",
      },
      {
        text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        count: 1,
        source: "رواه البخاري",
        virtue: "سيد الاستغفار",
      },
      {
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        count: 100,
        source: "رواه مسلم",
        virtue: "حُطَّت خطاياه وإن كانت مثل زبد البحر",
      },
      {
        text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 10,
        source: "متفق عليه",
      },
      {
        text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        count: 3,
        source: "رواه الترمذي",
        virtue: "لم يضره من الله شيء",
      },
      {
        text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
        count: 3,
        source: "رواه أبو داود",
      },
      {
        text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
        count: 1,
        source: "رواه ابن ماجه",
      },
    ],
  },
  {
    id: "evening",
    arabicTitle: "أذكار المساء",
    englishTitle: "Evening Adhkar",
    icon: "🌙",
    adhkar: [
      {
        text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 1,
        source: "رواه مسلم",
      },
      {
        text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
        count: 1,
        source: "رواه الترمذي",
      },
      {
        text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        count: 3,
        source: "رواه مسلم",
        virtue: "لم يضره شيء",
      },
      {
        text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
        count: 1,
        source: "رواه البخاري",
      },
    ],
  },
  {
    id: "sleep",
    arabicTitle: "أذكار النوم",
    englishTitle: "Sleep Adhkar",
    icon: "🛏️",
    adhkar: [
      {
        text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        count: 1,
        source: "رواه البخاري",
      },
      {
        text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        count: 3,
        source: "رواه أبو داود",
      },
      {
        text: "سُبْحَانَ اللَّهِ (33) وَالْحَمْدُ لِلَّهِ (33) وَاللَّهُ أَكْبَرُ (34)",
        count: 1,
        source: "متفق عليه",
        virtue: "خير من خادم",
      },
    ],
  },
  {
    id: "afterPrayer",
    arabicTitle: "أذكار بعد الصلاة",
    englishTitle: "After Prayer Adhkar",
    icon: "🕌",
    adhkar: [
      {
        text: "أَسْتَغْفِرُ اللَّهَ",
        count: 3,
        source: "رواه مسلم",
      },
      {
        text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        count: 1,
        source: "رواه مسلم",
      },
      {
        text: "سُبْحَانَ اللَّهِ",
        count: 33,
        source: "رواه مسلم",
      },
      {
        text: "الْحَمْدُ لِلَّهِ",
        count: 33,
        source: "رواه مسلم",
      },
      {
        text: "اللَّهُ أَكْبَرُ",
        count: 33,
        source: "رواه مسلم",
      },
    ],
  },
]);

// ============================================================
// 🕌 بيانات الصلوات
// ============================================================

export interface PrayerInfo {
  id: string;
  arabicName: string;
  englishName: string;
  icon: string;
}

export const PRAYERS: PrayerInfo[] = freezeAs([
  { id: "fajr", arabicName: "الفجر", englishName: "Fajr", icon: "🌄" },
  { id: "sunrise", arabicName: "الشروق", englishName: "Sunrise", icon: "🌅" },
  { id: "dhuhr", arabicName: "الظهر", englishName: "Dhuhr", icon: "☀️" },
  { id: "asr", arabicName: "العصر", englishName: "Asr", icon: "🌤️" },
  { id: "maghrib", arabicName: "المغرب", englishName: "Maghrib", icon: "🌇" },
  { id: "isha", arabicName: "العشاء", englishName: "Isha", icon: "🌃" },
]);

// ============================================================
// 📅 بيانات التقويم الهجري
// ============================================================

export const HIJRI_MONTHS: string[] = freezeAs([
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
]);

export interface IslamicEvent {
  date: string;
  arabicTitle: string;
  englishTitle: string;
  description?: string;
}

export const ISLAMIC_EVENTS: IslamicEvent[] = freezeAs([
  { date: "1-1", arabicTitle: "رأس السنة الهجرية", englishTitle: "Islamic New Year" },
  {
    date: "10-1",
    arabicTitle: "يوم عاشوراء",
    englishTitle: "Ashura",
    description: "صيام يوم عاشوراء يكفر سنة ماضية",
  },
  { date: "12-3", arabicTitle: "المولد النبوي", englishTitle: "Prophet's Birthday" },
  { date: "27-7", arabicTitle: "الإسراء والمعراج", englishTitle: "Isra and Mi'raj" },
  { date: "15-8", arabicTitle: "ليلة النصف من شعبان", englishTitle: "Mid-Sha'ban" },
  { date: "1-9", arabicTitle: "أول رمضان", englishTitle: "First Day of Ramadan" },
  { date: "27-9", arabicTitle: "ليلة القدر (المرجحة)", englishTitle: "Night of Power" },
  { date: "1-10", arabicTitle: "عيد الفطر", englishTitle: "Eid al-Fitr" },
  { date: "9-12", arabicTitle: "يوم عرفة", englishTitle: "Day of Arafah" },
  { date: "10-12", arabicTitle: "عيد الأضحى", englishTitle: "Eid al-Adha" },
]);

// ============================================================
// 📢 بيانات المجالات الدعوية
// ============================================================

export interface DawahField {
  id: string;
  arabicTitle: string;
  englishTitle: string;
  description: string;
  icon: string;
}

export const DAWAH_FIELDS: DawahField[] = freezeAs([
  {
    id: "online",
    arabicTitle: "الدعوة الإلكترونية",
    englishTitle: "Online Dawah",
    description: "استخدام الإنترنت ومواقع التواصل في نشر الإسلام",
    icon: "💻",
  },
  {
    id: "youth",
    arabicTitle: "دعوة الشباب",
    englishTitle: "Youth Dawah",
    description: "التركيز على قضايا الشباب واحتياجاتهم",
    icon: "👥",
  },
  {
    id: "women",
    arabicTitle: "دعوة النساء",
    englishTitle: "Women Dawah",
    description: "العناية بأحكام وقضايا المرأة المسلمة",
    icon: "🧕",
  },
  {
    id: "new-muslims",
    arabicTitle: "دعوة المسلمين الجدد",
    englishTitle: "New Muslims Dawah",
    description: "رعاية وتعليم المسلمين الجدد",
    icon: "🌱",
  },
  {
    id: "non-arab",
    arabicTitle: "دعوة غير العرب",
    englishTitle: "Non-Arab Dawah",
    description: "ترجمة المحتوى ونشر الإسلام بلغات مختلفة",
    icon: "🌍",
  },
  {
    id: "media",
    arabicTitle: "الدعوة الإعلامية",
    englishTitle: "Media Dawah",
    description: "إنتاج محتوى دعوي مرئي ومسموع",
    icon: "📺",
  },
]);

// ============================================================
// 🎯 بيانات التسبيح
// ============================================================

export interface TasbihPhrase {
  id: string;
  arabicText: string;
  englishText: string;
  count: number;
  virtue?: string;
}

export const TASBIH_PHRASES: TasbihPhrase[] = freezeAs([
  {
    id: "subhan",
    arabicText: "سُبْحَانَ اللَّهِ",
    englishText: "Subhan Allah",
    count: 33,
    virtue: "غرس نخلة في الجنة",
  },
  {
    id: "hamd",
    arabicText: "الْحَمْدُ لِلَّهِ",
    englishText: "Alhamdulillah",
    count: 33,
    virtue: "تملأ الميزان",
  },
  {
    id: "takbir",
    arabicText: "اللَّهُ أَكْبَرُ",
    englishText: "Allahu Akbar",
    count: 33,
  },
  {
    id: "istighfar",
    arabicText: "أَسْتَغْفِرُ اللَّهَ",
    englishText: "Astaghfirullah",
    count: 100,
    virtue: "يغفر الذنوب",
  },
  {
    id: "tahlil",
    arabicText: "لَا إِلَهَ إِلَّا اللَّهُ",
    englishText: "La ilaha illa Allah",
    count: 100,
  },
  {
    id: "salawat",
    arabicText: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    englishText: "O Allah, send blessings upon our Prophet Muhammad",
    count: 100,
    virtue: "من صلى عليه واحدة صلى الله عليه بها عشرا",
  },
]);

// ============================================================
// 🛡️ بيانات الرقية الشرعية
// ============================================================

export interface RuqyahVerse {
  reference: string;
  text: string;
}

export const RUQYAH_VERSES: RuqyahVerse[] = freezeAs([
  {
    reference: "الفاتحة",
    text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ * الرَّحْمَٰنِ الرَّحِيمِ * مَالِكِ يَوْمِ الدِّينِ * إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ * اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ * صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
  },
  {
    reference: "البقرة 255",
    text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
  },
  {
    reference: "الإخلاص",
    text: "قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
  },
  {
    reference: "الفلق",
    text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ * مِنْ شَرِّ مَا خَلَقَ * وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ * وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ * وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
  },
  {
    reference: "الناس",
    text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ * مَلِكِ النَّاسِ * إِلَٰهِ النَّاسِ * مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ * الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ * مِنَ الْجِنَّةِ وَالنَّاسِ",
  },
]);

// ============================================================
// 📚 بيانات قصص الأنبياء
// ============================================================

export interface ProphetStory {
  id: string;
  arabicName: string;
  englishName: string;
  title: string;
  icon: string;
}

export const PROPHETS: ProphetStory[] = freezeAs([
  { id: "adam", arabicName: "آدم", englishName: "Adam", title: "أبو البشر", icon: "🌍" },
  { id: "nuh", arabicName: "نوح", englishName: "Noah", title: "صاحب السفينة", icon: "🚢" },
  { id: "ibrahim", arabicName: "إبراهيم", englishName: "Abraham", title: "خليل الرحمن", icon: "🔥" },
  { id: "musa", arabicName: "موسى", englishName: "Moses", title: "كليم الله", icon: "🌊" },
  { id: "isa", arabicName: "عيسى", englishName: "Jesus", title: "روح الله وكلمته", icon: "✨" },
  { id: "muhammad", arabicName: "محمد ﷺ", englishName: "Muhammad", title: "خاتم الأنبياء", icon: "🕌" },
  { id: "yusuf", arabicName: "يوسف", englishName: "Joseph", title: "أحسن القصص", icon: "🌟" },
  { id: "sulayman", arabicName: "سليمان", englishName: "Solomon", title: "صاحب الملك", icon: "👑" },
  { id: "dawud", arabicName: "داود", englishName: "David", title: "صاحب المزامير", icon: "⚔️" },
  { id: "yunus", arabicName: "يونس", englishName: "Jonah", title: "صاحب الحوت", icon: "🐋" },
]);

// ============================================================
// 🧠 دوال مساعدة آمنة ومنظمة
// ============================================================

export const DATA_VERSION = "2026.10.11";

/**
 * الحصول على سورة برقمها.
 */
export function getSurahByNumber(num: number): Surah | undefined {
  if (!Number.isInteger(num) || num < 1 || num > 114) {
    return undefined;
  }

  return SURAHS.find((surah) => surah.number === num);
}

/**
 * البحث في السور.
 * يدعم:
 * - الاسم العربي مع تجاهل التشكيل
 * - الاسم الإنجليزي
 * - رقم السورة
 */
export function searchSurahs(query: string, limit = 20): Surah[] {
  const q = normalizeArabic(query);

  if (!q) {
    return [];
  }

  const isNumeric = /^\d+$/.test(q);

  return SURAHS.filter((surah) => {
    if (isNumeric) {
      const number = String(surah.number);

      if (number === q || number.startsWith(q)) {
        return true;
      }
    }

    return (
      normalizeArabic(surah.arabicName).includes(q) ||
      surah.englishName.toLowerCase().includes(q)
    );
  }).slice(0, limit);
}

/**
 * اسم السورة حسب اللغة.
 */
export function getSurahDisplayName(
  surah: Surah,
  lang: "ar" | "en" = "ar"
): string {
  return lang === "en" ? surah.englishName : surah.arabicName;
}

/**
 * نوع السورة مترجم.
 */
export function getSurahTypeLabel(
  type: Surah["type"],
  lang: "ar" | "en" = "ar"
): string {
  if (lang === "en") {
    return type === "makki" ? "Makki" : "Madani";
  }

  return type === "makki" ? "مكية" : "مدنية";
}

/**
 * الحصول على فئة أذكار بالمعرف.
 */
export function getAdhkarById(id: string): DhikrCategory | undefined {
  return ADHKAR.find((category) => category.id === id);
}

/**
 * عنوان فئة الذكر حسب اللغة.
 */
export function getDhikrCategoryTitle(
  category: DhikrCategory,
  lang: "ar" | "en" = "ar"
): string {
  return lang === "en" ? category.englishTitle : category.arabicTitle;
}

export type FlatDhikr = Dhikr & {
  categoryId: string;
  category: string;
  categoryEn: string;
  icon: string;
};

/**
 * جميع الأذكار مسطّحة مع معلومات الفئة.
 *
 * ملاحظة توافق:
 * خاصية `category` موجودة كما في الكود القديم،
 * لكن أُضيفت `categoryId` و`categoryEn` و`icon` لتسهيل الاستخدام.
 */
export function getAllAdhkar(): FlatDhikr[] {
  return ADHKAR.flatMap((category) =>
    category.adhkar.map((dhikr) => ({
      ...dhikr,
      categoryId: category.id,
      category: category.arabicTitle,
      categoryEn: category.englishTitle,
      icon: category.icon,
    }))
  );
}

/**
 * البحث في الأذكار.
 */
export function searchAdhkar(
  query: string,
  options: {
    categoryId?: string;
    limit?: number;
  } = {}
): FlatDhikr[] {
  const q = normalizeArabic(query);

  if (!q) {
    return [];
  }

  const limit = options.limit ?? 30;

  return getAllAdhkar()
    .filter((dhikr) => {
      if (options.categoryId && dhikr.categoryId !== options.categoryId) {
        return false;
      }

      return (
        normalizeArabic(dhikr.text).includes(q) ||
        normalizeArabic(dhikr.source).includes(q) ||
        normalizeArabic(dhikr.virtue ?? "").includes(q) ||
        normalizeArabic(dhikr.category).includes(q) ||
        dhikr.categoryEn.toLowerCase().includes(q)
      );
    })
    .slice(0, limit);
}

/**
 * الصلوات المفروضة فقط، بدون الشروق.
 */
export const OBLIGATORY_PRAYER_IDS: string[] = freezeAs([
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
]);

/**
 * الحصول على صلاة بالمعرف.
 */
export function getPrayerById(id: string): PrayerInfo | undefined {
  return PRAYERS.find((prayer) => prayer.id === id);
}

/**
 * اسم الصلاة حسب اللغة.
 */
export function getPrayerName(
  prayer: PrayerInfo,
  lang: "ar" | "en" = "ar"
): string {
  return lang === "en" ? prayer.englishName : prayer.arabicName;
}

/**
 * الفروض فقط.
 */
export function getObligatoryPrayers(): PrayerInfo[] {
  return OBLIGATORY_PRAYER_IDS.map((id) =>
    PRAYERS.find((prayer) => prayer.id === id)
  ).filter((prayer): prayer is PrayerInfo => Boolean(prayer));
}

/**
 * تحليل تاريخ هجري بصيغة:
 * - 1-1
 * - 01-01
 * - 1/1
 * - 10-1
 */
export function parseHijriDate(
  value: string
): { month: number; day: number } | null {
  const clean = String(value || "").trim();

  const match = /^(\d{1,2})\s*[-/]\s*(\d{1,2})$/.exec(clean);

  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);

  if (month < 1 || month > 12 || day < 1 || day > 30) {
    return null;
  }

  return { month, day };
}

/**
 * تنسيق تاريخ هجري.
 */
export function formatHijriDate(month: number, day: number): string {
  return `${month}-${day}`;
}

/**
 * الحصول على مناسبة هجرية بتاريخ معين.
 */
export function getIslamicEventByDate(
  month: number,
  day: number
): IslamicEvent | undefined {
  return ISLAMIC_EVENTS.find((event) => {
    const parsed = parseHijriDate(event.date);

    return parsed?.month === month && parsed?.day === day;
  });
}

/**
 * مناسبات شهر هجري معين.
 */
export function getIslamicEventsForMonth(month: number): IslamicEvent[] {
  return ISLAMIC_EVENTS.filter((event) => {
    const parsed = parseHijriDate(event.date);

    return parsed?.month === month;
  });
}

/**
 * عنوان المناسبة حسب اللغة.
 */
export function getIslamicEventTitle(
  event: IslamicEvent,
  lang: "ar" | "en" = "ar"
): string {
  return lang === "en" ? event.englishTitle : event.arabicTitle;
}

/**
 * الحصول على مجال دعوي بالمعرف.
 */
export function getDawahFieldById(id: string): DawahField | undefined {
  return DAWAH_FIELDS.find((field) => field.id === id);
}

/**
 * عنوان المجال الدعوي حسب اللغة.
 */
export function getDawahFieldTitle(
  field: DawahField,
  lang: "ar" | "en" = "ar"
): string {
  return lang === "en" ? field.englishTitle : field.arabicTitle;
}

/**
 * الحصول على عبارة تسبيح بالمعرف.
 */
export function getTasbihPhraseById(id: string): TasbihPhrase | undefined {
  return TASBIH_PHRASES.find((phrase) => phrase.id === id);
}

/**
 * نص التسبيح حسب اللغة.
 */
export function getTasbihText(
  phrase: TasbihPhrase,
  lang: "ar" | "en" = "ar"
): string {
  return lang === "en" ? phrase.englishText : phrase.arabicText;
}

/**
 * الحصول على آية/سورة من الرقية بالمرجع.
 */
export function getRuqyahVerseByReference(
  reference: string
): RuqyahVerse | undefined {
  const q = normalizeArabic(reference);

  if (!q) {
    return undefined;
  }

  return RUQYAH_VERSES.find((verse) =>
    normalizeArabic(verse.reference).includes(q)
  );
}

/**
 * الحصول على قصة نبي بالمعرف.
 */
export function getProphetById(id: string): ProphetStory | undefined {
  return PROPHETS.find((prophet) => prophet.id === id);
}

/**
 * اسم النبي حسب اللغة.
 */
export function getProphetName(
  prophet: ProphetStory,
  lang: "ar" | "en" = "ar"
): string {
  return lang === "en" ? prophet.englishName : prophet.arabicName;
}

/**
 * ملخص سريع للبيانات الثابتة.
 * مفيد للوحة الأدمن أو صفحة التشخيص.
 */
export function getStaticDataSummary() {
  return {
    version: DATA_VERSION,
    surahs: SURAHS.length,
    adhkarCategories: ADHKAR.length,
    adhkarItems: getAllAdhkar().length,
    prayers: PRAYERS.length,
    obligatoryPrayers: getObligatoryPrayers().length,
    hijriMonths: HIJRI_MONTHS.length,
    islamicEvents: ISLAMIC_EVENTS.length,
    dawahFields: DAWAH_FIELDS.length,
    tasbihPhrases: TASBIH_PHRASES.length,
    ruqyahVerses: RUQYAH_VERSES.length,
    prophets: PROPHETS.length,
  };
}

/**
 * للتوافق مع الكود القديم فقط.
 *
 * @deprecated استخدم DAWAH_FIELDS بدلًا من fields.
 */
export const fields: DawahField[] = DAWAH_FIELDS;