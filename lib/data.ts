// lib/data.ts
// البيانات الثابتة للمنصة

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

export const SURAHS: Surah[] = [
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
];

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

export const ADHKAR: DhikrCategory[] = [
  {
    id: "morning",
    arabicTitle: "أذكار الصباح",
    englishTitle: "Morning Adhkar",
    icon: "🌅",
    adhkar: [
      {
        text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
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
];

// ============================================================
// 🕌 بيانات الصلوات
// ============================================================

export interface PrayerInfo {
  id: string;
  arabicName: string;
  englishName: string;
  icon: string;
}

export const PRAYERS: PrayerInfo[] = [
  { id: "fajr", arabicName: "الفجر", englishName: "Fajr", icon: "🌄" },
  { id: "sunrise", arabicName: "الشروق", englishName: "Sunrise", icon: "🌅" },
  { id: "dhuhr", arabicName: "الظهر", englishName: "Dhuhr", icon: "☀️" },
  { id: "asr", arabicName: "العصر", englishName: "Asr", icon: "🌤️" },
  { id: "maghrib", arabicName: "المغرب", englishName: "Maghrib", icon: "🌇" },
  { id: "isha", arabicName: "العشاء", englishName: "Isha", icon: "🌃" },
];

// ============================================================
// 📅 بيانات التقويم الهجري
// ============================================================

export const HIJRI_MONTHS: string[] = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
];

export const ISLAMIC_EVENTS: Array<{
  date: string;
  arabicTitle: string;
  englishTitle: string;
  description?: string;
}> = [
  { date: "1-1", arabicTitle: "رأس السنة الهجرية", englishTitle: "Islamic New Year" },
  { date: "10-1", arabicTitle: "يوم عاشوراء", englishTitle: "Ashura", description: "صيام يوم عاشوراء يكفر سنة ماضية" },
  { date: "12-3", arabicTitle: "المولد النبوي", englishTitle: "Prophet's Birthday" },
  { date: "27-7", arabicTitle: "الإسراء والمعراج", englishTitle: "Isra and Mi'raj" },
  { date: "15-8", arabicTitle: "ليلة النصف من شعبان", englishTitle: "Mid-Sha'ban" },
  { date: "1-9", arabicTitle: "أول رمضان", englishTitle: "First Day of Ramadan" },
  { date: "27-9", arabicTitle: "ليلة القدر (المرجحة)", englishTitle: "Night of Power" },
  { date: "1-10", arabicTitle: "عيد الفطر", englishTitle: "Eid al-Fitr" },
  { date: "9-12", arabicTitle: "يوم عرفة", englishTitle: "Day of Arafah" },
  { date: "10-12", arabicTitle: "عيد الأضحى", englishTitle: "Eid al-Adha" },
];

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

export const DAWAH_FIELDS: DawahField[] = [
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
];

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

export const TASBIH_PHRASES: TasbihPhrase[] = [
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
    virtue: "من صلى عليه واحدة صلى الله عليه بها عشراً",
  },
];

// ============================================================
// 🛡️ بيانات الرقية الشرعية
// ============================================================

export interface RuqyahVerse {
  reference: string;
  text: string;
}

export const RUQYAH_VERSES: RuqyahVerse[] = [
  {
    reference: "الفاتحة",
    text: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ * الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ * الرَّحْمَنِ الرَّحِيمِ * مَالِكِ يَوْمِ الدِّينِ * إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ * اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ * صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
  },
  {
    reference: "البقرة 255",
    text: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
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
    text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ * مَلِكِ النَّاسِ * إِلَهِ النَّاسِ * مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ * الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ * مِنَ الْجِنَّةِ وَالنَّاسِ",
  },
];

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

export const PROPHETS: ProphetStory[] = [
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
];

// ============================================================
// دوال مساعدة
// ============================================================

/**
 * تحويل الأرقام إلى أرقام عربية
 */
export function toArabicNumeral(num: number | string): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num)
    .split("")
    .map((d) => (/[0-9]/.test(d) ? arabicNumerals[parseInt(d)] : d))
    .join("");
}

/**
 * الحصول على سورة بالرقم
 */
export function getSurahByNumber(num: number): Surah | undefined {
  return SURAHS.find((s) => s.number === num);
}

/**
 * البحث في السور
 */
export function searchSurahs(query: string): Surah[] {
  const q = query.trim().toLowerCase();
  return SURAHS.filter(
    (s) =>
      s.arabicName.includes(query) ||
      s.englishName.toLowerCase().includes(q) ||
      String(s.number) === query
  );
}

/**
 * الحصول على فئة أذكار بالمعرف
 */
export function getAdhkarById(id: string): DhikrCategory | undefined {
  return ADHKAR.find((c) => c.id === id);
}

/**
 * الحصول على جميع الأذكار المسطحة
 */
export function getAllAdhkar(): Array<Dhikr & { category: string }> {
  return ADHKAR.flatMap((cat) =>
    cat.adhkar.map((d) => ({ ...d, category: cat.arabicTitle }))
  );
}