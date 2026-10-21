// app/[lang]/dawah/page.tsx
// بوابة غير المسلمين — تعريف بالإسلام ورد على الأسئلة الشائعة
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/ui";

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
      { id: "intro", icon: "🕌", title: "تعريف بالإسلام", desc: "مقدمة مبسطة عن دين الإسلام، أركانه، ومبادئه الأساسية.", href: "/ar/dawah-guide" },
      { id: "prophet", icon: "🌙", title: "من هو النبي محمد ﷺ؟", desc: "حياة الرسول الكريم، خلقه، رسالته، وأثره في التاريخ.", href: "/ar/prophets-stories" },
      { id: "quran", icon: "📖", title: "القرآن الكريم", desc: "كتاب الله المنزل، معجزة محمد ﷺ المستمرة إلى يوم القيامة.", href: "/ar/quran" },
      { id: "women", icon: "👩", title: "المرأة في الإسلام", desc: "مكانة المرأة، حقوقها، وواجباتها في ظل الشريعة الإسلامية.", href: "/ar/women-fatwas" },
      { id: "jesus", icon: "✝️", title: "المسيح في الإسلام والمسيحية", desc: "مقارنة بين مكانة عيسى عليه السلام في الإسلام والمسيحية.", href: "/ar/atheism-response" },
      { id: "convert", icon: "🤲", title: "دليل اعتناق الإسلام", desc: "خطوات مبسطة للراغبين في اعتناق الإسلام، وكيفية النطق بالشهادتين.", href: "/ar/embrace-islam" },
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
      { id: "intro", icon: "🕌", title: "Introduction to Islam", desc: "A simple introduction to the religion of Islam, its pillars, and basic principles.", href: "/en/dawah-guide" },
      { id: "prophet", icon: "🌙", title: "Who is Prophet Muhammad ﷺ?", desc: "The life of the noble Messenger, his character, his message, and his impact on history.", href: "/en/prophets-stories" },
      { id: "quran", icon: "📖", title: "The Holy Quran", desc: "The Book of God revealed, the enduring miracle of Muhammad ﷺ until the Day of Judgment.", href: "/en/quran" },
      { id: "women", icon: "👩", title: "Women in Islam", desc: "The status of women, their rights, and their duties under Islamic law.", href: "/en/women-fatwas" },
      { id: "jesus", icon: "✝️", title: "Jesus in Islam and Christianity", desc: "A comparison of the status of Jesus (peace be upon him) in Islam and Christianity.", href: "/en/atheism-response" },
      { id: "convert", icon: "🤲", title: "Guide to Embracing Islam", desc: "Simple steps for those wishing to embrace Islam, and how to pronounce the two testimonies of faith.", href: "/en/embrace-islam" },
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
      <main id="main-content" tabIndex={-1} dir={L === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
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

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-primary-950 mb-3">{c.introTitle}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{c.intro}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {c.sections.map((s) => (
                <Link
                  key={s.id}
                  href={s.href}
                  className="group rounded-2xl border border-cream-200 bg-white p-5 shadow-sm hover:border-primary-300 hover:shadow-card transition"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 text-xl group-hover:bg-primary-100 group-hover:text-primary-800 transition">
                    {s.icon}
                  </span>
                  <h3 className="mt-4 font-bold text-primary-950">{s.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{s.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gold-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-black text-primary-950 text-center mb-10">{L === "ar" ? "أسئلة شائعة" : "Frequently Asked Questions"}</h2>
            <div className="space-y-3">
              {c.faq.map((item, i) => (
                <div key={i} className="rounded-2xl border border-cream-200 bg-white p-4 shadow-sm">
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

