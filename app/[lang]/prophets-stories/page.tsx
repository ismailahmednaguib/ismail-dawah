// app/[lang]/prophets-stories/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";

// ============================================================
// الأنواع
// ============================================================

type Lang = "ar" | "en";

type LocalizedProphet = {
  name: string;
  title: string;
  summary: string;
  story: string[];
  lessons: string[];
};

type Prophet = {
  id: string;
  icon: string;
  order: number;
  tags: {
    ar: string[];
    en: string[];
  };
  ar: LocalizedProphet;
  en: LocalizedProphet;
};

type SearchParams = {
  q?: string | string[];
};

// ============================================================
// بيانات الأنبياء
// ============================================================

const PROPHETS: Prophet[] = [
  {
    id: "adam",
    icon: "🌍",
    order: 1,
    tags: {
      ar: ["الخلق", "التوبة", "أبو البشر", "العلم"],
      en: ["Creation", "Repentance", "Father of Humanity", "Knowledge"],
    },
    ar: {
      name: "آدم عليه السلام",
      title: "أبو البشر وأول الأنبياء",
      summary:
        "خلق الله آدم بيده، ونفخ فيه من روحه، وعلّمه الأسماء، وأمر الملائكة بالسجود له تكريمًا.",
      story: [
        "خلق الله تعالى آدم من طين، وصوّره أحسن تصوير، ثم نفخ فيه من روحه، فكان إنسانًا حيًا عاقلًا تكرمه الملائكة بالسجود أمرًا من الله.",
        "علّم الله آدم الأسماء كلها، ثم عرضهم على الملائكة، فأقرّوا بعجزهم، واعترفوا بفضل ما علّم الله آدم، فكان العلم أول مزية يظهر بها تكريم الإنسان.",
        "وسكن آدم وزوجه الجنة، ونُهيَا عن شجرة، فوسوس لهما الشيطان حتى أكلَا منها، فأهبطهما الله إلى الأرض، لكن آدم تاب وقبل الله توبته، وصار خليفة في الأرض يعمرها بطاعة الله.",
      ],
      lessons: [
        "تكريم الله للإنسان بالعلم والاستخلاف.",
        "التوبة تمحو أثر الذنب، ولا ييأس العبد من رحمة الله.",
        "الشيطان عدو مبين، ويجب الحذر من وسوسته.",
        "الأرض دار عمل وابتلاء، والجنة دار جزاء.",
      ],
    },
    en: {
      name: "Adam, peace be upon him",
      title: "Father of Humanity and First Prophet",
      summary:
        "Allah created Adam with His own hand, breathed into him of His spirit, taught him the names, and commanded the angels to prostrate to him as an honor.",
      story: [
        "Allah created Adam from clay, shaped him beautifully, and breathed into him of His spirit, so he became a living, thinking human being whom the angels honored by prostrating to him by Allah’s command.",
        "Allah taught Adam the names of all things, then presented them to the angels. The angels acknowledged their limitation and recognized the favor of knowledge that Allah gave Adam.",
        "Adam and his wife dwelt in Paradise and were forbidden from a tree. Satan whispered to them until they ate from it, so Allah brought them down to earth. Adam repented, Allah accepted his repentance, and he became a vicegerent to build the earth with obedience.",
      ],
      lessons: [
        "Allah honored mankind with knowledge and stewardship.",
        "Repentance erases the effect of sin, and a servant must never despair of Allah’s mercy.",
        "Satan is a clear enemy, and his whispers must be resisted.",
        "Earth is a place of work and test, while Paradise is the reward.",
      ],
    },
  },
  {
    id: "nuh",
    icon: "🚢",
    order: 2,
    tags: {
      ar: ["الصبر", "التوحيد", "السفينة", "الطوفان"],
      en: ["Patience", "Tawhid", "Ark", "Flood"],
    },
    ar: {
      name: "نوح عليه السلام",
      title: "صاحب السفينة والداعي إلى التوحيد",
      summary:
        " دعا نوح قومه إلى عبادة الله وحده زمنا طويلا، وبنى السفينة بأمر الله، ونجا المؤمنون وهلك المكذبون.",
      story: [
        "أُرسل نوح عليه السلام إلى قوم غرقوا في عبادة الأصنام، فدعاهم إلى التوحيد بالحكمة والصبر، وبيّن لهم أن الخالق وحده هو المستحق للعبادة.",
        "لبث فيهم ألف سنة إلا خمسين عاما يدعوهم ليلا ونهارا، ويخاطب عقولهم، ويرغبهم في أجر الله، لكن أكثرهم استكبروا وأصروا على شركهم.",
        "أوحى الله إليه أن يصنع السفينة، فسخر منه قومه، حتى إذا جاء أمر الله وفار التنور، حمل المؤمنين ومن أمره الله به، وجاء الطوفان فهلك المكذبون ونجا أهل الإيمان.",
      ],
      lessons: [
        "الصبر على الدعوة مفتاح النجاح.",
        "التوحيد هو أول ما يُدعى إليه الناس.",
        "النجاة بالإيمان والعمل، لا بالنسب والقرابة.",
        "استهزاء الباطل بحق الله لا يطول.",
      ],
    },
    en: {
      name: "Nuh, peace be upon him",
      title: "Companion of the Ark and Caller to Monotheism",
      summary:
        "Nuh called his people to worship Allah alone for a long time, built the ark by Allah’s command, and the believers were saved while the deniers perished.",
      story: [
        "Nuh was sent to a people deeply immersed in idol worship. He called them to monotheism with wisdom and patience, explaining that Allah alone deserves worship.",
        "He remained among them about a thousand years less fifty, inviting them night and day, appealing to their reason and promising Allah’s reward, but most were arrogant and persistent in disbelief.",
        "Allah inspired him to build the ark. His people mocked him until Allah’s command came and the oven boiled. He carried the believers and those Allah ordered, then the flood came, the disbelievers perished, and the people of faith were saved.",
      ],
      lessons: [
        "Patience in da‘wah is a key to success.",
        "Monotheism is the first message to mankind.",
        "Salvation is by faith and deeds, not lineage.",
        "Mockery of truth cannot last forever.",
      ],
    },
  },
  {
    id: "ibrahim",
    icon: "🔥",
    order: 3,
    tags: {
      ar: ["التوحيد", "الخلة", "الكعبة", "التضحية"],
      en: ["Tawhid", "Friendship with Allah", "Kaaba", "Sacrifice"],
    },
    ar: {
      name: "إبراهيم عليه السلام",
      title: "خليل الرحمن وأبو الأنبياء",
      summary:
        "هدى الله إبراهيم إلى التوحيد، وحطم الأصنام، ونجاه من النار، وبنى الكعبة مع إسماعيل.",
      story: [
        "نشأ إبراهيم في قوم يعبدون الأصنام والكواكب، فتفكر وتأمل حتى منّ الله عليه بالحنيفية السمحة، دين التوحيد الخالص.",
        "كسر أصنام قومه إلا كبيرا منهم، ليبيّن لهم أنها لا تضر ولا تنفع، ثم حوكم وأُلقي في النار، فأمر الله النار أن تكون بردا وسلاما عليه.",
        "هاجر في سبيل الله، ورزقه الله إسماعيل وإسحاق، وأمر ببناء الكعبة مع إسماعيل، وصار إماما للناس في الدين وأبا للأنبياء.",
      ],
      lessons: [
        "التفكر الصادق يهدي إلى الحق.",
        "التوكل على الله ينجي من أشد المحن.",
        "الدعوة قد تتطلب التضحية بالوطن والأهل.",
        "إبراهيم نموذج في العبادة والأخلاق والقيادة.",
      ],
    },
    en: {
      name: "Ibrahim, peace be upon him",
      title: "Allah’s Friend and Father of Prophets",
      summary:
        "Allah guided Ibrahim to monotheism, he broke the idols, was saved from the fire, and built the Kaaba with Ismail.",
      story: [
        "Ibrahim grew up among people who worshiped idols and stars. He reflected deeply until Allah guided him to the upright religion of pure monotheism.",
        "He broke the idols except the largest one, to show his people that they neither harm nor benefit. He was judged and thrown into fire, but Allah made it cool and safe for him.",
        "He migrated for Allah’s sake, was blessed with Ismail and Ishaq, and was commanded to build the Kaaba with Ismail. He became a leader of people in religion and a father of prophets.",
      ],
      lessons: [
        "Sincere reflection leads to truth.",
        "Trust in Allah saves from the hardest trials.",
        "Da‘wah may require sacrificing homeland and family.",
        "Ibrahim is a model in worship, character, and leadership.",
      ],
    },
  },
  {
    id: "musa",
    icon: "🌊",
    order: 4,
    tags: {
      ar: ["الTorah", "فرعون", "البحر", "العدل"],
      en: ["Torah", "Pharaoh", "Sea", "Justice"],
    },
    ar: {
      name: "موسى عليه السلام",
      title: "كليم الله وصاحب الشريعة",
      summary:
        "أرسل الله موسى إلى فرعون بالطور، ودعا إلى توحيد الله وتحرير بني إسرائيل، وآتاه التوراة.",
      story: [
        "وُلد موسى في زمن كان فرعون يقتل أبناء بني إسرائيل، فأوحى الله إلى أمه أن تضعه في التابوت وتلقيه في اليم، ليربأه الله على عينه.",
        "اختار الله موسى للنبوة، وكلّمه تكليما، وأرسله مع أخيه هارون إلى فرعون، يدعو إلى عبادة الله وحده وإرسال بني إسرائيل.",
        "أيد الله موسى بالآيات، وضرب على فرعون وقومه، حتى أفلت موسى ومن معه، ففتح الله له البحر، وأغرق فرعون وجنوده، وأنزل التوراة هدى ورحمة.",
      ],
      lessons: [
        "الوقوف في وجه الطغيان واجب على أهل الحق.",
        "الله ينصر عباده ولو طال البلاء.",
        "الشريعة نور للحياة والعدل.",
        "الكبر سبب الهلاك، كما كان حال فرعون.",
      ],
    },
    en: {
      name: "Musa, peace be upon him",
      title: "The One Who Spoke with Allah and Lawgiver",
      summary:
        "Allah sent Musa to Pharaoh with signs, calling to worship Allah alone and freeing the Children of Israel, and gave him the Torah.",
      story: [
        "Musa was born in a time when Pharaoh killed male infants. Allah inspired his mother to place him in a chest and cast it into the river, so Allah raised him under His care.",
        "Allah chose Musa for prophethood and spoke to him directly. He was sent with his brother Harun to Pharaoh, calling to worship Allah alone and to release the Children of Israel.",
        "Allah supported Musa with signs and afflicted Pharaoh and his people. Musa and his followers escaped, Allah parted the sea for them, drowned Pharaoh and his army, and revealed the Torah as guidance and mercy.",
      ],
      lessons: [
        "Standing against tyranny is a duty of people of truth.",
        "Allah supports His servants even if trial lasts.",
        "Divine law is light for life and justice.",
        "Arrogance leads to destruction, as with Pharaoh.",
      ],
    },
  },
  {
    id: "isa",
    icon: "✨",
    order: 5,
    tags: {
      ar: ["عيسى", "مريم", "الإنجيل", "المعجزات"],
      en: ["Isa", "Maryam", "Gospel", "Miracles"],
    },
    ar: {
      name: "عيسى عليه السلام",
      title: "روح الله وكلمته",
      summary:
        "وُلد عيسى من مريم بلا أب آية للناس، وأُوتي الإنجيل، وأيد بالمعجزات، ودعا إلى عبادة الله وحده.",
      story: [
        "اصطفى الله مريم على نساء العالمين، ووهبها عيسى عليه السلام بأمر كن فيكون، فكان ميلاده آية عظيمة على قدرة الله.",
        "نطق عيسى في المهد مدافعا عن أمه، ومقرًا بعبوديته لله، ومعلنًا نبوته ورسالته، ثم أُنزل عليه الإنجيل مصدقا لما بين يديه من التوراة.",
        "أيّد الله عيسى بمعجزات باذن الله: إبراء الأكمه والأبرص، وإحياء الموتى، وخلق الطير من طين بإذن الله، فدعا بني إسرائيل إلى الإخلاص وعبادة الله وحده.",
      ],
      lessons: [
        "عيسى عبد الله ورسوله، وليس إلها ولا ابن إله.",
        "الميلاد المعجز يدل على قدرة الله لا على ألوهية المولود.",
        "الإنجيل دعوة إلى التوحيد والزهد والإخلاص.",
        "المعجزات بتقدير الله، لا باستقلال الخالق.",
      ],
    },
    en: {
      name: "Isa, peace be upon him",
      title: "Allah’s Spirit and Word",
      summary:
        "Isa was born miraculously to Maryam without a father, given the Gospel, supported with miracles, and called to worship Allah alone.",
      story: [
        "Allah chose Maryam above the women of the worlds and granted her Isa by the command “Be,” so his birth became a great sign of Allah’s power.",
        "Isa spoke in the cradle defending his mother, affirming his servitude to Allah, declaring his prophethood and mission. The Gospel was revealed to him confirming the Torah before it.",
        "Allah supported Isa with miracles by His permission: healing the blind and leper, raising the dead, and forming birds from clay by Allah’s leave. He called the Children of Israel to sincerity and worship of Allah alone.",
      ],
      lessons: [
        "Isa is Allah’s servant and messenger, not a god nor son of God.",
        "Miraculous birth shows Allah’s power, not the divinity of the born.",
        "The Gospel calls to monotheism, asceticism, and sincerity.",
        "Miracles occur by Allah’s decree, not independently.",
      ],
    },
  },
  {
    id: "muhammad",
    icon: "🕌",
    order: 6,
    tags: {
      ar: ["الرحمة", "القرآن", "الهجرة", "خاتم النبيين"],
      en: ["Mercy", "Quran", "Migration", "Final Prophet"],
    },
    ar: {
      name: "محمد ﷺ",
      title: "خاتم النبيين ورحمة العالمين",
      summary:
        "ابتعث الله محمدا ﷺ بالهدى ودين الحق، وأنزل عليه القرآن، وأتم به الرسالة، وجعله أسوة للناس.",
      story: [
        "وُلد محمد ﷺ في مكة، وعُرف بالصدق والأمانة قبل البعثة، وكان معظما في قومه حتى لُقب بالصادق الأمين.",
        "اختاره الله للرسالة الخاتمة، وأنزل عليه القرآن، فدعا إلى التوحيد، وأقام العدل، وحرر العقول من عبادة الأصنام والخرافة.",
        "أوذي وصبر، وهاجر إلى المدينة، فبنى دولة العدل والأخوة، وفتح الله عليه مكة، فدخل الناس في دين الله أفواجا، وتوفي وقد أكمل الله الدين.",
      ],
      lessons: [
        "الرسالة محمدية خاتمة، والقرآن دستور الأمة.",
        "الرحمة والعدل أساس القيادة النبوية.",
        "الهجرة تضحيت في سبيل إقامة الدين.",
        "القدوة العملية أقوى من القول المجرد.",
      ],
    },
    en: {
      name: "Muhammad ﷺ",
      title: "Seal of the Prophets and Mercy to the Worlds",
      summary:
        "Allah sent Muhammad ﷺ with guidance and the true religion, revealed the Quran to him, completed the message through him, and made him an example for mankind.",
      story: [
        "Muhammad ﷺ was born in Makkah and was known for truthfulness and trustworthiness before revelation, honored among his people until he was called As-Sadiq Al-Amin.",
        "Allah chose him as the final messenger and revealed the Quran to him. He called to monotheism, established justice, and freed minds from idolatry and superstition.",
        "He was harmed yet patient, migrated to Madinah, built a community of justice and brotherhood, and Allah opened Makkah for him. People entered Islam in multitudes, and he passed away after Allah completed the religion.",
      ],
      lessons: [
        "The Muhammadan message is final, and the Quran is the nation’s constitution.",
        "Mercy and justice are foundations of prophetic leadership.",
        "Migration is sacrifice for establishing religion.",
        "Practical example is stronger than mere speech.",
      ],
    },
  },
  {
    id: "yusuf",
    icon: "🌟",
    order: 7,
    tags: {
      ar: ["العفّة", "الصبر", "التعبير", "العفو"],
      en: ["Chastity", "Patience", "Interpretation", "Forgiveness"],
    },
    ar: {
      name: "يوسف عليه السلام",
      title: "صاحب الأحسن القصص",
      summary:
        "ابتلي يوسف بالغيظ من إخوته، ثم بالعفّة والسجن، حتى مكّنه الله في مصر، وعفا عن إخوته.",
      story: [
        "رأى يوسف رؤيا تدل على علو شأنه، فحسده إخوته وألقوه في غيابة الجب، وأخبروا أباه أنه ذئب أكله.",
        "باعه من اشتراه في مصر، راودته امرأة العزيز عن نفسه فاعتصم بالعفاف، ودعا الله أن ينجيه من كيد النساء، فاختار السجن على المعصية.",
        "عبّر الرؤيا في السجن، ثم عُرف بتعبيره عند الملك، فخرج من السجن إلى خزائن مصر، واجتمع بأهله، وعفا عن إخوته وقال: لا تثريب عليكم اليوم.",
      ],
      lessons: [
        "الصبر على البلاء طريق التمكين.",
        "العفة نجاة في زمن الفتن.",
        "الله يرفع عباده بعد الابتلاء.",
        "العفو عند المقدمة خلق الأنبياء.",
      ],
    },
    en: {
      name: "Yusuf, peace be upon him",
      title: "Owner of the Best Story",
      summary:
        "Yusuf was tested by his brothers’ jealousy, then by chastity and prison, until Allah established him in Egypt and he forgave his brothers.",
      story: [
        "Yusuf saw a dream indicating his future honor, which aroused his brothers’ jealousy, so they threw him into a well and told their father a wolf had eaten him.",
        "He was sold into slavery in Egypt. The noble woman tried to seduce him, but he sought refuge in chastity and prayed to Allah for rescue, choosing prison over sin.",
        "He interpreted dreams in prison, became known to the king, left prison to manage Egypt’s treasury, reunited with his family, and forgave his brothers saying there is no blame upon you today.",
      ],
      lessons: [
        "Patience in trial leads to empowerment.",
        "Chastity is salvation in times of temptation.",
        "Allah raises His servants after hardship.",
        "Forgiveness when able is a prophetic character.",
      ],
    },
  },
  {
    id: "sulayman",
    icon: "👑",
    order: 8,
    tags: {
      ar: ["الملك", "النمل", "بلقيس", "الشكر"],
      en: ["Kingdom", "Ants", "Bilqis", "Gratitude"],
    },
    ar: {
      name: "سليمان عليه السلام",
      title: "صاحب الملك العظيم",
      summary:
        "آتى الله سليمان ملكا لا ينبغي لأحد من بعده، وسخر له الريح والجن والطير، فكان شاكرا عادلا.",
      story: [
        "ورث سليمان داود عليهما السلام، وأعطاه الله نبيا و ملكا، وسخر له الريح تجري بأمره، والجن يعملون بين يديه.",
        "علّمه الله منطق الطير، فسمع هدهدة تخبره بملكة سبأ وقومها يعبدون الشمس، فكتب إليها كتابا يدعوها إلى الإسلام.",
        "جاءت بلقيس بعد أن رأى آية الله في كرسيها، فأسلمت مع سليمان لله رب العالمين، وكان شكره نماذج في الاعتراف بالنعمة.",
      ],
      lessons: [
        "النعمة أمانة، والشكر حفظ لها.",
        "العدل أساس الملك حتى مع السخرية الكونية.",
        "الدعوة بالحكمة تصل إلى الملوك.",
        "التواضع لله يمنع البطر بالسلطة.",
      ],
    },
    en: {
      name: "Sulayman, peace be upon him",
      title: "Owner of the Great Kingdom",
      summary:
        "Allah gave Sulayman a kingdom unlike any after him, subjected wind, jinn, birds, and animals to his command, and he was grateful and just.",
      story: [
        "Sulayman inherited Dawud, peace be upon them, and Allah made him a prophet and king. The wind ran by his command, and jinn worked before him.",
        "Allah taught him the language of birds. He heard a hoopoe informing him about the Queen of Sheba and her people worshiping the sun, so he wrote her a letter inviting her to Islam.",
        "Bilqis came after seeing Allah’s sign with her throne, and she submitted with Sulayman to Allah Lord of the worlds. His gratitude became a model of recognizing blessing.",
      ],
      lessons: [
        "Blessing is a trust, and gratitude preserves it.",
        "Justice is the foundation of rule even with cosmic subjection.",
        "Wisdom in da‘wah reaches rulers.",
        "Humility before Allah prevents arrogance with power.",
      ],
    },
  },
  {
    id: "dawud",
    icon: "⚔️",
    order: 9,
    tags: {
      ar: ["الزبور", "العدل", "الصوت", "العبادة"],
      en: ["Psalms", "Justice", "Voice", "Worship"],
    },
    ar: {
      name: "داود عليه السلام",
      title: "صاحب الزبور والملك الصالح",
      summary:
        "آتى الله داود النبوة والملك والزبور، وليّن له الحديد، وجعله إماما في العدل والعبادة.",
      story: [
        "كان داود من أنبياء بني إسرائيل، وأيده الله بالنبوة والكتاب، وأعطاه صوتا حسنا في التلاوة والذكر.",
        "حكم بالعدل بين الناس، وفهم خصومتهم، وألهمه الله الفصل في القضايا، فكان مثالا للقاضي الحكيم.",
        "ليّن الله له الحديد فصنع الدروع، وعلمه الله صنعة war, وشكر ربه، وكان يصوم يوما ويفطر يوما، وينام جزءا من الليل ويقوم جزءا.",
      ],
      lessons: [
        "الجمع بين العبادة والمسؤولية ممكن.",
        "العدل في الحكم عبادة.",
        "الكسب الطيب والصنعة الحلال قربة.",
        "الاعتدال في العبادة أفضل من الانقطاع.",
      ],
    },
    en: {
      name: "Dawud, peace be upon him",
      title: "Owner of the Psalms and Righteous King",
      summary:
        "Allah gave Dawud prophethood, kingship, and the Psalms, softened iron for him, and made him a leader in justice and worship.",
      story: [
        "Dawud was among the prophets of the Children of Israel. Allah supported him with prophethood and scripture, and gave him a beautiful voice in recitation and remembrance.",
        "He judged justly among people, understood disputes, and Allah inspired him to settle cases, making him an example of the wise judge.",
        "Allah softened iron for him so he made armor, taught him craftsmanship, and he was grateful. He fasted alternately, slept part of the night, and stood in prayer part of it.",
      ],
      lessons: [
        "Combining worship and responsibility is possible.",
        "Justice in ruling is worship.",
        "Lawful earning and craftsmanship are draws to Allah.",
        "Balance in worship is better than discontinuity.",
      ],
    },
  },
  {
    id: "yunus",
    icon: "🐋",
    order: 10,
    tags: {
      ar: ["الحوت", "الدعاء", "التوبة", "الرحمة"],
      en: ["Whale", "Supplication", "Repentance", "Mercy"],
    },
    ar: {
      name: "يونس عليه السلام",
      title: "صاحب الحوت",
      summary:
        "خرج يونس من قومه بعد إعراضهم، فابتلي بالحوت، فدعا ربه في الظلمات فنجاه الله وجعل قومه يؤمنون.",
      story: [
        "أُرسل يونس إلى أهل نينوى، فدعاهم إلى التوحيد، فلم يستجيبوا، فغضب وخرج منهم من غير إذن ربه.",
        "ركب سفينة، فهاجت، واقترعوا على من يلقى في البحر، فوقع السهم على يونس، فأُلقي في البحر فالتقمه الحوت بأمر الله.",
        "نادى في الظلمات أن لا إله إلا أنت سبحانك إني كنت من الظالمين، فاستجاب الله له، وألقاه بالعراء، وآمن قومه بعد ذلك فمتعهم الله حينا.",
      ],
      lessons: [
        "العجلة في الدعوة قد تؤدي إلى ابتلاء.",
        "الدعاء الصادق ينجي من الكرب.",
        "لا يأس من رحمة الله مهما عظمت الذنوب.",
        "الله قد يهدي القوم بعد فوات الظاهر.",
      ],
    },
    en: {
      name: "Yunus, peace be upon him",
      title: "Companion of the Whale",
      summary:
        "Yunus left his people after their rejection, was tested by the whale, called upon Allah in darkness, and Allah saved him and later guided his people.",
      story: [
        "Yunus was sent to the people of Nineveh. He called them to monotheism, but they did not respond, so he left them in anger without Allah’s permission.",
        "He boarded a ship, it was stormy, and they drew lots over whom to cast into the sea. The lot fell on Yunus, so he was thrown and the whale swallowed him by Allah’s command.",
        "He called in the darkness: There is no deity except You, exalted are You, indeed I have been of the wrongdoers. Allah answered him, cast him onto the shore, and his people believed afterward, so Allah gave them enjoyment for a time.",
      ],
      lessons: [
        "Haste in da‘wah may lead to trial.",
        "Sincere supplication saves from distress.",
        "Never despair of Allah’s mercy however great sins.",
        "Allah may guide people after outward loss.",
      ],
    },
  },
];

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
    clearFilters: string;
    results: string;
    of: string;
    noResults: string;
    noResultsDesc: string;
    quickNav: string;
    readStory: string;
    storyTitle: string;
    lessonsTitle: string;
    tagsTitle: string;
    note: string;
  }
