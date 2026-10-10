// app/[lang]/dawah-guide/page.tsx
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

type Principle = {
  id: string;
  icon: string;
  title: Localized;
  description: Localized;
  practical: Localized[];
};

type DawahStep = {
  id: string;
  title: Localized;
  summary: Localized;
  actions: Localized[];
  tip?: Localized;
};

type Skill = {
  id: string;
  icon: string;
  title: Localized;
  description: Localized;
  howToDevelop: Localized[];
};

type CommonMistake = {
  id: string;
  title: Localized;
  whyBad: Localized;
  instead: Localized;
};

type ChecklistItem = {
  id: string;
  text: Localized;
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
    quickNav: string;
    principlesTitle: string;
    principlesDesc: string;
    stepsTitle: string;
    stepsDesc: string;
    skillsTitle: string;
    skillsDesc: string;
    mistakesTitle: string;
    mistakesDesc: string;
    checklistTitle: string;
    checklistDesc: string;
    practical: string;
    step: string;
    actions: string;
    tip: string;
    howToDevelop: string;
    whyBad: string;
    instead: string;
    noteTitle: string;
    note1: string;
    note2: string;
    note3: string;
    contact: string;
    fatwa: string;
    prayerTimes: string;
    qibla: string;
    verse: string;
    verseSource: string;
    principlesCount: string;
    stepsCount: string;
    skillsCount: string;
    mistakesCount: string;
    checklistCount: string;
    introTitle: string;
    introDesc: string;
    relatedTitle: string;
    atheismPage: string;
    atheismPageDesc: string;
    doubtsPage: string;
    doubtsPageDesc: string;
    articlesPage: string;
    articlesPageDesc: string;
    fieldsPage: string;
    fieldsPageDesc: string;
  }
