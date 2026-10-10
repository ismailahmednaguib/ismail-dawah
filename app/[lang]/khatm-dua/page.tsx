// app/[lang]/khatm-dua/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-static";

type Localized = {
  ar: string;
  en: string;
};

type KhatmStep = {
  id: string;
  icon: string;
  title: Localized;
  description: Localized;
  points: Localized[];
};

type DuaItem = {
  id: string;
  title: Localized;
  arabic: string;
  translation: string;
  benefit: Localized;
};

type ScheduleItem = {
  id: string;
  day: Localized;
  focus: Localized;
  count: Localized;
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  stepsTitle: string;
  stepsDesc: string;
  scheduleTitle: string;
  scheduleDesc: string;
  duasTitle: string;
  duasDesc: string;
  adabTitle: string;
  adab1: string;
  adab2: string;
  adab3: string;
  adab4: string;
  adab5: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
  contact: string;
  adhkar: string;
  dailyWird: string;
  quran: string;
  start: string;
  verse: string;
  verseSource: string;
  stepsCount: string;
  daysCount: string;
  duasCount: string;
  adabCount: string;
  relatedTitle: string;
  prayerTimesPage: string;
  prayerTimesPageDesc: string;
  ruqyahPage: string;
  ruqyahPageDesc: string;
  fatwaPage: string;
  fatwaPageDesc: string;
  quranPage: string;
  quranPageDesc: string;
  introTitle: string;
  introDesc: string;
};

