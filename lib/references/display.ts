// lib/references/display.ts
// تسميات المراجع الشرعية بلغتين — منطق نقي بلا قاعدة بيانات أو شبكة.
// الهدف: ألا تظهر أسماء السور أو كتب الحديث أو درجات الحديث بالعربية في
// الواجهة الإنجليزية، مع إبقاء النص العربي كما هو في الواجهة العربية.

export type ReferenceLang = 'ar' | 'en';

export type SurahInfo = {
  n: number;
  ar: string;
  en: string;
  a: number;
};

/** أسماء السور بالعربية والإنجليزية مع عدد الآيات (١١٤ سورة). */
export const SURAHS: SurahInfo[] = [
  { n: 1, ar: 'الفاتحة', en: 'Al-Fatihah', a: 7 },
  { n: 2, ar: 'البقرة', en: 'Al-Baqarah', a: 286 },
  { n: 3, ar: 'آل عمران', en: "Ali 'Imran", a: 200 },
  { n: 4, ar: 'النساء', en: 'An-Nisa', a: 176 },
  { n: 5, ar: 'المائدة', en: "Al-Ma'idah", a: 120 },
  { n: 6, ar: 'الأنعام', en: "Al-An'am", a: 165 },
  { n: 7, ar: 'الأعراف', en: "Al-A'raf", a: 206 },
  { n: 8, ar: 'الأنفال', en: 'Al-Anfal', a: 75 },
  { n: 9, ar: 'التوبة', en: 'At-Tawbah', a: 129 },
  { n: 10, ar: 'يونس', en: 'Yunus', a: 109 },
  { n: 11, ar: 'هود', en: 'Hud', a: 123 },
  { n: 12, ar: 'يوسف', en: 'Yusuf', a: 111 },
  { n: 13, ar: 'الرعد', en: "Ar-Ra'd", a: 43 },
  { n: 14, ar: 'إبراهيم', en: 'Ibrahim', a: 52 },
  { n: 15, ar: 'الحجر', en: 'Al-Hijr', a: 99 },
  { n: 16, ar: 'النحل', en: 'An-Nahl', a: 128 },
  { n: 17, ar: 'الإسراء', en: 'Al-Isra', a: 111 },
  { n: 18, ar: 'الكهف', en: 'Al-Kahf', a: 110 },
  { n: 19, ar: 'مريم', en: 'Maryam', a: 98 },
  { n: 20, ar: 'طه', en: 'Ta-Ha', a: 135 },
  { n: 21, ar: 'الأنبياء', en: 'Al-Anbiya', a: 112 },
  { n: 22, ar: 'الحج', en: 'Al-Hajj', a: 78 },
  { n: 23, ar: 'المؤمنون', en: "Al-Mu'minun", a: 118 },
  { n: 24, ar: 'النور', en: 'An-Nur', a: 64 },
  { n: 25, ar: 'الفرقان', en: 'Al-Furqan', a: 77 },
  { n: 26, ar: 'الشعراء', en: "Ash-Shu'ara", a: 227 },
  { n: 27, ar: 'النمل', en: 'An-Naml', a: 93 },
  { n: 28, ar: 'القصص', en: 'Al-Qasas', a: 88 },
  { n: 29, ar: 'العنكبوت', en: 'Al-Ankabut', a: 69 },
  { n: 30, ar: 'الروم', en: 'Ar-Rum', a: 60 },
  { n: 31, ar: 'لقمان', en: 'Luqman', a: 34 },
  { n: 32, ar: 'السجدة', en: 'As-Sajdah', a: 30 },
  { n: 33, ar: 'الأحزاب', en: 'Al-Ahzab', a: 73 },
  { n: 34, ar: 'سبأ', en: 'Saba', a: 54 },
  { n: 35, ar: 'فاطر', en: 'Fatir', a: 45 },
  { n: 36, ar: 'يس', en: 'Ya-Sin', a: 83 },
  { n: 37, ar: 'الصافات', en: 'As-Saffat', a: 182 },
  { n: 38, ar: 'ص', en: 'Sad', a: 88 },
  { n: 39, ar: 'الزمر', en: 'Az-Zumar', a: 75 },
  { n: 40, ar: 'غافر', en: 'Ghafir', a: 85 },
  { n: 41, ar: 'فصلت', en: 'Fussilat', a: 54 },
  { n: 42, ar: 'الشورى', en: 'Ash-Shura', a: 53 },
  { n: 43, ar: 'الزخرف', en: 'Az-Zukhruf', a: 89 },
  { n: 44, ar: 'الدخان', en: 'Ad-Dukhan', a: 59 },
  { n: 45, ar: 'الجاثية', en: 'Al-Jathiyah', a: 37 },
  { n: 46, ar: 'الأحقاف', en: 'Al-Ahqaf', a: 35 },
  { n: 47, ar: 'محمد', en: 'Muhammad', a: 38 },
  { n: 48, ar: 'الفتح', en: 'Al-Fath', a: 29 },
  { n: 49, ar: 'الحجرات', en: 'Al-Hujurat', a: 18 },
  { n: 50, ar: 'ق', en: 'Qaf', a: 45 },
  { n: 51, ar: 'الذاريات', en: 'Adh-Dhariyat', a: 60 },
  { n: 52, ar: 'الطور', en: 'At-Tur', a: 49 },
  { n: 53, ar: 'النجم', en: 'An-Najm', a: 62 },
  { n: 54, ar: 'القمر', en: 'Al-Qamar', a: 55 },
  { n: 55, ar: 'الرحمن', en: 'Ar-Rahman', a: 78 },
  { n: 56, ar: 'الواقعة', en: "Al-Waqi'ah", a: 96 },
  { n: 57, ar: 'الحديد', en: 'Al-Hadid', a: 29 },
  { n: 58, ar: 'المجادلة', en: 'Al-Mujadila', a: 22 },
  { n: 59, ar: 'الحشر', en: 'Al-Hashr', a: 24 },
  { n: 60, ar: 'الممتحنة', en: 'Al-Mumtahanah', a: 13 },
  { n: 61, ar: 'الصف', en: 'As-Saff', a: 14 },
  { n: 62, ar: 'الجمعة', en: "Al-Jumu'ah", a: 11 },
  { n: 63, ar: 'المنافقون', en: 'Al-Munafiqun', a: 11 },
  { n: 64, ar: 'التغابن', en: 'At-Taghabun', a: 18 },
  { n: 65, ar: 'الطلاق', en: 'At-Talaq', a: 12 },
  { n: 66, ar: 'التحريم', en: 'At-Tahrim', a: 12 },
  { n: 67, ar: 'الملك', en: 'Al-Mulk', a: 30 },
  { n: 68, ar: 'القلم', en: 'Al-Qalam', a: 52 },
  { n: 69, ar: 'الحاقة', en: 'Al-Haqqah', a: 52 },
  { n: 70, ar: 'المعارج', en: "Al-Ma'arij", a: 44 },
  { n: 71, ar: 'نوح', en: 'Nuh', a: 28 },
  { n: 72, ar: 'الجن', en: 'Al-Jinn', a: 28 },
  { n: 73, ar: 'المزمل', en: 'Al-Muzzammil', a: 20 },
  { n: 74, ar: 'المدثر', en: 'Al-Muddaththir', a: 56 },
  { n: 75, ar: 'القيامة', en: 'Al-Qiyamah', a: 40 },
  { n: 76, ar: 'الإنسان', en: 'Al-Insan', a: 31 },
  { n: 77, ar: 'المرسلات', en: 'Al-Mursalat', a: 50 },
  { n: 78, ar: 'النبأ', en: 'An-Naba', a: 40 },
  { n: 79, ar: 'النازعات', en: "An-Nazi'at", a: 46 },
  { n: 80, ar: 'عبس', en: 'Abasa', a: 42 },
  { n: 81, ar: 'التكوير', en: 'At-Takwir', a: 29 },
  { n: 82, ar: 'الانفطار', en: 'Al-Infitar', a: 19 },
  { n: 83, ar: 'المطففين', en: 'Al-Mutaffifin', a: 36 },
  { n: 84, ar: 'الانشقاق', en: 'Al-Inshiqaq', a: 25 },
  { n: 85, ar: 'البروج', en: 'Al-Buruj', a: 22 },
  { n: 86, ar: 'الطارق', en: 'At-Tariq', a: 17 },
  { n: 87, ar: 'الأعلى', en: "Al-A'la", a: 19 },
  { n: 88, ar: 'الغاشية', en: 'Al-Ghashiyah', a: 26 },
  { n: 89, ar: 'الفجر', en: 'Al-Fajr', a: 30 },
  { n: 90, ar: 'البلد', en: 'Al-Balad', a: 20 },
  { n: 91, ar: 'الشمس', en: 'Ash-Shams', a: 15 },
  { n: 92, ar: 'الليل', en: 'Al-Layl', a: 21 },
  { n: 93, ar: 'الضحى', en: 'Ad-Duha', a: 11 },
  { n: 94, ar: 'الشرح', en: 'Ash-Sharh', a: 8 },
  { n: 95, ar: 'التين', en: 'At-Tin', a: 8 },
  { n: 96, ar: 'العلق', en: 'Al-Alaq', a: 19 },
  { n: 97, ar: 'القدر', en: 'Al-Qadr', a: 5 },
  { n: 98, ar: 'البينة', en: 'Al-Bayyinah', a: 8 },
  { n: 99, ar: 'الزلزلة', en: 'Az-Zalzalah', a: 8 },
  { n: 100, ar: 'العاديات', en: 'Al-Adiyat', a: 11 },
  { n: 101, ar: 'القارعة', en: "Al-Qari'ah", a: 11 },
  { n: 102, ar: 'التكاثر', en: 'At-Takathur', a: 8 },
  { n: 103, ar: 'العصر', en: 'Al-Asr', a: 3 },
  { n: 104, ar: 'الهمزة', en: 'Al-Humazah', a: 9 },
  { n: 105, ar: 'الفيل', en: 'Al-Fil', a: 5 },
  { n: 106, ar: 'قريش', en: 'Quraysh', a: 4 },
  { n: 107, ar: 'الماعون', en: "Al-Ma'un", a: 7 },
  { n: 108, ar: 'الكوثر', en: 'Al-Kawthar', a: 3 },
  { n: 109, ar: 'الكافرون', en: 'Al-Kafirun', a: 6 },
  { n: 110, ar: 'النصر', en: 'An-Nasr', a: 3 },
  { n: 111, ar: 'المسد', en: 'Al-Masad', a: 5 },
  { n: 112, ar: 'الإخلاص', en: 'Al-Ikhlas', a: 4 },
  { n: 113, ar: 'الفلق', en: 'Al-Falaq', a: 5 },
  { n: 114, ar: 'الناس', en: 'An-Nas', a: 6 },
];

