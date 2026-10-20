// tests/supabase-errors.test.ts
// حراسة انحدار: خطأ NOT NULL لا يُصنَّف «جدول مفقود».
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getErrorMessage,
  isMissingTableError,
} from '../lib/supabase-errors.ts';

test('getErrorMessage يقرأ message', () => {
  assert.equal(getErrorMessage({ message: 'boom' }), 'boom');
  assert.equal(getErrorMessage('plain'), 'plain');
  assert.equal(getErrorMessage(null), '');
});

test('isMissingTableError: NOT NULL ليس جدولًا مفقودًا', () => {
  assert.equal(
    isMissingTableError({
      code: '23502',
      message:
        'null value in column "password_hash" of relation "users" violates not-null constraint',
    }),
    false
  );
});

test('isMissingTableError: 42P01 جدول مفقود', () => {
  assert.equal(isMissingTableError({ code: '42P01', message: 'relation "users" does not exist' }), true);
});

test('isMissingTableError: رسالة PostgREST', () => {
  assert.equal(
    isMissingTableError({
      message: 'Could not find the table public.users in the schema cache',
    }),
    true
  );
});
