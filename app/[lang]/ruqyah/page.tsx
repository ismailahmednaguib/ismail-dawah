// app/[lang]/ruqyah/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";

// ============================================================
// الأنواع
// ============================================================

type Lang = "ar" | "en";

type LocalizedText = {
  ar: string;
  en: string;
};

type RuqyahItem = {
  id: string;
  reference: LocalizedText;
  text: LocalizedText;
  explanation?: LocalizedText;
};

type RuqyahSection = {
  id: string;
  title: LocalizedText;
  icon: string;
  description: LocalizedText;
  items: RuqyahItem[];
};

type SearchParams = {
  q?: string | string[];
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    home: string;
    description: string;
    searchPlaceholder: string;
    search: string;
    clearSearch: string;
    results: string;
    of: string;
    noResults: string;
    noResultsDesc: string;
    readItem: string;
    explanation: string;
    note: string;
    disclaimer: string;
    disclaimerText: string;
  }
> = {
  ar: {
    title: "الرقية الشرعية",
    subtitle: "آيات وأدعية من الكتاب والسنة للتحصين والرقية",
    home: "الرئيسية",
    description:
      "صفحة الرقية الشرعية تجمع أهم آيات التحصين والأدعية النبوية مع نص عربي واضح وترجمة إنجليزية وشرح مختصر.",
    searchPlaceholder: "ابحث في آيات الرقية والأدعية...",
    search: "بحث",
    clearSearch: "مسح البحث",
    results: "عدد النتائج",
    of: "من",
    noResults: "لا توجد نتائج",
    noResultsDesc: "جرّب كلمة أخرى مثل: الفاتحة، الكرسي، الإخلاص، الفلق، الناس.",
    readItem: "عرض النص والشرح",
    explanation: "الشرح",
    note: "تُقرأ الرقية بنية التعوذ بالله، مع اليقين بأن الشفاء من الله وحده.",
    disclaimer: "تنبيه مهم",
    disclaimerText:
      "هذه الصفحة للتوعية والتحصين بالقرآن والسنة، ولا تغني عن مراجعة الطبيب عند الحاجة، ولا عن سؤال أهل العلم في المسائل الخاصة.",
  },
  en: {
    title: "Ruqyah Shar'iyyah",
    subtitle: "Quranic verses and prophetic supplications for protection",
    home: "Home",
    description:
      "The Ruqyah page gathers important verses of protection and prophetic supplications with clear Arabic text, English translation, and brief explanation.",
    searchPlaceholder: "Search ruqyah verses and supplications...",
    search: "Search",
    clearSearch: "Clear search",
    results: "Results",
    of: "of",
    noResults: "No results found",
    noResultsDesc: "Try another word such as: Fatihah, Kursi, Ikhlas, Falaq, Nas.",
    readItem: "Show text and explanation",
    explanation: "Explanation",
    note: "Ruqyah is recited seeking protection from Allah, with certainty that healing is only from Allah.",
    disclaimer: "Important notice",
    disclaimerText:
      "This page is for awareness and protection through the Quran and Sunnah. It does not replace medical care when needed, nor consulting qualified scholars in specific matters.",
  },
};

// ============================================================
// بيانات الرقية
// ============================================================