> = {
  ar: {
    title: "قصص الأنبياء",
    subtitle: "قصص مختارة من أنبياء الله مع الدروس المستفادة",
    home: "الرئيسية",
    description:
      "قسم قصص الأنبياء يقدم نبذة مختصرة عن عدد من أنبياء الله عليهم السلام، مع قصة مبسطة ودروس مستفادة، بلغتين ودعم كامل للبحث.",
    searchPlaceholder: "ابحث باسم النبي أو القصة أو الدرس...",
    search: "بحث",
    clearFilters: "مسح البحث",
    results: "عدد القصص",
    of: "من",
    noResults: "لا توجد نتائج",
    noResultsDesc: "جرّب اسم نبي آخر أو كلمة من الدروس المستفادة.",
    quickNav: "تنقل سريع",
    readStory: "اقرأ القصة والدروس",
    storyTitle: "القصة",
    lessonsTitle: "الدروس المستفادة",
    tagsTitle: "الوسوم",
    note: "هذه القصص مختصرة للتوعية والتعليم، ويُرجع في التفصيل إلى المصادر المعتمدة من القرآن والسنة وأهل العلم.",
  },
  en: {
    title: "Prophets Stories",
    subtitle: "Selected stories of Allah’s prophets with lessons",
    home: "Home",
    description:
      "The prophets stories section presents concise profiles of several prophets, peace be upon them, with simplified stories and lessons, bilingual support, and search.",
    searchPlaceholder: "Search by prophet, story, or lesson...",
    search: "Search",
    clearFilters: "Clear search",
    results: "Stories",
    of: "of",
    noResults: "No results found",
    noResultsDesc: "Try another prophet name or a lesson keyword.",
    quickNav: "Quick navigation",
    readStory: "Read story and lessons",
    storyTitle: "Story",
    lessonsTitle: "Lessons",
    tagsTitle: "Tags",
    note: "These stories are concise for education and awareness. For details, refer to authoritative sources from the Quran, Sunnah, and qualified scholars.",
  },
};

