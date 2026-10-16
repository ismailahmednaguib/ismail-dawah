// scripts/topics-data-5.mjs
// ============================================================================
// الدفعة الخامسة: إكمال الأبواب التي بقي فيها عنصران فقط، لتصل إلى ثلاثة.
//
// نفس بنية الدفعات السابقة: sub · kind · type · slug · ar · en
// ============================================================================

export const TOPICS = [
  {
    sub: 'asbab-nuzul',
    kind: 'subbranch',
    type: 'article',
    slug: 'asbab-nuzul-benefits',
    ar: {
      title: 'فوائد معرفة سبب النزول في دفع الإشكال',
      summary: 'أمثلة عملية يعيّن فيها السبب معنى الآية ويرفع الإشكال عنها.',
      body: 'كثير من الآيات تحتمل أكثر من معنى، فيأتي سبب النزول فيعيّن المراد ويرفع التردّد؛ كآية اللعان، وآية الظهار، وقوله: «ولا تقربوا الصلاة وأنتم سكارى» فإنّ السبب بيّن أنّ المراد حال السكر لا تحريم الصلاة.\n\nومن فوائده أيضًا: دفع توهّم الحصر؛ فقوله تعالى: «والذين يكنزون الذهب والفضة» نزل في أهل الكتاب، لكن الحكم عامّ في كلّ من يفعل ذلك، والعبرة بعموم اللفظ لا بخصوص السبب.\n\nويُستفاد منه كذلك في معرفة تاريخ التشريع والتدرّج فيه، وفي معرفة أسماء من نزلت فيهم الآيات من الصحابة.',
    },
    en: {
      title: 'Benefits of Knowing the Reason of Revelation',
      summary: 'Practical examples where the occasion fixes a verse\u0027s meaning and removes difficulty.',
      body: 'Many verses admit more than one meaning, and the occasion of revelation fixes the intended one and removes hesitation, as with the verse of mutual imprecation, the verse of zihar, and "do not approach prayer while intoxicated," where the occasion shows the intent is the state of drunkenness, not a prohibition of prayer.\n\nAnother benefit is removing the illusion of restriction: "those who hoard gold and silver" was revealed concerning the People of the Book, yet the ruling is general for anyone who does so, since the criterion is the generality of the wording, not the particularity of the occasion.\n\nIt also helps in knowing the chronology and gradual development of legislation, and in knowing which Companions verses were revealed about.',
    },
  },
  {
    sub: 'comparative-religion',
    kind: 'subbranch',
    type: 'article',
    slug: 'comparative-religion-common-ground',
    ar: {
      title: 'المشترك بين الأديان وحدود التقارب',
      summary: 'إلى أي حدّ يصحّ القول بالمشترك، وأين ينتهي الحوار؟',
      body: 'مشترك الأديان ليس عقيدةً واحدةً، بل مساحةٌ عملية في الأخلاق والعدل والتعاون على الخير؛ كقوله تعالى: «تعالوا إلى كلمة سواء» أي كلمة عدلٍ لا كلمة توحيدٍ على مقتضى اعتقاد كل فريق.\n\nفالتقارب في الأخلاق والعمل المدني مشروع، والتقارب في العقيدة ممتنع؛ لأنّ العقيدة إمّا توحيدٌ أو شرك ولا وسط بينهما. ومن الخطأ أن يُقال: «كل الأديان سواء» أو «كلها توصّل إلى الله»؛ فهذا مخالف للنصوص والإجماع.\n\nوالصواب: بيان ما وافقنا فيه أهل الكتاب من الإيمان بالله واليوم الآخر، وبيان ما خالفونا فيه من التثليث والتحريف، مع حفظ العهد والأمان والأخلاق في المعاملة.',
    },
    en: {
      title: 'Common Ground Between Religions and Its Limits',
      summary: 'To what extent is common ground valid, and where does dialogue end?',
      body: 'Common ground between religions is not a single creed but a practical space in ethics, justice, and cooperation in good, as in "come to a common word," that is, a word of justice, not a word of monotheism according to each party\u0027s belief.\n\nConvergence in ethics and civic action is legitimate; convergence in creed is impossible, because creed is either monotheism or polytheism with no middle. It is wrong to say "all religions are equal" or "they all lead to God," for that contradicts the texts and consensus.\n\nThe right approach is to state where the People of the Book agree with us in belief in God and the Last Day, and where they differ from us in trinitarianism and distortion, while preserving covenant, trust, and good conduct in dealings.',
    },
  },
  {
    sub: 'dawah-manhaj',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'dawah-priorities',
    ar: {
      title: 'أولويات الداعية في زمن الفتن',
      summary: 'كيف يرتّب الداعية جهده بين الدعوة والتربية والإصلاح؟',
      body: 'الأولوية الأولى: إصلاح نفسه وأهله؛ فقوله تعالى: «قوا أنفسكم وأهليكم نارًا» مقدّمٌ على غيره، ومن أهمل بيته دعا الناس إلى ما لا يطبّقه.\n\nثم الدعوة إلى التوحيد وإقامة أركان الدين، ثم التربية على العلم والعمل، ثم الإصلاح العام بحسب القدرة والاختصاص. ومن الفقه في الدعوة: عدم الانشغال بالمعارك الجانبية عن الأصل، وترك ما لا ينفع، ومراعاة المصالح ودفع المفاسد.\n\nويوصي الداعية بالرفق والبيان والعلم، وأن لا يستعجل الثمرة؛ فالدعوة زرعٌ يحتاج صبرًا، والنتائج بيد الله.',
    },
    en: {
      title: 'The Caller\u0027s Priorities in Times of Trial',
      summary: 'How does the caller order his effort between dawah, education, and reform?',
      body: 'The first priority is reforming oneself and one\u0027s family: "protect yourselves and your families from a fire" precedes the rest, and whoever neglects his household calls people to what he does not practise.\n\nThen calling to monotheism and establishing the pillars of religion, then education in knowledge and action, then public reform according to ability and specialism. Part of the wisdom of dawah is not being distracted by side battles from the root, leaving what does not benefit, and weighing interests and preventing harms.\n\nThe caller is advised to be gentle, clear, and knowledgeable, and not to hasten the fruit; dawah is planting that needs patience, and results are in God\u0027s hand.',
    },
  },
  {
    sub: 'family',
    kind: 'field',
    type: 'lesson',
    slug: 'family-rights-duties',
    ar: {
      title: 'حقوق الزوجين ومسؤولياتهما',
      summary: 'توزيع الأدوار في البيت على أساس الشرع والعدل والتشاور.',
      body: 'أساس العلاقة الزوجية: «ولهنّ مثل الذي عليهنّ بالمعروف»، فكلٌّ له حقٌّ وواجب. ومن حقوق الزوجة: النفقة والكسوة والسكن بالمعروف، وحسن المعاشرة، وعدم الإضرار. ومن حقوق الزوج: الطاعة في المعروف، وحفظ البيت والسرّ، وحسن التدبير.\n\nوالقيام على البيت مسؤوليةٌ لا تكليفٌ بالتحكّم؛ فيُبنى على الرحمة والمشاورة، ويُتجاوز عن الهفوات، ويُحلّ الخلاف بالحوار لا بالإهانة أو الهجران الطويل.\n\nوحقّ الأولاد عظيم: التربية والتعليم والعدل بينهم، والإنفاق، والنصح بالرفق؛ فالتقصير في حقّهم من أعظم الخسارة يوم القيامة.',
    },
    en: {
      title: 'Rights and Responsibilities of Spouses',
      summary: 'Distributing roles in the home on the basis of Shariah, justice, and consultation.',
      body: 'The basis of the marital relationship is "they have rights similar to those over them, in kindness," so each has a right and a duty. Among the wife\u0027s rights are maintenance, clothing, and housing in kindness, good companionship, and freedom from harm. Among the husband\u0027s rights are obedience in what is right, protecting the home and its secrets, and good management.\n\nServing as head of the household is a responsibility, not a licence to dominate; it is built on mercy and consultation, overlooking slips, and resolving disputes through dialogue rather than insult or prolonged abandonment.\n\nThe children\u0027s rights are great: upbringing, education, fairness among them, spending, and gentle advice; negligence of their rights is among the greatest losses on the Day of Resurrection.',
    },
  },
  {
    sub: 'khulafa',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'khulafa-umar',
    ar: {
      title: 'خلافة عمر بن الخطاب: العدل والإدارة',
      summary: 'كيف صار عهد عمر مدرسةً في العدل والتقنين والمحاسبة؟',
      body: 'امتاز عهد عمر بالعدل والتوسّع في الإدارة: فوضع التاريخ الهجري، ونظّم الدواوين والخراج، وقسّم الأمصار، وطوّر القضاء بالكتابة والشهود وضبط مواعيد الفصل، وأمّن حدود الدولة بالثغور والجيوش.\n\nوشدّد في محاسبة الولاة، وضرب أروع الأمثلة في التواضع والزهد، ووسّع الشورى، واستعان بالنساء والرعية في النصح، حتى صار عهده مضرب المثل في عدل الحاكم ورحمة الرعية.\n\nوفُتح في عهده الشام ومصر والعراق وفارس، وساد الأمن حتى قيل: لا تُقطع يدٌ في سرقة ولا ينام راعٍ خائفًا، ثم خُتم بالفتنة والشهادة، وما زال عدله مثار الإجماع على محبته والترضي عنه.',
    },
    en: {
      title: 'The Caliphate of Umar: Justice and Governance',
      summary: 'How did Umar\u0027s era become a school of justice, legislation, and accountability?',
      body: 'Umar\u0027s era was marked by justice and administrative expansion: he established the Hijri calendar, organised the registers and land tax, divided the garrison cities, developed the judiciary with written records, witnesses, and fixed session times, and secured the state\u0027s frontiers with garrisons and armies.\n\nHe was strict in holding governors accountable, set the finest examples of humility and asceticism, widened consultation, and sought advice from women and subjects, until his era became proverbial for the ruler\u0027s justice and mercy toward the ruled.\n\nSyria, Egypt, Iraq, and Persia were conquered in his time, and security prevailed to the point it was said no hand was cut for theft and no shepherd slept in fear. His era ended in trial and martyrdom, and his justice remains a matter of consensus in love and satisfaction with him.',
    },
  },
  {
    sub: 'mustalah',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'mustalah-sahih-hasan',
    ar: {
      title: 'الصحيح والحسن: شروط كلٍّ منهما',
      summary: 'ما الفرق بين أعلى درجات القبول وما يقاربها؟',
      body: 'الحديث الصحيح: ما اتصل سنده بنقل العدل التامّ الضبط عن مثله، إلى منتهاه، ولا يكون شاذًّا ولا معلَّلًا. والحديث الحسن: ما اتصل سنده بنقل العدل الذي خفّ ضبطه عن مثله، كذلك.\n\nفالفرق بينهما في الضبط: فالصحيح تامّ الضبط، والحسن خفيفه. والحديث الحسن حجّةٌ معمولٌ به عند جماهير الفقهاء والمحدّثين، خلافًا لمن ردّه.\n\nوقد ينقسم الحسن إلى قسمين: لذاته، ولغيره؛ وهو ما ضعُف سنده أو أُعلّ بعلّةٍ لا تقدح إذا تُوبع، فيرتقي بالشواهد إلى درجة الحسن. ويُحتجّ بهما جميعًا في الأحكام، ويُقدّم الصحيح عليه عند التعارض.',
    },
    en: {
      title: 'Sound and Good Hadith: Conditions of Each',
      summary: 'What distinguishes the highest degree of acceptance from what approaches it?',
      body: 'A sound hadith is one whose chain is continuous, transmitted by a fully precise and trustworthy narrator from his like, all the way up, and which is neither anomalous nor defective. A good hadith is one whose chain is continuous, transmitted by a trustworthy narrator of lesser precision from his like.\n\nThe difference lies in precision: the sound is fully precise, the good of lesser precision. The good hadith is authoritative and acted upon according to the majority of jurists and hadith scholars, contrary to those who rejected it.\n\nGood may be divided into that good in itself and good through others, which is weak in chain or defective with a defect that does not invalidate it when corroborated, rising through supporting evidence to the rank of good. Both are used as proof in rulings, with the sound preferred when they conflict.',
    },
  },
  {
    sub: 'names-attributes',
    kind: 'subbranch',
    type: 'article',
    slug: 'names-attributes-errors',
    ar: {
      title: 'أخطاء في باب الأسماء والصفات',
      summary: 'التشبيه والتعطيل والتحريف: أخطاء تُخرج عن الصواب.',
      body: 'من أخطاء هذا الباب: التشبيه، وهو إثبات الصفات على صفة المخلوقين؛ والتعطيل، وهو نفي الصفات عن الله؛ والتحريف، وهو صرف اللفظ عن ظاهره بغير دليل، كتأويل الاستواء بالقهر واليد بالقدرة على سبيل الجزم.\n\nومنها أيضًا: التمثيل الجزئي في بعض الصفات، والتجهيل، والتوقّف في إثبات ما أثبته الله لنفسه، وقصر الأسماء على ما ورد بصيغة الاسم فقط.\n\nوالصواب في الجميع: إثباتٌ في التنزيه، وتنزيهٌ في الإثبات، على قوله: «ليس كمثله شيء وهو السميع البصير»، وترك التكييف، وتفويض كيفيتها إلى الله مع إثبات المعنى الظاهر.',
    },
    en: {
      title: 'Errors Concerning Divine Names and Attributes',
      summary: 'Likening, denial, and distortion: errors that depart from what is correct.',
      body: 'Among the errors in this chapter are likening, which affirms the attributes in the manner of creatures; denial, which negates the attributes from God; and distortion, which diverts the wording from its apparent sense without evidence, such as explaining "rising" as domination and "hand" as power conclusively.\n\nOthers include partial likening in some attributes, ignorance, hesitation to affirm what God affirmed for Himself, and restricting the names to those in nominal form only.\n\nThe correct approach in all of it is affirmation with transcendence and transcendence with affirmation, in accord with "There is nothing like unto Him, and He is the Hearing, the Seeing," abandoning the asking of how, and entrusting the manner to God while affirming the apparent meaning.',
    },
  },
  {
    sub: 'qadar',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'qadar-calamity',
    ar: {
      title: 'القدر والاحتجاج به عند المصائب',
      summary: 'كيف يكون الإيمان بالقدر سببًا للصبر لا عذرًا للتفريط؟',
      body: 'من فقه القدر: أنّ الاحتجاج به يكون في المصائب لا في المعائب، كما قال النبي ﷺ لآدم وموسى في احتجاج كلٍّ منهما بالنصيب، وفي قوله تعالى: «قل فللّه الحجة البالغة».\n\nفالمؤمن يعلم أنّ ما أصابه لم يكن ليخطئه، وما أخطأه لم يكن ليصيبه، فيصبر ويحتسب ويرضى، ويُقدِم على الأسباب، ولا يترك الواجب بحجّة أنّ المقادير قد سبقت؛ فالشرع أمر بالعمل والأخذ بالأسباب مع التوكل.\n\nوهذا هو الجمع بين «لو» التي نهى عنها النبي ﷺ عند المصاب، و«لو» التي تكون في العلم والعمل؛ فالمؤمن يفرّ من القدر إلى القدر.',
    },
    en: {
      title: 'Decree and Pleading It at Times of Calamity',
      summary: 'How belief in decree becomes a cause of patience, not an excuse for negligence.',
      body: 'Part of understanding decree is that it is pleaded at times of calamity, not at times of fault, as in the Prophet\u0027s exchange with Adam and Moses about each one\u0027s share, and in "Say: to God belongs the conclusive argument."\n\nThe believer knows that what befell him could not miss him, and what missed him could not befall him, so he is patient, seeking reward and content, and he proceeds to take the means, not abandoning obligations on the grounds that destinies are foreordained; the law commands action and taking the means while trusting.\n\nThis reconciles the "if only" the Prophet forbade at times of affliction with the "if only" that belongs to learning and action; the believer flees from decree to decree.',
    },
  },
  {
    sub: 'sects',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'sects-innovation-vs-sin',
    ar: {
      title: 'الفرق بين البدعة والمعصية',
      summary: 'لماذا تُعدّ البدعة أشدّ من المعصية؟ وما ضابط التبديع؟',
      body: 'المعصية: مخالفة أمرٍ ورد في الشرع مع الإقرار بحسنه، فصاحبها يعلم أنّه عاصٍ ويرجو المغفرة. والبدعة: إحداث طريقةٍ في الدين لم يشرعها الله، مع ظنّ أنّها مشروعةٌ وقربةٌ، فجمعت بين المخالفة وتغيير شرع الله.\n\nولذلك كانت البدعة أشدّ؛ لأنها تتناول أصل الدين وتنسب إلى الشرع ما ليس منه، وتُضاهي الشريعة بغيرها، بينما المعصية يعرِف صاحبها أنّه خالف.\n\nوالتبديع ليس حقًّا لكل أحد؛ بل يُحكم على المقال لا على الأشخاص، ويُفرّق بين المبتدع والداعية إلى البدعة والمقلّد الجاهل، ويُسلك مع المخالف طريق النصح والبيان لا التهويل والتشهير.',
    },
    en: {
      title: 'The Difference Between Innovation and Sin',
      summary: 'Why is innovation graver than sin, and what governs declaring innovation?',
      body: 'Sin is contravening a command that the law established while acknowledging its goodness; the sinner knows he disobeys and hopes for forgiveness. Innovation is introducing a religious way God did not legislate while thinking it is legitimate and an act of worship, combining contravention with altering God\u0027s law.\n\nInnovation is therefore graver, because it touches the root of religion, attributes to the law what is not from it, and rivals the Shariah with something else, whereas the sinner knows he has contravened.\n\nDeclaring innovation is not a right for everyone; judgement falls on the statement not the person, and a distinction is drawn between the innovator, the one calling to innovation, and the ignorant imitator, approaching the one who differs with advice and clarification, not alarm and exposure.',
    },
  },
  {
    sub: 'seerah-nabawiyah',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'seerah-makkah-dawah',
    ar: {
      title: 'بعثة النبي ﷺ ومراحل الدعوة في مكة',
      summary: 'ثلاثة عشر عامًا من الدعوة: من السرّية إلى الهجرة.',
      body: 'بدأت البعثة بنزول الوحي في غار حراء، فدعا النبي ﷺ سرًّا ثلاث سنين، فأسلم من أسلم من السابقين، واتخذ دار الأرقم مقرًّا للتربية والتعليم.\n\nثم أُمر بالجهر، فواجه قريشًا بالحجة وقاوم الأذى، وصبر هو وأصحابه على الابتلاء، وهاجر إلى الحبشة فريقٌ من أصحابه، وحُوصر بنو هاشم في الشِعب، وطُرد من الطائف، وسُلّي بالإسراء والمعراج، ثم عُرض عليه الإسلام على القبائل.\n\nثم كانت بيعتا العقبة، ثم الإذن بالهجرة إلى المدينة، فانتقلت الدعوة من مرحلة الثبات إلى مرحلة البناء. وكلّ مرحلة لها دروسها: فالتدرّج وبناء الرجال والثبات على المبدأ قبل التمكين.',
    },
    en: {
      title: 'The Prophetic Mission and the Stages of Dawah in Makkah',
      summary: 'Thirteen years of dawah: from secrecy to migration.',
      body: 'The mission began with revelation in the cave of Hira. The Prophet called secretly for three years, the earliest believers embraced Islam, and he took the house of al-Arqam as a centre for education and training.\n\nThen he was commanded to speak publicly, so he confronted Quraysh with argument and endured harm, patient along with his companions in trial. A group of them migrated to Abyssinia, Banu Hashim were besieged in the valley, he was driven from Taif, he was consoled by the night journey and ascension, and he then presented Islam to the tribes.\n\nThen came the two pledges of Aqabah and permission to migrate to Madinah, moving the dawah from the stage of steadfastness to that of building. Each stage has its lessons: gradualism, building people, and firmness of principle before empowerment.',
    },
  },
  {
    sub: 'tawhid',
    kind: 'subbranch',
    type: 'article',
    slug: 'tawhid-nullifiers',
    ar: {
      title: 'نواقض التوحيد: الشرك والغلوّ',
      summary: 'ما الذي ينقض التوحيد من الاعتقاد والأقوال والأفعال؟',
      body: 'التوحيد يقابله الشرك الأكبر، وهو صرف شيءٍ من العبادة لغير الله؛ كالدعاء والذبح والنذر والخوف والرجاء والاعتقاد في المخلوق ما لا يملكه. ومنه أيضًا: الطاعة المطلقة في تحليل حرام أو تحريم حلال، والاستهزاء بالدين، وتقديم الرياء على الإخلاص.\n\nومن نواقضه الغلوّ في الصالحين: بابتداع الدعاء والاستغاثة بهم، وإطراء الصالحين بما يُخرجهم إلى مقام الربوبية، وهو أصل الشرك الأول الذي وقع فيه قوم نوح.\n\nوهذا الباب محلّ ورعٍ؛ فالتكفير بغير حقّ منهيٌ عنه، والحكم على المعيّن له شروطه وانتفاء الموانع، فَلا بدّ من أهل العلم والعدل في الحكم على الأبدان، مع بيان المقال وتحذير الخلق من الشرك.',
    },
    en: {
      title: 'The Nullifiers of Monotheism: Polytheism and Excess',
      summary: 'What nullifies monotheism in belief, words, and deeds?',
      body: 'Monotheism is opposed by major polytheism, which directs anything of worship to other than God, such as supplication, sacrifice, vows, fear, hope, and belief in a creature possessing what it does not. It also includes absolute obedience in forbidding the lawful or permitting the forbidden, mockery of religion, and preferring showing off to sincerity.\n\nAmong its nullifiers is excess concerning the righteous: inventing supplication and seeking aid from them, and praising the righteous in a way that elevates them to the station of lordship, the root of the first polytheism into which the people of Noah fell.\n\nThis chapter calls for caution: declaring people disbelievers without right is forbidden, and judgement on a specific individual has its conditions and the absence of impediments, so knowledge and fairness are required in judging persons, while the statement is clarified and people are warned against polytheism.',
    },
  },
  {
    sub: 'tazkiyah-nafs',
    kind: 'subbranch',
    type: 'article',
    slug: 'tazkiyah-self-accounting',
    ar: {
      title: 'محاسبة النفس ومراقبتها',
      summary: 'كيف يجعل المسلم لنفسه وقفةً يوميةً تُصلح قلبه وعمله؟',
      body: 'المحاسبة أن يتفقّد العبد نفسه: ماذا عمل في يومه؟ وعلامَ صرف وقته؟ وهل أدّى الفرائض على وجهها؟ ومرادها استدراك ما فات وتنشيط ما فتر، لا القنوط والجلد للذات.\n\nوأنفع ما يعين عليها: الميزان اليومي قبل النوم، ومحاسبة على ثلاثة أمور: واجبٌ تركه، ومحرمٌ فعله، ودرجةٌ قصر فيها؛ ثم العزم على التوبة والاستدراك.\n\nوتُقرن المحاسبة بالمراقبة: شهود أنه سبحانه مطّلعٌ على السرّ والنجوى، وهو مقامٌ يُورث الإخلاص والحياء. ومن علامة صدقها: أنّ العبد يكره اطلاع الناس على ما يستحي منه من الله، لا العكس.',
    },
    en: {
      title: 'Self-Accounting and Watchfulness',
      summary: 'How does a Muslim make a daily pause that repairs the heart and the deed?',
      body: 'Accounting is examining oneself: what did I do today, on what did I spend my time, did I perform the obligations properly? Its purpose is to make up what was missed and re-energise what has slackened, not despair and self-flagellation.\n\nMost helpful for it is the daily scale before sleep, and accounting on three things: an obligation left undone, a prohibition committed, and a rank fallen short in; then resolving to repent and make up.\n\nAccounting is joined to watchfulness: the awareness that He sees the secret and the whisper, a station that produces sincerity and modesty. A sign of its truth is that the servant dislikes people\u0027s seeing what he is ashamed of before God, and not the reverse.',
    },
  },
];
