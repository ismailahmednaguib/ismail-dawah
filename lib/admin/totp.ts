// أدوات TOTP متوافقة مع RFC 6238 بدون اعتماد خارجي.
// هذا الملف لا يقرأ البيئة ولا يتعامل مع قاعدة البيانات، ولذلك يمكن اختباره
// كوحدة نقية من دون تشغيل Next.js.

import { createHmac, timingSafeEqual } from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const PERIOD_SECONDS = 30;
const DIGITS = 6;

function decodeBase32(value: string): Buffer {
  const normalized = value.replace(/\s+/g, '').replace(/=+$/g, '').toUpperCase();
  let bits = '';

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) throw new Error('Invalid base32 secret');
    bits += index.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function encodeBase32(value: Uint8Array): string {
  let bits = '';
  for (const byte of value) bits += byte.toString(2).padStart(8, '0');

  let result = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    result += BASE32_ALPHABET[Number.parseInt(chunk, 2)];
  }
  return result;
}

export function generateTotpCode(secret: string, timestampMs = Date.now()): string {
  const key = decodeBase32(secret);
  const counter = Math.floor(timestampMs / 1000 / PERIOD_SECONDS);
  const message = Buffer.alloc(8);
  message.writeBigInt64BE(BigInt(counter));
  const digest = createHmac('sha1', key).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
}

export function verifyTotpCode(
  secret: string,
  code: string,
  timestampMs = Date.now()
): boolean {
  const normalized = code.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(normalized)) return false;

  const stepMs = PERIOD_SECONDS * 1000;
  for (const offset of [-1, 0, 1]) {
    const expected = generateTotpCode(secret, timestampMs + offset * stepMs);
    const actualBuffer = Buffer.from(normalized, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');
    if (timingSafeEqual(actualBuffer, expectedBuffer)) return true;
  }
  return false;
}

export const TOTP_PERIOD_SECONDS = PERIOD_SECONDS;
