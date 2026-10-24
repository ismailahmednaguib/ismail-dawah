// scripts/check-fields.mjs
// Acceptance check for field pages in Arabic and English.

import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.argv.find((a) => a.startsWith('--base='))?.slice(7) ?? 'http://localhost:3000').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = Number(process.env.QA_TIMEOUT_MS ?? 15000);
const fieldsSource = fs.readFileSync(path.join(process.cwd(), 'app', '[lang]', 'fields', '[slug]', 'page.tsx'), 'utf8');
const arEmpty = /noContent:\s*"([^"]+)"/.exec(fieldsSource.split('en:')[0])?.[1] ?? '';
const enEmpty = /noContent:\s*"([^"]+)"/.exec(fieldsSource.split('en:')[1] ?? '')?.[1] ?? '';
const navSource = fs.readFileSync(path.join(process.cwd(), 'lib', 'navigation.ts'), 'utf8');
const navSlugs = [...new Set([...navSource.matchAll(/\/fields\/([A-Za-z0-9-]+)/g)].map((m) => m[1]))];
const ARABIC = /[\u0600-\u06FF]/;
const strip = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

async function readPage(url) {
  try {
    const response = await fetch(url, {
      headers: { 'cache-control': 'no-cache' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return { response, html: await response.text() };
  } catch (error) {
    return { response: null, html: '', error: error instanceof Error ? error.message : String(error) };
  }
}

const indexPage = await readPage(BASE + '/ar/fields');
if (indexPage.error || !indexPage.response?.ok) {
  console.error('Unable to fetch ' + BASE + '/ar/fields: ' + (indexPage.error ?? ('HTTP ' + indexPage.response?.status)));
  process.exit(1);
}
const indexSlugs = [...new Set([...indexPage.html.matchAll(/\/fields\/([A-Za-z0-9-]+)/g)].map((m) => m[1]))]
  .filter((s) => !s.startsWith('page-'));
const slugs = [...new Set([...navSlugs, ...indexSlugs])].sort();
const jobs = slugs.flatMap((slug) => ['ar', 'en'].map((lang) => ({ slug, lang })));
const problems = [];
let checked = 0;
let cursor = 0;
const workerCount = Math.min(Number(process.env.QA_CONCURRENCY ?? 8), jobs.length);

async function checkJob({ slug, lang }) {
  checked += 1;
  const url = BASE + '/' + lang + '/fields/' + slug;
  const page = await readPage(url);
  if (page.error) return lang + '/fields/' + slug + ': request failed (' + page.error + ')';
  const res = page.response;
  const html = page.html;
  const text = strip(html);
  const empty = lang === 'ar' ? arEmpty : enEmpty;
  if (!res.ok) return lang + '/fields/' + slug + ': HTTP ' + res.status;
  if (empty && text.includes(empty)) return lang + '/fields/' + slug + ': empty page';
  if (lang === 'en') {
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ?? '';
    if (ARABIC.test(strip(h1))) return 'en/fields/' + slug + ': Arabic heading';
  }
  return null;
}

await Promise.all(Array.from({ length: workerCount }, async () => {
  while (true) {
    const job = jobs[cursor++];
    if (!job) return;
    const problem = await checkJob(job);
    if (problem) problems.push(problem);
  }
}));

console.log('============================================================');
console.log('Field pages acceptance check');
console.log('============================================================');
console.log('Base             : ' + BASE);
console.log('Concepts checked : ' + slugs.length + ' (' + checked + ' pages)');
console.log('Request timeout  : ' + REQUEST_TIMEOUT_MS + 'ms');
console.log('Concurrency      : ' + workerCount);
console.log('------------------------------------------------------------');
if (problems.length === 0) {
  console.log('PASS: no empty pages and English headings are localized.');
} else {
  console.log('FAIL: ' + problems.length + ' problem(s)');
  for (const problem of problems.sort()) console.log(' - ' + problem);
}
process.exit(problems.length === 0 ? 0 : 1);
