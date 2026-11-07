import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'CONTENT_EXPANSION_QUEUE.csv');
const text = await readFile(file, 'utf8');
const failures = [];

if (!text.endsWith('\n')) failures.push('queue CSV must end with a newline');

function parseCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }
  if (quoted) failures.push('unterminated quoted CSV field');
  cells.push(cell.trim());
  return cells;
}

const lines = text.split(/\r?\n/);
if (lines.at(-1) === '') lines.pop();
const expectedHeader = [
  'queue_kind', 'kind', 'slug', 'name_ar', 'current_total',
  'current_types', 'required_action', 'status', 'author_id', 'source_notes',
];
const header = parseCsvLine(lines.shift() ?? '');
if (header.join('|') !== expectedHeader.join('|')) {
  failures.push('CSV header does not match the queue schema');
}

const allowedKinds = new Set(['branch', 'field', 'subbranch', 'category']);
const allowedQueueKinds = new Set(['minimum-coverage', 'type-diversification']);
const allowedStatuses = new Set(['needs-editor', 'in-progress', 'ready-for-review', 'complete']);
const seen = new Set();
const counts = { 'minimum-coverage': 0, 'type-diversification': 0 };

for (const [index, line] of lines.entries()) {
  const rowNumber = index + 2;
  const cells = parseCsvLine(line);
  if (cells.length !== expectedHeader.length) {
    failures.push('row ' + rowNumber + ' has ' + cells.length + ' columns; expected ' + expectedHeader.length);
    continue;
  }
  const row = Object.fromEntries(expectedHeader.map((key, i) => [key, cells[i]]));
  const total = Number(row.current_total);
  const key = row.kind + ':' + row.slug;
  if (!allowedQueueKinds.has(row.queue_kind)) failures.push('row ' + rowNumber + ' has an unknown queue_kind');
  if (!allowedKinds.has(row.kind)) failures.push('row ' + rowNumber + ' has an unknown kind');
  if (!row.slug || !row.name_ar) failures.push('row ' + rowNumber + ' is missing slug or Arabic name');
  if (!Number.isInteger(total) || total < 0) failures.push('row ' + rowNumber + ' has an invalid current_total');
  if (!row.current_types) failures.push('row ' + rowNumber + ' is missing current_types');
  if (!allowedStatuses.has(row.status)) failures.push('row ' + rowNumber + ' has an unknown status');
  if (seen.has(key)) failures.push('duplicate concept: ' + key);
  seen.add(key);
  if (allowedQueueKinds.has(row.queue_kind)) counts[row.queue_kind] += 1;
  if (row.queue_kind === 'minimum-coverage') {
    if (total >= 3 || row.required_action !== 'add-reviewed-item') failures.push('row ' + rowNumber + ' is not a valid minimum-coverage item');
  }
  if (row.queue_kind === 'type-diversification') {
    if (total < 3 || row.required_action !== 'add-content-type') failures.push('row ' + rowNumber + ' is not a valid type-diversification item');
  }
}

if (counts['minimum-coverage'] !== 50) failures.push('expected 50 minimum-coverage rows, found ' + counts['minimum-coverage']);
if (counts['type-diversification'] !== 7) failures.push('expected 7 type-diversification rows, found ' + counts['type-diversification']);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('coverage queue QA passed: 57 rows (50 minimum-coverage, 7 type-diversification)');
}
