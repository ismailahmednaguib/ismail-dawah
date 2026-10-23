// التحقق الثنائي للأدمن: تخزين سر مشفّر + TOTP + كوكي تحقق مؤقتة.
import 'server-only';

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, signSession, verifySignedSession } from '@/lib/auth';
import { encodeBase32, verifyTotpCode, TOTP_PERIOD_SECONDS } from '@/lib/admin/totp';

export const ADMIN_MFA_PENDING_COOKIE = 'admin_mfa_pending';
export const ADMIN_MFA_PENDING_MAX_AGE = 5 * 60;

type MfaRow = {
  admin_id: string;
  secret_ciphertext: string;
  enabled: boolean;
  enrolled_at: string | null;
  updated_at: string | null;
};

export type AdminMfaStatus = {
  available: boolean;
  configured: boolean;
  enabled: boolean;
};

function env(name: string): string {
  return process.env[name]?.trim() || '';
}

function adminSessionSecret(): string {
  return env('ADMIN_SESSION_SECRET') || env('APP_SESSION_SECRET') || env('JWT_SECRET') || env('SESSION_SECRET');
}

function encryptionKey(): Buffer {
  const source = env('ADMIN_MFA_ENCRYPTION_KEY') || adminSessionSecret();
  if (!source) throw new Error('Missing ADMIN_MFA_ENCRYPTION_KEY or admin session secret');
  return createHash('sha256').update(source, 'utf8').digest();
}

function encryptSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`;
}

function decryptSecret(value: string): string {
  const [version, ivRaw, tagRaw, ciphertextRaw] = value.split('.');
  if (version !== 'v1' || !ivRaw || !tagRaw || !ciphertextRaw) throw new Error('Invalid MFA secret format');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivRaw, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextRaw, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

function isMissingTable(error: unknown): boolean {
  const message = String((error as { message?: string })?.message || error || '');
  return /does not exist|schema cache|relation/i.test(message);
}

export async function loadAdminMfa(adminId: string): Promise<{
  status: AdminMfaStatus;
  secret: string | null;
  row: MfaRow | null;
}> {
  try {
    const { data, error } = await createAdminClient()
      .from('admin_mfa')
      .select('admin_id, secret_ciphertext, enabled, enrolled_at, updated_at')
      .eq('admin_id', String(adminId))
      .maybeSingle();

    if (error) {
      if (isMissingTable(error)) {
        return { status: { available: false, configured: false, enabled: false }, secret: null, row: null };
      }
      throw error;
    }

    const row = (data as MfaRow | null) ?? null;
    if (!row) return { status: { available: true, configured: false, enabled: false }, secret: null, row: null };

    let secret: string | null = null;
    try {
      secret = decryptSecret(row.secret_ciphertext);
    } catch (error) {
      // إعداد غير مفعّل يمكن استبداله من مركز الأمان، فلا نمنع تسجيل الدخول
      // بسببه. أما الإعداد المفعّل فيفشل مغلقًا حتى لا يُتجاوز MFA بصمت.
      if (row.enabled) throw error;
    }
    return {
      status: { available: true, configured: true, enabled: Boolean(row.enabled) },
      secret,
      row,
    };
  } catch (error) {
    if (isMissingTable(error)) {
      return { status: { available: false, configured: false, enabled: false }, secret: null, row: null };
    }
    throw error;
  }
}

export async function getAdminMfaStatus(adminId: string): Promise<AdminMfaStatus> {
  return (await loadAdminMfa(adminId)).status;
}

export async function beginAdminMfaEnrollment(adminId: string, email: string): Promise<{
  secret: string;
  otpauthUrl: string;
}> {
  const current = await loadAdminMfa(adminId);
  if (!current.status.available) throw new Error('MFA migration is not installed');
  if (current.status.enabled) throw new Error('MFA is already enabled');

  const secret = encodeBase32(randomBytes(20));
  const { error } = await createAdminClient().from('admin_mfa').upsert(
    {
      admin_id: String(adminId),
      secret_ciphertext: encryptSecret(secret),
      enabled: false,
      enrolled_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'admin_id' }
  );
  if (error) throw error;

  const label = `Discover Islam:${email}`;
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=Discover%20Islam&algorithm=SHA1&digits=6&period=${TOTP_PERIOD_SECONDS}`;
  return { secret, otpauthUrl };
}

export async function setAdminMfaEnabled(adminId: string, enabled: boolean): Promise<void> {
  const { error } = await createAdminClient()
    .from('admin_mfa')
    .update({ enabled, enrolled_at: enabled ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq('admin_id', String(adminId));
  if (error) throw error;
}

export function verifyAdminMfaCode(secret: string | null, code: string): boolean {
  return Boolean(secret && verifyTotpCode(secret, code));
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
    path: '/',
  };
}

export function setAdminMfaPendingCookie(
  response: NextResponse,
  userId: string,
  email: string
): void {
  const secret = adminSessionSecret();
  if (!secret) throw new Error('Missing admin session secret');
  const now = Math.floor(Date.now() / 1000);
  const token = signSession(
    {
      userId: String(userId),
      role: 'admin',
      email,
      mfa: 'pending',
      iat: now,
      exp: now + ADMIN_MFA_PENDING_MAX_AGE,
      jti: randomBytes(16).toString('hex'),
    },
    secret
  );
  response.cookies.set(ADMIN_MFA_PENDING_COOKIE, token, cookieOptions(ADMIN_MFA_PENDING_MAX_AGE));
}

export function clearAdminMfaPendingCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_MFA_PENDING_COOKIE, '', cookieOptions(0));
}

export function getAdminMfaPending(request: NextRequest): { userId: string; email: string } | null {
  const token = request.cookies.get(ADMIN_MFA_PENDING_COOKIE)?.value;
  const secret = adminSessionSecret();
  if (!token || !secret) return null;
  const payload = verifySignedSession(token, secret, ['admin']);
  if (payload?.mfa !== 'pending' || !payload.userId) return null;
  return { userId: payload.userId, email: typeof payload.email === 'string' ? payload.email : '' };
}
