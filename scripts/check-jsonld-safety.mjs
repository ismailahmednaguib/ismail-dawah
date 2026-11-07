import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ROOTS = ['app', 'components', 'lib'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute));
    else if (EXTENSIONS.has(path.extname(entry.name))) files.push(absolute);
  }
  return files;
}

const files = (await Promise.all(ROOTS.map((root) => collectFiles(path.join(ROOT, root))))).flat();
const violations = [];
for (const file of files) {
  const source = await readFile(file, 'utf8');
  if (source.includes('application/ld+json') && !source.includes('safeJsonLd')) {
    violations.push(path.relative(ROOT, file) + ': JSON-LD must use safeJsonLd');
  }
  if (source.includes('__html: JSON.stringify(')) {
    violations.push(path.relative(ROOT, file) + ': raw JSON.stringify in HTML payload');
  }
}

if (violations.length > 0) {
  console.error('JSON-LD safety QA failed');
  for (const violation of violations) console.error('- ' + violation);
  process.exitCode = 1;
} else {
  console.log('JSON-LD safety QA passed: ' + files.length + ' source files inspected');
}