> = {
  ar: {
    title: "دليل الدعوة",
    subtitle: "كيف تكون داعية ناجحًا بعلم وحكمة ورفق",
    home: "الرئيسية",
    description:
      "دليل عملي للدعوة إلى الله، يوضح الأصول، والخطوات، والمهارات، والأخطاء الشائعة، وقائمة تحضير تساعد الداعية المبتدئ والمتوسط.",
    quickNav: "تنقل سريع",
    principlesTitle: "أصول الدعوة",
    principlesDesc:
      "الدعوة الناجحة تقوم على أسس شرعية ومنهجية، لا على الحماس وحده.",
    stepsTitle: "خطوات عملية",
    stepsDesc:
      "ترتيب مبسط يساعدك على بدء الدعوة، والتعامل مع الناس، ومتابعة الثمرات.",
    skillsTitle: "مهارات الداعية",
    skillsDesc:
      "مهارات تحتاجها لتوصل الرسالة بوضوح، وتكسب ثقة المستمع، وتقلل المقاومة.",
    mistakesTitle: "أخطاء شائعة",
    mistakesDesc:
      "أخطاء يقع فيها كثير من الدعاة، والابتعاد عنها يعين على قبول الدعوة.",
    checklistTitle: "قائمة تحضير",
    checklistDesc:
      "أمور عملية تجهزها قبل أي لقاء دعوي أو محاضرة أو حوار.",
    practical: "تطبيقات عملية",
    step: "خطوة",
    actions: "ما الذي تفعله؟",
    tip: "نصيحة",
    howToDevelop: "كيف تطورها؟",
    whyBad: "لماذا هي خطأ؟",
    instead: "البديل الصحيح",
    noteTitle: "تنبيه مهم",
    note1:
      "الدعوة تحتاج علمًا قبل كلام، وحكمة قبل إلحاح، ورفق قبل شدة.",
    note2:
      "هذا الدليل للتأصيل والتبسيط، ولا يغني عن طلب العلم على أهل الاختصاص.",
    note3:
      "ليس كل من تحدث في الدين داعية؛ فقد يكون متعالمًا أو مجادلًا أو مفسدًا.",
    contact: "تواصل معنا",
    fatwa: "الفتاوى",
    prayerTimes: "مواقيت الصلاة",
    qibla: "اتجاه القبلة",
    verse: "﴿ ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ ﴾",
    verseSource: "سورة النحل — الآية 125",
    principlesCount: "أصول",
    stepsCount: "خطوات",
    skillsCount: "مهارات",
    mistakesCount: "أخطاء",
    checklistCount: "عنصر تحضير",
    introTitle: "لماذا دليل الدعوة؟",
    introDesc:
      "الدعوة إلى الله أشرف المهام، لكنها تحتاج تأصيلاً ومنهجية. هذا الدليل يجمع أهم الأصول والخطوات والمهارات التي يحتاجها كل داعية، سواء كان مبتدئًا أو متوسط الخبرة، ليكون عطاؤه أنفع وأثره أبقى.",
    relatedTitle: "صفحات ذات صلة",
    atheismPage: "الرد على الإلحاد",
    atheismPageDesc: "الرد على الشبهات الإلحادية بالعقل والنقل.",
    doubtsPage: "الشبهات والردود",
    doubtsPageDesc: "شبهات شائعة وإجابات مبسطة.",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات دعوية وتربوية.",
    fieldsPage: "المجالات الدعوية",
    fieldsPageDesc: "17 مجالاً شرعياً متنوعاً.",
  },
  en: {
    title: "Dawah Guide",
    subtitle: "How to be an effective caller to Allah with knowledge, wisdom, and gentleness",
    home: "Home",
    description:
      "A practical dawah guide explaining principles, steps, skills, common mistakes, and a preparation checklist for beginner and intermediate da'ees.",
    quickNav: "Quick navigation",
    principlesTitle: "Dawah Principles",
    principlesDesc:
      "Successful dawah is built on Islamic and methodological foundations, not enthusiasm alone.",
    stepsTitle: "Practical Steps",
    stepsDesc:
      "A simple sequence that helps you begin dawah, interact with people, and follow up on results.",
    skillsTitle: "Da'ee Skills",
    skillsDesc:
      "Skills you need to deliver the message clearly, gain trust, and reduce resistance.",
    mistakesTitle: "Common Mistakes",
    mistakesDesc:
      "Mistakes many callers fall into. Avoiding them helps the message be accepted.",
    checklistTitle: "Preparation Checklist",
    checklistDesc:
      "Practical items to prepare before any dawah meeting, lecture, or dialogue.",
    practical: "Practical applications",
    step: "Step",
    actions: "What should you do?",
    tip: "Tip",
    howToDevelop: "How to develop it?",
    whyBad: "Why is it wrong?",
    instead: "Correct alternative",
    noteTitle: "Important notice",
    note1:
      "Dawah requires knowledge before speech, wisdom before pressure, and gentleness before harshness.",
    note2:
      "This guide is for simplification and orientation. It does not replace learning from qualified scholars.",
    note3:
      "Not everyone who speaks about religion is a true da'ee; some are merely argumentative or harmful.",
    contact: "Contact Us",
    fatwa: "Fatwas",
    prayerTimes: "Prayer Times",
    qibla: "Qibla",
    verse: "\"Invite to the way of your Lord with wisdom and good instruction.\"",
    verseSource: "Surah An-Nahl — Verse 125",
    principlesCount: "Principles",
    stepsCount: "Steps",
    skillsCount: "Skills",
    mistakesCount: "Mistakes",
    checklistCount: "Checklist Items",
    introTitle: "Why a Dawah Guide?",
    introDesc:
      "Calling to Allah is the noblest of tasks, but it requires foundation and methodology. This guide gathers the most important principles, steps, and skills every da'ee needs, whether beginner or intermediate, to make their contribution more beneficial and their impact more lasting.",
    relatedTitle: "Related Pages",
    atheismPage: "Responding to Atheism",
    atheismPageDesc: "Answering atheist doubts with reason and revelation.",
    doubtsPage: "Doubts and Responses",
    doubtsPageDesc: "Common doubts with concise answers.",
    articlesPage: "Articles",
    articlesPageDesc: "Dawah and educational articles.",
    fieldsPage: "Dawah Fields",
    fieldsPageDesc: "17 diverse Islamic fields.",
  },
};

// ============================================================
// أصول الدعوة
// ============================================================

