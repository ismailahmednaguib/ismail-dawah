import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function Box({ href, icon, title, desc, badge, delay }: { href: string; icon: string; title: string; desc: string; badge: string; delay: number }) {
  return (
    <Link href={href} style={{ animationDelay: `${delay}ms` }}
      className="fade-up group relative bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-md overflow-hidden border border-black/5 dark:border-white/10 hover:border-gold/60 hover:-translate-y-1.5 hover:shadow-xl transition block">
      <span className="absolute inset-0 pattern-gold opacity-0 group-hover:opacity-100 transition" />
      <span className="relative inline-grid place-items-center w-16 h-16 rounded-full bg-cream-dark dark:bg-gray-700 border-2 border-gold/50 text-3xl mb-3 group-hover:scale-110 transition">{icon}</span>
      <h2 className="relative font-serif text-xl text-primary dark:text-gold font-bold mb-1">{title}</h2>
      <p className="relative text-xs text-gray-500 dark:text-gray-400 mb-3 min-h-8">{desc}</p>
      {badge && <span className="relative inline-block bg-primary text-gold-light text-xs font-bold px-3 py-1 rounded-full">{badge}</span>}
    </Link>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6 mt-12 first:mt-0">
      <div className="h-px flex-1 bg-gold/30" />
      <h2 className="font-serif text-2xl text-primary dark:text-gold font-bold whitespace-nowrap">{children}</h2>
      <div className="h-px flex-1 bg-gold/30" />
    </div>
  );
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  let d = 0;
  const next = () => (d++ * 50);

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        {/* قسم البطل */}
        <section className="relative bg-primary text-white py-16 text-center overflow-hidden pattern-light">
          <div className="relative max-w-3xl mx-auto px-4 fade-up">
            <p className="font-serif text-gold-light text-xl mb-3">{c.settings.kicker}</p>
            <h1 className="font-serif text-4xl md:text-5xl mb-2 leading-snug">{c.settings.ownerName}</h1>
            <div className="ornament my-4"><span className="text-2xl">✦</span></div>
            <p className="text-white/80">{c.settings.motto}</p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4">

            {/* 📚 مربع واحد للعلوم الشرعية */}
            <SectionTitle>📚 {tr.sciences}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              <Box href={`/${lang}/fields`} icon="📚" title={tr.allSciences} desc={tr.allSciencesDesc} badge={`${c.fields.length} ${tr.item}`} delay={next()} />
            </div>

            {/* 📢 الأقسام الدعوية */}
            <SectionTitle>📢 {tr.dawahSections}</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              <Box href={`/${lang}/fatwa`} icon="❓" title={tr.boxFatwaTitle} desc={tr.boxFatwaDesc} badge={`${c.fatwas.length} ${tr.fatwa}`} delay={next()} />
              <Box href={`/${lang}/doubts`} icon="⚔️" title={tr.doubts} desc={tr.doubtsDesc} badge={`${c.doubts.length}`} delay={next()} />
              <Box href={`/${lang}/prayer-guide`} icon="🕌" title={lang === "ar" ? "تعلم الصلاة" : "Learn Prayer"} desc={lang === "ar" ? "دليل خطوة بخطوة" : "Step by step"} badge="" delay={next()} />
              <Box href={`/${lang}/embrace-islam`} icon="🌟" title={lang === "ar" ? "اعتنق الإسلام" : "Embrace Islam"} desc={lang === "ar" ? "رحلتك نحو الهداية" : "Your journey"} badge="" delay={next()} />
              <Box href={`/${lang}/live`} icon="📡" title={tr.boxLiveTitle} desc={tr.boxLiveDesc} badge={tr.followUs} delay={next()} />
              <Box href={`/${lang}/projects`} icon="🤝" title={tr.boxProjectsTitle} desc={tr.boxProjectsDesc} badge={`${c.projects.length} ${tr.project}`} delay={next()} />
              <Box href={`/${lang}/news`} icon="📰" title={tr.boxNewsTitle} desc={tr.boxNewsDesc} badge={`${c.news.length} ${tr.newsItem}`} delay={next()} />
              <Box href={`/${lang}/map`} icon="🗺️" title={tr.boxMapTitle} desc={tr.boxMapDesc} badge={`${c.places.length} ${tr.place}`} delay={next()} />
              <Box href={`/${lang}/dawah-guide`} icon="📢" title={lang === "ar" ? "دليل الدعاة" : "Da'wah Guide"} desc={lang === "ar" ? "كيف تدعو إلى الله" : "How to call to Allah"} badge="" delay={next()} />
              <Box href={`/${lang}/prophets-stories`} icon="📖" title={lang === "ar" ? "قصص الأنبياء" : "Prophets Stories"} desc={lang === "ar" ? "من آدم إلى محمد ﷺ" : "From Adam to Muhammad ﷺ"} badge="" delay={next()} />
              <Box href={`/${lang}/atheism-response`} icon="⚔️" title={lang === "ar" ? "الرد على الإلحاد" : "Atheism Response"} desc={lang === "ar" ? "شبهات وردود" : "Doubts & answers"} badge="" delay={next()} />
              <Box href={`/${lang}/youth-issues`} icon="🧑" title={lang === "ar" ? "قضايا الشباب" : "Youth Issues"} desc={lang === "ar" ? "مشاكل وحلول" : "Problems & solutions"} badge="" delay={next()} />
              <Box href={`/${lang}/khutab`} icon="🎤" title={lang === "ar" ? "مكتبة الخطب" : "Khutab Library"} desc={lang === "ar" ? "خطب جمعة جاهزة" : "Friday sermons"} badge="" delay={next()} />
              <Box href={`/${lang}/quran-memorization`} icon="📚" title={lang === "ar" ? "كيف تحفظ القرآن" : "Memorize Quran"} desc={lang === "ar" ? "منهج عملي" : "Practical method"} badge="" delay={next()} />
              <Box href={`/${lang}/ruqyah`} icon="🕯️" title={lang === "ar" ? "الرقية الشرعية" : "Ruqyah"} desc={lang === "ar" ? "آيات وأدعية" : "Verses & duas"} badge="" delay={next()} />
              <Box href={`/${lang}/hajj-guide`} icon="🕋" title={lang === "ar" ? "دليل الحج والعمرة" : "Hajj Guide"} desc={lang === "ar" ? "خطوة بخطوة" : "Step by step"} badge="" delay={next()} />
              <Box href={`/${lang}/women-fatwas`} icon="👩" title={lang === "ar" ? "فتاوى المرأة" : "Women Fatwas"} desc={lang === "ar" ? "قضايا المرأة" : "Women's issues"} badge="" delay={next()} />
            </div>

            {/* 🛠️ الأدوات الإسلامية */}
            <SectionTitle>🛠️ {lang === "ar" ? "الأدوات الإسلامية" : "Islamic Tools"}</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              <Box href={`/${lang}/tools`} icon="🛠️" title={lang === "ar" ? "الأدوات الإسلامية" : "Islamic Tools"} desc={lang === "ar" ? "مصحف + مواقيت + قبلة + تقويم" : "Quran + Times + Qibla + Calendar"} badge="" delay={next()} />
              <Box href={`/${lang}/adhkar`} icon="🤲" title={tr.boxAdhkarTitle} desc={tr.boxAdhkarDesc} badge={tr.yourDailyWird} delay={next()} />
              <Box href={`/${lang}/learn`} icon="🎓" title={tr.learn} desc={tr.learnDesc} badge={`${c.learnSteps.length}`} delay={next()} />
              <Box href={`/${lang}/search`} icon="🔍" title={tr.search} desc={tr.searchDesc} badge="" delay={next()} />
              <Box href={`/${lang}/quran`} icon="📖" title={lang === "ar" ? "المصحف الكريم" : "Holy Quran"} desc={lang === "ar" ? "اقرأ القرآن كاملاً" : "Read the complete Quran"} badge="" delay={next()} />
              <Box href={`/${lang}/prayer-times`} icon="🕌" title={lang === "ar" ? "مواقيت الصلاة" : "Prayer Times"} desc={lang === "ar" ? "لكل دول العالم" : "For all countries"} badge="" delay={next()} />
              <Box href={`/${lang}/qibla`} icon="🧭" title={lang === "ar" ? "تحديد القبلة" : "Qibla Direction"} desc={lang === "ar" ? "من أي مكان" : "From anywhere"} badge="" delay={next()} />
              <Box href={`/${lang}/zakat`} icon="🧮" title={lang === "ar" ? "حاسبة الزكاة" : "Zakat Calculator"} desc={lang === "ar" ? "احسب زكاتك" : "Calculate your zakat"} badge="" delay={next()} />
            </div>

            {/* ⚙️ الخدمات */}
            <SectionTitle>⚙️ {tr.services}</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              <Box href={`/${lang}/account`} icon="👤" title={tr.account} desc={lang === "ar" ? "اسأل الشيخ خصوصيًا" : "Ask the Sheikh privately"} badge="" delay={next()} />
              <Box href={`/${lang}/about`} icon="👤" title={tr.boxAboutTitle} desc={tr.boxAboutDesc} badge={tr.knowMe} delay={next()} />
              <Box href={`/${lang}/contact`} icon="💬" title={tr.boxContactTitle} desc={tr.boxContactDesc} badge={tr.messageMe} delay={next()} />
            </div>

          </div>
        </section>

        {/* 📧 النشرة البريدية */}
        <section className="py-14 bg-cream-dark dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4">
            <Newsletter />
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}