const SURAH_BY_NUMBER = new Map(SURAHS.map((surah) => [surah.n, surah]));

export function getSurah(number: number): SurahInfo | undefined {
  return SURAH_BY_NUMBER.get(Number(number));
}

/** هل يحتوي النص على حروف عربية؟ */
export function containsArabic(text: string | null | undefined): boolean {
  return /[\u0600-\u06FF]/.test(String(text ?? ''));
}

/**
 * صياغة مرجع آية قرآنية بلغة الواجهة.
 * عربي: «سورة الذاريات، الآية ٥٦» · إنجليزي: «Surah Adh-Dhariyat, verse 56».
 */
export function quranReferenceLabel(
  surah: number,
  ayahFrom?: number | null,
  ayahTo?: number | null,
  lang: ReferenceLang = 'ar'
): string {
  const info = getSurah(surah);
  const from = Number(ayahFrom ?? 0);
  const to = Number(ayahTo ?? 0);

  if (lang === 'ar') {
    const name = info?.ar ?? String(surah ?? '');
    if (!from) return `سورة ${name}`;
    if (to && to !== from) return `سورة ${name}، الآية ${from}-${to}`;
    return `سورة ${name}، الآية ${from}`;
  }

  const base = info ? `Surah ${info.en}` : 'The Holy Quran';
  if (!from) return base;
  if (to && to !== from) return `${base}, verses ${from}–${to}`;
  return `${base}, verse ${from}`;
}

