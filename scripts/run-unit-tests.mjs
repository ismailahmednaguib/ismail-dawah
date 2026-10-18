import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';

// تحميل ملفات الاختبار داخل العملية نفسها يحافظ على عزل التنفيذ المنطقي
// للاختبارات، ويتجنب إنشاء عمليات فرعية لا تعمل في بعض بيئات Windows المقيدة.
const testDirectory = fileURLToPath(new URL('../tests/', import.meta.url));
const files = (await readdir(testDirectory))
  .filter((file) => file.endsWith('.test.ts'))
  .sort();

if (files.length === 0) {
  throw new Error('لم يتم العثور على ملفات اختبارات في tests/.');
}

for (const file of files) {
  await import(pathToFileURL(join(testDirectory, file)).href);
}