const UI: Record<Lang, UILang> = {
  ar: {
    title: "ختم الدعاء",
    subtitle: "برنامج جماعي للفقر إلى الله ورفع الحوائج",
    home: "الرئيسية",
    description:
      "ختم الدعاء هو اجتماع قلوب المؤمنين على الطلب من الله في وقت واحد، مع أذكار وأدعية مأثورة، بهدف تفريج الكرب، وقضاء الحاجات، والتوبة، والرقية، والاستغفار.",
    stepsTitle: "كيف تُقام ختمة الدعاء؟",
    stepsDesc:
      "يُستحب أن تكون برفق وخشوع، لا بتكلف أو ضجيج، مع مراعاة آداب الدعاء.",
    scheduleTitle: "جدول مقترح",
    scheduleDesc:
      "يمكن فردها على أسبوع، أو جعلها في ليلة واحدة حسب القدرة.",
    duasTitle: "أدعية مختارة",
    duasDesc: "أدعية جامعة يمكن تكرارها في الختمة.",
    adabTitle: "آداب الدعاء",
    adab1: "الإخلاص وحضور القلب.",
    adab2: "بدء الدعاء بالحمد والصلاة على النبي.",
    adab3: "التوسل بأسماء الله الحسنى وصفاته.",
    adab4: "اليقين بالإجابة وعدم الاستعجال.",
    adab5: "الدعاء للإخوان والمسلمين بظهر الغيب.",
    noteTitle: "تنبيه",
    note1:
      "ختم الدعاء ليس بدعةً إذا كان بمعنى الاجتماع على الدعاء المشروع، لكن يجب تجنب الصيغ المخالفة للسنة.",
    note2:
      "لا تُجعل الختمة سببًا للغلو أو الوعود الكاذبة بأن الدعاء سيُستجاب بشكل حتمي لكل طالب.",
    note3:
      "الأصل أن يُدعى الله بأدعية صحيحة، ويُترك ما فيه كذب أو غلو أو استهانة بالقدر.",
    contact: "تواصل معنا",
    adhkar: "الأذكار",
    dailyWird: "الورد اليومي",
    quran: "القرآن",
    start: "ابدأ الختمة",
    verse: "﴿ وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ ﴾",
    verseSource: "سورة غافر — الآية 60",
    stepsCount: "خطوات",
    daysCount: "أيام",
    duasCount: "أدعية",
    adabCount: "آداب",
    relatedTitle: "صفحات ذات صلة",
    prayerTimesPage: "مواقيت الصلاة",
    prayerTimesPageDesc: "تعرف على أوقات الصلاة.",
    ruqyahPage: "الرقية الشرعية",
    ruqyahPageDesc: "آيات وأدعية للرقية.",
    fatwaPage: "الفتاوى",
    fatwaPageDesc: "أسئلة فقهية عن الدعاء.",
    quranPage: "القرآن الكريم",
    quranPageDesc: "اقرأ واستمع إلى كتاب الله.",
    introTitle: "ما هو ختم الدعاء؟",
    introDesc:
      "ختم الدعاء هو برنامج روحاني يجمع المؤمنين على الدعاء والتضرع إلى الله في فترة زمنية محددة، سواء كانت ليلة واحدة أو أسبوعًا كاملاً. يهدف إلى توحيد القلوب على الفقر إلى الله، ورفع الحاجات، والتوبة، والاستغفار. وهو سنة حسنة إذا التزم بآداب الدعاء الشرعية.",
  },
  en: {
    title: "Khatm Dua",
    subtitle: "A collective program of humility and supplication to Allah",
    home: "Home",
    description:
      "Khatm dua is the gathering of believers' hearts upon asking Allah together, with authentic adhkar and supplications, aiming to relieve distress, fulfill needs, repent, seek ruqyah, and ask forgiveness.",
    stepsTitle: "How to Conduct Khatm Dua?",
    stepsDesc:
      "It should be done gently and devoutly, without affectation or noise, observing the etiquette of du'a.",
    scheduleTitle: "Suggested Schedule",
    scheduleDesc:
      "It can be spread over a week or done in one night according to ability.",
    duasTitle: "Selected Supplications",
    duasDesc: "Comprehensive supplications that can be repeated in the khatm.",
    adabTitle: "Etiquette of Du'a",
    adab1: "Sincerity and presence of heart.",
    adab2: "Begin with praise of Allah and blessings upon the Prophet.",
    adab3: "Call upon Allah by His beautiful names and attributes.",
    adab4: "Be certain of answer and do not be hasty.",
    adab5: "Supplicate for brothers and Muslims in absence.",
    noteTitle: "Notice",
    note1:
      "Khatm dua is not an innovation if it means gathering for lawful supplication, but formulas contrary to the Sunnah must be avoided.",
    note2:
      "Do not make the khatm a cause of extremism or false promises that every request will certainly be answered.",
    note3:
      "The principle is to supplicate with authentic du'as and avoid lies, extremism, or contempt of divine decree.",
    contact: "Contact Us",
    adhkar: "Adhkar",
    dailyWird: "Daily Wird",
    quran: "Quran",
    start: "Start Khatm",
    verse: "\"And your Lord says, 'Call upon Me; I will respond to you.'\"",
    verseSource: "Surah Ghafir — Verse 60",
    stepsCount: "Steps",
    daysCount: "Days",
    duasCount: "Duas",
    adabCount: "Etiquettes",
    relatedTitle: "Related Pages",
    prayerTimesPage: "Prayer Times",
    prayerTimesPageDesc: "Know your prayer times.",
    ruqyahPage: "Ruqyah",
    ruqyahPageDesc: "Verses and supplications for ruqyah.",
    fatwaPage: "Fatwas",
    fatwaPageDesc: "Fiqh questions about du'a.",
    quranPage: "Holy Quran",
    quranPageDesc: "Read and listen to the Book of Allah.",
    introTitle: "What is Khatm Dua?",
    introDesc:
      "Khatm dua is a spiritual program that brings believers together in supplication and humility to Allah over a specific period, whether one night or a full week. It aims to unite hearts in poverty to Allah, raising needs, repentance, and seeking forgiveness. It is a good practice when it follows the proper etiquettes of du'a.",
  },
};