/** أسماء كتب الحديث الشائعة كما تخزّن في قاعدة البيانات (عربي ← إنجليزي). */
const HADITH_BOOKS_EN: Array<[string, string]> = [
  ['صحيح البخاري', 'Sahih al-Bukhari'],
  ['صحيح مسلم', 'Sahih Muslim'],
  ['سنن الترمذي', "Jami' at-Tirmidhi"],
  ['جامع الترمذي', "Jami' at-Tirmidhi"],
  ['سنن أبي داود', 'Sunan Abu Dawud'],
  ['سنن النسائي', "Sunan an-Nasa'i"],
  ['سنن ابن ماجه', 'Sunan Ibn Majah'],
  ['موطأ مالك', 'Muwatta Malik'],
  ['مسند أحمد', 'Musnad Ahmad'],
  ['صحيح ابن حبان', 'Sahih Ibn Hibban'],
  ['صحيح ابن خزيمة', 'Sahih Ibn Khuzaymah'],
  ['المستدرك', 'Al-Mustadrak'],
  ['متفق عليه', 'Agreed upon (al-Bukhari & Muslim)'],
];

/**
 * اسم كتاب الحديث بلغة الواجهة.
 * تعيد نصًّا فارغًا إذا كان الاسم عربيًّا بلا ترجمة معروفة، حتى تعرض الواجهة
 * الإنجليزية «Hadith» بدل تسريب العربية.
 */
