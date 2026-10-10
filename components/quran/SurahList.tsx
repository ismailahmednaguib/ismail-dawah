"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";

// ===== بيانات السور الـ 114 =====
type Surah = {
  number: number;
  arabicName: string;
  englishName: string;
  ayahs: number;
  type: "makki" | "madani";
};

const SURAHS: Surah[] = [
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

// أرقام عربية-هندية
function toArabicNumeral(num: number): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((d) => arabicNumerals[Number.parseInt(d, 10)])
    .join("");
}

/**
 * ترجمة آمنة مع fallback.
 * تمنع فشل البناء إذا كان مفتاح الترجمة غير معرّف في lib/i18n.
 */
function translateOr(lang: Lang, key: string, fallback: string): string {
  try {
    const value = (
      t as unknown as (lang: Lang, key: string) => string | undefined
    )(lang, key);

    if (typeof value === "string" && value.trim() && value !== key) {
      return value;
    }
  } catch {
    // ignore
  }

  return fallback;
}

export default function SurahList({ lang }: { lang: Lang }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "makki" | "madani">("all");

  const filtered = useMemo(() => {
    const rawQuery = search.trim();
    const lowerQuery = rawQuery.toLowerCase();

    return SURAHS.filter((surah) => {
      // فلترة النوع
      if (filter !== "all" && surah.type !== filter) {
        return false;
      }

      // البحث
      if (!rawQuery) {
        return true;
      }

      return (
        surah.arabicName.includes(rawQuery) ||
        surah.englishName.toLowerCase().includes(lowerQuery) ||
        surah.number.toString() === rawQuery
      );
    });
  }, [search, filter]);

  const searchPlaceholder = translateOr(
    lang,
    "quran.search.placeholder",
    lang === "ar" ? "ابحث عن سورة..." : "Search surah..."
  );

  const allLabel = translateOr(
    lang,
    "quran.all",
    lang === "ar" ? "الكل" : "All"
  );

  const makkiLabel = translateOr(
    lang,
    "quran.makki",
    lang === "ar" ? "مكية" : "Makki"
  );

  const madaniLabel = translateOr(
    lang,
    "quran.madani",
    lang === "ar" ? "مدنية" : "Madani"
  );

  const noResultsLabel = translateOr(
    lang,
    "quran.no_results",
    lang === "ar" ? "لا توجد نتائج" : "No results found"
  );

  const resultsCountLabel =
    lang === "ar"
      ? `عدد السور: ${toArabicNumeral(filtered.length)}`
      : `Surahs: ${filtered.length}`;

  const ayahsLabel = (count: number) =>
    lang === "ar" ? `${toArabicNumeral(count)} آية` : `${count} ayahs`;

  return (
    <div>
      {/* البحث والفلترة */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        {/* البحث */}
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="input-islamic !ps-12"
            aria-label={searchPlaceholder}
          />
        </div>

        {/* الفلترة */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all" as const, label: allLabel },
            { key: "makki" as const, label: makkiLabel },
            { key: "madani" as const, label: madaniLabel },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilter(opt.key)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                filter === opt.key
                  ? "bg-primary-500 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-primary-50 dark:bg-night-800 dark:text-slate-300 dark:hover:bg-night-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* عدّاد النتائج */}
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        {resultsCountLabel}
      </p>

      {/* قائمة السور */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-lg text-slate-500 dark:text-slate-400">
            {noResultsLabel}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((surah) => (
            <Link
              key={surah.number}
              href={`/${lang}/quran/${surah.number}`}
              className="card card-interactive group p-5"
            >
              <div className="flex items-center gap-4">
                {/* رقم السورة */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 font-bold text-white shadow-md transition-transform group-hover:scale-110">
                  {lang === "ar" ? toArabicNumeral(surah.number) : surah.number}
                </div>

                {/* معلومات السورة */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-bold text-slate-800 dark:text-white">
                    {lang === "ar" ? surah.arabicName : surah.englishName}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{ayahsLabel(surah.ayahs)}</span>
                    <span>•</span>
                    <span
                      className={
                        surah.type === "makki"
                          ? "text-gold-600 dark:text-gold-400"
                          : "text-primary-600 dark:text-primary-400"
                      }
                    >
                      {surah.type === "makki" ? makkiLabel : madaniLabel}
                    </span>
                  </div>
                </div>

                {/* سهم */}
                <svg
                  className="h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-primary-500 rtl:rotate-180 rtl:group-hover:-translate-x-1 dark:text-slate-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}