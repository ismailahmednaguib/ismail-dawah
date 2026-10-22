import test from 'node:test';
import assert from 'node:assert/strict';

import {
  hasWeeklyScheduleSetting,
  legacyScheduleToText,
  parseWeeklySchedule,
  parseWeeklyScheduleText,
} from '../lib/live-schedule.ts';

test('الجدول الأسبوعي: يحلّل السطر الرباعي ويشذّب الفراغات', () => {
  const entries = parseWeeklyScheduleText(
    '  السبت | بعد العشاء | تفسير جزء عم | مسجد الرحمن  ',
    'ar'
  );

  assert.deepEqual(entries, [
    {
      day: 'السبت',
      time: 'بعد العشاء',
      topic: 'تفسير جزء عم',
      place: 'مسجد الرحمن',
    },
  ]);
});

test('الجدول الأسبوعي: يتجاهل الفراغات والتعليقات ونقاط القوائم', () => {
  const entries = parseWeeklyScheduleText(
    ['# تعليق', '', '- الأحد | بعد المغرب | العقيدة | مسجد الرحمن', '* الاثنين | بعد العشاء | السيرة | مسجد الرحمن'].join('\n'),
    'ar'
  );

  assert.equal(entries.length, 2);
  assert.equal(entries[0].day, 'الأحد');
  assert.equal(entries[1].day, 'الاثنين');
});

test('الجدول الأسبوعي: يرفض السطر بلا موضوع', () => {
  assert.deepEqual(parseWeeklyScheduleText('السبت | بعد العشاء', 'ar'), []);
  assert.deepEqual(parseWeeklyScheduleText('السبت', 'ar'), []);
});

test('الجدول الأسبوعي: يقبل غياب الوقت والمكان ويعرضهما اختياريًا', () => {
  const [entry] = parseWeeklyScheduleText('الجمعة | | شرح القرآن', 'ar');

  assert.ok(entry);
  assert.equal(entry.day, 'الجمعة');
  assert.equal(entry.time, '');
  assert.equal(entry.topic, 'شرح القرآن');
  assert.equal(entry.place, '');
});

test('الجدول الأسبوعي: يخفي السطور العربية من الواجهة الإنجليزية', () => {
  const entries = parseWeeklyScheduleText(
    ['Saturday | After Isha | Tafsir | Ar-Rahman Mosque', 'الأحد | بعد المغرب | العقيدة | مسجد الرحمن'].join('\n'),
    'en'
  );

  assert.equal(entries.length, 1);
  assert.equal(entries[0].day, 'Saturday');
});

test('الجدول الأسبوعي: يقرأ القيمة المترجمة للغة الصحيحة فقط', () => {
  const value = {
    ar: 'السبت | بعد العشاء | تفسير جزء عم | مسجد الرحمن',
    en: 'Saturday | After Isha | Tafsir of Juz Amma | Ar-Rahman Mosque',
  };

  assert.equal(parseWeeklySchedule(value, 'ar')[0].day, 'السبت');
  assert.equal(parseWeeklySchedule(value, 'en')[0].day, 'Saturday');
});

test('الجدول الأسبوعي: لا يسرّب العربية عند غياب الترجمة الإنجليزية', () => {
  const value = { ar: 'السبت | بعد العشاء | تفسير جزء عم | مسجد الرحمن' };

  assert.deepEqual(parseWeeklySchedule(value, 'en'), []);
});

test('الجدول الأسبوعي: يميّز الإعداد المحفوظ الفارغ عن غير المحفوظ', () => {
  assert.equal(hasWeeklyScheduleSetting(undefined), false);
  assert.equal(hasWeeklyScheduleSetting([]), false);
  assert.equal(hasWeeklyScheduleSetting(''), false);
  assert.equal(hasWeeklyScheduleSetting('السبت | بعد العشاء | التفسير | المسجد'), true);
  assert.equal(hasWeeklyScheduleSetting({ ar: '', en: '' }), true);
  assert.equal(hasWeeklyScheduleSetting({ en: 'Saturday | After Isha | Tafsir | Mosque' }), true);
});

test('تحويل الجدول القديم: يدعم النصوص والكائنات المترجمة', () => {
  const legacy = [
    {
      day: 'السبت',
      time: 'بعد العشاء',
      topic: 'تفسير جزء عم',
      place: 'مسجد الرحمن',
    },
    {
      day: { ar: 'الأحد', en: 'Sunday' },
      time: { ar: 'بعد المغرب', en: 'After Maghrib' },
      topic: { ar: 'العقيدة', en: 'Creed' },
      place: { ar: 'مسجد الرحمن', en: 'Ar-Rahman Mosque' },
    },
  ];

  assert.equal(
    legacyScheduleToText(legacy, 'ar'),
    ['السبت | بعد العشاء | تفسير جزء عم | مسجد الرحمن', 'الأحد | بعد المغرب | العقيدة | مسجد الرحمن'].join('\n')
  );
  assert.equal(
    legacyScheduleToText(legacy, 'en'),
    ['Sunday | After Maghrib | Creed | Ar-Rahman Mosque'].join('\n')
  );
});

test('تحويل الجدول القديم: يقرأ النسخة الملفوفة { ar: [...] }', () => {
  const legacy = {
    ar: [
      {
        day: 'السبت',
        time: 'بعد العشاء',
        topic: 'تفسير جزء عم',
        place: 'مسجد الرحمن',
      },
    ],
  };

  assert.equal(
    legacyScheduleToText(legacy, 'ar'),
    'السبت | بعد العشاء | تفسير جزء عم | مسجد الرحمن'
  );
  assert.equal(legacyScheduleToText(legacy, 'en'), '');
});

test('تحويل الجدول القديم: يتجاهل العناصر بلا يوم أو موضوع', () => {
  assert.equal(
    legacyScheduleToText([{ day: 'السبت' }, { topic: 'بلا يوم' }, null], 'ar'),
    ''
  );
});
