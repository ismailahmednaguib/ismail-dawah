// scripts/topics-data-3.mjs
// الدفعة الثالثة من محتوى المواضيع الفرعية (عربي + إنجليزي).

export const TOPICS = [
  {
    sub: 'judaism-christianity',
    type: 'article',
    slug: 'judaism-christianity-view',
    ar: {
      title: 'اليهودية والنصرانية: عرض ونقد',
      summary: 'نشأة الديانتين، وتحريف كتبهما، وموقف الإسلام منهما.',
      body: 'اليهودية والمسيحية ديانتان سماويتان في أصلهما؛ أُنزلت التوراة على موسى عليه السلام والإنجيل على عيسى عليه السلام، قال تعالى: «إنّا أنزلنا التوراة فيها هدى ونور»، وقال: «وآتيناه الإنجيل فيه هدى ونور».\\n\\nومن أصول الإسلام فيهما: الإيمان بأن الله أنزل التوراة والإنجيل، وأن ما بأيدي أهلهما اليوم قد دخل التحريف والتبديل على بعضه، ولا نجزم بأن كل لفظ محرّف، وإنما نؤمن بما وافق القرآن ونردّ ما خالفه.\\n\\nوأما دعاوى المسيحية من التثليث والحلول والصلب والفداء، فالقرآن صريح في ردها: «لقد كفر الذين قالوا إن الله ثالث ثلاثة»، و«ما قتلوه وما صلبوه ولكن شبه لهم»، و«قل هو الله أحد». ومنهج الحوار مع أهل الكتاب: الجدال بالتي هي أحسن، والإحسان إليهم في المعاشرة ما لم يقاتلونا، والعدل معهم، قال تعالى: «لا ينهاكم الله عن الذين لم يقاتلوكم في الدين ولم يخرجوكم من دياركم أن تبروهم وتقسطوا إليهم».',
    },
    en: {
      title: 'Judaism and Christianity: Exposition and Assessment',
      summary: 'Their origins, textual alteration, and the Islamic position.',
      body: 'Judaism and Christianity were originally revealed religions: the Torah was sent to Moses and the Gospel to Jesus, peace be upon them: "We sent down the Torah, in which is guidance and light," and "We gave him the Gospel, in which is guidance and light."\\n\\nIslamic belief regarding them: God revealed the Torah and the Gospel, and what their followers possess today has suffered alteration in part. We do not claim every word is changed, but we affirm what agrees with the Quran and reject what contradicts it.\\n\\nAs for Christian claims of the Trinity, incarnation, crucifixion and atonement, the Quran rejects them decisively: "They disbelieved who said God is the third of three"; "They did not kill him, nor did they crucify him, but it was made to appear so"; "Say: He is God, the One." Dialogue with the People of the Book is conducted courteously and justly: "God does not forbid you from being kind and just to those who did not fight you or drive you out."',
    },
  },
  {
    sub: 'nahw',
    type: 'lesson',
    slug: 'nahw-intro',
    ar: {
      title: 'النحو: نشأته وأشهر مدارسه ومسائله',
      summary: 'كيف نشأ علم النحو؟ وما الحاجة إليه في فهم الوحي؟',
      body: 'النحو علم يُبحث فيه عن أحوال أواخر الكلم إعرابًا وبناءً، وعن قواعد تركيب الجملة. نشأ حفظًا للقرآن الكريم من اللحن، فتأسّس على يد أبي الأسود الدؤلي، ثم أكمل معالم مدرسة البصرة: عيسى بن عمر والخليل بن أحمد وسيبويه.\\n\\nوالمدارس النحوية: البصرة والكوفة وبغداد والأندلس ومصر. واختلفوا في مسائل أشهرها: «الْعامل» وتقديراته، وحُجّتهم الاحتجاج بالشعر العربي وبكلام الفصحاء.\\n\\nوأشهر المصنفات: الكتاب لسيبويه، والكافية والشافية لابن مالك، وألفية ابن مالك، وتطبيق على النصوص. والحاجة إلى النحو: فهم القرآن والسنة، فإن التفسير والأحكام تُبنى على معرفة الإعراب والمعاني؛ فغيره لا يدرك أكثر دقائق الكلام.',
    },
    en: {
      title: 'Arabic Grammar: Origins, Schools and Key Issues',
      summary: 'How grammar arose, and why it matters for understanding revelation.',
      body: 'Grammar (naḥw) studies the state of word endings and the rules of sentence construction. It arose to guard the Quran against errors, founded by Abū al-Aswad al-Duʾalī, and completed by the Basran school: ʿĪsā b. ʿUmar, al-Khalīl and Sībawayh.\\n\\nThe grammatical schools are Baṣrah, Kūfah, Baghdad, Andalusia and Egypt, disputing issues such as the governing factor and its implication, with Arabic poetry and eloquent speech as evidence.\\n\\nMajor works include Sībawayh\\u0027s Book, Ibn Mālik\\u0027s Kāfiyah and Alfiyyah. Grammar is needed to understand the Quran and Sunnah, since exegesis and rulings depend on knowing case endings and meanings; without it much of the fine meaning of speech is missed.',
    },
  },
  {
    sub: 'sarf',
    type: 'lesson',
    slug: 'sarf-intro',
    ar: {
      title: 'الصرف: بنية الكلمة وأوزانها',
      summary: 'علم الصرف، وأهميته في فهم اللغة والقرآن.',
      body: 'الصرف علم يُبحث فيه عن بنية الكلمة المفردة من حيث الصحة والاعتلال، والتجريد والزيادة، والوزن والمعنى. وهو أصل النحو؛ لأن الكلمة تُبنى أولًا ثم تُنصب في الجملة، ولذلك قيل: «الصرف أمّ العلوم، والنحو أبوها».\\n\\nومن مباحثه: الميزان الصرفي «فَـعَـلَ ويَفْعُلُ وفاعل وفَعّال»، وأبنية الفعل الثلاثي والرباعي، والزيادة، والميزان الصرفي، والإعلال والإبدال، والهمزة.\\n\\nويعرف طالب الصرف معاني الأبنية: فالتاء في «أستغفر» للطلب، والسين والتاء فيه، والواو في «واحد»، والألف والتاء في «فاعلة» تُذكر للتذكير والتأنيث؛ فبه تتحدّد دلالة الكلمة، ولذلك قال المفسرون: كثرة المباني تدل على كثرة المعاني.',
    },
    en: {
      title: 'Morphology: Word Structure and Patterns',
      summary: 'The science of ṣarf and its importance for language and the Quran.',
      body: 'Morphology (ṣarf) studies the structure of a single word: soundness and weakness, simple and augmented forms, pattern and meaning. It precedes grammar, since a word is built before being placed in a sentence: morphology is the mother of the sciences and grammar its father.\\n\\nTopics include the morphological scale, triliteral and quadriliteral verb patterns, augmentation, assimilation and substitution.\\n\\nLearning the meanings of patterns gives precision: the prefix in "astaghfiru" marks seeking, and augmented vowels mark intensification or transitivity; thus the meaning of a word is determined, and augmented structures indicate augmented meanings.',
    },
  },
  {
    sub: 'balaghah',
    type: 'lesson',
    slug: 'balaghah-intro',
    ar: {
      title: 'البلاغة: المعاني والبيان والبديع',
      summary: 'أقسام البلاغة الثلاثة، وأثرها في فهم الإعجاز.',
      body: 'البلاغة هي مطابقة الكلام لمقتضى الحال مع فصاحته، وتُبحث في ثلاثة فنون: \\u0027علم المعاني\\u0027 ويُبحث فيه في مطابقة الكلام لمقتضى الحال من خبر وإنشاء وحذف وذكر وتقديم وتأخير، و\\u0027علم البيان\\u0027 ويُبحث فيه في التشبيه والمجاز والكناية، و\\u0027علم البديع\\u0027 ويُبحث فيه في المحسنات اللفظية والمعنوية.\\n\\nومن أشهر مصنفاته: دلائل الإعجاز وأسرار البلاغة لعبد القاهر الجرجاني، ومفتاح العلوم للسكاكي، والتلخيص للقزويني.\\n\\nوثمرتها: تذوّق القرآن الكريم، حيث إن وجوه الإعجاز البياني لا تُدرك إلا بمعرفة البلاغة، ولذلك كان المفسرون يستدلون بها على فصاحة النظم واختيار الجمل؛ وإن كان بعض المتأخرين وسّع حدّ البديع حتى أصبح صنعة، فمنهج أهل السنة النقد والتمييز.',
    },
    en: {
      title: 'Rhetoric: Semantics, Tropes and Ornament',
      summary: 'The three branches of rhetoric and their role in appreciating the Quran.',
      body: 'Rhetoric is matching speech to the requirements of the occasion while being eloquent. It has three branches: semantics, treating how speech fits the situation through statement and address, omission, mention, and arrangement; tropes, treating simile, metaphor and allusion; and ornament, treating verbal and conceptual embellishment.\\n\\nFamous works include al-Jurjānī\\u0027s Signs of Inimitability and Secrets of Eloquence, al-Sakkākī\\u0027s Key of Sciences, and al-Qazwīnī\\u0027s Summary.\\n\\nIts fruit is appreciation of the Quran: the facets of its eloquence are grasped through rhetoric, and exegetes used it to show the excellence of its composition. Later writers sometimes expanded ornament into mere craft, and the sound approach is critical distinction.',
    },
  },
  {
    sub: 'adab',
    type: 'article',
    slug: 'adab-arabi',
    ar: {
      title: 'الأدب العربي: قيمته وضوابطه',
      summary: 'عن قيام الشعر والأدب، وموقف الشرع منهما.',
      body: 'الأدب العربي هو الشعر والنثر الذي عبّر به العرب عن أفكارهم وعواطفهم، وهو ديوان العرب الوثيق لغةً وأخبارًا وأمثالًا، وحفظ به تاريخهم وجزالة لغتهم، ودوّنت فيه دواوين الشعراء في الجاهلية والإسلام.\\n\\nوموقف الشرع من الشعر: لا يمنع الشرع الشعر، فقد قال ﷺ لحسّان بن ثابت: «اهجهم وروح القدس معك»، وقال: «إن من الشعر لحكمًا»، والقرآن نفسه سورة الشعراء ردّت بشاعرها؛ فالمنع إنما هو على ما رسول.\\n\\nوضوابطه: خلوّه من الفحش والكذب والغزل والغيبة، وصدق المعنى، وخدمة الحق والأمة، والبعد عن المبالغات الفارغة، فالأدب وسيلة لا غاية، وقد جعل العلماء دراسة الأدب واللغة من مقدّمات التفسير.',
    },
    en: {
      title: 'Arabic Literature: Value and Limits',
      summary: 'The place of poetry and prose, and the law\\u0027s stance.',
      body: 'Arabic literature is the poetry and prose through which the Arabs expressed their thought and feeling. It is the record of their language, reports and proverbs, preserving their history and the strength of their tongue, and the poetic collections of the pre-Islamic and Islamic eras were recorded.\\n\\nThe law does not prohibit poetry: the Prophet ﷺ told Ḥassān b. Thābit, "Satirise them, and Gabriel is with you," and said, "Some poetry is wisdom." The Quran itself answers the poets\\u0027 claims in Sūrat al-Shuʿarāʾ.\\n\\nIts limits: freedom from obscenity, falsehood, flirtation and backbiting; truthful meaning; service of truth and community; and avoidance of empty exaggeration. Literature is a means, not an end, and scholars made language and literature a foundation of exegesis.',
    },
  },
  {
    sub: 'mantiq',
    type: 'article',
    slug: 'mantiq-ilm',
    ar: {
      title: 'المنطق: نشأته وموقف العلماء منه',
      summary: 'علم المنطق، من أدخله، وموقف الفقهاء والمتكلمين منه.',
      body: 'المنطق علم يُبحث فيه عن قواعد التفكير الصحيح، وحفظ العقل من الخطأ في الاستدلال، وأشهر أقسامه: التصور والتصديق، والدلالات، والحدود، والقياس. نشأ على يد أرسطو، ثم نقل إلى العربية في عصر الترجمة.\\n\\nوموقف العلماء منه متفاوت: فبعضهم منع الاشتغال به مطلقًا (كابن تيمية ومن وافقه)، ورأى أن قواعده تشوش ولا تنفع، وبعضهم أجازه لمن رسخ في الشرع (كابن الصلاح والغزالي)، وقسّمه الغزالي إلى ما يصحّ وما لا يصحّ.\\n\\nوالمنهج الراجح: أن المنطق إذا استُخدم آلة للاستدلال لا مصدرًا للتشريع، كان مباحًا، وأما جعله أصلًا يُقاس عليه الوحي، فهو الفساد المذموم؛ فالكتاب والسنة هما الأصل، والعقل الصحيح شاهد لا حاكم.',
    },
    en: {
      title: 'Logic: Its Origins and Scholarly Positions',
      summary: 'The science of logic, how it entered, and how scholars received it.',
      body: 'Logic studies the rules of correct reasoning and guards the mind from error. Its main divisions are conception and assent, signification, definition and syllogism. It originated with Aristotle and was translated into Arabic in the translation era.\\n\\nScholars differed: some forbade it entirely, such as Ibn Taymiyyah, holding its rules confuse rather than benefit; others permitted it for those grounded in the law, such as Ibn al-Ṣalāḥ and al-Ghazālī, who distinguished sound from unsound parts.\\n\\nThe sound approach: logic as a tool of reasoning rather than a source of legislation is permitted, whereas making it a standard by which revelation is judged is the condemned corruption. The Book and Sunnah are the foundation; sound reason is a witness, not a judge.',
    },
  },
  {
    sub: 'medicine',
    type: 'article',
    slug: 'medicine-bioethics',
    ar: {
      title: 'الطب والبيوإثيقا: ضوابط شرعية',
      summary: 'قواعد شرعية في التداوي والموت الرحيم والأعضاء والحقن والجنس.',
      body: 'الطب في الإسلام يُبنى على قاعدتين: أن التداوي مشروع ومأمور به، قال ﷺ: «يا عباد الله تداووا»، وأن الأنفس والأعراض محفوظة، فكل ما يُتلف نفسًا أو يُذهب عضوًا أو يمسّ الأعراض بغير حق محرّم.\\n\\nومن مسائل البيوإثيقا الشرعية: تجنّب العلاج المحرّم (كالخمر والمحرّمات)، وإباحة التداوي المباح مع التوكل، وتحريم الإجهاض بغير عذر شرعي بعد نفخ الروح، وتحريم القتل الرحيم، وجواز التبرّع بالأعضاء بشروط معتبرة عند بعض المعاصرين، وحرمة الاستنساخ البشري والانتخاب الجيني للنسل، وحفظ الأسرار الطبية سترًا على المريض.\\n\\nوضوابط الفتوى الطبية: الرجوع إلى أهل الطب الثقات في الحقائق، وأهل الشرع في الأحكام، وقياس الجزئية على القواعد الكلية؛ فلا فتوى بلا علم، ولا طبّ بلا مراعاة الشرع.',
    },
    en: {
      title: 'Medicine and Bioethics: Sharīʿah Guidelines',
      summary: 'Rulings on treatment, euthanasia, organ donation, and genetic matters.',
      body: 'Medicine in Islam rests on two principles: seeking treatment is legislated, as the Prophet ﷺ said, "O servants of God, seek treatment," and life and honour are protected, so anything destroying life, removing an organ, or violating honour without right is forbidden.\\n\\nBioethical issues include avoiding unlawful remedies, permitting lawful treatment with reliance on God, prohibiting abortion without a valid excuse after the soul is breathed in, prohibiting euthanasia, permitting organ donation under recognised conditions according to many contemporary scholars, prohibiting human cloning and genetic selection of offspring, and keeping medical secrets.\\n\\nThe rule for medical fatwā: consult trustworthy physicians for facts and jurists for rulings, and apply universal principles to particulars. There is no fatwā without knowledge, and no medicine without regard for the law.',
    },
  },
  {
    sub: 'technology',
    type: 'article',
    slug: 'technology-ai',
    ar: {
      title: 'التقنية والذكاء الاصطناعي: أحكام وضوابط',
      summary: 'الأصل في التقنية الإباحة، وضوابط استخدام الذكاء الاصطناعي.',
      body: 'الأصل في المعاملات والأدوات الإباحة حتى يقوم الدليل على المنع؛ فالتقنية آلة يُنتفع بها، وتتوقف الأحكام على الاستعمال لا على الآلة نفسها: فقد تُستعمل في الخير فيُباح، وفي الحرام فيمنع.\\n\\nومن ضوابط استخدام التقنية والذكاء الاصطناعي: عدم استخدامه في التجسّس والكشف عن الأسرار، ولا في التضليل والترويج للغلو، ولا في الإفتاء بغير علم، ولا في انتحال صوت العالم أو صورته، ولا في نشر الشبهات وترويج ما يهدم الأمة؛ مع حفظ حقوق الملكية، وأداء الأمانة.\\n\\nوواجبات المسلم تجاه هذه الأدوات: التعلّم والنفع، واستعمالها في نشر العلم والدعوة، والتمييز بين ما أنتجته الآلة وما صدر عن أهل العلم، ولا يُبنى على مخرجاتها إفتاء؛ فإن العلم والمسؤولية على البشر لا على الآلات.',
    },
    en: {
      title: 'Technology and Artificial Intelligence: Rulings and Limits',
      summary: 'The default permissibility of technology and guidelines for AI use.',
      body: 'The default in tools and dealings is permissibility until evidence forbids. Technology is an instrument that benefits or harms according to use: in good it is permitted, in the forbidden it is not.\\n\\nGuidelines for technology and AI: no use for spying or exposing secrets, for deception or promoting extremism, for issuing religious rulings without knowledge, for impersonating a scholar\\u0027s voice or image, or for spreading doubts that harm the community; with respect for ownership rights and honesty.\\n\\nA Muslim\\u0027s duties toward these tools: learn and benefit, use them to spread knowledge and daʿwah, distinguish machine output from the statements of scholars, and never issue rulings based on their output; knowledge and responsibility rest on people, not machines.',
    },
  },
  {
    sub: 'environment',
    type: 'article',
    slug: 'environment-care',
    ar: {
      title: 'البيئة: عناية الإسلام بالكون والموارد',
      summary: 'أساس رعاية البيئة في الشريعة، ومظاهرها العملية.',
      body: 'رعاية البيئة في الإسلام مبنيّة على أن الكون مخلوق مسخّر لأجل الإنسان فيكون في مقام الأمانة، قال تعالى: «وهو الذي جعلكم خلائف الأرض»، وقال: «ولا تُفسدوا في الأرض بعد إصلاحها»؛ فهي أمانة لا ملك.\\n\\nومن مظاهر عناية الشرع: النهي عن الإسراف والتبذير في الماء والطعام، ولو على نهر جارٍ، والنهي عن تلويث الطرق والظلال والموارد، والأمر بغرس النبات وسقي الدواب، والنظافة وإماطة الأذى عن الطريق، وتقدير الموارد.\\n\\nوأثر هذا في الواقع: أن تطبيق هذه الضوابط يُنتج مجتمعًا نقيًّا معتدلًا في استهلاكه، لا يُتلف موارد الأمة ولا يُضرّ بالناس ولا بالبلد، قال ﷺ: «إن قامت الساعة وفي يد أحدكم فسيلة فليغرسها»، فهو نهي عن اليأس، وأمر بإعمار الأرض.',
    },
    en: {
      title: 'The Environment: Islam\u0027s Care for Creation and Resources',
      summary: 'The basis of environmental stewardship and its practical forms.',
      body: 'Care for the environment rests on the fact that the universe is created and made serviceable for humanity, so it is a trust: "It is He who made you successors on the earth," and "Do not cause corruption on the earth after it has been set right." Creation is a trust, not property.\\n\\nThe law forbids waste and extravagance in water and food, even beside a flowing river, forbids polluting roads, shade and water sources, and commands planting, watering animals, cleanliness, removing harm from the path, and conserving resources.\\n\\nThe practical effect: applying these limits produces a clean, moderate society that neither destroys resources nor harms people or the land: "If the Hour rises while one of you holds a sapling, let him plant it," a prohibition of despair and a command to build.',
    },
  },
  {
    sub: 'minorities',
    type: 'article',
    slug: 'muslims-west',
    ar: {
      title: 'المسلمون في الغرب: التحديات والثبات',
      summary: 'أبرز تحديات المسلّم في الغرب، والسبيل إلى الثبات والأثر.',
      body: 'المسلمون في الغرب يواجهون تحديات متعددة: التحديات العقدية (الشبهات والانفتاح على ثقافات متباينة)، والتربوية (تربية الأبناء في أسرة قلّ فيها الجو الشرعي)، والاجتماعية (الغربة، والاختلاط، والفردية)، والعملية (الحلال والحرام في المال والبنوك والتأمين)، والقانونية (الحرية والقيود في أماكن العمل).\\n\\nوأسباب الأمان: العلم الشرعي المباشر، وبناء المساجد والمراكز والمراكز الشرعية، وإنشاء أسر مسلمة متماسكة، وتربية الأبناء على العقيدة والعبادة، والتمسك بالأخلاق والصدق، والانتماء إلى أمة لا تُزول ببلد.\\n\\nوأثر المسلم الثابت في الغرب: الدعوة بالقدوة لا بالكلام، والإحسان في المعاملة، وخدمة المجتمعات، وإظهار محاسن الإسلام؛ فنبينا ﷺ كسب الناس بأخلاقه قبل حججه، وكذك الحق لا يُنصر بالضعف ولا بالمداهنة، وإنما بالعلم والأخلاق.',
    },
    en: {
      title: 'Muslims in the West: Challenges and Steadfastness',
      summary: 'Main challenges and the path to steadfastness and positive impact.',
      body: 'Muslims in the West face multiple challenges: doctrinal, with doubts and exposure to diverse cultures; educational, raising children where the religious environment is thin; social, with alienation, mixing and individualism; practical, on lawful earnings, banking and insurance; and legal, with both freedom and constraints at work.\\n\\nMeans of security: direct religious learning, building mosques and centres, forming cohesive Muslim families, raising children on creed and worship, holding to good character and honesty, and belonging to a community that transcends any single country.\\n\\nThe effect of a steadfast Muslim in the West: invitation through example rather than talk, excellence in dealings, service to society, and showing Islam\\u0027s beauty. Our Prophet ﷺ won people by character before argument, and truth is never aided by weakness or compromise, but by knowledge and good conduct.',
    },
  },
];
