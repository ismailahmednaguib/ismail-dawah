// scripts/topics-data-4.mjs
// ============================================================================
// الدفعة الرابعة: تعمير الأبواب الفارغة وتقوية الأبواب الضعيفة.
//
// يغطّي:
//   • الفروع الفارغة تمامًا: الفقه المقارن · التاريخ الإسلامي · تزكية النفس.
//   • الفروع التي فيها عنصر أو عنصران، ليصل كل باب إلى ثلاثة عناصر على الأقل.
//
// الحقول: sub (معرّف التصنيف) · kind (نوع التصنيف، افتراضيًا subbranch)
//         type (نوع المحتوى) · slug (معرّف المحتوى، متطابق في اللغتين)
//         ar / en: { title, summary, body }
// ============================================================================

export const TOPICS = [
  // ============ 1) الفقه المقارن ============
  {
    sub: 'comparative-fiqh',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'comparative-fiqh-history',
    ar: {
      title: 'الفقه المقارن: نشأته ومنهجه',
      summary: 'كيف نشأ علم الخلاف والمقارنة بين المذاهب، وما خطوات الترجيح فيه؟',
      body: 'الفقه المقارن علمٌ يُعرض فيه الحكم الشرعي مقرونًا بمآخذ المجتهدين واختلافهم، مع الموازنة بين الأدلة وبيان الراجح. وجذوره قديمة: ظهر في كتب «الخلاف» عند الحنفية و«النوازل» عند المالكية، ثم استقرّ مصطلحه في العصر الحديث.\n\nمنهجه ثلاث خطوات: تحرير محل الخلاف، ثم عرض أقوال الأئمة وأدلتهم دون تحريف، ثم الموازنة والترجيح وفق قواعد الأصول. والمقصود ليس جمع الأقوال فحسب، بل فهم عللها ومقاصدها.\n\nويُشترط في الباحث إجادة أصول الفقه، والإنصاف، وترك التعصّب؛ فالمقارنة ميزانٌ يُطلب به الحق لا نصرة مذهب بعينه.',
    },
    en: {
      title: 'Comparative Fiqh: Origins and Method',
      summary: 'How did the science of comparison between schools arise, and what are its steps of weighing?',
      body: 'Comparative fiqh presents a ruling together with the reasoning of the jurists and their differences, weighing the evidence and identifying the preponderant view. Its roots are old: it appeared in the "khilaf" works of the Hanafis and the "nawazil" of the Malikis, and its term settled in the modern era.\n\nIts method has three steps: defining the point of disagreement, presenting the imams\u0027 positions and evidence faithfully, then weighing and preferring according to the principles of jurisprudence. The aim is not merely to collect opinions, but to grasp their reasons and objectives.\n\nThe researcher must master usul al-fiqh, be fair, and abandon partisanship; comparison is a scale that seeks the truth, not the victory of a particular school.',
    },
  },
  {
    sub: 'comparative-fiqh',
    kind: 'subbranch',
    type: 'article',
    slug: 'comparative-fiqh-method',
    ar: {
      title: 'منهج الموازنة بين الأدلة والترجيح',
      summary: 'خطوات عملية لترجيح قول على قول دون خلط بين الأدلة والاصطلاحات.',
      body: 'الترجيح ثمرة الفقه المقارن؛ ولا يصحّ قبل تحرير محل الخلاف، إذ كثير من الخلاف لفظي أو مبنيّ على اختلاف في تصوير المسألة. فأول العمل: تحديد محل النزاع تحديدًا دقيقًا.\n\nثم يُنظر في الأدلة من جهتين: الثبوت (صحة النقل) والدلالة (وجه الاستفادة). فإن تعارض دليلان قُدّم الأقوى من جهة السند أو الدلالة، أو يُجمع بينهما إن أمكن الجمع، أو يُعمل بالتراجيح الأصولية كتقديم الخاص على العام والمقيّد على المطلق.\n\nويُراعى تغيّر الفتوى بتغيّر الزمان والمكان والعرف عند تحقّق شرطه، مع بقاء النصّ حاكمًا. والغاية: اختيار أقرب الأقوال إلى الدليل والمقصد، مع احترام اجتهاد المخالف.',
    },
    en: {
      title: 'Weighing Evidence and Preferring a View',
      summary: 'Practical steps for preferring one position over another without mixing evidence and terminology.',
      body: 'Preponderance is the fruit of comparative fiqh, and it is invalid before defining the point of disagreement, since much disagreement is verbal or rests on a different conception of the issue. The first task is to delimit the dispute precisely.\n\nThen the evidence is examined from two angles: authenticity of transmission and indication of meaning. If two proofs conflict, the stronger in chain or in meaning is preferred, or they are reconciled if possible, or classical preferences are applied such as the specific over the general and the restricted over the absolute.\n\nChanging times, places, and custom may change a fatwa where its conditions are met, while the text remains the judge. The goal is to choose the view closest to the evidence and objective, while respecting the disagreement of others.',
    },
  },
  {
    sub: 'comparative-fiqh',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'comparative-fiqh-etiquette',
    ar: {
      title: 'أدب الخلاف الفقهي بين المذاهب',
      summary: 'ضوابط شرعية وأخلاقية تحفظ الأخوّة مع اختلاف الاجتهاد.',
      body: 'الاختلاف في الفروع الفقهية واقعٌ بحكم اختلاف الأفهام والأدلة، وهو اختلاف تنوّعٍ لا تضادّ. لذلك لا يجوز أن يُبنى عليه تباغض أو تقاطع، ولا أن يُنزل المخالف منزلة المبتدع في مسائل الاجتهاد.\n\nمن أدب الخلاف: حسن الظن بالمخالف، والبحث عن أعذاره، والعلم بأنه مجتهد مأجور إن أصاب فله أجران وإن أخطأ فله أجر، والكفّ عن الطعن في النيات، والحوار بعلمٍ ورفق.\n\nوحيث وُجدت مصلحة شرعية راجحة في الاجتماع والتنسيق في القضايا العامة، فهذا من مقاصد الشريعة في وحدة الصف، مع بقاء كلّ على اجتهاده في مسائل الفروع.',
    },
    en: {
      title: 'Etiquette of Juristic Disagreement',
      summary: 'Shar\u0027i and moral limits that preserve brotherhood despite differences of judgement.',
      body: 'Disagreement in subsidiary rulings is a natural consequence of differing understanding and evidence, and it is a disagreement of variety, not of contradiction. It must not therefore be made a cause of enmity or boycott, nor should the one who differs be treated as an innovator in matters of judgement.\n\nAmong the etiquettes of disagreement: thinking well of the other, seeking their excuses, knowing that a mujtahid is rewarded, with two rewards if correct and one if mistaken, refraining from attacking intentions, and discussing with knowledge and gentleness.\n\nWhere there is a preponderant interest in coming together and coordinating on public issues, that belongs to the objectives of the Shariah in preserving unity, while each retains their own judgement in subsidiary matters.',
    },
  },

  // ============ 2) التاريخ الإسلامي ============
  {
    sub: 'islamic-history',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'islamic-history-method',
    ar: {
      title: 'منهج قراءة التاريخ الإسلامي',
      summary: 'كيف نقرأ أحداث التاريخ بغير غلوٍّ في التقديس ولا جفاءٍ في التجريح؟',
      body: 'التاريخ خبرٌ ونقل، ولا يُقبل إلا بعد فحص السند والمتن، ومعرفة راوي الخبر وميله. وقد وضع المحدّثون والمؤرخون قواعد نقدية دقيقة ينبغي استصحابها عند قراءة أي واقعة.\n\nومن المنهج: التمييز بين الثابت والمشهور والمكذوب، ومراعاة سياق الزمان والعرف، وعدم إسقاط مفاهيم اليوم على أمس، والتفريق بين فعل الفرد ومسؤولية الأمة.\n\nوالغاية من القراءة ليست التسلية ولا التعصّب، بل أخذ العبرة: معرفة سنن الله في الأمم، وفهم كيف قامت الحضارة وكيف سقطت، والاقتداء بالصالح واجتناب ما جلب النكبة.',
    },
    en: {
      title: 'How to Read Islamic History',
      summary: 'Reading historical events without either sanctifying or disparaging them.',
      body: 'History is report and transmission, and it is not accepted until its chain and content are examined and the reporter and his bias are known. The hadith scholars and historians laid down precise critical rules that should accompany the reading of any event.\n\nPart of the method is distinguishing the established from the well-known and the fabricated, attending to the context of time and custom, refusing to impose today\u0027s concepts on yesterday, and separating the act of an individual from the responsibility of the community.\n\nThe aim of reading is neither entertainment nor partisanship, but taking the lesson: knowing God\u0027s laws among nations, understanding how civilisation rose and fell, following the righteous, and avoiding what brought calamity.',
    },
  },
  {
    sub: 'islamic-history',
    kind: 'subbranch',
    type: 'article',
    slug: 'islamic-history-rashidun',
    ar: {
      title: 'عصر النبوة والخلافة الراشدة: نظرة إجمالية',
      summary: 'محطات كبرى من البعثة إلى سنة الجماعة، ودلالاتها التربوية.',
      body: 'بدأ عصر النبوة بالوحي في مكة، فمرّ بمراحل الدعوة السرّية ثم الجهرية ثم الهجرة، حتى قامت الدولة في المدينة على أساس الأخوّة والمساواة والتشاور، وأُرسيت أحكام العبادات والمعاملات.\n\nثم جاءت خلافة أبي بكر فثبّتت الأمة وواجهت الردة وجُمع القرآن، ثم عمر فاتّسعت الفتوح ونُظّمت الدواوين والقضاء والتقويم، ثم عثمان فجمع الأمة على مصحفٍ واحد واجهت خلافته فتنةً، ثم عليّ في مرحلةٍ عصيبة كثر فيها الاختلاف.\n\nوهذه المرحلة مدرسةٌ في القيادة والشورى والزهد وترتيب الأولويات، ومعرفة أسباب الاختلاف تعصم من تكفير المسلمين بسبب ما جرى بين الصحابة.',
    },
    en: {
      title: 'The Prophetic Era and the Rashidun Caliphate',
      summary: 'Major milestones from the revelation to the year of unity, and their educational lessons.',
      body: 'The prophetic era began with revelation in Makkah, passing through the stages of secret then public preaching and then migration, until a state stood in Madinah on the basis of brotherhood, equality, and consultation, with the rulings of worship and dealings established.\n\nThen came the caliphate of Abu Bakr, which steadied the community, confronted apostasy, and gathered the Quran; then Umar, under whom conquests expanded and the registers, judiciary, and calendar were organised; then Uthman, who united the community on a single codex and whose caliphate faced turmoil; then Ali, in a difficult stage of much disagreement.\n\nThis period is a school in leadership, consultation, asceticism, and prioritisation, and knowing the causes of disagreement guards against declaring Muslims disbelievers over what occurred among the Companions.',
    },
  },
  {
    sub: 'islamic-history',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'islamic-history-states',
    ar: {
      title: 'الدولتان الأموية والعباسية: تحوّلات ودراسة',
      summary: 'قراءة تحليلية في مؤسسات الدولة وأسباب الصعود والانحدار.',
      body: 'قامت الدولة الأموية على قاعدة الشام، وامتازت بالتوسّع والتنظيم الإداري، وأنشأت دواوين البريد والخاتم، ونشط فيها الفتح في المشرق والمغرب، لكنّها واجهت مسائل في العلاقة بين الحكم والرعية وبعض الفتن الداخلية.\n\nثم آلت الخلافة إلى العباسيين، فبلغت الحضارة ذروتها في العلوم والعمران والترجمة، وأنشئ بيت الحكمة، ونشطت الحركة العلمية حتى قيل إن كبار الأئمة الأربعة تلاميذ هذه البيئة. ومع اتساع الدولة ظهر الاستقلال التدريجي للأقاليم.\n\nوالدرس المستفاد: أنّ قوّة الأمة مرتبطة بالعدل والعلم والأخذ بالأسباب، وأنّ ضعفها يبدأ بفساد الداخل وانشغالها بالخلاف قبل الخارج.',
    },
    en: {
      title: 'The Umayyad and Abbasid States',
      summary: 'An analytical reading of state institutions and the causes of rise and decline.',
      body: 'The Umayyad state arose on a Levantine base, distinguished by expansion and administrative organisation; it established the post and seal offices, and conquest flourished in the east and west, though it faced questions in the relationship between ruler and ruled and some internal turmoil.\n\nThen the caliphate passed to the Abbasids, and civilisation reached its peak in the sciences, construction, and translation; the House of Wisdom was founded and scholarly activity flourished, to the point that the four great imams are counted among the students of that environment. As the state expanded, provinces gradually asserted independence.\n\nThe lesson is that a community\u0027s strength is tied to justice, knowledge, and taking the means, and that its weakness begins with internal corruption and preoccupation with dispute before the external.',
    },
  },

  // ============ 3) تزكية النفس ============
  {
    sub: 'tazkiyah-nafs',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'tazkiyah-concept',
    ar: {
      title: 'التزكية: مفهومها ومنزلتها في الإسلام',
      summary: 'لماذا كانت تزكية النفس مقصدًا للرسالة، وما ضابطها الشرعي؟',
      body: 'التزكية تطهير النفس من الأخلاق المذمومة وتنميتها على الأخلاق المحمودة، وقد قرن الله تعالى الفلاح بها في قوله: «قد أفلح من زكّاها». وهي غايةٌ من غايات البعثة، كما في قوله: «ويزكّيهم ويعلّمهم».\n\nوضابطها الشرعي: أنّها تُطلب بالعلم والعبادة والعمل، لا بالانقطاع والرياضات المبتدعة؛ فطريقها الصحيح العلم النافع والعمل الصالح، مع محاسبة النفس ومجاهدتها على قدر الطاقة.\n\nوالتزكية ليست ترفًا سلوكيًّا، بل شرطٌ في إحسان العمل وقبوله، ومن هنا كانت وسطًا بين من أهملها ومن غلا فيها حتى ترك الفرائض بحجّة التصفية.',
    },
    en: {
      title: 'Purification of the Self: Concept and Place in Islam',
      summary: 'Why is self-purification a goal of the message, and what are its limits?',
      body: 'Purification (tazkiyah) is cleansing the self of blameworthy traits and developing it upon praiseworthy ones, and God linked success to it: "He has succeeded who purifies it." It is one of the goals of the mission, as in: "and purifies them and teaches them."\n\nIts limit is that it is sought through knowledge, worship, and action, not through withdrawal and invented austerities; its sound path is beneficial knowledge and righteous action, with self-accounting and striving within capacity.\n\nPurification is not a behavioural luxury but a condition for excellence and acceptance of deeds. Hence it stands between those who neglect it and those who exceed in it until they abandon obligations under the pretext of refinement.',
    },
  },
  {
    sub: 'tazkiyah-nafs',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'tazkiyah-heart-diseases',
    ar: {
      title: 'أمراض القلوب وعلاجها',
      summary: 'الكبر والحسد والغفلة: أسبابها وسبل مداواتها.',
      body: 'أمراض القلوب أخفى خطرًا من أمراض الأبدان؛ فالكبر يمنع قبول الحق، والحسد يأكل الحسنات ويقطع الأخوّة، والغفلة تُنسي الآخرة وتُغرق في الدنيا، والرياء يُحبِط العمل.\n\nوعلاجها يبدأ بالعلم: معرفة المرض وآثاره، ثم الصدق مع الله في طلب الشفاء، ثم العمل المضاد: فالكبر يُداوى بالتواضع وتذكّر الأصل، والحسد بالمحبة والدعاء للمحسود، والغفلة بمجالس الذكر وتدبّر القرآن، والرياء بإخفاء العمل ومحاسبة النية.\n\nويُستعان على ذلك بالصحبة الصالحة، وترك مواطن الفتنة، والدوام على الاستغفار؛ فإنّ في القلب أمراضًا لا يشفيه إلا الإخلاص والصبر.',
    },
    en: {
      title: 'Diseases of the Heart and Their Cure',
      summary: 'Arrogance, envy, and heedlessness: their causes and remedies.',
      body: 'Diseases of the heart are subtler in danger than diseases of the body: arrogance prevents accepting the truth, envy consumes good deeds and severs brotherhood, heedlessness makes one forget the Hereafter and drown in the world, and showing off voids the deed.\n\nThe cure begins with knowledge: recognising the disease and its effects, then sincerity with God in seeking healing, then the opposite action: arrogance is cured by humility and recalling one\u0027s origin, envy by love and praying for the one envied, heedlessness by gatherings of remembrance and pondering the Quran, and showing off by concealing the deed and examining intention.\n\nAid comes from righteous company, avoiding places of temptation, and persisting in seeking forgiveness; for the heart has diseases cured only by sincerity and patience.',
    },
  },

  // ============ 4) أسباب النزول ============
  {
    sub: 'asbab-nuzul',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'asbab-nuzul-importance',
    ar: {
      title: 'أسباب النزول: تعريفها وأثرها في الفهم',
      summary: 'لماذا يُعدّ معرفة سبب النزول من أعظم مفاتيح التفسير؟',
      body: 'سبب النزول ما نزلت الآية أو الآيات عقبه من واقعة أو سؤال. وهو خبرٌ نقلي، يُقبل بالرواية الصحيحة، ولا يُعمل فيه بالرأي، وقد ألّف فيه الواحدي والسيوطي.\n\nوأثره في الفهم عظيم: فهو يعيّن المراد في الآيات التي يتردّد فيها الاحتمال، ويزيل الإشكال، ويمنع من تفسير النصّ بما لا يتحمّله. ومن هنا قال العلماء: معرفة سبب النزول تعين على فهم الآية ودفع الشبهة عنها.\n\nوينبغي التنبيه على أنّ الخبر في سبب النزول لا يخصص عموم الآية إذا كان لفظها عامًّا؛ فالعبرة بعموم اللفظ لا بخصوص السبب، وهذا أصلٌ مهمّ في أصول التفسير.',
    },
    en: {
      title: 'Reasons of Revelation: Definition and Impact on Understanding',
      summary: 'Why is knowing the occasion of revelation one of the greatest keys to exegesis?',
      body: 'The reason of revelation is the event or question after which a verse or verses were revealed. It is transmitted report, accepted through sound narration and not determined by opinion; al-Wahidi and al-Suyuti wrote works on it.\n\nIts impact on understanding is great: it specifies the intended meaning in verses where possibility wavers, removes difficulty, and prevents interpreting the text beyond its capacity. Hence the scholars said that knowing the reason of revelation helps understand the verse and repel doubts about it.\n\nIt should be noted that a report about the reason does not restrict the general wording of a verse: the criterion is the generality of the wording, not the particularity of the occasion, an important principle of exegesis.',
    },
  },

  // ============ 5) مقارنة الأديان ============
  {
    sub: 'comparative-religion',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'comparative-religion-method',
    ar: {
      title: 'أصول مقارنة الأديان ومنهج القرآن في الحوار',
      summary: 'كيف نتناول الأديان الأخرى بعلمٍ وعدلٍ وبيانٍ للحق؟',
      body: 'مقارنة الأديان علمٌ يدرس المعتقدات والكتب والعبادات، ويُشترط فيه: الرجوع إلى المصادر الأصلية، والأمانة في نقل مذاهب الآخرين، والتمييز بين المعتقد الرسمي وممارسات أتباعه.\n\nومن القواعد: عدم حمل كلام المتكلّم على أشدّ الاحتمالات، وبيان المشترك ابتداءً ثم بيان موضع الافتراق، والاستدلال بالبراهين لا بالمشاعرات، فإنّ الغرض هداية لا انتصار.\n\nوقد رسم القرآن هذا المنهج في مثل قوله: «ولا تجادلوا أهل الكتاب إلا بالتي هي أحسن»، وفي قوله: «قل يا أهل الكتاب تعالوا إلى كلمة سواء»، فجمع بين العدل في العرض والرحمة في النصح والبيان الواضح للحق.',
    },
    en: {
      title: 'Principles of Comparative Religion and the Quranic Method of Dialogue',
      summary: 'How do we approach other religions with knowledge, fairness, and clarity about the truth?',
      body: 'Comparative religion studies beliefs, scriptures, and worship. It requires returning to primary sources, honesty in conveying others\u0027 positions, and distinguishing the official doctrine from the practices of its followers.\n\nAmong its rules: not taking a speaker\u0027s words at their harshest possibility, stating what is shared first and then where the divergence lies, and arguing with proofs rather than rhetoric, since the purpose is guidance not victory.\n\nThe Quran drew this method in verses such as "do not argue with the People of the Book except in the best manner" and "say: O People of the Book, come to a common word," combining fairness in presentation, mercy in advice, and clear clarification of the truth.',
    },
  },

  // ============ 6) منهج الدعوة ============
  {
    sub: 'dawah-manhaj',
    kind: 'subbranch',
    type: 'article',
    slug: 'dawah-stages',
    ar: {
      title: 'منهج الدعوة ومراحلها الثلاث',
      summary: 'من الدعوة الفردية إلى بناء الجماعة: دروس من السيرة.',
      body: 'سار النبي صلى الله عليه وسلم في الدعوة على مراحل: الدعوة السرّية لبناء الأساس الإيماني، ثم الجهر بالدعوة ومواجهة الاعتراض بالحجة، ثم بناء الدولة والمنهج التربوي في المدينة.\n\nومن ثمرات هذه المراحل: التدرّج، وتقديم الأهمّ على المهمّ، والعمل بالأسباب مع التوكل، وتربية الأفراد قبل المطالبة بتغيير الأنظمة، فإنّ بناء الإنسان أصل بناء العمران.\n\nويُستفاد أيضًا: أنّ الداعية يبدأ بالتوحيد كأصل الدعوة، ويراعي حال المدعوّ وقدر استعداده، ويجمع بين الرفق في الأسلوب والقوة في الحق، ويصبر على الأذى؛ فإنّ الدعوة إلى الله تحتاج نفسًا طويلًا وعلمًا راسخًا.',
    },
    en: {
      title: 'The Method and Three Stages of Dawah',
      summary: 'From individual invitation to community building: lessons from the Prophetic biography.',
      body: 'The Prophet, peace be upon him, advanced in dawah through stages: the secret invitation to build the faith foundation, then public invitation with reasoned engagement of objections, then building the state and the educational method in Madinah.\n\nAmong the fruits of these stages: gradualism, prioritising the most important, using means while trusting God, and cultivating individuals before demanding change in systems, since building people is the basis of building civilisation.\n\nThe caller also learns to begin with monotheism as the root of the call, to consider the state and readiness of the one invited, to combine gentleness of manner with firmness in truth, and to be patient under harm; for calling to God requires long endurance and firmly rooted knowledge.',
    },
  },

  // ============ 7) الأسرة ============
  {
    sub: 'family',
    kind: 'field',
    type: 'lesson',
    slug: 'family-foundations',
    ar: {
      title: 'بناء الأسرة المسلمة: أسسها ومقاصدها',
      summary: 'ما الأسس الشرعية لقيام أسرة مستقرة، وما مقاصدها في الإسلام؟',
      body: 'الأسرة في الإسلام لبنة المجتمع الأولى، ومقاصدها: حفظ النسل، وتحصين النفس، وتربية الأجيال، والسكن والمودّة والرحمة بين الزوجين.\n\nوتقوم على أسس: الاختيار على أساس الدين وحسن الخلق، والصدق والوضوح في العقد، والعدل في الحقوق والواجبات، والتشاور في شؤون البيت، وحسن الخلق في المعاشرة مع الوعي بطبائع النفس.\n\nويُعتنى بالتربية الإيمانية للأولاد: تعويدهم الصلاة، وتعليمهم الأخلاق، وإشعارهم بالمسؤولية تدريجيًّا، وحلّ الخلافات بعيدًا عنهم. والهداف إلى أنّ إصلاح الأسرة إصلاح للأمة كلها.',
    },
    en: {
      title: 'Building a Muslim Family: Foundations and Objectives',
      summary: 'What are the Shariah foundations of a stable family, and its objectives in Islam?',
      body: 'The family in Islam is the first building block of society. Its objectives are preserving lineage, guarding chastity, raising generations, and the tranquillity, affection, and mercy between spouses.\n\nIt stands on foundations: choosing on the basis of religion and good character, truthfulness and clarity in the contract, justice in rights and duties, consultation in household affairs, and good conduct in companionship with awareness of human nature.\n\nFaith-based upbringing of children is cared for: accustoming them to prayer, teaching them manners, gradually giving them responsibility, and resolving disputes away from them. The aim is that reforming the family is reforming the entire community.',
    },
  },

  // ============ 8) الخلفاء الراشدون ============
  {
    sub: 'khulafa',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'khulafa-abu-bakr',
    ar: {
      title: 'خلافة أبي بكر الصديق: التثبيت ومواجهة الردة',
      summary: 'كيف قاد الصديق الأمة في أخطر لحظة بعد وفاة النبي ﷺ؟',
      body: 'تولّى أبو بكر الخلافة في لحظةٍ حرجة، فبدأ بتثبيت قلوب المسلمين، وبيّن أنّ محمدًا رسولٌ قد مات وأنّ الله حيّ لا يموت، فردّ الله به به الأمة إلى الصواب.\n\nثم واجه أعظم أزمتين: ردّة طوائف من العرب، ودعوى مَن منع الزكاة؛ فصمّم على قتالهم مستندًا إلى أمر الشرع، فكانت حروب الردة، وقرّت الأمة على الأمر الأول.\n\nوأنفذ جيش أسامة كما أمر به النبي ﷺ، وجهّز جيوش الشام والعراق، وجمع القرآن في مصحف واحد بمشورة عمر، وأدار الأمة بالشورى والزهد والقضاء العادل؛ فكانت خلافته القصيرة مدرسةً في القيادة والأمانة.',
    },
    en: {
      title: 'The Caliphate of Abu Bakr: Steadiness and Confronting Apostasy',
      summary: 'How did al-Siddiq lead the community at the most dangerous moment after the Prophet\u0027s death?',
      body: 'Abu Bakr assumed the caliphate at a critical moment. He began by steadying the hearts of the Muslims, making clear that Muhammad was a messenger who had died while God is living and does not die, and through him God restored the community to what was right.\n\nHe then faced two great crises: the apostasy of groups of Arabs, and the claim of those who withheld zakat. He resolved to fight them on the authority of the law, and the wars of apostasy followed, restoring the community to its first state.\n\nHe dispatched Usamah\u0027s army as the Prophet had commanded, equipped the armies of Syria and Iraq, gathered the Quran into a single codex on Umar\u0027s counsel, and governed through consultation, asceticism, and just judgement; his short caliphate was a school in leadership and trust.',
    },
  },

  // ============ 9) مصطلح الحديث ============
  {
    sub: 'mustalah',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'mustalah-origins',
    ar: {
      title: 'مصطلح الحديث: نشأته وأشهر مصنفاته',
      summary: 'كيف نشأ علم المصطلح، وما أشهر كتبه ومعاني حدوده؟',
      body: 'نشأ علم المصطلح تدريجيًّا مع الحاجة إلى حفظ السنة من الدخيل؛ فبدأت القواعد في كلام المحدّثين، ثم أُفردت في مصنفات، حتى استقرّت في «المحدث الفاصل» للرامهرمزي، و«معرفة علوم الحديث» للحاكم، و«المقدمة» لابن الصلاح التي صارت عمدةً لِما بعدها.\n\nومن أشهر مصطلحاته: الصحيح والحسن والضعيف، والمتواتر والآحاد، والمنقطع والمرسل والمدلَّس، والشاذ والمنكر والمعلَّل؛ ولكل حدٍّ شروطٌ يُنظر فيها إلى السند والمتن معًا.\n\nوقيمة هذا العلم أنّ به يُعرف المقبول من المردود، وهو مقدّمةٌ لازمة لفقه السنة، وقد تنوّعت كتبه بين مختصرٍ كـ«البيقونية» ومتوسطٍ كـ«نخبة الفكر» وموسّعٍ كـ«تدريب الراوي».',
    },
    en: {
      title: 'Hadith Terminology: Origins and Main Works',
      summary: 'How did the science of hadith terminology arise, and what are its main books and terms?',
      body: 'The science of terminology grew gradually with the need to protect the Sunnah from intrusion. Its rules began in the speech of the hadith scholars, then were gathered into works, settling in al-Ramahurmuzi\u0027s "al-Muhaddith al-Fasil," al-Hakim\u0027s "Marifat Ulum al-Hadith," and Ibn al-Salah\u0027s "Muqaddimah," which became the authority for what followed.\n\nAmong its best-known terms are: sound, good, and weak; mass-transmitted and solitary; disconnected, loose, and concealed; anomalous, rejected, and defective. Each definition has conditions in which both the chain and the content are examined.\n\nThe value of this science is that by it the acceptable is known from the rejected, and it is a necessary prelude to understanding the Sunnah. Its works range from the concise, such as al-Bayquniyyah, to the intermediate, such as Nukhbat al-Fikar, to the expansive, such as Tadrib al-Rawi.',
    },
  },

  // ============ 10) الأسماء والصفات ============
  {
    sub: 'names-attributes',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'names-attributes-rule',
    ar: {
      title: 'قاعدة أهل السنة في الأسماء والصفات',
      summary: 'إثبات بلا تمثيل، وتنزيه بلا تعطيل: ضبط المسألة.',
      body: 'منهج أهل السنة في باب الأسماء والصفات: إثبات ما أثبته الله لنفسه أو أثبته له رسوله ﷺ من الأسماء والصفات، من غير تحريف ولا تعطيل، ومن غير تكييف ولا تمثيل، امتثالًا لقوله: «ليس كمثله شيء وهو السميع البصير».\n\nففي الآية إثباتٌ في قوله «السميع البصير»، وتنزيهٌ في قوله «ليس كمثله شيء»؛ فمن أثبت بلا تنزيه شابه، ومن نزّه بلا إثبات عطّل، والصراط المستقيم الجمع بينهما.\n\nوللأسماء الحسنى ثلاث دلالات: دلالةٌ على الذات، ودلالةٌ على المعنى، ودلالةٌ على الاقتران؛ ولا تُشتقّ من أفعاله أسماءٌ مطلقة إلا ما ورد به الدليل، ويُوقف في كل ما لم يثبت على النصوص.',
    },
    en: {
      title: 'The Sunni Principle on Divine Names and Attributes',
      summary: 'Affirmation without likeness, and transcendence without denial.',
      body: 'The way of Ahl al-Sunnah concerning names and attributes is to affirm what God has affirmed for Himself or what His Messenger affirmed for Him, without distortion or denial and without asking how or likening, in compliance with "There is nothing like unto Him, and He is the Hearing, the Seeing."\n\nIn this verse there is affirmation in "the Hearing, the Seeing" and transcendence in "there is nothing like unto Him." Whoever affirms without transcendence likens Him, and whoever transcends without affirming denies Him; the straight path combines both.\n\nThe most beautiful names have three implications: pointing to the Essence, to the meaning, and to their pairing. Absolute names are not derived from His acts except with evidence, and wherever the texts are silent one stops at the texts.',
    },
  },

  // ============ 11) القدر ============
  {
    sub: 'qadar',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'qadar-four-levels',
    ar: {
      title: 'القدر ومراتبه الأربع',
      summary: 'العلم والكتابة والمشيئة والخلق: كيف نجمع بين القدر والمسؤولية؟',
      body: 'الإيمان بالقدر أصلٌ من أصول الإيمان، ومراتبه أربع: علم الله سبحانه بما كان وما سيكون، وكتابته في اللوح المحفوظ، ومشيئته النافذة فلا يقع في ملكه إلا ما يريد، وخلقه لكل شيء من الخير والشر خلقًا وإيجادًا لا رضًا ولا أمرًا بالشر.\n\nويُجمع بين القدر والمسؤولية: أنّ الله أعطى العبد قدرةً واختيارًا يَكتسب به فعله، وأقام عليه الحجة بالرسل والكتب، فلا يُحتجّ بالقدر على المعصية، بل يُحتجّ به عند المصائب؛ فقد نهى النبي ﷺ عن الخوض في القدر بعد أن رأى أصحابه يتنازعون، وأمر بالإيمان به وترك الجدال فيه.',
    },
    en: {
      title: 'Divine Decree and Its Four Levels',
      summary: 'Knowledge, writing, will, and creation: how do we reconcile decree with responsibility?',
      body: 'Belief in divine decree is a pillar of faith, and it has four levels: God\u0027s knowledge of what was and will be; His writing of it in the Preserved Tablet; His effective will, so that nothing occurs in His dominion except what He wills; and His creation of all things, good and evil, as creation and bringing into being, not as approval or command of evil.\n\nDecree and responsibility are reconciled in that God gave the servant ability and choice by which he earns his act, and established the proof against him through messengers and books. Decree is therefore not pleaded against sin, but is pleaded at times of calamity; the Prophet forbade disputing about decree after he saw his companions arguing, ordering belief in it and abandoning dispute.',
    },
  },

  // ============ 12) الفرق والمذاهب ============
  {
    sub: 'sects',
    kind: 'subbranch',
    type: 'article',
    slug: 'sects-rules-of-judgement',
    ar: {
      title: 'الفرق والمذاهب: ضوابط الحكم والتحذير',
      summary: 'متى نقول إنّ الفرقة خارجة عن أهل السنة، وما الفرق بين البدعة والمعصية؟',
      body: 'الأصل في الحكم على الفرق: العدل وعدم الغلوّ؛ فيُفرّق بين صاحب البدعة المقلّد الجاهل، والداعية إلى البدعة، وبين أهل البدع الذين خرجوا عن أصول أهل السنة في باب من الأبواب.\n\nويُفرّق أيضًا بين البدعة في العبادة، والخطأ في الاجتهاد، والمعصية؛ فالمعصية لا تُخرج من السنة، والخطأ في مسائل الاجتهاد يُعذر صاحبه إن اجتهد، أمّا البدعة فأمرها أشدّ لأنّها تشريعٌ لم يأذن به الله.\n\nويُحكم على الفرد بحسب ما يتبيّن من قوله، والإنكار يقع على المقال لا على الأشخاص أصلًا، مع سلوك طريق النصح والبيان؛ وقد تنوّعت الفرق تاريخيًّا كالخوارج والقدرية والجهمية والمعتزلة والشيعة وإلى زماننا هذا، واشترك كثير منها في مآخذ على النصوص.',
    },
    en: {
      title: 'Sects and Schools: Rules of Judgement and Warning',
      summary: 'When does a group leave Ahl al-Sunnah, and what distinguishes innovation from sin?',
      body: 'The principle in judging groups is fairness and avoiding excess. A distinction is drawn between a follower of innovation who is an ignorant imitator and one who calls to innovation, and between those innovators who left the principles of Ahl al-Sunnah in one of the chapters.\n\nA distinction is also drawn between innovation in worship, error in judgement, and sin. Sin does not expel one from the Sunnah, and an error in matters of judgement is excused if the person strove to judge rightly, whereas innovation is graver because it legislates what God did not permit.\n\nAn individual is judged by what is clear from his words, and the denunciation falls on the statement, not the person as such, while following the path of advice and clarification. Historically the sects varied, such as the Khawarij, Qadariyyah, Jahmiyyah, Mutazilah, and Shiite groups down to our time, and many shared criticisms of the texts.',
    },
  },

  // ============ 13) السيرة النبوية ============
  {
    sub: 'seerah-nabawiyah',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'seerah-birth',
    ar: {
      title: 'مولد النبي ﷺ ونشأته',
      summary: 'من مولد يتيمٍ في مكة إلى أُمّيٍّ يؤتمن على أعظم رسالة.',
      body: 'وُلد النبي صلى الله عليه وسلم في مكة عام الفيل، يتيمًا؛ فقد توفي أبوه وهو في بطن أمه، ثم توفيت أمه آمنة وهو ابن ست سنين، فكفله جدّه عبد المطّلب، ثم عمّه أبو طالب.\n\nونشأ على الفطرة والعفّة، فرُعي الغنم في صغره، واشتغل بالتجارة، وعُرف بين قريش بالصادق الأمين حتى قبل النبوة، وشهد حلف الفضول، وشارك في وضع الحجر الأسود.\n\nوسافر مع عمّه إلى الشام، وتزوّج خديجة رضي الله عنها، وتحنّث في غار حراء حتى جاءه الوحي وهو ابن أربعين. وهي بدايةٌ تدلّ على أنّ الإعداد الإلهي سبق الرسالة، وأنّ الأمانة والخُلق أساس القيادة.',
    },
    en: {
      title: 'The Prophet\u0027s Birth and Upbringing',
      summary: 'From an orphan born in Makkah to an unlettered man entrusted with the greatest message.',
      body: 'The Prophet, peace be upon him, was born in Makkah in the Year of the Elephant as an orphan; his father died while his mother was pregnant with him, and his mother Aminah died when he was six. His grandfather Abd al-Muttalib then cared for him, and after him his uncle Abu Talib.\n\nHe grew on natural purity and chastity; he herded sheep in his youth and worked in trade, and was known among Quraysh as the truthful and trustworthy even before prophethood. He witnessed the Pact of al-Fudul and took part in placing the Black Stone.\n\nHe travelled with his uncle to Syria, married Khadijah, may God be pleased with her, and withdrew to the cave of Hira until revelation came to him at the age of forty. This beginning shows that divine preparation preceded the message, and that trustworthiness and character are the foundation of leadership.',
    },
  },

  // ============ 14) التوحيد ============
  {
    sub: 'tawhid',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'tawhid-types',
    ar: {
      title: 'التوحيد: أنواعه وفضله',
      summary: 'الربوبية والألوهية والأسماء والصفات: كيف يتحقق التوحيد؟',
      body: 'التوحيد إفراد الله بما يختصّ به من الربوبية والألوهية والأسماء والصفات. فتوحيد الربوبية: إفراده بالخلق والرزق والتدبير؛ وتوحيد الألوهية: إفراده بالعبادة، وهو مقصد الرسالة؛ وتوحيد الأسماء والصفات: إثباتها كما وردت بلا تحريف ولا تمثيل.\n\nولا يتحقق الإيمان حتى تُجمع هذه الأنواع؛ فقد كان المشركون يقرّون بالربوبية ويصرفون العبادة لغير الله، فدعاهم القرآن إلى الألوهية، وهي عمود الإسلام.\n\nوفضل التوحيد عظيم: هو أوّلُ واجبٍ، وأصلُ الفلاح، وشرطُ قبول العمل، وسببُ الأمن؛ كما قال تعالى: «الذين آمنوا ولم يلبسوا إيمانهم بظلم أولئك لهم الأمن».',
    },
    en: {
      title: 'Monotheism: Its Types and Excellence',
      summary: 'Lordship, worship, and names and attributes: how is monotheism realised?',
      body: 'Monotheism is singling out God with what is His alone: Lordship, worship, and names and attributes. Lordship means singling Him out in creation, provision, and governance. Worship means singling Him out in worship, and this is the aim of the message. Names and attributes means affirming them as they came, without distortion or likening.\n\nFaith is not realised until these types are combined. The polytheists acknowledged Lordship while directing worship to others, and the Quran called them to the oneness of worship, the pillar of Islam.\n\nThe excellence of monotheism is great: it is the first obligation, the basis of success, a condition for acceptance of deeds, and a cause of security, as He said: "Those who believe and do not mix their faith with wrong, theirs is security."',
    },
  },

  // ============ 15) أصول الفقه ============
  {
    sub: 'usul-fiqh',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'usul-fiqh-evidence',
    ar: {
      title: 'الأدلة المتفق عليها والمختلف فيها',
      summary: 'الكتاب والسنة والإجماع والقياس، وما أُضيف إليها من الأدلة.',
      body: 'الأدلة المتفق عليها عند جمهور الأصوليين أربعة: الكتاب، والسنة، والإجماع، والقياس. فالكتاب أصل الأصل، والسنة مبينة له ومكمّلة، والإجماع حجةٌ لما دلت عليه النصوص على اعتصام الأمة بالحق، والقياس إلحاق فرعٍ بأصلٍ بجامعٍ شرعي.\n\nوأدلةٌ مختلفٌ فيها: قول الصحابي، والمصالح المرسلة، والاستحسان، والعرف، والاستصحاب، وشرع من قبلنا، وسدّ الذرائع؛ ويشترط في الاستدلال بها أن لا تعارض نصًّا ولا إجماعًا.\n\nوهذه الأدلة مشتركةٌ بين المذاهب في الجملة، والاختلاف في فروعها وتطبيقها، وبمعرفتها تُفهم مناهج الاستدلال ويُدرك سرّ اختلاف المجتهدين.',
    },
    en: {
      title: 'Agreed and Disputed Sources of Law',
      summary: 'The Quran, Sunnah, consensus, and analogy, and the sources added to them.',
      body: 'The sources agreed upon by the majority of jurists are four: the Quran, the Sunnah, consensus, and analogy. The Quran is the root of roots, the Sunnah clarifies and completes it, consensus is authoritative because the texts indicate the community\u0027s adherence to the truth, and analogy links a branch to a root through a Shariah-valid common cause.\n\nDisputed sources include: the statement of a Companion, unattached interests, juristic preference, custom, presumption of continuity, the laws of those before us, and blocking the means. Using them is conditional on their not opposing a text or consensus.\n\nThese sources are broadly shared among the schools, and disagreement lies in their branches and application. Knowing them clarifies methods of reasoning and reveals the reason for jurists\u0027 differences.',
    },
  },
];
