import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";
import { IconCard, CardGrid, StatCard } from "@/components/Cards";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/JsonLd";
import Newsletter from "@/components/Newsletter";

// ===== أدوات سريعة =====
const QUICK_TOOLS = [
  { href: "/quran", icon: "📖", key: "nav.quran", color: "teal" as const },
  { href: "/adhkar", icon: "🤲", key: "nav.adhkar", color: "gold" as const },
  { href: "/prayer-times", icon: "🕐", key: "nav.prayer", color: "teal" as const },
  { href: "/qibla", icon: "🧭", key: "qibla.title", color: "gold" as const },
  { href: "/tasbih", icon: "📿", key: "tasbih.title", color: "teal" as const },
  { href: "/calendar", icon: "📅", key: "calendar.title", color: "gold" as const },
  { href: "/fatwa", icon: "⚖️", key: "nav.fatwa", color: "teal" as const },
  { href: "/ruqyah", icon: "🛡️", key: "ruqyah.title", color: "gold" as const },
];

// ===== قسم تعلّم =====
const LEARN_ITEMS = [
  { href: "/prayer-guide", icon: "🕌", key: "prayerGuide.title" },
  { href: "/hajj-guide", icon: "🕋", key: "hajjGuide.title" },
  { href: "/zakat", icon: "💰", key: "zakat.title" },
  { href: "/inheritance", icon: "📜", key: "inheritance.title" },
  { href: "/prophets-stories", icon: "📚", key: "prophets.title" },
  { href: "/quran-memorization", icon: "🎯", key: "memorization.title" },
];

// ===== قسم العلوم والردود =====
const RESPONSE_ITEMS = [
  { href: "/atheism-response", icon: "🧠", key: "atheism.title" },
  { href: "/doubts", icon: "❓", key: "doubts.title" },
  { href: "/youth-issues", icon: "👥", key: "youth.title" },
  { href: "/women-fatwas", icon: "🧕", key: "womenFatwas.title" },
  { href: "/embrace-islam", icon: "🌱", key: "embraceIslam.title" },
  { href: "/fatwa", icon: "⚖️", key: "nav.fatwa" },
];

// ===== قسم الدعوة =====
const DAWAH_ITEMS = [
  { href: "/dawah-guide", icon: "📢", key: "dawahGuide.title" },
  { href: "/fields", icon: "🗺️", key: "fields.title" },
  { href: "/projects", icon: "🏗️", key: "projects.title" },
  { href: "/khutab", icon: "🎤", key: "khutab.title" },
  { href: "/live", icon: "📺", key: "nav.live" },
  { href: "/khatm-dua", icon: "🤝", key: "khatmDua.title" },
];

// ===== مكوّن قسم =====
function Section({
  titleKey,
  subtitleKey,
  items,
  lang,
  gradient,
}: {
  titleKey: string;
  subtitleKey: string;
  items: typeof LEARN_ITEMS;
  lang: Lang;
  gradient: "teal" | "gold";
}) {
  return (
    <section className="container-page py-16 md:py-20">
      <div className="mb-10 text-center">
        <h2 className="section-title mb-0">{t(lang, titleKey)}</h2>
        <div className="islamic-divider my-0">
          <span className="text-xl text-gold-500">✦</span>
        </div>
        <p className="section-subtitle max-w-2xl mx-auto">
          {t(lang, subtitleKey)}
        </p>
      </div>

      <CardGrid columns={3}>
        {items.map((item) => (
          <IconCard
            key={item.href}
            icon={item.icon}
            title={t(lang, item.key)}
            href={`/${lang}${item.href}`}
            color={gradient}
          />
        ))}
      </CardGrid>
    </section>
  );
}

