// app/[lang]/dawah/page.tsx
// بوابة غير المسلمين — تعريف بالإسلام ورد على الأسئلة الشائعة
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero, renderDesignIcon } from "@/components/ui";

export const dynamic = "force-static";

const COPY: Record<string, {
  title: string;
  subtitle: string;
  introTitle: string;
  intro: string;
  sections: Array<{ id: string; icon: string; title: string; desc: string; href: string }>;
  faq: Array<{ q: string; a: string }>;
}> = {
  ar: {
    title: "بوابة غير المسلمين — تعريف بالإسلام",
    subtitle: "عرِض الإسلام بصورته الصحيحة، بعيدًا عن التشويه والمفاهيم المغلوطة.",
    introTitle: "ما هو الإسلام؟",
    intro: "الإسلام دين الله الذي ارتضاه للبشرية، يدعو إلى توحيد الله وعبادته وحده، وتكريم الأنبياء والرسل، وتحقيق العدالة والمساواة بين الناس.",
    sections: [
      { id: "intro", icon: "🕌", title: "تعريف بالإسلام", desc: "مقدمة مبسطة عن دين الإسلام، أركانه، ومبادئه الأساسية.", href: "/ar/dawah/what-is-islam" },
      { id: "prophet", icon: "🌙", title: "من هو النبي محمد ﷺ؟", desc: "حياة الرسول الكريم، خلقه، رسالته، وأثره في التاريخ.", href: "/ar/dawah/who-is-muhammad" },
      { id: "quran", icon: "📖", title: "القرآن الكريم", desc: "ما هو القرآن، وكيف يُقرأ ويُفهم ويُراجع.", href: "/ar/dawah/quran-intro" },
      { id: "daily", icon: "🕌", title: "كيف يعيش المسلم يومه؟", desc: "الصلاة والذكر والعمل والأخلاق في الحياة اليومية.", href: "/ar/dawah/muslim-day" },
      { id: "women", icon: "👩", title: "المرأة في الإسلام", desc: "مكانة المرأة وحقوقها مع عرض منصف ومتزن.", href: "/ar/dawah/women-in-islam" },
      { id: "jihad", icon: "🛡️", title: "الإسلام والعنف والجهاد", desc: "تفريق واضح بين الجهاد المشروع والعنف ضد الأبرياء.", href: "/ar/dawah/jihad-and-violence" },
      { id: "jesus", icon: "✝️", title: "المسيح في الإسلام", desc: "مكانة عيسى عليه السلام والحوار باحترام.", href: "/ar/dawah/jesus-in-islam" },
      { id: "suffering", icon: "🌿", title: "الله والمعاناة والشر", desc: "مدخل متواضع لسؤال الألم والمعنى والرجاء.", href: "/ar/dawah/suffering-and-evil" },
      { id: "reason", icon: "🔬", title: "الإسلام والعقل والعلم", desc: "كيف نميز بين الوحي والتفسير والمعرفة التجريبية.", href: "/ar/dawah/reason-and-science" },
      { id: "death", icon: "🌙", title: "الموت وغاية الحياة", desc: "الغاية والمسؤولية والآخرة في التصور الإسلامي.", href: "/ar/dawah/death-and-purpose" },
      { id: "convert", icon: "🤲", title: "كيف أعتنق الإسلام؟", desc: "خطوات مبسطة وآمنة بعد الشهادتين.", href: "/ar/embrace-islam" },
      { id: "ask", icon: "💬", title: "اسأل مسلمًا", desc: "أرسل سؤالك العام دون ضغط أو تتبع غير ضروري.", href: "/ar/dawah/ask-muslim" },
    ],
    faq: [
      { q: "هل الإسلام عنيف؟", a: "الإسلام دين سلام ورحمة، والله تعالى يقول: «لَا إِكْرَاهَ فِي الدِّينِ». القتال في الإسلام للدفاع وليس للاعتداء." },
      { q: "لماذا ترتدي المرأة الحجاب؟", a: "الحجاب جزء من الحياء والستر في الإسلام، وتكريم للمرأة وصون لكرامتها." },
      { q: "ما هو الجهاد في الإسلام؟", a: "الجهاد في الإسلام هو بذل الجهد في طريق الله، وأهم أشكاله جهاد النفس والتعليم والدعوة بالحكمة." },
      { q: "كيف اعتنق الإسلام؟", a: "بالنطق بالشهادتين: «أشهد أن لا إله إلا الله وأشهد أن محمدًا رسول الله»، والإيمان بما جاء به النبي ﷺ." },
    ],
  },
  en: {
    title: "Dawah to Non-Muslims",
    subtitle: "Present Islam in its true form, away from distortion and misconceptions.",
    introTitle: "What is Islam?",
    intro: "Islam is the religion of God that He has chosen for humanity, calling to the oneness of God and worshipping Him alone, respecting the prophets and messengers, and achieving justice and equality among people.",
    sections: [
      { id: "intro", icon: "🕌", title: "Introduction to Islam", desc: "A simple introduction to monotheism, prophethood, worship, and character.", href: "/en/dawah/what-is-islam" },
      { id: "prophet", icon: "🌙", title: "Who Was Prophet Muhammad ﷺ?", desc: "His message, character, and a careful way to read his biography.", href: "/en/dawah/who-is-muhammad" },
      { id: "quran", icon: "📖", title: "The Quran: An Introduction", desc: "What the Quran is and how readers can approach it responsibly.", href: "/en/dawah/quran-intro" },
      { id: "daily", icon: "🕌", title: "How Does a Muslim Live?", desc: "Prayer, remembrance, work, character, and daily relationships.", href: "/en/dawah/muslim-day" },
      { id: "women", icon: "👩", title: "Women in Islam", desc: "A fair overview of dignity, rights, and diversity of experience.", href: "/en/dawah/women-in-islam" },
      { id: "jihad", icon: "🛡️", title: "Islam, Violence, and Jihad", desc: "A clear distinction between lawful striving and violence against civilians.", href: "/en/dawah/jihad-and-violence" },
      { id: "jesus", icon: "✝️", title: "Jesus in Islam", desc: "Jesus in Islam and respectful comparison in dialogue.", href: "/en/dawah/jesus-in-islam" },
      { id: "suffering", icon: "🌿", title: "God, Suffering, and Evil", desc: "A humble introduction to pain, meaning, justice, and hope.", href: "/en/dawah/suffering-and-evil" },
      { id: "reason", icon: "🔬", title: "Islam, Reason, and Science", desc: "Distinguishing revelation, interpretation, and empirical knowledge.", href: "/en/dawah/reason-and-science" },
      { id: "death", icon: "🌙", title: "Death and the Purpose of Life", desc: "Purpose, responsibility, death, and the Hereafter.", href: "/en/dawah/death-and-purpose" },
      { id: "convert", icon: "🤲", title: "How Do I Embrace Islam?", desc: "Simple and safe steps after the two testimonies.", href: "/en/embrace-islam" },
      { id: "ask", icon: "💬", title: "Ask a Muslim", desc: "Send a general question without pressure or unnecessary tracking.", href: "/en/dawah/ask-muslim" },
    ],
    faq: [
      { q: "Is Islam violent?", a: "Islam is a religion of peace and mercy, and God says: «There is no compulsion in religion». Fighting in Islam is for defense only, not for aggression." },
      { q: "Why do women wear hijab?", a: "Hijab is part of modesty and covering in Islam, and an honor for women and protection of their dignity." },
      { q: "What is jihad in Islam?", a: "Jihad in Islam is striving in the way of God, and its most important forms are Jihad of the self, education, and calling with wisdom." },
      { q: "How to embrace Islam?", a: "By pronouncing the two testimonies of faith: «I bear witness that there is no god but God and I bear witness that Muhammad is the Messenger of God», and believing in what the Prophet ﷺ brought." },
    ],
  },
};

