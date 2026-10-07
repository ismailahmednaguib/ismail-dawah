import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { getFieldTranslation } from "@/lib/translations";

export const dynamic = "force-dynamic";

const gradients = [
  "from-emerald-600 to-emerald-700",
  "from-blue-600 to-blue-700",
  "from-purple-600 to-purple-700",
  "from-teal-600 to-teal-700",
  "from-rose-600 to-rose-700",
  "from-amber-600 to-amber-700",
  "from-indigo-600 to-indigo-700",
  "from-green-600 to-green-700",
  "from-cyan-600 to-cyan-700",
  "from-orange-600 to-orange-700",
  "from-pink-600 to-pink-700",
  "from-red-600 to-red-700",
  "from-violet-600 to-violet-700",
  "from-yellow-600 to-yellow-700",
  "from-lime-600 to-lime-700",
  "from-fuchsia-600 to-fuchsia-700",
  "from-stone-600 to-stone-700",
];

export default async function FieldsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="📚"
          title="كل العلوم الشرعية"
          subtitle={`${c.fields.length} علماً شرعياً مترجماً إلى ${13} لغة`}
          verse="وَقُل رَّبِّ زِدْنِي عِلْمًا"
          verseSource="سورة طه - الآية 114"
          gradient="from-emerald-600 via-emerald-700 to-emerald-800"
        />

        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            <IslamicSection 
              title="اختر العلم" 
              icon="🎓" 
              subtitle="اضغط على أي علم لاستكشاف محتواه من دروس وفتاوى ومقالات"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {c.fields.map((f, i) => {
                  const ft = getFieldTranslation(f.slug, L, { name: f.name, desc: f.desc }, c.fieldTranslations);
                  const gradient = gradients[i % gradients.length];
                  
                  return (
                    <Link
                      key={f.id}
                      href={`/${lang}/fields/${f.slug}`}
                      className={`group relative bg-gradient-to-br ${gradient} text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden`}
                    >
                      {/* زخرفة خلفية */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition"></div>
                      
                      <div className="relative">
                        <div className="text-5xl mb-3">{f.icon}</div>
                        <h3 className="font-serif text-xl font-bold mb-2">{ft.name}</h3>
                        <p className="text-white/90 text-sm mb-3 line-clamp-2">{ft.desc}</p>
                        
                        {/* أيقونة الانتقال */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/20">
                          <span className="text-xs text-white/70">استكشف المحتوى</span>
                          <span className="text-2xl group-hover:translate-x-2 transition-transform">←</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </IslamicSection>

            {/* نصيحة */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 text-center shadow-2xl mt-10">
              <span className="text-6xl mb-4 block">🌟</span>
              <h3 className="font-serif text-2xl text-gold mb-4">نصيحة لطالب العلم</h3>
              <p className="text-white/90 text-lg leading-relaxed max-w-3xl mx-auto">
                ابدأ بالعقيدة الصحيحة، ثم فقه العبادات، ثم السيرة النبوية. ولا تنسَ الإخلاص في طلب العلم، فإنه سر التوفيق والبركة.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}