// scripts/content-qa.mjs
// ============================================================================
// فحص جودة المحتوى — يكشف أخطاء النسخ واللصق والتشويش في النصوص.
//
// يفحص كل عنصر منشور بالعربية والإنجليزية في:
//   title · summary · body
//
// أنواع الأخطاء المرصودة:
//   • حروف من لغات أخرى (سيريلية · يونانية · عبرية · صينية · يابانية) داخل نصّ عربي
//     أو إنجليزي — أثر شائع للنسخ من مصادر مختلفة.
//   • تكرار كلمة ملتصقة بنفسها: «ميراثًا وميراثًا» أو «من من».
//   • كشيدة مكرّرة أو مسافات مزدوجة أو مسافة قبل علامة ترقيم.
//   • وسوم HTML أو كيانات (&nbsp; · &amp;) ظاهرة في النصّ.
//   • أقواس مزدوجة غير متوازنة « » " ".
//   • نصّ فارغ أو قصير جدًّا، أو مماثل تمامًا للعنوان.
//   • معرّفات (slug) بها مسافات أو أحرف تحكّم.
//   • عناوين مكرّرة داخل اللغة نفسها (احتمال تكرار عنصر).
//
// التشغيل: node scripts/content-qa.mjs
//          node scripts/content-qa.mjs --json   (مخرجات JSON للتصحيح الآلي)
// ============================================================================

import fs from 'node:fs';

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