// ===== الصفحة الرئيسية =====
export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = (lang === "en" ? "en" : "ar") as Lang;
  const isRTL = l === "ar";

  return (
    <main>
      {/* ===== JSON-LD للسيو ===== */}
      <OrganizationJsonLd />
      <WebSiteJsonLd lang={l} />

      {/* ============ Hero Section ============ */}
      <section className="gradient-hero relative overflow-hidden py-20 text-white md:py-28">
        {/* زخرفة خلفية */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 70%, #d4af37 1.5px, transparent 1.5px)",
            backgroundSize: "60px 60px, 90px 90px",
          }}
        />

        {/* دوائر متوهجة */}
        <div className="absolute -top-24 -end-24 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -start-20 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl" />

        <div className="container-page relative text-center">
          {/* الشارة */}
          <span className="badge mb-6 border border-white/25 bg-white/15 !text-white backdrop-blur-sm animate-fade-in">
            ✨ {t(l, "home.hero.badge")}
          </span>

          {/* العنوان */}
          <h1
            className="mb-6 text-4xl font-black leading-tight md:text-6xl animate-slide-up"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {t(l, "home.hero.title")}
          </h1>

          {/* الوصف */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-primary-50 animate-slide-up">
            {t(l, "home.hero.subtitle")}
          </p>

          {/* أزرار CTA */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up">
            <Link href={`/${l}/learn`} className="btn-gold text-base">
              {t(l, "home.hero.cta1")}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={isRTL ? "rotate-180" : ""}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href={`/${l}/live`}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 px-7 py-3.5 text-base font-bold text-white transition-all duration-300 hover:bg-white/10"
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              {t(l, "home.hero.cta2")}
            </Link>
          </div>

          {/* إحصائيات */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard value="35+" label={t(l, "home.stats.sections")} color="gold" className="!bg-white/10 !border-white/20 backdrop-blur-sm" />
            <StatCard value="2" label={t(l, "home.stats.languages")} color="gold" className="!bg-white/10 !border-white/20 backdrop-blur-sm" />
            <StatCard value="114" label={isRTL ? "سورة" : "Surahs"} color="gold" className="!bg-white/10 !border-white/20 backdrop-blur-sm" />
            <StatCard value="100%" label={t(l, "home.stats.free")} color="gold" className="!bg-white/10 !border-white/20 backdrop-blur-sm" />
          </div>
        </div>

        {/* موجة سفلية */}
        <div className="relative mt-16">
          <svg viewBox="0 0 1440 80" fill="none" className="block w-full">
            <path
              d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              className="fill-slate-50 dark:fill-night-900"
            />
          </svg>
        </div>
      </section>

      {/* ============ الأدوات السريعة ============ */}
      <section className="container-page -mt-8 relative z-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {QUICK_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={`/${l}${tool.href}`}
              className="card card-interactive flex flex-col items-center gap-2 p-4 text-center"
            >
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                {tool.icon}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {t(l, tool.key)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ قسم تعلّم ============ */}
      <Section
        titleKey="home.learn.title"
        subtitleKey="home.learn.subtitle"
        items={LEARN_ITEMS}
        lang={l}
        gradient="teal"
      />

      {/* ============ قسم العلوم والردود ============ */}
      <section className="bg-primary-50/50 py-16 dark:bg-night-800/30 md:py-20">
        <Section
          titleKey="home.responses.title"
          subtitleKey="home.responses.subtitle"
          items={RESPONSE_ITEMS}
          lang={l}
          gradient="gold"
        />
      </section>

      {/* ============ آية اليوم ============ */}
      <section className="container-page py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="card relative overflow-hidden p-10 text-center md:p-14">
            <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />
            <div className="mb-6 text-4xl text-gold-500">﴿</div>
            <p className="quran-text mb-6">{t(l, "home.verse.text")}</p>
            <div className="text-4xl text-gold-500">﴾</div>
            <p className="mt-4 text-sm font-semibold text-primary-600 dark:text-primary-400">
              {t(l, "home.verse.ref")}
            </p>
          </div>
        </div>
      </section>

      {/* ============ قسم الدعوة ============ */}
      <Section
        titleKey="home.dawah.title"
        subtitleKey="home.dawah.subtitle"
        items={DAWAH_ITEMS}
        lang={l}
        gradient="teal"
      />

      {/* ============ النشرة البريدية ============ */}
      <section className="container-page pb-16 md:pb-20">
        <Newsletter lang={l} />
      </section>

      {/* ============ CTA النهائي ============ */}
      <section className="gradient-hero relative overflow-hidden py-16 text-white md:py-20">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 20%, #fff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="container-page relative text-center">
          <h2
            className="mb-4 text-3xl font-black md:text-4xl"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {isRTL ? "ابدأ رحلتك الإيمانية اليوم" : "Start Your Faith Journey Today"}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-100">
            {isRTL
              ? "انضم إلى آلاف المسلمين الذين يستخدمون المنصة يومياً"
              : "Join thousands of Muslims using the platform daily"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href={`/${l}/register`} className="btn-gold text-base">
              {t(l, "nav.register")}
            </Link>
            <Link
              href={`/${l}/about`}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 px-7 py-3.5 text-base font-bold text-white transition-all duration-300 hover:bg-white/10"
            >
              {t(l, "footer.about")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}