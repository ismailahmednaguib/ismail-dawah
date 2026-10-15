// scripts/seed-library.mjs
// ============================================================================
// مكتبة محتوى موسّعة للمنصة: فتاوى، مقالات، خطب، شبهات، أخبار، مشاريع،
// أماكن، أحاديث، دروس — بالعربية والإنجليزية — مع ربطها بالتصنيفات.
//
// غير مُتلِف (idempotent) — كل عنصر له معرّف ثابت مبني على slug ثابت.
//
//   node scripts/seed-library.mjs            # معاينة
//   node scripts/seed-library.mjs --commit   # تنفيذ
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function loadEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const root = path.resolve(process.cwd());
const env = { ...loadEnv(path.join(root, '.env.local')), ...loadEnv(path.join(root, '.env')), ...process.env };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const COMMIT = process.argv.includes('--commit');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('✖ تحتاج NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const H = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

function detUuid(seed) {
  const h = crypto.createHash('sha1').update(seed).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function slugify(value) {
  const base = String(value)
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return base || 'item';
}

async function upsert(table, rows, onConflict, returning = false) {
  if (!COMMIT || rows.length === 0) return [];
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: { ...H, Prefer: `resolution=merge-duplicates,return=${returning ? 'representation' : 'minimal'}` },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`${table} failed: ${res.status} ${await res.text()}`);
  return returning ? await res.json() : [];
}

// ============================================================
// تصنيفات إضافية + نسخ إنجليزية لمجالات المنصة
// ============================================================

const FIELD_EN = {
  aqeedah: 'Creed (Aqeedah)',
  fiqh: 'Jurisprudence (Fiqh)',
  usul: 'Principles of Jurisprudence',
  hadith: 'Hadith Sciences',
  tafsir: 'Exegesis (Tafsir)',
  'quran-sciences': 'Quranic Sciences',
  seerah: 'Prophetic Biography',
  history: 'Islamic History',
  comparative: 'Comparative Religion',
  akhlaq: 'Ethics & Spirituality',
  dawah: 'Dawah & Advocacy',
  arabic: 'Arabic Language',
  tajweed: 'Tajweed & Recitations',
  economics: 'Islamic Economics',
  faraaid: 'Inheritance (Faraid)',
  family: 'Family',
  youth: 'Youth',
};

const FIELD_ICON = {
  aqeedah: '🕌', fiqh: '⚖️', usul: '📜', hadith: '📿', tafsir: '📖',
  'quran-sciences': '🌟', seerah: '🌙', history: '🏛️', comparative: '⚔️',
  akhlaq: '💎', dawah: '📢', arabic: '✒️', tajweed: '🎙️', economics: '💰',
  faraaid: '🧮', family: '👨‍👩‍👧', youth: '🧑',
};

// ============================================================
// المحتوى
// ============================================================

const ITEMS = [
  // ---------------------------- فتاوى ----------------------------
  {
    type: 'fatwa', slug: 'fatwa-salah-jamaah', tax: ['fiqh', 'ibadat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'حكم صلاة الجماعة للرجال', body: 'صلاة الجماعة في المسجد مشروعة ومؤكدة للرجال القادرين، والجماعة خير من صلاة الفرد بسبع وعشرين درجة. والأحوط للمسلم ألا يتركها من غير عذر، لما فيها من اجتماع الكلمة وتعظيم الشعائر. ومن كان مريضًا أو مسافرًا أو بعيدًا عن المسجد فله عذر مشروع.' },
    en: { title: 'The Ruling on Congregational Prayer for Men', body: 'Congregational prayer in the mosque is prescribed and emphasised for able men; praying in congregation is better than praying alone by twenty-seven degrees. The safest course for a Muslim is not to abandon it without a valid excuse, for it unites the community and honours the rites of Allah. The sick, the traveller, and one far from the mosque have a valid excuse.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-ruku-forgotten', tax: ['fiqh', 'ibadat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'من نسي الركوع في الصلاة', body: 'إذا تذكّر المصلي أنه ترك الركوع قبل السجود رجع فركع ثم سجد، وإن تذكّره بعد أن سجد فالأحوط أن يعيد الركعة؛ لأن الركوع ركن لا يسقط بالنسيان، ويُجبر الخلل بسجود السهو عند الترتيب الصحيح.' },
    en: { title: 'One Who Forgets the Bowing (Ruku) in Prayer', body: 'If the worshipper remembers that he omitted the bowing before prostrating, he returns and bows, then prostrates. If he remembers only after prostrating, the safest course is to repeat the unit, because bowing is a pillar that is not waived by forgetfulness; the defect is compensated by the prostration of forgetfulness where the order is otherwise sound.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-fasting-travel', tax: ['fiqh', 'ibadat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'الفطر في السفر في رمضان', body: 'يجوز للمسافر الفطر في رمضان ثم يقضي عدد الأيام التي أفطرها، لقوله تعالى: «فمن كان منكم مريضًا أو على سفر فعدّة من أيام أخر». والأفضل أن يصوم إن لم يشق عليه.' },
    en: { title: 'Breaking the Fast While Travelling in Ramadan', body: 'A traveller may break the fast in Ramadan and then make up the same number of days, as Allah says: "Whoever is ill or on a journey — then an equal number of other days." It is better to fast if it causes him no hardship.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-fasting-forgetful', tax: ['fiqh', 'ibadat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'من أكل ناسيًا في نهار رمضان', body: 'لا يفطر، بل يتم صومه؛ لقول النبي ﷺ: «من نسي وهو صائم فأكل أو شرب فليتم صومه، فإنما أطعمه الله وسقاه».' },
    en: { title: 'One Who Eats Forgetfully During the Day of Ramadan', body: 'His fast is not invalidated; he should complete it, for the Prophet ﷺ said: "Whoever forgets while fasting and eats or drinks, let him complete his fast, for it is Allah who fed him and gave him drink."' },
  },
  {
    type: 'fatwa', slug: 'fatwa-zakat-cash', tax: ['fiqh', 'muamalat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'زكاة الأموال النقدية', body: 'تُزكّى النقود إذا بلغت النصاب وحال عليها الحول، والنصاب ما يعادل 85 جرامًا من الذهب تقريبًا، والواجب ربع العشر (2.5%). ويُضاف إليها عروض التجارة، ولا تُزكّى الأصول الشخصية غير المعدة للتجارة.' },
    en: { title: 'Zakat on Cash and Money', body: 'Cash is subject to zakat once it reaches the minimum threshold (nisab) and a full lunar year passes over it. The threshold is roughly the value of 85 grams of gold, and the due amount is one-fortieth (2.5%). Trade goods are added to it, while personal assets not held for trade are not subject to zakat.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-umrah-before-hajj', tax: ['fiqh', 'ibadat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'العمرة قبل الحج', body: 'يجوز أداء العمرة قبل الحج، وهو مشروع في نسك التمتع حيث يعتمر الحاج ثم يحج. والأهم تعلّم أحكام النسك وأداء أركانه وواجباته على الوجه الصحيح.' },
    en: { title: 'Performing Umrah Before Hajj', body: 'It is permissible to perform Umrah before Hajj; this is legislated in the Tamattu form, where the pilgrim performs Umrah and then Hajj. The important thing is to learn the rites and fulfil their pillars and obligations correctly.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-divorce-kinaya', tax: ['fiqh', 'muamalat'], audience: ['muslim_general'], level: 'intermediate',
    ar: { title: 'الطلاق بالكناية', body: 'الكناية في الطلاق تحتاج إلى نية؛ فإن قال الزوج كلامًا محتملًا لم يقع الطلاق إلا بنيّته. أما التصريح فيقع به الطلاق. ومسائل الطلاق دقيقة فيُرجى الرجوع فيها إلى عالم ثقة.' },
    en: { title: 'Divorce by Indirect Words (Kinaya)', body: 'Indirect expressions of divorce require intention; if the husband uses ambiguous words, divorce does not occur without the intent to divorce. Explicit expressions, however, effect divorce. Divorce matters are delicate, so one should consult a trusted scholar.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-bank-interest', tax: ['fiqh', 'muamalat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'حكم الفوائد البنكية', body: 'الفائدة الربوية حرام؛ لأنها من أكل أموال الناس بالباطل، وقد جاء الوعيد الشديد في الربا. والبدائل المشروعة كثيرة كالمرابحة والمشاركة والمضاربة بشرط ضبط العقود.' },
    en: { title: 'The Ruling on Bank Interest', body: 'Interest-based profit is forbidden, for it is consuming people\u2019s wealth unjustly, and the Quran and Sunnah contain severe warnings against usury. Lawful alternatives are numerous, such as Murabaha, Musharakah, and Mudarabah, provided the contracts are sound.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-women-travel', tax: ['fiqh', 'muamalat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'سفر المرأة بدون محرم', body: 'سفر المرأة دون محرم محلّ تفصيل عند أهل العلم، والمنع أرجح عند الجمهور للحديث: «لا تسافر امرأة إلا مع محرم»، ويرى بعض المحققين جوازه عند أمن الفتنة في السفر الواجب أو المضطر إليه. والمرجع في النوازل لأهل الفتوى.' },
    en: { title: 'A Woman Travelling Without a Mahram', body: 'A woman\u2019s travel without a mahram is a matter of detail among scholars. The majority lean towards prohibition based on the hadith: "A woman should not travel except with a mahram." Some scholars allow it when safety is assured for an obligatory or necessary journey. Such cases should be referred to qualified scholars.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-ruqyah-ruling', tax: ['fiqh', 'ibadat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'حكم الرقية الشرعية', body: 'الرقية الشرعية جائزة إذا كانت بكلام الله أو بأسمائه وصفاته أو بالدعاء المأثور، وباللسان العربي المفهوم، ومع اعتقاد أن النافع هو الله وحده.' },
    en: { title: 'The Ruling on Islamic Ruqyah', body: 'Islamic ruqyah is permissible when it uses the words of Allah, His names and attributes, or established supplications, in clear Arabic, with the belief that only Allah brings benefit.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-tasbih-bidah', tax: ['fiqh', 'ibadat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'استخدام المسبحة في الذكر', body: 'الذكر باليد من السنة، واستخدام المسبحة وسيلة معينة لا حرج فيه عند الجمهور، والأولى عدم الانشغال بالوسيلة عن المقصود من حضور القلب.' },
    en: { title: 'Using Prayer Beads (Tasbih) for Dhikr', body: 'Remembering Allah with the fingers is from the Sunnah. Using prayer beads as an aid is permissible according to the majority, though it is preferable not to let the means distract from the goal of a present heart.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-zakat-al-fitr', tax: ['fiqh', 'ibadat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'زكاة الفطر: مقدارها ووقتها', body: 'زكاة الفطر صاع من طعام عن كل فرد، تُخرج قبل صلاة العيد، ويجوز إخراجها قبل العيد بيوم أو يومين. ومن أخرجها بعد الصلاة فهي صدقة من الصدقات.' },
    en: { title: 'Zakat al-Fitr: Amount and Time', body: 'Zakat al-Fitr is one sa\u2019 of food for each person, given before the Eid prayer; giving it a day or two before Eid is permissible. Whoever gives it after the prayer, it is merely an ordinary charity.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-witr-time', tax: ['fiqh', 'ibadat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'وقت صلاة الوتر', body: 'وقت الوتر من بعد صلاة العشاء إلى طلوع الفجر، وآخره أفضل لمن كان له تهجّد، ومن خاف ألا يقوم آخره أوتر قبل أن ينام.' },
    en: { title: 'The Time of Witr Prayer', body: 'The time for Witr extends from after the Isha prayer until dawn. The last part of the night is better for one who will pray tahajjud, while one who fears he will not wake may pray Witr before sleeping.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-sunnah-rawatib', tax: ['fiqh', 'ibadat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'السنن الرواتب المؤكدة', body: 'السنن الرواتب اثنتا عشرة ركعة: أربع قبل الظهر واثنتان بعده، واثنتان بعد المغرب، واثنتان بعد العشاء، واثنتان قبل الفجر، وصلاة الفجر آكدها.' },
    en: { title: 'The Confirmed Regular Sunnah Prayers', body: 'The regular Sunnah prayers are twelve units: four before Dhuhr and two after it, two after Maghrib, two after Isha, and two before Fajr \u2014 with the two before Fajr being the most emphasised.' },
  },
  {
    type: 'fatwa', slug: 'fatwa-sadaqah-online', tax: ['fiqh', 'muamalat'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'الصدقة عبر الإنترنت', body: 'الصدقة بالتحويل الإلكتروني جائزة، ويُفضّل التأكد من وصولها لمستحقيها، ومن تسليمها لجهة موثوقة لضمان توزيعها.' },
    en: { title: 'Charity Given Online', body: 'Charity via electronic transfer is permissible. It is preferable to ensure it reaches those entitled to it, and to entrust it to a reliable organisation to guarantee its distribution.' },
  },

  // ---------------------------- مقالات ----------------------------
  {
    type: 'article', slug: 'article-taweed-basirah', tax: ['dawah'], audience: ['muslim_general', 'daee'], level: 'beginner',
    ar: { title: 'الدعوة على بصيرة: منهج الأنبياء', body: 'الدعوة إلى الله لا تكون بالحماسة وحدها، بل على بصيرة وعلم. قال تعالى: «قل هذه سبيلي أدعو إلى الله على بصيرة أنا ومن اتبعني». فالعلم أصل الدعوة، والرفق زينتها، والحكمة طريقها، والصبر عدّتها.' },
    en: { title: 'Calling to Allah with Insight: The Way of the Prophets', body: 'Calling to Allah is not a matter of zeal alone, but of insight and knowledge. Allah says: "Say: This is my way; I invite to Allah with insight, I and those who follow me." Knowledge is the foundation of dawah, gentleness its adornment, wisdom its path, and patience its provision.' },
  },
  {
    type: 'article', slug: 'article-tazkiyah-heart', tax: ['akhlaq'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'تزكية القلب: كيف نبدأ؟', body: 'تزكية النفس تبدأ بمعرفة الله، ثم بمحاسبة النفس، ثم بمصاحبة الصالحين. وخير ما يُصلح القلب: القرآن بتدبر، والذكر، وترك الذنوب، والإحسان إلى الخلق.' },
    en: { title: 'Purifying the Heart: Where to Begin?', body: 'Purifying the self begins with knowing Allah, then holding oneself to account, then keeping good company. The best things that mend the heart are reciting the Quran with reflection, remembrance of Allah, abandoning sins, and doing good to others.' },
  },
  {
    type: 'article', slug: 'article-seerah-lessons', tax: ['seerah'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'دروس من السيرة النبوية في الصبر', body: 'من أعظم دروس السيرة أن الداعية يلقى الأذى ويصبر، فقد أوذي النبي ﷺ في مكة فصبر، حتى فتح الله له. فالصبر مفتاح الفرج، والعاقبة للتقوى.' },
    en: { title: 'Lessons of Patience from the Prophet\u2019s Biography', body: 'Among the greatest lessons of the seerah is that the caller to Allah endures harm with patience. The Prophet ﷺ was harmed in Makkah yet remained patient until Allah granted him victory. Patience is the key to relief, and the good end belongs to the God-conscious.' },
  },
  {
    type: 'article', slug: 'article-quran-daily', tax: ['tafsir'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'كيف نجعل القرآن في يومنا؟', body: 'اجعل للقرآن وردًا يوميًا ثابتًا ولو صفحة، وتدبّر آية واحدة، واستمع لتلاوة، واحفظ ما تيسّر. فالقليل الدائم خير من الكثير المنقطع.' },
    en: { title: 'How Do We Bring the Quran into Our Day?', body: 'Set a fixed daily portion for the Quran, even a page; reflect on one verse; listen to a recitation; and memorise what you can. A little that is consistent is better than much that is intermittent.' },
  },
  {
    type: 'article', slug: 'article-time-value', tax: ['akhlaq'], audience: ['muslim_general', 'student'], level: 'beginner',
    ar: { title: 'قيمة الوقت في حياة المسلم', body: 'الوقت هو الحياة، وقد أقسم الله بالعصر والضحى. فمن ضيّع وقته ندم، ومن اغتنمه فقد أدرك رأس ماله. نظّم يومك: عبادة، وتعليم، وعمل، وراحة.' },
    en: { title: 'The Value of Time in a Muslim\u2019s Life', body: 'Time is life itself, and Allah swore by the Asr and the Duha. Whoever wastes his time will regret it, and whoever seizes it has grasped his capital. Organise your day into worship, learning, work, and rest.' },
  },
  {
    type: 'article', slug: 'article-family-mercy', tax: ['family'], audience: ['muslim_general', 'parent'], level: 'beginner',
    ar: { title: 'بناء الأسرة على الرحمة', body: 'الأسرة المسلمة تُبنى على المودة والرحمة، قال تعالى: «وجعل بينكم مودة ورحمة». ومن أعظم ما يثبّت البيت: الصدق، والعفو، وحسن العشرة، وتعاون الزوجين.' },
    en: { title: 'Building the Family on Mercy', body: 'A Muslim family is built on love and mercy. Allah says: "And He placed between you affection and mercy." Among the greatest things that steady a home are honesty, forgiveness, kind companionship, and cooperation between spouses.' },
  },
  {
    type: 'article', slug: 'article-youth-identity', tax: ['youth'], audience: ['student'], level: 'beginner',
    ar: { title: 'الشباب والهوية الإسلامية', body: 'أمام الشباب اليوم تحديات عصرية، والحل في بناء الهوية على العلم والعمل والاعتزاز بالدين. فالشاب المسلم يعبد الله، ويطلب العلم، ويخدم أمته، ويحسن صحبة أقرانه.' },
    en: { title: 'Youth and Islamic Identity', body: 'Today\u2019s youth face modern challenges, and the remedy is to build identity on knowledge, action, and pride in the religion. The Muslim youth worships Allah, seeks knowledge, serves his community, and keeps good company.' },
  },
  {
    type: 'article', slug: 'article-arabic-learner', tax: ['arabic'], audience: ['student'], level: 'intermediate',
    ar: { title: 'أهمية اللغة العربية لطالب العلم', body: 'العربية مفتاح فهم القرآن والسنة، فمن أراد العلم الشرعي فليتعلّم العربية: صرفًا ونحوًا وبلاغة. وبالتمكّن منها يفتح الله لطالب العلم أبوابًا من الفهم.' },
    en: { title: 'The Importance of Arabic for the Seekers of Knowledge', body: 'Arabic is the key to understanding the Quran and Sunnah. Whoever desires Islamic knowledge should learn Arabic \u2014 morphology, grammar, and rhetoric. Mastery of it opens doors of understanding for the seeker.' },
  },
  {
    type: 'article', slug: 'article-hadith-auth', tax: ['hadith'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'التحقق من الأحاديث قبل نشرها', body: 'ليس كل ما يُنشر من الأحاديث صحيحًا. والمطلوب من المسلم التثبت، والرجوع إلى كتب الحديث المعتمدة، وسؤال أهل العلم، قال تعالى: «إن جاءكم فاسق بنبأ فتبينوا».' },
    en: { title: 'Verifying Hadith Before Sharing Them', body: 'Not everything circulated as hadith is authentic. A Muslim must verify, refer to the recognised books of hadith, and ask the people of knowledge. Allah says: "If a mischief-maker brings you news, verify it."' },
  },
  {
    type: 'article', slug: 'article-dawah-soft', tax: ['dawah'], audience: ['daee'], level: 'intermediate',
    ar: { title: 'لماذا كان الرفق أبلغ في الدعوة؟', body: 'الرفق يفتح القلوب المغلقة، والشدّة تنفّر. قال ﷺ: «إن الله رفيق يحب الرفق في الأمر كله». فالداعية يجمع بين بيان الحق وبذل الرفق.' },
    en: { title: 'Why Gentleness Is More Effective in Dawah', body: 'Gentleness opens closed hearts while harshness repels. The Prophet ﷺ said: "Indeed Allah is gentle and loves gentleness in all matters." The caller combines clarity of truth with gentle conduct.' },
  },

  // ---------------------------- خطب ----------------------------
  {
    type: 'khutbah', slug: 'khutbah-taqwa', tax: ['dawah'], audience: ['muslim_general', 'daee'], level: 'beginner',
    ar: { title: 'خطبة: تقوى الله أساس الفلاح', body: 'الحمد لله، والصلاة والسلام على رسول الله. أوصيكم ونفسي بتقوى الله؛ فإن التقوى رأس الأمر وأصله. قال تعالى: «وتزوّدوا فإن خير الزاد التقوى». فاتقوا الله في السر والعلن، وراقبوه في كل شؤونكم، واستقيموا على أمره.' },
    en: { title: 'Khutbah: God-Consciousness Is the Foundation of Success', body: 'All praise is due to Allah, and peace and blessings be upon His Messenger. I advise you and myself to fear Allah, for God-consciousness is the head of the matter and its root. Allah says: "And take provision, for the best provision is God-consciousness." So be mindful of Allah in private and in public, and remain steadfast upon His command.' },
  },
  {
    type: 'khutbah', slug: 'khutbah-ramadan', tax: ['dawah'], audience: ['muslim_general', 'daee'], level: 'beginner',
    ar: { title: 'خطبة: استقبال شهر رمضان', body: 'أيها المسلمون، أظلّكم شهر عظيم، شهر الرحمة والقرآن. فاستقبلوه بالتوبة، والعزم على الصيام والقيام، وترك المعاصي، والإحسان. وليكن شعارنا: اللهم بلّغنا رمضان واجعلنا فيه من المقبولين.' },
    en: { title: 'Khutbah: Welcoming the Month of Ramadan', body: 'O Muslims, a great month has cast its shade over you \u2014 the month of mercy and the Quran. Welcome it with repentance, resolve to fast and pray at night, abandon sins, and do good. Let our motto be: O Allah, let us reach Ramadan and make us among those accepted.' },
  },
  {
    type: 'khutbah', slug: 'khutbah-unity', tax: ['dawah'], audience: ['muslim_general', 'daee'], level: 'beginner',
    ar: { title: 'خطبة: وحدة الصف واجتماع الكلمة', body: 'إن المسلمين إخوة، ووحدتهم قوة. قال تعالى: «واعتصموا بحبل الله جميعًا ولا تفرقوا». فاحرصوا على الألفة، وتجنّبوا الفرقة، وتعاونوا على البر والتقوى.' },
    en: { title: 'Khutbah: Unity of the Ranks and Harmony of Word', body: 'Muslims are brothers, and their unity is strength. Allah says: "Hold fast to the rope of Allah, all of you, and do not divide." Seek harmony, avoid division, and cooperate in righteousness and piety.' },
  },
  {
    type: 'khutbah', slug: 'khutbah-parents', tax: ['dawah'], audience: ['muslim_general', 'daee'], level: 'beginner',
    ar: { title: 'خطبة: بر الوالدين', body: 'بر الوالدين من أعظم القربات، وقد قرن الله طاعتهما بعبادته. فبِرّوا آباءكم وأمهاتكم، وأحسنوا إليهم في كبرهم، وادعوا لهم، فذلك من صلة الرحم.' },
    en: { title: 'Khutbah: Kindness to Parents', body: 'Kindness to parents is among the greatest acts of nearness to Allah; He joined obedience to them with His own worship. Be dutiful to your fathers and mothers, treat them well in their old age, supplicate for them \u2014 that is part of maintaining kinship.' },
  },
  {
    type: 'khutbah', slug: 'khutbah-sadaqah', tax: ['dawah'], audience: ['muslim_general', 'daee'], level: 'beginner',
    ar: { title: 'خطبة: فضل الصدقة', body: 'الصدقة تطفئ الخطايا كما يطفئ الماء النار، وهي برهان على إيمان صاحبها. قال ﷺ: «ما نقص مال من صدقة». فتصدّقوا ولو بالقليل، فالله يضاعف لمن يشاء.' },
    en: { title: 'Khutbah: The Virtue of Charity', body: 'Charity extinguishes sins as water extinguishes fire, and it is proof of the giver\u2019s faith. The Prophet ﷺ said: "Charity does not decrease wealth." Give, even a little, for Allah multiplies for whom He wills.' },
  },
  {
    type: 'khutbah', slug: 'khutbah-akhlaq', tax: ['dawah'], audience: ['muslim_general', 'daee'], level: 'beginner',
    ar: { title: 'خطبة: حسن الخلق', body: 'حسن الخلق أثقل ما يوضع في الميزان، وقد كان النبي ﷺ أحسن الناس خلقًا. فليحسن كل منا خلقه مع أهله وجاره وزملائه، فالدين معاملة قبل أن يكون كلامًا.' },
    en: { title: 'Khutbah: Good Character', body: 'Good character is the heaviest thing placed on the scales, and the Prophet ﷺ was the best of people in character. Let each of us refine his character with family, neighbours, and colleagues, for religion is conduct before it is words.' },
  },

  // ---------------------------- شبهات / ردود ----------------------------
  {
    type: 'faq', slug: 'faq-suffering', tax: ['responses', 'atheism'], audience: ['non_muslim', 'muslim_general'], level: 'beginner',
    ar: { title: 'لماذا يسمح الله بالمعاناة؟', body: 'الدنيا دار ابتلاء لا دار جزاء، والمعاناة تربية وتمحيص. قال تعالى: «ونبلوكم بالشر والخير فتنة». والابتلاء يرفع الدرجات ويكفّر السيئات، والفصل يوم القيامة بالعدل والرحمة.' },
    en: { title: 'Why Does Allah Allow Suffering?', body: 'This world is a place of trial, not of final recompense; suffering is a means of refinement and testing. Allah says: "We test you with evil and with good as a trial." Trial raises ranks and expiates sins, and the final judgement on the Day of Resurrection is with justice and mercy.' },
  },
  {
    type: 'faq', slug: 'faq-quran-preserved', tax: ['responses', 'missionary'], audience: ['non_muslim'], level: 'beginner',
    ar: { title: 'هل القرآن محرَّف؟', body: 'القرآن محفوظ بحفظ الله، قال تعالى: «إنا نحن نزلنا الذكر وإنا له لحافظون». ونقل القرآن بالتواتر القطعي جيلًا بعد جيل، مع وجود نسخ خطية قديمة تطابق النص الحالي.' },
    en: { title: 'Has the Quran Been Altered?', body: 'The Quran is preserved by Allah\u2019s protection: "Indeed, it is We who sent down the Reminder, and indeed, We will be its guardian." It was transmitted by uninterrupted mass transmission generation after generation, and early manuscripts match the present text.' },
  },
  {
    type: 'faq', slug: 'faq-women-rights', tax: ['responses', 'women-responses'], audience: ['non_muslim', 'muslim_general'], level: 'beginner',
    ar: { title: 'هل الإسلام يظلم المرأة؟', body: 'الإسلام كرّم المرأة، وأعطاها حق التعليم والتملك والميراث والموافقة في الزواج. والاختلاف في بعض الأحكام مبني على التكامل لا التمييز، والعدل في الإسلام قائم على مصلحة الجميع.' },
    en: { title: 'Does Islam Oppress Women?', body: 'Islam honours women and grants them the right to education, ownership, inheritance, and consent in marriage. Differences in certain rulings are based on complementarity, not discrimination; justice in Islam is founded on the welfare of all.' },
  },
  {
    type: 'faq', slug: 'faq-evolution', tax: ['responses', 'secularism'], audience: ['student', 'non_muslim'], level: 'intermediate',
    ar: { title: 'موقف الإسلام من نظرية التطور', body: 'الإسلام يثبت أن آدم عليه السلام خُلق خلقًا مباشرًا بغير تطور، قال تعالى: «إن مثل عيسى عند الله كمثل آدم خلقه من تراب». والتفسير المادي الذي ينفي الخالق مرفوض، والبحث العلمي لا يناقض التوحيد.' },
    en: { title: 'Islam\u2019s Position on the Theory of Evolution', body: 'Islam affirms that Adam was created directly, without evolution: "Indeed, the example of Jesus with Allah is like that of Adam; He created him from dust." A materialistic reading that denies the Creator is rejected, while scientific inquiry does not contradict monotheism.' },
  },
  {
    type: 'faq', slug: 'faq-relativism', tax: ['responses', 'secularism'], audience: ['non_muslim', 'student'], level: 'intermediate',
    ar: { title: 'هل كل الأديان سواء؟', body: 'الإسلام يحترم أتباع الأديان ويحاورهم، لكنه يبيّن أن الحق في التوحيد. قال تعالى: «إن الدين عند الله الإسلام». فاحترام الناس لا يعني التسوية بين الحق والباطل.' },
    en: { title: 'Are All Religions Equal?', body: 'Islam respects the followers of other faiths and engages them in dialogue, yet it clarifies that the truth lies in monotheism: "Indeed, the religion in the sight of Allah is Islam." Respecting people does not mean equating truth with falsehood.' },
  },
  {
    type: 'faq', slug: 'faq-slavery', tax: ['responses', 'missionary'], audience: ['non_muslim'], level: 'intermediate',
    ar: { title: 'لماذا لم يُلغِ الإسلام الرق تجاهًا؟', body: 'الإسلام عالج الرق بالتدريج، فسدّ أبواب الاسترقاق إلا في حالات ضيقة، وفتح أبواب العتق والتكفير، وقرّر المساواة الإنسانية. فالمنهج الحكيم يراعي الواقع ويُصلحه تدريجيًا.' },
    en: { title: 'Why Did Islam Not Abolish Slavery at Once?', body: 'Islam addressed slavery gradually: it closed the avenues of enslavement except in narrow cases, opened wide the paths of manumission and expiation, and affirmed human equality. Wise reform takes account of reality and mends it step by step.' },
  },
  {
    type: 'faq', slug: 'faq-jihad', tax: ['responses', 'missionary'], audience: ['non_muslim'], level: 'intermediate',
    ar: { title: 'ما حقيقة الجهاد في الإسلام؟', body: 'الجهاد بمعناه الواسع بذل الجهد في طاعة الله ودعوة الخلق. والقتال مشروع للدفع وحماية الدعوة بضوابط صارمة، مع تحريم قتل غير المقاتلين. فالإسلام دين رحمة وعدل.' },
    en: { title: 'What Is the Reality of Jihad in Islam?', body: 'Jihad in its broad sense is exerting effort in obedience to Allah and calling people to Him. Fighting is legislated only for defence and protection of the call, under strict conditions, with the prohibition of killing non-combatants. Islam is a religion of mercy and justice.' },
  },
  {
    type: 'faq', slug: 'faq-polygamy', tax: ['responses', 'women-responses'], audience: ['non_muslim', 'muslim_general'], level: 'beginner',
    ar: { title: 'لماذا أُبيح تعدد الزوجات؟', body: 'التعدد مباح بشرط العدل والقدرة، وقد كان معمولًا قبل الإسلام بلا قيد، فقيّده الإسلام بأربع وبالعدل. وهو حلّ لبعض الحالات كتعدد الأرامل واليتامى، لا فريضة على كل أحد.' },
    en: { title: 'Why Is Polygamy Permitted?', body: 'Polygamy is permitted on the condition of fairness and capability. It existed before Islam without restriction, and Islam limited it to four and to justice. It is a solution to certain situations such as widows and orphans; it is not an obligation on everyone.' },
  },

  // ---------------------------- أخبار / فعاليات ----------------------------
  {
    type: 'event', slug: 'event-ramadan-course', tax: ['dawah'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'دورة رمضانية: فقه الصيام', body: 'ينطلق برنامج دورة «فقه الصيام» مع بداية شهر رمضان، وتشمل دروسًا في أحكام الصيام والقيام وفقه الاعتكاف، مع مساحة للأسئلة. الدعوة عامة للجميع.' },
    en: { title: 'Ramadan Course: The Fiqh of Fasting', body: 'The "Fiqh of Fasting" course begins with the start of Ramadan, with lessons on the rulings of fasting, night prayer, and the fiqh of spiritual retreat, alongside a question-and-answer session. Everyone is welcome.' },
  },
  {
    type: 'event', slug: 'event-quran-competition', tax: ['quran', 'hifz'], audience: ['muslim_general', 'student'], level: 'beginner',
    ar: { title: 'مسابقة حفظ القرآن الكريم', body: 'تُعلن المسابقة السنوية لحفظ القرآن الكريم بجوائز قيمة، وتشمل مستويات متعددة تناسب المبتدئين والمتقدمين. التسجيل مفتوح لأبناء المجتمع.' },
    en: { title: 'Quran Memorisation Competition', body: 'The annual Quran memorisation competition is announced with valuable prizes, featuring multiple levels suited to beginners and advanced participants. Registration is open to the community.' },
  },
  {
    type: 'event', slug: 'event-eid-prayer', tax: ['fiqh'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'ترتيبات صلاة العيد', body: 'يُعلن عن موعد ومكان صلاة عيد الفطر السعيد، مع التنظيم لاستقبال المصلين وتسهيل المواصلات. نسأل الله أن يتقبل منا ومنكم.' },
    en: { title: 'Arrangements for the Eid Prayer', body: 'The time and place of the Eid al-Fitr prayer are announced, with arrangements to welcome worshippers and facilitate transport. We ask Allah to accept from us and from you.' },
  },
  {
    type: 'event', slug: 'event-new-muslim-course', tax: ['non-muslim', 'convert-guide'], audience: ['non_muslim', 'muslim_new'], level: 'beginner',
    ar: { title: 'دورة تعريفية للمسلمين الجدد', body: 'دورة أسبوعية مجانية للمسلمين الجدد تشرح أركان الإسلام والإيمان، وكيفية الطهارة والصلاة، وتجيب عن الأسئلة برفق. الدعوة عامة.' },
    en: { title: 'Introductory Course for New Muslims', body: 'A free weekly course for new Muslims explaining the pillars of Islam and faith, how to purify oneself and pray, and answering questions gently. Everyone is welcome.' },
  },
  {
    type: 'event', slug: 'event-summer-school', tax: ['youth'], audience: ['parent'], level: 'beginner',
    ar: { title: 'المدرسة الصيفية للأطفال', body: 'تفتح المدرسة الصيفية أبوابها للأطفال لتعليم القرآن والأذكار والأخلاق في بيئة تربوية آمنة، مع أنشطة تفاعلية ومسابقات.' },
    en: { title: 'Summer School for Children', body: 'The summer school opens its doors to children to teach the Quran, remembrance, and good character in a safe educational environment, with interactive activities and competitions.' },
  },

  // ---------------------------- مشاريع ----------------------------
  {
    type: 'page', slug: 'project-mosque-maintenance', tax: ['projects'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'مشروع صيانة المساجد', body: 'يهدف المشروع إلى صيانة المساجد وتجهيزها بالفرش والمصاحف والمكيفات، وهي صدقة جارية يشترك فيها المتبرعون. ساهم بما تيسّر، فالدال على الخير كفاعله.' },
    en: { title: 'Mosque Maintenance Project', body: 'This project aims to maintain mosques and equip them with furnishings, copies of the Quran, and air conditioning \u2014 an ongoing charity shared by donors. Contribute what you can, for the one who guides to good is like the doer of it.' },
  },
  {
    type: 'page', slug: 'project-water-wells', tax: ['projects'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'مشروع حفر الآبار', body: 'يوفر المشروع مياهًا صالحة للشرب للمناطق المحتاجة عبر حفر الآبار، ويساهم في وقف الماء الذي هو من أفضل الصدقات الجارية.' },
    en: { title: 'Water Wells Project', body: 'The project provides clean drinking water for needy areas by digging wells, contributing to the endowment of water, which is among the best forms of ongoing charity.' },
  },
  {
    type: 'page', slug: 'project-orphan-sponsorship', tax: ['projects'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'مشروع كفالة الأيتام', body: 'يكفل المشروع الأيتام تعليميًا ومعيشيًا، ويؤمّن لهم بيئة مستقرة. وكفالة اليتيم من أعظم الأجور، وقد وعد النبي ﷺ لكافل اليتيم بالقرب منه في الجنة.' },
    en: { title: 'Orphan Sponsorship Project', body: 'The project sponsors orphans educationally and financially and secures a stable environment for them. Sponsoring an orphan carries great reward; the Prophet ﷺ promised the sponsor of an orphan nearness to him in Paradise.' },
  },
  {
    type: 'page', slug: 'project-free-books', tax: ['projects'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'مشروع طباعة الكتب وتوزيعها', body: 'يعمل المشروع على طباعة الكتب الشرعية النافعة وتوزيعها مجانًا، وبخاصة المصاحف والمختصرات العلمية، لتعميم العلم ونفع العامة.' },
    en: { title: 'Book Printing and Distribution Project', body: 'The project prints beneficial Islamic books and distributes them free of charge, especially copies of the Quran and concise scholarly works, to spread knowledge and benefit the public.' },
  },

  // ---------------------------- أماكن ----------------------------
  {
    type: 'page', slug: 'place-mosque-nour', tax: ['places'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'مسجد النور', body: 'تُقام في مسجد النور دروس أسبوعية في التفسير والفقه، وكذلك صلاة الجماعة والجمعة. المكان مفتوح للمصلين والدروس.' },
    en: { title: 'An-Nur Mosque', body: 'An-Nur Mosque hosts weekly lessons in tafsir and fiqh, along with congregational and Friday prayers. The place is open for worshippers and lessons.' },
  },
  {
    type: 'page', slug: 'place-mosque-grand', tax: ['places'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'المسجد الكبير', body: 'المسجد الكبير من أكبر مساجد المنطقة، وتُقام فيه الخطب والدروس والحلقات القرآنية، ويُعدّ مركزًا لاجتماع أهل العلم.' },
    en: { title: 'The Grand Mosque', body: 'The Grand Mosque is among the largest in the region. It hosts sermons, lessons, and Quranic circles, and serves as a hub for gatherings of seekers of knowledge.' },
  },
  {
    type: 'page', slug: 'place-islamic-center', tax: ['places'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'المركز الإسلامي', body: 'يقدّم المركز الإسلامي دورات ودورًا تعليمية للرجال والنساء، وفيه مكتبة ومكان مخصص للمسلمين الجدد.' },
    en: { title: 'The Islamic Centre', body: 'The Islamic Centre offers courses and study circles for men and women; it includes a library and a dedicated space for new Muslims.' },
  },
  {
    type: 'page', slug: 'place-community-hall', tax: ['places'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'قاعة المجتمع', body: 'تُستخدم قاعة المجتمع للفعاليات الدعوية والمحاضرات والحفلات والأنشطة التربوية، وتُجهّز بما يلزم لذلك.' },
    en: { title: 'Community Hall', body: 'The community hall is used for dawah events, lectures, ceremonies, and educational activities, and is equipped accordingly.' },
  },

  // ---------------------------- أحاديث ----------------------------
  {
    type: 'hadith', slug: 'hadith-intention', tax: ['hadith'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'حديث: «إنما الأعمال بالنيات»', body: 'عن عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله ﷺ يقول: «إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى».', source: 'متفق عليه' },
    en: { title: 'Hadith: "Actions Are But by Intentions"', body: 'On the authority of Umar ibn al-Khattab: I heard the Messenger of Allah ﷺ say: "Actions are but by intentions, and every person shall have what he intended."', source: 'Agreed upon' },
  },
  {
    type: 'hadith', slug: 'hadith-muslim-rights', tax: ['hadith'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'حديث: «المسلم من سلم المسلمون من لسانه ويده»', body: 'عن عبد الله بن عمرو رضي الله عنهما عن النبي ﷺ قال: «المسلم من سلم المسلمون من لسانه ويده».', source: 'صحيح البخاري' },
    en: { title: 'Hadith: "The Muslim Is One from Whose Tongue and Hand Muslims Are Safe"', body: 'On the authority of Abdullah ibn Amr, the Prophet ﷺ said: "The Muslim is the one from whose tongue and hand the Muslims are safe."', source: 'Sahih al-Bukhari' },
  },
  {
    type: 'hadith', slug: 'hadith-kindness-everything', tax: ['hadith'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'حديث: «إن الله كتب الإحسان على كل شيء»', body: 'عن شداد بن أوس رضي الله عنه قال: قال رسول الله ﷺ: «إن الله كتب الإحسان على كل شيء، فإذا قتلتم فأحسنوا القِتلة، وإذا ذبحتم فأحسنوا الذبح».', source: 'رواه مسلم' },
    en: { title: 'Hadith: "Allah Has Prescribed Excellence in All Things"', body: 'On the authority of Shaddad ibn Aws, the Messenger of Allah ﷺ said: "Allah has prescribed excellence in all things; so when you kill, kill well, and when you slaughter, slaughter well."', source: 'Muslim' },
  },
  {
    type: 'hadith', slug: 'hadith-best-of-you', tax: ['hadith'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'حديث: «خيركم من تعلّم القرآن وعلّمه»', body: 'عن عثمان رضي الله عنه عن النبي ﷺ قال: «خيركم من تعلّم القرآن وعلّمه».', source: 'صحيح البخاري' },
    en: { title: 'Hadith: "The Best of You Are Those Who Learn the Quran and Teach It"', body: 'On the authority of Uthman, the Prophet ﷺ said: "The best of you are those who learn the Quran and teach it."', source: 'Sahih al-Bukhari' },
  },
  {
    type: 'hadith', slug: 'hadith-smiling-charity', tax: ['hadith'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'حديث: «تبسمك في وجه أخيك صدقة»', body: 'عن أبي ذر رضي الله عنه قال: قال رسول الله ﷺ: «تبسمك في وجه أخيك لك صدقة».', source: 'رواه الترمذي' },
    en: { title: 'Hadith: "Your Smile in Your Brother\u2019s Face Is Charity"', body: 'On the authority of Abu Dharr, the Messenger of Allah ﷺ said: "Your smiling in your brother\u2019s face is charity for you."', source: 'Tirmidhi' },
  },
  {
    type: 'hadith', slug: 'hadith-cleanliness', tax: ['hadith'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'حديث: «الطهور شطر الإيمان»', body: 'عن أبي مالك الأشعري رضي الله عنه قال: قال رسول الله ﷺ: «الطهور شطر الإيمان، والحمد لله تملأ الميزان».', source: 'رواه مسلم' },
    en: { title: 'Hadith: "Purity Is Half of Faith"', body: 'On the authority of Abu Malik al-Ash\u2019ari, the Messenger of Allah ﷺ said: "Purity is half of faith, and al-hamdu lillah fills the scales."', source: 'Muslim' },
  },
  {
    type: 'hadith', slug: 'hadith-strong-believer', tax: ['hadith'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'حديث: «المؤمن القوي خير وأحب إلى الله»', body: 'عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ: «المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف، وفي كلٍّ خير».', source: 'رواه مسلم' },
    en: { title: 'Hadith: "The Strong Believer Is Better and More Beloved to Allah"', body: 'On the authority of Abu Hurayrah, the Messenger of Allah ﷺ said: "The strong believer is better and more beloved to Allah than the weak believer, though there is good in both."', source: 'Muslim' },
  },
  {
    type: 'hadith', slug: 'hadith-neighbours', tax: ['hadith'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'حديث: «ما زال جبريل يوصيني بالجار»', body: 'عن عائشة رضي الله عنها قالت: قال رسول الله ﷺ: «ما زال جبريل يوصيني بالجار حتى ظننت أنه سيورّثه».', source: 'متفق عليه' },
    en: { title: 'Hadith: "Jibril Kept Advising Me About the Neighbour"', body: 'On the authority of Aishah, the Messenger of Allah ﷺ said: "Jibril kept advising me about the neighbour until I thought he would make him an heir."', source: 'Agreed upon' },
  },

  // ---------------------------- دروس ----------------------------
  {
    type: 'lesson', slug: 'lesson-usul-rules', tax: ['fiqh', 'usul-fiqh'], audience: ['student'], level: 'advanced',
    ar: { title: 'القواعد الخمس الكبرى في الفقه', body: 'القواعد الكبرى خمس: الأمور بمقاصدها، واليقين لا يزول بالشك، والمشقة تجلب التيسير، والضرر يُزال، والعادة محكّمة. وهي مفتاح فهم كثير من الفروع الفقهية.' },
    en: { title: 'The Five Major Maxims of Fiqh', body: 'The five major maxims are: matters are judged by their purposes; certainty is not removed by doubt; hardship brings ease; harm is removed; and custom is authoritative. They are the key to understanding many fiqh branches.' },
  },
  {
    type: 'lesson', slug: 'lesson-hadith-sciences', tax: ['hadith'], audience: ['student'], level: 'intermediate',
    ar: { title: 'مقدمة في علم مصطلح الحديث', body: 'مصطلح الحديث علم يبحث في أحوال الراوي والمروي من حيث القبول والرد، وينظر في السند والمتن. وأشهر أنواعه: الصحيح، والحسن، والضعيف، والموضوع.' },
    en: { title: 'Introduction to Hadith Terminology', body: 'Hadith terminology is the science that studies the conditions of the narrator and the narrated text in terms of acceptance and rejection, examining both the chain and the text. Its most famous categories are: authentic, good, weak, and fabricated.' },
  },
  {
    type: 'lesson', slug: 'lesson-tajweed-basics', tax: ['quran', 'tajweed'], audience: ['student', 'muslim_general'], level: 'beginner',
    ar: { title: 'أساسيات التجويد: مخارج الحروف', body: 'التجويد هو إعطاء كل حرف حقه ومستحقه. ويبدأ بتعلّم مخارج الحروف وصفاتها، ثم أحكام النون والميم والمدود. والقصد تحسين التلاوة ومراعاة الوقف والابتداء.' },
    en: { title: 'Tajweed Basics: Articulation Points of Letters', body: 'Tajweed is giving every letter its right and due. It begins with learning the articulation points and attributes of letters, then the rules of nun and mim and the elongations. The aim is to beautify recitation and observe proper stopping and starting.' },
  },
  {
    type: 'lesson', slug: 'lesson-seerah-makkah', tax: ['seerah'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'العهد المكي: الدعوة السرية والجهرية', body: 'بدأت الدعوة سرية ثلاث سنوات، ثم جهر النبي ﷺ بالدعوة، فلقيت أذى، وصبر المسلمون، وهاجر بعضهم إلى الحبشة، حتى كانت بيعة العقبة والهجرة إلى المدينة.' },
    en: { title: 'The Makkan Period: Secret and Open Dawah', body: 'The call began secretly for three years, then the Prophet ﷺ proclaimed it openly. He met with harm, the Muslims were patient, some migrated to Abyssinia, until the pledge of Aqabah and the migration to Madinah.' },
  },
  {
    type: 'lesson', slug: 'lesson-akhlaq-heart', tax: ['tazkiyah', 'akhlaq'], audience: ['muslim_general'], level: 'beginner',
    ar: { title: 'أمراض القلوب وعلاجها', body: 'من أمراض القلوب: الكبر، والعجب، والحسد، والغفلة. وعلاجها بالعلم النافع، ومجاهدة النفس، والذكر، والدعاء، ومصاحبة الصالحين.' },
    en: { title: 'Diseases of the Heart and Their Cure', body: 'Among the diseases of the heart are arrogance, self-admiration, envy, and heedlessness. Their cure lies in beneficial knowledge, striving against the self, remembrance, supplication, and keeping righteous company.' },
  },
  {
    type: 'lesson', slug: 'lesson-fiqh-family', tax: ['fiqh', 'muamalat'], audience: ['muslim_general', 'parent'], level: 'intermediate',
    ar: { title: 'فقه الأسرة: الحقوق والواجبات', body: 'الزواج عقد تكافل وتراحم، ويقوم على حقوق متبادلة: النفقة والسكنى والمعاشرة بالمعروف، وحسن التربية للأولاد، والعدل بين الزوجات إن تعدّد. والمرجع في النزاعات لأهل العلم والقضاء.' },
    en: { title: 'Family Fiqh: Rights and Duties', body: 'Marriage is a contract of mutual support and mercy, founded on reciprocal rights: maintenance, housing, kind companionship, good upbringing of children, and fairness between wives if there is more than one. Disputes should be referred to scholars and the courts.' },
  },
];

// ============================================================
// التنفيذ
// ============================================================

async function main() {
  // 1) تصنيفات: kind='category' للمشاريع والأماكن، ونسخ إنجليزية للمجالات.
  const taxonomies = [];
  taxonomies.push({ id: detUuid('taxonomy:category:projects'), kind: 'category', lang: 'ar', name: 'المشاريع', slug: 'projects', icon: '🏗️', color: '#0e7490', sort_order: 1 });
  taxonomies.push({ id: detUuid('taxonomy:category:projects:en'), kind: 'category', lang: 'en', name: 'Projects', slug: 'projects', icon: '🏗️', color: '#0e7490', sort_order: 1 });
  taxonomies.push({ id: detUuid('taxonomy:category:places'), kind: 'category', lang: 'ar', name: 'الأماكن', slug: 'places', icon: '📍', color: '#c9a227', sort_order: 2 });
  taxonomies.push({ id: detUuid('taxonomy:category:places:en'), kind: 'category', lang: 'en', name: 'Places', slug: 'places', icon: '📍', color: '#c9a227', sort_order: 2 });

  // نسخ إنجليزية لمجالات المنصة (kind='field') بنفس الـ slug.
  Object.entries(FIELD_EN).forEach(([slug, name], i) => {
    taxonomies.push({ id: detUuid(`taxonomy:field:en:${slug}`), kind: 'field', lang: 'en', name, slug, icon: FIELD_ICON[slug] || null, color: null, sort_order: i });
  });

  // 2) المحتوى
  const contents = [];
  const translations = [];
  const terms = [];

  ITEMS.forEach((item, idx) => {
    const contentId = detUuid(`library:${item.slug}`);
    contents.push({
      id: contentId,
      content_type: item.type,
      status: 'published',
      lang_original: 'ar',
      audience: item.audience ?? ['muslim_general'],
      age_groups: ['all'],
      levels: [item.level ?? 'beginner'],
      madhhabs: ['general'],
      sort_order: idx,
      published_at: new Date(Date.now() - idx * 3600_000).toISOString(),
      views: 0,
      needs_scholar_review: false,
    });

    // التصنيفات (الفرع/الفرعي/الفئة) — نفس الـ slug عبر اللغات.
    for (const slug of item.tax ?? []) {
      const arId = detUuid(`taxonomy:category:${slug}`);
      // التصنيفات المسبقة موجودة بأنواع field/branch/subbranch/category؛ نربط بالعربية.
      terms.push({ content_id: contentId, taxonomy_id: null, __slug: slug });
    }

    // ترجمة عربية
    translations.push({
      content_id: contentId,
      lang: 'ar',
      slug: item.slug,
      title: item.ar.title,
      summary: item.ar.source ? `${item.ar.body} — ${item.ar.source}`.slice(0, 220) : item.ar.body.slice(0, 220),
      body: item.ar.source ? `${item.ar.body}\n\nالمصدر: ${item.ar.source}` : item.ar.body,
      body_plain: item.ar.body,
      is_machine_translated: false,
      is_reviewed: true,
    });

    // ترجمة إنجليزية إن توفرت
    if (item.en) {
      translations.push({
        content_id: contentId,
        lang: 'en',
        slug: item.slug,
        title: item.en.title,
        summary: item.en.source ? `${item.en.body} — ${item.en.source}`.slice(0, 220) : item.en.body.slice(0, 220),
        body: item.en.source ? `${item.en.body}\n\nSource: ${item.en.source}` : item.en.body,
        body_plain: item.en.body,
        is_machine_translated: true,
        is_reviewed: false,
      });
    }
  });

  console.log('=== خطة مكتبة المحتوى ===');
  console.log(`التصنيفات: ${taxonomies.length}`);
  console.log(`المحتوى: ${contents.length}`);
  console.log(`الترجمات: ${translations.length}`);
  console.log(`روابط التصنيفات: ${terms.length}`);

  if (!COMMIT) {
    console.log('\n(معاينة فقط) للتنفيذ أضف: --commit');
    return;
  }

  await upsert('taxonomies', taxonomies, 'kind,lang,slug');
  await upsert('content', contents, 'id');
  await upsert('content_translations', translations, 'content_id,lang');

  // 3) الروابط: نبحث عن معرّف التصنيف الفعلي (قد يكون موجودًا مسبقًا).
  const allTax = await (await fetch(`${SUPABASE_URL}/rest/v1/taxonomies?select=id,kind,slug,lang&limit=1000`, { headers: H })).json();
  const bySlug = new Map();
  for (const t of allTax ?? []) {
    if (t.lang !== 'ar') continue;
    if (!bySlug.has(t.slug)) bySlug.set(t.slug, t.id);
  }
  const termRows = [];
  for (const t of terms) {
    const id = bySlug.get(t.__slug);
    if (id) termRows.push({ content_id: t.content_id, taxonomy_id: id });
  }
  // إزالة التكرار
  const seen = new Set();
  const uniqueTerms = termRows.filter((t) => {
    const k = `${t.content_id}:${t.taxonomy_id}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  await upsert('content_terms', uniqueTerms, 'content_id,taxonomy_id');

  console.log(`✔ تم زرع المكتبة: ${contents.length} عنصر، ${uniqueTerms.length} رابط تصنيف.`);
}

main().catch((err) => {
  console.error('✖ فشل الزرع:', err.message);
  process.exit(1);
});
