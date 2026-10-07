import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const steps = [
  { icon: "💧", title: "الوضوء", desc: "اغسل يديك، ثم تمضمض، ثم استنشق، ثم اغسل وجهك، ثم يديك إلى المرفقين، ثم امسح رأسك، ثم اغسل رجليك إلى الكعبين." },
  { icon: "🧭", title: "استقبال القبلة", desc: "توجه نحو الكعبة المشرفة، واستحضر النية في قلبك." },
  { icon: "🙌", title: "تكبيرة الإحرام", desc: "ارفع يديك حذو منكبيك وقل: الله أكبر." },
  { icon: "📖", title: "قراءة الفاتحة", desc: "اقرأ سورة الفاتحة في كل ركعة." },
  { icon: "🙇", title: "الركوع", desc: "انحنِ وقل: سبحان ربي العظيم (ثلاثًا)." },
  { icon: "🧎", title: "السجود", desc: "اسجد وقل: سبحان ربي الأعلى (ثلاثًا)." },
  { icon: "🪑", title: "التشهد", desc: "اجلس واقرأ التشهد والصلاة الإبراهيمية." },
  { icon: "👋", title: "التسليم", desc: "التفت يمينًا وقل: السلام عليكم ورحمة الله، ثم يسارًا كذلك." },
];

export default async function PrayerGuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>تعلم الصلاة</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            دليل مبسط خطوة بخطوة لتعلم الصلاة
          </p>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-r-4 border-gold flex items-start gap-4">
                <span className="flex-shrink-0 w-12 h-12 bg-primary text-gold rounded-full grid place-items-center font-black text-xl">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-primary dark:text-white text-lg mb-1">
                    {s.icon} {s.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}