// components/learn/ReferenceDisplay.tsx
import type { Lang } from '@/lib/i18n';
import {
  BookOpenIcon,
  FileTextIcon,
  QuranIcon,
  ShieldCheckIcon,
} from '@/lib/icons';
import {
  hadithBookLabel,
  hadithGradeKey,
  hadithGradeLabel,
  metadataText,
  quranReferenceLabel,
} from '@/lib/references/display';

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
        <BookOpenIcon size={20} aria-hidden="true" />
        {copy.title}
      </h3>

      <ul className="space-y-3">
        {references.map((ref) => {
          const bookLabel = hadithBookLabel(ref.hadith_book, lang);
          const gradeKey = hadithGradeKey(ref.hadith_grade);
          const gradeLabel = hadithGradeLabel(ref.hadith_grade, lang);
          const narrator = metadataText(ref.narrator, lang);
          const scholar = metadataText(ref.scholar_name, lang);
          const bookTitle = metadataText(ref.book_title, lang);
          const quote = metadataText(ref.quote_text, lang);

          return (
            <li key={ref.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-100 dark:border-amber-900">
              {ref.kind === 'quran' && (
                <div className="flex items-start gap-3">
                  <QuranIcon size={20} className="mt-0.5 shrink-0 text-primary-700" aria-hidden="true" />
                  <div>
                    <p className="font-bold text-primary-900 dark:text-primary-300">
                      {copy.quran}
                    </p>
                    <p className="text-sm text-stone-600 dark:text-gray-400">
                      {quranReferenceLabel(ref.surah ?? 0, ref.ayah_from, ref.ayah_to, lang)}
                    </p>
                  </div>
                  {ref.verified && <span className="ms-auto inline-flex items-center gap-1 text-primary-700 text-xs"><ShieldCheckIcon size={14} aria-hidden="true" /> {copy.verified}</span>}
                </div>
              )}

              {ref.kind === 'hadith' && (
                <div className="flex items-start gap-3">
                  <FileTextIcon size={20} className="mt-0.5 shrink-0 text-primary-700" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-bold text-primary-900 dark:text-primary-300">
                      {bookLabel || copy.hadith}
                      {ref.hadith_number != null && ` (${ref.hadith_number})`}
                    </p>
                    {narrator && (
                      <p className="text-xs text-stone-500 dark:text-gray-400">
                        {copy.narrator}: {narrator}
                      </p>
                    )}
                    {gradeLabel && (
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${GRADE_COLORS[gradeKey] ?? 'bg-gray-100 text-gray-600'}`}>
                        {gradeLabel}
                      </span>
                    )}
                  </div>
                  {ref.verified && <span className="inline-flex items-center gap-1 text-primary-700 text-xs"><ShieldCheckIcon size={14} aria-hidden="true" /> {copy.verified}</span>}
                </div>
              )}

              {(ref.kind === 'scholar_quote' || ref.kind === 'book') && (
                <div className="flex items-start gap-3">
                  <BookOpenIcon size={20} className="mt-0.5 shrink-0 text-primary-700" aria-hidden="true" />
                  <div>
                    <p className="font-bold text-primary-900 dark:text-primary-300">
                      {scholar || bookTitle || copy.reference}
                    </p>
                    {bookTitle && scholar && (
                      <p className="text-sm text-stone-600 dark:text-gray-400">
                        {bookTitle}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!['quran', 'hadith', 'scholar_quote', 'book'].includes(ref.kind) && (
                <div className="flex items-start gap-3">
                  <FileTextIcon size={20} className="mt-0.5 shrink-0 text-primary-700" aria-hidden="true" />
                  <div>
                    <p className="font-bold text-primary-900 dark:text-primary-300">
                      {scholar || bookTitle || copy.reference}
                    </p>
                    {quote && (
                      <p className="mt-1 text-sm text-stone-600 dark:text-gray-400">
                        {quote}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