const STEPS: KhatmStep[] = [
  {
    id: "intention",
    icon: "❤️",
    title: {
      ar: "1. النية الصادقة",
      en: "1. Sincere Intention",
    },
    description: {
      ar: "اجعل النية خالصة لله، لا للرياء أو الظهور الاجتماعي. اطلب من الله الفقر إليه وحضور القلب.",
      en: "Make the intention purely for Allah, not for ostentation or social display. Ask Allah for humility and presence of heart.",
    },
    points: [
      {
        ar: "توضأ واستقبل القبلة إن تيسر.",
        en: "Perform wudu and face qiblah if easy.",
      },
      {
        ar: "اختر وقتًا هادئًا، مثل بعد الفجر أو قبل النوم.",
        en: "Choose a quiet time, such as after Fajr or before sleep.",
      },
      {
        ar: "ادعُ بيقين أن الله يسمعك.",
        en: "Supplicate with certainty that Allah hears you.",
      },
    ],
  },
  {
    id: "opening",
    icon: "🌅",
    title: {
      ar: "2. الافتتاح بالحمد والصلاة",
      en: "2. Opening with Praise and Salawat",
    },
    description: {
      ar: "ابدأ بحمد الله والثناء عليه، ثم الصلاة على النبي صلى الله عليه وسلم، فإن ذلك من أسباب قبول الدعاء.",
      en: "Begin by praising Allah and thanking Him, then sending blessings upon the Prophet, for that is among the reasons for acceptance of du'a.",
    },
    points: [
      {
        ar: "قل: الحمد لله رب العالمين.",
        en: "Say: All praise is due to Allah, Lord of the worlds.",
      },
      {
        ar: "صلِّ على النبي: اللهم صل على محمد.",
        en: "Send blessings: O Allah, bless Muhammad.",
      },
      {
        ar: "اذكر أسماء الله الحسنى المناسبة لحاجتك.",
        en: "Mention Allah's beautiful names suitable for your need.",
      },
    ],
  },
  {
    id: "confession",
    icon: "🥺",
    title: {
      ar: "3. الاعتراف والتوبة",
      en: "3. Confession and Repentance",
    },
    description: {
      ar: "من آداب الدعاء أن يعترف العبد بذنبه ويسأل الله المغفرة، فإن التوبة من أسباب رفع البلاء.",
      en: "Among du'a etiquettes is that the servant confesses his sin and asks Allah's forgiveness, for repentance is among reasons for lifting calamity.",
    },
    points: [
      {
        ar: "قل: رب إني ظلمت نفسي.",
        en: "Say: My Lord, I have wronged myself.",
      },
      {
        ar: "استغفر الله ثلاثًا أو أكثر.",
        en: "Seek forgiveness from Allah three times or more.",
      },
      {
        ar: "اعزم على ترك المعصية إن كنت مقصرًا.",
        en: "Resolve to leave sin if you have been negligent.",
      },
    ],
  },
  {
    id: "asking",
    icon: "🤲",
    title: {
      ar: "4. سؤال الحوائج",
      en: "4. Asking for Needs",
    },
    description: {
      ar: "اذكر حاجتك بوضوح وخشوع: دينك، دنياك، أهلك، صحتك، همومك، والمسلمين.",
      en: "Mention your need clearly and devoutly: your religion, worldly life, family, health, worries, and Muslims.",
    },
    points: [
      {
        ar: "لا تستحي من سؤال الله صغيرًا وكبيرًا.",
        en: "Do not be shy from asking Allah for small and great things.",
      },
      {
        ar: "ادعُ لإخوانك بظهر الغيب.",
        en: "Supplicate for your brothers in absence.",
      },
      {
        ar: "الزم الأدب ولا تعترض على القدر.",
        en: "Maintain etiquette and do not object to decree.",
      },
    ],
  },
  {
    id: "closing",
    icon: "🌙",
    title: {
      ar: "5. الختام والرضا",
      en: "5. Closing and Contentment",
    },
    description: {
      ar: "اختم بالصلاة على النبي، والحمد لله، ثم ارضَ بقضاء الله، واعلم أن الإجابة قد تكون عاجلة أو مؤجلة أو بصرف شر.",
      en: "Close with blessings upon the Prophet and praise of Allah, then be content with Allah's decree, knowing the answer may be immediate, delayed, or a turning away of harm.",
    },
    points: [
      {
        ar: "لا تستعجل وتقول: دعوت فلم يُستجب لي.",
        en: "Do not be hasty and say: I supplicated but was not answered.",
      },
      {
        ar: "أحسن الظن بالله.",
        en: "Have good expectation of Allah.",
      },
      {
        ar: "واظب على الدعاء في الأوقات الفاضلة.",
        en: "Persist in du'a in virtuous times.",
      },
    ],
  },
];