export default async function DawahPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  const L = lang as Lang;
  const c = COPY[L];

  return (
    <>
      <Header lang={L} />
      <main id="main-content" tabIndex={-1} dir={L === "ar" ? "rtl" : "ltr"} className="site-page-shell">
        <PageHero
          icon="◈"
          badge={L === "ar" ? "بوابة غير المسلمين" : "Non-Muslim Portal"}
          title={c.title}
          subtitle={c.subtitle}
          crumbs={[
            { label: L === "ar" ? "الرئيسية" : "Home", href: `/${L}` },
            { label: c.title },
          ]}
        />

        <section className="section">
          <div className="container-page">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-primary-950 mb-3">{c.introTitle}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{c.intro}</p>
              <p className="mt-3 text-sm font-semibold text-primary-700 dark:text-primary-300">
                {L === "ar" ? `${c.sections.length} صفحة أساسية للبدء والبحث` : `${c.sections.length} essential pages for starting and exploring`}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {c.sections.map((s) => (
                <Link
                  key={s.id}
                  href={s.href}
                  className="card-interactive group p-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 text-xl group-hover:bg-primary-100 group-hover:text-primary-800 transition">
                    {renderDesignIcon(s.icon, 26)}
                  </span>
                  <h3 className="mt-4 font-bold text-primary-950">{s.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{s.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-gold-50/70 dark:bg-gold-950/10">
          <div className="container-page max-w-4xl">
            <h2 className="text-2xl font-black text-primary-950 text-center mb-10">{L === "ar" ? "أسئلة شائعة" : "Frequently Asked Questions"}</h2>
            <div className="space-y-3">
              {c.faq.map((item, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-black w-6 h-6">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-primary-900">{item.q}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isEnglish = lang === "en";

  return {
    title: isEnglish ? "Dawah to Non-Muslims" : "بوابة غير المسلمين",
    description: isEnglish
      ? "A clear introduction to Islam, answers to common questions, and a respectful path for learning."
      : "تعريف واضح بالإسلام، وإجابات عن الأسئلة الشائعة، ومسار محترم للتعلم.",
    alternates: {
      languages: {
        ar: "/ar/dawah",
        en: "/en/dawah",
      },
    },
  };
}

