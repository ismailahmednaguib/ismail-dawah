import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "ismail-dawah-secret-key-2025";

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
  } catch {
    return false;
  }
}

export function createSession(userId: number): string {
  const signature = crypto.createHmac("sha256", SECRET).update(String(userId)).digest("hex");
  return `${userId}.${signature}`;
}

export function verifySession(token: string): number | null {
  try {
    const [idStr, signature] = token.split(".");
    const userId = parseInt(idStr, 10);
    if (!userId) return null;
    const expected = crypto.createHmac("sha256", SECRET).update(idStr).digest("hex");
    if (signature !== expected) return null;
    return userId;
  } catch {
    return null;
  }
}

export function getSessionFromCookie(cookieHeader: string | null): number | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/session=([^;]+)/);
  if (!match) return null;
  return verifySession(match[1]);
}