const PRINCIPLES: Principle[] = [
  {
    id: "ikhlas",
    icon: "❤️",
    title: { ar: "الإخلاص", en: "Sincerity" },
    description: {
      ar: "أن تكون نيتك في الدعوة وجه الله، لا الشهرة ولا الجدل ولا إثبات الذات.",
      en: "Your intention in dawah should be for Allah alone, not fame, argument, or ego.",
    },
    practical: [
      { ar: "جدد نيتك قبل كل لقاء دعوي.", en: "Renew your intention before every dawah encounter." },
      { ar: "لا تجعل ردود الناس مقياسًا لقبولك أو رفضك.", en: "Do not make people's reactions the measure of your acceptance or rejection." },
      { ar: "اسأل الله القبول، وأحسن الظن به.", en: "Ask Allah for acceptance and have good expectation of Him." },
    ],
  },
  {
    id: "ilm",
    icon: "📚",
    title: { ar: "العلم قبل الكلام", en: "Knowledge Before Speech" },
    description: {
      ar: "الداعية يحتاج أن يعرف ما يقول، ودليله، وموضع التطبيق، وحدود المسألة.",
      en: "A da'ee needs to know what he says, its evidence, its application, and the limits of the issue.",
    },
    practical: [
      { ar: "لا تتكلم في مسألة إلا بعد مراجعتها في مصدر معتبر.", en: "Do not speak about an issue except after checking it in a reliable source." },
      { ar: "احفظ الأدلة الأساسية: التوحيد، الصلاة، الصيام، الأخلاق.", en: "Memorize core evidences: tawhid, prayer, fasting, and manners." },
      { ar: "إذا سُئلت عما لا تعلم، قل: الله أعلم.", en: "If asked about what you do not know, say: Allah knows best." },
    ],
  },
  {
    id: "hikmah",
    icon: "🧠",
    title: { ar: "الحكمة ومراعاة الحال", en: "Wisdom and Context" },
    description: {
      ar: "الناس يختلفون: جاهل، ومستعلم، ومعاند، ومحتاج، ومبتلى؛ فراعِ المقام والأشخاص.",
      en: "People differ: ignorant, seeking, stubborn, needy, or afflicted; consider context and persons.",
    },
    practical: [
      { ar: "ابدأ بالأسهل والأهم قبل التفاصيل الخلافية.", en: "Begin with the easiest and most important before detailed disagreements." },
      { ar: "استخدم السؤال بدل التقرير أحيانًا.", en: "Use questions instead of statements sometimes." },
      { ar: "لا تحمل الناس فوق طاقتهم.", en: "Do not burden people beyond their capacity." },
    ],
  },
  {
    id: "rifq",
    icon: "🤝",
    title: { ar: "الرفق واللين", en: "Gentleness" },
    description: {
      ar: "الرفق لا يفسد الدعوة، بل يفتح القلوب؛ والخشونة قد تغلق بابًا كان يمكن أن يفتح.",
      en: "Gentleness does not spoil dawah; it opens hearts. Harshness may close a door that could have opened.",
    },
    practical: [
      { ar: "ابدأ بالسلام وحسن الخلق.", en: "Begin with greeting and good manners." },
      { ar: "ابتعد عن السخرية والتصويب الجارح.", en: "Avoid mockery and hurtful correction." },
      { ar: "افصل بين الخطأ والشخص.", en: "Separate the mistake from the person." },
    ],
  },
  {
    id: "tathabbut",
    icon: "⚖️",
    title: { ar: "التثبت والأمانة", en: "Verification and Trustworthiness" },
    description: {
      ar: "لا تنقل معلومة دينية أو خبرًا قبل التحقق، لأن الكذب على الله ورسوله عظيم.",
      en: "Do not transmit religious information or news before verifying, because lying about Allah and His Messenger is grave.",
    },
    practical: [
      { ar: "تحقق من المصدر قبل النشر.", en: "Verify the source before sharing." },
      { ar: "لا تستخدم ضعيف الحديث في العقائد والعبادات بلا بيان.", en: "Do not use weak hadith in creed or worship without clarification." },
      { ar: "اعترف بالخطأ إن وقعت فيه.", en: "Admit mistakes if you make them." },
    ],
  },
  {
    id: "istiqamah",
    icon: "🌱",
    title: { ar: "الاستمرارية", en: "Consistency" },
    description: {
      ar: "الدعوة ليست خطبة واحدة أو منشورًا واحدًا، بل مسار طويل من الصبر والمتابعة.",
      en: "Dawah is not one sermon or one post; it is a long path of patience and follow-up.",
    },
    practical: [
      { ar: "اجعل لك وردًا دعويًا أسبوعيًا.", en: "Have a weekly dawah routine." },
      { ar: "تابع من أظهر اهتمامًا ولو برسالة قصيرة.", en: "Follow up with anyone showing interest, even with a short message." },
      { ar: "لا تيأس من بطء الثمرة.", en: "Do not despair from slow results." },
    ],
  },
];

// ============================================================
// خطوات عملية
// ============================================================

