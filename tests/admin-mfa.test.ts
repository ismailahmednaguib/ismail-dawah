import assert from 'node:assert/strict';
import { generateTotpCode, verifyTotpCode } from '../lib/admin/totp.ts';

// RFC 6238 uses this Base32 test secret for the SHA-1 profile.
const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
const timestamp = 59_000;

assert.equal(generateTotpCode(secret, timestamp), '287082');
assert.equal(verifyTotpCode(secret, '287082', timestamp), true);
assert.equal(verifyTotpCode(secret, '287083', timestamp), false);
assert.equal(verifyTotpCode(secret, '287082', timestamp + 30_000), true);
assert.equal(verifyTotpCode(secret, '12', timestamp), false);

console.log('✓ admin MFA TOTP vectors');
