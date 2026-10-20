// scripts/fix-content-issues.mjs
// ============================================================================
// تصحيح أخطاء محتوى مؤكَّدة (اكتشفها scripts/content-qa.mjs وتدقيق يدوي).
//
// يعالج:
//   1) تسرّب «\n» الحرفي إلى النصوص — يظهر للزائر كنصّ لا كسطر جديد.
//   2) أخطاء نسخ/إملاء في نصوص الدفعات القديمة.
//   3) عنصرًا مكرّرًا تمامًا أُدخل في دفعة لاحقة.
//
// غير مُتلِف: التعديلات إمّا استبدال نصّي دقيق أو تعيين حقول محدّدة بمعرّف المحتوى.
//
// التشغيل:
//   node scripts/fix-content-issues.mjs            (معاينة)
//   node scripts/fix-content-issues.mjs --commit   (تنفيذ)
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
const COMMIT = process.argv.includes('--commit');
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const LITERAL_NEWLINE = String.fromCharCode(92) + 'n';

/** (١) استبدالات نصّية دقيقة. */
const REPLACEMENTS = [
  {
    slug: 'faq-responses-الرد-على-شبهة-ظلم-المرأة-في-الإسلام-28',
    lang: 'ar',
    from: 'وجعل لها ميراثًا وميراثًا',
    to: 'وجعل لها ميراثًا ومِلكًا',
    why: 'تكرار كلمة «ميراثًا» (خطأ نسخ)',
  },
  {
    slug: 'story-seerah-عهد-أبو-بكر-الصديق-رضي-الله-عنه-20',
    lang: 'ar',
    from: 'وقام بحرد الردة',
    to: 'وقام بحرب الردة',
    why: '«بحرد» ← «بحرب»',
  },
  {
    slug: 'page-non-muslim-كيف-تدخل-الإسلام؟-خطوات-مبسطة-31',
    lang: 'ar',
    from: 'الدخول الإسلام يكون',
    to: 'الدخول في الإسلام يكون',
    why: 'سقوط حرف الجرّ',
  },
  {
    slug: 'lesson-quran-خطة-حفظ-القرآن-للمبتدئين-7',
    lang: 'ar',
    from: 'ثم الجزء العشرين',
    to: 'ثم الجزء التاسع والعشرين',
    why: 'ترتيب أجزاء الحفظ معكوس',
  },
  {
    slug: 'lesson-quran-خطة-حفظ-القرآن-للمبتدئين-7',
    lang: 'en',
    from: 'then the twentieth part',
    to: 'then the twenty-ninth part',
    why: 'mirrors the Arabic order fix',
  },
  {
    slug: 'quran-makki-madani',
    lang: 'ar',
    from: 'وبيان الأحكام والأحكام الشرعية والفرائض',
    to: 'وبيان الأحكام الشرعية والفرائض',
    why: 'تكرار «الأحكام»',
  },
  {
    slug: 'quran-makki-madani',
    lang: 'en',
    from: 'the detailing of rulings, laws and obligations',
    to: 'the detailing of legal rulings and obligations',
    why: 'mirrors the Arabic wording',
  },
  {
    slug: 'muslims-west',
    lang: 'ar',
    from: 'وبناء المساجد والمراكز والمراكز الشرعية',
    to: 'وبناء المساجد والمراكز الشرعية',
    why: 'تكرار «والمراكز»',
  },
  {
    slug: 'fatwa-fiqh-حكم-ركوب-المرأة-السيارة-بدون-محرم-17',
    lang: 'ar',
    from: 'سفر المرأة بدون محرم محرم في الإسلام',
    to: 'سفر المرأة بدون محرمٍ حرامٌ في الإسلام',
    why: 'التباس بين «مَحرَم» و«مُحرَّم»',
  },
  {
    slug: 'fatwa-fiqh-حكم-ركوب-المرأة-السيارة-بدون-محرم-17',
    lang: 'ar',
    field: 'title',
    from: 'حكم ركوب المرأة السيارة بدون محرم',
    to: 'حكم سفر المرأة بدون محرم',
    why: 'العنوان يتحدث عن الركوب والمتن عن السفر',
  },
  {
    slug: 'fatwa-fiqh-حكم-ركوب-المرأة-السيارة-بدون-محرم-17',
    lang: 'en',
    field: 'title',
    from: 'The ruling on a woman travelling by car without a mahram',
    to: 'The ruling on a woman travelling without a mahram',
    why: 'mirrors the Arabic title correction',
  },
  {
    slug: 'story-seerah-عهد-أبو-بكر-الصديق-رضي-الله-عنه-20',
    lang: 'ar',
    field: 'title',
    from: 'عهد أبو بكر الصديق رضي الله عنه',
    to: 'عهد أبي بكر الصديق رضي الله عنه',
    why: 'الصواب «أبي بكر» في هذا التركيب',
  },

  // --- الدفعة الثانية: عناوين مكرّرة ومسافات زائدة (اكتشفها content-qa) ---
  {
    slug: 'place-mosque-grand',
    lang: 'ar',
    field: 'title',
    from: 'المسجد الكبير',
    to: 'المسجد الجامع الكبير',
    why: 'عنوان مكرّر مع page-places-2',
  },
  {
    slug: 'place-mosque-grand',
    lang: 'en',
    field: 'title',
    from: 'The Grand Mosque',
    to: 'The Grand Congregational Mosque',
    why: 'duplicate title with page-places-2',
  },
  {
    slug: 'faq-doubts-3',
    lang: 'ar',
    field: 'title',
    from: 'هل الإسلام يظلم المرأة؟',
    to: 'المرأة في الإسلام: تكريم لا ظلم',
    why: 'عنوان مكرّر مع faq-women-rights',
  },
  {
    slug: 'lesson-tazkiyah-أذكار-الصباح-والمساء-22',
    lang: 'ar',
    field: 'body',
    from: '» ، و«حسبي الله',
    to: '» و«حسبي الله',
    why: 'مسافة قبل علامة ترقيم',
  },
];

