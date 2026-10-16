// tests/content-safety.test.ts
// تنقية HTML: أي قدرة تنفيذية أو رابط خارجي يجب أن تُزال قبل العرض.
import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeRichTextHtml } from '../lib/content-safety.ts';

test('يُزيل وسوم السكربت ومحتواها', () => {
  const out = sanitizeRichTextHtml('<p>نصّ</p><script>alert(1)</script>');
  assert.ok(!out.includes('script'));
  assert.ok(!out.includes('alert'));
  assert.ok(out.includes('<p>نصّ</p>'));
});

test('يُزيل سمات الوسوم وروابطها', () => {
  const out = sanitizeRichTextHtml('<p onclick="x()" style="color:red">نصّ</p>');
  assert.equal(out, '<p>نصّ</p>');
});

test('يُبقي الوسوم المسموحة وحدها', () => {
  const out = sanitizeRichTextHtml('<h2>عنوان</h2><table><tr><td>خلية</td></tr></table>');
  assert.ok(out.includes('<h2>عنوان</h2>'));
  assert.ok(!out.includes('table'));
  assert.ok(!out.includes('td'));
});

test('يُزيل الإطارات والكائنات', () => {
  const out = sanitizeRichTextHtml(
    '<iframe src="https://evil.test"></iframe><object data="x"></object><hr>'
  );
  assert.ok(!out.includes('iframe'));
  assert.ok(!out.includes('object'));
  assert.ok(out.includes('<hr>'));
});

test('يُزيل التعليقات ويحدّ الطول', () => {
  const out = sanitizeRichTextHtml('<!-- سر --><p>نصّ</p>');
  assert.ok(!out.includes('سر'));
});

test('يعيد نصًّا فارغًا لغير النصوص', () => {
  assert.equal(sanitizeRichTextHtml(null), '');
  assert.equal(sanitizeRichTextHtml(42), '');
  assert.equal(sanitizeRichTextHtml(undefined), '');
});
