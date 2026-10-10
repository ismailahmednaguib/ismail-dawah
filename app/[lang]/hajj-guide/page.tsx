// app/[lang]/hajj-guide/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ============================================================
// الأنواع
// ============================================================

type Localized = {
  ar: string;
  en: string;
};

type GuideStep = {
  id: string;
  icon: string;
  title: Localized;
  summary: Localized;
  details: {
    ar: string[];
    en: string[];
  };
  note?: Localized;
};

type GuideDua = {
  id: string;
  occasion: Localized;
  arabic: string;
  transliteration?: string;
  translation?: string;
  reference?: Localized;
};

type GuideMistake = {
  id: string;
  title: Localized;
  explanation: Localized;
};

type GuideChecklistItem = {
  id: string;
  text: Localized;
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  hajjTitle: string;
  hajjDesc: string;
  umrahTitle: string;
  umrahDesc: string;
  duasTitle: string;
  duasDesc: string;
  mistakesTitle: string;
  mistakesDesc: string;
  checklistTitle: string;
  checklistDesc: string;
  quickNav: string;
  step: string;
  details: string;
  note: string;
  reference: string;
  translation: string;
  beforeTravel: string;
  duringRites: string;
  importantNoteTitle: string;
  importantNote1: string;
  importantNote2: string;
  importantNote3: string;
  contact: string;
  fatwa: string;
  prayerTimes: string;
  qibla: string;
  verse: string;
  verseSource: string;
  hajjStepsCount: string;
  umrahStepsCount: string;
  duasCount: string;
  mistakesCount: string;
  introTitle: string;
  introDesc: string;
  relatedTitle: string;
  calendarPage: string;
  calendarPageDesc: string;
  prayerPage: string;
  prayerPageDesc: string;
  qiblaPage: string;
  qiblaPageDesc: string;
  fatwaPage: string;
  fatwaPageDesc: string;
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<Lang, UILang> = {
  ar: {
    title: "دليل الحج والعمرة",
    subtitle: "خطوات النسك، الأدعية، الأخطاء الشائعة، وقائمة تحضير",
    home: "الرئيسية",
    description:
      "دليل مبسط للحج والعمرة يشرح الخطوات المرتبة، والأدعية المأثورة، والأخطاء الشائعة، مع قائمة تحضير قبل السفر وأثناء النسك.",
    hajjTitle: "خطوات الحج",
    hajjDesc: "الترتيب العام لأعمال الحج حسب النسك الأكثر شيوعًا، مع تنبيه أن التفاصيل تختلف حسب نوع الحج.",
    umrahTitle: "خطوات العمرة",
    umrahDesc: "العمرة أيسر من الحج، ولها خطوات مرتبة من الإحرام حتى الحلق أو التقصير.",
    duasTitle: "أدعية مهمة",
    duasDesc: "أدعية مأثورة تٌقال في المواضع المهمة من النسك.",
    mistakesTitle: "أخطاء شائعة يجب تجنبها",
    mistakesDesc: "بعض الأخطاء تقع كثيرًا من الحجاج والمعتمرين، والانتباه لها يعين على صحة النسك وخشوعه.",
    checklistTitle: "قائمة تحضير",
    checklistDesc: "أمور عملية تساعدك على الاستعداد قبل السفر وأثناء أداء المناسك.",
    quickNav: "تنقل سريع",
    step: "خطوة",
    details: "التفاصيل",
    note: "تنبيه",
    reference: "المصدر",
    translation: "الترجمة",
    beforeTravel: "قبل السفر",
    duringRites: "أثناء النسك",
    importantNoteTitle: "تنبيه مهم",
    importantNote1: "هذا الدليل للتبسيط والتوعية، ولا يغني عن تعلم المناسك من مصادر معتبرة أو مرشد ثقة.",
    importantNote2: "قد تختلف بعض التفاصيل حسب نوع الحج: مفرد، قران، أو تمتع، وحسب المذهب الفقهي.",
    importantNote3: "الأدعية المذكورة مختارة من المشهور في النسك، ويمكن الزيادة بما ثبت من السنة.",
    contact: "تواصل معنا",
    fatwa: "الفتاوى",
    prayerTimes: "مواقيت الصلاة",
    qibla: "اتجاه القبلة",
    verse: "﴿ وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا ﴾",
    verseSource: "سورة آل عمران — الآية 97",
    hajjStepsCount: "خطوات الحج",
    umrahStepsCount: "خطوات العمرة",
    duasCount: "أدعية مأثورة",
    mistakesCount: "أخطاء شائعة",
    introTitle: "فضل الحج والعمرة",
    introDesc:
      "الحج ركن من أركان الإسلام الخمسة، وفرض على كل مسلم بالغ عاقل قادر مرة في العمر. وهو رحلة إيمانية عظيمة تجمع بين العبادة البدنية والمالية، وتمحو الذنوب وتجدد الإيمان. والعمرة سنة مؤكدة، ويمكن أداؤها في أي وقت من السنة، وفي رمضان تعدل حجة.",
    relatedTitle: "صفحات ذات صلة",
    calendarPage: "التقويم الهجري",
    calendarPageDesc: "تواريخ مواسم الحج والعمرة.",
    prayerPage: "مواقيت الصلاة",
    prayerPageDesc: "مواقيت الصلوات في مكة والمدينة.",
    qiblaPage: "اتجاه القبلة",
    qiblaPageDesc: "بوصلة القبلة والمسافة إلى مكة.",
    fatwaPage: "الفتاوى",
    fatwaPageDesc: "أسئلة فقهية عن الحج والعمرة.",
  },
  en: {
    title: "Hajj & Umrah Guide",
    subtitle: "Rites, supplications, common mistakes, and preparation checklist",
    home: "Home",
    description:
      "A simplified guide for Hajj and Umrah explaining the ordered steps, important supplications, common mistakes, and a practical preparation checklist.",
    hajjTitle: "Hajj Steps",
    hajjDesc: "The general order of Hajj rituals for the most common types, with a note that details vary according to the type of Hajj.",
    umrahTitle: "Umrah Steps",
    umrahDesc: "Umrah is simpler than Hajj and has ordered steps from ihram to shaving or trimming.",
    duasTitle: "Important Supplications",
    duasDesc: "Authentic supplications recited at key moments during the rites.",
    mistakesTitle: "Common Mistakes to Avoid",
    mistakesDesc: "Some mistakes are frequent among pilgrims. Awareness helps preserve the correctness and humility of the rites.",
    checklistTitle: "Preparation Checklist",
    checklistDesc: "Practical items to help you prepare before travel and during the rites.",
    quickNav: "Quick navigation",
    step: "Step",
    details: "Details",
    note: "Note",
    reference: "Reference",
    translation: "Translation",
    beforeTravel: "Before travel",
    duringRites: "During rites",
    importantNoteTitle: "Important notice",
    importantNote1: "This guide is for simplification and awareness. It does not replace learning the rites from reliable sources or a trusted guide.",
    importantNote2: "Some details may differ according to the type of Hajj: ifrad, qiran, or tamattu, and according to the school of thought.",
    importantNote3: "The supplications listed are selected from well-known rites, and additional authentic dua may be added.",
    contact: "Contact Us",
    fatwa: "Fatwas",
    prayerTimes: "Prayer Times",
    qibla: "Qibla",
    verse: "\"And [due] to Allah from the people is a pilgrimage to the House - for whoever is able to find thereto a way.\"",
    verseSource: "Surah Ali 'Imran — Verse 97",
    hajjStepsCount: "Hajj Steps",
    umrahStepsCount: "Umrah Steps",
    duasCount: "Authentic Duas",
    mistakesCount: "Common Mistakes",
    introTitle: "Virtue of Hajj and Umrah",
    introDesc:
      "Hajj is one of the five pillars of Islam, obligatory on every sane, adult, able Muslim once in a lifetime. It is a great spiritual journey combining physical and financial worship, erasing sins and renewing faith. Umrah is an emphasized Sunnah performable at any time, and in Ramadan it equals Hajj in reward.",
    relatedTitle: "Related Pages",
    calendarPage: "Hijri Calendar",
    calendarPageDesc: "Dates of Hajj and Umrah seasons.",
    prayerPage: "Prayer Times",
    prayerPageDesc: "Prayer times in Makkah and Madinah.",
    qiblaPage: "Qibla Direction",
    qiblaPageDesc: "Qibla compass and distance to Makkah.",
    fatwaPage: "Fatwas",
    fatwaPageDesc: "Fiqh questions about Hajj and Umrah.",
  },
};

// ============================================================
// خطوات الحج
// ============================================================

const HAJJ_STEPS: GuideStep[] = [
  {
    id: "hajj-ihram",
    icon: "🧳",
    title: { ar: "الإحرام من الميقات", en: "Enter Ihram at the Miqat" },
    summary: {
      ar: "يبدأ الحاج إحرامه من الميقات المحدد، بالنية والتلبية.",
      en: "The pilgrim begins ihram at the designated miqat with intention and talbiyah.",
    },
    details: {
      ar: [
        "اغتسل أو توضأ كما تتوضأ للصلاة.",
        "البس ملابس الإحرام: للرجال إزار ورداء أبيضين نظيفين، وللنساء ما اعتدن لباسه بلا زينة ولا نقاب ولا قفازين.",
        "انوِ الحج بقلبك، وقل: لبيك اللهم حجا.",
        "ارفع صوتك بالتلبية: لبيك اللهم لبيك، لبيك لا شريك لك لبيك، إن الحمد والنعمة لك والملك، لا شريك لك.",
        "اجتنب محظورات الإحرام من الطيب، وقص الشعر، وتقليم الأظافر، والصيد، ومباشرة الزوجية، وما أشبه ذلك.",
      ],
      en: [
        "Perform ghusl or wudu as you would for prayer.",
        "Wear ihram garments: for men, two clean white unstitched pieces; for women, ordinary modest clothing without adornment, niqab, or gloves.",
        "Make the intention for Hajj in your heart and say: Labbayk Allahumma Hajjan.",
        "Raise your voice with talbiyah: Labbayk Allahumma labbayk, labbayka la sharika laka labbayk, innal-hamd wan-nimata laka wal-mulk, la sharika lak.",
        "Avoid the prohibitions of ihram such as perfume, cutting hair, trimming nails, hunting, marital relations, and similar matters.",
      ],
    },
    note: {
      ar: "الميقات يختلف حسب طريق القدوم، فينبغي معرفته قبل السفر.",
      en: "The miqat differs according to the route of arrival, so it should be known before travel.",
    },
  },
  {
    id: "hajj-tawaf-qudum",
    icon: "🕋",
    title: { ar: "طواف القدوم", en: "Tawaf al-Qudum" },
    summary: {
      ar: "طواف تحية المسجد الحرام عند الوصول لمكة.",
      en: "The greeting tawaf of the Sacred Mosque upon arriving in Makkah.",
    },
    details: {
      ar: [
        "إذا وصلت مكة، فتوجه إلى المسجد الحرام.",
        "ابدأ الطواف سبعة أشواط حول الكعبة، جاعلًا الكعبة عن يسارك.",
        "استلم الحجر الأسود في الشوط الأول إن قدرت، وإلا أشرت إليه وكبرت.",
        "ارمل في الثلاثة الأشواط الأولى للرجال إن كان النسك يتطلب ذلك، وامشِ في الأربعة الباقية.",
        "ليس لطواف القدوم دعاء محدود في كل شوط، فادعُ بما تيسر من الذكر والدعاء.",
      ],
      en: [
        "When you arrive in Makkah, go to the Masjid al-Haram.",
        "Begin tawaf by circling the Kaaba seven times, keeping the Kaaba on your left.",
        "Touch the Black Stone at the start of the first round if able; otherwise point to it and say Allahu Akbar.",
        "Men perform ramal in the first three rounds if the rite requires it, and walk normally in the remaining four.",
        "There is no fixed supplication for every round of Tawaf al-Qudum, so recite dhikr and dua as convenient.",
      ],
    },
  },
  {
    id: "hajj-sai",
    icon: "🏃",
    title: { ar: "السعي بين الصفا والمروة", en: "Sai between Safa and Marwah" },
    summary: {
      ar: "السعي سبعة أشواط بين الصفا والمروة بعد الطواف.",
      en: "Sai is seven rounds between Safa and Marwah after tawaf.",
    },
    details: {
      ar: [
        "ابدأ بالسعي من الصفا.",
        "إذا اقتربت من الصفا اقرأ إن شئت: إن الصفا والمروة من شعائر الله.",
        "ارفع يديك واستقبل القبلة وكبر وقل: الله أكبر، الله أكبر، الله أكبر، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
        "امشِ في مسعاك، واسْعَ سعيًا شديدًا بين العلمين الأخضرين للرجال.",
        "اعُد من المروة إلى الصفا شوطًا، وهكذا حتى تتم سبعة أشواط، والذهاب من الصفا إلى المروة شوط، والعودة شوط.",
      ],
      en: [
        "Begin sai from Safa.",
        "Near Safa, you may recite: Indeed, Safa and Marwah are among the symbols of Allah.",
        "Raise your hands, face the qiblah, say Allahu Akbar three times, and recite the tahlil and praise.",
        "Walk during sai, and men hasten between the two green lights.",
        "Going from Safa to Marwah is one round, and returning from Marwah to Safa is another, until seven rounds are completed.",
      ],
    },
  },
  {
    id: "hajj-halq-taqsir-umrah",
    icon: "✂️",
    title: { ar: "الحلق أو التقصير للتمتع", en: "Shaving or Trimming for Tamattu" },
    summary: {
      ar: "من حج متمتعًا يحلق أو يقصر بعد سعي العمرة ويتحلل.",
      en: "One performing tamattu shaves or trims after the umrah sai and exits ihram.",
    },
    details: {
      ar: [
        "إذا كنت متمتعًا، فبعد طواف العمرة وسعيها تحلق أو تقصر.",
        "الحلق للرجال أفضل، والتقصير يعم جميع الشعر.",
        "بذلك تتحلل من إحرام العمرة وتبقى محظورات الإحرام مرفوعة حتى إحرام الحج.",
        "أما القارن والمفرد فيبقون على إحرامهم بعد السعي.",
      ],
      en: [
        "If you are performing tamattu, after umrah tawaf and sai you shave or trim.",
        "Shaving is better for men, and trimming should affect all hair.",
        "Thus you exit the ihram of umrah, and ihram restrictions are lifted until the ihram for Hajj.",
        "The qiran and ifrad pilgrims remain in ihram after sai.",
      ],
    },
  },
  {
    id: "hajj-ihram-hajj",
    icon: "🌙",
    title: { ar: "الإحرام بالحج يوم التروية", en: "Ihram for Hajj on the Day of Tarwiyah" },
    summary: {
      ar: "المتمتع يحرم بالحج من مكة يوم الثامن من ذي الحجة.",
      en: "The tamattu pilgrim enters ihram for Hajj from Makkah on the eighth of Dhul-Hijjah.",
    },
    details: {
      ar: [
        "في يوم التروية، وهو الثامن من ذي الحجة، أحرم بالحج.",
        "اغتسل أو توضأ، والبس ملابس الإحرام.",
        "قل: لبيك اللهم حجا.",
        "التزم بالتلبية والذكر حتى تصل إلى منى.",
      ],
      en: [
        "On the Day of Tarwiyah, the eighth of Dhul-Hijjah, enter ihram for Hajj.",
        "Perform ghusl or wudu and wear ihram garments.",
        "Say: Labbayk Allahumma Hajjan.",
        "Continue talbiyah and dhikr until reaching Mina.",
      ],
    },
  },
  {
    id: "hajj-mina",
    icon: "⛺",
    title: { ar: "المبيت في منى", en: "Staying in Mina" },
    summary: {
      ar: "يذهب الحاج إلى منى ويصلي بها الصلوات في وقتها.",
      en: "The pilgrim goes to Mina and prays the prayers at their times.",
    },
    details: {
      ar: [
        "امضِ إلى منى بعد شروق شمس يوم التروية.",
        "صلِّ الصلوات الخمس في وقتها، مع قصر الرباعية.",
        "أكثِر من التلبية والذكر.",
        "المبيت بمنى سنة مؤكدة على الراجح عند كثير من العلماء، إلا إذا كان هناك عذر أو حاجة.",
      ],
      en: [
        "Go to Mina after sunrise on the Day of Tarwiyah.",
        "Pray the five prayers at their times, shortening the four-unit prayers.",
        "Increase in talbiyah and dhikr.",
        "Staying in Mina is an emphasized Sunnah according to many scholars, unless there is an excuse or necessity.",
      ],
    },
  },
  {
    id: "hajj-arafat",
    icon: "🏜️",
    title: { ar: "الوقوف بعرفة", en: "Standing at Arafah" },
    summary: {
      ar: "الوقوف بعرفة ركن أعظم في الحج، ويكون بعد زوال شمس يوم التاسع من ذي الحجة.",
      en: "Standing at Arafah is the greatest pillar of Hajj, beginning after the sun passes its zenith on the ninth of Dhul-Hijjah.",
    },
    details: {
      ar: [
        "توجه إلى عرفة بعد صلاة الظهر، واغتنم وقت الوقوف.",
        "استقبل القبلة، وأكثر من الدعاء والتضرع.",
        "من أفضل الدعاء دعاء يوم عرفة: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
        "لا يخرج الحاج من عرفة إلا بعد غروب الشمس.",
        "الوقوف بعرفة لا يشترط فيه أن تكون واقفًا بدنيًا، بل يكفي وجودك في عرفة بنية النسك.",
      ],
      en: [
        "Proceed to Arafah after Dhuhr prayer and seize the time of standing.",
        "Face the qiblah and increase in supplication and humility.",
        "Among the best dua on the Day of Arafah is: There is no deity except Allah alone, without partner; His is the dominion and praise, and He is over all things capable.",
        "Do not leave Arafah until after sunset.",
        "Standing at Arafah does not require physically standing; being present in Arafah with the intention of the rite is sufficient.",
      ],
    },
    note: {
      ar: "من فاته الوقوف بعرفة فقد فاته الحج على الراجح.",
      en: "Whoever misses the standing at Arafah has missed Hajj according to the strongest view.",
    },
  },
  {
    id: "hajj-muzdalifah",
    icon: "🌌",
    title: { ar: "المبيت بمزدلفة وجمع الصلاتين", en: "Staying in Muzdalifah and Combining Prayers" },
    summary: {
      ar: "بعد غروب الشمس يدفع الحاج إلى مزدلفة ويصلي المغرب والعشاء جمعًا.",
      en: "After sunset, the pilgrim proceeds to Muzdalifah and prays Maghrib and Isha combined.",
    },
    details: {
      ar: [
        "ادفع إلى مزدلفة بعد غروب الشمس بسكينة.",
        "صلِّ المغرب والعشاء جمع تأخير وقصر للعشاء عند الحاجة.",
        "بت بمزدلفة وصلِّ الفجر في أول وقتها.",
        "أكثِر من الذكر والتلبية حتى يسفر جدًا.",
        "الجمع بين المغرب والعشاء بمزدلفة سنة مؤكدة، والمبيت بها واجب عند جمهور العلماء.",
      ],
      en: [
        "Proceed to Muzdalifah after sunset with calmness.",
        "Pray Maghrib and Isha combined, with Isha shortened if needed.",
        "Stay the night in Muzdalifah and pray Fajr at its earliest time.",
        "Increase in dhikr and talbiyah until very bright dawn.",
        "Combining Maghrib and Isha in Muzdalifah is an emphasized Sunnah, and staying there is obligatory according to the majority.",
      ],
    },
  },
  {
    id: "hajj-jamarat-aqabah",
    icon: "🪨",
    title: { ar: "رمي جمرة العقبة الكبرى", en: "Stoning Jamarat al-Aqabah" },
    summary: {
      ar: "بعد الإسفار يذهب الحاج إلى منى ويرمي جمرة العقبة بسبع حصيات.",
      en: "After bright dawn, the pilgrim goes to Mina and stones the large Jamarah with seven pebbles.",
    },
    details: {
      ar: [
        "ادفع من مزدلفة إلى منى قبل طلوع الشمس إن استطعت.",
        "ارم جمرة العقبة الكبرى بسبع حصيات، واحدة بعد الأخرى.",
        "قل مع كل حصاة: الله أكبر.",
        "الرمي يكون بعد طلوع الشمس يوم النحر.",
        "لا تشترط استقبال الجمرة، بل يستقبل القبلة ويجعل الجمرة عن يساره إن تيسر.",
      ],
      en: [
        "Leave Muzdalifah for Mina before sunrise if able.",
        "Stone the large Jamarah with seven pebbles, one after the other.",
        "Say Allahu Akbar with each pebble.",
        "Stoning occurs after sunrise on the Day of Sacrifice.",
        "Facing the Jamarah is not required; rather face the qiblah and keep the Jamarah on your left if possible.",
      ],
    },
  },
  {
    id: "hajj-sacrifice",
    icon: "🐑",
    title: { ar: "الهدي", en: "Sacrificial Offering" },
    summary: {
      ar: "يذبح الحاج هديه يوم النحر أو أيام التشريق، وهو واجب على المتمتع والقارن.",
      en: "The pilgrim offers the sacrificial animal on the Day of Sacrifice or during the Days of Tashreeq; it is obligatory for tamattu and qiran pilgrims.",
    },
    details: {
      ar: [
        "اذبح أو نوِّب من يذبح لك في وقت الذبح.",
        "قل عند الذبح: بسم الله والله أكبر، اللهم منك ولك.",
        "اللهم تقبل مني كما تقبلت من إبراهيم خليلك ومحمد عبده ورسولك.",
        "جزّئ اللحم إن شئت، وأطعم الفقراء والأقارب.",
        "المفرد ليس عليه هدي واجب، لكن قد يتطوع به.",
      ],
      en: [
        "Slaughter or appoint someone to slaughter on your behalf during the valid time.",
        "Say when slaughtering: Bismillah, Allahu Akbar, O Allah, from You and for You.",
        "O Allah, accept from me as You accepted from Ibrahim Your friend and Muhammad Your servant and messenger.",
        "Distribute the meat if you wish, feeding the poor and relatives.",
        "The ifrad pilgrim is not obligated to offer a sacrifice, though he may do so voluntarily.",
      ],
    },
  },
  {
    id: "hajj-halq-taqsir",
    icon: "💈",
    title: { ar: "الحلق أو التقصير", en: "Shaving or Trimming" },
    summary: {
      ar: "بعد الرمي والنحر يحلق الرجل شعر رأسه أو يقصر، ويتحلل من إحرام الحج.",
      en: "After stoning and sacrifice, the man shaves or trims his head and exits the ihram of Hajj.",
    },
    details: {
      ar: [
        "الحلق أفضل للرجال، لأنه دعاء النبي صلى الله عليه وسلم للمحلقين ثلاثًا.",
        "التقصير يعم جميع الرأس.",
        "النساء يقصرن من أطراف الشعر بقدر أنملة.",
        "بعد الحلق أو التقصير تتحلل التحلل الأصغر، فتباح لك محظورات الإحرام إلا النساء.",
      ],
      en: [
        "Shaving is better for men because the Prophet peace be upon him prayed for those who shave three times.",
        "Trimming should affect all of the head.",
        "Women trim the ends of their hair by about the length of a fingertip.",
        "After shaving or trimming, the lesser exit from ihram occurs, and ihram restrictions become lawful except marital relations.",
      ],
    },
  },
  {
    id: "hajj-tawaf-ifadah",
    icon: "🕋",
    title: { ar: "طواف الإفاضة", en: "Tawaf al-Ifadah" },
    summary: {
      ar: "طواف الإفاضة ركن أساسي من أركان الحج، ويُسمى طواف الزيارة.",
      en: "Tawaf al-Ifadah is an essential pillar of Hajj, also called the tawaf of visiting.",
    },
    details: {
      ar: [
        "انزل إلى مكة وطُف بالكعبة سبعة أشواط.",
        "ابدأ من الحجر الأسود واستلمه إن قدرت.",
        "صلِّ ركعتي الطواف خلف مقام إبراهيم إن تيسر.",
        "اشرب من ماء زمزم إن تيسر.",
        "طواف الإفاضة لا يتم الحج إلا به، فيجب الحرص على وقته وأحكامه.",
      ],
      en: [
        "Go down to Makkah and circle the Kaaba seven times.",
        "Begin at the Black Stone and touch it if able.",
        "Pray two rak ah after tawaf behind Maqam Ibrahim if possible.",
        "Drink from Zamzam water if possible.",
        "Hajj is not complete without Tawaf al-Ifadah, so be careful with its timing and rulings.",
      ],
    },
  },
  {
    id: "hajj-sai-after-ifadah",
    icon: "🏃",
    title: { ar: "السعي بعد طواف الإفاضة", en: "Sai after Tawaf al-Ifadah" },
    summary: {
      ar: "يسعى الحاج بين الصفا والمروة بعد طواف الإفاضة حسب نسكه.",
      en: "The pilgrim performs sai between Safa and Marwah after Tawaf al-Ifadah according to his type of Hajj.",
    },
    details: {
      ar: [
        "ابدأ السعي من الصفا.",
        "أكمل سبعة أشواط.",
        "ادعُ بما تيسر، وخاصة عند الصفا والمروة.",
        "في الحج المتمتع قد يكون السعي بين الصفا والمروة قد سبق في العمرة، ويحتاج تفصيلًا فقهيًا.",
      ],
      en: [
        "Begin sai from Safa.",
        "Complete seven rounds.",
        "Supplicate as convenient, especially at Safa and Marwah.",
        "For tamattu Hajj, the sai may have already been performed during umrah, which requires detailed fiqh.",
      ],
    },
  },
  {
    id: "hajj-days-tashreeq",
    icon: "📅",
    title: { ar: "أيام التشريق ورمي الجمرات", en: "Days of Tashreeq and Stoning" },
    summary: {
      ar: "يقضي الحاج أيام التشريق في منى، ويرمي الجمرات الثلاث بعد الزوال.",
      en: "The pilgrim spends the Days of Tashreeq in Mina and stones the three Jamarat after the sun passes its zenith.",
    },
    details: {
      ar: [
        "ارم الجمرات الثلاث: الصغرى، ثم الوسطى، ثم الكبرى.",
        "كل واحدة بسبع حصيات.",
        "قل مع كل حصاة: الله أكبر.",
        "ادعُ بعد الصغرى والوسطى مستقبلًا القبلة، ولا تدعُ بعد الكبرى.",
        "المبيت بمنى ليالي التشريق واجب عند جمهور العلماء لمن تيسر.",
      ],
      en: [
        "Stone the three Jamarat: the small, then the middle, then the large.",
        "Each with seven pebbles.",
        "Say Allahu Akbar with each pebble.",
        "Supplicate after the small and middle Jamarah while facing the qiblah, and do not supplicate after the large one.",
        "Staying in Mina during the nights of Tashreeq is obligatory according to the majority for whoever is able.",
      ],
    },
  },
  {
    id: "hajj-wada",
    icon: "👋",
    title: { ar: "طواف الوداع", en: "Farewell Tawaf" },
    summary: {
      ar: "آخر عهد الحاج بالبيت، فيطوف سبعة أشواط قبل السفر.",
      en: "The pilgrim final act at the House is to perform seven rounds of tawaf before departure.",
    },
    details: {
      ar: [
        "لا تسافر من مكة حتى تطوف للوداع سبعة أشواط.",
        "يطاف بعد الانتهاء من جميع أعمال الحج.",
        "الحائض والنفساء يسقط عنهما طواف الوداع على الراجح.",
        "اجعل آخر عهدك بالبيت هو الطواف، ولا تلتفت للوداع بالمعنى المخالف للسنة.",
      ],
      en: [
        "Do not leave Makkah until performing seven rounds of farewell tawaf.",
        "It is performed after completing all Hajj rituals.",
        "Menstruating and postpartum women are exempt from farewell tawaf according to the strongest view.",
        "Make your final encounter with the House the tawaf, and avoid innovations associated with farewell.",
      ],
    },
  },
];

// ============================================================
// خطوات العمرة
// ============================================================

const UMRAH_STEPS: GuideStep[] = [
  {
    id: "umrah-ihram",
    icon: "🧳",
    title: { ar: "الإحرام بالعمرة", en: "Enter Ihram for Umrah" },
    summary: {
      ar: "يبدأ المعتمر إحرامه من الميقات بالنية والتلبية.",
      en: "The pilgrim begins umrah ihram at the miqat with intention and talbiyah.",
    },
    details: {
      ar: [
        "اغتسل أو توضأ.",
        "البس ملابس الإحرام.",
        "انوِ العمرة وقل: لبيك اللهم عمرة.",
        "التزم بالتلبية حتى تبدأ الطواف.",
        "اجتنب محظورات الإحرام.",
      ],
      en: [
        "Perform ghusl or wudu.",
        "Wear ihram garments.",
        "Make intention for umrah and say: Labbayk Allahumma Umrah.",
        "Continue talbiyah until beginning tawaf.",
        "Avoid the prohibitions of ihram.",
      ],
    },
  },
  {
    id: "umrah-tawaf",
    icon: "🕋",
    title: { ar: "طواف العمرة", en: "Umrah Tawaf" },
    summary: {
      ar: "يطوف المعتمر سبعة أشواط حول الكعبة.",
      en: "The pilgrim circles the Kaaba seven times.",
    },
    details: {
      ar: [
        "ابدأ من الحجر الأسود.",
        "اجعل الكعبة عن يسارك.",
        "ارمل في الثلاثة أشواط الأولى للرجال.",
        "ادعُ بما تيسر، وليس لكل شوط دعاء محدود.",
        "صلِّ ركعتي الطواف خلف المقام إن تيسر.",
      ],
      en: [
        "Begin at the Black Stone.",
        "Keep the Kaaba on your left.",
        "Men perform ramal in the first three rounds.",
        "Supplicate as convenient; there is no fixed dua for each round.",
        "Pray two rak ah after tawaf behind Maqam Ibrahim if possible.",
      ],
    },
  },
  {
    id: "umrah-sai",
    icon: "🏃",
    title: { ar: "سعي العمرة", en: "Umrah Sai" },
    summary: {
      ar: "يسعى المعتمر سبعة أشواط بين الصفا والمروة.",
      en: "The pilgrim performs seven rounds between Safa and Marwah.",
    },
    details: {
      ar: [
        "ابدأ من الصفا.",
        "استقبل القبلة وكبر وهلّل عند البدء.",
        "امشِ في السعي، واسْعَ شديدًا بين العلمين الأخضرين للرجال.",
        "الذهاب إلى المروة شوط، والعودة إلى الصفا شوط.",
        "أكمل سبعة أشواط.",
      ],
      en: [
        "Begin from Safa.",
        "Face the qiblah, say Allahu Akbar, and recite tahlil when starting.",
        "Walk during sai, and men hasten between the two green lights.",
        "Going to Marwah is one round, returning to Safa is another.",
        "Complete seven rounds.",
      ],
    },
  },
  {
    id: "umrah-halq-taqsir",
    icon: "✂️",
    title: { ar: "الحلق أو التقصير", en: "Shaving or Trimming" },
    summary: {
      ar: "بالحلق أو التقصير تتم العمرة ويتحلل المعتمر.",
      en: "Umrah is completed by shaving or trimming, and the pilgrim exits ihram.",
    },
    details: {
      ar: [
        "الرجال: الحلق أفضل، والتقصير يجزئ.",
        "النساء: يقصرن من أطراف الشعر.",
        "بعد ذلك تتحلل من إحرام العمرة.",
        "لا تخرج من الحرم قبل التأكد من إتمام الأشواط.",
      ],
      en: [
        "For men: shaving is better, trimming is sufficient.",
        "For women: trim the ends of the hair.",
        "After that, exit the ihram of umrah.",
        "Do not leave the Sacred Precinct before confirming completion of the rounds.",
      ],
    },
  },
];

// ============================================================
// أدعية
// ============================================================

const DUAS: GuideDua[] = [
  {
    id: "talbiyah",
    occasion: { ar: "التلبية", en: "Talbiyah" },
    arabic: "لَبَّيْك اللَّهُمَّ لَبَّيْك، لَبَّيْك لَا شَرِيك لَك لَبَّيْك، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَك وَالْمُلْكَ، لَا شَرِيك لَك",
    transliteration: "Labbayk Allahumma labbayk, labbayka la sharika laka labbayk, innal-hamd wan-nimata laka wal-mulk, la sharika lak.",
    translation: "Here I am, O Allah, here I am. Here I am, You have no partner. Here I am. Indeed, praise, blessing, and dominion belong to You; You have no partner.",
    reference: { ar: "متفق عليه", en: "Agreed upon" },
  },
  {
    id: "entering-masjid",
    occasion: { ar: "دعاء دخول المسجد الحرام", en: "Supplication for entering Masjid al-Haram" },
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِك، وَأَعِذْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration: "Allahumma ftah li abwaba rahmatik, wa aidhni minash-shaytanir-rajim.",
    translation: "O Allah, open for me the gates of Your mercy, and protect me from the expelled Satan.",
    reference: { ar: "مأثور عند دخول المساجد", en: "Reported for entering mosques" },
  },
  {
    id: "seeing-kaaba",
    occasion: { ar: "عند رؤية الكعبة", en: "Upon seeing the Kaaba" },
    arabic: "اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً، وَزِدْ مَنْ شَرَّفَهُ وَكَرَّمَهُ مِمَّنْ حَجَّهُ أَوِ اعْتَمَرَهُ تَشْرِيفًا وَتَكْرِيمًا وَتَعْظِيمًا وَبِرًّا",
    transliteration: "Allahumma zid hadhal-bayta tashrifan wa tazhiman wa takriman wa mahabah, wa zid man sharrafahu wa karramahu mimman hajjahu awi-tamarahu tashrifan wa takriman wa tazhiman wa birran.",
    translation: "O Allah, increase this House in honor, greatness, reverence, and awe, and increase those who honor it among pilgrims and performers of umrah in honor, reverence, greatness, and righteousness.",
    reference: { ar: "مأثور عن السلف", en: "Reported from the Salaf" },
  },
  {
    id: "safa-marwah",
    occasion: { ar: "عند الصفا والمروة", en: "At Safa and Marwah" },
    arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ، أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ",
    transliteration: "Innas-Safa wal-Marwata min shairillah, abdu bima bada Allahu bihi.",
    translation: "Indeed, Safa and Marwah are among the symbols of Allah. I begin with what Allah began with.",
    reference: { ar: "سورة البقرة / حديث عائشة", en: "Al-Baqarah / Hadith of Aisha" },
  },
  {
    id: "arafah-dua",
    occasion: { ar: "أفضل دعاء يوم عرفة", en: "Best supplication on the Day of Arafah" },
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallah wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shayin qadir.",
    translation: "There is no deity except Allah alone, without partner. His is the dominion and praise, and He is over all things capable.",
    reference: { ar: "حديث الترمذي", en: "Hadith in Tirmidhi" },
  },
  {
    id: "stoning",
    occasion: { ar: "عند رمي الجمرات", en: "While stoning the Jamarat" },
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar.",
    translation: "Allah is the Greatest.",
    reference: { ar: "فعل النبي صلى الله عليه وسلم", en: "Practice of the Prophet peace be upon him" },
  },
  {
    id: "slaughter",
    occasion: { ar: "عند ذبح الهدي", en: "When slaughtering the offering" },
    arabic: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ، اللَّهُمَّ مِنْكَ وَلَك، تَقَبَّلْ مِنِّي",
    transliteration: "Bismillah, Allahu Akbar, Allahumma minka wa lak, taqabbal minni.",
    translation: "In the name of Allah, Allah is the Greatest. O Allah, this is from You and for You; accept it from me.",
    reference: { ar: "مأثور في الأضحية والنسك", en: "Reported for sacrifice and offering" },
  },
];

// ============================================================
// أخطاء شائعة
// ============================================================

const MISTAKES: GuideMistake[] = [
  {
    id: "miqat-mistake",
    title: { ar: "تجاوز الميقات بدون إحرام", en: "Passing the miqat without entering ihram" },
    explanation: {
      ar: "يجب الإحرام من الميقات المحدد، ومن تجاوزه بلا إحرام فعليه دم أو توبة حسب الحال، فينبغي معرفة الميقات قبل السفر.",
      en: "Ihram must be entered at the designated miqat. Passing it without ihram requires a penalty or repentance depending on the case, so the miqat should be known before travel.",
    },
  },
  {
    id: "crowding-mistake",
    title: { ar: "الازدحام والأذى عند الحجر الأسود", en: "Crowding and harming others at the Black Stone" },
    explanation: {
      ar: "استلام الحجر سنة، ولا يجوز إيذاء المسلمين من أجله، ويكفي الإشارة والتكبير.",
      en: "Touching the Black Stone is Sunnah, and it is not permissible to harm Muslims for its sake. Pointing and saying Allahu Akbar is sufficient.",
    },
  },
  {
    id: "fixed-dua-mistake",
    title: { ar: "اعتقاد أدعية محدودة لكل شوط", en: "Believing there are fixed supplications for every round" },
    explanation: {
      ar: "لم يثبت لكل شوط دعاء مخصوص، فيجوز الدعاء بما تيسر من القرآن والسنة، مع اجتناب البدع.",
      en: "No fixed dua has been authentically reported for each round. One may supplicate with Quran and Sunnah, avoiding innovations.",
    },
  },
  {
    id: "arafah-leaving-early",
    title: { ar: "الخروج من عرفة قبل الغروب", en: "Leaving Arafah before sunset" },
    explanation: {
      ar: "الوقوف بعرفة يستمر إلى ما بعد غروب الشمس يوم التاسع، والخروج قبل ذلك قد يؤثر على صحة الحج.",
      en: "Standing at Arafah continues until after sunset on the ninth. Leaving before that may affect the validity of Hajj.",
    },
  },
  {
    id: "stoning-mistake",
    title: { ar: "الرمي قبل الزوال في أيام التشريق", en: "Stoning before the sun passes its zenith during Tashreeq days" },
    explanation: {
      ar: "رمي الجمرات في أيام التشريق يكون بعد الزوال، ولا يصح تقديمه على وقته عند جمهور العلماء.",
      en: "Stoning during the Days of Tashreeq occurs after zawal, and advancing it before its time is not valid according to the majority.",
    },
  },
  {
    id: "farewell-mistake",
    title: { ar: "السفر بدون طواف الوداع", en: "Departing without farewell tawaf" },
    explanation: {
      ar: "طواف الوداع واجب عند جمهور العلماء عند السفر، ويسقط عن الحائض والنفساء.",
      en: "Farewell tawaf is obligatory according to the majority when departing, and is waived for menstruating and postpartum women.",
    },
  },
  {
    id: "sin-in-ihram",
    title: { ar: "الغفلة عن محظورات الإحرام", en: "Negligence regarding ihram prohibitions" },
    explanation: {
      ar: "الإحرام ليس مجرد ملابس، بل هو دخول في عبادة لها أحكام، فيجب تجنب الطيب وقص الشعر وتقليم الأظافر والصيد وما أشبه ذلك.",
      en: "Ihram is not merely clothing; it is entering an act of worship with rulings. Perfume, cutting hair, trimming nails, hunting, and similar acts must be avoided.",
    },
  },
  {
    id: "innovation-mistake",
    title: { ar: "إحداث أذكار أو أفعال لم ترد", en: "Introducing unreported dhikr or actions" },
    explanation: {
      ar: "الحج عبادة توقيفية، فلا يُضاف فيها ما لم يرد عن النبي صلى الله عليه وسلم، كالاحتفال بموالد في المشاعر أو أدعية جماعية مبتدعة.",
      en: "Hajj is a ritual worship based on revelation, so nothing should be added that was not reported from the Prophet peace be upon him, such as celebrations or innovated congregational supplications at the rites.",
    },
  },
];

// ============================================================
// checklist
// ============================================================

const CHECKLIST_BEFORE: GuideChecklistItem[] = [
  { id: "docs", text: { ar: "تجهيز الجواز، التأشيرة، التأمين، وتذاكر السفر.", en: "Prepare passport, visa, insurance, and travel tickets." } },
  { id: "learning", text: { ar: "تعلّم مناسك الحج أو العمرة من مصدر معتبر.", en: "Learn the rites of Hajj or Umrah from a reliable source." } },
  { id: "ihram-clothes", text: { ar: "تجهيز ملابس الإحرام للرجال، وملابس محتشمة للنساء.", en: "Prepare ihram garments for men and modest clothing for women." } },
  { id: "comfort", text: { ar: "أحذية مريحة، نظارة طبية، أدوية شخصية، ومستلزمات الطقس.", en: "Comfortable shoes, prescription glasses, personal medications, and weather supplies." } },
  { id: "money", text: { ar: "تجهيز المال الكافي، مع بطاقات دفع احتياطية.", en: "Prepare sufficient money, with backup payment cards." } },
  { id: "offline", text: { ar: "تنزيل خرائط، أدعية، وقرآن أوفلاين.", en: "Download maps, supplications, and offline Quran." } },
];

const CHECKLIST_DURING: GuideChecklistItem[] = [
  { id: "intention", text: { ar: "استحضار النية والإخلاص، وأن النسك عبادة لا رحلة سياحية.", en: "Renew intention and sincerity, remembering that the rites are worship, not tourism." } },
  { id: "patience", text: { ar: "الصبر على الزحام، وترك الجدال والمخاصمة.", en: "Be patient with crowds and avoid argument and quarreling." } },
  { id: "dhikr", text: { ar: "المحافظة على التلبية والذكر في التنقلات.", en: "Maintain talbiyah and dhikr during movements." } },
  { id: "prayers", text: { ar: "المحافظة على الصلوات في وقتها، وخاصة الفجر.", en: "Pray on time, especially Fajr." } },
  { id: "water", text: { ar: "شرب الماء باستمرار وتجنب الإجهاد.", en: "Drink water regularly and avoid exhaustion." } },
  { id: "follow-guide", text: { ar: "الالتزام بتعليمات المرشد أو الجهة المنظمة، وعدم المخاطرة.", en: "Follow the guide or organizer instructions and avoid recklessness." } },
];

// ============================================================
// Metadata
// ============================================================

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
      canonical: `/${l}/hajj-guide`,
      languages: {
        ar: "/ar/hajj-guide",
        en: "/en/hajj-guide",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/hajj-guide`,
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

// ============================================================
// الصفحة
// ============================================================

export default async function HajjGuidePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  // JSON-LD: HowTo + Article + FAQ
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: ui.title,
        description: ui.description,
        inLanguage: l,
        url: `/${l}/hajj-guide`,
        articleSection: isRTL ? "العبادات" : "Worship",
        keywords: isRTL
          ? "الحج, العمرة, المناسك, الأدعية, مكة, عرفة"
          : "Hajj, Umrah, rites, supplications, Makkah, Arafah",
      },
      {
        "@type": "HowTo",
        name: ui.hajjTitle,
        description: ui.hajjDesc,
        inLanguage: l,
        step: HAJJ_STEPS.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: isRTL ? step.title.ar : step.title.en,
          text: isRTL ? step.summary.ar : step.summary.en,
        })),
      },
      {
        "@type": "HowTo",
        name: ui.umrahTitle,
        description: ui.umrahDesc,
        inLanguage: l,
        step: UMRAH_STEPS.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: isRTL ? step.title.ar : step.title.en,
          text: isRTL ? step.summary.ar : step.summary.en,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: MISTAKES.map((m) => ({
          "@type": "Question",
          name: isRTL ? m.title.ar : m.title.en,
          acceptedAnswer: {
            "@type": "Answer",
            text: isRTL ? m.explanation.ar : m.explanation.en,
          },
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
                  <path d="M12 2L2 12h3v8h14v-8h3L12 2zm0 2.84L18.16 11H17v8H7v-8H5.84L12 4.84z" />
                  <path d="M12 6L8 10h8L12 6z" fill="#d4af37" />
                </svg>
              </span>
            </div>

            <span className="badge-gold mb-5">
              🕋 {isRTL ? "مناسك الحج والعمرة" : "Hajj & Umrah Rites"}
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
          </div>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="🕋" label={ui.hajjStepsCount} value={HAJJ_STEPS.length} color="primary" />
          <StatCard icon="🧳" label={ui.umrahStepsCount} value={UMRAH_STEPS.length} color="gold" />
          <StatCard icon="🤲" label={ui.duasCount} value={DUAS.length} color="primary" />
          <StatCard icon="⚠️" label={ui.mistakesCount} value={MISTAKES.length} color="gold" />
        </div>

        {/* ===== مقدمة ===== */}
        <div className="card mb-8 overflow-hidden">
          <div className="gradient-primary h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <h2
              className="mb-4 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🌙 {ui.introTitle}
            </h2>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.introDesc}
            </p>
          </div>
        </div>

        {/* ===== تنقل سريع ===== */}
        <div className="card mb-8 p-6 md:p-7">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {ui.quickNav}
          </h2>

          <div className="flex flex-wrap gap-3">
            <a href="#hajj" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300">
              🕋 {ui.hajjTitle}
            </a>
            <a href="#umrah" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300">
              🧳 {ui.umrahTitle}
            </a>
            <a href="#duas" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300">
              🤲 {ui.duasTitle}
            </a>
            <a href="#mistakes" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300">
              ⚠️ {ui.mistakesTitle}
            </a>
            <a href="#checklist" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300">
              ✅ {ui.checklistTitle}
            </a>
          </div>
        </div>

        {/* ===== خطوات الحج ===== */}
        <div id="hajj" className="mb-12 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.hajjTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.hajjDesc}</p>
          </div>

          <div className="space-y-4">
            {HAJJ_STEPS.map((step, index) => {
              const details = isRTL ? step.details.ar : step.details.en;

              return (
                <details
                  key={step.id}
                  id={step.id}
                  className="card group scroll-mt-32 p-6 md:p-7"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                    <div className="flex min-w-0 items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                        {step.icon}
                      </span>

                      <div className="min-w-0">
                        <span className="badge-primary mb-2">
                          {ui.step} {index + 1}
                        </span>

                        <h3
                          className="text-lg font-black leading-relaxed text-slate-900 md:text-xl dark:text-white"
                          style={{ fontFamily: "var(--font-amiri)" }}
                        >
                          {isRTL ? step.title.ar : step.title.en}
                        </h3>

                        <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                          {isRTL ? step.summary.ar : step.summary.en}
                        </p>
                      </div>
                    </div>

                    <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-transform duration-300 group-open:rotate-45 dark:bg-primary-900/40 dark:text-primary-300">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                  </summary>

                  <div className="mt-5 border-t border-slate-100 pt-5 dark:border-night-700">
                    <p className="mb-3 text-sm font-black text-slate-900 dark:text-white">
                      {ui.details}
                    </p>

                    <ol className="space-y-3">
                      {details.map((detail, detailIndex) => (
                        <li
                          key={`${step.id}-${detailIndex}`}
                          className="flex items-start gap-3 leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                          <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                            {detailIndex + 1}
                          </span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ol>

                    {step.note && (
                      <div className="mt-5 rounded-xl border border-gold-200 bg-gold-50/60 p-4 dark:border-gold-900/30 dark:bg-gold-950/15">
                        <p className="mb-1 text-xs font-black text-gold-700 dark:text-gold-300">
                          {ui.note}
                        </p>
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                          {isRTL ? step.note.ar : step.note.en}
                        </p>
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        {/* ===== خطوات العمرة ===== */}
        <div id="umrah" className="mb-12 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.umrahTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.umrahDesc}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {UMRAH_STEPS.map((step, index) => {
              const details = isRTL ? step.details.ar : step.details.en;

              return (
                <details
                  key={step.id}
                  id={step.id}
                  className="card group scroll-mt-32 p-6 md:p-7"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                    <div className="flex min-w-0 items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                        {step.icon}
                      </span>

                      <div className="min-w-0">
                        <span className="badge-primary mb-2">
                          {ui.step} {index + 1}
                        </span>

                        <h3 className="text-lg font-black leading-relaxed text-slate-900 dark:text-white">
                          {isRTL ? step.title.ar : step.title.en}
                        </h3>

                        <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                          {isRTL ? step.summary.ar : step.summary.en}
                        </p>
                      </div>
                    </div>

                    <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-transform duration-300 group-open:rotate-45 dark:bg-primary-900/40 dark:text-primary-300">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                  </summary>

                  <div className="mt-5 border-t border-slate-100 pt-5 dark:border-night-700">
                    <ul className="space-y-2">
                      {details.map((detail, detailIndex) => (
                        <li
                          key={`${step.id}-${detailIndex}`}
                          className="flex items-start gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              );
            })}
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

          <div className="grid gap-5 lg:grid-cols-2">
            {DUAS.map((dua) => (
              <article
                key={dua.id}
                className="card relative overflow-hidden p-6 md:p-7"
              >
                <div className="gradient-gold absolute inset-x-0 top-0 h-1" />

                <div className="mb-4 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-black leading-relaxed text-slate-900 dark:text-white">
                    {isRTL ? dua.occasion.ar : dua.occasion.en}
                  </h3>

                  {dua.reference && (
                    <span className="badge-primary shrink-0 text-xs">
                      {isRTL ? dua.reference.ar : dua.reference.en}
                    </span>
                  )}
                </div>

                <p
                  className="quran-text mb-5 text-2xl leading-[2.2] md:text-3xl"
                  style={{ fontFamily: "var(--font-quran)" }}
                >
                  {dua.arabic}
                </p>

                {dua.transliteration && !isRTL && (
                  <p className="mb-4 text-sm italic leading-relaxed text-slate-500 dark:text-slate-400">
                    {dua.transliteration}
                  </p>
                )}

                {dua.translation && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40">
                    <p className="mb-1 text-xs font-black text-slate-500 dark:text-slate-400">
                      {ui.translation}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {dua.translation}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* ===== الأخطاء الشائعة ===== */}
        <div id="mistakes" className="mb-12 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.mistakesTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.mistakesDesc}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {MISTAKES.map((mistake) => (
              <article
                key={mistake.id}
                className="card border-red-200 p-6 dark:border-red-900/30"
              >
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl dark:bg-red-900/30">
                    ⚠️
                  </span>

                  <h3 className="text-lg font-black leading-relaxed text-slate-900 dark:text-white">
                    {isRTL ? mistake.title.ar : mistake.title.en}
                  </h3>
                </div>

                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {isRTL ? mistake.explanation.ar : mistake.explanation.en}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* ===== checklist ===== */}
        <div id="checklist" className="mb-12 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.checklistTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.checklistDesc}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6 md:p-7">
              <h3 className="mb-5 text-xl font-black text-slate-900 dark:text-white">
                🧳 {ui.beforeTravel}
              </h3>

              <ul className="space-y-3">
                {CHECKLIST_BEFORE.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40"
                  >
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                      ✓
                    </span>
                    <p className="leading-relaxed text-slate-700 dark:text-slate-200">
                      {isRTL ? item.text.ar : item.text.en}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6 md:p-7">
              <h3 className="mb-5 text-xl font-black text-slate-900 dark:text-white">
                🕋 {ui.duringRites}
              </h3>

              <ul className="space-y-3">
                {CHECKLIST_DURING.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40"
                  >
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-100 text-xs font-black text-gold-700 dark:bg-gold-900/30 dark:text-gold-300">
                      ✓
                    </span>
                    <p className="leading-relaxed text-slate-700 dark:text-slate-200">
                      {isRTL ? item.text.ar : item.text.en}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
            <Link href={`/${l}/calendar`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">📅</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.calendarPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.calendarPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/prayer-times`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🕐</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.prayerPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.prayerPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/qibla`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🧭</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.qiblaPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.qiblaPageDesc}
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
          </div>
        </div>

        {/* ===== تنبيه مهم ===== */}
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              📌
            </span>

            <div>
              <h3
                className="mb-3 text-xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.importantNoteTitle}
              </h3>

              <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.importantNote1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.importantNote2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.importantNote3}</span>
                </li>
              </ul>
            </div>
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