const env = { ...loadEnv('.env.local'), ...loadEnv('.env'), ...process.env };
const KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function getAll(table, select) {
  const rows = [];
  for (let offset = 0; offset < 50000; offset += 1000) {
    const res = await fetch(
      `${URL}/rest/v1/${table}?select=${select}&limit=1000&offset=${offset}`,
      { headers: H }
    );
    if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

const content = await getAll('content', 'id,content_type,status');
const translations = await getAll(
  'content_translations',
  'id,content_id,lang,slug,title,summary,body'
);

const byId = new Map(content.map((c) => [c.id, c]));
const publishedIds = new Set(content.filter((c) => c.status === 'published').map((c) => c.id));

const FOREIGN = /[\u0400-\u04FF\u0370-\u03FF\u0590-\u05FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/;
const ARABIC = /[\u0600-\u06FF]/;

// ملاحظات مقبولة شرعًا/لغويًّا لا تُعدّ أخطاءً — تُستثنى بالمعرّف والنوع.
const IGNORE = new Set([
  // «سبحان الله والحمد لله ولا إله إلا الله والله أكبر» ذكرٌ وارد، تكراره مقصود.
  'lesson/ar/adhkar-types|تكرار-بواو',
]);

const findings = [];
const add = (slug, lang, field, kind, detail, value) => {
  if (IGNORE.has(`${slug}|${kind}`)) return;
  findings.push({ slug, lang, field, kind, detail, value: String(value ?? '').slice(0, 140) });
};

const seenTitles = new Map();

for (const t of translations) {
  const row = byId.get(t.content_id);
  if (!row || !publishedIds.has(t.content_id)) continue;
  const label = `${row.content_type}/${t.lang}/${t.slug}`;

  if (!t.slug || /\s/.test(t.slug) || /[\u0000-\u001F]/.test(t.slug)) {
    add(label, t.lang, 'slug', 'slug-غير-صالح', 'مسافة أو محرف تحكّم', t.slug);
  }

  for (const field of ['title', 'summary', 'body']) {
    const value = t[field];
    if (value === null || value === undefined) continue;
    const text = String(value);
    if (!text.trim()) {
      add(label, t.lang, field, field === 'body' ? 'متن-فارغ' : 'حقل-فارغ', 'حقل مطلوب فارغ', '');
      continue;
    }

    const foreign = text.match(new RegExp(FOREIGN, 'g'));
    if (foreign) {
      add(label, t.lang, field, 'حروف-دخيلة', `محارف: ${[...new Set(foreign)].join(' ')}`, text);
    }

    if (t.lang === 'ar' && /[A-Za-z]{4,}/.test(text) && !/(AI|HTML|PDF|RSS|SEO|URL|ID)/.test(text)) {
      add(label, t.lang, field, 'نصّ-لاتيني', 'كلمة لاتينية داخل نصّ عربي', text);
    }

    const doubled = text.match(/(?<![\u0600-\u06FF\w])([\u0600-\u06FF]{3,})\s+\1(?![\u0600-\u06FF\w])/);
    if (doubled) {
      add(label, t.lang, field, 'تكرار-كلمة', `«${doubled[1]} ${doubled[1]}»`, text);
    }

    const waDoubled = text.match(/([\u0600-\u06FF]{3,})\s+و\1(?![\u0600-\u06FF])/);
    if (waDoubled) {
      add(label, t.lang, field, 'تكرار-بواو', `«${waDoubled[1]} و${waDoubled[1]}»`, text);
    }

    if (/<[a-z/][^>]*>/i.test(text)) add(label, t.lang, field, 'وسم-HTML', 'وسم ظاهر في النصّ', text);
    if (/&(nbsp|amp|quot|lt|gt);/.test(text)) add(label, t.lang, field, 'كيان-HTML', 'كيان HTML غير مفكوك', text);
    if (/ {2,}/.test(text)) add(label, t.lang, field, 'مسافة-مزدوجة', 'مسافتان متتاليتان', text);
    if (/\s+[،.؛:]/.test(text)) add(label, t.lang, field, 'مسافة-قبل-ترقيم', 'مسافة قبل علامة ترقيم', text);

    for (const [open, close] of [['«', '»'], ['"', '"']]) {
      const a = (text.match(new RegExp(open, 'g')) ?? []).length;
      const b = (text.match(new RegExp(close, 'g')) ?? []).length;
      if (a !== b) {
        add(label, t.lang, field, 'أقواس-غير-متوازنة', `${open}=${a} · ${close}=${b}`, text);
        break;
      }
    }

    if (field === 'body' && text.trim().length < 80) {
      add(label, t.lang, field, 'نصّ-قصير', `${text.trim().length} حرفًا`, text);
    }
    if (field === 'summary' && t.title && text.trim() === String(t.title).trim()) {
      add(label, t.lang, field, 'ملخّص-مكرّر', 'الملخّص = العنوان', text);
    }
  }

  const titleKey = `${t.lang}|${String(t.title ?? '').trim()}`;
  if (t.title && String(t.title).trim().length > 12) {
    if (seenTitles.has(titleKey)) {
      add(label, t.lang, 'title', 'عنوان-مكرّر', `مطابق لـ ${seenTitles.get(titleKey)}`, t.title);
    } else {
      seenTitles.set(titleKey, label);
    }
  }
}

// ============================================================
// التقرير
// ============================================================

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(findings, null, 1));
  process.exit(findings.length ? 1 : 0);
}

const byKind = new Map();
for (const f of findings) byKind.set(f.kind, (byKind.get(f.kind) ?? 0) + 1);

console.log('============================================================');
console.log('فحص جودة المحتوى');
console.log('============================================================');
console.log(`عناصر منشورة مفحوصة : ${publishedIds.size} (${translations.length} صفّ ترجمة)`);
console.log(`ملاحظات             : ${findings.length}`);
console.log('------------------------------------------------------------');

if (findings.length === 0) {
  console.log('✅ لا ملاحظات.');
} else {
  console.log('التوزيع حسب النوع:');
  for (const [kind, count] of [...byKind.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(3)}  ${kind}`);
  }
  console.log('------------------------------------------------------------');
  for (const [kind] of [...byKind.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`\n### ${kind}`);
    for (const f of findings.filter((x) => x.kind === kind)) {
      console.log(`  · ${f.slug} [${f.field}] — ${f.detail}`);
      console.log(`      ${f.value}`);
    }
  }
}

process.exit(findings.length === 0 ? 0 : 1);