const RUQYAH_SECTIONS: RuqyahSection[] = [
  {
    id: "opening",
    title: {
      ar: " فاتحة الكتاب",
      en: "Al-Fatihah",
    },
    icon: "📖",
    description: {
      ar: "سورة الفاتحة من أعظم سور القرآن، وتُقرأ في الرقية والدعاء والاستشفاء.",
      en: "Al-Fatihah is one of the greatest surahs of the Quran and is recited in ruqyah, supplication, and seeking healing.",
    },
    items: [
      {
        id: "fatihah",
        reference: {
          ar: "سورة الفاتحة",
          en: "Surah Al-Fatihah",
        },
        text: {
          ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          en: "In the name of Allah, the Most Gracious, the Most Merciful. All praise is due to Allah, Lord of the worlds, the Most Gracious, the Most Merciful, Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us to the straight path, the path of those upon whom You have bestowed favor, not of those who have earned anger, nor of those who have gone astray.",
        },
        explanation: {
          ar: "تُقرأ الفاتحة بنية الشفاء والحماية، لأنها سورة عظيمة فيها الثناء على الله والتوكل عليه وطلب الهداية.",
          en: "Al-Fatihah is recited seeking healing and protection, because it is a great surah containing praise of Allah, reliance upon Him, and asking for guidance.",
        },
      },
    ],
  },
  {
    id: "kursi",
    title: {
      ar: "آية الكرسي والخواتيم",
      en: "Ayat al-Kursi and Closing Verses",
    },
    icon: "🛡️",
    description: {
      ar: "من أعظم آيات الحماية، تُقرأ في الصباح والمساء وعند النوم وفي الرقية.",
      en: "Among the greatest verses of protection, recited in the morning, evening, before sleep, and in ruqyah.",
    },
    items: [
      {
        id: "ayat-al-kursi",
        reference: {
          ar: "سورة البقرة - آية الكرسي",
          en: "Surah Al-Baqarah - Ayat al-Kursi",
        },
        text: {
          ar: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
          en: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass nothing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
        },
        explanation: {
          ar: "آية الكرسي من أعظم آيات الحماية، وفيها توحيد الله وبيان كمال حياته وقيوميته وعلمه وسلطانه.",
          en: "Ayat al-Kursi is one of the greatest verses of protection. It affirms Allah's oneness, perfect life, self-sustaining nature, knowledge, and authority.",
        },
      },
      {
        id: "baqarah-last-two",
        reference: {
          ar: "سورة البقرة - آخر آيتين",
          en: "Surah Al-Baqarah - Last Two Ayahs",
        },
        text: {
          ar: "آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
          en: "The Messenger has believed in what was revealed to him from his Lord, and the believers have. All of them have believed in Allah and His angels, His books, and His messengers. We make no distinction between any of His messengers. And they say: We hear and obey. Your forgiveness, our Lord, and to You is the final destination. Allah does not charge a soul except with that within its capacity. It will have the consequence of what good it has gained, and it will bear the consequence of what evil it has earned. Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us, and forgive us, and have mercy upon us. You are our protector, so give us victory over the disbelieving people.",
        },
        explanation: {
          ar: "من قرأهما في ليلة كفتاه، وهما من أسباب الحماية والتفويض لله والاستعانة به.",
          en: "Whoever recites them at night, they will suffice him. They are means of protection, delegation to Allah, and seeking His help.",
        },
      },
    ],
  },
  {
    id: "muawwidhat",
    title: {
      ar: "المعوذات",
      en: "Al-Mu'awwidhat",
    },
    icon: "🤲",
    description: {
      ar: "سور الإخلاص والفلق والناس، وهي من أعظم سور التحصين.",
      en: "Surahs Al-Ikhlas, Al-Falaq, and An-Nas are among the greatest surahs of protection.",
    },
    items: [
      {
        id: "ikhlas",
        reference: {
          ar: "سورة الإخلاص",
          en: "Surah Al-Ikhlas",
        },
        text: {
          ar: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
          en: "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.",
        },
        explanation: {
          ar: "سورة الإخلاص تعدل ثلث القرآن، وفيها إثبات توحيد الله ونفي الشبيه والنظير عنه.",
          en: "Al-Ikhlas is equivalent to one third of the Quran. It affirms Allah's oneness and denies any likeness or equal to Him.",
        },
      },
      {
        id: "falaq",
        reference: {
          ar: "سورة الفلق",
          en: "Surah Al-Falaq",
        },
        text: {
          ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
          en: "Say: I seek refuge in the Lord of daybreak, from the evil of that which He created, and from the evil of darkness when it settles, and from the evil of the blowers in knots, and from the evil of an envier when he envies.",
        },
        explanation: {
          ar: "يستعيذ فيها العبد برب الفلق من شرور المخلوقات، ومن شر الليل إذا أظلم، ومن شر السحر والحسد.",
          en: "In it, the servant seeks refuge with the Lord of daybreak from the evil of creations, from the evil of night when it darkens, and from the evil of magic and envy.",
        },
      },
      {
        id: "nas",
        reference: {
          ar: "سورة الناس",
          en: "Surah An-Nas",
        },
        text: {
          ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
          en: "Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer, who whispers into the breasts of mankind, from among the jinn and mankind.",
        },
        explanation: {
          ar: "تُقرأ للتحصين من وسوسة الشيطان، وهي من أعظم المعوذات مع الفلق والإخلاص.",
          en: "It is recited for protection from Satan's whispers, and is among the greatest mu'awwidhat along with Al-Falaq and Al-Ikhlas.",
        },
      },
    ],
  },
  {
    id: "supplications",
    title: {
      ar: "أدعية نبوية للتحصين",
      en: "Prophetic Supplications for Protection",
    },
    icon: "📿",
    description: {
      ar: "أدعية مأثورة تُقال في الصباح والمساء وعند الخوف والحزن.",
      en: "Authentic supplications said in the morning, evening, and during fear or sadness.",
    },
    items: [
      {
        id: "protection-phrase",
        reference: {
          ar: "دعاء التحصين",
          en: "Supplication for Protection",
        },
        text: {
          ar: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
          en: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        },
        explanation: {
          ar: "يُقال ثلاث مرات في الصباح والمساء، وهو من أسباب الحماية بإذن الله.",
          en: "It is said three times in the morning and evening, and is a means of protection by Allah's permission.",
        },
      },
      {
        id: "bismillah-protection",
        reference: {
          ar: "دعاء بسم الله",
          en: "Supplication Beginning with Bismillah",
        },
        text: {
          ar: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
          en: "In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
        },
        explanation: {
          ar: "يُقال ثلاث مرات في الصباح والمساء، وهو من أعظم أدعية الحفظ.",
          en: "It is said three times in the morning and evening, and is among the greatest supplications for preservation.",
        },
      },
      {
        id: "relief-from-distress",
        reference: {
          ar: "دعاء كشف الهم والحزن",
          en: "Supplication for Relief from Distress",
        },
        text: {
          ar: "لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
          en: "There is no deity except Allah, the Magnificent, the Forbearing. There is no deity except Allah, Lord of the Mighty Throne. There is no deity except Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.",
        },
        explanation: {
          ar: "دعاء عظيم لكشف الهم والكرب، وفيه تفويض الأمر كله لله.",
          en: "A great supplication for relieving worry and distress, containing full delegation of affairs to Allah.",
        },
      },
      {
        id: "seeking-help",
        reference: {
          ar: "دعاء الاستعانة",
          en: "Supplication for Seeking Help",
        },
        text: {
          ar: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
          en: "O Allah, I seek refuge in You from worry and grief. I seek refuge in You from incapability and laziness. I seek refuge in You from cowardice and miserliness. And I seek refuge in You from being overwhelmed by debt and overpowered by men.",
        },
        explanation: {
          ar: "دعاء جامع للاستعاذة من أسباب الضيق النفسي والمادي والاجتماعي.",
          en: "A comprehensive supplication seeking refuge from psychological, material, and social causes of distress.",
        },
      },
    ],
  },
];

