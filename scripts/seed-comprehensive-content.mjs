// scripts/seed-comprehensive-content.mjs
// ============================================================================
// زرع محتوى إسلامي شامل ومفصل في جميع فروع الدين.
// غير مُتلِف (idempotent) — يستخدم upsert بمعرّفات ثابتة.
//
// التشغيل:
//   node scripts/seed-comprehensive-content.mjs --commit
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
  return String(value)
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'item';
}

async function upsert(table, rows, onConflict) {
  if (!COMMIT || rows.length === 0) return 0;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`${table} failed: ${res.status} ${await res.text()}`);
  return rows.length;
}

async function main() {
  const taxonomies = [];
  const contents = [];
  const translations = [];
  const terms = [];

  const branchBySlug = new Map();
  const addBranch = (kind, lang, name, slug, icon, color, order) => {
    const id = detUuid(`taxonomy:${kind}:${slug}`);
    taxonomies.push({ id, kind, lang, name, slug, icon, color, sort_order: order });
    branchBySlug.set(slug, id);
    return id;
  };

  // -------------------- فروع الدين الرئيسية --------------------
  addBranch('branch', 'ar', 'العقيدة وأصول الدين', 'aqeedah', '🕌', '#0e7490', 1);
  addBranch('branch', 'ar', 'القرآن وعلومه', 'quran', '📖', '#0e7490', 2);
  addBranch('branch', 'ar', 'الحديث وعلومه', 'hadith', '💬', '#0e7490', 3);
  addBranch('branch', 'ar', 'الفقه وأصوله', 'fiqh', '⚖️', '#0e7490', 4);
  addBranch('branch', 'ar', 'السيرة والتاريخ', 'seerah', '📜', '#0e7490', 5);
  addBranch('branch', 'ar', 'التزكية والأخلاق', 'tazkiyah', '🌿', '#0e7490', 6);
  addBranch('branch', 'ar', 'الدعوة والخطابة', 'dawah', '🤝', '#c9a227', 7);
  addBranch('branch', 'ar', 'الردود على الشبهات والتيارات', 'responses', '🛡️', '#c9a227', 8);
  addBranch('branch', 'ar', 'بوابة غير المسلمين', 'non-muslim', '◈', '#c9a227', 9);
  addBranch('branch', 'ar', 'الأدوات الإسلامية', 'tools', '🛠️', '#0e7490', 10);

  // -------------------- تصنيفات فرعية --------------------
  const subs = [
    ['aqeedah', 'التوحيد وأركان الإيمان', 'tawhid', '☪️'],
    ['aqeedah', 'الأسماء والصفات', 'names-attributes', '✨'],
    ['aqeedah', 'القدر والبعث', 'qadar', '🌌'],
    ['aqeedah', 'الفرق والمذاهب', 'sects', '🏛️'],
    ['quran', 'تفسير القرآن', 'tafsir', '📚'],
    ['quran', 'تجويد وقراءات', 'tajweed', '🎵'],
    ['quran', 'أسباب النزول', 'asbab-nuzul', '📅'],
    ['quran', 'حفظ القرآن', 'hifz', '💾'],
    ['hadith', 'كتب الحديث الستة', 'six-books', '📕'],
    ['hadith', 'مصطلح الحديث', 'mustalah', '🔍'],
    ['hadith', 'الأحكام الشرعية من الحديث', 'ahkam', '⚖️'],
    ['fiqh', 'فقه العبادات', 'ibadat', '🕋'],
    ['fiqh', 'فقه المعاملات', 'muamalat', '💰'],
    ['fiqh', 'الفقه المقارن', 'comparative-fiqh', '⚖️'],
    ['fiqh', 'أصول الفقه', 'usul-fiqh', '📐'],
    ['seerah', 'السيرة النبوية', 'seerah-nabawiyah', '🌙'],
    ['seerah', 'الخلافة الراشدة', 'khulafa', '🕌'],
    ['seerah', 'التاريخ الإسلامي', 'islamic-history', '📜'],
    ['tazkiyah', 'تطهير النفس', 'tazkiyah-nafs', '🌿'],
    ['tazkiyah', 'الأخلاق والآداب', 'akhlaq', '🤲'],
    ['tazkiyah', 'الأذكار والدعاء', 'adhkar-duaa', '🤲'],
    ['dawah', 'منهج الدعوة', 'dawah-manhaj', '📢'],
    ['dawah', 'الخطاب والمحاضرات', 'khutab', '🎤'],
    ['dawah', 'الحوار مع غير المسلمين', 'dialogue', '🤝'],
    ['responses', 'الرد على الإلحاد', 'atheism', '🚫'],
    ['responses', 'الرد على العلمانية والليبرالية', 'secularism', '⚖️'],
    ['responses', 'الرد على التبشير والاستشراق', 'missionary', '📖'],
    ['responses', 'الرد على الشبهات حول المرأة', 'women-responses', '👩'],
    ['non-muslim', 'تعريف بالإسلام', 'islam-intro', '🕌'],
    ['non-muslim', 'مقارنة الأديان', 'comparative-religion', '⚖️'],
    ['non-muslim', 'دليل اعتناق الإسلام', 'convert-guide', '🤲'],
    ['tools', 'مواقيت الصلاة', 'prayer-times', '🕒'],
    ['tools', 'اتجاه القبلة', 'qibla', '🧭'],
    ['tools', 'الأذكار اليومية', 'daily-adhkar', '🤲'],
  ];
  subs.forEach(([parent, name, slug, icon], i) => {
    const id = detUuid(`taxonomy:sub:${slug}`);
    taxonomies.push({ id, kind: 'subbranch', lang: 'ar', name, slug, icon, color: null, sort_order: i, parent_id: branchBySlug.get(parent) || null });
  });

  // -------------------- محتوى شامل --------------------
  const seed = [
    // عقيدة
    { type: 'lesson', branch: 'aqeedah', sub: 'tawhid', title: 'التوحيد — تعريف وأركان', body: 'التوحيد linguistically...', audience: ['muslim_general', 'student'], level: 'beginner' },
    { type: 'lesson', branch: 'aqeedah', sub: 'names-attributes', title: 'أسماء الله الحسنى وصفاته', body: 'الإيمان بأسماء الله وصفاته مما يجب على المسلم اعتقاده...', audience: ['muslim_general'], level: 'beginner' },
    { type: 'lesson', branch: 'aqeedah', sub: 'qadar', title: 'الإيمان بالقدر خيره وشره', body: 'القدر هو تقدير الأشياء وأجرائها على التقدير والمكونة لذلك...', audience: ['muslim_general'], level: 'beginner' },
    { type: 'lesson', branch: 'aqeedah', sub: 'sects', title: 'الفرقة الناجية وأهل السنة والجماعة', body: 'أهل السنة والجماعة هم الفرقة الناجية الذين على ما عليه النبي ﷺ وأصحابه...', audience: ['student', 'scholar'], level: 'intermediate' },
    // قرآن
    { type: 'lesson', branch: 'quran', sub: 'tafsir', title: 'تفسير سورة الفاتحة', body: 'سورة الفاتحة هي أم القرآن، وإحدى الركنين في الصلاة...', audience: ['muslim_general', 'non_muslim'], level: 'beginner' },
    { type: 'lesson', branch: 'quran', sub: 'tajweed', title: 'أحكام التجويد الميسرة', body: 'التجويد linguistically هو تحسين النطق وإخراج الحروف من مخارجها...', audience: ['student'], level: 'beginner' },
    { type: 'lesson', branch: 'quran', sub: 'asbab-nuzul', title: 'أسباب النزول وأهميتها', body: 'أسباب النزول هي الأحداث التي نزلت بسببها الآيات...', audience: ['student'], level: 'intermediate' },
    { type: 'lesson', branch: 'quran', sub: 'hifz', title: 'خطة حفظ القرآن للمبتدئين', body: 'يمكن البدء بحفظ الجزء الثلاثين ثم الجزء العشرين وهكذا...', audience: ['muslim_general', 'student'], level: 'beginner' },
    // حديث
    { type: 'lesson', branch: 'hadith', sub: 'six-books', title: 'كتب الحديث الستة', body: 'الكتب الستة هي: صحيح البخاري، وصحيح مسلم، وسنن أبي داود، والترمذي، والنسائي، وابن ماجة...', audience: ['student', 'scholar'], level: 'intermediate' },
    { type: 'lesson', branch: 'hadith', sub: 'mustalah', title: 'مصطلح الحديث — تعريف وأنواع', body: 'مصطلح الحديث هو معرفة أحوال الأسانيد والمتون...', audience: ['student'], level: 'advanced' },
    { type: 'hadith', branch: 'hadith', sub: 'six-books', title: ' حديث: «الإيمان بضع وسبعون شعبة»', body: 'عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ: «الإيمان بضع وسبعون شعبة، أفضلها قول لا إله إلا الله، وأدناها إماطة الأذى عن الطريق، والحياء شعبة من الإيمان».', source: 'متفق عليه', audience: ['muslim_general'], level: 'beginner' },
    { type: 'hadith', branch: 'hadith', sub: 'six-books', title: 'حديث: «لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه»', body: 'عن أنس رضي الله عنه عن النبي ﷺ قال: «لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه».', source: 'متفق عليه', audience: ['muslim_general'], level: 'beginner' },
    // فقه
    { type: 'lesson', branch: 'fiqh', sub: 'ibadat', title: 'فقه الطهارة — إزالة النجاسة', body: 'النجاسة يجب إزالتها بالماء الطهور حتى تزول عينها ورائحتها ولونها...', audience: ['muslim_general'], level: 'beginner' },
    { type: 'lesson', branch: 'fiqh', sub: 'ibadat', title: 'أحكام الصلاة — شروط وواجبات وسنن', body: 'الصلاة هي الركن الثاني من أركان الإسلام، ولا يقبل الله عملاً بدونها...', audience: ['muslim_general'], level: 'beginner' },
    { type: 'lesson', branch: 'fiqh', sub: 'muamalat', title: 'فقه المعاملات — البيع والشراء', body: 'المعاملات في الإسلام مبنية على الرضا والمشروعة ما لم يكن هناك نص يحرمها...', audience: ['muslim_general'], level: 'intermediate' },
    { type: 'lesson', branch: 'fiqh', sub: 'usul-fiqh', title: 'مبادئ أصول الفقه', body: 'أصول الفقه هو العلم بقواعد استنباط الأحكام الشرعية من أدلتها التفصيلية...', audience: ['student', 'scholar'], level: 'advanced' },
    { type: 'fatwa', branch: 'fiqh', sub: 'ibadat', title: 'هل يجوز الجمع بين الصلاتين في السفر؟', body: 'يجوز الجمع بين الصلاتين في السفر جمع تقديم أو تأخير رخصة من الله عز وجل للمسافر...', source: 'رواه مسلم', audience: ['muslim_general'], level: 'beginner', scholarReview: true },
    { type: 'fatwa', branch: 'fiqh', sub: 'ibadat', title: 'حكم sierتgegenركب المرأة السيارة بدون محرم', body: 'سفر المرأة بدون محرم محرم في الإسلام لقول النبي ﷺ: «لا تسافر امرأة إلا مع ذي محرم».', source: 'متفق عليه', audience: ['muslim_general'], level: 'beginner', scholarReview: true },
    { type: 'fatwa', branch: 'fiqh', sub: 'muamalat', title: 'حكم المعاملات بالربا', body: 'الربا محرم قطعًا في الإسلام، والله عز وجل قد أحل البيع وحرم الربا...', source: 'سورة البقرة', audience: ['muslim_general'], level: 'beginner', scholarReview: true },
    // سيرة
    { type: 'story', branch: 'seerah', sub: 'seerah-nabawiyah', title: 'مولد النبي ﷺ وبدء الوحي', body: 'ولد النبي ﷺ في عام الفيل في مكة المكرمة، وبدأ الوحي وهو في غار حراء...', audience: ['muslim_general'], level: 'beginner' },
    { type: 'story', branch: 'seerah', sub: 'khulafa', title: 'عهد أبو بكر الصديق رضي الله عنه', body: 'كان أبو بكر أول الخلفاء الراشدين، وقام بحرد الردة وجمع القرآن...', audience: ['muslim_general'], level: 'beginner' },
    // تزكية
    { type: 'lesson', branch: 'tazkiyah', sub: 'akhlaq', title: 'حسن الخلق في الإسلام', body: 'عن النبي ﷺ: «أكمل المؤمنين إيمانًا أحسنهم خلقًا».', audience: ['muslim_general'], level: 'beginner' },
    { type: 'lesson', branch: 'tazkiyah', sub: 'adhkar-duaa', title: 'أذكار الصباح والمساء', body: 'أذكار الصباح تقال بعد صلاة الفجر، وأذكار المساء بعد صلاة العصر أو المغرب...', audience: ['muslim_general'], level: 'beginner' },
    // دعوة
    { type: 'lesson', branch: 'dawah', sub: 'dawah-manhaj', title: 'منهج prophets في الدعوة', body: 'الدعوة إلى الله تكون بالحكمة والموعظة الحسنة والجدال بالتي هي أحسن...', audience: ['daee'], level: 'intermediate' },
    { type: 'lesson', branch: 'dawah', sub: 'khutab', title: 'كيفية إعداد خطبة الجمعة', body: 'خطبة الجمعة يجب أن تحتوي على الحمد والصلاة على النبي والتقوى والموعظة...', audience: ['daee'], level: 'intermediate' },
    // ردود
    { type: 'faq', branch: 'responses', sub: 'atheism', title: 'الرد على شبهة: «لماذا يسمح الله بالمعاناة؟»', body: 'المعاناة في الدنيا هي ابتلاء واختبار، والدنيا دار امتحان وليست دار جزاء وثواب...', audience: ['non_muslim', 'muslim_general'], level: 'beginner' },
    { type: 'faq', branch: 'responses', sub: 'secularism', title: 'الرد على العلمانية: فصل الدين عن الحياة', body: 'الدين في الإسلام هو علاقة شاملة تشمل كل مناحي الحياة، ولا يمكن فصله عن الدولة والمجتمع...', audience: ['non_muslim', 'student'], level: 'intermediate' },
    { type: 'faq', branch: 'responses', sub: 'missionary', title: 'الرد على شبهة تحريف القرآن', body: 'القرآن محفوظ من الله عز وجل يقول: «إنا نحن نزلنا الذكر وإنا له لحافظون».', audience: ['non_muslim'], level: 'beginner' },
    { type: 'faq', branch: 'responses', sub: 'women-responses', title: 'الرد على شبهة ظلم المرأة في الإسلام', body: 'الإسلام كرم المرأة وأعطاها حقوقًا لم تكن لها قبل الإسلام، وجعل لها ميراثًا وميراثًا...', audience: ['non_muslim', 'muslim_general'], level: 'beginner' },
    // غير مسلمين
    { type: 'page', branch: 'non-muslim', sub: 'islam-intro', title: 'ما هو الإسلام؟ دليل موجز لغير المسلمين', body: 'الإسلام هو دين التوحيد الذي يدعو إلى عبادة الله وحده لا شريك له...', audience: ['non_muslim'], level: 'beginner' },
    { type: 'page', branch: 'non-muslim', sub: 'comparative-religion', title: 'مقارنة الأديان: الإسلام والمسيحية واليهودية', body: 'الدعوة إلى توحيد الله هي الكلمة المشتركة بين الأديان السماوية...', audience: ['non_muslim'], level: 'intermediate' },
    { type: 'page', branch: 'non-muslim', sub: 'convert-guide', title: 'كيف تدخل الإسلام؟ خطوات مبسطة', body: 'الدخول الإسلام يكون بالنطق بالشهادتين والإيمان بما جاء به النبي محمد ﷺ...', audience: ['non_muslim'], level: 'beginner' },
    // أدوات
    { type: 'page', branch: 'tools', sub: 'prayer-times', title: 'مواقيت الصلاة — كيف تُحسب', body: 'مواقيت الصلاة تُحسب حسب موقع الشمس بالنسبة للمكان والتاريخ...', audience: ['muslim_general'], level: 'beginner' },
    { type: 'page', branch: 'tools', sub: 'qibla', title: 'اتجاه القبلة — كيف تعرفه', body: 'القبلة هي الكعبة المشرفة في مكة المكرمة، ويتجه المسلمون إليها في الصلاة...', audience: ['muslim_general'], level: 'beginner' },
  ];

  seed.forEach((c, i) => {
    const contentId = detUuid(`content:${c.type}:${c.branch}:${i}`);
    contents.push({
      id: contentId,
      content_type: c.type,
      status: 'published',
      lang_original: 'ar',
      audience: c.audience,
      age_groups: ['all'],
      levels: [c.level],
      madhhabs: ['general'],
      sort_order: i,
      published_at: new Date().toISOString(),
      views: 0,
      needs_scholar_review: c.scholarReview || false,
    });
    translations.push({
      content_id: contentId,
      lang: 'ar',
      slug: `${c.type}-${c.branch}-${slugify(c.title) || 'x'}-${i}`,
      title: c.title,
      summary: c.body.slice(0, 200),
      body: c.body,
      body_plain: c.body,
      is_machine_translated: false,
      is_reviewed: c.scholarReview ? true : false,
    });
    const branchId = branchBySlug.get(c.branch);
    const subId = c.sub ? (() => {
      const found = subs.find(([p, , s]) => p === c.branch && s === c.sub);
      return found ? detUuid(`taxonomy:sub:${found[2]}`) : null;
    })() : null;
    if (branchId) terms.push({ content_id: contentId, taxonomy_id: branchId });
    if (subId) terms.push({ content_id: contentId, taxonomy_id: subId });
  });

  console.log('=== خطة الزرع الشامل ===');
  console.log(`التصنيفات: ${taxonomies.length}`);
  console.log(`المحتوى: ${contents.length}`);
  console.log(`الترجمات: ${translations.length}`);
  console.log(`الربط بالتصنيفات: ${terms.length}`);

  const branchTaxonomies = taxonomies.filter((t) => t.kind === 'branch');
  const subTaxonomies = taxonomies.filter((t) => t.kind === 'subbranch');

  if (COMMIT) {
    if (!COMMIT) {
    console.log('\n(معاينة فقط) للتنفيذ أضف: --commit');
    return;
  }

  await upsert('taxonomies', branchTaxonomies, 'kind,lang,slug');
    await upsert('taxonomies', subTaxonomies, 'kind,lang,slug');
    await upsert('content', contents, 'id');
    await upsert('content_translations', translations, 'content_id,lang');
    await upsert('content_terms', terms, 'content_id,taxonomy_id');
  }
  console.log('✔ تم الزرع الشامل بنجاح.');
}

main().catch((err) => {
  console.error('✖ فشل الزرع:', err.message);
  process.exit(1);
});
