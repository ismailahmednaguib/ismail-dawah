"use client";

import { useRouter, usePathname } from "next/navigation";
import { languages, type Lang } from "@/lib/i18n";

export default function LanguageSwitcher({ current }: { current: Lang }) {
  const router = useRouter();
  const pathname = usePathname();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value as Lang;
    const segments = pathname.split("/");
    segments[1] = code;
    const newPath = segments.join("/") || `/${code}`;
    document.cookie = `lang=${code};path=/;max-age=31536000`;
    router.push(newPath);
  };

  return (
    <select
      value={current}
      onChange={onChange}
      aria-label="Language"
      className="bg-white dark:bg-gray-800 border border-gold/40 text-primary dark:text-white text-sm font-bold rounded-lg px-2 py-1.5 cursor-pointer hover:border-gold transition"
    >
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.flag} {l.name}
        </option>
      ))}
    </select>
  );
}