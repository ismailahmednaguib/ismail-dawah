import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const STRICT = process.argv.includes('--strict');
const AS_JSON = process.argv.includes('--json');

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function listApks(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) listApks(absolute, out);
    else if (entry.name.toLowerCase().endsWith('.apk')) out.push(path.relative(ROOT, absolute));
  }
  return out;
}

const requiredFiles = [
  'android/settings.gradle',
  'android/build.gradle',
  'android/gradle.properties',
  'android/app/build.gradle',
  'android/app/src/main/AndroidManifest.xml',
];
const missingFiles = requiredFiles.filter((file) => !exists(file));
const apks = listApks(path.join(ROOT, 'android'));
const androidWrapper = exists('android/gradlew.bat') || exists('android/gradlew');
const rootWrapper = exists('gradlew.bat') && exists('gradle/wrapper/gradle-wrapper.jar') && exists('gradle/wrapper/gradle-wrapper.properties');
const wrapper = androidWrapper || rootWrapper;
const wrapperLocation = androidWrapper ? 'android' : rootWrapper ? 'root' : null;
const gitignore = exists('.gitignore') ? fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8') : '';
const gitignoreLines = gitignore.split(/\r?\n/).map((line) => line.trim());
const sourceIgnored = gitignoreLines.includes('android/');
const generatedProtected = ['android/app/build/', '*.apk', '*.aab', '*.keystore', '*.jks'].every((rule) => gitignoreLines.includes(rule));

const manualIssues = [];
if (!wrapper) manualIssues.push('Gradle wrapper غير موجود؛ يلزم توليده أو استخدام Android Studio/Gradle مثبت.');
if (!apks.length) manualIssues.push('لا يوجد APK مولّد؛ يلزم تنفيذ assembleRelease بعد ضبط أدوات البناء والتوقيع.');

const structuralIssues = [
  ...(missingFiles.length ? ['ملفات Android ناقصة: ' + missingFiles.join('، ')] : []),
  ...(sourceIgnored ? ['قاعدة android/ في .gitignore تمنع رفع مصدر التطبيق.'] : []),
  ...(!generatedProtected ? ['قواعد حماية مخرجات Android أو مفاتيح التوقيع ناقصة.'] : []),
];

const result = {
  strict: STRICT,
  files: { required: requiredFiles.length, missing: missingFiles },
  wrapper,
  wrapperLocation,
  apks,
  sourceIgnored,
  generatedProtected,
  manualIssues,
  structuralIssues,
  ready: Boolean(!missingFiles.length && !structuralIssues.length && wrapper && apks.length),
};

if (AS_JSON) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log('فحص جاهزية تطبيق Android');
  console.log('ملفات المشروع: ' + (missingFiles.length ? '✖ ناقصة' : '✔ موجودة'));
  console.log('مصدر Android قابل للرفع: ' + (sourceIgnored ? '✖ محجوب' : '✔ نعم'));
  console.log('حماية المخرجات والأسرار: ' + (generatedProtected ? '✔' : '✖'));
  console.log('Gradle wrapper: ' + (wrapper ? '✔ موجود' + (wrapperLocation === 'root' ? ' في جذر المستودع' : '') : '⚠ غير موجود'));
  console.log('APK: ' + (apks.length ? '✔ ' + apks.join('، ') : '⚠ غير مولّد'));
  for (const issue of [...structuralIssues, ...manualIssues]) console.log('⚠ ' + issue);
  if (!structuralIssues.length && !manualIssues.length) console.log('✅ Android جاهز وفق الفحص المحلي.');
  else console.log(STRICT ? '❌ الوضع الصارم لم ينجح.' : 'ℹ️ تقرير فقط — شغّل --strict لجعل النواقص مانعة.');
}

if (structuralIssues.length) process.exit(2);
if (STRICT && manualIssues.length) process.exit(1);
