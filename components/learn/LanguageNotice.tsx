// components/learn/LanguageNotice.tsx
interface LanguageNoticeProps {
  requestedLang: string;
  actualLang: string;
  langNames: Record<string, string>;
}

export default function LanguageNotice({
  requestedLang,
  actualLang,
  langNames,
}: LanguageNoticeProps) {
  if (requestedLang === actualLang) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm">
      <span className="text-lg">🌐</span>
      <p className="text-amber-800 dark:text-amber-300">
        هذا المحتوى غير متوفر بعد باللغة {langNames[requestedLang] ?? requestedLang}.
        يتم عرضه باللغة {langNames[actualLang] ?? actualLang}.
      </p>
    </div>
  );
}