import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const tools = [
  { slug: "quran", icon: "📖", ar: "المصحف الكريم", en: "Holy Quran" },
  { slug: "prayer-times", icon: "🕌", ar: "مواقيت الصلاة", en: "Prayer Times" },
  { slug: "qibla", icon: "🧭", ar: "تحديد القبلة", en: "Qibla Direction" },
  { slug: "calendar", icon: "📅", ar: "التقويم الهجري والميلادي", en: "Hijri & Gregorian Calendar" },
  { slug: "khatm-dua", icon: "✨", ar: "أدعية ختم القرآن", en: "Quran Completion Duas" },
  { slug: "zakat", icon: "🧮", ar: "حاسبة الزكاة", en: "Zakat Calculator" },
  { slug: "inheritance", icon: "📊", ar: "حاسبة المواريث", en: "Inheritance Calculator" },
  { slug: "daily-wird", icon: "📖", ar: "الورد اليومي للقرآن", en: "Daily Quran Wird" },
];

export default async function ToolsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>🛠️ الأدوات الإسلامية</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            مجموعة من الأدوات المفيدة للمسلم
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tools.map((t) => (
              <Link
                key={t.slug}
                href={`/${lang}/${t.slug}`}
                className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl border border-transparent hover:border-gold transition"
              >
                <span className="text-5xl">{t.icon}</span>
                <div>
                  <h3 className="font-bold text-primary dark:text-white text-lg">{lang === "ar" ? t.ar : t.en}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}