// lib/verse.ts
// آية اليوم — بتتغير يومياً بتوقيت القاهرة، بدون أي طلب شبكة.
import type { Lang } from "@/lib/i18n";

type Verse = {
  ar: string; // نص الآية بالتشكيل (بدون الأقواس)
  en: string; // معنى الآية بالإنجليزية
  surahAr: string;
  surahEn: string;
  ref: string; // رقم السورة:الآية
};

const VERSES: Verse[] = [
  {
    ar: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ۝ خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ",
    en: "Read in the name of your Lord who created — created man from a clinging substance.",
    surahAr: "العلق",
    surahEn: "Al-Alaq",
    ref: "96:1-2",
  },
  {
    ar: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    en: "And say: My Lord, increase me in knowledge.",
    surahAr: "طه",
    surahEn: "Taha",
    ref: "20:114",
  },
  {
    ar: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    en: "Verily, in the remembrance of Allah do hearts find rest.",
    surahAr: "الرعد",
    surahEn: "Ar-Ra'd",
    ref: "13:28",
  },
  {
    ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    en: "Indeed, with hardship comes ease. Indeed, with hardship comes ease.",
    surahAr: "الشرح",
    surahEn: "Ash-Sharh",
    ref: "94:5-6",
  },
  {
    ar: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    en: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    surahAr: "البقرة",
    surahEn: "Al-Baqarah",
    ref: "2:152",
  },
  {
    ar: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    en: "Allah does not burden a soul beyond its capacity.",
    surahAr: "البقرة",
    surahEn: "Al-Baqarah",
    ref: "2:286",
  },
  {
    ar: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
    en: "Whoever fears Allah, He will make a way out for him, and provide for him from where he does not expect.",
    surahAr: "الطلاق",
    surahEn: "At-Talaq",
    ref: "65:2-3",
  },
  {
    ar: "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ",
    en: "Indeed, the patient will be given their reward without account.",
    surahAr: "الزمر",
    surahEn: "Az-Zumar",
    ref: "39:10",
  },
  {
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    en: "O you who believe, seek help through patience and prayer. Indeed, Allah is with the patient.",
    surahAr: "البقرة",
    surahEn: "Al-Baqarah",
    ref: "2:153",
  },
  {
    ar: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ",
    en: "And your Lord says: Call upon Me; I will respond to you.",
    surahAr: "غافر",
    surahEn: "Ghafir",
    ref: "40:60",
  },
  {
    ar: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
    en: "Allah will raise those who believe among you, and those who were given knowledge, by degrees.",
    surahAr: "المجادلة",
    surahEn: "Al-Mujadila",
    ref: "58:11",
  },
  {
    ar: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    en: "Do not weaken and do not grieve, for you will be superior if you are believers.",
    surahAr: "آل عمران",
    surahEn: "Al-Imran",
    ref: "3:139",
  },
];

/** رقم اليوم بتوقيت القاهرة (عدد الأيام منذ 1970) */
function cairoDayNumber(): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()); // مثال: 2026-10-12

  const [y, m, d] = parts.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function getVerseOfTheDay(lang: Lang): { text: string; source: string } {
  const verse = VERSES[cairoDayNumber() % VERSES.length];

  if (lang === "en") {
    return {
      text: `\u201C${verse.en}\u201D`,
      source: `Surah ${verse.surahEn} — ${verse.ref}`,
    };
  }

  return {
    text: `﴿ ${verse.ar} ﴾`,
    source: `سورة ${verse.surahAr} — ${verse.ref}`,
  };
}