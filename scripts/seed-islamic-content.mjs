// scripts/seed-islamic-content.mjs
// ============================================================================
// زرع هيكل المحتوى الإسلامي الشامل في جداول النظام الموحّد (taxonomies + content).
// غير مُتلِف: يستخدم upsert بناءً على معرّفات ثابتة.
//
// التشغيل:
//   node scripts/seed-islamic-content.mjs --commit
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
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
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

  // -------------------- 1. التصنيفات الرئيسية (فروع الدين) --------------------
  const branches = [
    { name: 'العقيدة وأصول الدين', slug: 'aqeedah', icon: '🕌', color: '#0e7490' },
    { name: 'القرآن وعلومه', slug: 'quran', icon: '📖', color: '#0e7490' },
    { name: 'الحديث وعلومه', slug: 'hadith', icon: '💬', color: '#0e7490' },
    { name: 'الفقه وأصوله', slug: 'fiqh', icon: '⚖️', color: '#0e7490' },
    { name: 'السيرة والتاريخ', slug: 'seerah', icon: '📜', color: '#0e7490' },
    { name: 'التزكية والأخلاق', slug: 'tazkiyah', icon: '🌿', color: '#0e7490' },
    { name: 'الدعوة والخطابة', slug: 'dawah', icon: '🤝', color: '#c9a227' },
    { name: 'الردود على الشبهات والتيارات', slug: 'responses', icon: '🛡️', color: '#c9a227' },
    { name: 'بوابة غير المسلمين', slug: 'non-muslim', icon: '◈', color: '#c9a227' },
    { name: 'الأدوات الإسلامية', slug: 'tools', icon: '🛠️', color: '#0e7490' },
  ];

  branches.forEach((b, i) => {
    const id = detUuid(`taxonomy:branch:${b.slug}`);
    taxonomies.push({
      id, kind: 'branch', lang: 'ar', name: b.name, slug: b.slug, icon: b.icon, color: b.color, sort_order: i,
    });
  });

  // تصنيفات فرعية لكل فرع (أمثلة)
  const subBranches = [
    // عقيدة
    { parent: 'aqeedah', name: 'التوحيد وأركان الإيمان', slug: 'tawhid', icon: '☪️' },
    { parent: 'aqeedah', name: 'الأسماء والصفات', slug: 'names-attributes', icon: '✨' },
    { parent: 'aqeedah', name: 'الفرق والمذاهب', slug: 'sects', icon: '🏛️' },
    // قرآن
    { parent: 'quran', name: 'تفسير القرآن', slug: 'tafsir', icon: '📚' },
    { parent: 'quran', name: 'تجويد وقراءات', slug: 'tajweed', icon: '🎵' },
    { parent: 'quran', name: 'أسباب النزول', slug: 'asbab-nuzul', icon: '📅' },
    // حديث
    { parent: 'hadith', name: 'كتب الحديث الستة', slug: 'six-books', icon: '📕' },
    { parent: 'hadith', name: 'مصطلح الحديث', slug: 'mustalah', icon: '🔍' },
    // فقه
    { parent: 'fiqh', name: 'فقه العبادات', slug: 'ibadat', icon: '🕋' },
    { parent: 'fiqh', name: 'فقه المعاملات', slug: 'muamalat', icon: '💰' },
    { parent: 'fiqh', name: 'أصول الفقه', slug: 'usul-fiqh', icon: '📐' },
    // دعوة
    { parent: 'dawah', name: 'منهج الدعوة', slug: 'dawah-manhaj', icon: '📢' },
    { parent: 'dawah', name: 'الخطاب والمحاضرات', slug: 'khutab', icon: '🎤' },
    // ردود
    { parent: 'responses', name: 'الرد على الإلحاد', slug: 'atheism', icon: '🚫' },
    { parent: 'responses', name: 'الرد على العلمانية والليبرالية', slug: 'secularism', icon: '⚖️' },
    { parent: 'responses', name: 'الرد على التبشير والاستشراق', slug: 'missionary', icon: '📖' },
    // غير مسلمين
    { parent: 'non-muslim', name: 'تعريف بالإسلام', slug: 'islam-intro', icon: '🕌' },
    { parent: 'non-muslim', name: 'مقارنة الأديان', slug: 'comparative-religion', icon: '⚖️' },
    { parent: 'non-muslim', name: 'دليل اعتناق الإسلام', slug: 'convert-guide', icon: '🤲' },
    // أدوات
    { parent: 'tools', name: 'مواقيت الصلاة', slug: 'prayer-times', icon: '🕒' },
    { parent: 'tools', name: 'اتجاه القبلة', slug: 'qibla', icon: '🧭' },
    { parent: 'tools', name: 'الأذكار', slug: 'adhkar', icon: '🤲' },
  ];

  const branchBySlug = new Map(branches.map((b) => [b.slug, detUuid(`taxonomy:branch:${b.slug}`)]));
  subBranches.forEach((sb, i) => {
    const id = detUuid(`taxonomy:sub:${sb.slug}`);
    taxonomies.push({
      id, kind: 'subbranch', lang: 'ar', name: sb.name, slug: sb.slug, icon: sb.icon, color: null, sort_order: i,
    });
  });

  // -------------------- 2. محتوى أولي لكل فرع --------------------
  const seedContent = [
    { type: 'page', branch: 'aqeedah', title: 'العقيدة الإسلامية — أساس الدين', body: 'العقيدة الإسلامية هي الأساس الذي يقوم عليه الدين، وتشمل الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر خيره وشره.' },
    { type: 'page', branch: 'quran', title: 'القرآن الكريم — كتاب الله', body: 'القرآن الكريم هو كتاب الله المنزل على نبينا محمد ﷺ، وهو المصدر الأول للتشريع الإسلامي.' },
    { type: 'page', branch: 'hadith', title: 'الحديث الشريف — سنة النبي ﷺ', body: 'الحديث الشريف هو ثاني مصدر للتشريع الإسلامي بعد القرآن الكريم، ويشمل أقوال النبي ﷺ وأفعاله وتقريراته.' },
    { type: 'page', branch: 'fiqh', title: 'الفقه الإسلامي — فهم الأحكام الشرعية', body: 'الفقه الإسلامي هو معرفة الأحكام الشرعية العملية المستمدة من الكتاب والسنة.' },
    { type: 'page', branch: 'seerah', title: 'السيرة النبوية — حياة النبي ﷺ', body: 'السيرة النبوية العطرة تشمل حياة نبينا محمد ﷺ من المولد إلى الوفاة، وهي أسوة حسنة لكل مسلم.' },
    { type: 'page', branch: 'tazkiyah', title: 'التزكية والأخلاق — تطهير النفس', body: 'التزكية الإسلامية هي تطهير النفس من الرذائل وتحليها بالفضائل، وهي هدف من أهداف إرسال الرسل.' },
    { type: 'page', branch: 'dawah', title: 'الدعوة إلى الله — منهج الرفق والحكمة', body: 'الدعوة إلى الله هي دعوة الناس إلى عبادة الله وحده باستخدام الحكمة والموعظة الحسنة والجدال بالتي هي أحسن.' },
    { type: 'page', branch: 'responses', title: 'مركز الردود على الشبهات', body: 'مركز متخصص للرد على الشبهات التي تُثار حول الإسلام، بالاستدلال من الكتاب والسنة ومنطق السلف الصالح.' },
    { type: 'page', branch: 'non-muslim', title: 'بوابة غير المسلمين — تعريف بالإسلام', body: 'بوابة مخصصة لغير المسلمين للتعرف على الإسلام بشكل صحيح، بعيدًا عن التشويه والمفاهيم المغلوطة.' },
    { type: 'page', branch: 'tools', title: 'الأدوات الإسلامية — خدمة المسلم', body: 'مجموعة من الأدوات العملية للمسلم تشمل مواقيت الصلاة، واتجاه القبلة، والأذكار، وحاسبة الزكاة، وغيرها.' },
  ];

  seedContent.forEach((c, i) => {
    const contentId = detUuid(`content:page:${c.branch}`);
    contents.push({
      id: contentId,
      content_type: c.type,
      status: 'published',
      lang_original: 'ar',
      audience: ['muslim_general', 'non_muslim'],
      age_groups: ['all'],
      levels: ['beginner'],
      madhhabs: ['general'],
      sort_order: i,
      published_at: new Date().toISOString(),
      views: 0,
      needs_scholar_review: false,
    });
    translations.push({
      content_id: contentId,
      lang: 'ar',
      slug: `${c.branch}-intro`,
      title: c.title,
      summary: c.body.slice(0, 200),
      body: c.body,
      body_plain: c.body,
      is_machine_translated: false,
      is_reviewed: true,
    });
    const branchId = branchBySlug.get(c.branch);
    if (branchId) terms.push({ content_id: contentId, taxonomy_id: branchId });
  });

  console.log('=== خطة الزرع ===');
  console.log(`التصنيفات الرئيسية: ${branches.length}`);
  console.log(`التصنيفات الفرعية: ${subBranches.length}`);
  console.log(`المحتوى: ${contents.length}`);
  console.log(`الترجمات: ${translations.length}`);
  console.log(`الربط بالتصنيفات: ${terms.length}`);

  if (!COMMIT) {
    console.log('\n(معاينة فقط) للتنفيذ أضف: --commit');
    return;
  }

  await upsert('taxonomies', taxonomies, 'kind,lang,slug');
  await upsert('content', contents, 'id');
  await upsert('content_translations', translations, 'content_id,lang');
  await upsert('content_terms', terms, 'content_id,taxonomy_id');
  console.log('✔ تم الزرع بنجاح.');
}

main().catch((err) => {
  console.error('✖ فشل الزرع:', err.message);
  process.exit(1);
});
