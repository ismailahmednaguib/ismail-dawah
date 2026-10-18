import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const roots = ['app', 'components', 'lib'];
const extensions = new Set(['.css', '.js', '.jsx', '.mjs', '.ts', '.tsx']);
const forbidden = /(?:bg|text|border|from|to|via|ring|shadow|decoration|prose)-(?:green|emerald|lime|cyan|blue|purple|indigo|violet|pink|fuchsia|rose)-\d{2,3}(?:\/\d+)?/g;
const hits = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    const extension = entry.name.slice(entry.name.lastIndexOf('.'));
    if (!extensions.has(extension)) continue;
    const source = await readFile(path, 'utf8');
    const matches = [...source.matchAll(forbidden)].map((match) => match[0]);
    for (const match of [...new Set(matches)]) hits.push(`${relative('.', path)}: ${match}`);
  }
}

for (const root of roots) await walk(root);

if (hits.length) {
  console.error('❌ وُجدت ألوان هوية خارج نظام primary/gold/night:');
  for (const hit of [...new Set(hits)].sort()) console.error(`- ${hit}`);
  process.exitCode = 1;
} else {
  console.log('✅ لا توجد درجات ألوان هوية قديمة في app/components/lib.');
}
