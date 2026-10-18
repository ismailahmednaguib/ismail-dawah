import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_ASSISTANT_CONFIG, normalizeAssistantConfig } from '../lib/assistant-core.ts';

test('assistant is disabled and bounded by default', () => {
  const config = normalizeAssistantConfig(null);
  assert.deepEqual(config, DEFAULT_ASSISTANT_CONFIG);
});

test('assistant settings are sanitized and bounded', () => {
  const config = normalizeAssistantConfig({
    enabled: true,
    model: 'custom model<script>',
    maxSources: 99,
  });

  assert.equal(config.enabled, true);
  assert.equal(config.model, 'custommodelscript');
  assert.equal(config.maxSources, 8);
});
