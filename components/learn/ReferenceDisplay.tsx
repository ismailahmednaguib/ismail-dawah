// components/learn/ReferenceDisplay.tsx
import type { Lang } from '@/lib/i18n';

interface Reference {
  id: string;
  kind: string;
  surah?: number;
  ayah_from?: number;
  ayah_to?: number;
  hadith_text?: string;
  narrator?: string;
  hadith_book?: string;
  hadith_number?: number;
  hadith_grade?: string;
  scholar_name?: string;
  book_title?: string;
  quote_text?: string;
  verified?: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  sahih: 'bg-primary-100 text-primary-800',
  hasan: 'bg-primary-100 text-primary-800',
  daif: 'bg-yellow-100 text-yellow-800',
  mawdu: 'bg-red-100 text-red-800',
};

const GRADE_LABELS: Record<string, string> = {
  sahih: 'صحيح',
  hasan: 'حسن',
  daif: 'ضعيف',
  mawdu: 'موضوع',
};

const COPY: Record<string, any> = {
  ar: {
    title: 'المراجع والتوثيق الشرعي',
    quran: 'القرآن الكريم',
    hadith: 'حديث',
    narrator: 'الراوي',
    verified: 'موثق',
    reference: 'مرجع',
  },
  en: {
    title: 'Sources and scholarly references',
    quran: 'The Holy Quran',
    hadith: 'Hadith',
    narrator: 'Narrator',
    verified: 'Verified',
    reference: 'Reference',
  },
} as const;

const SURAH_NAMES = [
  '', 'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف',
  'الأنفال', 'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر',
  'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه', 'الأنبياء', 'الحج', 'المؤمنون',
  'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم', 'لقمان',
  'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
  'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح',
  'الحجرات', 'ق', 'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة',
  'الحديد', 'المجادلة', 'الحشر', 'الممتحنة', 'الصف', 'الجمعة', 'المنافقون',
  'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج', 'نوح',
  'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ',
  'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج',
  'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى',
  'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة',
  'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون',
  'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس',
];

export default function ReferenceDisplay({
  references,
  lang,
}: {
  references: Reference[];
  lang: Lang;
}) {
  if (!references || references.length === 0) return null;
  const copy = COPY[lang];

  return (
    <div className="mt-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-4 flex items-center gap-2">
        <span>📚</span>
        {copy.title}
      </h3>

      <ul className="space-y-3">
        {references.map((ref) => (
          <li key={ref.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-100 dark:border-amber-900">
            {ref.kind === 'quran' && (
              <div className="flex items-start gap-3">
                <span className="text-xl">📖</span>
                <div>
                  <p className="font-bold text-primary-900 dark:text-primary-300">
                    {copy.quran}
                  </p>
                  <p className="text-sm text-stone-600 dark:text-gray-400">
                    سورة {SURAH_NAMES[ref.surah ?? 0] ?? ref.surah}
                    {ref.ayah_from && `، الآية ${ref.ayah_from}`}
                    {ref.ayah_to && `-${ref.ayah_to}`}
                  </p>
                </div>
                {ref.verified && <span className="mr-auto text-primary-600 text-xs">✓ {copy.verified}</span>}
              </div>
            )}

            {ref.kind === 'hadith' && (
              <div className="flex items-start gap-3">
                <span className="text-xl">💬</span>
                <div className="flex-1">
                  <p className="font-bold text-primary-900 dark:text-primary-300">
                    {ref.hadith_book ?? copy.hadith}
                    {ref.hadith_number && ` (${ref.hadith_number})`}
                  </p>
                  {ref.narrator && (
                    <p className="text-xs text-stone-500 dark:text-gray-400">
                      {copy.narrator}: {ref.narrator}
                    </p>
                  )}
                  {ref.hadith_grade && (
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${GRADE_COLORS[ref.hadith_grade] ?? 'bg-gray-100 text-gray-600'}`}>
                      {GRADE_LABELS[ref.hadith_grade] ?? ref.hadith_grade}
                    </span>
                  )}
                </div>
                {ref.verified && <span className="text-primary-600 text-xs">✓ {copy.verified}</span>}
              </div>
            )}

            {(ref.kind === 'scholar_quote' || ref.kind === 'book') && (
              <div className="flex items-start gap-3">
                <span className="text-xl">📕</span>
                <div>
                  <p className="font-bold text-primary-900 dark:text-primary-300">
                    {ref.scholar_name ?? ref.book_title ?? copy.reference}
                  </p>
                  {ref.book_title && ref.scholar_name && (
                    <p className="text-sm text-stone-600 dark:text-gray-400">
                      {ref.book_title}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!['quran', 'hadith', 'scholar_quote', 'book'].includes(ref.kind) && (
              <div className="flex items-start gap-3">
                <span className="text-xl">📚</span>
                <div>
                  <p className="font-bold text-primary-900 dark:text-primary-300">
                    {ref.scholar_name ?? ref.book_title ?? copy.reference}
                  </p>
                  {ref.quote_text && (
                    <p className="mt-1 text-sm text-stone-600 dark:text-gray-400">
                      {ref.quote_text}
                    </p>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

