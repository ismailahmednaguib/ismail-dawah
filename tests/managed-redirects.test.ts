import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeInternalPath,
  resolveManagedRedirect,
  validateManagedRedirects,
} from '../lib/managed-redirects.ts';

test('managed redirects accept internal paths and reject external destinations', () => {
  assert.equal(normalizeInternalPath('/ar/old%20article/'), '/ar/old%20article');
  assert.equal(normalizeInternalPath('https://example.com/new'), null);
  assert.equal(normalizeInternalPath('//example.com/new'), null);
});

test('managed redirects preserve a request query when destination has none', () => {
  const result = resolveManagedRedirect('/ar/old?utm_source=x', [
    { source: '/ar/old', destination: '/ar/new' },
  ]);
  assert.equal(result?.destination, '/ar/new?utm_source=x');
});

test('managed redirects reject duplicate sources and loops', () => {
  const result = validateManagedRedirects([
    { source: '/a', destination: '/b' },
    { source: '/a', destination: '/c' },
    { source: '/b', destination: '/a' },
  ]);
  assert.equal(result.redirects.length, 2);
  assert.ok(result.errors.some((error) => error.includes('مكرر')));
  assert.ok(result.errors.some((error) => error.includes('دائري')));
});