export function hadithBookLabel(
  book: string | null | undefined,
  lang: ReferenceLang
): string {
  const text = String(book ?? '').trim();
  if (!text) return '';
  if (lang === 'ar') return text;

  for (const [arabic, english] of HADITH_BOOKS_EN) {
    if (text === arabic) return english;
  }

  return containsArabic(text) ? '' : text;
}

/** توحيد درجة الحديث إلى مفتاح ثابت بغض النظر عن لغة التخزين. */
export function hadithGradeKey(grade: string | null | undefined): string {
  const text = String(grade ?? '').trim().toLowerCase();
  if (!text) return '';

  if (['sahih', 'صحيح', 'صحيح لغيره'].includes(text)) return 'sahih';
  if (['hasan', 'حسن', 'حسن لغيره', 'حسن صحيح'].includes(text)) return 'hasan';
  if (['daif', "da'if", 'ضعيف', 'ضعيف الإسناد'].includes(text)) return 'daif';
  if (['mawdu', "mawdu'", 'موضوع'].includes(text)) return 'mawdu';
  return '';
}

const GRADE_LABELS: Record<string, Record<ReferenceLang, string>> = {
  sahih: { ar: 'صحيح', en: 'Sahih' },
  hasan: { ar: 'حسن', en: 'Hasan' },
  daif: { ar: 'ضعيف', en: "Da'if" },
  mawdu: { ar: 'موضوع', en: "Mawdu'" },
};

/** درجة الحديث بلغة الواجهة؛ تعيد '' إذا كانت عربية غير معروفة في الإنجليزية. */
export function hadithGradeLabel(
  grade: string | null | undefined,
  lang: ReferenceLang
): string {
  const text = String(grade ?? '').trim();
  if (!text) return '';

  const key = hadithGradeKey(text);
  if (key) return GRADE_LABELS[key][lang];

  return lang === 'en' && containsArabic(text) ? '' : text;
}

/**
 * بيانات وصفية (راوٍ/عالم/كتاب) بلغة الواجهة.
 * في الإنجليزية نخفي العربي غير المترجم بدل عرضه كما هو.
 */
export function metadataText(
  value: string | null | undefined,
  lang: ReferenceLang
): string {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (lang === 'en' && containsArabic(text)) return '';
  return text;
}
