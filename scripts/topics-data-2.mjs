// scripts/topics-data-2.mjs
// الدفعة الثانية من محتوى المواضيع الفرعية (عربي + إنجليزي).

export const TOPICS = [
  {
    sub: 'tarajim',
    type: 'lesson',
    slug: 'tarajim-tabaqat',
    ar: {
      title: 'التراجم والطبقات: فائدة العلم بسِيَر الأعلام',
      summary: 'لماذا نعرف طبقات الرواة والعلماء؟ وكيف تُدرك مراتبهم؟',
      body: 'التراجم جمع ترجمة، وهي التعريف بالعلماء: نسبهم وأشهرهم ومولدهم وموتهم وشيوخهم وتلاميذهم ومصنفاتهم وثناء أهل العلم عليهم. والطبقات ترتيب هؤلاء على حسب الأعصار والمراتب.\n\nوثمرة هذا العلم عظيمة: فبه تُعرف عدالة الرواة واتصال الأسانيد، ويُجتنب الانقطاع والتدليس، ويُعرَف المعاصر من غيره، ومعرفة طبقة الراوي تعين على الحكم على الحديث بالإرسال أو الانقطاع.\n\nودُوّن في هذا الفن كثير، وأشهره كتب الطبقات كطبقات ابن سعد، وسير أعلام النبلاء، وتذكرة الحفاظ، وتقريب التهذيب؛ وطالب الحديث لا يُدرك هذا العلم إلا بالبحث في هذه الكتب مع الرجوع إلى كلام الحفّاظ.',
    },
    en: {
      title: 'Biographical Dictionaries and Generations of Scholars',
      summary: 'Why study the biographies and generational ranks of narrators?',
      body: 'Biographies (tarājim) identify scholars: their lineage, origin, birth and death, teachers and students, works, and the assessments of fellow scholars. Generations (ṭabaqāt) arrange them by era and rank.\n\nThe benefit is great: it establishes the integrity of narrators and the continuity of chains, avoids gaps and concealment, distinguishes contemporaries from others, and helps judge whether a narration is disconnected or transmitted.\n\nMany works were compiled, most famously Ibn Saʿd\u0027s Generations, The Lives of the Noble Figures, The Memorial of the Memorizers, and al-Tahdhīb. A student masters this only by research in these books alongside the verdicts of the master critics.',
    },
  },
  {
    sub: 'ansab',
    type: 'article',
    slug: 'ansab-arab',
    ar: {
      title: 'الأنساب: معرفة القبائل والبطون',
      summary: 'علم النسب، أهميته، وضوابطه الشرعية.',
      body: 'علم النسب هو معرفة أنساب الناس وقبائلهم وبطونهم وفروعها، وهو من العلوم التي اعتنى بها العرب قديمًا، ودوّنها العلماء في كتبٍ مستقلة مثل جمهرة أنساب العرب، والاشتقاق، ونهاية الأرب.\n\nوفائدته: التعريف بالأعلام وتمييز المشتبهين من الرواة، وحفظ الأرحام، ومعرفة القرابات التي تتوقف عليها أحكام النفقات والإرث والولاية والتزويج.\n\nوضوابطه الشرعية: أن النسب لا يثبت بالدعوى، وإنما بالبيّنة والاستفاضة المعتبرة، وقد نهى الشرع عن الطعن في الأنساب وادّعاء غير الأب، قال ﷺ: «من ادّعى إلى غير أبيه وهو يعلم فالجنة عليه حرام»؛ فوجب التثبّت وصيانة الأعراض.',
    },
    en: {
      title: 'Lineages: Knowing Tribes and Clans',
      summary: 'The science of genealogy, its uses, and its ethical limits.',
      body: 'Genealogy is the knowledge of people\u0027s lineages, tribes and sub-clans, a science the Arabs cultivated and scholars recorded in dedicated works.\n\nIts use: identifying notable figures, distinguishing narrators with similar names, preserving kinship ties, and knowing relations on which rulings of maintenance, inheritance, guardianship and marriage depend.\n\nIts limits: lineage is not established by mere claim but by evidence and recognised widespread testimony. The law forbids attacking lineages or claiming a father other than one\u0027s own: "Whoever claims a father other than his own knowingly, Paradise is forbidden to him."',
    },
  },
  {
    sub: 'buldan',
    type: 'article',
    slug: 'buldan-rihlat',
    ar: {
      title: 'البلدان والرحلات: قيمة الرحلة في طلب العلم',
      summary: 'علم البلدان والرحلات العلمية، وفوائده لأهل الحديث والتاريخ.',
      body: 'عنيت الأمّة بعلم البلدان ومعرفة الأمصار والمدن ومواقعها وخططها، وكتبت فيه مؤلفات مثل: البلدان لليعقوبي، ومعجم البلدان لياقوت، والروض المعطار.\n\nوالرحلة في طلب العلم سنّة متّبعة؛ رحل جابر بن عبد الله شهرًا لأجل حديث واحد، ورحل البخاري ومسلم وأبو داود والترمذي في الأمصار يجمعون السنة ويقابلون الشيوخ، فحفظ الله بهم الدين.\n\nوثمرة الرحلات: العلوّ في الأسانيد، وملاقاة الشيوخ ومذاكرتهم، والوقوف على أحوال البلاد ومذاهب أهلها. وقد وصف العلماء أدب الرحلة وأهمية الصبر والتحصيل، فلا علم بلا تعب ولا تحمّل.',
    },
    en: {
      title: 'Lands and Journeys: The Value of Travel in Seeking Knowledge',
      summary: 'The science of places and scholarly travel in hadith and history.',
      body: 'The community cultivated the knowledge of countries, their cities, layouts and locations, producing works such as al-Yaʿqūbī\u0027s Lands and Yāqūt\u0027s Dictionary of Places.\n\nTravel in pursuit of knowledge is an established practice: Jābir b. ʿAbdullāh travelled a month for a single hadith, and al-Bukhārī, Muslim, Abū Dāwūd and al-Tirmidhī journeyed between regions gathering the Sunnah and meeting teachers.\n\nThe fruits are higher chains, direct learning from scholars, and firsthand knowledge of lands and their schools. Scholars described the etiquette of travel and the need for patience; knowledge is not gained without effort.',
    },
  },
  {
    sub: 'nubuwwah',
    type: 'lesson',
    slug: 'nubuwwah-risalat',
    ar: {
      title: 'النبوّة والرسالات: ضرورتها وخصائصها',
      summary: 'لماذا بعث الله الرسل؟ وما الفرق بين النبي والرسول؟',
      body: 'النبوّة اصطفاء من الله لبعض عباده بوحيٍ يخصّهم به؛ وقد بعث الله الرسل لهداية الناس وإقامة الحجة عليهم، قال تعالى: «رسلًا مبشّرين ومنذرين لئلا يكون للناس على الله حجة بعد الرسل».\n\nوالفرق بين النبي والرسول: أن الرسول يُوحى إليه بشرع جديد ويُؤمر بتبليغه، والنبي يُوحى إليه فيُبلّغ ما أُمر. والرسالات خُتمت بمحمد ﷺ، فلا نبي بعده.\n\nوخصائص الأنبياء: أنهم معصومون فيما يبلّغون عن الله، وأنهم بشر لا يملكون لأنفسهم ضرًّا ولا نفعًا، وأنهم أفضل الخلق، وأن الإيمان بهم جميعًا شرط في الإيمان، ومن كفر بواحد منهم فقد كفر بالجميع.',
    },
    en: {
      title: 'Prophethood and Messages: Necessity and Characteristics',
      summary: 'Why did God send messengers, and what distinguishes a prophet from a messenger?',
      body: 'Prophethood is God\u0027s selection of servants to receive revelation. Messengers were sent to guide people and establish the proof against them: "Messengers as bearers of good news and warners, so that people may have no argument against God after the messengers."\n\nA messenger receives a new law and is commanded to convey it; a prophet receives revelation and conveys what he is commanded. Messengership ended with Muhammad ﷺ; there is no prophet after him.\n\nProphets are protected in what they convey from God, yet they are human and own no harm or benefit for themselves. Believing in all of them is a condition of faith; rejecting one is rejecting all.',
    },
  },
  {
    sub: 'ahl-bayt',
    type: 'article',
    slug: 'ahl-bayt-sahabah',
    ar: {
      title: 'أهل البيت والصحابة: المحبّة والاعتقاد',
      summary: 'من هم أهل البيت؟ وما منزلة الصحابة في الاعتقاد؟',
      body: 'أهل بيت النبي ﷺ هم أزواجه وقرابته المؤمنون، وآل عليّ وآل جعفر وآل العباس، وقد أوصى الله ورسوله بهم خيرًا، قال تعالى: «قل لا أسألكم عليه أجرًا إلا المودة في القربى»، وقال ﷺ في غدير خُم: «أُذكّركم الله في أهل بيتي».\n\nوأهل السنّة يُحبّون أهل البيت ويُوالونهم ويُثنون عليهم، ويُقدّمون من قدّمهم الله، ولا يغلون في أحد منهم، ولا يتّخذونهم أربابًا من دون الله.\n\nوأما الصحابة فهم خير القرون، أثنى الله عليهم في كتابه ورضي عنهم، ويحرُم سبّهم ولعنهم، وهم نقلة الدين ووسطاء الوحي، ومن طعن فيهم فقد قدح في الدين نفسه؛ فلا يقوم القرآن والسنة إلا بشهادتهم ونقلهم.',
    },
    en: {
      title: 'The Prophet\u0027s Family and Companions: Love and Belief',
      summary: 'Who are the household of the Prophet, and what is the status of the Companions?',
      body: 'The Prophet\u0027s household includes his wives and believing relatives: the families of ʿAlī, Jaʿfar and al-ʿAbbās. God and His Messenger commended them: "Say: I ask no reward except love for the near of kin," and at Ghadīr Khumm he said: "I remind you of God concerning my household."\n\nSunni Muslims love and honour them, give precedence to whom God gave precedence, avoid excess regarding them, and do not take them as lords besides God.\n\nThe Companions are the best of generations; God praised them and was pleased with them, and reviling them is forbidden. They transmitted the religion and the revelation, so attacking them undermines the religion itself; the Quran and Sunnah reached us through their transmission.',
    },
  },
  {
    sub: 'amal-qulub',
    type: 'lesson',
    slug: 'amal-qulub',
    ar: {
      title: 'أعمال القلوب: الإخلاص والرجاء والخوف',
      summary: 'أعمال القلوب وأثرها في صلاح العبد وقبول العمل.',
      body: 'أعمال القلوب كالإخلاص والمحبة والخوف والرجاء والتوكّل والإنابة والرضا، وهي أصل صلاح الظاهر؛ فالعبادات لا تُقبل إلا بإخلاص ومتابعة، قال تعالى: «وما أمروا إلا ليعبدوا الله مخلصين له الدين».\n\nوالإخلاص: أن يقصد العبد بعمله وجه الله لا رياءً ولا سُمعة. والخوف: أن يخشى الله في السرّ والعلن فيحمله على الطاعة. والرجاء: أن يعتمد على رحمة الله وفضله فلا يقنط من رحمته.\n\nوالمؤمن يقف بين الرجاء والخوف، لا يقنط من الرحمة ولا يأمن مكر الله؛ فمن عبد الله بالخوف وحده وقع في القنوط، ومن عبده بالرجاء وحده وقع في الأمن، ومن عبده بالخوف والرجاء استقام.',
    },
    en: {
      title: 'Deeds of the Heart: Sincerity, Hope and Fear',
      summary: 'Inner acts of worship and their effect on outward righteousness.',
      body: 'The deeds of the heart, such as sincerity, love, fear, hope, reliance, turning to God and contentment, are the root of outward righteousness. Worship is only accepted with sincerity and following the Prophet: "They were commanded only to worship God, sincere to Him in religion."\n\nSincerity means seeking God alone, not showing off. Fear guards obedience in private and public, while hope trusts in God\u0027s mercy without despairing.\n\nThe believer stands between hope and fear, neither despairing of mercy nor feeling safe from God\u0027s plan: one who worships God by fear alone falls into despair, by hope alone into false security, and by both together remains upright.',
    },
  },
  {
    sub: 'adab-shariah',
    type: 'lesson',
    slug: 'adab-shariah',
    ar: {
      title: 'الآداب الشرعية: أدب المسلم في حياته',
      summary: 'ما الآداب الشرعية؟ وأمثلة من آداب اللسان والمجلس.',
      body: 'الآداب الشرعية هي ما وجّه إليه الشرع من أخلاق حسنة وأفعال مستحسنة في كل أحوال العبد: في بيته ومسجده وسوقه ومجالسه، مع ربّه ومع الناس ومع نفسه.\n\nومنها آداب اللسان: حفظ اللسان عن الغيبة والنميمة والكذب والمراء والخصومة، قال ﷺ: «من كان يؤمن بالله واليوم الآخر فليقل خيرًا أو ليصمت». ومن آداب المجلس: السلام عند الدخول، والجلوس حيث ينتهي به المجلس، وإفساح المجلس للآخرين، وعدم التناجي دون الجميع.\n\nوغاية الآداب: تزكية النفس، وإصلاح المجتمع، وتقوية الأخوّة، ووصول العبد إلى مقام الإحسان بأن يعبد الله كأنه يراه.',
    },
    en: {
      title: 'Islamic Etiquette in Daily Life',
      summary: 'What is Sharīʿah etiquette, with examples of speech and gatherings.',
      body: 'Islamic etiquette covers the good character and conduct the law has directed in all states: at home, in the mosque, in the market and in gatherings, with God, with people, and with oneself.\n\nAmong the etiquettes of speech: guarding the tongue from backbiting, gossip, lying, disputation and quarrelling: "Whoever believes in God and the Last Day, let him speak good or remain silent." Among the etiquettes of gatherings: greeting on entry, sitting where space is found, making room for others, and not whispering privately in front of a third person.\n\nIts goal is purifying the soul, reforming society, strengthening brotherhood, and reaching the station of worshipping God as though one sees Him.',
    },
  },
  {
    sub: 'raqaiq',
    type: 'lesson',
    slug: 'raqaiq-zuhd',
    ar: {
      title: 'الرقائق والزهد: ترقيق القلوب',
      summary: 'معنى الزهد، وأثره في القلوب، ومنهج السلف فيه.',
      body: 'الرقائق: الأحاديث والأخبار التي تُلين القلب وتُذكّر بالآخرة، والزهد: ترك ما لا ينفع في الآخرة؛ وليس الزهد بتحريم الحلال ولا بإضاعة المال، بل ترك الرغبة فيما عند الناس مع إقبال على الله.\n\nوقد كان النبي ﷺ وخلفاؤه أزهد الناس مع كثرة الفتوح. ونهى السلف عن الغلو في الرقائق والأخبار الموضوعة، فقبلوا ما صحّ وتركوا ما لم يثبت.\n\nوثمرة الزهد: راحة القلب، وخلاصه من الطمع، وقوة الإيمان، والاستعداد للموت؛ فمن زهد في الدنيا بحقيقة الزهد عاش حرًّا، ومات مطمئنًّا، ولقي الله وهو عنه راضٍ.',
    },
    en: {
      title: 'Softening the Heart and Detachment (Zuhd)',
      summary: 'The meaning of zuhd, its effect on the heart, and the early scholars\u0027 approach.',
      body: 'Softening reports are the hadiths and accounts that tender the heart and remind of the Hereafter. Zuhd is leaving what does not benefit in the Hereafter; it is not forbidding the lawful or wasting wealth, but freeing the heart from craving what people possess while turning to God.\n\nThe Prophet ﷺ and the earliest caliphs were the most detached despite the conquests. The early scholars also warned against exaggeration and fabricated reports, accepting what was authentic and leaving what was not.\n\nThe fruit is a restful heart, freedom from greed, stronger faith, and preparedness for death.',
    },
  },
  {
    sub: 'majalis',
    type: 'article',
    slug: 'majalis-dawah',
    ar: {
      title: 'إدارة المجالس الدعوية: التخطيط والتأثير',
      summary: 'كيف يُعدّ المجلس الدعوي ويُدار ليحقّق أثره؟',
      body: 'المجالس الدعوية هي لقاءات العلم والتذكير التي تُقام في المساجد والمراكز والمنازل، وإدارتها فنّ يحتاج تخطيطًا وأخلاقًا وعلمًا، لا مجرّد كلمة تُلقى ثم تُنسى.\n\nومن أصول إدارتها: تحديد الهدف من المجلس، ومراعاة حال الحاضرين ومستوياتهم، والبدء بالأهم فالمهم، والجمع بين الترغيب والترهيب، وإدارة الوقت، وإشراك الحاضرين بالحوار والسؤال.\n\nومن آداب القائم على المجلس: الرِّفق بالناس، والبشاشة، والعدل، وعدم التطويل المملّ ولا التقصير المخلّ، ومتابعة أثر المجلس بالتذكير والمراسلة؛ فالمقصود من المجلس ليس الكلام بل صلاح الحاضرين.',
    },
    en: {
      title: 'Managing Daʿwah Gatherings: Planning and Impact',
      summary: 'How a daʿwah gathering is prepared and run to be effective.',
      body: 'Daʿwah gatherings are sessions of knowledge and reminder in mosques, centres and homes. Running them is a craft requiring planning, good character and knowledge, not merely a speech delivered and forgotten.\n\nCore principles: define the purpose, consider the audience and their levels, start with what matters most, combine encouragement with warning, manage time, and engage the audience through dialogue and questions.\n\nThe organiser should be gentle and cheerful, fair, neither tediously long nor negligently brief, and should follow up afterwards; the point of the gathering is not talk but the improvement of those present.',
    },
  },
  {
    sub: 'feminism',
    type: 'article',
    slug: 'feminism-response',
    ar: {
      title: 'النسوية: الدعاوى والمناقشة العلمية',
      summary: 'أبرز دعاوى الخطاب النسوي، والمناقشة الشرعية لها.',
      body: 'الخطاب النسوي الحديث تيّار متعدّد المشارب، يرفع شعار تحرير المرأة وإنصافها، ويقوم في كثير من صوره على افتراض «الصراع» بين الرجل والمرأة، وعلى إعادة تعريف الأسرة والمسؤوليات.\n\nوالمناقشة العلمية تبيّن أن الشريعة سبقت كل الخطابات إلى إعطاء المرأة حقوقها: في التملّك والتصرف والميراث والشهادة والتعليم والعمل، مع تكريمها وحفظها؛ وأن ما يُسمّى اختلافًا بين الرجل والمرأة في بعض الأحكام ليس ظلمًا، بل توزيع للأدوار بما يوافق فطرة كل منهما وتكليفه.\n\nوالمقصود: المناقشة بالدليل لا بالمقولة، والتمييز بين المطالب العادلة في التعليم والأمان والحفظ من الظلم، وهي من الشريعة، وبين الدعاوى التي تُهدّم الأسرة والمعنى الشرعي للرحم؛ فالعدل مطلوب، والانحراف مرفوض.',
    },
    en: {
      title: 'Feminism: Claims and Scholarly Discussion',
      summary: 'Key claims of modern feminist discourse and their Sharīʿah assessment.',
      body: 'Modern feminist discourse is a multi-stranded current that raises the banner of liberating and doing justice to women, and in many forms rests on an assumed conflict between men and women and on redefining family and roles.\n\nScholarly discussion shows the Sharīʿah preceded all such discourse in granting women their rights: ownership, disposal of property, inheritance, testimony, education and work, with honour and protection. Apparent differences in some rulings are not injustice but a distribution of roles consistent with each one\u0027s nature and responsibility.\n\nThe purpose is to discuss with evidence rather than slogans, distinguishing legitimate demands for education, safety and protection from injustice, which the law already upholds, from claims that dismantle the family and the revealed meaning of kinship.',
    },
  },
  {
    sub: 'batiniyyah',
    type: 'article',
    slug: 'batiniyyah-firaq',
    ar: {
      title: 'الفرق الباطنية: المنهج والموقف الشرعي',
      summary: 'ما الباطنية؟ وأخطر أصولها، وموقف أهل السنة منها.',
      body: 'الباطنية اسم جامع لفرق ذهبت إلى أن للنصوص الشرعية ظاهرًا وباطنًا، وأن الباطن مُستودَع عند أئمة معصومين، يُصرف إليه المعنى دون الظاهر؛ ومن أشهرها: الإسماعيلية، والنصيرية، والقرامطة.\n\nومن أخطر أصولهم: القول بالحلول والتناسخ عند بعضهم، وإسقاط التكاليف عن «الخاصة»، وتأويل المعاد والجنة والنار بالمجاز، والقدح في الصحابة وتكفير المخالفين.\n\nوموقف أهل السنة: إثبات الظاهر والباطن المعتبر من غير إبطال للنص، والتحذير من التأويلات التي تُخرج النصوص عن معانيها، والتمييز بين أهل الإسلام والفرق الغالية؛ فالحق ما جاء به الكتاب والسنة على فهم الصحابة.',
    },
    en: {
      title: 'Esoteric Sects: Method and the Scholarly Position',
      summary: 'What esotericism is, its most dangerous principles, and the Sunni stance.',
      body: 'Bāṭiniyyah is a collective name for sects holding that revealed texts have an outward and an inward meaning, the inward kept with infallible imams and preferred over the outward. Among the most famous: Ismāʿīliyyah, Nuṣayriyyah and Qarāmiṭah.\n\nTheir most dangerous principles include incarnation and reincarnation among some, suspending obligations for the elite, interpreting resurrection, Paradise and Hell metaphorically, and attacking the Companions.\n\nThe Sunni position affirms the outward and the legitimate inward without nullifying the text, warns against interpretations that remove texts from their meaning, and distinguishes Islam from extreme sects; the truth is what the Book and Sunnah brought, understood as the Companions understood it.',
    },
  },
  {
    sub: 'eastern-religions',
    type: 'article',
    slug: 'eastern-religions-overview',
    ar: {
      title: 'الأديان الشرقية والوضعية: عرض ونقد',
      summary: 'الهندوسية والبوذية، وأديان وضعية أخرى، والمنهج في مناقشتها.',
      body: 'الأديان الشرقية مجموعة واسعة من المعتقدات نشأت في الهند والصين واليابان، وأشهرها الهندوسية: نظام من الطقوس والآلهة المتعددة وكتب الفيدا والأوبانيشاد، وتقوم على التناسخ والطبقات الوراثية. والبوذية: تأسّست على بوذا، وتقوم على «الحقائق الأربع» والانطلاق من الألم في «النرفانا»، وهي في الأصل لا تُثبت إلهًا خالقًا.\n\nومن الأديان الوضعية الحديثة: البهائية، والقاديانية، والسيانتولوجيا، وغيرها، وهي مذاهب أحدثها بشر ولم تُثبت بنبوّة.\n\nومنهج مناقشتها: عرضها بموضوعية، ونقد أصولها العقلية والدينية بالبرهان، والإحسان في المحاورة؛ فلا تُواجه بالمهاترة، ولا تُقبل بغير دليل، قال تعالى: «ادع إلى سبيل ربك بالحكمة والموعظة الحسنة وجادلهم بالتي هي أحسن».',
    },
    en: {
      title: 'Eastern and Man-Made Religions: Exposition and Critique',
      summary: 'Hinduism, Buddhism, and modern manufactured religions, with a sound approach.',
      body: 'The Eastern religions are a broad family of beliefs originating in India, China and Japan. Hinduism is a system of rites and many deities, with the Vedas and Upanishads, resting on reincarnation and hereditary castes. Buddhism, founded on the Buddha, rests on the Four Noble Truths and release from suffering in nirvana, and originally does not affirm a creator god.\n\nModern manufactured religions include the Bahāʾī faith, Aḥmadiyyah, Scientology and others: doctrines founded by people without proven prophethood.\n\nThe approach is to present them objectively, critique their foundational claims with evidence, and debate with courtesy: "Call to the way of your Lord with wisdom and good instruction, and argue with them in the best manner."',
    },
  },
];
