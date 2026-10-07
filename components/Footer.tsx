import Link from "next/link";
import type { Settings } from "@/lib/data";
import { t, type Lang } from "@/lib/i18n";

export default function Footer({ settings, lang = "ar" }: { settings?: Settings; lang?: Lang }) {
  const tr = t(lang);
  const shortName = settings?.shortName || "الشيخ إسماعيل";
  const motto = settings?.motto || "العلم نور والدعوة أمانة";
  const jobTitle = settings?.jobTitle || "";
  const wa = settings?.wa || "";
  const email = settings?.email || "";
  const address = settings?.address || "";
  const appUrl = settings?.appUrl || "";
  const ownerName = settings?.ownerName || "الشيخ إسماعيل";
  
  const facebookUrl = settings?.facebookUrl || "";
  const youtubeUrl = settings?.youtubeUrl || "";
  const telegramUrl = settings?.telegramUrl || "";
  const twitterUrl = settings?.twitterUrl || "";
  const instagramUrl = settings?.instagramUrl || "";

  return (
    <footer className="bg-primary text-white/70 text-sm relative">
      <div className="h-1.5 bg-gold/70" />
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        {/* العمود 1: اللوجو والنبذة */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 bg-gold text-primary rounded-full grid place-items-center font-serif text-xl font-bold">إ</span>
            <span className="font-bold text-white">{shortName}</span>
          </div>
          <p className="font-serif text-gold-light text-lg mb-2">{motto}</p>
          <p className="text-white/60 text-xs">{jobTitle}</p>
        </div>

        {/* العمود 2: روابط سريعة */}
        <div>
          <h3 className="text-white font-bold mb-4">{tr.quickLinks}</h3>
          <div className="grid grid-cols-1 gap-2">
            <Link href={`/${lang}`} className="hover:text-gold transition">🏠 {tr.home}</Link>
            <Link href={`/${lang}/about`} className="hover:text-gold transition">👤 {tr.about}</Link>
            <Link href={`/${lang}/fields`} className="hover:text-gold transition">📚 كل العلوم</Link>
            <Link href={`/${lang}/contact`} className="hover:text-gold transition">💬 {tr.contact}</Link>
          </div>
        </div>

        {/* العمود 3: التواصل */}
        <div>
          <h3 className="text-white font-bold mb-4">{tr.contactUs}</h3>
          <div className="space-y-2 mb-4">
            {wa && <p>💬 <span dir="ltr">+{wa}</span></p>}
            {email && <p>✉️ {email}</p>}
            {address && <p>📍 {address}</p>}
          </div>

          {(facebookUrl || youtubeUrl || telegramUrl || twitterUrl || instagramUrl) && (
            <div className="flex gap-2 flex-wrap">
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-blue-600 rounded-full grid place-items-center text-white hover:opacity-80 transition" title="Facebook">
                  📘
                </a>
              )}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-red-600 rounded-full grid place-items-center text-white hover:opacity-80 transition" title="YouTube">
                  📺
                </a>
              )}
              {telegramUrl && (
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-cyan-600 rounded-full grid place-items-center text-white hover:opacity-80 transition" title="Telegram">
                  ✈️
                </a>
              )}
              {twitterUrl && (
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-900 rounded-full grid place-items-center text-white hover:opacity-80 transition" title="Twitter">
                  🐦
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-pink-600 rounded-full grid place-items-center text-white hover:opacity-80 transition" title="Instagram">
                  📷
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {appUrl && (
        <div className="text-center pb-6">
          <a href={appUrl} download className="inline-flex items-center gap-2 bg-gold text-gray-900 px-6 py-2.5 rounded-lg font-bold hover:bg-gold-light transition">
            📱 {tr.downloadApp}
          </a>
        </div>
      )}

      <div className="border-t border-white/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} {ownerName} — {tr.rights}
      </div>
    </footer>
  );
}