const SCHEDULE: ScheduleItem[] = [
  {
    id: "saturday",
    day: { ar: "السبت", en: "Saturday" },
    focus: {
      ar: "التوبة والاستغفار",
      en: "Repentance and Istighfar",
    },
    count: {
      ar: "100 مرة: أستغفر الله",
      en: "100 times: I seek Allah's forgiveness",
    },
  },
  {
    id: "sunday",
    day: { ar: "الأحد", en: "Sunday" },
    focus: {
      ar: "الرزق والبركة",
      en: "Provision and Blessing",
    },
    count: {
      ar: "70 مرة: اللهم اكفني بحلالك",
      en: "70 times: O Allah, suffice me with Your lawful",
    },
  },
  {
    id: "monday",
    day: { ar: "الاثنين", en: "Monday" },
    focus: {
      ar: "الشفاء والعافية",
      en: "Healing and Wellness",
    },
    count: {
      ar: "70 مرة: اللهم رب الناس أذهب البأس",
      en: "70 times: O Allah, Lord of mankind, remove hardship",
    },
  },
  {
    id: "tuesday",
    day: { ar: "الثلاثاء", en: "Tuesday" },
    focus: {
      ar: "الهم والكرب",
      en: "Distress and Anxiety",
    },
    count: {
      ar: "100 مرة: لا إله إلا أنت سبحانك إني كنت من الظالمين",
      en: "100 times: There is no god but You, glory be to You, I was among the wrongdoers",
    },
  },
  {
    id: "wednesday",
    day: { ar: "الأربعاء", en: "Wednesday" },
    focus: {
      ar: "الذرية الصالحة",
      en: "Righteous Offspring",
    },
    count: {
      ar: "70 مرة: رب هب لي من لدنك ذرية طيبة",
      en: "70 times: My Lord, grant me from Yourself good offspring",
    },
  },
  {
    id: "thursday",
    day: { ar: "الخميس", en: "Thursday" },
    focus: {
      ar: "فرج الأمور",
      en: "Relief of Affairs",
    },
    count: {
      ar: "100 مرة: حسبنا الله ونعم الوكيل",
      en: "100 times: Allah is sufficient for us, and He is the best Disposer of affairs",
    },
  },
  {
    id: "friday",
    day: { ar: "الجمعة", en: "Friday" },
    focus: {
      ar: "الساعة المباركة",
      en: "The Blessed Hour",
    },
    count: {
      ar: "أكثر من الصلاة على النبي والدعاء",
      en: "Increase salawat and supplication",
    },
  },
];

