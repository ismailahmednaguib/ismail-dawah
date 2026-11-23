import type { Lang } from '@/lib/i18n';

export type DawahPortalSection = {
  heading: string;
  body: string;
};

export type DawahPortalReference = {
  label: string;
  href?: string;
};

export type DawahPortalPage = {
  slug: string;
  title: Record<Lang, string>;
  summary: Record<Lang, string>;
  intro: Record<Lang, string>;
  sections: Record<Lang, DawahPortalSection[]>;
  references: Record<Lang, DawahPortalReference[]>;
  related: string[];
};

const page = (
  slug: string,
  title: Record<Lang, string>,
  summary: Record<Lang, string>,
  intro: Record<Lang, string>,
  sections: Record<Lang, DawahPortalSection[]>,
  references: Record<Lang, DawahPortalReference[]>,
  related: string[]
): DawahPortalPage => ({ slug, title, summary, intro, sections, references, related });

export const DAWAH_PORTAL_PAGES: DawahPortalPage[] = [
  page(
    'what-is-islam',
    { ar: 'ما الإسلام؟', en: 'What Is Islam?' },
    { ar: 'مدخل مختصر إلى التوحيد والنبوة والعبادة والأخلاق في الإسلام.', en: 'A short introduction to monotheism, prophethood, worship, and ethics in Islam.' },
    { ar: 'الإسلام هو الاستسلام لله وحده مع الإيمان برسله وكتبه واليوم الآخر، والعمل بما يصلح القلب والسلوك.', en: 'Islam means surrendering to God alone, believing in His messengers, books, and the Last Day, and living by what reforms the heart and conduct.' },
    {
      ar: [
        { heading: 'التوحيد', body: 'يبدأ الإسلام بإفراد الله بالعبادة، فلا يُدعى ولا يُرجى على وجه العبادة إلا الله، مع الإيمان بأسمائه وصفاته كما يليق به.' },
        { heading: 'النبوة والوحي', body: 'يرى الإسلام أن الله أرسل رسلًا لهداية الناس، وأن محمدًا ﷺ خاتم الأنبياء، وأن القرآن هو الكتاب الذي أُنزل عليه.' },
        { heading: 'العبادة والأخلاق', body: 'العبادة في الإسلام تشمل الصلاة والصيام وسائر الطاعات، وتشمل كذلك الصدق والرحمة والعدل وحسن معاملة الناس.' },
      ],
      en: [
        { heading: 'Monotheism', body: 'Islam begins by worshipping God alone. Prayer and reliance as acts of worship are directed to Him, with belief in His names and attributes in a manner befitting Him.' },
        { heading: 'Prophethood and revelation', body: 'Islam teaches that God sent messengers to guide people, that Muhammad ﷺ is the final prophet, and that the Quran was revealed to him.' },
        { heading: 'Worship and character', body: 'Worship includes prayer, fasting, and other acts of devotion, as well as honesty, mercy, justice, and good treatment of people.' },
      ],
    },
    {
      ar: [{ label: 'القرآن الكريم: البقرة 256', href: '/quran/2' }, { label: 'القرآن الكريم: الذاريات 56', href: '/quran/51' }],
      en: [{ label: 'The Quran: Al-Baqarah 2:256', href: '/quran/2' }, { label: 'The Quran: Adh-Dhariyat 51:56', href: '/quran/51' }],
    },
    ['who-is-muhammad', 'quran-intro', 'muslim-day']
  ),
  page(
    'who-is-muhammad',
    { ar: 'من هو النبي محمد ﷺ؟', en: 'Who Was Prophet Muhammad ﷺ?' },
    { ar: 'سيرة موجزة تركز على رسالته وأخلاقه دون مبالغة أو اختزال مخل.', en: 'A brief, respectful biography focused on his message and character without exaggeration or careless reduction.' },
    { ar: 'محمد بن عبد الله ﷺ نبي الإسلام ورسوله، دعا قومه إلى عبادة الله وحده، وعُرف قبل البعثة وبعدها بالصدق والأمانة.', en: 'Muhammad ibn Abdullah ﷺ is Islam’s prophet and messenger. He called his people to worship God alone and was known for truthfulness and trustworthiness.' },
    {
      ar: [
        { heading: 'رسالته', body: 'كانت دعوته امتدادًا لدعوة الأنبياء إلى توحيد الله، مع إتمام مكارم الأخلاق وإقامة العدل والرحمة.' },
        { heading: 'إنسانيته', body: 'يعرض القرآن النبي ﷺ عبدًا ورسولًا، وتعرض السيرة رحمته بأهله وأصحابه والضعفاء، مع بقاء التمييز بين مقام النبوة وعبادة الله وحده.' },
        { heading: 'كيف نقرأ سيرته؟', body: 'تُقرأ سيرته من مصادرها المعروفة، مع التمييز بين الصحيح والضعيف، واحترام اختلاف المؤرخين في التفاصيل التي لا يترتب عليها حكم.' },
      ],
      en: [
        { heading: 'His message', body: 'His call continued the message of the prophets: worship God alone, cultivate noble character, and establish justice and mercy.' },
        { heading: 'His humanity', body: 'The Quran presents the Prophet ﷺ as a servant and messenger. The biography records mercy toward family, companions, and the vulnerable, while worship remains for God alone.' },
        { heading: 'How to read his biography', body: 'Read the biography from recognized sources, distinguish strong reports from weak ones, and allow for historical disagreement on details that do not affect a ruling.' },
      ],
    },
    {
      ar: [{ label: 'القرآن الكريم: الأنبياء 107', href: '/quran/21' }, { label: 'القرآن الكريم: القلم 4', href: '/quran/68' }],
      en: [{ label: 'The Quran: Al-Anbiya 21:107', href: '/quran/21' }, { label: 'The Quran: Al-Qalam 68:4', href: '/quran/68' }],
    },
    ['what-is-islam', 'quran-intro', 'muslim-day']
  ),
  page(
    'quran-intro',
    { ar: 'القرآن ما هو وكيف نُقل إلينا؟', en: 'The Quran: What It Is and How It Reached Us' },
    { ar: 'تعريف هادئ بالقرآن ومكانته وطرق تلقيه، مع التمييز بين النص والتفسير.', en: 'A calm introduction to the Quran, its place in Islam, and how it is received, while distinguishing the text from interpretation.' },
    { ar: 'القرآن في الإسلام وحي الله المنزل على محمد ﷺ، ويُقرأ بالعربية، وتُفهم معانيه بالترجمة والتفسير مع بقاء الأصل العربي هو النص المرجعي.', en: 'In Islam, the Quran is God’s revelation to Muhammad ﷺ. It is recited in Arabic, while translations and tafsir help readers understand its meaning without replacing the Arabic reference text.' },
    {
      ar: [
        { heading: 'النص والتلاوة', body: 'يُحفظ القرآن بالتلقي والقراءة والكتابة، وتُدرس القراءات ضمن علمها وأصولها. لا ينبغي الخلط بين اختلاف الأداء المعتبر وبين تغيير النص.' },
        { heading: 'الترجمة والتفسير', body: 'الترجمة تقريب للمعنى وليست قرآنًا باللغة الأخرى، والتفسير شرح بشري يحتاج إلى علم بالسياق واللغة وأقوال المفسرين.' },
        { heading: 'كيف تبدأ؟', body: 'ابدأ بسورة قصيرة مع ترجمة موثوقة، واسأل عن المعنى عند الإشكال، ولا تبنِ حكمًا كبيرًا على اقتباس مبتور.' },
      ],
      en: [
        { heading: 'Text and recitation', body: 'The Quran is preserved through recitation, study, and writing. The recognized readings are studied within their disciplines; they should not be confused with changing the text.' },
        { heading: 'Translation and tafsir', body: 'A translation conveys meaning but is not the Quran in another language. Tafsir is human explanation that requires attention to language, context, and scholarly interpretation.' },
        { heading: 'Where to begin', body: 'Start with a short surah and a reliable translation, ask about difficult meanings, and avoid building major conclusions on an isolated quotation.' },
      ],
    },
    {
      ar: [{ label: 'القرآن الكريم: الحجر 9', href: '/quran/15' }, { label: 'القرآن الكريم: القيامة 17–19', href: '/quran/75' }],
      en: [{ label: 'The Quran: Al-Hijr 15:9', href: '/quran/15' }, { label: 'The Quran: Al-Qiyamah 75:17–19', href: '/quran/75' }],
    },
    ['what-is-islam', 'muslim-day', 'reason-and-science']
  ),
  page(
    'muslim-day',
    { ar: 'كيف يعيش المسلم يومه؟', en: 'How Does a Muslim Live Each Day?' },
    { ar: 'صورة عملية عن الصلاة والذكر والعمل والأخلاق والعلاقات اليومية.', en: 'A practical picture of prayer, remembrance, work, character, and daily relationships.' },
    { ar: 'لا يعيش المسلم بين العبادة والحياة كأنهما عالمان منفصلان؛ بل يحاول أن يجعل عبادته سببًا للصدق والرحمة والإتقان.', en: 'A Muslim does not treat worship and life as separate worlds; worship is meant to shape honesty, mercy, responsibility, and excellence.' },
    {
      ar: [
        { heading: 'الصلوات والذكر', body: 'الصلوات الخمس مواعيد يومية للوقوف بين يدي الله، ويصاحبها الدعاء والذكر وقراءة القرآن بحسب القدرة.' },
        { heading: 'العمل والعائلة', body: 'يطلب الإسلام الكسب الحلال وبر الوالدين وصلة الرحم والوفاء بالعهد، مع مراعاة الحقوق والخصوصية.' },
        { heading: 'الأخلاق', body: 'الصدق والأمانة والرحمة وضبط الغضب ليست إضافات تجميلية، بل من صميم التدين.' },
      ],
      en: [
        { heading: 'Prayer and remembrance', body: 'The five daily prayers are regular moments of turning to God, accompanied by supplication, remembrance, and Quran according to one’s ability.' },
        { heading: 'Work and family', body: 'Islam encourages lawful work, kindness to parents, maintaining family ties, and keeping promises while respecting people’s rights and privacy.' },
        { heading: 'Character', body: 'Honesty, trust, mercy, and self-control are not decorative additions; they are part of religious practice.' },
      ],
    },
    {
      ar: [{ label: 'القرآن الكريم: العنكبوت 45', href: '/quran/29' }, { label: 'القرآن الكريم: الحجرات 13', href: '/quran/49' }],
      en: [{ label: 'The Quran: Al-Ankabut 29:45', href: '/quran/29' }, { label: 'The Quran: Al-Hujurat 49:13', href: '/quran/49' }],
    },
    ['what-is-islam', 'women-in-islam', 'embrace']
  ),
  page(
    'women-in-islam',
    { ar: 'المرأة في الإسلام', en: 'Women in Islam' },
    { ar: 'عرض للمبادئ العامة مع الاعتراف بتنوع التجارب والاختلافات الفقهية والتاريخية.', en: 'An overview of general principles that acknowledges diverse experiences and legitimate legal and historical differences.' },
    { ar: 'ينطلق التصور الإسلامي من إنسانية المرأة وكرامتها ومسؤوليتها أمام الله، ولا يصح اختزالها في نقاش واحد عن اللباس أو الأسرة.', en: 'The Islamic view begins with women’s humanity, dignity, and accountability before God. It should not be reduced to one debate about clothing or family.' },
    {
      ar: [
        { heading: 'الكرامة والمسؤولية', body: 'المرأة والرجل مكلّفان أمام الله، ولهما أصل الكرامة الإنسانية والثواب على العمل الصالح.' },
        { heading: 'الحقوق والواجبات', body: 'تتحدث النصوص عن حقوق مالية وأسرية وأخلاقية، وتفصيلها الفقهي يحتاج إلى عرض المذاهب والمصادر لا إلى شعارات عامة.' },
        { heading: 'الواقع والتنوع', body: 'تختلف أحوال النساء باختلاف البلاد والعائلات والثقافات، ولا يصح نسبة كل ممارسة اجتماعية إلى الإسلام بلا دليل.' },
      ],
      en: [
        { heading: 'Dignity and responsibility', body: 'Women and men are accountable before God and share the foundation of human dignity and reward for righteous action.' },
        { heading: 'Rights and duties', body: 'The sources discuss financial, family, and ethical rights. Legal details should be presented with schools and sources rather than slogans.' },
        { heading: 'Reality and diversity', body: 'Women’s circumstances differ across countries, families, and cultures. A social practice should not be attributed to Islam without evidence.' },
      ],
    },
    {
      ar: [{ label: 'القرآن الكريم: النساء 1', href: '/quran/4' }, { label: 'القرآن الكريم: الأحزاب 35', href: '/quran/33' }],
      en: [{ label: 'The Quran: An-Nisa 4:1', href: '/quran/4' }, { label: 'The Quran: Al-Ahzab 33:35', href: '/quran/33' }],
    },
    ['what-is-islam', 'muslim-day', 'ask-muslim']
  ),
  page(
    'jihad-and-violence',
    { ar: 'الإسلام والعنف والجهاد', en: 'Islam, Violence, and Jihad' },
    { ar: 'تفريق ضروري بين العبادة والجهاد المشروع وبين العنف والإرهاب الذي يستهدف الأبرياء.', en: 'A necessary distinction between worship, lawful struggle, and violence or terrorism against civilians.' },
    { ar: 'لا يكفي أن نأخذ كلمة واحدة من سياقها؛ ففهم الجهاد يحتاج إلى اللغة والسياق والفقه والتاريخ، وإلى رفض استهداف الأبرياء.', en: 'One word cannot be understood outside its context. Jihad requires attention to language, context, law, and history, together with a clear rejection of targeting civilians.' },
    {
      ar: [
        { heading: 'الجهاد أوسع من القتال', body: 'تستعمل كلمة الجهاد في بذل الجهد في طاعة الله وإصلاح النفس والدعوة والعمل النافع، وليس كل استعمال لها متعلقًا بالحرب.' },
        { heading: 'ضوابط القتال', body: 'تذكر النصوص قيودًا للقتال، منها عدم الاعتداء، وتفصيلها ليس ترخيصًا للأفراد أو الجماعات لتجاوز القانون واستهداف المدنيين.' },
        { heading: 'الحوار المسؤول', body: 'عند دراسة هذا الموضوع ينبغي قراءة النصوص كاملة، ومراجعة أهل الاختصاص، والتمييز بين الإسلام وتصرفات جماعات أو دول تزعم الانتساب إليه.' },
      ],
      en: [
        { heading: 'Jihad is broader than fighting', body: 'Jihad can mean striving in obedience, reforming oneself, learning, and beneficial work; not every use of the word refers to war.' },
        { heading: 'Limits on fighting', body: 'The sources mention limits, including the prohibition of aggression. Legal discussion is not permission for individuals or groups to bypass law or target civilians.' },
        { heading: 'Responsible dialogue', body: 'Study the full context, consult qualified scholarship, and distinguish Islam from the actions of groups or states that claim to represent it.' },
      ],
    },
    {
      ar: [{ label: 'القرآن الكريم: البقرة 190', href: '/quran/2' }, { label: 'القرآن الكريم: المائدة 32', href: '/quran/5' }],
      en: [{ label: 'The Quran: Al-Baqarah 2:190', href: '/quran/2' }, { label: 'The Quran: Al-Maidah 5:32', href: '/quran/5' }],
    },
    ['what-is-islam', 'jesus-in-islam', 'reason-and-science']
  ),
  page(
    'jesus-in-islam',
    { ar: 'المسيح عيسى عليه السلام في الإسلام', en: 'Jesus in Islam' },
    { ar: 'عرض لمكانة عيسى عليه السلام في الإسلام مع احترام ما يؤمن به المسيحيون وتجنب التعميم.', en: 'An overview of Jesus in Islam that respects Christian beliefs and avoids caricature.' },
    { ar: 'يؤمن المسلمون بعيسى عليه السلام نبيًا كريمًا ومسيحًا مولودًا من مريم، ويدعونه إلى الله لا إلى عبادته.', en: 'Muslims believe Jesus is a noble prophet and the Messiah, born to Mary, and that he called people to God rather than to worship of himself.' },
    {
      ar: [
        { heading: 'مكانة عيسى ومريم', body: 'يذكر القرآن عيسى ومريم عليهما السلام بتكريم واضح، ويعرض ولادة عيسى ومعجزاته بإذن الله ضمن سياق النبوة.' },
        { heading: 'التوحيد', body: 'الاختلاف المركزي هو تصور الله والنبوة؛ يُعرض هذا الاختلاف بأمانة من مصادر كل طرف دون إساءة أو اختزال.' },
        { heading: 'كيف نتحاور؟', body: 'نبدأ بما نتفق عليه من الإيمان بالله والرحمة والعبادة، ثم نوضح نقاط الاختلاف بلغة هادئة ومراجع محددة.' },
      ],
      en: [
        { heading: 'Jesus and Mary', body: 'The Quran honors Jesus and Mary and describes Jesus’ birth and miracles by God’s permission within the framework of prophethood.' },
        { heading: 'Monotheism', body: 'A central difference concerns the understanding of God and prophethood. It should be presented fairly from each tradition’s sources.' },
        { heading: 'How to discuss it', body: 'Begin with shared belief in God, mercy, and worship, then explain differences calmly with specific references.' },
      ],
    },
    {
      ar: [{ label: 'القرآن الكريم: آل عمران 45–51', href: '/quran/3' }, { label: 'القرآن الكريم: المائدة 72–75', href: '/quran/5' }],
      en: [{ label: 'The Quran: Ali Imran 3:45–51', href: '/quran/3' }, { label: 'The Quran: Al-Maidah 5:72–75', href: '/quran/5' }],
    },
    ['what-is-islam', 'quran-intro', 'ask-muslim']
  ),
  page(
    'suffering-and-evil',
    { ar: 'الله والمعاناة والشر', en: 'God, Suffering, and Evil' },
    { ar: 'مدخل متواضع لسؤال الألم والشر، مع الاعتراف بأن بعض التجارب لا تُختزل في جواب سريع.', en: 'A humble introduction to suffering and evil that admits some experiences cannot be reduced to a quick answer.' },
    { ar: 'لا يقدّم الإسلام ألم الإنسان على أنه وهم أو ذنب بسيط، بل يعترف بالابتلاء والظلم والحزن، ويجمع بين المعنى والرحمة والعمل لإزالة الضرر.', en: 'Islam does not dismiss human pain as an illusion or a simple fault. It recognizes trials, injustice, and grief, joining meaning with mercy and action to remove harm.' },
    {
      ar: [
        { heading: 'الابتلاء لا يعني التخلي', body: 'قد يمر الإنسان بمحنة لا يعرف حكمتها في الحال، ولا يجوز أن نستخدم النصوص لإسكات المكلوم أو لومه.' },
        { heading: 'المسؤولية الأخلاقية', body: 'جزء من الإيمان أن نمنع الظلم ونغيث المتضرر ونحاسب المعتدي، لا أن نكتفي بالتفسير النظري.' },
        { heading: 'الأمل', body: 'يربط الإسلام بين الصبر والرجاء والعمل، ويعد بالعدل الكامل في الآخرة دون إنكار ألم الدنيا.' },
      ],
      en: [
        { heading: 'A trial is not abandonment', body: 'A person may face hardship without knowing its wisdom immediately. Scripture should never be used to silence or blame someone who is hurting.' },
        { heading: 'Moral responsibility', body: 'Faith includes resisting injustice, helping those harmed, and holding wrongdoers accountable rather than offering theory alone.' },
        { heading: 'Hope', body: 'Islam joins patience, hope, and action, and points to complete justice in the Hereafter without denying pain in this life.' },
      ],
    },
    {
      ar: [{ label: 'القرآن الكريم: البقرة 155–157', href: '/quran/2' }, { label: 'القرآن الكريم: الأنبياء 35', href: '/quran/21' }],
      en: [{ label: 'The Quran: Al-Baqarah 2:155–157', href: '/quran/2' }, { label: 'The Quran: Al-Anbiya 21:35', href: '/quran/21' }],
    },
    ['what-is-islam', 'reason-and-science', 'embrace']
  ),
  page(
    'reason-and-science',
    { ar: 'الإسلام والعقل والعلم', en: 'Islam, Reason, and Science' },
    { ar: 'منهج يفرق بين الوحي، والتفسير، والمعرفة التجريبية، والادعاءات التي تحتاج إلى دليل.', en: 'A framework that distinguishes revelation, interpretation, empirical knowledge, and claims that require evidence.' },
    { ar: 'يشجع الإسلام على النظر والتفكر وطلب العلم، مع التواضع أمام ما لا نعرفه، وعدم تحميل النصوص ما لا تحتمل من نظريات متغيرة.', en: 'Islam encourages reflection and learning while keeping humility about what we do not know and avoiding forcing changing theories onto scripture.' },
    {
      ar: [
        { heading: 'طلب المعرفة', body: 'العقل أداة لفهم العالم والنص، والعلم التجريبي يختبر الظواهر بالملاحظة والدليل، ولكل مجال أسئلته وأدواته.' },
        { heading: 'تجنب الإعجاز المتعجل', body: 'لا ينبغي بناء الإيمان على مطابقة آية لنظرية مؤقتة، ولا إنكار العلم بسبب قراءة سطحية لنص ديني.' },
        { heading: 'الأمانة العلمية', body: 'عند نقل معلومة علمية نذكر مصدرها وتاريخها وحدودها، ونترك للمتخصصين مراجعة التفاصيل.' },
      ],
      en: [
        { heading: 'Seeking knowledge', body: 'Reason helps us understand the world and texts. Empirical science tests phenomena through observation and evidence; each field has its questions and tools.' },
        { heading: 'Avoiding rushed miracles', body: 'Faith should not depend on matching a verse to a temporary theory, nor should science be rejected because of a shallow reading of scripture.' },
        { heading: 'Scientific honesty', body: 'When sharing scientific information, name the source, date, and limits, and let specialists review technical details.' },
      ],
    },
    {
      ar: [{ label: 'القرآن الكريم: آل عمران 190–191', href: '/quran/3' }, { label: 'القرآن الكريم: الإسراء 36', href: '/quran/17' }],
      en: [{ label: 'The Quran: Ali Imran 3:190–191', href: '/quran/3' }, { label: 'The Quran: Al-Isra 17:36', href: '/quran/17' }],
    },
    ['what-is-islam', 'suffering-and-evil', 'quran-intro']
  ),
  page(
    'death-and-purpose',
    { ar: 'الموت وما بعده وغاية الحياة', en: 'Death, the Hereafter, and the Purpose of Life' },
    { ar: 'أسئلة الغاية والموت والحساب كما يعرضها التصور الإسلامي.', en: 'The Islamic view of purpose, death, accountability, and the Hereafter.' },
    { ar: 'يرى الإسلام أن الحياة أمانة واختبار، وأن قيمة الإنسان لا تنتهي بالموت، وأن العدل الكامل والرحمة الكاملة من شؤون الآخرة.', en: 'Islam views life as a trust and a test, human value as continuing beyond death, and complete justice and mercy as matters of the Hereafter.' },
    {
      ar: [
        { heading: 'غاية الحياة', body: 'الغاية ليست جمع المتاع فقط، بل معرفة الله وعبادته وإعمار الأرض بالعدل والإحسان.' },
        { heading: 'الموت', body: 'الموت انتقال إلى مرحلة أخرى وليس نهاية المعنى، مع ترك تفاصيل الغيب للوحي وعدم ادعاء ما لا دليل عليه.' },
        { heading: 'الأمل والمسؤولية', body: 'الإيمان بالآخرة يزرع الرجاء ويحمّل الإنسان مسؤولية عمله وحقوق الناس.' },
      ],
      en: [
        { heading: 'Purpose', body: 'Purpose is not only collecting possessions; it is knowing and worshipping God and building life through justice and excellence.' },
        { heading: 'Death', body: 'Death is a transition rather than the end of meaning. Details of the unseen belong to revelation, and we should not claim what has no evidence.' },
        { heading: 'Hope and responsibility', body: 'Belief in the Hereafter gives hope and makes people responsible for their deeds and the rights of others.' },
      ],
    },
    {
      ar: [{ label: 'القرآن الكريم: الملك 2', href: '/quran/67' }, { label: 'القرآن الكريم: المؤمنون 115', href: '/quran/23' }],
      en: [{ label: 'The Quran: Al-Mulk 67:2', href: '/quran/67' }, { label: 'The Quran: Al-Muminun 23:115', href: '/quran/23' }],
    },
    ['what-is-islam', 'suffering-and-evil', 'embrace']
  ),
  page(
    'embrace',
    { ar: 'كيف أعتنق الإسلام؟ وماذا بعد الشهادتين؟', en: 'How Do I Embrace Islam and What Comes Next?' },
    { ar: 'خطوات بسيطة وآمنة لمن اقتنع بالإسلام ويريد بداية هادئة، دون ضغط أو استعجال.', en: 'Simple, safe steps for someone convinced by Islam who wants a calm beginning without pressure or haste.' },
    { ar: 'اعتناق الإسلام قرار إيماني شخصي. إذا اقتنعت بالتوحيد ورسالة محمد ﷺ فاسأل أهل العلم الموثوقين عن الشهادتين والخطوات العملية، واحفظ سلامتك وخصوصيتك.', en: 'Embracing Islam is a personal faith decision. If you are convinced of monotheism and Muhammad’s message, ask trusted people about the Shahadah and practical next steps while protecting your safety and privacy.' },
    {
      ar: [
        { heading: 'الشهادتان', body: 'الشهادة هي الإقرار بأنه لا إله إلا الله وأن محمدًا رسول الله، مع فهم معناها والصدق فيها. لا يشترط إتقان العربية للدخول في الإسلام.' },
        { heading: 'البداية التدريجية', body: 'ابدأ بالطهارة والصلاة وتعلم الفاتحة وأصول الإيمان، وخذ العلم خطوة خطوة، واسأل عن المسائل التي تحتاجها في واقعك.' },
        { heading: 'السلامة والدعم', body: 'إن كنت تخشى ضررًا من الأسرة أو البيئة، لا تعرّض نفسك للخطر. تواصل مع شخص موثوق أو مركز معروف، ولا ترسل بيانات حساسة عبر نموذج عام.' },
      ],
      en: [
        { heading: 'The Shahadah', body: 'The testimony affirms that there is no deity worthy of worship but God and that Muhammad is His messenger, with understanding and sincerity. Arabic fluency is not required.' },
        { heading: 'A gradual beginning', body: 'Start with cleanliness, prayer, Al-Fatihah, and the foundations of faith. Learn step by step and ask about what your circumstances require.' },
        { heading: 'Safety and support', body: 'If family or surroundings could cause harm, do not put yourself at risk. Contact a trusted person or recognized center and avoid sending sensitive details through a public form.' },
      ],
    },
    {
      ar: [{ label: 'القرآن الكريم: البقرة 256', href: '/quran/2' }, { label: 'القرآن الكريم: الزمر 53', href: '/quran/39' }],
      en: [{ label: 'The Quran: Al-Baqarah 2:256', href: '/quran/2' }, { label: 'The Quran: Az-Zumar 39:53', href: '/quran/39' }],
    },
    ['what-is-islam', 'muslim-day', 'ask-muslim']
  ),
  page(
    'ask-muslim',
    { ar: 'اسأل مسلمًا', en: 'Ask a Muslim' },
    { ar: 'أرسل سؤالك بوضوح، وسنحاول توجيهه إلى رد إنساني مناسب دون ضغط أو تتبع غير ضروري.', en: 'Send a clear question and we will try to route it to a human response without pressure or unnecessary tracking.' },
    { ar: 'يمكنك إرسال سؤال عام، ولا تحتاج إلى تسجيل. البريد اختياري، ولا ترسل معلومات قد تعرضك للخطر أو تكشف هوية شخص آخر.', en: 'You can send a general question without creating an account. Email is optional; do not send information that could put you or someone else at risk.' },
    {
      ar: [
        { heading: 'ماذا يحدث بعد الإرسال؟', body: 'يقرأ الفريق السؤال، وقد يطلب توضيحًا، أو يحيله إلى مختص عند الحاجة. الأسئلة المتكررة قد تتحول بعد تنقيتها إلى مادة عامة.' },
        { heading: 'ما الذي لا نعد به؟', body: 'لا نعد بفتوى شخصية فورية ولا نضمن وقتًا ثابتًا قبل تشغيل فريق الرد. المسائل العاجلة أو الخطرة تحتاج جهة محلية موثوقة.' },
        { heading: 'احترام الخصوصية', body: 'اجعل سؤالك عامًا قدر الإمكان، ولا تكتب أسماء أو أرقامًا أو تفاصيل صحية ومالية إلا عند الضرورة القصوى.' },
      ],
      en: [
        { heading: 'What happens next?', body: 'The team reads the question, may ask for clarification, or route it to a specialist. Repeated questions may become public material after removing personal details.' },
        { heading: 'What we do not promise', body: 'We do not promise an immediate personal fatwa or a fixed response time before a response team is active. Urgent or dangerous situations need trusted local support.' },
        { heading: 'Respecting privacy', body: 'Keep your question general and do not include names, phone numbers, health, or financial details unless truly necessary.' },
      ],
    },
    {
      ar: [{ label: 'صفحة التواصل وإرسال السؤال', href: '/contact' }, { label: 'سياسة الخصوصية', href: '/privacy' }],
      en: [{ label: 'Contact and ask a question', href: '/contact' }, { label: 'Privacy policy', href: '/privacy' }],
    },
    ['what-is-islam', 'embrace']
  ),
];

export function getDawahPortalPage(slug: string): DawahPortalPage | null {
  return DAWAH_PORTAL_PAGES.find((item) => item.slug === slug) ?? null;
}

export function getDawahPortalSlugs(): string[] {
  return DAWAH_PORTAL_PAGES.map((item) => item.slug);
}
