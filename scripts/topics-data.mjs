// scripts/topics-data.mjs
// بيانات المحتوى للمواضيع الفرعية الجديدة (عربي + إنجليزي).
// تُضاف على دفعات، والسكربت يستخدم upsert فيمكن إعادة التشغيل بأمان.

export const TOPICS = [
  {
    sub: 'qawaid-fiqhiyyah',
    type: 'lesson',
    slug: 'qawaid-fiqhiyyah-intro',
    ar: {
      title: 'القواعد الفقهية: تعريفها وأشهر قواعدها',
      summary: 'ما القاعدة الفقهية؟ وكيف تُعين على فهم الفروع وحفظها؟',
      body: 'القاعدة الفقهية هي حكم كلّي شرعي مضطرد ينطبق على جزئيات كثيرة، تُبنى عليها الفروع المتشابهة في الحكم. وليست دليلًا مستقلًا، بل هي خلاصة استقراء الفقهاء للفروع، تُذكر لتيسير الفهم والحفظ وتوحيد النظر في المسائل المتشابهة.\n\nومن أشهر القواعد الخمس الكبرى: «الأمور بمقاصدها»، و«اليقين لا يزول بالشك»، و«المشقة تجلب التيسير»، و«لا ضرر ولا ضرار»، و«العادة محكّمة». ولكل قاعدة فروع كثيرة في العبادات والمعاملات.\n\nوتعلّم القواعد يمنح طالب العلم مفتاحًا للقياس على المنهج الشرعي، مع التنبّه إلى أن القاعدة قد تُخصّص أو يُستثنى منها، فلا تُطبّق على العموم إلا بنظر أهل العلم.',
    },
    en: {
      title: 'Islamic Legal Maxims: Definition and Main Rules',
      summary: 'What is a legal maxim, and how does it help understand and retain rulings?',
      body: 'A legal maxim (qāʿidah fiqhiyyah) is a universal, consistent Sharīʿah principle covering many particular cases of similar ruling. It is not an independent proof; rather it is the fruit of the jurists\' inductive study of rulings, used to ease understanding, memorisation, and consistency.\n\nThe five greatest maxims are: acts are judged by their intentions; certainty is not removed by doubt; hardship brings about ease; there is no harm and no reciprocating harm; and custom is authoritative. Each maxim has many applications in worship and dealings.\n\nLearning them gives students a sound key for reasoning, while noting that a maxim may have exceptions and is not applied absolutely except with scholarly consideration.',
    },
  },
  {
    sub: 'maqasid',
    type: 'lesson',
    slug: 'maqasid-shariah',
    ar: {
      title: 'مقاصد الشريعة: حفظ الضروريات الخمس',
      summary: 'معنى المقاصد، وترتيبها إلى ضروريات وحاجيات وتحسينيات.',
      body: 'مقاصد الشريعة هي الغايات والحكم التي قصدها الشارع من تشريع الأحكام لتحقيق مصالح العباد في الدنيا والآخرة، ودفع المفاسد عنهم.\n\nوتنقسم المصالح إلى ثلاث مراتب: ضروريات، وهي حفظ الدين والنفس والعقل والنسل والمال، ودرء كل ما يُخِلّ بها؛ وحاجيات، وهي ما يُوسّع به على الناس ويرفع الحرج؛ وتحسينيات، وهي مكارم الأخلاق ومحاسن العادات.\n\nومعرفة المقاصد تعين على فهم النصوص وتنزيلها على الوقائع، وتقديم الأهم عند التعارض، وتمنع الجمود عند ظواهر الألفاظ، مع بقاء النص هو الأصل والأساس.',
    },
    en: {
      title: 'The Objectives of Islamic Law: Preserving the Five Essentials',
      summary: 'What are the maqāṣid, and how are they ranked?',
      body: 'The objectives of the Sharīʿah (maqāṣid) are the wise purposes the Lawgiver intended by legislation: to secure people\'s interests in this life and the next, and to repel harm.\n\nThese interests are of three ranks: necessities (ḥājiyyāt are below them) preserving religion, life, intellect, lineage, and wealth; needs that remove hardship and widen ease; and refinements covering noble character and good customs.\n\nKnowing the maqāṣid helps in understanding texts, applying them to reality, prioritising when interests conflict, and avoiding rigidity — while the revealed text remains the foundation.',
    },
  },
  {
    sub: 'siyasah-shariah',
    type: 'article',
    slug: 'siyasah-shariah-rules',
    ar: {
      title: 'السياسة الشرعية: ضوابط الحُكم والقضاء',
      summary: 'معنى السياسة الشرعية، وأساسها، وضوابط تصرّف ولي الأمر.',
      body: 'السياسة الشرعية هي تدبير شؤون الرعية بما يحقّق العدل والمصلحة، في حدود ما أنزل الله. وأساسها تحقيق المصالح المعتبرة شرعًا ودفع المفاسد، مع وجوب رجوعها إلى الكتاب والسنة والإجماع.\n\nوضوابط تصرّف ولي الأمر في الرعية: أن يكون التصرّف في حدود الشرع لا في محرّماته، وأن يكون لمصلحة معتبرة لا لهوى، وأن يتحرّى العدل والمساواة في الحكم بين الناس.\n\nوأما القضاء فواجب لإقامة العدل ورفع الخصومات، وشرطه العدالة والعلم، وحُكمه ينفّذ ما لم يخالف نصًّا قاطعًا أو إجماعًا، ولذلك قيل: «الحكم الشرعي والقضاء العدل عمودا الأمة».',
    },
    en: {
      title: 'Shariah Governance: Rulership and Judiciary',
      summary: 'The meaning of siyāsah sharʿiyyah and the limits of authority.',
      body: 'Shariah governance means managing people\'s affairs to achieve justice and public interest within the limits revealed by Allah. Its basis is securing recognised benefits and preventing harm, while referring back to the Quran, Sunnah, and consensus.\n\nThe ruler\'s discretion is bounded: it must not permit what Allah forbade, must serve a legitimate interest rather than desire, and must uphold justice and equality in judgement.\n\nThe judiciary is obligatory for establishing justice and settling disputes; its conditions are integrity and knowledge, and its rulings stand unless they oppose a decisive text or consensus.',
    },
  },
  {
    sub: 'jinayat',
    type: 'lesson',
    slug: 'jinayat-overview',
    ar: {
      title: 'الجنايات والحدود والقصاص: أحكام موجزة',
      summary: 'أقسام الجنايات، وعقوباتها، وشروط إقامة الحدود.',
      body: 'الجنايات في الفقه الإسلامي ثلاثة أنواع: ما فيه حدّ مقدّر شرعًا كالزنا والسرقة وشرب الخمر؛ وما فيه قصاص، وهو الاعتداء على النفس أو ما دونها فاقتصّ من الجاني بمثل فعله؛ وما فيه تعزير، وهو التأديب الذي يقدّره القاضي بحسب المصلحة.\n\nومن ضوابط إقامة الحدود: ثبوت الجريمة بإقرار أو شهادة معتبرة، وعدم وجود الشبهة، ولا يُقام الحد إلا بواسطة الإمام أو نائبه؛ لأن الشبهة تُدرأ بها الحدود.\n\nوقد جاءت هذه الأحكام لصيانة الأنفس والأعراض والأموال، وتحقيق العدل، ومنع انتشار الجريمة، مع توجيه الشرع إلى العفو والصفح في موضعها، وكثرة أسباب دفع العقوبة.',
    },
    en: {
      title: 'Crimes, Fixed Penalties and Retribution in Islamic Law',
      summary: 'Categories of offences, their penalties, and the conditions for punishment.',
      body: 'Offences in Islamic law fall into three types: those with a fixed penalty (ḥadd) such as adultery, theft and intoxication; those punishable by equal retribution (qiṣāṣ) for harm to life or limb; and discretionary discipline (taʿzīr) assessed by the judge according to the public interest.\n\nConditions include establishing the offence through confession or acceptable testimony, the absence of doubt, and the penalties being executed only by the authority — for doubt averts the fixed penalties.\n\nThese rules protect life, honour and property, establish justice, and deter crime, while the law encourages pardon and provides many means of avoiding punishment.',
    },
  },
  {
    sub: 'qiraat',
    type: 'lesson',
    slug: 'qiraat-intro',
    ar: {
      title: 'القراءات: تعريفها والقراءات العشر',
      summary: 'ما القراءات؟ وكيف نشأت وتواترت؟',
      body: 'القراءات جمع قراءة، وهي مذاهب أداء القرآن من حيث النطق بالحروف والحركات، نُقلت إلينا بالتواتر عن النبي ﷺ. ونزل القرآن على سبعة أحرف تيسيرًا على الأمة، فقرأ الصحابة بها ونقلوها إلى الأمصار.\n\nثم تخصّص جماعة من الأئمة لضبط ذلك وروايته، فصارت القراءات المشهورة عشرًا، وقرّاؤها معروفون، أشهرهم: نافع وابن كثير وأبو عمرو وابن عامر وعاصم وحمزة والكسائي وأبو جعفر ويعقوب وخلف.\n\nوكل قراءة متواترة صحيحة، والقراءات ليست اختلافًا في جوهر المعنى بل في الأداء والتوجيه، وكلها قرآن منزل، ويجب أن تُتلقّى بالسند لا بالاجتهاد.',
    },
    en: {
      title: 'The Quranic Readings (Qirāʾāt): An Introduction',
      summary: 'What are the readings, and how were they transmitted?',
      body: 'The qirāʾāt are the modes of reciting the Quran in terms of letters and vowels, transmitted to us through unbroken chains from the Prophet ﷺ. The Quran was revealed in seven modes to ease recitation for the community, and the Companions transmitted them to the regions.\n\nScholars then specialised in recording and authenticating them, and the well-known readings became ten, whose reciters are known — among the most famous: Nāfiʿ, Ibn Kathīr, Abū ʿAmr, Ibn ʿĀmir, ʿĀṣim, Ḥamzah, al-Kisāʾī, Abū Jaʿfar, Yaʿqūb and Khalaf.\n\nEvery authentic reading is part of the revelation; the differences concern pronunciation and guidance, not the core meaning, and they are received through chains of transmission, not personal reasoning.',
    },
  },
  {
    sub: 'ijaz-quran',
    type: 'lesson',
    slug: 'ijaz-quran',
    ar: {
      title: 'إعجاز القرآن: أوجهه ووجوه التحدي',
      summary: 'معنى الإعجاز، وأوجهه: البياني والغَيبِيّ والتشريعي والعلمي.',
      body: 'الإعجاز هو عجز البشر عن الإتيان بمثل القرآن مع تحدّيهم به، وهو أعظم دليل على نبوّة محمد ﷺ. وقد تحدّاهم الله بالقرآن كله، ثم بعشر سور، ثم بسورة واحدة، فعجزوا وهم أهل الفصاحة والبلاغة.\n\nوأوجه الإعجاز كثيرة: الإعجاز البياني في نظمه وأسلوبه، والإخبار عن الغيب، وصدق ما فيه من أخبار الأمم السابقة والكتب المحرّفة، والتشريع الكامل الذي يحقّق مصالح الناس، والإشارات الكونية التي وافقها العلم.\n\nويُواجه بعض الناس هذه الإشارات بالمبالغة حتى يُحرّفوا المعنى، والمنهج الصحيح: الاستدلال بما ثبت من العلم، وعدم تحميل الآيات ما لا تحمله.',
    },
    en: {
      title: 'The Inimitability of the Quran',
      summary: 'The meaning and facets of the Quran\'s miracle.',
      body: 'Iʿjāz means human beings are unable to produce the like of the Quran despite being challenged to do so — the greatest proof of Muhammad\'s prophethood. Allah challenged them with the whole Quran, then ten chapters, then a single chapter, yet they could not, though they were masters of eloquence.\n\nIts facets are many: eloquence and composition, accurate reports of the unseen, truthful accounts of former nations and corrupted scriptures, a complete legal system securing people\'s interests, and cosmic indications confirmed later by science.\n\nSome exaggerate these indications until they distort the meaning. The sound approach is to reason with established science and never impose on the verses what they cannot bear.',
    },
  },
  {
    sub: 'wujuh-nazair',
    type: 'article',
    slug: 'wujuh-nazair',
    ar: {
      title: 'الوجوه والنظائر في القرآن',
      summary: 'اللفظ الواحد يتكرر بمعانٍ مختلفة — كيف نضبط ذلك؟',
      body: 'الوجوه والنظائر علم يبحث في الألفاظ التي يتكرّر وقوعها في القرآن وتختلف معانيها بحسب السياق. فالنظير هو اللفظ المشترك، والوجه هو المعنى الذي جاء عليه في كل موضع.\n\nومن أمثلته لفظ «الهدى»، فقد يأتي بمعنى البيان والدلالة، وبمعنى التوفيق والإلهام، وبمعنى الدِّين. ولفظ «الأمة» يأتي بمعنى الجماعة، والزمن، والإمام، والملّة.\n\nوفائدة هذا العلم عظيمة في التفسير: ألا يُحمل اللفظ في كل موضع على معنى واحد، بل يُنظر إلى السياق، ويُرجع إلى ما ذكره المفسرون وأهل هذا الفن.',
    },
    en: {
      title: 'Polysemy in the Quran (Wujūh and Naẓāʾir)',
      summary: 'One term recurring with different meanings — how is it controlled?',
      body: 'This science studies words that recur in the Quran with meanings that vary with context. The naẓīr is the recurring word, and the wajh is the meaning it carries in each place.\n\nFor example, “hudā” may mean clarification, guidance to success, or the religion itself; and “ummah” may mean a community, a period of time, a leader, or a way of life.\n\nThe benefit in exegesis is great: a word is not forced into a single meaning in every verse; instead the context is examined and the explanations of the exegetes consulted.',
    },
  },
  {
    sub: 'aam-khas',
    type: 'lesson',
    slug: 'aam-khas',
    ar: {
      title: 'العام والخاص في أصول الفقه',
      summary: 'دلالة العام، وأنواع التخصيص، وأثر ذلك في الاستدلال.',
      body: 'العام لفظ يستغرق جميع أفراده بلا حصر، مثل قوله تعالى: «والسارق والسارقة فاقطعوا أيديهما». والخاص لفظ يختص ببعض الأفراد، مثل: «من المسلمين» في بعض النصوص.\n\nويُخصّص العام بأدلة منها: الاستثناء، والشرط، والصفة، والعقل، والإجماع، والنص الآخر. فحين يُخصَّص العام يبقى حجّة فيما لم يُخصّص به.\n\nوالمقصود من هذا الباب ضبط الاستدلال، فلا يُؤخذ اللفظ على عمومه إذا قام المخصّص، ولا يُلغى عمومه بغير دليل. ومن أشهر صور الخلاف الفقهي اختلافهم في: هل العام المخصوص حجّة في الباقي؟ والجمهور على أنه حجّة.',
    },
    en: {
      title: 'The General and the Specific in Islamic Jurisprudence',
      summary: 'The general term, types of specification, and its effect on reasoning.',
      body: 'A general term covers all its instances without limit, such as “the thief, male or female, cut off their hands”. A specific term is restricted to some instances.\n\nThe general may be specified by exception, condition, description, reason, consensus, or another text. When specified, it remains authoritative for what is not specified.\n\nThe purpose of this chapter is precision in reasoning: a term is not applied generally when a specifying evidence exists, nor is its generality cancelled without evidence. A famous juristic dispute concerns whether a specified general term remains authoritative for the remainder; the majority hold that it does.',
    },
  },
  {
    sub: 'nasikh',
    type: 'lesson',
    slug: 'nasikh-mansukh',
    ar: {
      title: 'الناسخ والمنسوخ: تعريفه وشروطه',
      summary: 'معنى النسخ، شروطه، وما لا يصح فيه، وأشهر المصنفات.',
      body: 'النسخ رفع حكم شرعي متقدّم بدليل شرعي متأخّر، وهو ثابت في القرآن والسنة بإجماع أهل العلم. قال تعالى: «ما ننسخ من آية أو ننسها نأت بخير منها أو مثلها».\n\nوشروطه: أن يكون المنسوخ حكمًا شرعيًا لا خبرًا محضًا، وأن يكون الناسخ متأخّرًا عنه ثبوتًا، وأن يتعذّر الجمع بينهما. ولا يقع النسخ في العقائد والأخبار وأسماء الله وصفاته.\n\nوأكثر ما يُغلط فيه: تسمية التخصيص أو التقييد نسخًا، والظن بأن كلّ اختلاف بين نصّين نسخ. ولهذا صنّف العلماء في الناسخ والمنسوخ، وأشهر ما يجب التحرّي فيه ادّعاء نسخ آيات كثيرة بلا دليل.',
    },
    en: {
      title: 'Abrogation (Naskh): Definition and Conditions',
      summary: 'What naskh is, its conditions, what it cannot apply to, and key works on it.',
      body: 'Naskh is the removal of an earlier ruling by a later revealed evidence; it is established in the Quran and Sunnah by scholarly consensus: “Whatever verse We abrogate or cause to be forgotten, We bring better than it or similar.”\n\nConditions: the abrogated matter must be a practical ruling rather than pure report; the abrogating text must be later in establishment; and combining the two must be impossible. Naskh cannot occur in creed, historical reports, or Allah\'s names and attributes.\n\nA common error is calling specification or restriction “abrogation”, or assuming every apparent conflict is abrogation. Scholars therefore wrote extensively on the subject, warning against claiming abrogation of many verses without evidence.',
    },
  },
  {
    sub: 'ilal',
    type: 'article',
    slug: 'ilal-hadith',
    ar: {
      title: 'علم العلل: أهميته ومنهج أئمته',
      summary: 'العلّة الخفية التي تُقدح في صحة الحديث، وكيف يكشفها النقّاد.',
      body: 'علم العلل من أدقّ علوم الحديث، وهو البحث في الأسباب الخفية القادحة في صحّة الحديث مع أن الظاهر السلامة. كإرسال في حديث ظاهره الاتصال، أو وقف في حديث ظاهره الرفع، أو إدخال حديث على حديث.\n\nومنهجه: جمع طرق الحديث، ومقارنة الأسانيد، ومعرفة مراتب الرواة وطبقاتهم، والنظر في تصرّف الحفّاظ؛ فإن المخالفة تُكشف بجمع الطرق لا بالنظر في إسناد واحد.\n\nومن أعلام هذا الفن: شعبة، وسفيان، ويحيى بن سعيد القطان، وعلي بن المديني، والبخاري، وأبو حاتم، والدارقطني. وكلامهم في العلل تُلقّي بالقبول، ولا يقاس عليه من لا يعرف الأسانيد والرواة.',
    },
    en: {
      title: 'The Science of Hidden Defects in Hadith (ʿIlal)',
      summary: 'A subtle flaw that undermines a report, and how critics detect it.',
      body: 'ʿIlal is among the most precise hadith sciences: the search for hidden defects that undermine a report\'s authenticity even when it appears sound — such as a hidden gap where the chain appears connected, or a Companion\'s statement presented as the Prophet\'s words.\n\nThe method is to gather all chains, compare them, know the ranks of narrators and their generations, and examine the practice of the master critics; a contradiction is detected by gathering chains, not by inspecting one chain alone.\n\nLeading scholars of this art include Shuʿbah, Sufyān, Yaḥyā b. Saʿīd, ʿAlī b. al-Madīnī, al-Bukhārī, Abū Ḥātim and al-Dāraqutnī. Their verdicts are accepted, and only those who know chains and narrators may practise this discipline.',
    },
  },
  {
    sub: 'takhrij',
    type: 'lesson',
    slug: 'takhrij-method',
    ar: {
      title: 'التخريج: معناه ومنهجه',
      summary: 'كيف نعزو الحديث إلى مصادره ونحكم عليه؟',
      body: 'التخريج هو عزو الحديث إلى مصادره الأصلية التي أخرجته مع بيان درجته. وهو خطوة أساسية قبل الاستدلال بأي حديث، فإن «المرجعية» تحفظ الحديث من التحريف والنقل بالمعنى الخاطئ.\n\nومن طرقه: التخريج باللفظ، وبأول الحديث، وبأشهر لفظة فيه، وبالراوي الأعلى، وبالموضوع — وأسهل ما يُبدأ به البحث عن كلمة مميّزة في الحديث في المعاجم والموسوعات الحديثية.\n\nويُشترط في المعتنى بالتخريج: معرفة كتب السنة وأبوابها وأسانيدها، ومقارنة الطرق، ثم الحكم على الحديث بما قرّره أهل العلم في الجرح والتعديل والعلل.',
    },
    en: {
      title: 'Hadith Referencing (Takhrij): Meaning and Method',
      summary: 'How a hadith is traced to its sources and judged.',
      body: 'Takhrij means attributing a hadith to the primary sources that report it, together with its grading. It is an essential step before citing any hadith, protecting it from distortion or incorrect paraphrasing.\n\nMethods include tracing by exact wording, by the opening words, by the most distinctive phrase, by the highest narrator, or by topic — the easiest starting point being a distinctive word searched in hadith dictionaries and encyclopaedias.\n\nPractitioners must know the books of Sunnah, their chapters and chains, compare the routes, and then grade the report according to the scholars of narrator criticism and hidden defects.',
    },
  },
  {
    sub: 'mawduat',
    type: 'article',
    slug: 'mawduat-hadith',
    ar: {
      title: 'الأحاديث الموضوعة: علاماتها وسبيل التحقق',
      summary: 'الحديث الموضوع، أسباب وضعه، وعلامات معرفته، وواجب المسلم.',
      body: 'الحديث الموضوع هو المكذوب المنسوب إلى النبي ﷺ، وهو شرّ أنواع الضعيف؛ لأنه كذب صريح على رسول الله ﷺ. وقد توعّد النبي ﷺ من كذب عليه: «فليتبوّأ مقعده من النار».\n\nومن أسباب الوضع: الغلو في التقرّب بالقُربى والفضائل، والتعصّب لمذهب أو قبيلة، واختلاف الناس بالسياسة، وقصد إفساد الدين، وكسب المال بالقصص.\n\nومن علاماته: ركاكة اللفظ، ومخالفة القواعد الشرعية، والتناقض مع النص القطعي والمعقول الصريح، وأخبار المخاريق. وواجب المسلم: التثبّت قبل النقل، وعدم نشر ما لا يُعرف أصله، فقوله ﷺ: «من حدّث عني بحديث وهو يرى أنه كذب فهو أحد الكاذبين».',
    },
    en: {
      title: 'Fabricated Hadiths: Signs and Verification',
      summary: 'What a fabricated hadith is, why it was invented, and how to identify it.',
      body: 'A fabricated hadith is a lie attributed to the Prophet ﷺ, the worst category of weak reports, for it is outright falsehood about him. He warned: “Whoever lies about me deliberately, let him take his seat in Hellfire.”\n\nReasons for fabrication include exaggeration in seeking nearness to God, partisanship for a school or tribe, political conflict, deliberate corruption of the religion, and earning money through tales.\n\nSigns include clumsy wording, contradiction of established principles, conflict with decisive texts and clear reason, and sensational stories. A Muslim must verify before transmitting and not spread what has no known basis: “Whoever narrates from me a report he believes is false is one of the liars.”',
    },
  },
];