const DAWAH_STEPS: DawahStep[] = [
  {
    id: "prepare-self",
    title: { ar: "جهّز نفسك أولًا", en: "Prepare Yourself First" },
    summary: {
      ar: "قبل أن تدعو غيرك، راجع علاقتك بالله، وحافظ على الفرائض والأذكار.",
      en: "Before calling others, review your relationship with Allah and maintain obligations and adhkar.",
    },
    actions: [
      { ar: "حافظ على الصلوات في وقتها.", en: "Pray on time." },
      { ar: "اقرأ وردك من القرآن.", en: "Read your Quran portion." },
      { ar: "ادعُ الله أن يفتح لك قلوبًا نافذة.", en: "Ask Allah to open receptive hearts for you." },
    ],
    tip: {
      ar: "الداعية الذي لا يعيش ما يدعو إليه يفقد مصداقيته بسرعة.",
      en: "A da'ee who does not live what he calls to quickly loses credibility.",
    },
  },
  {
    id: "know-audience",
    title: { ar: "اعرف مخاطبك", en: "Know Your Audience" },
    summary: {
      ar: "هل هو مسلم جديد؟ طالب علم؟ بعيد عن الدين؟ غاضب؟ ساخر؟ محتاج؟",
      en: "Is he a new Muslim? A student of knowledge? Far from religion? Angry? Mocking? Needy?",
    },
    actions: [
      { ar: "اسأل أسئلة مفتوحة لتعرف مستواه.", en: "Ask open questions to understand his level." },
      { ar: "حدد حاجته: معلومة، طمأنة، حل مشكلة، أو توجيه.", en: "Identify his need: information, reassurance, solution, or guidance." },
      { ar: "لا تبدأ بما لا يخصه.", en: "Do not begin with what does not concern him." },
    ],
  },
  {
    id: "start-essentials",
    title: { ar: "ابدأ بالأصول المهمة", en: "Start With Essentials" },
    summary: {
      ar: "التوحيد، معنى الشهادة، الصلاة، الأخلاق، ثم ما يحتاجه حسب حاله.",
      en: "Tawhid, meaning of shahadah, prayer, manners, then what he needs according to his state.",
    },
    actions: [
      { ar: "اشرح لا إله إلا الله ببساطة ودليل.", en: "Explain La ilaha illallah simply and with evidence." },
      { ar: "اربط العبادة بالرحمة والهداية.", en: "Connect worship to mercy and guidance." },
      { ar: "تجنب التفاصيل الخلافية في البداية.", en: "Avoid detailed disagreements at first." },
    ],
    tip: {
      ar: "أول ما يُدعى إليه هو التوحيد، ثم ما يحتاجه الشخص.",
      en: "The first thing to call to is tawhid, then what the person needs.",
    },
  },
  {
    id: "use-evidence",
    title: { ar: "استخدم الدليل المناسب", en: "Use Appropriate Evidence" },
    summary: {
      ar: "القرآن والسنة هما الأساس، لكن اختر النص المناسب للمقام.",
      en: "The Quran and Sunnah are the basis, but choose the text suitable for the context.",
    },
    actions: [
      { ar: "اقرأ الآية أو الحديث بتأنيه.", en: "Read the verse or hadith slowly." },
      { ar: "اشرح المعنى بلغة واضحة.", en: "Explain the meaning in clear language." },
      { ar: "اذكر المصدر حتى يثق السامع.", en: "Mention the source so the listener trusts you." },
    ],
  },
  {
    id: "answer-questions",
    title: { ar: "أجب عن الأسئلة بصبر", en: "Answer Questions Patiently" },
    summary: {
      ar: "الأسئلة ليست عدوانًا دائمًا، بل قد تكون بداية فهم حقيقي.",
      en: "Questions are not always aggression; they may be the start of real understanding.",
    },
    actions: [
      { ar: "لا تستعجل في الرد.", en: "Do not rush your answer." },
      { ar: "إذا لم تعرف، قل: سأتحقق وأرد عليك.", en: "If you do not know, say: I will verify and reply." },
      { ar: "حوّل السؤال الثقيل إلى فرصة للتعلم.", en: "Turn difficult questions into learning opportunities." },
    ],
  },
  {
    id: "follow-up",
    title: { ar: "تابع ولا تختفِ", en: "Follow Up, Do Not Disappear" },
    summary: {
      ar: "كثير من الناس يحتاجون متابعة لطيفة بعد أول لقاء.",
      en: "Many people need gentle follow-up after the first meeting.",
    },
    actions: [
      { ar: "أرسل رسالة شكر أو تذكير.", en: "Send a thank-you or reminder message." },
      { ar: "اقترح مصدرًا بسيطًا للمتابعة.", en: "Suggest a simple resource for follow-up." },
      { ar: "اسأل عن حاله بعد أسبوع.", en: "Ask about his condition after a week." },
    ],
    tip: {
      ar: "المتابعة أحيانًا أهم من الكلمة الأولى.",
      en: "Follow-up is sometimes more important than the first word.",
    },
  },
  {
    id: "make-dua",
    title: { ar: "ادعُ للمدعو", en: "Supplicate for the Person" },
    summary: {
      ar: "القلوب بيد الله، فالدعاء سلاح الداعية الخفي.",
      en: "Hearts are in Allah's hand, so supplication is the da'ee's hidden weapon.",
    },
    actions: [
      { ar: "ادعُ له بالهداية والثبات.", en: "Pray for his guidance and steadfastness." },
      { ar: "اذكره في سجودك.", en: "Mention him in your sujud." },
      { ar: "لا تجعل الدعاء آخر خطوة، بل أولها.", en: "Do not make du'a the last step; make it the first." },
    ],
  },
  {
    id: "document-improve",
    title: { ar: "وثّق وطوّر", en: "Document and Improve" },
    summary: {
      ar: "سجل ما نجح وما فشل، واسأل نفسك: كيف أكون أفضل في المرة القادمة؟",
      en: "Record what worked and what did not, and ask yourself: how can I be better next time?",
    },
    actions: [
      { ar: "اكتب ملاحظات مختصرة بعد اللقاء.", en: "Write brief notes after the meeting." },
      { ar: "راجع أخطاءك الشائعة.", en: "Review your common mistakes." },
      { ar: "استشر من هو أعلم منك.", en: "Consult those more knowledgeable than you." },
    ],
  },
];

