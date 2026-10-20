// lib/password-reset-token.ts
// توليد رمز استعادة كلمة المرور وتجزيئه — خادمي فقط (node:crypto).
// لا يُستورد داخل Client Components.

import { createHash, randomBytes } from 'node:crypto';

/** تجزئة SHA-256 بصيغة hex. نخزّن التجزئة لا الرمز نفسه. */
export function hashPasswordResetToken(token: string): string {
  return createHash('sha256').update(String(token), 'utf8').digest('hex');
}

/** رمز عشوائي ٢٥٦ بتًا + تجزئته الجاهزة للتخزين. */
export function createPasswordResetToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashPasswordResetToken(token) };
}
