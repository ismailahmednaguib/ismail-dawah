// app/[lang]/responses/page.tsx
// مركز الردود على الشبهات والتيارات
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-static";

const COPY: Record<string, {
  title: string;
  subtitle: string;
  intro: string;
  categories: Array<{ id: string; icon: string; title: string; desc: string; count: string; href: string }>;
  featured: Array<{ id: string; question: string; answer: string; source: string }>;
}> = {
  ar: {
    title: "مركز الردود على الشبهات",
    subtitle: "الرد على الشبهات المثارة حول الإسلام بالاستدلال من الكتاب والسنة، ومنطق السلف الصالح.",
    intro: "يُخصص هذا القسم للرد على الشبهات التي تُثار حول الدين الإسلامي، سواء من داخل المجتمع الإسلامي أو من خارجه، مع توثيق كل رد بالمراجع العلمية المعتمدة.",
    categories: [
      { id: "quran", icon: "📖", title: "الشبهات حول القرآن", desc: "الرد على ما يُثار حول القرآن الكريم من تأويلات وشبهات.", count: "12 رد", href: "/ar/doubts" },
      { id: "hadith", icon: "💬", title: "الشبهات حول السنة", desc: "الرد على الشبهات المتعلقة بالحديث الشريف وسنة النبي ﷺ.", count: "8 رد", href: "/ar/doubts" },
      { id: "aqeedah", icon: "🕌", title: "الشبهات حول العقيدة", desc: "الرد على الشبهات المتعلقة بالتوحيد، والأسماء والصفات، والقدر.", count: "10 رد", href: "/ar/doubts" },
      { id: "women", icon: "👩", title: "الشبهات حول المرأة", desc: "الرد على ما يُثار حول مكانة المرأة وحقوقها في الإسلام.", count: "7 رد", href: "/ar/women-fatwas" },
      { id: "jihad", icon: "🛡️", title: "الشبهات حول الجهاد", desc: "الرد على الشبهات المتعلقة بالجهاد والقتال والحرب والسلم.", count: "9 رد", href: "/ar/doubts" },
      { id: "science", icon: "🔬", title: "الشبهات حول العلم والدين", desc: "الرد على الادعاءات بعدم توافق العلم مع الدين.", count: "6 رد", href: "/ar/doubts" },
    ],
    featured: [
      {
        id: "1",
        question: "لماذا خلقنا الله إذا كان يعلم من سيطيعه ومن سيعصيه؟",
        answer: "علم الله السابق لا يُبطل الاختيار، فالله يعلم لكن العبد يختار ويحاسب على اختياره. العلم السابق ليس إجبارًا على الفعل.",
        source: "علماء أهل السنة والجماعة",
      },
      {
        id: "2",
        question: "لماذا يُسمح بتعدد الزوجات في الإسلام؟",
        answer: "تعدد الزوجات في الإسلام مقيد بشروط صارمة أبرزها العدل بين الزوجات، وهو 윤ن慈慈 (رحمة) لا إكراه.",
        source: "فقه الأسرة في الإسلام",
      },
    ],
  },
  en: {
    title: "Center for Responses to Doubts",
    subtitle: "Responding to doubts raised about Islam with evidence from the Quran and Sunnah, following the methodology of the righteous predecessors.",
    intro: "This section is dedicated to responding to doubts raised about the Islamic religion, whether from within the Muslim community or from outside it, with each response documented using accepted scholarly references.",
    categories: [
      { id: "quran", icon: "📖", title: "Doubts About the Quran", desc: "Responding to allegations and doubts raised about the Holy Quran.", count: "12 responses", href: "/en/doubts" },
      { id: "hadith", icon: "💬", title: "Doubts About the Sunnah", desc: "Responding to doubts related to the Holy Hadith and the Sunnah of the Prophet ﷺ.", count: "8 responses", href: "/en/doubts" },
      { id: "aqeedah", icon: "🕌", title: "Doubts About Creed", desc: "Responding to doubts related to monotheism, the names and attributes of Allah, and predestination.", count: "10 responses", href: "/en/doubts" },
      { id: "women", icon: "👩", title: "Doubts About Women", desc: "Responding to allegations about the status and rights of women in Islam.", count: "7 responses", href: "/en/women-fatwas" },
      { id: "jihad", icon: "🛡️", title: "Doubts About Jihad", desc: "Responding to doubts related to jihad, fighting, war and peace.", count: "9 responses", href: "/en/doubts" },
      { id: "science", icon: "🔬", title: "Doubts About Science and Religion", desc: "Responding to claims of incompatibility between science and religion.", count: "6 responses", href: "/en/doubts" },
    ],
    featured: [
      {
        id: "1",
        question: "Why did God create us if He knows who will obey and who will disobey?",
        answer: "God's prior knowledge does not negate free will. God knows, but the servant chooses and is held accountable for their choice. Prior knowledge is not compulsion.",
        source: "Scholars of Ahl al-Sunnah wal-Jama'ah",
      },
      {
        id: "2",
        question: "Why is polygamy allowed in Islam?",
        answer: "Polygamy in Islam is restricted by strict conditions, the most prominent being justice between wives. It is a mercy, not compulsion.",
        source: "Islamic Family Law",
      },
    ],
  },
};

export default async function ResponsesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  const L = lang as Lang;
  const c = COPY[L];

  return (
    <>
      <Header lang={L} />
      <main dir={L === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <section className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 px-4 py-16 text-white">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-bold mb-6">
              🛡️
            </div>
            <h1 className="text-3xl font-black md:text-5xl mb-4">{c.title}</h1>
            <p className="mx-auto mt-2 max-w-2xl text-primary-100 text-lg">{c.subtitle}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-primary-950 mb-3">نبذة عن المركز</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{c.intro}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {c.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="group rounded-2xl border border-cream-200 bg-white p-5 shadow-sm hover:border-primary-300 hover:shadow-card transition"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 text-xl group-hover:bg-primary-100 group-hover:text-primary-800 transition">
                    {cat.icon}
                  </span>
                  <h3 className="mt-4 font-bold text-primary-950">{cat.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{cat.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-primary-700 bg-primary-50 px-2 py-1 rounded">
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gold-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-black text-primary-950 text-center mb-10">الردود المميزة</h2>
            <div className="space-y-4">
              {c.featured.map((item) => (
                <div key={item.id} className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-black w-6 h-6">
                      ❓
                    </span>
                    <p className="font-bold text-primary-900">{item.question}</p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{item.answer}</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-primary-700 border-t border-cream-100 pt-3">
                    <span>المصدر:</span>
                    <span className="italic">{item.source}</span>
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

export const metadata: Metadata = {
  title: "مركز الردود على الشبهات | إسماعيل أحمد نجيب",
  description: "الرد على الشبهات المثارة حول الإسلام بالاستدلال من الكتاب والسنة.",
};