// ============================================================
// مهارات الداعية
// ============================================================

const SKILLS: Skill[] = [
  {
    id: "communication",
    icon: "🗣️",
    title: { ar: "التواصل الواضح", en: "Clear Communication" },
    description: {
      ar: "أن توصل المعنى بأقل الكلمات وأدقها، دون غموض أو تعالٍ.",
      en: "Delivering meaning with few but precise words, without ambiguity or arrogance.",
    },
    howToDevelop: [
      { ar: "تدرب على شرح فكرة في دقيقة واحدة.", en: "Practice explaining one idea in one minute." },
      { ar: "استخدم أمثلة من حياة الناس.", en: "Use examples from people's lives." },
      { ar: "قلل المصطلحات المعقدة.", en: "Reduce complex terminology." },
    ],
  },
  {
    id: "listening",
    icon: "👂",
    title: { ar: "الإنصات الفعال", en: "Active Listening" },
    description: {
      ar: "أن تسمع لتفهم، لا لترد فقط.",
      en: "Listening to understand, not merely to reply.",
    },
    howToDevelop: [
      { ar: "لا تقاطع المتحدث.", en: "Do not interrupt the speaker." },
      { ar: "لخص ما سمعته قبل الرد.", en: "Summarize what you heard before responding." },
      { ar: "اسأل: هل تقصد كذا؟", en: "Ask: Do you mean this?" },
    ],
  },
  {
    id: "storytelling",
    icon: "📖",
    title: { ar: "القصة والتأثير", en: "Storytelling and Impact" },
    description: {
      ar: "القصة تقرّب المعنى وتلامس القلب أكثر من المحاضرة الجافة.",
      en: "Stories bring meaning closer and touch the heart more than dry lectures.",
    },
    howToDevelop: [
      { ar: "احفظ قصص الأنبياء والصحابة.", en: "Memorize stories of prophets and companions." },
      { ar: "اربط القصة بالدرس.", en: "Connect the story to the lesson." },
      { ar: "لا تبالغ في التفاصيل.", en: "Do not exaggerate details." },
    ],
  },
  {
    id: "digital",
    icon: "💻",
    title: { ar: "الوعي الرقمي", en: "Digital Awareness" },
    description: {
      ar: "الدعوة اليوم تحتاج فهم المنصات، والخوارزميات، وثقافة الجمهور الإلكتروني.",
      en: "Dawah today requires understanding platforms, algorithms, and online audience culture.",
    },
    howToDevelop: [
      { ar: "تعلم أساسيات التصميم والمونتاج.", en: "Learn basics of design and editing." },
      { ar: "راقب ردود الفعل على منشوراتك.", en: "Monitor reactions to your posts." },
      { ar: "احفظ حقوق النشر والمصادر.", en: "Respect copyright and sources." },
    ],
  },
  {
    id: "emotional",
    icon: "💛",
    title: { ar: "الذكاء العاطفي", en: "Emotional Intelligence" },
    description: {
      ar: "أن تقرأ مشاعر الطرف الآخر، وتعرف متى تتكلم ومتى تصمت.",
      en: "Reading the other person's emotions and knowing when to speak and when to stay silent.",
    },
    howToDevelop: [
      { ar: "لاحظ لغة الجسد.", en: "Observe body language." },
      { ar: "لا ترد وقت الغضب.", en: "Do not respond while angry." },
      { ar: "اعتذر إذا أخطأت في التقدير.", en: "Apologize if you misread the situation." },
    ],
  },
  {
    id: "time",
    icon: "⏳",
    title: { ar: "إدارة الوقت", en: "Time Management" },
    description: {
      ar: "الدعوة تحتاج تنظيمًا حتى لا تتحول إلى ردود عشوائية مرهقة.",
      en: "Dawah needs organization so it does not become random exhausting replies.",
    },
    howToDevelop: [
      { ar: "حدد أوقاتًا للرد على الرسائل.", en: "Set specific times for replying to messages." },
      { ar: "أولِ الأسئلة المهمة.", en: "Prioritize important questions." },
      { ar: "استعن بفريق أو مساعد.", en: "Seek help from a team or assistant." },
    ],
  },
];