/** (٣) عنصر أُدخل مكرّرًا: يُستبدل بموضوع مختلف مفيد. */
const RETOPIC = [
  {
    slug: 'tazkiyah-heart-diseases',
    why: 'مطابق لعنصر سابق (lesson-akhlaq-heart) عنوانًا ومعنًى',
    ar: {
      title: 'التوبة: شروطها وثمراتها',
      summary: 'ما حقيقة التوبة، وما شروط قبولها، وما ثمراتها في الدنيا والآخرة؟',
      body: 'التوبة رجوع العبد إلى الله بترك المعصية، والندم على ما مضى، والعزم على ألّا يعود. وهي واجبةٌ على الفور من كل ذنب، ولا تُترك بحجّة التسويف؛ فإنّ النفس إن أُهملت تمنّت، وإن حوسبت استقامت.\n\nوشروط قبولها أربعة: الإخلاص لله، والندم على الفعل، والإقلاع عنه في الحال، والعزم على عدم العود؛ ويُضاف إليها ردّ الحقوق والمظالم إلى أهلها إن كانت بين العباد، فإنّ حقوق الآدميين لا تُسقطها التوبة وحدها.\n\nوثمراتها عظيمة: محبّة الله كما في قوله: «إنّ الله يحبّ التوّابين»، وتبديل السيئات حسنات، وسعة الرزق، وانشراح الصدر، وطمأنينة القلب؛ ومن علامة صدقها أن يكون العبد بعدها أحسن حالًا مما كان قبلها، لا أن يعود إلى الذنب ويستصغره.',
    },
    en: {
      title: 'Repentance: Conditions and Fruits',
      summary: 'What is true repentance, what are its conditions of acceptance, and what fruits does it yield?',
      body: 'Repentance is the servant\u0027s return to God by abandoning sin, regretting what has passed, and resolving not to return. It is immediately obligatory for every sin and is not deferred through procrastination; for the self, when neglected, indulges in wishes, and when held to account, becomes upright.\n\nIts conditions of acceptance are four: sincerity for God, regret for the act, ceasing it at once, and resolving not to repeat it. To these is added restoring rights and wrongs to their owners when they concern people, for the rights of people are not dropped by repentance alone.\n\nIts fruits are great: God\u0027s love, as in "God loves those who repent," the exchange of bad deeds for good, abundant provision, expansion of the chest, and tranquillity of heart. A sign of its sincerity is that one becomes better after it than before, not returning to the sin and belittling it.',
    },
  },
];

