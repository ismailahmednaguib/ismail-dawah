// components/learn/ReferenceDisplay.tsx
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
  sahih: 'bg-green-100 text-green-800',
  hasan: 'bg-blue-100 text-blue-800',
  daif: 'bg-yellow-100 text-yellow-800',
  mawdu: 'bg-red-100 text-red-800',
};

const GRADE_LABELS: Record<string, string> = {
  sahih: 'صحيح',
  hasan: 'حسن',
  daif: 'ضعيف',
  mawdu: 'موضوع',
};

const SURAH_NAMES = [
  '', 'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف',
  'الأنفال', 'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر',
  // ... باقي السور
];

export default function ReferenceDisplay({ references }: { references: Reference[] }) {
  if (!references || references.length === 0) return null;

  return (
    <div className="mt-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-4 flex items-center gap-2">
        <span>📚</span>
        المراجع والتوثيق الشرعي
      </h3>

      <ul className="space-y-3">
        {references.map((ref) => (
          <li key={ref.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-100 dark:border-amber-900">
            {ref.kind === 'quran' && (
              <div className="flex items-start gap-3">
                <span className="text-xl">📖</span>
                <div>
                  <p className="font-bold text-emerald-900 dark:text-emerald-300">
                    القرآن الكريم
                  </p>
                  <p className="text-sm text-stone-600 dark:text-gray-400">
                    سورة {SURAH_NAMES[ref.surah ?? 0] ?? ref.surah}
                    {ref.ayah_from && `، الآية ${ref.ayah_from}`}
                    {ref.ayah_to && `-${ref.ayah_to}`}
                  </p>
                </div>
                {ref.verified && <span className="mr-auto text-green-600 text-xs">✓ موثق</span>}
              </div>
            )}

            {ref.kind === 'hadith' && (
              <div className="flex items-start gap-3">
                <span className="text-xl">💬</span>
                <div className="flex-1">
                  <p className="font-bold text-emerald-900 dark:text-emerald-300">
                    {ref.hadith_book ?? 'حديث'}
                    {ref.hadith_number && ` (${ref.hadith_number})`}
                  </p>
                  {ref.narrator && (
                    <p className="text-xs text-stone-500 dark:text-gray-400">
                      الراوي: {ref.narrator}
                    </p>
                  )}
                  {ref.hadith_grade && (
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${GRADE_COLORS[ref.hadith_grade] ?? 'bg-gray-100 text-gray-600'}`}>
                      {GRADE_LABELS[ref.hadith_grade] ?? ref.hadith_grade}
                    </span>
                  )}
                </div>
                {ref.verified && <span className="text-green-600 text-xs">✓ موثق</span>}
              </div>
            )}

            {(ref.kind === 'scholar_quote' || ref.kind === 'book') && (
              <div className="flex items-start gap-3">
                <span className="text-xl">📕</span>
                <div>
                  <p className="font-bold text-emerald-900 dark:text-emerald-300">
                    {ref.scholar_name ?? ref.book_title ?? 'مرجع'}
                  </p>
                  {ref.book_title && ref.scholar_name && (
                    <p className="text-sm text-stone-600 dark:text-gray-400">
                      {ref.book_title}
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