// ============================================================
// دوال مساعدة
// ============================================================

function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
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

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function matchesQuery(prophet: Prophet, query: string, lang: Lang): boolean {
  if (!query) {
    return true;
  }

  const q = normalizeSearch(query);
  const local = prophet[lang];
  const other = prophet[lang === "ar" ? "en" : "ar"];

  const haystack = [
    local.name,
    local.title,
    local.summary,
    ...local.story,
    ...local.lessons,
    other.name,
    other.title,
    other.summary,
    ...other.story,
    ...other.lessons,
    ...prophet.tags.ar,
    ...prophet.tags.en,
  ];

  return haystack.some((text) => normalizeSearch(text).includes(q));
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
      canonical: `/${l}/prophets-stories`,
      languages: {
        ar: "/ar/prophets-stories",
        en: "/en/prophets-stories",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/prophets-stories`,
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

export default async function ProphetsStoriesPage({
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

  const filteredProphets = PROPHETS.filter((prophet) =>
    matchesQuery(prophet, q, l)
  ).sort((a, b) => a.order - b.order);

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
        {/* ===== البحث ===== */}
        <div className="card mb-8 p-6 md:p-7">
          <form
            method="get"
            action={`/${l}/prophets-stories`}
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
              <span className="badge-gold">
                “{q}”
              </span>

              <Link
                href={`/${l}/prophets-stories`}
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
                {ui.clearFilters}
              </Link>
            </div>
          )}
        </div>

        {/* ===== تنقل سريع ===== */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {ui.quickNav}
          </h2>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {PROPHETS.map((prophet) => (
              <a
                key={prophet.id}
                href={`#${prophet.id}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
              >
                <span>{prophet.icon}</span>
                <span>{l === "ar" ? prophet.ar.name : prophet.en.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ===== عدد النتائج ===== */}
        <p className="mb-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {ui.results}:{" "}
          <span className="text-primary-600 dark:text-primary-400">
            {formatNumber(filteredProphets.length, l)}
          </span>{" "}
          {ui.of}{" "}
          <span className="text-slate-700 dark:text-slate-200">
            {formatNumber(PROPHETS.length, l)}
          </span>
        </p>

        {/* ===== لا توجد نتائج ===== */}
        {filteredProphets.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">📚</div>

            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noResults}
            </h3>

            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {ui.noResultsDesc}
            </p>

            <Link href={`/${l}/prophets-stories`} className="btn-primary">
              {ui.clearFilters}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredProphets.map((prophet) => {
              const local = prophet[l];

              return (
                <article
                  key={prophet.id}
                  id={prophet.id}
                  className="card scroll-mt-32 p-6 md:p-7"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                      {prophet.icon}
                    </span>

                    <div className="min-w-0">
                      <h2
                        className="text-xl font-black text-slate-900 md:text-2xl dark:text-white"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {local.name}
                      </h2>

                      <p className="mt-1 text-sm font-semibold text-primary-700 dark:text-primary-300">
                        {local.title}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
                    {local.summary}
                  </p>

                  <details className="group mt-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-sm font-bold text-primary-800 transition-all hover:bg-primary-100/70 dark:border-primary-900/40 dark:bg-primary-950/20 dark:text-primary-200 dark:hover:bg-primary-900/30 [&::-webkit-details-marker]:hidden">
                      <span>{ui.readStory}</span>

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

                    <div className="mt-5 space-y-6 border-t border-slate-100 pt-5 dark:border-night-700">
                      <div>
                        <h3 className="mb-3 text-base font-black text-slate-900 dark:text-white">
                          {ui.storyTitle}
                        </h3>

                        <div className="space-y-3">
                          {local.story.map((paragraph, index) => (
                            <p
                              key={`${prophet.id}-story-${index}`}
                              className="leading-relaxed text-slate-600 dark:text-slate-300"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-3 text-base font-black text-slate-900 dark:text-white">
                          {ui.lessonsTitle}
                        </h3>

                        <ul className="space-y-2">
                          {local.lessons.map((lesson, index) => (
                            <li
                              key={`${prophet.id}-lesson-${index}`}
                              className="flex items-start gap-2 text-slate-600 dark:text-slate-300"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                              <span className="leading-relaxed">{lesson}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                          {ui.tagsTitle}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {prophet.tags[l].map((tag) => (
                            <span
                              key={`${prophet.id}-${tag}`}
                              className="badge-gold text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        )}

        {/* ===== ملاحظة ===== */}
        <div className="card mt-10 p-6 text-center">
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {ui.note}
          </p>
        </div>
      </section>
    </main>
  );
}