// ============================================================

async function getAll(select) {
  const rows = [];
  for (let offset = 0; offset < 50000; offset += 1000) {
    const res = await fetch(
      `${URL}/rest/v1/content_translations?select=${select}&limit=1000&offset=${offset}`,
      { headers: H }
    );
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const batch = await res.json();
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

const rows = await getAll('id,lang,slug,title,summary,body');
const bySlugLang = new Map(rows.map((r) => [`${r.slug}|${r.lang}`, r]));

console.log('=== تصحيح أخطاء المحتوى ===');
console.log(`صفوف الترجمات المفحوصة: ${rows.length}`);
console.log('------------------------------------------------------------');

const patches = new Map(); // id -> { field: value }
const note = (id, field, value) => {
  if (!patches.has(id)) patches.set(id, {});
  patches.get(id)[field] = value;
};

let applied = 0;

// (١) التسرّب الحرفي لـ \n
let leakCount = 0;
for (const row of rows) {
  const fix = {};
  for (const field of ['title', 'summary', 'body']) {
    const value = row[field];
    if (typeof value === 'string' && value.includes(LITERAL_NEWLINE)) {
      fix[field] = value.split(LITERAL_NEWLINE).join('\n');
    }
  }
  if (Object.keys(fix).length) {
    leakCount += 1;
    for (const [field, value] of Object.entries(fix)) note(row.id, field, value);
  }
}
console.log(`(١) صفوف فيها \\\\n حرفيّ (يُحوَّل إلى سطر حقيقي): ${leakCount}`);

// (٢) الاستبدالات النصّية
for (const r of REPLACEMENTS) {
  const row = bySlugLang.get(`${r.slug}|${r.lang}`);
  if (!row) {
    console.log(`✖ لم يُوجد: ${r.lang}/${r.slug}`);
    continue;
  }
  const fields = r.field ? [r.field] : ['title', 'summary', 'body'];
  let state = 'missing';
  for (const field of fields) {
    const value = row[field];
    if (typeof value !== 'string') continue;
    const current = patches.get(row.id)?.[field] ?? value;
    if (current.includes(r.from)) {
      note(row.id, field, current.split(r.from).join(r.to));
      state = 'applied';
    } else if (current.includes(r.to)) {
      state = 'done';
    }
  }
  if (state === 'applied') {
    applied += 1;
    console.log(`✔ ${r.lang}/${r.slug.slice(0, 46)} — ${r.why}`);
  } else if (state === 'done') {
    console.log(`◐ مُطبَّق سابقًا: ${r.lang}/${r.slug.slice(0, 46)} — ${r.why}`);
  } else {
    console.log(`◐ لم يُطابق النصّ المتوقّع: ${r.lang}/${r.slug} — ${r.why}`);
  }
}

// (٣) العنصر المكرّر
for (const r of RETOPIC) {
  for (const lang of ['ar', 'en']) {
    const row = bySlugLang.get(`${r.slug}|${lang}`);
    if (!row) {
      console.log(`✖ لم يُوجد: ${lang}/${r.slug}`);
      continue;
    }
    for (const field of ['title', 'summary', 'body']) {
      note(row.id, field, r[lang][field]);
    }
    console.log(`✔ إعادة موضوع ${lang}/${r.slug} — ${r.why}`);
  }
}

const total = [...patches.values()].reduce((n, f) => n + Object.keys(f).length, 0);
console.log('------------------------------------------------------------');
console.log(`حقول تُعدَّل: ${total} في ${patches.size} صفًّا`);

if (!COMMIT) {
  console.log('\n(معاينة فقط) للتنفيذ: --commit');
  process.exit(0);
}

let done = 0;
for (const [id, fields] of patches) {
  const res = await fetch(`${URL}/rest/v1/content_translations?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`PATCH ${id}: ${res.status} ${await res.text()}`);
  done += 1;
}

console.log(`✔ تم تصحيح ${done} صفًّا.`);