const DUAS: DuaItem[] = [
  {
    id: "distress",
    title: {
      ar: "دعاء الكرب",
      en: "Supplication of Distress",
    },
    arabic:
      "لا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
    translation:
      "There is no god but Allah, the Great, the Forbearing. There is no god but Allah, Lord of the Mighty Throne. There is no god but Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.",
    benefit: {
      ar: "لرفع الهم والشدّة.",
      en: "For removing worry and hardship.",
    },
  },
  {
    id: "yunus",
    title: {
      ar: "دعاء ذي النون",
      en: "Dhul-Nun's Supplication",
    },
    arabic:
      "لا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    translation:
      "There is no god but You, glory be to You. Indeed, I was among the wrongdoers.",
    benefit: {
      ar: "من دعاء الله به في كرب إلا فرّج عنه.",
      en: "No one supplicates with it in distress except Allah relieves him.",
    },
  },
  {
    id: "provision",
    title: {
      ar: "دعاء الرزق",
      en: "Supplication for Provision",
    },
    arabic:
      "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    translation:
      "O Allah, suffice me with Your lawful against Your prohibited, and enrich me by Your bounty beyond all besides You.",
    benefit: {
      ar: "للغنى عمن سوا الله.",
      en: "For being independent of others besides Allah.",
    },
  },
  {
    id: "healing",
    title: {
      ar: "دعاء الشفاء",
      en: "Supplication for Healing",
    },
    arabic:
      "اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لا يُغَادِرُ سَقَمًا",
    translation:
      "O Allah, Lord of mankind, remove hardship. Heal, You are the Healer. There is no healing except Your healing, a healing that leaves no illness behind.",
    benefit: {
      ar: "للمريض والمبتلى.",
      en: "For the sick and afflicted.",
    },
  },
  {
    id: "guidance",
    title: {
      ar: "دعاء الثبات",
      en: "Supplication for Steadfastness",
    },
    arabic:
      "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    translation:
      "O Turner of hearts, keep my heart firm upon Your religion.",
    benefit: {
      ar: "للسلامة من الفتن والزيغ.",
      en: "For safety from trials and deviation.",
    },
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLang(lang)) return {};

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/khatm-dua`,
      languages: {
        ar: "/ar/khatm-dua",
        en: "/en/khatm-dua",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/khatm-dua`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "article",
      images: [
        {
          url: "/icons/icon-512.png",
          width: 512,
          height: 512,
          alt: ui.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.title,
      description: ui.description,
      images: ["/icons/icon-512.png"],
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export default async function KhatmDuaPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: ui.title,
        description: ui.description,
        inLanguage: l,
        url: `/${l}/khatm-dua`,
        articleSection: isRTL ? "العبادات" : "Worship",
        keywords: isRTL
          ? "ختم الدعاء, أدعية, الدعاء, التوبة, الاستغفار"
          : "khatm dua, supplications, du'a, repentance, istighfar",
      },
      {
        "@type": "HowTo",
        name: ui.stepsTitle,
        description: ui.stepsDesc,
        inLanguage: l,
        step: STEPS.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: isRTL ? step.title.ar : step.title.en,
          text: isRTL ? step.description.ar : step.description.en,
        })),
      },
    ],
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${l}` },
          { label: ui.title },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden border-2 border-gold-200 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 p-8 md:p-12 dark:border-gold-800 dark:from-primary-950/30 dark:via-gray-900 dark:to-gold-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #0e7490, #d4af37)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  <path d="M12 6c-1.66 0-3 1.34-3 3h2c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1H8v2h4c1.66 0 3-1.34 3-3S13.66 6 12 6z" fill="#d4af37" />
                </svg>
              </span>
            </div>

            <span className="badge-gold mb-5">
              🌙 {isRTL ? "برنامج دعوي" : "Dawah Program"}
            </span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.description}
            </p>

            {/* آية كريمة */}
            <div className="mt-8 rounded-2xl border border-gold-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
              <p
                className="mb-2 text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {ui.verse}
              </p>
              <p className="text-xs text-gold-600 dark:text-gold-400">
                {ui.verseSource}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href={`/${l}/adhkar`} className="btn-primary">
                {ui.start}
              </Link>

              <Link href={`/${l}/daily-wird`} className="btn-outline">
                {ui.dailyWird}
              </Link>
            </div>
          </div>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="📋" label={ui.stepsCount} value={STEPS.length} color="primary" />
          <StatCard icon="📅" label={ui.daysCount} value={SCHEDULE.length} color="gold" />
          <StatCard icon="🤲" label={ui.duasCount} value={DUAS.length} color="primary" />
          <StatCard icon="✨" label={ui.adabCount} value={5} color="gold" />
        </div>

        {/* ===== مقدمة ===== */}
        <div className="card mb-10 overflow-hidden">
          <div className="gradient-gold h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <h2
              className="mb-4 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              💡 {ui.introTitle}
            </h2>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.introDesc}
            </p>
          </div>
        </div>

        {/* ===== الخطوات ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.stepsTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.stepsDesc}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {STEPS.map((step) => (
              <article
                key={step.id}
                id={step.id}
                className="card relative scroll-mt-32 overflow-hidden p-6 md:p-7"
              >
                <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

                <div className="mb-5 flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                    {step.icon}
                  </span>

                  <div className="min-w-0">
                    <h3
                      className="text-xl font-black leading-relaxed text-slate-900 dark:text-white"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {isRTL ? step.title.ar : step.title.en}
                    </h3>

                    <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                      {isRTL ? step.description.ar : step.description.en}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {step.points.map((point, index) => (
                    <li
                      key={`${step.id}-point-${index}`}
                      className="flex items-start gap-3 leading-relaxed text-slate-600 dark:text-slate-300"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      <span>{isRTL ? point.ar : point.en}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        {/* ===== الجدول ===== */}
        <div id="schedule" className="mb-12 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.scheduleTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.scheduleDesc}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCHEDULE.map((item) => (
              <article
                key={item.id}
                className="card relative overflow-hidden p-5"
              >
                <div className="gradient-gold absolute inset-x-0 top-0 h-1" />

                <h3
                  className="mb-2 text-lg font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {isRTL ? item.day.ar : item.day.en}
                </h3>

                <p className="mb-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                  {isRTL ? item.focus.ar : item.focus.en}
                </p>

                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {isRTL ? item.count.ar : item.count.en}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* ===== الأدعية ===== */}
        <div id="duas" className="mb-12 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.duasTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.duasDesc}</p>
          </div>

          <div className="space-y-4">
            {DUAS.map((dua) => (
              <details key={dua.id} className="card group p-6 md:p-7">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-xl dark:bg-gold-900/40">
                      🤲
                    </span>

                    <h3
                      className="text-lg font-black leading-relaxed text-slate-900 md:text-xl dark:text-white"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {isRTL ? dua.title.ar : dua.title.en}
                    </h3>
                  </div>

                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-transform duration-300 group-open:rotate-45 dark:bg-primary-900/40 dark:text-primary-300">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                </summary>

                <div className="mt-5 border-t border-slate-100 pt-5 dark:border-night-700">
                  <p
                    className="mb-4 text-xl leading-loose text-slate-900 dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                    dir="rtl"
                  >
                    {dua.arabic}
                  </p>

                  <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
                    {dua.translation}
                  </p>

                  <p className="text-sm font-bold text-gold-700 dark:text-gold-300">
                    {isRTL ? dua.benefit.ar : dua.benefit.en}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ===== آداب الدعاء ===== */}
        <div className="card mb-8 p-6 md:p-8">
          <h2
            className="mb-5 text-xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.adabTitle}
          </h2>

          <ul className="space-y-3">
            {[ui.adab1, ui.adab2, ui.adab3, ui.adab4, ui.adab5].map(
              (item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex items-start gap-3 leading-relaxed text-slate-600 dark:text-slate-300"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                  <span>{item}</span>
                </li>
              )
            )}
          </ul>
        </div>

        {/* ===== صفحات ذات صلة ===== */}
        <div className="mb-10">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${l}/prayer-times`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🕐</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.prayerTimesPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.prayerTimesPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/ruqyah`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🛡️</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.ruqyahPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.ruqyahPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/fatwa`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">⚖️</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.fatwaPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.fatwaPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/quran`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">📖</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.quranPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.quranPageDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ===== تنبيه ===== */}
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <h2
            className="mb-5 text-xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📌 {ui.noteTitle}
          </h2>

          <ul className="space-y-3">
            {[ui.note1, ui.note2, ui.note3].map((note, index) => (
              <li
                key={`${note}-${index}`}
                className="flex items-start gap-3 leading-relaxed text-slate-700 dark:text-slate-200"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${l}/contact`} className="btn-primary">
              {ui.contact}
            </Link>

            <Link href={`/${l}/quran`} className="btn-outline">
              {ui.quran}
            </Link>

            <Link href={`/${l}/adhkar`} className="btn-outline">
              {ui.adhkar}
            </Link>
          </div>
        </div>
      </section>

      <Footer lang={l} />
    </main>
  );
}

// ============================================================
// مكون StatCard
// ============================================================

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: "primary" | "gold";
}) {
  const colorClasses = {
    primary: "text-primary-700 dark:text-primary-300",
    gold: "text-gold-700 dark:text-gold-300",
  };

  return (
    <div className="card p-5 text-center">
      <div className="mb-2 flex justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          {icon}
        </span>
      </div>
      <p className={`text-2xl font-black ${colorClasses[color]}`}>{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}