// ============================================================
// أخطاء شائعة
// ============================================================

const MISTAKES: CommonMistake[] = [
  {
    id: "arguing",
    title: { ar: "الجدال بغير علم", en: "Arguing Without Knowledge" },
    whyBad: { ar: "يغلق القلوب، ويحول الدعوة إلى سباق غلبة.", en: "It closes hearts and turns dawah into a contest of winning." },
    instead: { ar: "جادل بالتي هي أحسن، واسأل لتفهم لا لتفحم.", en: "Argue in the best way, and ask to understand, not to overpower." },
  },
  {
    id: "fatwa-without-knowledge",
    title: { ar: "الإفتاء بلا أهلية", en: "Giving Fatwa Without Qualification" },
    whyBad: { ar: "قد يضل الناس، ويحمل صاحبه وزر الفتوى بغير علم.", en: "It may mislead people, and its bearer carries the sin of ruling without knowledge." },
    instead: { ar: "قل: الله أعلم، أو حوّل السؤال لأهل العلم.", en: "Say: Allah knows best, or refer the question to qualified scholars." },
  },
  {
    id: "mockery",
    title: { ar: "السخرية من الناس", en: "Mocking People" },
    whyBad: { ar: "الاستهزاء ينفّر، وقد يمحو أثر الكلمة الطيبة.", en: "Mockery repels and may erase the effect of good words." },
    instead: { ar: "احترم الشخص ولو أخطأ، ووجّه بلا تجريح.", en: "Respect the person even if wrong, and guide without insulting." },
  },
  {
    id: "overload",
    title: { ar: "إثقال المستمع بالمعلومات", en: "Overloading the Listener" },
    whyBad: { ar: "الكثرة المشتتة قد تمنع الفهم والتطبيق.", en: "Scattered abundance may prevent understanding and application." },
    instead: { ar: "اختر نقطة واحدة واضحة وقابلة للتطبيق.", en: "Choose one clear, actionable point." },
  },
  {
    id: "weak-sources",
    title: { ar: "نقل أخبار ضعيفة أو موضوعة", en: "Transmitting Weak or Fabricated Reports" },
    whyBad: { ar: "يهدم الثقة، وقد يكون كذبًا على النبي صلى الله عليه وسلم.", en: "It destroys trust and may be lying about the Prophet peace be upon him." },
    instead: { ar: "تحقق من السند والمتن قبل النشر.", en: "Verify chain and text before sharing." },
  },
  {
    id: "no-followup",
    title: { ar: "البدء دون متابعة", en: "Starting Without Follow-up" },
    whyBad: { ar: "يترك الشخص في منتصف الطريق، وتضيع فرصة الهداية.", en: "It leaves the person halfway and wastes an opportunity for guidance." },
    instead: { ar: "ضع خطة متابعة بسيطة لكل مهتم.", en: "Create a simple follow-up plan for each interested person." },
  },
  {
    id: "comparison",
    title: { ar: "مقارنة الناس بالأنبياء والصالحين", en: "Comparing People to Prophets and Righteous" },
    whyBad: { ar: "يولد اليأس أو الرياء، ولا يراعي فرق الطاقات.", en: "It creates despair or showmanship and ignores differences in capacity." },
    instead: { ar: "شجع على الخطوة القادمة المناسبة له.", en: "Encourage the next suitable step for him." },
  },
  {
    id: "expect-results",
    title: { ar: "انتظار نتيجة فورية", en: "Expecting Immediate Results" },
    whyBad: { ar: "القلوب تحتاج وقتًا، والهداية بيد الله.", en: "Hearts need time, and guidance is with Allah." },
    instead: { ar: "اصبر، وادعُ، وواصل دون ضغط.", en: "Be patient, supplicate, and continue without pressure." },
  },
];

