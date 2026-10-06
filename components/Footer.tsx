import Link from "next/link";
import type { Settings } from "@/lib/data";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export default function Footer({ settings, lang }: { settings: Settings; lang: Lang }) {
  const tr = t(lang);
  return (
    <footer className="bg-primary text-white/70 text-sm relative">
      <div className="h-1.5 bg-gold/70" />
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 bg-gold text-primary rounded-full grid place-items-center font-serif text-xl font-bold">إ</span>
            <span className="font-bold text-white">{settings.shortName}</span>
          </div>
          <p className="font-serif text-gold-light text-lg mb-2">{settings.motto}</p>
          <p className="text-white/60">{settings.jobTitle}</p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">{tr.quickLinks}</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/${lang}`} className="hover:text-gold transition">{tr.home}</Link>
            <Link href={`/${lang}/about`} className="hover:text-gold transition">{tr.about}</Link>
            <Link href={`/${lang}/contact`} className="hover:text-gold transition">{tr.contact}</Link>
          </div>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">{tr.contactUs}</h3>
          <p className="mb-2">💬 <span dir="ltr">+{settings.wa}</span></p>
          <p className="mb-2">✉️ {settings.email}</p>
          <p>📍 {settings.address}</p>
        </div>
      </div>
      {settings.appUrl && (
        <div className="text-center pb-6">
          <a href={settings.appUrl} download className="inline-flex items-center gap-2 bg-gold text-gray-900 px-6 py-2.5 rounded-lg font-bold hover:bg-gold-light transition">
            📱 {tr.downloadApp}
          </a>
        </div>
      )}
      <div className="border-t border-white/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} {settings.ownerName} — {tr.rights}
      </div>
    </footer>
  );
}