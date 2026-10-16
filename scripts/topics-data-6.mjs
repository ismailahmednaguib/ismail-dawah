// scripts/topics-data-6.mjs
// ============================================================================
// الدفعة السادسة: تعمير التصنيفات الباقية التي لا محتوى لها.
//
// هذه التصنيفات غير مربوطة مباشرة من هيكل التنقّل، لكنّ بعضها يظهر في صفحة
// «المجالات» (/fields) أو يُطلب برابط مباشر، فلا يجوز أن تكون فارغة.
//   contemporary (مجال · قضايا معاصرة) · ahkam · adhkar · daily-adhkar · dialogue
// ============================================================================

export const TOPICS = [
  {
    sub: 'contemporary',
    kind: 'field',
    type: 'lesson',
    slug: 'contemporary-issues-intro',
    ar: {
      title: 'قضايا معاصرة: المنهج وضبط المصطلحات',
      summary: 'كيف نتعامل مع النوازل الحديثة بمنهج شرعي راسخ؟',
      body: 'النوازل المعاصرة مسائل جديدة لم ينصّ عليها الفقهاء بأعيانها، فتحتاج اجتهادًا منضبطًا في ضوء النصوص والقواعد والمقاصد، لا مجرّد استحسانٍ عقلّي ولا تقليدٍ للغير.\n\nومن ضوابط هذا الاجتهاد: تحرير الواقع وتصويره تصويرًا صحيحًا، ثم تنزيل النصّ عليه، ثم مراعاة المصالح والمفاسد وترتيبها، ومراعاة المقاصد العامة كحفظ الدين والنفس والعقل والنسل والمال.\n\nويُلحظ أنّ التغيّر في الوسائل لا يُغيّر الأحكام الثابتة، وأنّ العرف معتبرٌ بشرطه، وأنّ القول على الله بلا علم من أعظم الخطر؛ فلذلك كان الرجوع إلى أهل العلم المتخصصين أهل الاختصاص مطلبًا شرعيًّا.',
    },
    en: {
      title: 'Contemporary Issues: Method and Terminology',
      summary: 'How do we address modern developments with a firmly grounded Shariah method?',
      body: 'Contemporary issues are new matters the jurists did not address by name, requiring disciplined reasoning in light of texts, maxims, and objectives, not mere rational preference nor imitation of others.\n\nIts controls include: accurately defining and depicting reality, then applying the text to it, then weighing interests and harms and ordering them, and observing the overarching objectives such as preserving religion, life, intellect, lineage, and wealth.\n\nIt is noted that change in the means does not change fixed rulings, that custom is authoritative within its conditions, and that speaking about God without knowledge is among the gravest dangers; hence returning to qualified specialists is a Shariah requirement.',
    },
  },
  {
    sub: 'contemporary',
    kind: 'field',
    type: 'article',
    slug: 'contemporary-technology-ruling',
    ar: {
      title: 'التقنية والذكاء الاصطناعي: نظرة شرعية',
      summary: 'ما الأصل في استخدام التقنية، وما الضوابط التي تلزم؟',
      body: 'الأصل في الأشياء والوسائل الإباحة، والتقنية وسيلةٌ كسائر الوسائل؛ تُحمد بحسب ما تُستعمل فيه وتُذمّ بحسبه. فمن استعملها في العلم والدعوة وتعليم الناس فقد أحسن، ومن استعملها في المحرّم أو إضاعة الحقوق فقد أساء.\n\nومن الضوابط: حفظ الأمانة، وصدق النقل، وعدم نسبة القول إلى الله أو إلى الناس بغير تحقّق، وعدم نشر ما يضرّ، ومراعاة الخصوصية، وتحري العدل في الرواية والتقييم.\n\nوما يُنتجه الذكاء الاصطناعي لا يُقبل إلا بعد المراجعة والتحقّق، فإنّ الأدوات لا تُسأل إلّا بعد سؤال من استعملها؛ والمسؤولية تقع على المستخدم لا على الأداة.',
    },
    en: {
      title: 'Technology and Artificial Intelligence: A Shariah View',
      summary: 'What is the default regarding technology, and what limits apply?',
      body: 'The default regarding things and means is permissibility, and technology is a means like any other: praised according to its use and blamed according to it. Whoever uses it for knowledge, dawah, and teaching people has done well, and whoever uses it for the prohibited or to waste rights has done wrong.\n\nAmong its limits: keeping trust, truthful transmission, not attributing statements to God or to people without verification, not spreading what harms, respecting privacy, and seeking fairness in narration and evaluation.\n\nWhat artificial intelligence produces is not accepted except after review and verification, for tools are not questioned before the one who used them; responsibility falls on the user, not the tool.',
    },
  },
  {
    sub: 'ahkam',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'ahkam-hadith-intro',
    ar: {
      title: 'الأحكام الشرعية من الحديث: مدخل',
      summary: 'كيف نستخرج الحكم الفقهي من النصّ النبوي؟',
      body: 'أحاديث الأحكام هي النصوص النبوية التي تُبنى عليها مسائل الحلال والحرام؛ وهي ثروةٌ فقهية عظيمة جمعها العلماء في مصنفات كـ«الأحكام» لأبي محمد بن حزم، و«منتقى الأخبار» لابن تيمية، و«بلوغ المرام» لابن حجر.\n\nودراسة الأحكام تمرّ بأربع خطوات: ثبوت الحديث (صحة السند)، ثم تحرير دلالته من حيث الأمر والنهي والعموم والخصوص، ثم معرفة الناسخ والمنسوخ، ثم استخراج الحكم وتنزيله على الواقعة.\n\nوكثيرٌ من الخلاف الفقهي عائدٌ إلى ظنّ الثبوت أو دلالة اللفظ، فينبغي أن يجمع طالب العلم بين صناعة المحدّث وفقه الفقيه؛ فذلك أصلٌ في استنباط الأحكام من السنة.',
    },
    en: {
      title: 'Legal Rulings from Hadith: An Introduction',
      summary: 'How is a legal ruling derived from a Prophetic text?',
      body: 'Hadiths of rulings are the Prophetic texts on which matters of lawful and unlawful are built; they are a great juristic treasure gathered by scholars in works such as Ibn Hazm\u0027s "al-Ahkam," Ibn Taymiyyah\u0027s "Munhaj al-Akhbar" (al-Muntaqa), and Ibn Hajar\u0027s "Bulugh al-Maram."\n\nStudying rulings passes through four steps: establishing the hadith (soundness of chain), then clarifying its indication in terms of command, prohibition, generality, and particularity, then knowing the abrogating and the abrogated, then deriving the ruling and applying it to the case.\n\nMuch juristic disagreement goes back to the presumption of authenticity or of the wording\u0027s indication, so the student should combine the craft of the hadith scholar with the understanding of the jurist; that is a foundation for deriving rulings from the Sunnah.',
    },
  },
  {
    sub: 'adhkar',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'adhkar-types',
    ar: {
      title: 'أقسام الأذكار وفضلها',
      summary: 'أنواع الذكر المشروع، وما يُشترط لقبوله.',
      body: 'الذكر المشروع أنواع: ذكرٌ مطلق وهو ما لا يقترن بزمان أو حال، وذكرٌ مقيّد كأذكار الصلوات والأذان وأدبار الصلاة وعند النوم والاستيقاظ والسفر؛ وكلّها ثابت بالسنّة.\n\nوأرفع الذكر كلمة التوحيد «لا إله إلا الله»، ويليها الحمد والتهليل والتسبيح، وأحبّ الكلام إلى الله أربعٌ: سبحان الله والحمد لله ولا إله إلا الله والله أكبر.\n\nويُشترط في الذكر: الإخلاص، وموافقة السنة في العدد والهيئة، وترك ما ابتدعه الناس من الأذكار التي لم تُنقل وفيها تكلّف؛ فالأذكار توقيفيةٌ تُتلقّى من النصّ لا من الذوق.',
    },
    en: {
      title: 'Categories of Remembrance and Their Virtue',
      summary: 'The kinds of legitimate remembrance and the conditions for its acceptance.',
      body: 'Legitimate remembrance has kinds: unrestricted remembrance, which is not tied to a time or state, and restricted remembrance such as those of prayers, the call to prayer, the moments after prayer, on sleeping and waking, and during travel, all established in the Sunnah.\n\nThe most excellent remembrance is the word of monotheism, "there is no deity but God," followed by praise, and the declaration and glorification. The dearest words to God are four: glory be to God, praise be to God, there is no deity but God, and God is greatest.\n\nThe conditions of remembrance are sincerity, conformity with the Sunnah in number and form, and abandoning what people have invented without transmission and with affectation; remembrance is fixed by revelation, received from the text, not from taste.',
    },
  },
  {
    sub: 'daily-adhkar',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'daily-adhkar-morning-evening',
    ar: {
      title: 'أذكار الصباح والمساء: أهميتها وآدابها',
      summary: 'حصن المؤمن اليومي: متى تُقال، وما شروطها؟',
      body: 'أذكار الصباح تُقال بعد الفجر إلى طلوع الشمس، وأذكار المساء بعد العصر إلى المغرب على قول جمهور أهل العلم؛ والمقصود تحصين المؤمن وإقامة صلته بالله في طرفي النهار، كما في قوله: «واذكر ربك في نفسك تضرّعًا وخيفة».\n\nوفيها من المعاني ما يجعلها مدرسةً إيمانية: التوكل والتفويض، والاعتراف بالعجز والقوّة لله، والاستعاذة من الشيطان والشرور، والثناء على الله بما هو أهله.\n\nويُنصح بالإتيان بها على وجهها: بالأعداد الواردة، وبحضور القلب وتفكّر المعنى، وبعدم الاستعجال، والدوام عليها ولو قلّت؛ فأحبّ العمل إلى الله أدومه وإن قل.',
    },
    en: {
      title: 'Morning and Evening Remembrance: Importance and Etiquette',
      summary: 'The believer\u0027s daily fortress: when is it said, and what are its conditions?',
      body: 'Morning remembrance is said after the dawn prayer until sunrise, and evening remembrance after the afternoon prayer until sunset according to the majority; the purpose is fortifying the believer and establishing his connection with God at the two ends of the day, as in "remember your Lord within yourself in humility and fear."\n\nWithin it are meanings that make it a school of faith: reliance and entrusting, acknowledging one\u0027s weakness and that strength belongs to God, seeking refuge from Satan and evils, and praising God as befits Him.\n\nIt is advised to perform it properly: with the transmitted numbers, with presence of heart and reflection on meaning, without haste, and persistently even if little; for the deed most loved by God is the most constant, even if small.',
    },
  },
  {
    sub: 'dialogue',
    kind: 'subbranch',
    type: 'lesson',
    slug: 'dialogue-rules',
    ar: {
      title: 'ضوابط الحوار مع المخالف',
      summary: 'كيف نخالف الرأي دون أن نخسر الأخلاق والمنهج؟',
      body: 'الحوار الشرعي يقوم على ثلاثة: العلم، والعدل، والرفق. فالعلم يمنع الجهل، والعدل يمنع التعسّف، والرفق يفتح القلوب؛ وقد قال تعالى: «وجادلهم بالتي هي أحسن»، وقال: «ولا تجادلوا أهل الكتاب إلا بالتي هي أحسن».\n\nومن ضوابطه: تحديد محلّ النزاع، وعدم الانتقال من قضية إلى أخرى بغير تمام، والاعتراف بما عند المخالف من صواب، وعدم إلزامه بلوازم لا يلتزمها، والتأدّب في اللفظ والخطاب.\n\nويُحدّد هدف الحوار: طلب الحق وإرادة هداية المخالف، لا الغلبة ولا إفحام الخصم؛ فإن كان الغرض الانتصار اجتُلب الباطل ونُصر، وإن كان الغرض الحق نُفع الله به من شاء.',
    },
    en: {
      title: 'Rules of Dialogue with Those Who Differ',
      summary: 'How do we disagree on opinion without losing ethics or method?',
      body: 'Legitimate dialogue rests on three things: knowledge, fairness, and gentleness. Knowledge prevents ignorance, fairness prevents arbitrariness, and gentleness opens hearts; He said: "argue with them in the best manner," and "do not argue with the People of the Book except in the best manner."\n\nAmong its rules: delimiting the point of dispute, not jumping from one issue to another before finishing, acknowledging what is right in the other\u0027s position, not compelling consequences he does not accept, and observing civility in wording and address.\n\nThe goal must be set: seeking truth and desiring the other\u0027s guidance, not victory or silencing an opponent; if the aim is victory, falsehood is brought in and supported, and if the aim is truth, God benefits by it whom He wills.',
    },
  },
];