// ============================================================
// قائمة تحضير
// ============================================================

const CHECKLIST: ChecklistItem[] = [
  { id: "intention", text: { ar: "جدد النية: أريد وجه الله.", en: "Renew intention: I want Allah's face." } },
  { id: "references", text: { ar: "جهز الأدلة والمصادر التي ستحتاجها.", en: "Prepare evidences and sources you may need." } },
  { id: "time", text: { ar: "اختر وقتًا مناسبًا للطرف الآخر.", en: "Choose a suitable time for the other person." } },
  { id: "greeting", text: { ar: "ابدأ بالسلام وحسن اللقاء.", en: "Begin with greeting and good meeting." } },
  { id: "listen-first", text: { ar: "اسمع قبل أن تتكلم.", en: "Listen before speaking." } },
  { id: "one-point", text: { ar: "حدد رسالة واحدة واضحة.", en: "Define one clear message." } },
  { id: "examples", text: { ar: "استخدم مثالًا قريبًا من واقع الشخص.", en: "Use an example close to the person's reality." } },
  { id: "questions", text: { ar: "جهز أسئلة مفتوحة لفهم حاله.", en: "Prepare open questions to understand his state." } },
  { id: "duaa", text: { ar: "اختم بالدعاء والتشجيع.", en: "End with supplication and encouragement." } },
  { id: "followup-plan", text: { ar: "اتفق على خطوة متابعة بسيطة.", en: "Agree on a simple follow-up step." } },
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
      canonical: `/${l}/dawah-guide`,
      languages: { ar: "/ar/dawah-guide", en: "/en/dawah-guide" },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/dawah-guide`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "article",
      images: [{
        url: "/icons/icon-512.png",
        width: 512, height: 512, alt: ui.title,
      }],
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

export default async function DawahGuidePage({
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
        url: `/${l}/dawah-guide`,
        articleSection: isRTL ? "الدعوة" : "Dawah",
        keywords: isRTL
          ? "الدعوة, أصول الدعوة, مهارات الداعية, دليل الدعوة"
          : "dawah, dawah principles, da'ee skills, dawah guide",
      },
      {
        "@type": "HowTo",
        name: ui.title,
        description: ui.description,
        inLanguage: l,
        step: DAWAH_STEPS.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: isRTL ? step.title.ar : step.title.en,
          text: isRTL ? step.summary.ar : step.summary.en,
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
        <div className="card relative mb-8 overflow-hidden p-8 md:p-12">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">
              🤝 {isRTL ? "منهج الداعية" : "Da'ee Methodology"}
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
            <div className="mt-8 rounded-2xl border border-gold-200 bg-gold-50/60 p-5 dark:border-gold-900/30 dark:bg-gold-950/15">
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
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard icon="❤️" label={ui.principlesCount} value={PRINCIPLES.length} color="primary" />
          <StatCard icon="🧭" label={ui.stepsCount} value={DAWAH_STEPS.length} color="gold" />
          <StatCard icon="🛠️" label={ui.skillsCount} value={SKILLS.length} color="primary" />
          <StatCard icon="⚠️" label={ui.mistakesCount} value={MISTAKES.length} color="gold" />
          <StatCard icon="✅" label={ui.checklistCount} value={CHECKLIST.length} color="primary" />
        </div>

        {/* ===== مقدمة ===== */}
        <div className="card mb-8 overflow-hidden">
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

        {/* ===== تنقل سريع ===== */}
        <div className="card mb-8 p-6 md:p-7">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {ui.quickNav}
          </h2>

          <div className="flex flex-wrap gap-3">
            <QuickNavLink href="#principles" icon="❤️" label={ui.principlesTitle} />
            <QuickNavLink href="#steps" icon="🧭" label={ui.stepsTitle} />
            <QuickNavLink href="#skills" icon="🛠️" label={ui.skillsTitle} />
            <QuickNavLink href="#mistakes" icon="⚠️" label={ui.mistakesTitle} />
            <QuickNavLink href="#checklist" icon="✅" label={ui.checklistTitle} />
          </div>
        </div>

        {/* ===== أصول الدعوة ===== */}
        <div id="principles" className="mb-12 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.principlesTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.principlesDesc}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <article key={principle.id} className="card relative overflow-hidden p-6 md:p-7">
                <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

                <div className="mb-5 flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                    {principle.icon}
                  </span>

                  <div className="min-w-0">
                    <h3
                      className="text-xl font-black leading-relaxed text-slate-900 dark:text-white"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {isRTL ? principle.title.ar : principle.title.en}
                    </h3>

                    <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                      {isRTL ? principle.description.ar : principle.description.en}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-black text-primary-700 dark:text-primary-300">
                    {ui.practical}
                  </p>

                  <ul className="space-y-2">
                    {principle.practical.map((point, index) => (
                      <li key={`${principle.id}-${index}`} className="flex items-start gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                        <span>{isRTL ? point.ar : point.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ===== خطوات عملية ===== */}
        <div id="steps" className="mb-12 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.stepsTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.stepsDesc}</p>
          </div>

          <div className="space-y-4">
            {DAWAH_STEPS.map((step, index) => (
              <details key={step.id} id={step.id} className="card group scroll-mt-32 p-6 md:p-7">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-lg font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                      {index + 1}
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
                    {ui.actions}
                  </p>

                  <ol className="space-y-3">
                    {step.actions.map((action, actionIndex) => (
                      <li key={`${step.id}-${actionIndex}`} className="flex items-start gap-3 leading-relaxed text-slate-600 dark:text-slate-300">
                        <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                          {actionIndex + 1}
                        </span>
                        <span>{isRTL ? action.ar : action.en}</span>
                      </li>
                    ))}
                  </ol>

                  {step.tip && (
                    <div className="mt-5 rounded-xl border border-gold-200 bg-gold-50/60 p-4 dark:border-gold-900/30 dark:bg-gold-950/15">
                      <p className="mb-1 text-xs font-black text-gold-700 dark:text-gold-300">
                        {ui.tip}
                      </p>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                        {isRTL ? step.tip.ar : step.tip.en}
                      </p>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ===== مهارات الداعية ===== */}
        <div id="skills" className="mb-12 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.skillsTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.skillsDesc}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {SKILLS.map((skill) => (
              <article key={skill.id} className="card p-6 md:p-7">
                <div className="mb-5 flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                    {skill.icon}
                  </span>

                  <div className="min-w-0">
                    <h3
                      className="text-xl font-black leading-relaxed text-slate-900 dark:text-white"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {isRTL ? skill.title.ar : skill.title.en}
                    </h3>

                    <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                      {isRTL ? skill.description.ar : skill.description.en}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-black text-primary-700 dark:text-primary-300">
                    {ui.howToDevelop}
                  </p>

                  <ul className="space-y-2">
                    {skill.howToDevelop.map((item, index) => (
                      <li key={`${skill.id}-${index}`} className="flex items-start gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                        <span>{isRTL ? item.ar : item.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ===== أخطاء شائعة ===== */}
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
              <article key={mistake.id} className="card border-red-200 p-6 md:p-7 dark:border-red-900/30">
                <div className="mb-5 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl dark:bg-red-900/30">
                    ⚠️
                  </span>

                  <h3
                    className="text-lg font-black leading-relaxed text-slate-900 dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {isRTL ? mistake.title.ar : mistake.title.en}
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-red-100 bg-red-50/60 p-4 dark:border-red-900/30 dark:bg-red-950/15">
                    <p className="mb-1 text-xs font-black text-red-700 dark:text-red-300">
                      {ui.whyBad}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {isRTL ? mistake.whyBad.ar : mistake.whyBad.en}
                    </p>
                  </div>

                  <div className="rounded-xl border border-green-100 bg-green-50/60 p-4 dark:border-green-900/30 dark:bg-green-950/15">
                    <p className="mb-1 text-xs font-black text-green-700 dark:text-green-300">
                      {ui.instead}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {isRTL ? mistake.instead.ar : mistake.instead.en}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ===== قائمة تحضير ===== */}
        <div id="checklist" className="mb-12 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.checklistTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.checklistDesc}</p>
          </div>

          <div className="card p-6 md:p-8">
            <ul className="grid gap-3 md:grid-cols-2">
              {CHECKLIST.map((item) => (
                <li key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40">
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
                {ui.noteTitle}
              </h3>

              <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note3}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ===== صفحات ذات صلة ===== */}
        <div className="mt-10">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${l}/atheism-response`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🧠</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.atheismPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.atheismPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/doubts`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">❓</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.doubtsPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.doubtsPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/articles`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">✍️</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.articlesPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.articlesPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/fields`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">📚</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.fieldsPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.fieldsPageDesc}
                </p>
              </div>
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
  icon, label, value, color,
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

// ============================================================
// مكون QuickNavLink
// ============================================================

function QuickNavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}