// ============================================================
// دوال مساعدة
// ============================================================

function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function formatNumber(value: number, lang: Lang): string {
  if (lang === "ar") {
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

    return String(value)
      .split("")
      .map((digit) => {
        const number = Number(digit);
        return Number.isFinite(number) ? arabicNumerals[number] : digit;
      })
      .join("");
  }

  return String(value);
}

function itemMatchesQuery(item: RuqyahItem, query: string): boolean {
  if (!query) {
    return true;
  }

  const q = normalize(query);

  const haystack = [
    item.reference.ar,
    item.reference.en,
    item.text.ar,
    item.text.en,
    item.explanation?.ar ?? "",
    item.explanation?.en ?? "",
  ];

  return haystack.some((text) => normalize(text).includes(q));
}

function sectionMatchesQuery(section: RuqyahSection, query: string): boolean {
  if (!query) {
    return true;
  }

  const q = normalize(query);

  const haystack = [
    section.title.ar,
    section.title.en,
    section.description.ar,
    section.description.en,
  ];

  return haystack.some((text) => normalize(text).includes(q));
}

function filterSections(sections: RuqyahSection[], query: string) {
  const q = query.trim();

  if (!q) {
    return sections;
  }

  return sections
    .map((section) => {
      const items = section.items.filter((item) => itemMatchesQuery(item, q));

      if (items.length > 0) {
        return {
          ...section,
          items,
        };
      }

      if (sectionMatchesQuery(section, q)) {
        return section;
      }

      return null;
    })
    .filter((section): section is RuqyahSection => section !== null);
}

function countItems(sections: RuqyahSection[]): number {
  return sections.reduce((sum, section) => sum + section.items.length, 0);
}

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (lang !== "ar" && lang !== "en") {
    return {};
  }

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/ruqyah`,
      languages: {
        ar: "/ar/ruqyah",
        en: "/en/ruqyah",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/ruqyah`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: ui.title,
      description: ui.description,
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// الصفحة
// ============================================================

export default async function RuqyahPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;

  if (lang !== "ar" && lang !== "en") {
    notFound();
  }

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const sp = await searchParams;
  const q = getFirstValue(sp.q).trim();

  const filteredSections = filterSections(RUQYAH_SECTIONS, q);
  const totalItems = countItems(RUQYAH_SECTIONS);
  const filteredItems = countItems(filteredSections);

  return (
    <main>
      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          {
            label: ui.home,
            href: `/${l}`,
          },
          {
            label: ui.title,
          },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== بطاقة البحث ===== */}
        <div className="card mb-8 p-6 md:p-7">
          <form
            method="get"
            action={`/${l}/ruqyah`}
            className="grid gap-4 md:grid-cols-[1fr_auto]"
          >
            <div className="relative">
              <svg
                className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>

              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder={ui.searchPlaceholder}
                className="input-islamic !ps-12"
                aria-label={ui.searchPlaceholder}
              />
            </div>

            <button type="submit" className="btn-primary whitespace-nowrap">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              {ui.search}
            </button>
          </form>

          {q && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="badge-gold">“{q}”</span>

              <Link
                href={`/${l}/ruqyah`}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
                {ui.clearSearch}
              </Link>
            </div>
          )}
        </div>

        {/* ===== عدد النتائج ===== */}
        <p className="mb-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {ui.results}:{" "}
          <span className="text-primary-600 dark:text-primary-400">
            {formatNumber(filteredItems, l)}
          </span>{" "}
          {ui.of}{" "}
          <span className="text-slate-700 dark:text-slate-200">
            {formatNumber(totalItems, l)}
          </span>
        </p>

        {/* ===== لا توجد نتائج ===== */}
        {filteredSections.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">🛡️</div>

            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noResults}
            </h3>

            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {ui.noResultsDesc}
            </p>

            <Link href={`/${l}/ruqyah`} className="btn-primary">
              {ui.clearSearch}
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredSections.map((section) => (
              <div key={section.id}>
                {/* ===== رأس القسم ===== */}
                <div className="mb-5 flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                    {section.icon}
                  </span>

                  <div>
                    <h2
                      className="text-2xl font-black text-slate-900 dark:text-white"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {isRTL ? section.title.ar : section.title.en}
                    </h2>

                    <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {isRTL ? section.description.ar : section.description.en}
                    </p>
                  </div>
                </div>

                {/* ===== عناصر القسم ===== */}
                <div className="grid gap-5 lg:grid-cols-2">
                  {section.items.map((item) => (
                    <article
                      key={item.id}
                      className="card group p-6 md:p-7"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <span className="badge-primary">
                          {isRTL ? item.reference.ar : item.reference.en}
                        </span>
                      </div>

                      <p
                        className="quran-text mb-5 text-2xl leading-[2.35] md:text-3xl"
                        style={{ fontFamily: "var(--font-quran)" }}
                      >
                        {item.text.ar}
                      </p>

                      {!isRTL && (
                        <p className="mb-5 border-t border-slate-100 pt-5 text-base leading-relaxed text-slate-600 dark:border-night-700 dark:text-slate-300">
                          {item.text.en}
                        </p>
                      )}

                      {item.explanation && (
                        <details className="mt-2">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-sm font-bold text-primary-800 transition-all hover:bg-primary-100/70 dark:border-primary-900/40 dark:bg-primary-950/20 dark:text-primary-200 dark:hover:bg-primary-900/30 [&::-webkit-details-marker]:hidden">
                            <span>{ui.readItem}</span>

                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="transition-transform duration-300 group-open:rotate-180"
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </summary>

                          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5 dark:border-night-700">
                            {isRTL && (
                              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                                {item.text.en}
                              </p>
                            )}

                            <div>
                              <p className="mb-2 text-sm font-black text-slate-900 dark:text-white">
                                {ui.explanation}
                              </p>

                              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                                {isRTL ? item.explanation.ar : item.explanation.en}
                              </p>
                            </div>
                          </div>
                        </details>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== ملاحظة ===== */}
        <div className="card mt-10 p-6 text-center">
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {ui.note}
          </p>
        </div>

        {/* ===== تنبيه ===== */}
        <div className="card mt-6 border-gold-200 bg-gold-50/60 p-6 dark:border-gold-800/40 dark:bg-gold-950/20">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              ⚠️
            </span>

            <div>
              <h3 className="mb-2 text-lg font-black text-slate-900 dark:text-white">
                {ui.disclaimer}
              </h3>

              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                {ui.disclaimerText}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}